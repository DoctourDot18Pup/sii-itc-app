import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/calificaciones',
  '/kardex',
  '/horarios',
  '/calendario',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasHint = request.cookies.get('sii_auth_hint')?.value === '1'

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  if (!hasHint && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasHint && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/calificaciones/:path*',
    '/kardex/:path*',
    '/horarios/:path*',
    '/calendario/:path*',
    '/login',
  ],
}
