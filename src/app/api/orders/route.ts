import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/utils/auth'

// GET /api/orders - List all orders (admin) or user's orders (client)
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let orders

    if (user.role === 'admin') {
      // Admin can see all orders with user and product details
      orders = await prisma.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              category: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Clients can only see their own orders
      orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              category: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order (client only)
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()

    if (!user || user.role !== 'client') {
      return NextResponse.json(
        { error: 'Only clients can create orders' },
        { status: 403 }
      )
    }

    const { productId, paymentMethod } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId,
        paymentMethod: paymentMethod || 'pending',
        status: 'pending'
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            category: true
          }
        }
      }
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
