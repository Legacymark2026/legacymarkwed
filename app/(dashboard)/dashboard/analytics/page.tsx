import { AnalyticsOverview } from "@/modules/analytics/components/overview";
import { TrafficChart } from "@/modules/analytics/components/traffic-chart";
import { SeoMetrics } from "@/modules/analytics/components/seo-metrics";
import { TrackPageEvent } from "@/modules/analytics/components/track-page-event";
import { DeviceChart } from "@/modules/analytics/components/device-chart";
import { TopPages } from "@/modules/analytics/components/top-pages";
import { TrafficSources } from "@/modules/analytics/components/traffic-sources";
import { DateRangeSelector } from "@/modules/analytics/components/date-range-selector";
import { RealtimeIndicator } from "@/modules/analytics/components/realtime-indicator";
import { PeriodComparison } from "@/modules/analytics/components/period-comparison";
import { ActivityHeatmap } from "@/modules/analytics/components/activity-heatmap";
import { FunnelChartComponent } from "@/modules/analytics/components/funnel-chart";
import { ExportButton } from "@/modules/analytics/components/export-button";
import { ScheduleDialog } from "@/modules/analytics/components/schedule-dialog";
import { GeoMap } from "@/modules/analytics/components/geo-map";
import { GoalsWidget } from "@/modules/analytics/components/goals-widget";
import { PerformanceScore } from "@/modules/analytics/components/performance-score";
import { KpiAlerts } from "@/modules/analytics/components/kpi-alerts";
import { QuickInsights } from "@/modules/analytics/components/quick-insights";
import { SessionHistogram } from "@/modules/analytics/components/session-histogram";
import { BounceTrend } from "@/modules/analytics/components/bounce-trend";
import { UserFlow } from "@/modules/analytics/components/user-flow";
import { ThemeToggle } from "@/modules/analytics/components/theme-toggle";
import { FullscreenButton } from "@/modules/analytics/components/fullscreen-button";
import { RefreshSelector } from "@/modules/analytics/components/refresh-selector";
// New 10 Components
import { LiveVisitorsMap } from "@/modules/analytics/components/live-visitors-map";
import { PageSpeedMetrics } from "@/modules/analytics/components/page-speed-metrics";
import { AnnotationsTimeline } from "@/modules/analytics/components/annotations-timeline";
import { ChannelAttribution } from "@/modules/analytics/components/channel-attribution";
import { RevenueTracker } from "@/modules/analytics/components/revenue-tracker";
import { ABTestResults } from "@/modules/analytics/components/ab-test-results";
import { SearchTermsCloud } from "@/modules/analytics/components/search-terms-cloud";
import { BrowserOsStats } from "@/modules/analytics/components/browser-os-stats";
import { SocialMediaMetrics } from "@/modules/analytics/components/social-media-metrics";
import { EngagementRadar } from "@/modules/analytics/components/engagement-radar";
import {
    TrendingUp, Globe, Monitor, BarChart3, Target, Gauge,
    Calendar, MapPin, Sparkles, Activity, Filter, ArrowRight,
    DollarSign, FlaskConical, Search, Share2, MessageSquare, Zap
} from "lucide-react";
import {
    getTrafficData,
    getTrafficSources,
    getConversionFunnel,
    getChannelPerformance,
    getDeviceStats,
    getGeoStats,
    getTopPages,
    getBrowserOsStats,
    getRealtimeUsers,
    getRevenueStats,
    getChannelAttribution,
    getPageSpeedMetrics,
    getActivityHeatmap,
    getSessionDurationDistribution,
    getGoalsProgress, // Fetched from DB
    getQuickInsights,
    getSearchTerms,
    getSocialMetrics,
    getEngagementMetrics
} from "@/modules/analytics/actions/analytics";

export const metadata = {
    title: "Analítica Web | Dashboard Ultra-Profesional",
    description: "Métricas de rendimiento, tráfico y conversión en tiempo real.",
};

export default async function AnalyticsPage() {
    // Fetch real data
    const trafficData = await getTrafficData(7); // Last 7 days
    const trafficSources = await getTrafficSources(30);
    const funnelData = await getConversionFunnel();
    const seoData = await getChannelPerformance(6); // Last 6 months
    const deviceData = await getDeviceStats(30);
    const geoData = await getGeoStats(30);
    const topPagesData = await getTopPages(10, 30);
    const browserOsData = await getBrowserOsStats(30);
    const activeUsers = await getRealtimeUsers();
    const revenueData = await getRevenueStats();
    const attributionData = await getChannelAttribution();
    const pageSpeedData = await getPageSpeedMetrics();
    const heatmapData = await getActivityHeatmap();
    const sessionDurationData = await getSessionDurationDistribution();
    const goalsData = await getGoalsProgress();
    const insightsData = await getQuickInsights();

    // Secondary Metrics - Real Data
    const searchTermsData = await getSearchTerms();
    const socialMetricsData = await getSocialMetrics();
    const engagementData = await getEngagementMetrics();

    return (
        <div className="space-y-6 pb-10">
            <TrackPageEvent eventName="ViewAnalytics" isCustom={true} />

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Analítica Avanzada
                        </h1>
                        <p className="text-gray-500 mt-1">Dashboard ultra-profesional con métricas en tiempo real.</p>
                    </div>
                    <RealtimeIndicator count={activeUsers} />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <RefreshSelector />
                    <DateRangeSelector />
                    <ExportButton />
                    <ScheduleDialog />
                    <FullscreenButton />
                    <ThemeToggle />
                </div>
            </div>

            {/* Quick Insights - AI Powered */}
            <QuickInsights data={insightsData} />

            {/* Overview Cards with Sparklines */}
            <AnalyticsOverview />

            {/* Period Comparison */}
            <PeriodComparison />

            {/* Performance Score */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                        <Gauge className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Puntuación de Rendimiento</h3>
                </div>
                <PerformanceScore />
            </div>

            {/* Main Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-violet-100 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-violet-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Tráfico Semanal</h3>
                    </div>
                    <TrafficChart data={trafficData} />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <BarChart3 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">SEO vs Pago</h3>
                    </div>
                    <SeoMetrics data={seoData} />
                </div>
            </div>

            {/* Funnel and User Flow */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Filter className="h-4 w-4 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Embudo de Conversión</h3>
                    </div>
                    <FunnelChartComponent data={funnelData} />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <UserFlow data={funnelData} />
                </div>
            </div>

            {/* Goals and KPI Alerts */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <GoalsWidget data={goalsData as any} />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <KpiAlerts />
                </div>
            </div>

            {/* Devices, Traffic Sources, Session Histogram */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                            <Monitor className="h-4 w-4 text-cyan-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Dispositivos</h3>
                    </div>
                    <DeviceChart data={deviceData} />
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Globe className="h-4 w-4 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Fuentes de Tráfico</h3>
                    </div>
                    <TrafficSources data={trafficSources} />
                </div>
            </div>

            {/* Session Histogram and Bounce Trend */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <SessionHistogram data={sessionDurationData} />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <BounceTrend />
                </div>
            </div>

            {/* Geographic Map */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <MapPin className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Distribución Geográfica</h3>
                </div>
                <GeoMap data={geoData} />
            </div>

            {/* Activity Heatmap */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-teal-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Actividad Anual</h3>
                    <span className="text-xs text-gray-500 ml-2">Estilo GitHub</span>
                </div>
                <ActivityHeatmap data={heatmapData} />
            </div>

            {/* Top Pages Table */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Top Páginas Visitadas</h3>
                    </div>
                    <span className="text-sm text-gray-500">Últimos 7 días</span>
                </div>
                <TopPages data={topPagesData} />
            </div>

            {/* ========== NEW 10 FEATURES SECTION ========== */}

            {/* Live Visitors Map & Page Speed */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <LiveVisitorsMap initialCount={activeUsers} />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <PageSpeedMetrics data={pageSpeedData} />
                </div>
            </div>

            {/* Revenue Tracker & Channel Attribution */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <RevenueTracker data={revenueData} />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <ChannelAttribution data={attributionData} />
                </div>
            </div>

            {/* A/B Test Results & Annotations Timeline */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <ABTestResults />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <AnnotationsTimeline />
                </div>
            </div>

            {/* Social Media Metrics */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <SocialMediaMetrics data={socialMetricsData} />
            </div>

            {/* Search Terms, Browser Stats, Engagement Radar */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <SearchTermsCloud data={searchTermsData} />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <BrowserOsStats data={browserOsData} />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <EngagementRadar data={engagementData} />
                </div>
            </div>
        </div>
    );
}
