import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ConvertToDealDialog } from "@/components/crm/convert-to-deal-dialog";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Mail, Phone, Globe, MapPin, Tag, Calendar, TrendingUp } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    NEW: { label: "Nuevo", color: "text-sky-700", bg: "bg-sky-50 border-sky-200" },
    CONTACTED: { label: "Contactado", color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
    QUALIFIED: { label: "Calificado", color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
    CONVERTED: { label: "Convertido", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    LOST: { label: "Perdido", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

const SOURCE_ICONS: Record<string, string> = {
    GOOGLE: "🔍", FACEBOOK: "📘", INSTAGRAM: "📷", LINKEDIN: "💼",
    REFERRAL: "🤝", DIRECT: "🌐", EMAIL: "✉️", TIKTOK: "🎵", ORGANIC: "🌱",
};

interface PageProps { params: Promise<{ id: string }> }

export default async function LeadDetailPage(props: PageProps) {
    const params = await props.params;
    // Direct Prisma query — no server action intermediary to hide errors
    let lead;
    let company;
    let conversations: { id: string; channel: string; status: string }[] = [];
    let marketingEvents: { id: string; eventType: string; eventName: string | null; url: string | null; createdAt: Date }[] = [];

    try {
        [lead, company] = await Promise.all([
            prisma.lead.findUnique({
                where: { id: params.id },
                include: {
                    campaign: { select: { id: true, name: true, platform: true, code: true } },
                },
            }),
            prisma.company.findFirst(),
        ]);
    } catch (err) {
        console.error("[LeadDetailPage] Core query failed:", err);
        return notFound();
    }

    if (!lead) return notFound();

    // Optional relations — fetched separately so they never cause a 404
    try {
        conversations = await prisma.conversation.findMany({
            where: { leadId: params.id },
            take: 5,
            orderBy: { updatedAt: "desc" },
            select: { id: true, channel: true, status: true },
        });
    } catch (err) { console.warn("[LeadDetailPage] conversations query failed:", err); }

    try {
        marketingEvents = await prisma.marketingEvent.findMany({
            where: { leadId: params.id },
            take: 10,
            orderBy: { createdAt: "desc" },
            select: { id: true, eventType: true, eventName: true, url: true, createdAt: true },
        });
    } catch (err) { console.warn("[LeadDetailPage] marketingEvents query failed:", err); }

    const status = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG["NEW"];
    const scoreColor = lead.score >= 70 ? "from-emerald-500 to-teal-500" : lead.score >= 40 ? "from-amber-500 to-orange-500" : "from-red-500 to-rose-500";

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center gap-4">
                    <Link href="/dashboard/admin/crm/leads" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Leads
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-sm font-semibold text-slate-900">{lead.name || lead.email}</span>
                    <div className="ml-auto">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.color}`}>{status.label}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── LEFT: Main Info ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Identity Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-teal-400 via-sky-500 to-violet-500" />
                        <div className="p-6">
                            <div className="flex items-start gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-sky-500 flex items-center justify-center text-white font-black text-2xl flex-shrink-0 shadow-lg shadow-teal-200">
                                    {(lead.name || lead.email)[0].toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-2xl font-black text-slate-900">{lead.name || "Sin nombre"}</h1>
                                    {lead.jobTitle && <p className="text-slate-500 font-medium">{lead.jobTitle}</p>}
                                    {lead.company && <p className="text-sm text-slate-400 mt-0.5">🏢 {lead.company}</p>}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {lead.email && (
                                            <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 rounded-xl border border-slate-200 hover:border-teal-300 hover:text-teal-700 transition-all">
                                                <Mail className="w-3.5 h-3.5" /> {lead.email}
                                            </a>
                                        )}
                                        {lead.phone && (
                                            <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 rounded-xl border border-slate-200 hover:border-teal-300 hover:text-teal-700 transition-all">
                                                <Phone className="w-3.5 h-3.5" /> {lead.phone}
                                            </a>
                                        )}
                                        {lead.phone && (
                                            <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all">
                                                💬 WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {lead.message && (
                                <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mensaje</p>
                                    <p className="text-sm text-slate-700 leading-relaxed">{lead.message}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* UTM Attribution */}
                    {(lead.utmSource || lead.utmCampaign || lead.utmMedium || lead.source) && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-teal-500" /> Atribución de Campaña
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    { label: "Fuente", value: lead.source, icon: SOURCE_ICONS[lead.source] ?? "🌐" },
                                    { label: "UTM Source", value: lead.utmSource },
                                    { label: "UTM Medium", value: lead.utmMedium },
                                    { label: "UTM Campaign", value: lead.utmCampaign },
                                    { label: "UTM Term", value: lead.utmTerm },
                                    { label: "Landing Page", value: lead.landingPage },
                                ].filter((i) => i.value).map((item) => (
                                    <div key={item.label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {item.icon && <span className="mr-1">{item.icon}</span>}{item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            {(lead as any).campaign && (
                                <div className="mt-4 flex items-center gap-3 p-3 bg-violet-50 border border-violet-100 rounded-xl">
                                    <span className="text-xl">📊</span>
                                    <div>
                                        <p className="text-xs font-bold text-violet-700">Campaña Vinculada</p>
                                        <p className="text-sm font-bold text-slate-900">{(lead as any).campaign.name} <span className="text-xs font-mono text-slate-400">({(lead as any).campaign.platform})</span></p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Form Data */}
                    {lead.formData && Object.keys(lead.formData as Record<string, unknown>).length > 0 && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-5">📋 Datos del Formulario</h2>
                            <div className="divide-y divide-slate-50">
                                {Object.entries(lead.formData as Record<string, unknown>).map(([k, v]) => (
                                    <div key={k} className="py-2.5 flex items-start gap-4">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-32 flex-shrink-0 pt-0.5">{k}</span>
                                        <span className="text-sm text-slate-900">{String(v)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Conversations */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-5">💬 Conversaciones & Actividad</h2>
                        {conversations.length > 0 ? (
                            <div className="space-y-2">
                                {conversations.map((conv) => (
                                    <Link key={conv.id} href={`/dashboard/inbox/${conv.id}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <span className="text-sm font-bold text-slate-700">{conv.channel}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${conv.status === "OPEN" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>{conv.status}</span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-sm">No hay conversaciones aún para este lead.</p>
                                <p className="text-xs mt-1">Convierte este lead en un Deal para registrar notas, llamadas y emails.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: Sidebar ── */}
                <div className="space-y-5">
                    {/* Score Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-teal-500" /> Score
                            </h3>
                            <span className="text-3xl font-black text-slate-900">{lead.score}</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                            <div className={`h-full rounded-full bg-gradient-to-r ${scoreColor} transition-all`} style={{ width: `${Math.max(lead.score, 3)}%` }} />
                        </div>
                        <p className="text-xs text-slate-400 text-right">{lead.score >= 70 ? "🟢 Lead caliente" : lead.score >= 40 ? "🟡 Lead tibio" : "🔴 Lead frío"}</p>
                    </div>

                    {/* Actions */}
                    {company && lead.status !== "CONVERTED" && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Acciones</h3>
                            <ConvertToDealDialog leadId={lead.id} leadName={lead.name || "Lead"} leadEmail={lead.email} companyId={company.id} />
                            <div className="mt-3 flex flex-col gap-2">
                                <a href={`mailto:${lead.email}`} className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
                                    <Mail className="w-4 h-4" /> Enviar Email
                                </a>
                                {lead.phone && (
                                    <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors text-emerald-700">
                                        💬 WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Meta Details */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Detalles</h3>
                        {[
                            { icon: <Calendar className="w-4 h-4" />, label: "Creado", value: format(new Date(lead.createdAt), "d MMM yyyy · HH:mm", { locale: es }) },
                            { icon: <Calendar className="w-4 h-4" />, label: "Actualizado", value: formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true, locale: es }) },
                            { icon: <MapPin className="w-4 h-4" />, label: "País", value: lead.country || "—" },
                            { icon: <MapPin className="w-4 h-4" />, label: "Ciudad", value: lead.city || "—" },
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

                    {/* Tags */}
                    {lead.tags.length > 0 && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-teal-500" /> Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {lead.tags.map((tag) => (
                                    <span key={tag} className="px-2.5 py-1 text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100 rounded-full">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Marketing Events */}
                    {marketingEvents.length > 0 && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">📈 Eventos</h3>
                            <div className="space-y-2">
                                {marketingEvents.map((ev) => (
                                    <div key={ev.id} className="flex items-center gap-2 text-xs">
                                        <span className="font-bold text-slate-600">{ev.eventType}</span>
                                        {ev.eventName && <span className="text-slate-400">· {ev.eventName}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
