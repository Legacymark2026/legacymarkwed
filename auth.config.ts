import type { NextAuthConfig } from "next-auth";
import type { UserRole } from '@/types/auth';
import { canAccessRoute, isPublicRoute } from "@/lib/rbac";
import { NextResponse } from "next/server";

/**
 * Auth configuration for NextAuth.js
 * El callback `authorized` actúa como segunda capa de RBAC (después del middleware).
 * RBAC rules:
 *   - Rutas públicas → always OK
 *   - No autenticado → redirige a login
 *   - GUEST (usuario nuevo sin rol asignado) → redirige a /auth/pending-approval
 *   - Cualquier otro rol → verifica canAccessRoute() contra rbac.ts
 */
export const authConfig: NextAuthConfig = {
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
        verifyRequest: "/auth/verify-request",
        newUser: "/auth/register",
    },
    callbacks: {
        async signIn() {
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user.role as UserRole) || 'guest';
                token.companyId = user.companyId;
                token.permissions = user.permissions;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                if (token.role) {
                    session.user.role = token.role as UserRole;
                }
                if (token.companyId) {
                    session.user.companyId = token.companyId as string;
                }
                session.user.permissions = token.permissions as import("@/types/auth").Permission[] | undefined;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;

            // Rutas públicas → siempre OK
            if (isPublicRoute(pathname)) return true;

            // Página de espera → accesible si está logueado (GUEST puede verla)
            if (pathname.startsWith('/auth/pending-approval')) return isLoggedIn;

            // No autenticado → redirect a login
            if (!isLoggedIn) return false;

            // ── Usuario eliminado ─────────────────────────────────────────
            // El JWT callback marca el token con isDeleted=true cuando el
            // usuario ya no existe en la base de datos (fue eliminado).
            // Redirigimos al login con ?deleted=1 para que la cookie se limpie.
            const isDeleted = (auth?.user as any)?.isDeleted;
            if (isDeleted) {
                const loginUrl = new URL('/auth/login?deleted=1', nextUrl.origin);
                return NextResponse.redirect(loginUrl);
            }

            // Protección de rutas del dashboard
            if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
                const role = (auth?.user?.role as UserRole) || 'guest';

                // GUEST → redirige a pending-approval (NO al login, para UX clara)
                if (role === 'guest') {
                    const pendingUrl = new URL('/auth/pending-approval', nextUrl.origin);
                    return NextResponse.redirect(pendingUrl);
                }

                return canAccessRoute(pathname, role);
            }

            return true;
        },
    },
    providers: [], // Providers are configured in lib/auth.ts
} satisfies NextAuthConfig;
