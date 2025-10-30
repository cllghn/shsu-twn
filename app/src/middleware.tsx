import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware will run on all routes
export function middleware(request: NextRequest) {
  // Check if user is authenticated
  const isAuthenticated = request.cookies.get('authenticated')?.value === 'true'
  
  // Allow access to login page and API route
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/api/auth') {
    return NextResponse.next()
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public images (*.jpg, *.png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.jpg|.*\\.png|.*\\.gif|.*\\.svg|.*\\.webp).*)',
  ],
}