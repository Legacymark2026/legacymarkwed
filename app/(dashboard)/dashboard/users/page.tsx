import { getUsers } from "@/actions/admin";
import { auth } from "@/lib/auth";
import { RoleSelector } from "@/components/dashboard/RoleSelector";
import { UserRole } from "@/types/auth";
import {
    Users, UserPlus, Crown, Briefcase, Megaphone,
    Palette, ShoppingBag, Shield
} from "lucide-react";
import Link from "next/link";

const ROLE_INFO: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    super_admin: { icon: <Crown size={12} />, label: "SuperAdmin", color: "bg-red-50 text-red-700 border-red-200" },
    admin: { icon: <Shield size={12} />, label: "ProjectManager", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    content_manager: { icon: <Megaphone size={12} />, label: "Marketing / SEO", color: "bg-teal-50 text-teal-700 border-teal-200" },
    client_admin: { icon: <ShoppingBag size={12} />, label: "Ventas", color: "bg-amber-50 text-amber-700 border-amber-200" },
    client_user: { icon: <Palette size={12} />, label: "Creativo", color: "bg-purple-50 text-purple-700 border-purple-200" },
    guest: { icon: <Users size={12} />, label: "Invitado", color: "bg-gray-50 text-gray-500 border-gray-200" },
};

function RoleBadge({ role }: { role: string }) {
    const info = ROLE_INFO[role] ?? ROLE_INFO.guest;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${info.color}`}>
            {info.icon}
            {info.label}
        </span>
    );
}

function StatsCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
            <div className="h-11 w-11 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center text-slate-500">
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
            </div>
        </div>
    );
}

export default async function UsersPage() {
    const [result, session] = await Promise.all([getUsers(), auth()]);

    if ('error' in result) {
        return <div className="text-red-500 p-4">Error: {result.error}</div>;
    }

    const { users } = result;
    const currentUserId = session?.user?.id ?? "";

    // Estadísticas rápidas
    const roleCount = (role: string) => users?.filter((u) => u.role === role).length ?? 0;
    const totalUsers = users?.length ?? 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users size={22} className="text-indigo-500" />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Administra el acceso y los roles de cada miembro de la agencia.
                    </p>
                </div>

                {/* Botón Invitar (futuro) */}
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <UserPlus size={16} />
                    Invitar Usuario
                </button>
            </div>

            {/* Stats rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatsCard label="Total usuarios" value={totalUsers} icon={<Users size={20} />} />
                <StatsCard label="SuperAdmin" value={roleCount('super_admin')} icon={<Crown size={20} className="text-red-500" />} />
                <StatsCard label="Project Mgr" value={roleCount('admin')} icon={<Briefcase size={20} className="text-indigo-500" />} />
                <StatsCard label="Marketing/SEO" value={roleCount('content_manager')} icon={<Megaphone size={20} className="text-teal-500" />} />
                <StatsCard label="Ventas" value={roleCount('client_admin')} icon={<ShoppingBag size={20} className="text-amber-500" />} />
            </div>

            {/* Tabla de usuarios */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Leyenda de roles */}
                <div className="px-6 py-3 border-b border-gray-100 bg-slate-50/60 flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-gray-400 font-medium mr-1">Roles:</span>
                    {Object.entries(ROLE_INFO).filter(([k]) => k !== 'guest').map(([, info]) => (
                        <span key={info.label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${info.color}`}>
                            {info.icon}{info.label}
                        </span>
                    ))}
                    <span className="ml-auto text-xs text-gray-400">
                        Haz clic en el badge de rol para cambiarlo
                    </span>
                </div>

                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Rol actual
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                Sesiones
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                Miembro desde
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {users?.map((user) => {
                            const isSelf = user.id === currentUserId;
                            return (
                                <tr key={user.id} className={`hover:bg-slate-50/60 transition-colors ${isSelf ? "bg-indigo-50/30" : ""}`}>
                                    {/* Avatar + nombre */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center text-sm font-bold text-indigo-700 shrink-0">
                                                {user.name?.[0]?.toUpperCase() ?? "?"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate flex items-center gap-1.5">
                                                    {user.name ?? "Sin nombre"}
                                                    {isSelf && (
                                                        <span className="text-[10px] font-normal text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">tú</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Rol — editable si no es uno mismo */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RoleSelector
                                            userId={user.id}
                                            currentRole={user.role}
                                            isSelf={isSelf}
                                        />
                                    </td>

                                    {/* Sesiones */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                        <span className="font-medium text-slate-700">{user._count.sessions}</span>
                                        <span className="text-gray-400 ml-1">sesiones</span>
                                    </td>

                                    {/* Fecha de registro */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                                        {new Date(user.createdAt).toLocaleDateString("es-CO", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </td>

                                    {/* Estado */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Activo
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}

                        {(!users || users.length === 0) && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                                    No hay usuarios registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Footer con guía rápida */}
                <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/50">
                    <p className="text-xs text-gray-400">
                        💡 <strong className="text-gray-500">Nota:</strong> Los cambios de rol se aplican en la próxima sesión del usuario.
                        Para forzarlo inmediatamente, el usuario debe cerrar sesión y volver a entrar.
                    </p>
                </div>
            </div>

            {/* Tarjetas guía de roles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <h2 className="col-span-full text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Guía rápida de roles
                </h2>
                {[
                    { role: "SuperAdmin", value: "super_admin", desc: "Acceso total al sistema: configuración, seguridad, finanzas y todos los módulos.", icon: <Crown size={18} className="text-red-500" /> },
                    { role: "ProjectManager", value: "admin", desc: "Dashboard, Inbox, Usuarios, Equipo, Blog, Proyectos, Analítica y Marketing Hub.", icon: <Shield size={18} className="text-indigo-500" /> },
                    { role: "Marketing / SEO", value: "content_manager", desc: "Blog, Analítica, Marketing Hub, Campañas y subida de assets.", icon: <Megaphone size={18} className="text-teal-500" /> },
                    { role: "Ventas", value: "client_admin", desc: "Inbox Omnicanal, CRM, Pipeline de ventas y gestión de Leads.", icon: <ShoppingBag size={18} className="text-amber-500" /> },
                    { role: "Creativo", value: "client_user", desc: "Blog (crear/editar), Proyectos (solo lectura) y subida de assets.", icon: <Palette size={18} className="text-purple-500" /> },
                ].map((r) => (
                    <div key={r.value} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3 shadow-sm">
                        <div className="mt-0.5 shrink-0">{r.icon}</div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">{r.role}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{r.desc}</p>
                            <code className="mt-1 inline-block text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                role = &apos;{r.value}&apos;
                            </code>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
