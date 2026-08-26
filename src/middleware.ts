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
    // Allow access to the private admin login page
    if (pathname === '/admin/login') {
      // If already logged in as admin, send directly to admin dashboard
      if (token && isAdminRole) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Require token and admin role for all other admin routes
    if (!token || !isAdminRole) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. SELLER PORTAL ROUTE PROTECTION
  if (pathname.startsWith('/seller')) {
    const publicSellerPaths = ['/seller', '/seller/login', '/seller/register', '/seller/forgot-password'];
    const isPublicSellerPath = publicSellerPaths.some(p => pathname === p || pathname.startsWith(`${p}/`));

    if (isPublicSellerPath) {
      // If already logged in as seller and visits seller/login or seller/register, redirect to /seller
      if (token && isSellerRole && (pathname === '/seller/login' || pathname === '/seller/register')) {
        return NextResponse.redirect(new URL('/seller', request.url));
      }
      return NextResponse.next();
    }

    // Require token and seller role for seller dashboard / subpages
    if (!token || (!isSellerRole && !isAdminRole)) {
      return NextResponse.redirect(new URL('/seller/login', request.url));
    }
  }

  // 3. CUSTOMER AUTH ROUTES (prevent loop if already logged in)
  if (pathname === '/login' || pathname === '/register') {
    // Let customer login or register normally
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
    /*
     * Match all request paths except for:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, images
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
