"use client";

import { useState, useMemo, useEffect } from "react";
import { UserRole } from "@/types/auth";
import { RoleSelector } from "@/components/dashboard/RoleSelector";
import { toggleUserStatus, bulkDeleteUsers, bulkToggleUsersStatus } from "@/actions/admin";
import { toast } from "sonner";
import {
    Crown, Shield, Megaphone, ShoppingBag, Palette, Users, UserPlus,
    Search, Download, Trash, UserX, Inbox, LayoutGrid, List, SlidersHorizontal,
    MoreVertical, Star, EyeOff, Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDrawer } from "./UserDrawer";

type UserRecord = {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    phone: string | null;
    jobTitle: string | null;
    adminNotes: string | null;
    customTag: string | null;
    createdAt: Date;
    deactivatedAt: Date | null;
    mfaEnabled: boolean;
    emailVerified: boolean | null;
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

export function UsersDashboardClient({ initialUsers, currentUserId }: UsersClientProps) {
    const [users, setUsers] = useState<UserRecord[]>(initialUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
    const [isClient, setIsClient] = useState(false);

    // View States
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [showMetrics, setShowMetrics] = useState(true);
    const [selectedUserForDrawer, setSelectedUserForDrawer] = useState<UserRecord | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, userId: string } | null>(null);

    useEffect(() => {
        setIsClient(true);
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                document.getElementById("user-search-input")?.focus();
            }
        };
        const closeContext = () => setContextMenu(null);
        document.addEventListener("keydown", down);
        document.addEventListener("click", closeContext);
        return () => {
            document.removeEventListener("keydown", down);
            document.removeEventListener("click", closeContext);
        };
    }, []);

    const filteredUsers = useMemo(() => {
        let result = users.filter(user => {
            const matchesSearch = (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });

        // Sort starred first
        result.sort((a, b) => {
            if (starredIds.has(a.id) && !starredIds.has(b.id)) return -1;
            if (!starredIds.has(a.id) && starredIds.has(b.id)) return 1;
            return 0;
        });

        return result;
    }, [users, searchQuery, roleFilter, starredIds]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 500);
    };

    const handleToggleStatus = async (userId: string) => {
        const originalStatus = users.find(u => u.id === userId)?.deactivatedAt;
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, deactivatedAt: originalStatus ? null : new Date() } : u));
        const res = await toggleUserStatus(userId);
        if (res.success) {
            toast.success(res.isDeactivated ? "Usuario suspendido correctamente." : "Usuario reactivado.");
        } else {
            toast.error(res.error || "Algo falló.");
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, deactivatedAt: originalStatus ?? null } : u));
        }
    };

    const handleDrawerUpdate = (userId: string, data: Partial<UserRecord>) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    };

    const handleRightClick = (e: React.MouseEvent, userId: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, userId });
    };

    const toggleStar = (userId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = new Set(starredIds);
        if (next.has(userId)) next.delete(userId);
        else next.add(userId);
        setStarredIds(next);
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
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-20">
            {/* HERO HEADER */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 text-indigo-500/10">
                    <Users size={300} />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <span className="text-indigo-400">♦</span> Directorio IAM
                        </h1>
                        <p className="mt-2 text-indigo-100/80 max-w-xl text-sm leading-relaxed">
                            Control de identidades, accesos y métricas operativas de la organización.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 backdrop-blur-md">
                            <Download size={16} /> Exportar IAM
                        </button>
                        <button className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all flex items-center gap-2">
                            <UserPlus size={16} /> Invitar Miembro
                        </button>
                    </div>
                </div>
            </div>

            {/* TOOLBAR AVANZADO */}
            <div className="bg-white rounded-2xl border border-slate-200 outline outline-4 outline-slate-50/50 shadow-sm p-4 flex flex-col xl:flex-row gap-4 justify-between items-center sticky top-4 z-30">
                <div className="flex w-full xl:w-auto items-center gap-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        id="user-search-input"
                        type="text"
                        placeholder="Buscar identidad (Cmd+K)..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-14 py-2 text-sm w-full xl:w-80 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    />
                    <AnimatePresence>
                        {isTyping && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute right-12 top-1/2 -translate-y-1/2 flex gap-1">
                                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
                                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex w-full xl:w-auto items-center gap-3 overflow-x-auto pb-1 xl:pb-0 hide-scrollbar">
                    <div className="flex gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
                        <button onClick={() => setRoleFilter('all')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${roleFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Todos</button>
                        {Object.entries(ROLE_INFO).filter(([k]) => k !== 'guest').map(([k, info]) => (
                            <button key={k} onClick={() => setRoleFilter(k)} className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold rounded-lg transition-all ${roleFilter === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                                {info.icon} <span className="hidden sm:inline">{info.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                    <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                        <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={16} /></button>
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={16} /></button>
                    </div>

                    <button onClick={() => setShowMetrics(!showMetrics)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-200 transition-colors" title="Alternar Columnas">
                        <SlidersHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* VIEW RENDERER */}
            {viewMode === "table" ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/50">
                                    <th className="py-4 px-6 w-12"><Star size={14} className="text-slate-300" /></th>
                                    <th className="py-4 px-6 text-[10px] font-black tracking-widest text-slate-400 uppercase">Identidad Registrada</th>
                                    <th className="py-4 px-6 text-[10px] font-black tracking-widest text-slate-400 uppercase">Asignación de Rol</th>
                                    {showMetrics && <th className="py-4 px-6 text-[10px] font-black tracking-widest text-slate-400 uppercase">Actividad</th>}
                                    <th className="py-4 px-6 text-[10px] font-black tracking-widest text-slate-400 uppercase text-right">Controles</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <AnimatePresence>
                                    {filteredUsers.map((user) => {
                                        const isSelf = user.id === currentUserId;
                                        const isDeactivated = !!user.deactivatedAt;
                                        const avatarGradient = generateAvatarColor(user.name);
                                        const isStarred = starredIds.has(user.id);

                                        return (
                                            <motion.tr
                                                key={user.id}
                                                layout
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                onContextMenu={(e) => handleRightClick(e, user.id)}
                                                onClick={() => setSelectedUserForDrawer(user)}
                                                className={`group transition-colors hover:bg-slate-50 cursor-pointer ${isDeactivated ? 'opacity-60 grayscale' : ''} ${isStarred ? 'bg-amber-50/10' : ''}`}
                                            >
                                                <td className="py-4 px-6" onClick={(e) => toggleStar(user.id, e)}>
                                                    <Star size={16} className={`transition-colors hover:text-amber-500 ${isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                                                </td>

                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-10 w-10 shrink-0 rounded-full bg-gradient-to-br border flex items-center justify-center font-bold text-sm ${avatarGradient} shadow-sm group-hover:scale-105 transition-transform`}>
                                                            {user.name?.[0]?.toUpperCase() ?? "U"}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-bold text-slate-900">{user.name || "Sin Nombre"}</p>
                                                                {isSelf && <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">Tú</span>}
                                                                {user.mfaEnabled && <Shield size={12} className="text-emerald-500" title="MFA Activado" />}
                                                            </div>
                                                            <p className="text-xs text-slate-500 font-medium font-mono mt-0.5">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                                                    <RoleSelector userId={user.id} currentRole={user.role} isSelf={isSelf} />
                                                    {user.jobTitle && <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1"><Briefcase size={10} /> {user.jobTitle}</p>}
                                                </td>

                                                {showMetrics && (
                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                                                {user._count?.sessions ?? 0} Inicios de sesión
                                                            </p>
                                                            <p className="text-[10px] text-slate-400">Ingreso: {getRelativeDate(new Date(user.createdAt))}</p>
                                                        </div>
                                                    </td>
                                                )}

                                                <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(user.id); }}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-all hover:shadow-sm ${isDeactivated ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                                        disabled={isSelf}
                                                    >
                                                        {isDeactivated ? <><EyeOff size={12} /> Suspendido</> : 'Suspender'}
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* GRID VIEW */
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredUsers.map(user => {
                        const avatarGradient = generateAvatarColor(user.name);
                        return (
                            <div key={user.id} onClick={() => setSelectedUserForDrawer(user)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                                {user.deactivatedAt && <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[1px] z-10 flex items-center justify-center"><span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Cuenta Suspendida</span></div>}

                                <div className="flex justify-between items-start mb-4">
                                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br border flex items-center justify-center font-black text-lg ${avatarGradient} shadow-sm group-hover:-translate-y-1 transition-transform`}>
                                        {user.name?.[0]?.toUpperCase() ?? "U"}
                                    </div>
                                    <button onClick={(e) => toggleStar(user.id, e)} className="p-1 z-20 hover:bg-slate-50 rounded-full">
                                        <Star size={16} className={starredIds.has(user.id) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                                    </button>
                                </div>
                                <h3 className="font-bold text-slate-900 truncate">{user.name || "Usuario Sin Nombre"}</h3>
                                <p className="text-xs text-slate-500 font-mono truncate mb-4">{user.email}</p>

                                <div className="flex items-center gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
                                    <RoleSelector userId={user.id} currentRole={user.role} isSelf={user.id === currentUserId} />
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>{user._count.sessions} Logins</span>
                                    <span>{getRelativeDate(new Date(user.createdAt))}</span>
                                </div>
                            </div>
                        )
                    })}
                </motion.div>
            )}

            {filteredUsers.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-2xl border-dashed">
                    <Inbox className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-bold text-slate-600">No hay creativos a la vista</p>
                    <p className="text-sm mt-1">Intenta con otro filtro o término de búsqueda.</p>
                </div>
            )}

            {/* CONTEXT MENU COMPONENT */}
            <AnimatePresence>
                {contextMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 min-w-[180px]"
                    >
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 pt-2 pb-1 border-b border-slate-100 mb-1">Opciones Rápidas</p>
                        <button onClick={() => { setSelectedUserForDrawer(users.find(u => u.id === contextMenu.userId) || null); setContextMenu(null); }} className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors">
                            Abrir Ficha Técnica
                        </button>
                        <button onClick={() => { handleToggleStatus(contextMenu.userId); setContextMenu(null); }} className="w-full text-left px-3 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                            Alterar Estado
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            Eliminar del Hub
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* USER DRAWER (SIDE PANEL) */}
            <UserDrawer
                user={selectedUserForDrawer}
                onClose={() => setSelectedUserForDrawer(null)}
                onUpdate={handleDrawerUpdate}
            />

        </div>
    );
}
