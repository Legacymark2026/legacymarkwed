/**
 * lib/rbac.ts
 * ─────────────────────────────────────────────────────
 * Matriz de Control de Acceso Basado en Roles (RBAC).
 * Define qué roles pueden acceder a cada ruta del dashboard.
 *
 * Esta es la ÚNICA fuente de verdad para las reglas de acceso.
 * El middleware, el sidebar y los guards leen de aquí.
 *
 * Soporta dos tipos de roles:
 *   1. Roles estándar (UserRole enum)
 *   2. Roles custom (string libre) definidos en CUSTOM_ROLE_PERMISSIONS
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

// ── Matriz de permisos para roles ESTÁNDAR ─────────────────
// Si una ruta no aparece aquí pero está bajo /dashboard → requiere autenticación
// y cualquier rol autenticado puede acceder (salvo GUEST).

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

// ── Matriz de permisos para roles CUSTOM ──────────────────
// Añade aquí cualquier rol personalizado con las rutas que puede acceder.
// La clave es el nombre del rol (en minúsculas, como se guarda en DB).
// El valor es el array de rutas accesibles.
//
// Para añadir un nuevo rol custom:
//   "nombre_rol": ["/dashboard", "/dashboard/ruta1", "/dashboard/ruta2"]
//
export const CUSTOM_ROLE_PERMISSIONS: Record<string, string[]> = {
    // ── Gerente: acceso a Dashboard, Analytics, Inbox, CRM, Marketing ──
    "gerente": [
        "/dashboard",
        "/dashboard/analytics",
        "/dashboard/inbox",
        "/dashboard/marketing",
        "/dashboard/marketing/campaigns",
        "/dashboard/marketing/links",
        "/dashboard/admin/crm",
        "/dashboard/admin/crm/leads",
        "/dashboard/admin/crm/pipeline",
        "/dashboard/admin/crm/campaigns",
    ],

    // ── Viewer: acceso de solo lectura a Dashboard, Posts y Proyectos ──
    "viewer": [
        "/dashboard",
        "/dashboard/posts",
        "/dashboard/projects",
    ],

    // ── Plantilla para agregar nuevos roles ──
    // "nombre_rol": [
    //     "/dashboard",
    //     "/dashboard/ruta1",
    // ],
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
 * Soporta roles estándar (ROUTE_PERMISSIONS) y custom (CUSTOM_ROLE_PERMISSIONS).
 */
export function canAccessRoute(pathname: string, role: UserRole | string, permissions: string[] = []): boolean {
    // SuperAdmin accede a todo sin restricción
    if (role === UserRole.SUPER_ADMIN) return true;

    // ── Verificar roles CUSTOM primero ──────────────────────
    const roleLower = role.toString().toLowerCase();
    if (CUSTOM_ROLE_PERMISSIONS[roleLower]) {
        const allowedRoutes = CUSTOM_ROLE_PERMISSIONS[roleLower];

        for (const allowed of allowedRoutes) {
            // Exact match siempre funciona
            if (pathname === allowed) return true;
            // Prefix match SOLO para rutas con sub-paths reales
            // EXCLUIR /dashboard del prefix match porque /dashboard/ es prefijo
            // de ABSOLUTAMENTE TODAS las rutas del dashboard
            if (allowed !== '/dashboard' && pathname.startsWith(allowed + '/')) return true;
        }
        return false;
    }

    // ── Verificar roles ESTÁNDAR ──────────────────────────
    const isStandardRole = Object.values(UserRole).includes(role as UserRole);

    if (!isStandardRole) {
        // Rol desconocido sin permisos configurados → bloqueado
        return false;
    }

    // GUEST siempre bloqueado
    if (role === UserRole.GUEST) return false;

    // Buscar match exacto
    if (ROUTE_PERMISSIONS[pathname]) {
        return ROUTE_PERMISSIONS[pathname].includes(role as UserRole);
    }

    // Buscar el prefijo más largo que haga match
    const matchingPrefixes = Object.keys(ROUTE_PERMISSIONS)
        .filter((route) => pathname.startsWith(route + '/') || pathname === route)
        .sort((a, b) => b.length - a.length);

    if (matchingPrefixes.length > 0) {
        return ROUTE_PERMISSIONS[matchingPrefixes[0]].includes(role as UserRole);
    }

    // Ruta bajo /dashboard no listada → cualquier rol autenticado (salvo GUEST)
    if (pathname.startsWith("/dashboard")) {
        return role !== UserRole.GUEST;
    }

    return true;
}

/**
 * Devuelve la lista de rutas del dashboard accesibles por un rol.
 * Usada por el sidebar para filtrar la navegación.
 */
export function getAccessibleRoutes(role: UserRole | string): string[] {
    if (role === UserRole.SUPER_ADMIN) return Object.keys(ROUTE_PERMISSIONS);

    // Roles custom
    const roleLower = role.toString().toLowerCase();
    if (CUSTOM_ROLE_PERMISSIONS[roleLower]) {
        return CUSTOM_ROLE_PERMISSIONS[roleLower];
    }

    // Roles estándar
    return Object.entries(ROUTE_PERMISSIONS)
        .filter(([, roles]) => roles.includes(role as UserRole))
        .map(([route]) => route);
}
