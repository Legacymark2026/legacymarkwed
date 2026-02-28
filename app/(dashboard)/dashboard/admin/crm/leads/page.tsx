import { Suspense } from "react";
import { getLeads } from "@/actions/crm";
import { prisma } from "@/lib/prisma";
import { LeadsTable } from "@/components/crm/leads-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, Target, Star } from "lucide-react";

export default async function LeadsPage() {
    const company = await prisma.company.findFirst();

    if (!company) {
        return (
            <div className="p-8 text-center">
                <p className="text-slate-500">No se encontró la empresa. Configura tu empresa primero.</p>
            </div>
        );
    }

    const [result, statusStats] = await Promise.all([
        getLeads(company.id, { pageSize: 100 }),
        prisma.lead.groupBy({ by: ["status"], _count: { status: true }, where: { companyId: company.id } }),
    ]);

    const leads = "error" in result ? [] : result.leads;
    const total = "error" in result ? 0 : result.total;

    const stats = [
        { label: "Total Leads", value: total, icon: <Users className="w-5 h-5" />, color: "text-sky-600", bg: "bg-sky-50" },
        { label: "Nuevos", value: statusStats.find((s) => s.status === "NEW")?._count.status ?? 0, icon: <Star className="w-5 h-5" />, color: "text-violet-600", bg: "bg-violet-50" },
        { label: "Calificados", value: statusStats.find((s) => s.status === "QUALIFIED")?._count.status ?? 0, icon: <Target className="w-5 h-5" />, color: "text-teal-600", bg: "bg-teal-50" },
        { label: "Convertidos", value: statusStats.find((s) => s.status === "CONVERTED")?._count.status ?? 0, icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900">Gestión de Leads</h1>
                <p className="text-slate-500 mt-1">Rastrea, califica y convierte cada lead en oportunidades de negocio.</p>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{s.value}</p>
                            <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <Suspense fallback={<LeadTableSkeleton />}>
                    <LeadsTable leads={leads as any} total={total} companyId={company.id} />
                </Suspense>
            </div>
        </div>
    );
}

function LeadTableSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
    );
}
