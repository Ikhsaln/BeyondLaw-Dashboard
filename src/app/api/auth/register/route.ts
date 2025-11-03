import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, setAuthCookie, getUserFromToken } from '@/utils/auth'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user is authenticated and is admin (for admin user creation)
    let isAdminRequest = false
    try {
      const currentUser = await getUserFromToken()
      if (currentUser && currentUser.role === 'admin') {
        isAdminRequest = true
      }
    } catch {
      // Not authenticated, treat as regular registration
    }

    // If role is specified and user is not admin, reject
    if (role && role !== 'client' && !isAdminRequest) {
      return NextResponse.json(
        { error: 'Only admins can create users with specific roles' },
        { status: 403 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'client' // Use provided role or default to client
      }
    })

    // If this is an admin creating a user, don't set auth cookie
    // Just return the user data
    if (isAdminRequest) {
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        message: 'User created successfully'
      })
    }

    // For regular registration, set auth cookie and return user
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    await setAuthCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
