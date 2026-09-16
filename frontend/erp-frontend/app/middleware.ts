import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ✅ Récupérer le token depuis les cookies
  const token = request.cookies.get("auth_token")?.value;

  // Pages publiques
  const publicPages = ["/auth/login", "/login"];
  const isPublicPage = publicPages.some(page => pathname === page || pathname.startsWith(page));

  console.log('🔍 Middleware - pathname:', pathname);
  console.log('🔍 Middleware - token:', token ? 'Présent' : 'Absent');

  // ✅ Si pas de token et page protégée → rediriger vers login
  if (!token && !isPublicPage && pathname !== "/" && !pathname.startsWith("/_next")) {
    console.log('🔴 Middleware - Pas de token, redirection vers /auth/login');
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // ✅ Si token et page login → rediriger vers dashboard
  if (token && isPublicPage) {
    console.log('✅ Middleware - Token présent, redirection vers /dashboard');
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};