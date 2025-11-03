import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/utils/auth'

interface RouteParams {
  params: { id: string }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check if user is authenticated and is admin
    const currentUser = await getUserFromToken()

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can change user roles.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const { role } = await request.json()

    if (!role || !['admin', 'client'].includes(role)) {
      return NextResponse.json(
        { error: 'Valid role (admin or client) is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from demoting themselves
    if (currentUser.id === id && role !== 'admin') {
      return NextResponse.json(
        { error: 'You cannot change your own admin role' },
        { status: 400 }
      )
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json({
      user: updatedUser,
      message: 'User role updated successfully'
    })
  } catch (error) {
    console.error('Update user role error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
