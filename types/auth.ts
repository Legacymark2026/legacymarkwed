export enum UserRole {
    SUPER_ADMIN = 'super_admin',     // Acceso completo al sistema
    ADMIN = 'admin',                 // Administración general
    CONTENT_MANAGER = 'content_manager', // Gestión de contenido
    CLIENT_ADMIN = 'client_admin',   // Administrador de empresa cliente
    CLIENT_USER = 'client_user',     // Usuario básico de empresa cliente
    GUEST = 'guest'                  // Usuario no autenticado
}

export enum Permission {
    // Administración
    MANAGE_USERS = 'manage_users',
    MANAGE_ROLES = 'manage_roles',
    VIEW_ANALYTICS = 'view_analytics',

    // Contenido
    CREATE_CONTENT = 'create_content',
    EDIT_CONTENT = 'edit_content',
    DELETE_CONTENT = 'delete_content',
    PUBLISH_CONTENT = 'publish_content',

    // Clientes
    VIEW_CLIENT_DASHBOARD = 'view_client_dashboard',
    UPLOAD_ASSETS = 'upload_assets',
    VIEW_REPORTS = 'view_reports',
    MANAGE_TEAM = 'manage_team'
}
