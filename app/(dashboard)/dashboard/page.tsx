import { auth } from "@/lib/auth";
import { AnalyticsOverview } from "@/modules/analytics/components/overview";
import { prisma } from "@/lib/prisma";
import { Activity, ShieldCheck, Sparkles, Clock } from "lucide-react";

export default async function DashboardPage() {
    const session = await auth();
    const user = session?.user;

    // Fetch fresh user data to ensure the role displayed is accurate
    const dbUser = user?.id ? await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true }
    }) : null;
    const currentRole = dbUser?.role || user?.role || 'Guest';

    // Fetch recent activity
    const activityLogs: any[] = user?.id ? await prisma.userActivityLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
    }) : [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-8 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-teal-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 text-[11px] font-bold uppercase tracking-wider mb-3 w-fit border border-teal-100">
                        <Sparkles size={12} className="text-teal-500" /> Panel C-Level
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">{user?.name?.split(' ')[0] || 'Usuario'}</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 font-medium">Aquí tienes el estado en tiempo real de tus operaciones.</p>
                </div>
                <div className="relative z-10 hidden sm:flex items-center gap-2 bg-slate-50/80 backdrop-blur-md border border-slate-200/80 px-4 py-2 rounded-xl shadow-sm">
                    <ShieldCheck size={16} className="text-indigo-500" />
                    <span className="text-sm font-bold text-slate-700 capitalize tracking-wide">
                        {currentRole}
                    </span>
                </div>
            </div>

            {/* Analytics Overview Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Activity size={18} className="text-slate-400" />
                    <h2 className="text-lg font-bold text-slate-800">Métricas Estratégicas</h2>
                </div>
                {/* The AnalyticsOverview component handles its own cards, we just wrap it nicely */}
                <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-1 border border-slate-200/40 shadow-sm">
                    <AnalyticsOverview />
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-6 md:p-8 mt-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-slate-400" />
                        <h2 className="text-lg font-bold text-slate-800">Registro de Actividad Reciente</h2>
                    </div>
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">Live</span>
                </div>

                <div className="relative pl-4 sm:pl-0">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[20px] top-4 bottom-4 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent hidden sm:block" />

                    <div className="space-y-6">
                        {activityLogs.length > 0 ? (
                            activityLogs.map((log, index) => (
                                <div key={log.id} className="relative flex flex-col sm:flex-row gap-4 sm:items-center py-2 group">
                                    {/* Timeline Dot */}
                                    <div className="hidden sm:flex absolute left-[20px] -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-teal-500 shadow-[0_0_0_4px_rgba(255,255,255,1)] group-hover:scale-125 transition-transform z-10" />

                                    {/* Content Card */}
                                    <div className="flex-1 sm:ml-12 bg-white sm:bg-transparent border border-slate-100 sm:border-transparent p-4 sm:p-3 rounded-xl sm:rounded-lg sm:hover:bg-slate-50/80 transition-all flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 group-hover:shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] sm:group-hover:border-slate-200/60">
                                        <div className="h-10 w-10 border border-slate-100 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                                            <span className="text-slate-600 text-[10px] font-black uppercase tracking-wider">
                                                {(log.action || 'LOG').substring(0, 2)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[14px] font-bold text-slate-800 truncate">{log.action}</p>
                                            <p className="text-[12px] font-medium text-slate-500 mt-0.5 max-w-2xl truncate">
                                                {/* @ts-ignore */}
                                                {log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : 'Operación de sistema completada exitosamente.'}
                                            </p>
                                        </div>
                                        <div className="text-left sm:text-right mt-2 sm:mt-0 opacity-70 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                {new Date(log.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-3">
                                    <Clock size={20} className="text-slate-300" />
                                </div>
                                <p className="text-sm font-semibold text-slate-600">No hay actividad reciente</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm">Tus acciones en el panel de control aparecerán registradas aquí.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
