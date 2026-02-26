/**
 * proxy.ts — Auth + i18n + RBAC Edge Proxy (Next.js 16+)
 * ──────────────────────────────────────────────────────────
 * Combina next-intl (detección de locale) y NextAuth (RBAC).
 *
 * Flujo:
 *  1. next-intl detecta el idioma y redirige a /es o /en
 *  2. NextAuth valida autenticación y rol en rutas protegidas
 *  3. Ruta pública → pass through
 *  4. Sin token → redirect /auth/login
 *  5. Token con rol insuficiente → redirect /dashboard/unauthorized
 */
import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// ── i18n middleware ──────────────────────────────────────────────────────────
const intlMiddleware = createIntlMiddleware(routing);

// ── Auth middleware ──────────────────────────────────────────────────────────
const { auth } = NextAuth(authConfig);

// ── Combined handler ─────────────────────────────────────────────────────────
export default auth(function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Skip i18n for API routes, auth routes, and static files
    const isApiOrAuth = pathname.startsWith("/api") ||
        pathname.startsWith("/auth") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/_next");

    if (isApiOrAuth) {
        return NextResponse.next();
    }

    // Apply i18n routing for marketing pages
    return intlMiddleware(req);
});

export const config = {
    matcher: [
        // Aplica a todas las rutas excepto archivos estáticos e imágenes
        "/((?!_next/static|_next/image|favicon.ico|logo.png|images/|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|txt|xml|json)$).*)",
    ],
};
