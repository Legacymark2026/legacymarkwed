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
    getTrafficData, getTrafficSources, getConversionFunnel, getChannelPerformance,
    getDeviceStats, getGeoStats, getTopPages, getBrowserOsStats, getRealtimeUsers,
    getRevenueStats, getChannelAttribution, getPageSpeedMetrics, getActivityHeatmap,
    getSessionDurationDistribution, getGoalsProgress, getQuickInsights,
    getSearchTerms, getSocialMetrics, getEngagementMetrics
} from "@/modules/analytics/actions/analytics";

export const metadata = {
    title: "Analítica Web | Dashboard Ultra-Profesional",
    description: "Métricas de rendimiento, tráfico y conversión en tiempo real.",
};

// Dark card wrapper — identical pattern to the home TechCard
function DarkCard({ children, className = "", code }: { children: React.ReactNode; className?: string; code?: string }) {
    return (
        <div className={`ds-card group relative ${className}`}>
            {code && <span className="absolute top-3 right-3 font-mono text-[8px] text-slate-700 uppercase tracking-widest">[{code}]</span>}
            {/* Teal bottom line on hover — same as home TechCard */}
            {children}
        </div>
    );
}

// Section header (mono HUD style)
function SectionHeader({ icon: Icon, label, sub }: { icon: any; label: string; sub?: string }) {
    return (
        <div className="flex items-center gap-2.5 mb-5">
            <div className="ds-icon-box w-7 h-7">
                <Icon size={13} strokeWidth={1.5} className="text-teal-400" />
            </div>
            <div>
                <p className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-[0.14em]">{label}</p>
                {sub && <p className="font-mono text-[8px] text-slate-700 uppercase tracking-widest mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default async function AnalyticsPage() {
    const trafficData = await getTrafficData(7);
    const trafficSources = await getTrafficSources(30);
    const funnelData = await getConversionFunnel();
    const seoData = await getChannelPerformance(6);
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
    const searchTermsData = await getSearchTerms();
    const socialMetricsData = await getSocialMetrics();
    const engagementData = await getEngagementMetrics();

    return (
        <div className="ds-page space-y-6">
            <TrackPageEvent eventName="ViewAnalytics" isCustom={true} />

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.025] pointer-events-none mix-blend-screen" />

            {/* ── Header ── */}
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-8"
                style={{ borderBottom: '1px solid rgba(30,41,59,0.8)' }}>
                <div>
                    <div className="mb-4">
                        <span className="ds-badge ds-badge-teal">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
                            </span>
                            ANL_SYS · LIVE DATA
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="ds-icon-box w-12 h-12">
                            <BarChart3 className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                            <h1 className="ds-heading-page">Analítica Avanzada</h1>
                            <p className="ds-subtext mt-2">Métricas de rendimiento · Tráfico · Conversión en tiempo real</p>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
                    <RealtimeIndicator count={activeUsers} />
                    <RefreshSelector />
                    <DateRangeSelector />
                    <ExportButton />
                    <ScheduleDialog />
                    <FullscreenButton />
                </div>
            </div>

            {/* Quick Insights */}
            <div className="relative z-10"><QuickInsights data={insightsData} /></div>

            {/* Overview */}
            <div className="relative z-10"><AnalyticsOverview /></div>

            {/* Period Comparison */}
            <div className="relative z-10"><PeriodComparison /></div>

            {/* Performance Score */}
            <DarkCard code="PERF_SCR">
                <SectionHeader icon={Gauge} label="Puntuación de Rendimiento" />
                <PerformanceScore />
            </DarkCard>

            {/* Main Charts */}
            <div className="grid gap-5 lg:grid-cols-2 relative z-10">
                <DarkCard code="TRF_WK">
                    <SectionHeader icon={TrendingUp} label="Tráfico Semanal" sub="Últimos 7 días" />
                    <TrafficChart data={trafficData} />
                </DarkCard>
                <DarkCard code="SEO_PAG">
                    <SectionHeader icon={BarChart3} label="SEO vs Pago" sub="Rendimiento por canal" />
                    <SeoMetrics data={seoData} />
                </DarkCard>
            </div>

            {/* Funnel & User Flow */}
            <div className="grid gap-5 lg:grid-cols-2 relative z-10">
                <DarkCard code="FNN_CNV">
                    <SectionHeader icon={Filter} label="Embudo de Conversión" />
                    <FunnelChartComponent data={funnelData} />
                </DarkCard>
                <DarkCard code="USR_FLW">
                    <SectionHeader icon={ArrowRight} label="User Flow" sub="Rutas de navegación" />
                    <UserFlow data={funnelData} />
                </DarkCard>
            </div>

            {/* Goals & Alerts */}
            <div className="grid gap-5 lg:grid-cols-2 relative z-10">
                <DarkCard code="GOALS">
                    <GoalsWidget data={goalsData as any} />
                </DarkCard>
                <DarkCard code="KPI_ALT">
                    <KpiAlerts />
                </DarkCard>
            </div>

            {/* Devices, Sources */}
            <div className="grid gap-5 lg:grid-cols-3 relative z-10">
                <DarkCard code="DEV_STS">
                    <SectionHeader icon={Monitor} label="Dispositivos" />
                    <DeviceChart data={deviceData} />
                </DarkCard>
                <DarkCard className="lg:col-span-2" code="TRF_SRC">
                    <SectionHeader icon={Globe} label="Fuentes de Tráfico" />
                    <TrafficSources data={trafficSources} />
                </DarkCard>
            </div>

            {/* Session & Bounce */}
            <div className="grid gap-5 lg:grid-cols-2 relative z-10">
                <DarkCard code="SESS_HG">
                    <SessionHistogram data={sessionDurationData} />
                </DarkCard>
                <DarkCard code="BNC_TRD">
                    <BounceTrend />
                </DarkCard>
            </div>

            {/* Geo Map */}
            <DarkCard code="GEO_MAP">
                <SectionHeader icon={MapPin} label="Distribución Geográfica" sub="Por país y región" />
                <GeoMap data={geoData} />
            </DarkCard>

            {/* Activity Heatmap */}
            <DarkCard code="ACT_HMP">
                <SectionHeader icon={Calendar} label="Actividad Anual" sub="Estilo GitHub" />
                <ActivityHeatmap data={heatmapData} />
            </DarkCard>

            {/* Top Pages */}
            <DarkCard code="TOP_PGS">
                <div className="flex items-center justify-between mb-4">
                    <SectionHeader icon={BarChart3} label="Top Páginas Visitadas" sub="Últimos 7 días" />
                </div>
                <TopPages data={topPagesData} />
            </DarkCard>

            {/* Live Visitors & Page Speed */}
            <div className="grid gap-5 lg:grid-cols-2 relative z-10">
                <DarkCard code="LIV_VIS">
                    <LiveVisitorsMap initialCount={activeUsers} />
                </DarkCard>
                <DarkCard code="PG_SPDS">
                    <PageSpeedMetrics data={pageSpeedData} />
                </DarkCard>
            </div>

            {/* Revenue & Attribution */}
            <div className="grid gap-5 lg:grid-cols-2 relative z-10">
                <DarkCard code="REV_TRK">
                    <RevenueTracker data={revenueData} />
                </DarkCard>
                <DarkCard code="CHN_ATR">
                    <ChannelAttribution data={attributionData} />
                </DarkCard>
            </div>

            {/* A/B & Annotations */}
            <div className="grid gap-5 lg:grid-cols-2 relative z-10">
                <DarkCard code="AB_TEST">
                    <ABTestResults />
                </DarkCard>
                <DarkCard code="ANNOT">
                    <AnnotationsTimeline />
                </DarkCard>
            </div>

            {/* Social */}
            <DarkCard code="SOC_MET">
                <SocialMediaMetrics data={socialMetricsData} />
            </DarkCard>

            {/* Search, Browser, Engagement */}
            <div className="grid gap-5 lg:grid-cols-3 relative z-10">
                <DarkCard code="SRCH_TM">
                    <SearchTermsCloud data={searchTermsData} />
                </DarkCard>
                <DarkCard code="BROW_OS">
                    <BrowserOsStats data={browserOsData} />
                </DarkCard>
                <DarkCard code="ENG_RDR">
                    <EngagementRadar data={engagementData} />
                </DarkCard>
            </div>
        </div>
    );
}
