import { Suspense } from "react";
import { requireCompany } from "@/lib/company-utils";
import {
    getCRMStats,
    getRecentActivity,
    getSalesFunnel,
    getTopDeals,
    getHighPerformanceStats
} from "@/actions/crm";
import { KPICards } from "@/components/crm/kpi-cards";
import { RecentActivity } from "@/components/crm/recent-activity";
import { SalesFunnel } from "@/components/crm/sales-funnel";
import { TopDeals } from "@/components/crm/top-deals";
import { RevenueForecast } from "@/components/crm/revenue-forecast";
import { LeadSources } from "@/components/crm/lead-sources";
import { LostReasonChart } from "@/components/crm/lost-reason-chart";
import { SalesLeaderboard } from "@/components/crm/sales-leaderboard";
import { GoalProgress } from "@/components/crm/goal-progress";
import { QuickActions } from "@/components/crm/quick-actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Download, TrendingUp } from "lucide-react";
import { CRMExportButton } from "@/components/crm/export-button";
import { CRMEmptyState } from "@/components/crm/empty-state";
import { getRecentExecutions } from "@/actions/automation";
import { RecentAutomations } from "@/components/crm/recent-automations";

export default async function CRMDashboardPage() {
    // Get company ID
    const { companyId } = await requireCompany();

    // Fetch data in parallel
    const [stats, funnelData, activities, topDeals, advancedStats, executions] = await Promise.all([
        getCRMStats(),
        getSalesFunnel(),
        getRecentActivity(),
        getTopDeals(),
        getHighPerformanceStats(),
        getRecentExecutions(companyId)
    ]);

    if ('error' in stats || 'error' in advancedStats) {
        return <div className="p-8 text-red-500">Error loading CRM data</div>;
    }

    // Removed the early return for the total empty state so the user still sees
    // the header, KPI cards (even if 0), and basic UI structure.
    const isTotalEmpty = stats.activeDeals === 0 && topDeals.length === 0 && advancedStats.wonValue === 0;

    return (
        <div className="ds-page space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6"
                style={{ borderBottom: '1px solid var(--ds-border)' }}>
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <TrendingUp className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="ds-heading-page">CRM Command Center</h1>
                            <p className="ds-subtext mt-0.5">Pipeline de ventas · Leads · Deals · Actividad</p>
                        </div>
                    </div>
                    <div className="mt-3 ml-13">
                        <QuickActions companyId={companyId} />
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <CalendarDateRangePicker />
                    <CRMExportButton stats={stats} advancedStats={advancedStats} />
                </div>
            </div>

            <Suspense fallback={<DashboardSkeleton />}>
                {isTotalEmpty ? (
                    <div className="mt-8">
                        <CRMEmptyState
                            title="Bienvenido a tu CRM"
                            description="Comienza creando tu primer deal para ver las métricas de rendimiento."
                            actionLabel="Crear Primer Deal"
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <KPICards stats={stats} />

                        {/* ROW 1: Forecast & Goal */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <div className="col-span-4">
                                <RevenueForecast data={advancedStats.forecastData} />
                            </div>
                            <div className="col-span-3">
                                <GoalProgress
                                    wonValue={advancedStats.wonValue}
                                    monthlyTarget={advancedStats.monthlyTarget}
                                    progress={advancedStats.goalProgress}
                                />
                            </div>
                        </div>

                        {/* ROW 2: Automation & Funnel */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <div className="col-span-3">
                                <RecentAutomations data={executions} />
                            </div>
                            <div className="col-span-4">
                                <SalesFunnel data={funnelData} />
                            </div>
                        </div>

                        {/* ROW 3: Sources & Leaderboard */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <div className="col-span-3">
                                <LeadSources data={advancedStats.leadSources} />
                            </div>
                            <div className="col-span-4">
                                <SalesLeaderboard data={advancedStats.leaderboard} />
                            </div>
                        </div>

                        {/* ROW 4: Deals & Activity */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <div className="col-span-4">
                                <TopDeals deals={topDeals} />
                            </div>
                            <div className="col-span-3">
                                <RecentActivity activities={activities} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <div className="col-span-4">
                                <LostReasonChart data={advancedStats.lostReasons} />
                            </div>
                        </div>
                    </div>
                )}
            </Suspense>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-7">
                <Skeleton className="col-span-4 h-[350px]" />
                <Skeleton className="col-span-3 h-[350px]" />
            </div>
        </div>
    );
}
