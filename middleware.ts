/**
 * middleware.ts — Edge Middleware con RBAC
 * ─────────────────────────────────────────────────────
 * Corre en el Edge Runtime de Next.js ANTES de renderizar cualquier página.
 * Primera capa de protección: sin acceso a BD, solo verifica el JWT.
 *
 * Flujo:
 *  1. Ruta pública → pass through
 *  2. Sin token → redirect /auth/login
 *  3. Token con rol insuficiente → redirect /dashboard/unauthorized
 *  4. Token válido + rol permitido → pass through
 */
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isPublicRoute, canAccessRoute } from "@/lib/rbac";
import { UserRole } from "@/types/auth";
import type { NextRequest } from "next/server";

export default auth((req) => {
    const { nextUrl, auth: session } = req as NextRequest & { auth: typeof req.auth };
    const pathname = nextUrl.pathname;

    // ── 1. Rutas públicas → siempre permitidas ─────────────
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // ── 2. Sin sesión → login ──────────────────────────────
    if (!session?.user) {
        const loginUrl = new URL("/auth/login", nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── 3. Ruta de dashboard con verificación de rol ───────
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
        const role = (session.user.role as UserRole) || UserRole.GUEST;

        if (!canAccessRoute(pathname, role)) {
            // Redirigir a página de acceso denegado (no 404, no login)
            const forbiddenUrl = new URL("/dashboard/unauthorized", nextUrl.origin);
            forbiddenUrl.searchParams.set("from", pathname);
            return NextResponse.redirect(forbiddenUrl);
        }
    }

    // ── 4. Todo correcto → pass through ───────────────────
    return NextResponse.next();
});

export const config = {
    // Aplica el middleware a todas las rutas excepto:
    // - _next/static (archivos estáticos de Next.js)
    // - _next/image (optimización de imágenes)
    // - favicon.ico, imágenes públicas
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|logo.png|images/|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
