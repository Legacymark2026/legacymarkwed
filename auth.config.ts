import type { NextAuthConfig } from "next-auth";
import type { UserRole } from '@/types/auth';
import { canAccessRoute, isPublicRoute } from "@/lib/rbac";

/**
 * Auth configuration for NextAuth.js
 * El callback `authorized` actúa como segunda capa de RBAC (después del middleware),
 * ambas usan la misma matriz de rbac.ts para consistencia.
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

            // No autenticado → redirect a login
            if (!isLoggedIn) return false;

            // Verificar rol para rutas de dashboard/admin
            if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
                const role = (auth?.user?.role as UserRole) || 'guest';
                return canAccessRoute(pathname, role);
            }

            return true;
        },
    },
    providers: [], // Providers are configured in lib/auth.ts
} satisfies NextAuthConfig;
