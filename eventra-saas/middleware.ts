import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Temporary: Bypass all middleware for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Temporary: Bypass all middleware for root and static files
  if (request.nextUrl.pathname === '/' || 
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.includes('.')) {
    return NextResponse.next()
  }
  
  // Basic locale detection - force English for now
  const locale = 'en' // Force English temporarily
  const response = NextResponse.next()
  
  return response
}


export const config = {
  matcher: [
    // Skip all paths that should not be internationalized
    '/((?!api|_next|.*\\..*).*)'  
  ]
}
