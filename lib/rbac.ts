/**
 * lib/rbac.ts
 * ─────────────────────────────────────────────────────
 * Matriz de Control de Acceso Basado en Roles (RBAC).
 * Define qué roles pueden acceder a cada ruta del dashboard.
 *
 * Esta es la ÚNICA fuente de verdad para las reglas de acceso.
 * El middleware, el sidebar y los guards leen de aquí.
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

// ── Matriz de permisos por ruta del dashboard ─────────────
// Si una ruta no aparece aquí pero está bajo /dashboard → requiere autenticación
// y cualquier rol autenticado puede acceder (salvo GUEST).
// Para rutas más restrictivas, listarlas explícitamente.

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
    "/dashboard/posts": [
        UserRole.SUPER_ADMIN, UserRole.ADMIN,
        UserRole.CONTENT_MANAGER, UserRole.CLIENT_USER,
    ],
    "/dashboard/posts/create": [
        UserRole.SUPER_ADMIN, UserRole.ADMIN,
        UserRole.CONTENT_MANAGER, UserRole.CLIENT_USER,
    ],

    // ── Proyectos / Portafolio ────────────────────────────
    "/dashboard/projects": [
        UserRole.SUPER_ADMIN, UserRole.ADMIN,
        UserRole.CONTENT_MANAGER, UserRole.CLIENT_USER,
    ],

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
 * Dado un pathname y un rol, verifica si el rol tiene acceso.
 * Estrategia: busca la ruta más específica que haga match.
 */
export function canAccessRoute(pathname: string, role: UserRole | string, permissions: string[] = []): boolean {
    if (role === UserRole.SUPER_ADMIN) return true; // SuperAdmin accede a todo

    // Los custom roles (que no son del enum estándar) NO están en ROUTE_PERMISSIONS.
    // Su acceso se controla por el PERMISSION_ROUTE_MAP en DashboardSidebar.
    // Si tiene algún permiso asignado → puede navegar el dashboard (el sidebar
    // filtra qué secciones ve). Si no tiene permisos → bloquear.
    const isStandardRole = Object.values(UserRole).includes(role as UserRole);
    if (!isStandardRole) {
        // Custom role: solo bloqueamos /dashboard si es GUEST o no tiene permisos
        if (pathname.startsWith("/dashboard")) {
            return permissions.length > 0;
        }
        return true;
    }

    // Buscar match exacto primero
    if (ROUTE_PERMISSIONS[pathname]) {
        return ROUTE_PERMISSIONS[pathname].includes(role as UserRole);
    }

    // Buscar el prefijo más largo que haga match
    const matchingPrefixes = Object.keys(ROUTE_PERMISSIONS)
        .filter((route) => pathname.startsWith(route))
        .sort((a, b) => b.length - a.length); // más específico primero

    if (matchingPrefixes.length > 0) {
        return ROUTE_PERMISSIONS[matchingPrefixes[0]].includes(role as UserRole);
    }

    // Si la ruta empieza con /dashboard y no está en la matriz,
    // se requiere autenticación pero cualquier rol autenticado pasa.
    if (pathname.startsWith("/dashboard")) {
        return role !== UserRole.GUEST;
    }

    return true; // ruta desconocida → pass
}

/**
 * Devuelve la lista de rutas del dashboard accesibles por un rol.
 * Usada por el sidebar para filtrar la navegación.
 */
export function getAccessibleRoutes(role: UserRole): string[] {
    if (role === UserRole.SUPER_ADMIN) return Object.keys(ROUTE_PERMISSIONS);
    return Object.entries(ROUTE_PERMISSIONS)
        .filter(([, roles]) => roles.includes(role))
        .map(([route]) => route);
}
