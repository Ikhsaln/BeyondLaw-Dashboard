import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './utils/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // API routes that don't require authentication
  const publicApiRoutes = ['/api/auth/login', '/api/auth/register']
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next()
  }

  // Check for token in cookies
  const token = request.cookies.get('token')?.value

  if (!token) {
    // Redirect to login if no token
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token
  const user = verifyToken(token)

  if (!user) {
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based access
  if (pathname.startsWith('/admin') && user.role !== 'admin') {
    // Clients can't access admin routes
    const clientUrl = new URL('/client/dashboard', request.url)
    return NextResponse.redirect(clientUrl)
  }

  if (pathname.startsWith('/client') && user.role !== 'client') {
    // Admins should access admin routes
    const adminUrl = new URL('/admin', request.url)
    return NextResponse.redirect(adminUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
