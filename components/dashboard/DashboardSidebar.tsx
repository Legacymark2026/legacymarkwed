import Link from "next/link";
import {
    LayoutDashboard, Users, Settings, FileText, LogOut,
    Shield, BookOpen, Briefcase, BarChart2, Workflow,
    MessageSquare, Target, TrendingUp, Link2, Building2,
    Lock, UserCog, DollarSign, CheckSquare, Zap, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import Image from "next/image";
import { canAccessRoute } from "@/lib/rbac";
import { UserRole } from "@/types/auth";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface NavGroup {
    title: string;
    accent?: string; // clase de color para el título del grupo
    items: NavItem[];
}

// ── Definición completa del menú ────────────────────────────
const NAV_GROUPS: NavGroup[] = [
    {
        title: "Main",
        items: [
            { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
            { href: "/dashboard/inbox", label: "Inbox (Omnichannel)", icon: <MessageSquare size={18} /> },
        ],
    },
    {
        title: "Management",
        items: [
            { href: "/dashboard/users", label: "Usuarios", icon: <Users size={18} /> },
            { href: "/dashboard/experts", label: "Equipo (Expertos)", icon: <UserCog size={18} /> },
            { href: "/dashboard/security", label: "Seguridad", icon: <Shield size={18} /> },
            { href: "/dashboard/settings", label: "Configuración", icon: <Settings size={18} /> },
        ],
    },
    {
        title: "Content & Assets",
        items: [
            { href: "/dashboard/posts", label: "Blog", icon: <BookOpen size={18} /> },
            { href: "/dashboard/projects", label: "Portafolio", icon: <Briefcase size={18} /> },
            { href: "/dashboard/analytics", label: "Analítica", icon: <BarChart2 size={18} /> },
        ],
    },
    {
        title: "Marketing Hub",
        accent: "text-teal-600",
        items: [
            { href: "/dashboard/marketing", label: "CMO Dashboard", icon: <BarChart2 size={18} className="text-indigo-500" /> },
            { href: "/dashboard/marketing/spend", label: "Ad Spend (ROI)", icon: <DollarSign size={18} className="text-green-500" /> },
            { href: "/dashboard/marketing/links", label: "Link Tracker", icon: <Link2 size={18} className="text-blue-500" /> },
            { href: "/dashboard/marketing/campaigns", label: "Campañas", icon: <Target size={18} className="text-pink-500" /> },
            { href: "/dashboard/admin/architecture", label: "Organización", icon: <Building2 size={18} className="text-slate-400" /> },
            { href: "/dashboard/admin/automation", label: "Automatización", icon: <Workflow size={18} className="text-purple-500" /> },
        ],
    },
    {
        title: "Ventas (CRM)",
        accent: "text-amber-600",
        items: [
            { href: "/dashboard/admin/crm", label: "CRM Overview", icon: <TrendingUp size={18} className="text-amber-500" /> },
            { href: "/dashboard/admin/crm/leads", label: "Leads", icon: <Users size={18} className="text-amber-500" /> },
            { href: "/dashboard/admin/crm/pipeline", label: "Pipeline", icon: <Briefcase size={18} className="text-amber-500" /> },
            { href: "/dashboard/admin/crm/tasks", label: "Tareas", icon: <CheckSquare size={18} className="text-sky-500" /> },
            { href: "/dashboard/admin/crm/reports", label: "Reportes CRM", icon: <BarChart2 size={18} className="text-violet-500" /> },
            { href: "/dashboard/admin/crm/templates", label: "Templates Email", icon: <Mail size={18} className="text-teal-500" /> },
            { href: "/dashboard/admin/crm/scoring", label: "Lead Scoring", icon: <Zap size={18} className="text-amber-500" /> },
        ],
    },
];

// ── Badges de rol para el footer del sidebar ─────────────────
const ROLE_BADGES: Record<UserRole, { label: string; color: string }> = {
    [UserRole.SUPER_ADMIN]: { label: "SuperAdmin", color: "bg-red-100 text-red-700" },
    [UserRole.ADMIN]: { label: "ProjectManager", color: "bg-indigo-100 text-indigo-700" },
    [UserRole.CONTENT_MANAGER]: { label: "Marketing / SEO", color: "bg-teal-100 text-teal-700" },
    [UserRole.CLIENT_ADMIN]: { label: "Ventas", color: "bg-amber-100 text-amber-700" },
    [UserRole.CLIENT_USER]: { label: "Creativo", color: "bg-purple-100 text-purple-700" },
    [UserRole.GUEST]: { label: "Invitado", color: "bg-gray-100 text-gray-500" },
};

interface DashboardSidebarProps {
    role: UserRole;
    name: string | null | undefined;
    email: string | null | undefined;
    image?: string | null | undefined;
}

export async function DashboardSidebar({ role, name, email, image }: DashboardSidebarProps) {
    const badge = ROLE_BADGES[role] ?? ROLE_BADGES[UserRole.GUEST];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
            {/* Logo */}
            <div className="h-16 md:h-28 flex items-center justify-center border-b border-gray-100 bg-white px-4 shrink-0">
                <Link href="/" className="flex items-center justify-center group w-full h-full">
                    <div className="relative h-20 w-[200px] transition-all duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-1 group-hover:drop-shadow-[0_10px_15px_rgba(20,184,166,0.3)]">
                        <Image src="/logo.png" alt="LegacyMark" fill className="object-contain" priority />
                    </div>
                </Link>
            </div>

            {/* Nav filtrada por rol */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {NAV_GROUPS.map((group) => {
                    // Filtrar items accesibles para este rol
                    const accessibleItems = group.items.filter((item) =>
                        canAccessRoute(item.href, role)
                    );

                    // No renderizar el grupo si no hay items accesibles
                    if (accessibleItems.length === 0) return null;

                    return (
                        <div key={group.title}>
                            <div
                                className={`px-4 py-2 mt-4 first:mt-0 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${group.accent ?? "text-gray-400"
                                    }`}
                            >
                                {group.accent && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse opacity-70" />
                                )}
                                {group.title}
                            </div>
                            {accessibleItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group"
                                >
                                    <span className="text-slate-400 group-hover:text-teal-500 transition-colors">
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    );
                })}
            </nav>

            {/* Footer: usuario + rol + logout */}
            <div className="p-4 border-t border-gray-100 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-2">
                    {image ? (
                        <div className="relative h-8 w-8 rounded-full overflow-hidden border border-gray-300 shrink-0 shadow-sm">
                            <Image src={image} alt={name ?? "User avatar"} fill className="object-cover" />
                        </div>
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold border border-gray-300 shrink-0 shadow-sm">
                            {name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
                        <p className="text-xs text-gray-500 truncate">{email}</p>
                    </div>
                </div>
                {/* Badge de rol */}
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mb-3 ${badge.color}`}>
                    <Lock size={10} className="mr-1" />
                    {badge.label}
                </span>
                <form
                    action={async () => {
                        "use server";
                        await signOut();
                    }}
                >
                    <Button
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200 hover:border-red-200 transition-all"
                    >
                        <LogOut size={16} className="mr-2" /> Cerrar Sesión
                    </Button>
                </form>
            </div>
        </aside>
    );
}
