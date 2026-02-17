import { Suspense } from "react";
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
import { Download } from "lucide-react";
import { CRMExportButton } from "@/components/crm/export-button";
import { CRMEmptyState } from "@/components/crm/empty-state";
import { getRecentExecutions } from "@/actions/automation";
import { RecentAutomations } from "@/components/crm/recent-automations";

export default async function CRMDashboardPage() {
    // Fetch data in parallel
    const [stats, funnelData, activities, topDeals, advancedStats, executions] = await Promise.all([
        getCRMStats(),
        getSalesFunnel(),
        getRecentActivity(),
        getTopDeals(),
        getHighPerformanceStats(),
        getRecentExecutions()
    ]);

    if ('error' in stats || 'error' in advancedStats) {
        return <div className="p-8 text-red-500">Error loading CRM data</div>;
    }

    // Check for total empty state (no deals at all)
    if (stats.activeDeals === 0 && topDeals.length === 0 && advancedStats.wonValue === 0) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">CRM Command Center</h2>
                </div>
                <CRMEmptyState
                    title="Bienvenido a tu CRM"
                    description="Comienza creando tu primer deal para ver las métricas de rendimiento."
                    actionLabel="Crear Primer Deal"
                />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">CRM Command Center</h2>
                    <div className="mt-1">
                        <QuickActions />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <CalendarDateRangePicker />
                    <CRMExportButton stats={stats} advancedStats={advancedStats} />
                </div>
            </div>

            <Suspense fallback={<DashboardSkeleton />}>
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
