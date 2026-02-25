/**
 * proxy.ts — Auth + RBAC Edge Proxy (Next.js 16+)
 * ─────────────────────────────────────────────────
 * Reemplaza middleware.ts. La lógica de autorización por rol
 * vive en el callback `authorized` de auth.config.ts, que usa
 * la misma matriz de rbac.ts.
 *
 * Flujo:
 *  1. Ruta pública → pass through
 *  2. Sin token → redirect /auth/login
 *  3. Token con rol insuficiente → redirect /dashboard/unauthorized
 *  4. Todo OK → pass through
 */
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
    // Aplica el proxy a todas las rutas excepto archivos estáticos e imágenes
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|logo.png|images/|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
