import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract user role and token from cookies
  const token = request.cookies.get('zibonbaba_token')?.value || null;
  let role = request.cookies.get('zibonbaba_role')?.value || null;

  if (!role) {
    const userCookie = request.cookies.get('zibonbaba_user')?.value;
    if (userCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userCookie));
        role = parsed.role || null;
      } catch (_) {}
    }
  }

  const normalizedRole = role ? role.trim().toUpperCase() : null;
  const isAdminRole = normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN';
  const isSellerRole = normalizedRole === 'VENDOR_ADMIN' || normalizedRole === 'VENDOR_STAFF' || normalizedRole === 'SELLER' || normalizedRole === 'VENDOR';

  // 1. ADMIN PORTAL ROUTE PROTECTION
  if (pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) {
    if (pathname === '/admin/login') {
      if (token && isAdminRole) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    if (!token || !isAdminRole) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. SELLER PORTAL ROUTE PROTECTION
  if (pathname.startsWith('/seller')) {
    const publicSellerPaths = ['/seller/login', '/seller/register', '/seller/forgot-password'];
    const isPublicSellerPath = publicSellerPaths.some(p => pathname === p || pathname.startsWith(`${p}/`));

    if (isPublicSellerPath) {
      if (token && isSellerRole && (pathname === '/seller/login' || pathname === '/seller/register')) {
        return NextResponse.redirect(new URL('/seller', request.url));
      }
      return NextResponse.next();
    }

    if (!token || (!isSellerRole && !isAdminRole)) {
      return NextResponse.redirect(new URL('/seller/login', request.url));
    }
  }

  // 3. CUSTOMER AUTH ROUTES
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next();
  }

  // 4. CUSTOMER ACCOUNT AREA PROTECTION
  if (pathname.startsWith('/account')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
