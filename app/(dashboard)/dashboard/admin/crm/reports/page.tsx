import { getCRMReports } from "@/actions/crm-advanced";
import { prisma } from "@/lib/prisma";
import { TrendingUp, DollarSign, Users, Target, Clock } from "lucide-react";

const STAGE_LABELS: Record<string, string> = {
    NEW: "Nuevo", QUALIFIED: "Calificado", PROPOSAL: "Propuesta",
    NEGOTIATION: "Negociación", WON: "Ganado", LOST: "Perdido"
};

export default async function ReportsPage() {
    const company = await prisma.company.findFirst();
    if (!company) return <div className="p-8 text-slate-500 text-center">Configura tu empresa primero.</div>;

    const data = await getCRMReports(company.id);
    if ("error" in data) return <div className="p-8 text-red-500 text-center">Error al cargar reportes.</div>;

    const { revenueByMonth, winRateByMonth, conversionBySource, stageRevenue, salesReps, avgDaysToClose, totalRevenue, totalLeads, totalDeals, winRate } = data;

    const maxRevenue = Math.max(...revenueByMonth.map((r) => r.revenue), 1);
    const maxLeads = Math.max(...revenueByMonth.map((r) => r.leads), 1);
    const maxWinRate = 100;

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900">Reportes CRM</h1>
                <p className="text-slate-500 mt-1">Análisis de desempeño comercial — últimos 6 meses.</p>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Revenue Total", value: `$${(totalRevenue / 1000).toFixed(1)}k`, icon: <DollarSign className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Win Rate", value: `${winRate}%`, icon: <TrendingUp className="w-5 h-5" />, color: "text-teal-600", bg: "bg-teal-50" },
                    { label: "Total Leads", value: totalLeads, icon: <Users className="w-5 h-5" />, color: "text-sky-600", bg: "bg-sky-50" },
                    { label: "Días a Cierre", value: avgDaysToClose, icon: <Clock className="w-5 h-5" />, color: "text-violet-600", bg: "bg-violet-50" },
                ].map((k) => (
                    <div key={k.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl ${k.bg} ${k.color} flex items-center justify-center flex-shrink-0`}>{k.icon}</div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{k.value}</p>
                            <p className="text-xs text-slate-400 font-medium">{k.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Month — Bar Chart */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6">💰 Revenue por Mes</h2>
                    <div className="flex items-end gap-3 h-40">
                        {revenueByMonth.map((m) => (
                            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-teal-600">${(m.revenue / 1000).toFixed(1)}k</span>
                                <div className="w-full rounded-t-lg bg-gradient-to-t from-teal-500 to-teal-400 transition-all" style={{ height: `${Math.max((m.revenue / maxRevenue) * 100, 4)}%` }} />
                                <span className="text-xs text-slate-400 capitalize">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Win Rate Trend — Line Area Chart (SVG) */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6">🎯 Win Rate por Mes</h2>
                    <div className="relative h-40">
                        <svg viewBox="0 0 500 130" className="w-full h-full" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="winGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            {winRateByMonth.length > 1 && (() => {
                                const pts = winRateByMonth.map((m, i) => ({ x: (i / (winRateByMonth.length - 1)) * 480 + 10, y: 120 - (m.winRate / maxWinRate) * 110 }));
                                const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
                                const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},130 L${pts[0].x.toFixed(1)},130 Z`;
                                return (<>
                                    <path d={area} fill="url(#winGrad)" />
                                    <path d={line} fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#14b8a6" />)}
                                </>);
                            })()}
                        </svg>
                        <div className="flex justify-between mt-2">
                            {winRateByMonth.map((m) => (
                                <div key={m.month} className="text-center">
                                    <p className="text-xs font-bold text-teal-600">{m.winRate}%</p>
                                    <p className="text-xs text-slate-400 capitalize">{m.month}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Conversion by Source */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-5">🌐 Conversión por Fuente</h2>
                    <div className="space-y-3">
                        {conversionBySource.map((s) => (
                            <div key={s.source} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-700 w-24 truncate">{s.source}</span>
                                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-teal-500 to-sky-500 rounded-full" style={{ width: `${s.rate}%` }} />
                                </div>
                                <span className="text-xs font-bold text-teal-600 w-10 text-right">{s.rate}%</span>
                                <span className="text-xs text-slate-400 w-16 text-right">{s.converted}/{s.total} leads</span>
                            </div>
                        ))}
                        {conversionBySource.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Sin datos de conversión aún.</p>}
                    </div>
                </div>

                {/* Revenue by Stage + Sales Rep Leaderboard */}
                <div className="space-y-5">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">📊 Pipeline por Etapa</h2>
                        <div className="space-y-2">
                            {Object.entries(stageRevenue).map(([stage, value]) => (
                                <div key={stage} className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-slate-700">{STAGE_LABELS[stage] ?? stage}</span>
                                    <span className="font-black text-slate-900">${value.toLocaleString()}</span>
                                </div>
                            ))}
                            {Object.keys(stageRevenue).length === 0 && <p className="text-sm text-slate-400 text-center py-3">Sin datos aún.</p>}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">🏆 Leaderboard Ventas</h2>
                        <div className="space-y-3">
                            {salesReps.map((rep, i) => (
                                <div key={rep.name} className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-100 text-slate-600" : "bg-orange-50 text-orange-600"}`}>{i + 1}</span>
                                    <span className="flex-1 text-sm font-semibold text-slate-700 truncate">{rep.name}</span>
                                    <span className="text-xs text-slate-400">{rep.won} deals</span>
                                    <span className="text-sm font-black text-emerald-600">${(rep.value / 1000).toFixed(1)}k</span>
                                </div>
                            ))}
                            {salesReps.length === 0 && <p className="text-sm text-slate-400 text-center py-3">Asigna deals a tu equipo para ver el ranking.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Leads by Month */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6">👥 Volumen de Leads por Mes</h2>
                <div className="flex items-end gap-4 h-32">
                    {revenueByMonth.map((m) => (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-sky-600">{m.leads}</span>
                            <div className="w-full rounded-t-lg bg-gradient-to-t from-sky-500 to-sky-400" style={{ height: `${Math.max((m.leads / maxLeads) * 100, 4)}%` }} />
                            <span className="text-xs text-slate-400 capitalize">{m.month}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
