"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    X, Key, Activity, ShieldAlert, MonitorOff,
    Smartphone, Copy, AlertTriangle, Download,
    Briefcase, MapPin, AtSign
} from "lucide-react";
import { forcePasswordReset, revokeAllSessions, updateUserMeta } from "@/actions/admin";

interface UserRecord {
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
}

interface UserDrawerProps {
    user: UserRecord | null;
    onClose: () => void;
    onUpdate: (userId: string, data: Partial<UserRecord>) => void;
}

export function UserDrawer({ user, onClose, onUpdate }: UserDrawerProps) {
    const [activeTab, setActiveTab] = useState<"info" | "security" | "audit">("info");
    const [isResetting, setIsResetting] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);
    const [notes, setNotes] = useState(user?.adminNotes || "");

    if (!user) return null;

    const handleForceReset = async () => {
        setIsResetting(true);
        const res = await forcePasswordReset(user.id);
        if (res.success) toast.success("Enlace de reseteo enviado o pendiente");
        else toast.error(res.error);
        setIsResetting(false);
    };

    const handleRevokeSessions = async () => {
        setIsRevoking(true);
        const res = await revokeAllSessions(user.id);
        if (res.success) toast.success("Sistema purgando sesiones...");
        else toast.error(res.error);
        setIsRevoking(false);
    };

    const handleSaveNotes = async () => {
        const res = await updateUserMeta(user.id, { adminNotes: notes });
        if (res.success) {
            toast.success("Notas guardadas solo para HR.");
            onUpdate(user.id, { adminNotes: notes });
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copiado`);
    };

    return (
        <AnimatePresence>
            {user && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%", opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0.5 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
                    >
                        {/* Drawer Header */}
                        <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <ShieldAlert size={120} />
                            </div>

                            <div className="flex gap-4 items-center z-10">
                                <div className="h-14 w-14 rounded-2xl bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-xl font-black text-indigo-700 shadow-sm">
                                    {user.name?.[0]?.toUpperCase() ?? "U"}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 leading-tight">{user.name || "Sin Nombre"}</h2>
                                    <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                                        {user.email}
                                        {user.emailVerified && <span className="text-emerald-500" title="Verificado">✓</span>}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200/50 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors z-10">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 text-sm font-semibold text-slate-500 px-6">
                            <button onClick={() => setActiveTab('info')} className={`py-3 px-4 border-b-2 transition-colors ${activeTab === 'info' ? 'border-indigo-600 text-indigo-700' : 'border-transparent hover:text-slate-800'}`}>Perfil HR</button>
                            <button onClick={() => setActiveTab('security')} className={`py-3 px-4 border-b-2 transition-colors flex gap-1 ${activeTab === 'security' ? 'border-red-500 text-red-600' : 'border-transparent hover:text-slate-800'}`}>Seguridad <ShieldAlert size={14} /></button>
                            <button onClick={() => setActiveTab('audit')} className={`py-3 px-4 border-b-2 transition-colors flex gap-1 ${activeTab === 'audit' ? 'border-amber-500 text-amber-600' : 'border-transparent hover:text-slate-800'}`}>Auditoría <Activity size={14} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">

                            {/* TAB: INFO */}
                            {activeTab === "info" && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center gap-1"><Briefcase size={10} /> Posición</p>
                                            <p className="text-sm font-bold text-slate-800">{user.jobTitle || "No Asignado"}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center gap-1"><Smartphone size={10} /> Contacto</p>
                                            <p className="text-sm font-bold text-slate-800">{user.phone || "Sin Número"}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-700 block mb-2">Notas Privadas (Admin Solo)</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            onBlur={handleSaveNotes}
                                            className="w-full text-sm p-3 rounded-xl border border-slate-200 h-24 bg-yellow-50/50 hover:bg-yellow-50 focus:bg-yellow-50 focus:ring-2 focus:ring-yellow-400 outline-none transition-all resize-none shadow-sm"
                                            placeholder="Detalles sobre rendimiento, notas legales..."
                                        />
                                    </div>

                                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Copia de Datos (GDPR)</p>
                                            <p className="text-[10px] text-slate-500">Extraer Info. en formato JSON crudo.</p>
                                        </div>
                                        <button onClick={() => toast.success("JSON Generado", { icon: <Download size={14} /> })} className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 text-slate-600 transition-colors">
                                            <Download size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* TAB: SECURITY */}
                            {activeTab === "security" && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                                    <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl">
                                        <h3 className="text-red-800 font-bold text-sm flex items-center gap-2 mb-3"><AlertTriangle size={16} /> Acciones de Riesgo</h3>

                                        <div className="space-y-2">
                                            <button
                                                onClick={handleForceReset} disabled={isResetting}
                                                className="w-full bg-white border border-red-200 text-red-700 hover:bg-red-50 p-3 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors shadow-sm"
                                            >
                                                Forzar Reseteo de Clave <Key size={16} />
                                            </button>
                                            <button
                                                onClick={handleRevokeSessions} disabled={isRevoking}
                                                className="w-full bg-red-600 text-white hover:bg-red-700 p-3 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors shadow-sm"
                                            >
                                                Revocar Todas las Sesiones <MonitorOff size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estado MFA (2FA)</span>
                                            {user.mfaEnabled ? (
                                                <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded text-xs font-bold">Activo</span>
                                            ) : (
                                                <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded text-xs font-bold">Inactivo</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400">Si un usuario pierde acceso a su dispositivo 2FA, contacta soporte L2 para reset manual.</p>
                                    </div>

                                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <h3 className="text-white font-black text-sm mb-1 relative z-10">Simular Sesión (Impersonate)</h3>
                                        <p className="text-slate-400 text-[10px] mb-3 relative z-10">Navega la plataforma exactamente como {user.name} lo hace.</p>
                                        <button onClick={() => toast("Impersonate Mode activado", { style: { background: "#0f172a", color: "white" } })} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-lg relative z-10">
                                            Ver como Usuario...
                                        </button>
                                    </div>

                                </motion.div>
                            )}

                            {/* TAB: AUDIT */}
                            {activeTab === "audit" && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm flex-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sesiones Activas</p>
                                            <p className="text-2xl font-black text-slate-800 drop-shadow-sm">{user._count.sessions}</p>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm flex-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Inactividad</p>
                                            <p className="text-2xl font-black text-amber-500 drop-shadow-sm">12D</p>
                                        </div>
                                    </div>

                                    {/* Mock Timeline */}
                                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2"><Activity size={12} /> Timeline Breve</h3>

                                        <div className="relative border-l border-slate-200 ml-2 space-y-4">
                                            <div className="relative pl-5">
                                                <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full -left-[5.5px] top-1.5 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                <p className="text-xs font-bold text-slate-800">Login Exitoso</p>
                                                <p className="text-[10px] text-slate-500">Hace 3 horas desde <span className="text-indigo-600">Miami, US (192.168.x.x)</span></p>
                                            </div>
                                            <div className="relative pl-5">
                                                <div className="absolute w-2.5 h-2.5 bg-slate-300 rounded-full -left-[5.5px] top-1.5" />
                                                <p className="text-xs font-bold text-slate-800">Actualización de Rol</p>
                                                <p className="text-[10px] text-slate-500">Hace 2 días por <span className="text-indigo-600">SuperAdmin</span></p>
                                            </div>
                                            <div className="relative pl-5">
                                                <div className="absolute w-2.5 h-2.5 bg-red-400 rounded-full -left-[5.5px] top-1.5 shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                                                <p className="text-xs font-bold text-slate-800">Falló Contraseña x3</p>
                                                <p className="text-[10px] text-slate-500">Hace 5 días desde Chrome/Windows</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer ID Copy */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between group cursor-pointer" onClick={() => copyToClipboard(user.id, "ID Interno")}>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">System DB_ID</p>
                                <p className="text-xs font-mono text-slate-600 truncate max-w-[200px]">{user.id}</p>
                            </div>
                            <Copy size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
