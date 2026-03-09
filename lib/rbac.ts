/**
 * lib/rbac.ts
 * ─────────────────────────────────────────────────────
 * Matriz de Control de Acceso Basado en Roles (RBAC).
 * Define qué roles estándar pueden acceder a cada ruta del dashboard.
 *
 * Esta es la ÚNICA fuente de verdad para los roles ESTÁNDAR.
 * El middleware, el sidebar y los guards leen de aquí.
 *
 * Para roles CUSTOM → los permisos se guardan en la tabla `role_configs`
 * de la BD y se embeben en el JWT al hacer login.
 * Ver: lib/role-config.ts para la lógica de BD.
 */
import { UserRole } from "@/types/auth";

// ── Rutas que nunca requieren autenticación ───────────────
export const PUBLIC_ROUTES = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/recuperar",
    "/auth/nueva-contrasena",
    "/blog",
    "/contacto",
    "/nosotros",
    "/servicios",
    "/portfolio",
    "/soluciones",
    "/politica-privacidad",
    "/politica-cookies",
    "/terms",
    "/flyering",
    "/vip",
    "/data-deletion",
    "/sitemap.xml",
    "/robots.txt",
    "/rss",
];

// Prefijos de rutas que siempre son públicas
export const PUBLIC_PREFIXES = [
    "/blog/",
    "/portfolio/",
    "/soluciones/",
    "/api/leads/",
    "/api/analytics/",
    "/api/integrations/",
    "/api/webhooks/",
];

// ── Roles estándar del sistema ────────────────────────────
export const STANDARD_ROLES = Object.values(UserRole);

// ── Matriz de permisos para roles ESTÁNDAR ─────────────────
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
    // ── Acceso universal autenticado ──────────────────────
    "/dashboard": [
        UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CONTENT_MANAGER,
        UserRole.CLIENT_ADMIN, UserRole.CLIENT_USER,
    ],

    // ── Administración de usuarios y roles ────────────────
    "/dashboard/users": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    "/dashboard/security": [UserRole.SUPER_ADMIN],
    "/dashboard/settings": [UserRole.SUPER_ADMIN, UserRole.ADMIN],

    // ── Equipo / Expertos ─────────────────────────────────
    "/dashboard/experts": [UserRole.SUPER_ADMIN, UserRole.ADMIN],

    // ── Analítica ─────────────────────────────────────────
    "/dashboard/analytics": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CONTENT_MANAGER],

    // ── Contenido / Blog ──────────────────────────────────
    "/dashboard/posts": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CONTENT_MANAGER, UserRole.CLIENT_USER],
    "/dashboard/posts/create": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CONTENT_MANAGER, UserRole.CLIENT_USER],

    // ── Proyectos / Portafolio ────────────────────────────
    "/dashboard/projects": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CONTENT_MANAGER, UserRole.CLIENT_USER],

    // ── Inbox Omnicanal ───────────────────────────────────
    "/dashboard/inbox": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLIENT_ADMIN],

    // ── Marketing Hub ─────────────────────────────────────
    "/dashboard/marketing": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CONTENT_MANAGER],
    "/dashboard/marketing/campaigns": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CONTENT_MANAGER],
    "/dashboard/marketing/spend": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    "/dashboard/marketing/links": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CONTENT_MANAGER],
    "/dashboard/marketing/automation": [UserRole.SUPER_ADMIN, UserRole.ADMIN],

    // ── Admin / Arquitectura ──────────────────────────────
    "/dashboard/admin/architecture": [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    "/dashboard/admin/automation": [UserRole.SUPER_ADMIN, UserRole.ADMIN],

    // ── CRM / Ventas ──────────────────────────────────────
    "/dashboard/admin/crm": [UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN],
    "/dashboard/admin/crm/leads": [UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN],
    "/dashboard/admin/crm/pipeline": [UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN],
    "/dashboard/admin/crm/campaigns": [UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN, UserRole.CONTENT_MANAGER],

    // ── Calendario / Eventos ──────────────────────────────
    "/dashboard/events": [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CLIENT_ADMIN],
};

// ── Helpers ───────────────────────────────────────────────

/**
 * Verifica si una ruta es pública (no requiere autenticación).
 */
export function isPublicRoute(pathname: string): boolean {
    if (PUBLIC_ROUTES.includes(pathname)) return true;
    return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Verifica si un rol es estándar del sistema.
 */
export function isStandardRole(role: string): boolean {
    return STANDARD_ROLES.includes(role as UserRole);
}

/**
 * Verifica si un rol CUSTOM puede acceder a una ruta.
 * allowedRoutes viene del JWT (leído de la BD al hacer login).
 *
 * REGLA: exact match O prefix match con '/' separador,
 *        EXCEPTO /dashboard que solo es exact match.
 */
export function canCustomRoleAccess(allowedRoutes: string[], pathname: string): boolean {
    for (const allowed of allowedRoutes) {
        if (pathname === allowed) return true;
        // CRÍTICO: /dashboard no hace prefix match (sería prefix de TODAS las rutas)
        if (allowed !== '/dashboard' && pathname.startsWith(allowed + '/')) return true;
    }
    return false;
}

/**
 * Dado un pathname y un rol, verifica si tiene acceso.
 *
 * @param pathname   - La ruta a verificar
 * @param role       - El rol del usuario (estándar o custom)
 * @param allowedRoutes - Para roles custom: las rutas permitidas del JWT/BD
 */
export function canAccessRoute(
    pathname: string,
    role: UserRole | string,
    allowedRoutes: string[] = []
): boolean {
    // SuperAdmin accede a todo
    if (role === UserRole.SUPER_ADMIN || role === 'super_admin') return true;

    // GUEST siempre bloqueado
    if (role === UserRole.GUEST || role === 'guest') return false;

    // ── Roles CUSTOM → usar allowedRoutes del JWT ─────────
    if (!isStandardRole(role)) {
        if (allowedRoutes.length === 0) return false; // sin configuración → acceso denegado
        return canCustomRoleAccess(allowedRoutes, pathname);
    }

    // ── Roles ESTÁNDAR → usar ROUTE_PERMISSIONS ───────────
    // Buscar match exacto primero
    if (ROUTE_PERMISSIONS[pathname]) {
        return ROUTE_PERMISSIONS[pathname].includes(role as UserRole);
    }

    // Buscar el prefijo más específico
    const matchingPrefixes = Object.keys(ROUTE_PERMISSIONS)
        .filter((route) => route !== '/dashboard' && pathname.startsWith(route + '/'))
        .sort((a, b) => b.length - a.length);

    if (matchingPrefixes.length > 0) {
        return ROUTE_PERMISSIONS[matchingPrefixes[0]].includes(role as UserRole);
    }

    // Ruta bajo /dashboard no listada → cualquier rol autenticado
    if (pathname.startsWith("/dashboard")) {
        return role !== UserRole.GUEST;
    }

    return true;
}

/**
 * Devuelve la lista de rutas accesibles por un rol estándar.
 * Para roles custom usar allowedRoutes del JWT directamente.
 */
export function getAccessibleRoutes(role: UserRole): string[] {
    if (role === UserRole.SUPER_ADMIN) return Object.keys(ROUTE_PERMISSIONS);
    return Object.entries(ROUTE_PERMISSIONS)
        .filter(([, roles]) => roles.includes(role))
        .map(([route]) => route);
}
