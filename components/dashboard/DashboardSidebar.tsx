import Link from "next/link";
import {
    LayoutDashboard, Users, Settings, FileText, LogOut,
    Shield, BookOpen, Briefcase, BarChart2, Workflow,
    MessageSquare, Target, TrendingUp, Link2, Building2,
    Lock, UserCog, DollarSign, CheckSquare, Zap, Mail, Calendar, Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import Image from "next/image";
import { canAccessRoute } from "@/lib/rbac";
import { UserRole } from "@/types/auth";
import { prisma } from "@/lib/prisma";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface NavGroup {
    title: string;
    accent?: string;
    items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
    {
        title: "General",
        items: [
            { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
            { href: "/dashboard/inbox", label: "Inbox Omnicanal", icon: <MessageSquare size={16} /> },
            { href: "/dashboard/events", label: "Calendario", icon: <Calendar size={16} className="text-orange-400" /> },
        ],
    },
    {
        title: "Administración",
        items: [
            { href: "/dashboard/users", label: "Usuarios", icon: <Users size={16} /> },
            { href: "/dashboard/experts", label: "Equipo", icon: <UserCog size={16} /> },
            { href: "/dashboard/security", label: "Seguridad", icon: <Shield size={16} /> },
            { href: "/dashboard/settings", label: "Configuración", icon: <Settings size={16} /> },
        ],
    },
    {
        title: "Contenido",
        items: [
            { href: "/dashboard/posts", label: "Blog", icon: <BookOpen size={16} /> },
            { href: "/dashboard/posts/categories", label: "Categorías", icon: <FileText size={16} /> },
            { href: "/dashboard/projects", label: "Portafolio", icon: <Briefcase size={16} /> },
            { href: "/dashboard/analytics", label: "Analítica", icon: <BarChart2 size={16} /> },
        ],
    },
    {
        title: "Marketing Hub",
        accent: "text-violet-400",
        items: [
            { href: "/dashboard/admin/marketing", label: "CMO Dashboard", icon: <BarChart2 size={16} className="text-violet-400" /> },
            { href: "/dashboard/admin/marketing/spend", label: "Ad Spend (ROI)", icon: <DollarSign size={16} className="text-emerald-400" /> },
            { href: "/dashboard/admin/marketing/links", label: "Link Tracker", icon: <Link2 size={16} className="text-blue-400" /> },
            { href: "/dashboard/admin/marketing/campaigns", label: "Campañas (Live)", icon: <Target size={16} className="text-pink-400" /> },
            { href: "/dashboard/admin/marketing/creative-studio", label: "Creative Studio", icon: <Wand2 size={16} className="text-violet-400" /> },
            { href: "/dashboard/admin/marketing/settings", label: "APIs & Config", icon: <Settings size={16} className="text-slate-400" /> },
            { href: "/dashboard/admin/architecture", label: "Organización", icon: <Building2 size={16} className="text-slate-400" /> },
            { href: "/dashboard/admin/automation", label: "Automatización", icon: <Workflow size={16} className="text-purple-400" /> },
        ],
    },
    {
        title: "CRM & Ventas",
        accent: "text-amber-400",
        items: [
            { href: "/dashboard/admin/crm", label: "CRM Overview", icon: <TrendingUp size={16} className="text-amber-400" /> },
            { href: "/dashboard/admin/crm/leads", label: "Leads", icon: <Users size={16} className="text-amber-400" /> },
            { href: "/dashboard/admin/crm/pipeline", label: "Pipeline", icon: <Briefcase size={16} className="text-amber-400" /> },
            { href: "/dashboard/admin/crm/tasks", label: "Tareas", icon: <CheckSquare size={16} className="text-sky-400" /> },
            { href: "/dashboard/admin/crm/reports", label: "Reportes CRM", icon: <BarChart2 size={16} className="text-violet-400" /> },
            { href: "/dashboard/admin/crm/templates", label: "Templates Email", icon: <Mail size={16} className="text-teal-400" /> },
            { href: "/dashboard/admin/crm/scoring", label: "Lead Scoring", icon: <Zap size={16} className="text-amber-400" /> },
        ],
    },
];

const ROLE_BADGES: Record<UserRole, { label: string; color: string }> = {
    [UserRole.SUPER_ADMIN]: { label: "Super Admin", color: "bg-red-500/15 text-red-400 border-red-500/20" },
    [UserRole.ADMIN]: { label: "Project Manager", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20" },
    [UserRole.CONTENT_MANAGER]: { label: "Marketing / SEO", color: "bg-teal-500/15 text-teal-400 border-teal-500/20" },
    [UserRole.CLIENT_ADMIN]: { label: "Ventas", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
    [UserRole.CLIENT_USER]: { label: "Creativo", color: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
    [UserRole.GUEST]: { label: "Invitado", color: "bg-slate-500/15 text-slate-400 border-slate-500/20" },
};

interface DashboardSidebarProps {
    role: UserRole;
    name: string | null | undefined;
    email: string | null | undefined;
    image?: string | null | undefined;
    userId?: string;
}

export async function DashboardSidebar({ role, name, email, image, userId }: DashboardSidebarProps) {
    let badge = ROLE_BADGES[role];
    let userPermissions: string[] = [];

    if (userId) {
        const companyUserRecord = await prisma.companyUser.findFirst({
            where: { userId },
            select: { permissions: true, companyId: true },
        });

        let companyIdToUse: string | null = null;

        if (companyUserRecord) {
            userPermissions = (companyUserRecord.permissions as string[]) ?? [];
            companyIdToUse = companyUserRecord.companyId;
        } else {
            const fallbackConfig = await prisma.company.findFirst({ select: { id: true } });
            if (fallbackConfig) companyIdToUse = fallbackConfig.id;
        }

        if (companyIdToUse && !badge) {
            const company = await prisma.company.findUnique({
                where: { id: companyIdToUse },
                select: { defaultCompanySettings: true },
            });
            const settings = (company?.defaultCompanySettings as any) ?? {};
            const customRoles: any[] = settings.customRoles ?? [];
            const customRole = customRoles.find((r: any) => r.id === role);

            if (customRole) {
                badge = {
                    label: customRole.name,
                    color: `bg-violet-500/15 text-violet-400 border-violet-500/20`,
                };
                if (!companyUserRecord && customRole.permissions) {
                    userPermissions = customRole.permissions;
                }
            }
        }
    }

    badge = badge ?? ROLE_BADGES[UserRole.GUEST];

    const checkAccess = (href: string) => {
        if (canAccessRoute(href, role as UserRole)) return true;
        if (href === "/dashboard" && (userPermissions.includes("dashboard.view") || userPermissions.length > 0)) return true;
        if (href === "/dashboard/events" && userPermissions.includes("calendar.view")) return true;
        if (href.startsWith("/dashboard/inbox") && userPermissions.includes("inbox.view")) return true;
        if (href.startsWith("/dashboard/users")) return userPermissions.includes("team.view") || userPermissions.includes("team.invite") || userPermissions.includes("team.roles");
        if (href.startsWith("/dashboard/experts")) return userPermissions.includes("team.view") || userPermissions.includes("team.invite");
        if (href.startsWith("/dashboard/security") && userPermissions.includes("view_security")) return true;
        if (href.startsWith("/dashboard/settings") && userPermissions.includes("manage_settings")) return true;
        if (href.startsWith("/dashboard/admin/crm")) return userPermissions.some(p => p.startsWith("crm."));
        if (href.startsWith("/dashboard/admin/marketing")) return userPermissions.some(p => p.startsWith("mkt."));
        if (href.startsWith("/dashboard/admin/automation")) return userPermissions.some(p => p.startsWith("automation."));
        if (href.startsWith("/dashboard/posts")) return userPermissions.some(p => p.startsWith("content."));
        if (href.startsWith("/dashboard/projects")) return userPermissions.some(p => p.startsWith("projects."));
        if (href.startsWith("/dashboard/analytics") || href.startsWith("/dashboard/reports")) return userPermissions.includes("analytics.view") || userPermissions.includes("reports.view");
        return false;
    };

    return (
        <aside className="w-60 flex flex-col h-full shrink-0"
            style={{
                background: 'var(--ds-sidebar-bg)',
                borderRight: '1px solid var(--ds-sidebar-border)',
            }}>
            {/* ── Logo ── */}
            <div className="h-16 flex items-center justify-center shrink-0 px-4"
                style={{ borderBottom: '1px solid var(--ds-sidebar-border)' }}>
                <Link href="/" className="flex items-center justify-center w-full h-full group">
                    <div className="relative h-10 w-[160px] transition-all duration-300 group-hover:opacity-90">
                        <Image src="/logo.png" alt="LegacyMark" fill className="object-contain" priority />
                    </div>
                </Link>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
                {NAV_GROUPS.map((group) => {
                    const accessible = group.items.filter((item) => checkAccess(item.href));
                    if (accessible.length === 0) return null;

                    return (
                        <div key={group.title} className="mb-2">
                            {/* Group label */}
                            <div className={`px-3 pt-3 pb-1 text-[9.5px] font-bold uppercase tracking-[0.12em] flex items-center gap-1.5 ${group.accent ?? 'text-slate-600'}`}>
                                {group.accent && <span className="w-1 h-1 rounded-full bg-current inline-block opacity-70 animate-pulse" />}
                                {group.title}
                            </div>

                            {/* Items */}
                            {accessible.map((item) => (
                                <Link key={item.href} href={item.href}
                                    className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium rounded-lg transition-all group"
                                    style={{
                                        color: 'var(--ds-text-secondary)',
                                    }}
                                // Active state handled by CSS pseudo-class below
                                >
                                    <span className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    );
                })}
            </nav>

            {/* ── Footer: user + role + logout ── */}
            <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--ds-sidebar-border)' }}>
                <div className="flex items-center gap-2.5 mb-2.5">
                    {image ? (
                        <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0 ring-1 ring-white/10">
                            <Image src={image} alt={name ?? "Avatar"} fill className="object-cover" />
                        </div>
                    ) : (
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: 'var(--ds-accent-glow)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}>
                            {name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--ds-text-primary)' }}>{name}</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--ds-text-muted)' }}>{email}</p>
                    </div>
                </div>

                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold mb-2.5 border ${badge.color}`}>
                    <Lock size={9} className="mr-1" /> {badge.label}
                </span>

                <form action={async () => { "use server"; await signOut(); }}>
                    <Button variant="ghost" className="w-full justify-start text-xs h-8 gap-2 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        style={{ color: 'var(--ds-text-muted)' }}>
                        <LogOut size={13} /> Cerrar Sesión
                    </Button>
                </form>
            </div>
        </aside>
    );
}
