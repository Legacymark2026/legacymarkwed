import { notFound } from "next/navigation";
import Link from "next/link";
import { getDealById, getTasks } from "@/actions/crm-advanced";
import { DealActivityTimeline } from "@/components/crm/deal-activity-timeline";
import { prisma } from "@/lib/prisma";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Clock, Tag, DollarSign, Calendar, User, AlertTriangle } from "lucide-react";

const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string; step: number }> = {
    NEW: { label: "Nuevo", color: "text-slate-600", bg: "bg-slate-100", step: 1 },
    QUALIFIED: { label: "Calificado", color: "text-sky-700", bg: "bg-sky-50", step: 2 },
    PROPOSAL: { label: "Propuesta", color: "text-violet-700", bg: "bg-violet-50", step: 3 },
    NEGOTIATION: { label: "Negociación", color: "text-amber-700", bg: "bg-amber-50", step: 4 },
    WON: { label: "Ganado ✓", color: "text-emerald-700", bg: "bg-emerald-50", step: 5 },
    LOST: { label: "Perdido", color: "text-red-700", bg: "bg-red-50", step: 5 },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
    LOW: { label: "Baja", color: "text-slate-500" },
    MEDIUM: { label: "Media", color: "text-amber-600" },
    HIGH: { label: "Alta", color: "text-orange-600" },
    URGENT: { label: "Urgente", color: "text-red-600" },
};

export default async function DealDetailPage({ params }: { params: { id: string } }) {
    const [result, company] = await Promise.all([getDealById(params.id), prisma.company.findFirst()]);
    if ("error" in result || !result.deal) return notFound();
    const { deal } = result;

    const stage = STAGE_CONFIG[deal.stage] ?? STAGE_CONFIG["NEW"];
    const priority = PRIORITY_CONFIG[deal.priority] ?? PRIORITY_CONFIG["MEDIUM"];
    const daysSinceActivity = differenceInDays(new Date(), deal.lastActivity ?? deal.updatedAt);
    const isStagnant = daysSinceActivity > 14 && !["WON", "LOST"].includes(deal.stage);

    const STAGES = ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON"];
    const currentStep = stage.step;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sticky Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center gap-4 flex-wrap">
                    <Link href="/dashboard/admin/crm/pipeline" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Pipeline
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-sm font-semibold text-slate-900 truncate max-w-xs">{deal.title}</span>
                    <div className="ml-auto flex items-center gap-2">
                        {isStagnant && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-700">
                                <AlertTriangle className="w-3 h-3" /> {daysSinceActivity}d sin actividad
                            </div>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${stage.bg} ${stage.color}`}>{stage.label}</span>
                    </div>
                </div>
            </div>

            {/* Stage Progress Bar */}
            <div className="bg-white border-b border-slate-50 px-6 py-3">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-0">
                        {STAGES.map((s, i) => {
                            const cfg = STAGE_CONFIG[s];
                            const isActive = cfg.step === currentStep && !["WON", "LOST"].includes(deal.stage);
                            const isPast = cfg.step < currentStep;
                            const isWon = deal.stage === "WON" && s === "WON";
                            return (
                                <div key={s} className="flex items-center flex-1">
                                    <div className={`flex-1 text-center py-2 text-xs font-bold transition-all rounded-lg ${isWon ? "bg-emerald-500 text-white" : isActive ? "bg-teal-500 text-white" : isPast ? "bg-teal-100 text-teal-700" : "bg-slate-50 text-slate-400"}`}>
                                        {cfg.label.replace(" ✓", "")}
                                    </div>
                                    {i < STAGES.length - 1 && <div className={`w-4 h-0.5 ${isPast ? "bg-teal-300" : "bg-slate-100"}`} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── LEFT: Main Info ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Deal Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-teal-400 via-sky-400 to-violet-500" />
                        <div className="p-7">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-teal-200">
                                    <DollarSign className="w-7 h-7" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl font-black text-slate-900 leading-tight">{deal.title}</h1>
                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                        <span className="text-3xl font-black text-teal-600">${deal.value.toLocaleString()}</span>
                                        <span className={`text-xs font-bold ${priority.color}`}>● {priority.label} prioridad</span>
                                        <span className="text-xs text-slate-400 font-medium">{deal.probability}% prob.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            {(deal.contactName || deal.contactEmail) && (
                                <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-sky-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {(deal.contactName || deal.contactEmail || "?")[0].toUpperCase()}
                                    </div>
                                    <div>
                                        {deal.contactName && <p className="font-bold text-slate-900 text-sm">{deal.contactName}</p>}
                                        {deal.contactEmail && <a href={`mailto:${deal.contactEmail}`} className="text-xs text-teal-600 hover:underline">{deal.contactEmail}</a>}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {deal.notes && (
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                    <p className="text-xs font-bold text-amber-700 mb-1.5">📝 Notas</p>
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{deal.notes}</p>
                                </div>
                            )}

                            {/* Tags */}
                            {deal.tags.length > 0 && (
                                <div className="mt-4 flex items-center gap-2 flex-wrap">
                                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                                    {deal.tags.map((tag) => <span key={tag} className="px-2.5 py-1 text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100 rounded-full">{tag}</span>)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-5">📅 Actividad del Deal</h2>
                        <DealActivityTimeline dealId={deal.id} activities={deal.activities as any} />
                    </div>
                </div>

                {/* ── RIGHT: Sidebar ── */}
                <div className="space-y-5">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Valor", value: `$${deal.value.toLocaleString()}`, icon: "💰", color: "bg-teal-50 text-teal-700" },
                            { label: "Probabilidad", value: `${deal.probability}%`, icon: "🎯", color: "bg-violet-50 text-violet-700" },
                        ].map((k) => (
                            <div key={k.label} className={`${k.color} rounded-2xl p-4 border border-white`}>
                                <p className="text-xl">{k.icon}</p>
                                <p className="text-lg font-black mt-1">{k.value}</p>
                                <p className="text-xs opacity-70 font-medium">{k.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Meta Details */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Detalles</h3>
                        {[
                            { icon: <Calendar className="w-4 h-4" />, label: "Cierre esperado", value: deal.expectedClose ? format(new Date(deal.expectedClose), "d MMM yyyy", { locale: es }) : "—" },
                            { icon: <Clock className="w-4 h-4" />, label: "Actualizado", value: formatDistanceToNow(new Date(deal.updatedAt), { addSuffix: true, locale: es }) },
                            { icon: <Clock className="w-4 h-4" />, label: "Creado", value: format(new Date(deal.createdAt), "d MMM yyyy", { locale: es }) },
                            { icon: <User className="w-4 h-4" />, label: "Asignado a", value: deal.assignedUser?.name ?? "Sin asignar" },
                            { icon: <Tag className="w-4 h-4" />, label: "Fuente", value: deal.source ?? "—" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-3">
                                <span className="text-slate-400">{item.icon}</span>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{item.label}</p>
                                    <p className="text-sm font-semibold text-slate-700">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Lost Reason */}
                    {deal.stage === "LOST" && deal.lostReason && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                            <p className="text-xs font-bold text-red-700 mb-1">Razón de pérdida</p>
                            <p className="text-sm text-red-600">{deal.lostReason}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
