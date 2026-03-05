import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ConvertToDealDialog } from "@/components/crm/convert-to-deal-dialog";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, MapPin, Tag, Calendar, Globe } from "lucide-react";
import { auth } from "@/lib/auth";
import { Permission, ROLE_PERMISSIONS, UserRole } from "@/types/auth";

// New specialized components
import { LeadProfileHeader } from "@/components/crm/lead-profile-header";
import { LeadStatusSelector } from "@/components/crm/lead-status-selector";
import { LeadTagsEditor } from "@/components/crm/lead-tags-editor";
import { LeadUnifiedTimeline, LeadUnifiedTimelineSkeleton } from "@/components/crm/lead-unified-timeline";
import { LeadStickyActions } from "@/components/crm/lead-sticky-actions";
import { LeadDeleteButton } from "@/components/crm/lead-delete-button";

const SOURCE_ICONS: Record<string, string> = {
    GOOGLE: "🔍", FACEBOOK: "📘", INSTAGRAM: "📷", LINKEDIN: "💼",
    REFERRAL: "🤝", DIRECT: "🌐", EMAIL: "✉️", TIKTOK: "🎵", ORGANIC: "🌱",
};

interface PageProps { params: Promise<{ id: string }> }

export default async function LeadDetailPage(props: PageProps) {
    const params = await props.params;

    // Direct Prisma query for core Lead + Company
    let lead;
    let company;

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

    const session = await auth();
    const role = session?.user?.role as UserRole;
    const canManageLeads = Boolean(session?.user?.permissions?.includes(Permission.MANAGE_LEADS) || (role && ROLE_PERMISSIONS[role]?.includes(Permission.MANAGE_LEADS)));

    return (
        <div className="min-h-screen bg-slate-50 relative">
            {/* Sticky Actions */}
            <LeadStickyActions
                leadName={lead.name || "Sin nombre"}
                leadEmail={lead.email}
                leadPhone={lead.phone}
            >
                <div className="scale-90 origin-right">
                    <LeadStatusSelector leadId={lead.id} initialStatus={lead.status} isMobile={true} canManageLeads={canManageLeads} />
                </div>
            </LeadStickyActions>

            {/* Top Breadcrumbs */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/admin/crm/leads" className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <span className="text-sm font-bold text-slate-800 hidden sm:inline-block">Detalles del Lead</span>
                    </div>
                    {/* Header Action */}
                    <div className="flex items-center gap-2">
                        {canManageLeads && <LeadDeleteButton leadId={lead.id} />}
                        <ConvertAction lead={lead} company={company} canManageLeads={canManageLeads} />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── LEFT: Main Info & Timeline ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Glassmorphism Profile Header */}
                    <LeadProfileHeader lead={lead} canManageLeads={canManageLeads}>
                        <LeadStatusSelector leadId={lead.id} initialStatus={lead.status} canManageLeads={canManageLeads} />
                        <div className="mt-1">
                            <LeadTagsEditor leadId={lead.id} initialTags={lead.tags} />
                        </div>
                    </LeadProfileHeader>

                    {/* Unified Timeline with Suspense */}
                    <Suspense fallback={<LeadUnifiedTimelineSkeleton />}>
                        <LeadUnifiedTimeline
                            leadId={lead.id}
                            createdAt={lead.createdAt}
                            formData={lead.formData}
                            source={lead.source}
                        />
                    </Suspense>
                </div>

                {/* ── RIGHT: Sidebar Metadata ── */}
                <div className="space-y-6">
                    {/* UTM Attribution */}
                    {(lead.utmSource || lead.utmCampaign || lead.utmMedium || lead.source) && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-teal-500" /> Atribución
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: "Fuente", value: lead.source, icon: SOURCE_ICONS[lead.source] ?? "🌐" },
                                    { label: "UTM Source", value: lead.utmSource },
                                    { label: "UTM Medium", value: lead.utmMedium },
                                    { label: "UTM Campaign", value: lead.utmCampaign },
                                    { label: "UTM Term", value: lead.utmTerm },
                                    { label: "Landing Page", value: lead.landingPage },
                                ].filter((i) => i.value).map((item) => (
                                    <div key={item.label} className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                                        <p className="text-sm font-bold text-slate-900 truncate" title={item.value as string}>
                                            {item.icon && <span className="mr-1">{item.icon}</span>}{item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            {(lead as any).campaign && (
                                <div className="mt-5 flex items-center gap-3 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl">
                                    <span className="text-2xl drop-shadow-sm">📈</span>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-violet-500 tracking-wider">Campaña Vinculada</p>
                                        <p className="text-sm font-black text-slate-900">{(lead as any).campaign.name} <span className="text-xs font-mono text-slate-400 font-medium">({(lead as any).campaign.platform})</span></p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-5">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Detalles Internos</h3>
                        {[
                            { icon: <Calendar className="w-4 h-4" />, label: "Creado", value: format(new Date(lead.createdAt), "d MMM yyyy · HH:mm", { locale: es }) },
                            { icon: <Calendar className="w-4 h-4" />, label: "Actualizado", value: formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true, locale: es }) },
                            { icon: <MapPin className="w-4 h-4" />, label: "País", value: lead.country || "Desconocido" },
                            { icon: <MapPin className="w-4 h-4" />, label: "Ciudad", value: lead.city || "Desconocida" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-4 group">
                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500 transition-colors">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{item.label}</p>
                                    <p className="text-sm font-semibold text-slate-700">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Small helper for the Convert To Deal action
function ConvertAction({ lead, company, canManageLeads }: { lead: any; company: any; canManageLeads: boolean }) {
    if (!company || lead.status === "CONVERTED" || !canManageLeads) return null;

    return (
        <ConvertToDealDialog
            leadId={lead.id}
            leadName={lead.name || "Lead"}
            leadEmail={lead.email}
            companyId={company.id}
        />
    );
}
