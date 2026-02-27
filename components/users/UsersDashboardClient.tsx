"use client";

import { useState, useMemo, useEffect } from "react";
import { UserRole } from "@/types/auth";
import { RoleSelector } from "@/components/dashboard/RoleSelector";
import { toggleUserStatus, bulkDeleteUsers, bulkToggleUsersStatus } from "@/actions/admin";
import { toast } from "sonner";
import { Crown, Shield, Megaphone, ShoppingBag, Palette, Users, UserPlus, Search, Download, Trash, UserX, UserCheck, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import type { Prisma } from "@prisma/client";

// Mapped User type matching our Prisma schema returns for `getUsers`
type UserRecord = {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: Date;
    deactivatedAt: Date | null;
    mfaEnabled: boolean;
    _count: { sessions: number };
};

interface UsersClientProps {
    initialUsers: UserRecord[];
    currentUserId: string;
}

const ROLE_INFO: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    super_admin: { icon: <Crown size={12} />, label: "SuperAdmin", color: "bg-red-50 text-red-700 border-red-200" },
    admin: { icon: <Shield size={12} />, label: "ProjectManager", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    content_manager: { icon: <Megaphone size={12} />, label: "Marketing / SEO", color: "bg-teal-50 text-teal-700 border-teal-200" },
    client_admin: { icon: <ShoppingBag size={12} />, label: "Ventas", color: "bg-amber-50 text-amber-700 border-amber-200" },
    client_user: { icon: <Palette size={12} />, label: "Creativo", color: "bg-purple-50 text-purple-700 border-purple-200" },
    guest: { icon: <Users size={12} />, label: "Invitado", color: "bg-gray-50 text-gray-500 border-gray-200" },
};

function StatsCard({ label, value, icon, index }: { label: string; value: number; icon: React.ReactNode; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
            className="bg-white rounded-2xl border border-slate-200/60 p-5 flex items-center gap-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-shadow"
        >
            <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                {icon}
            </div>
            <div>
                <motion.p
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, delay: index * 0.1 + 0.2 }}
                    className="text-2xl font-black text-slate-900"
                >
                    {value}
                </motion.p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            </div>
        </motion.div>
    );
}

export function UsersDashboardClient({ initialUsers, currentUserId }: UsersClientProps) {
    const [users, setUsers] = useState<UserRecord[]>(initialUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isClient, setIsClient] = useState(false);

    // Hydration fix
    useEffect(() => {
        setIsClient(true);
        // Cmd/Ctrl+K mapping
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                document.getElementById("user-search-input")?.focus();
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Filter Logic
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    // Derived stats
    const totalUsers = users.length;
    const roleCount = (role: string) => users.filter(u => u.role === role).length;

    // Selection
    const toggleSelectAll = () => {
        if (selectedIds.size === filteredUsers.length && filteredUsers.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const toggleSelectOne = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    // Actions
    const handleToggleStatus = async (userId: string) => {
        const originalStatus = users.find(u => u.id === userId)?.deactivatedAt;

        // Optimistic UI updates
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, deactivatedAt: originalStatus ? null : new Date() } : u));

        const res = await toggleUserStatus(userId);
        if (res.success) {
            toast.success(res.isDeactivated ? "Usuario suspendido correctamente." : "Usuario reactivado.");
        } else {
            toast.error(res.error || "Algo falló.");
            // Revert
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, deactivatedAt: originalStatus ?? null } : u));
        }
    };

    const handleBulkDeactivate = async () => {
        if (selectedIds.size === 0) return;

        const res = await bulkToggleUsersStatus(Array.from(selectedIds), true);
        if (res.success) {
            toast.success(`${res.count} usuarios suspendidos.`);
            setUsers(prev => prev.map(u => selectedIds.has(u.id) && u.id !== currentUserId ? { ...u, deactivatedAt: new Date() } : u));
            setSelectedIds(new Set());
        } else { toast.error(res.error); }
    };

    const copyEmail = (email: string | null) => {
        if (!email) return;
        navigator.clipboard.writeText(email);
        toast.success("Correo copiado al portapapeles", { icon: "📋" });
    };

    const generateAvatarColor = (name: string | null) => {
        if (!name) return "from-gray-100 to-gray-200 border-gray-300 text-gray-500";
        const charCode = name.charCodeAt(0);
        const palettes = [
            "from-indigo-100 to-purple-100 border-indigo-200 text-indigo-700",
            "from-emerald-100 to-teal-100 border-emerald-200 text-emerald-700",
            "from-amber-100 to-orange-100 border-amber-200 text-amber-700",
            "from-rose-100 to-pink-100 border-rose-200 text-rose-700",
            "from-blue-100 to-cyan-100 border-blue-200 text-blue-700"
        ];
        return palettes[charCode % palettes.length];
    };

    // Formateador de fechas relativas ultra-pro
    const getRelativeDate = (date: Date) => {
        const rtf = new Intl.RelativeTimeFormat('es-CO', { numeric: 'auto' });
        const daysDiff = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 0) return "Hoy";
        if (daysDiff < 30) return rtf.format(-daysDiff, 'day');
        if (daysDiff < 365) return rtf.format(-Math.floor(daysDiff / 30), 'month');
        return rtf.format(-Math.floor(daysDiff / 365), 'year');
    };

    if (!isClient) return <Skeleton className="w-full h-[600px] rounded-2xl" />;

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* HERO HEADER */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 text-indigo-500/10">
                    <Users size={300} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        Agencia Hub <span className="text-indigo-400">|</span> Users
                    </h1>
                    <p className="mt-2 text-indigo-100/80 max-w-xl text-sm leading-relaxed">
                        Control del directorio C-Level, gestores creativos e invitados. Panel centralizado de accesos.
                    </p>
                    <div className="mt-6 flex gap-3">
                        <button className="bg-white text-indigo-900 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2">
                            <UserPlus size={16} />
                            Invitar Usuario
                        </button>
                    </div>
                </div>
            </div>

            {/* 3D STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatsCard index={0} label="Total Network" value={totalUsers} icon={<Users size={20} />} />
                <StatsCard index={1} label="Super Admins" value={roleCount('super_admin')} icon={<Crown size={20} className="text-red-500" />} />
                <StatsCard index={2} label="Project Mgrs" value={roleCount('admin')} icon={<Shield size={20} className="text-indigo-500" />} />
                <StatsCard index={3} label="Content / SEO" value={roleCount('content_manager')} icon={<Megaphone size={20} className="text-teal-500" />} />
                <StatsCard index={4} label="Ventas" value={roleCount('client_admin')} icon={<ShoppingBag size={20} className="text-amber-500" />} />
            </div>

            {/* MAIN TABLE WRAPPER */}
            <div className="bg-white rounded-2xl border border-slate-200 outline outline-4 outline-slate-50/50 shadow-sm overflow-hidden flex flex-col">

                {/* TOOLBAR */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center gap-4 justify-between">
                    <div className="flex w-full md:w-auto items-center gap-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            id="user-search-input"
                            type="text"
                            placeholder="Buscar por nombre o correo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg pl-9 pr-14 py-2 text-sm w-full md:w-80 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        />
                        <div className="absolute right-2 opacity-60 text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">⌘K</div>
                    </div>

                    <div className="flex w-full md:w-auto items-center gap-3 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                        {/* ROLE PILLS FILTER */}
                        <div className="flex gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
                            <button
                                onClick={() => setRoleFilter('all')}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${roleFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Todos
                            </button>
                            {Object.entries(ROLE_INFO).filter(([k]) => k !== 'guest').map(([k, info]) => (
                                <button
                                    key={k}
                                    onClick={() => setRoleFilter(k)}
                                    className={`px-3 py-1 flex items-center gap-1.5 text-xs font-semibold rounded-lg transition-all ${roleFilter === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                                >
                                    {info.icon} <span className="hidden lg:inline">{info.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BATCH ACTIONS BAR (Conditionally Rendered) */}
                <AnimatePresence>
                    {selectedIds.size > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-indigo-50 border-b border-indigo-100 px-6 py-3 flex items-center justify-between overflow-hidden"
                        >
                            <span className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                                <span className="bg-indigo-600 text-white w-5 h-5 rounded flex items-center justify-center text-xs">{selectedIds.size}</span>
                                seleccionados
                            </span>
                            <div className="flex gap-2">
                                <button onClick={handleBulkDeactivate} className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 transition-colors shadow-sm">
                                    <UserX size={14} /> Suspender Masivo
                                </button>
                                <button className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors shadow-sm">
                                    <Trash size={14} /> Eliminar
                                </button>
                                <button className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm ml-2">
                                    <Download size={14} /> CSV
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ADVANCED TABLE */}
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-white">
                                <th className="py-4 px-6 relative w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === filteredUsers.length && filteredUsers.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                </th>
                                <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Perfil y Acceso</th>
                                <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Rol / Permisos</th>
                                <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-slate-400 uppercase hidden md:table-cell">Métricas</th>
                                <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Estado Vital</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <AnimatePresence>
                                {filteredUsers.map((user) => {
                                    const isSelf = user.id === currentUserId;
                                    const isDeactivated = !!user.deactivatedAt;
                                    const avatarGradient = generateAvatarColor(user.name);

                                    return (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={`group transition-colors hover:bg-slate-50/50 ${selectedIds.has(user.id) ? 'bg-indigo-50/30' : ''} ${isDeactivated ? 'opacity-60 grayscale' : ''}`}
                                        >
                                            <td className="py-4 px-6 relative">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(user.id)}
                                                    onChange={() => toggleSelectOne(user.id)}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                                />
                                                {/* Hover Glow Edge Effect */}
                                                <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </td>

                                            {/* Profile Cell */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 shrink-0 rounded-full bg-gradient-to-br border flex items-center justify-center font-bold text-sm ${avatarGradient}`}>
                                                        {user.name?.[0]?.toUpperCase() ?? "U"}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer">
                                                                {user.name || "Usuario Sin Nombre"}
                                                            </p>
                                                            {isSelf && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-500 border border-indigo-100 glow-pulse">You</span>}
                                                            {user.mfaEnabled && <span title="2FA Activado" className="text-xs">🛡️</span>}
                                                        </div>
                                                        <p onClick={() => copyEmail(user.email)} className="text-xs text-slate-500 hover:text-slate-800 cursor-copy transition-colors group/copy">
                                                            {user.email} <span className="opacity-0 group-hover/copy:opacity-100">📋</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role Selector */}
                                            <td className="py-4 px-6">
                                                <RoleSelector userId={user.id} currentRole={user.role} isSelf={isSelf} />
                                            </td>

                                            {/* Metrics */}
                                            <td className="py-4 px-6 hidden md:table-cell">
                                                <p className="text-xs font-semibold text-slate-700">{user._count?.sessions ?? 0} logins</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">unido {getRelativeDate(new Date(user.createdAt))}</p>
                                            </td>

                                            {/* Status Toggle */}
                                            <td className="py-4 px-6">
                                                <button
                                                    onClick={() => handleToggleStatus(user.id)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-all hover:shadow-sm 
                                                        ${isDeactivated
                                                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                            : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                                        }`}
                                                    title={isSelf ? "No puedes suspender tu cuenta" : "Click para cambiar estado"}
                                                    disabled={isSelf}
                                                >
                                                    {!isDeactivated ? (
                                                        <>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activo
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Ausente
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Inbox className="w-12 h-12 mb-3 opacity-20" />
                                            <p className="text-sm font-medium">No encontramos coincidencias para esta búsqueda o filtro.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-slate-50 border-t border-slate-100 p-4 text-xs text-slate-400 font-medium text-center">
                    Usa las casillas de la izquierda para acciones masivas (eliminar/suspender bloque).
                </div>
            </div>
        </div>
    );
}
