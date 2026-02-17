import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Clock, Activity, ArrowUpRight, ArrowDownRight, Eye, MousePointerClick } from "lucide-react";
import { getAnalyticsOverview } from "@/modules/analytics/actions/analytics";

// Format numbers with K/M suffixes
function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Format duration in seconds to human readable
function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

export async function AnalyticsOverview() {
    const data = await getAnalyticsOverview(30);

    const metrics = [
        {
            title: "Visitantes Únicos",
            value: formatNumber(data.visitors),
            change: `${data.trends.visitors >= 0 ? '+' : ''}${data.trends.visitors}%`,
            trend: data.trends.visitors >= 0 ? "up" : "down",
            description: "últimos 30 días",
            icon: Users,
            gradient: "from-violet-500 to-purple-600",
            iconBg: "bg-violet-100",
            iconColor: "text-violet-600",
        },
        {
            title: "Sesiones",
            value: formatNumber(data.sessions),
            change: `${data.trends.sessions >= 0 ? '+' : ''}${data.trends.sessions}%`,
            trend: data.trends.sessions >= 0 ? "up" : "down",
            description: "últimos 30 días",
            icon: Activity,
            gradient: "from-blue-500 to-cyan-500",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            title: "Páginas Vistas",
            value: formatNumber(data.pageViews),
            change: `${data.pagesPerSession} págs/sesión`,
            trend: "up",
            description: "engagement",
            icon: Eye,
            gradient: "from-emerald-500 to-teal-500",
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-600",
        },
        {
            title: "Tasa de Rebote",
            value: `${data.bounceRate}%`,
            change: `${data.trends.bounceRate >= 0 ? '+' : ''}${data.trends.bounceRate}%`,
            trend: data.trends.bounceRate <= 0 ? "up" : "down", // Lower bounce is better
            description: data.trends.bounceRate <= 0 ? "mejorando" : "necesita atención",
            icon: MousePointerClick,
            gradient: data.trends.bounceRate <= 0 ? "from-emerald-500 to-green-500" : "from-orange-500 to-red-500",
            iconBg: data.trends.bounceRate <= 0 ? "bg-emerald-100" : "bg-orange-100",
            iconColor: data.trends.bounceRate <= 0 ? "text-emerald-600" : "text-orange-600",
        },
        {
            title: "Duración Promedio",
            value: formatDuration(data.avgDuration),
            change: "por sesión",
            trend: "up",
            description: "tiempo en el sitio",
            icon: Clock,
            gradient: "from-pink-500 to-rose-500",
            iconBg: "bg-pink-100",
            iconColor: "text-pink-600",
        },
        {
            title: "Conversiones",
            value: data.conversions.toString(),
            change: `${data.conversionRate}%`,
            trend: data.trends.conversions >= 0 ? "up" : "down",
            description: "tasa de conversión",
            icon: TrendingUp,
            gradient: "from-amber-500 to-yellow-500",
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {metrics.map((metric, index) => (
                <Card
                    key={metric.title}
                    className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-gray-900"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    {/* Gradient background overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {metric.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${metric.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                            <metric.icon className={`h-4 w-4 ${metric.iconColor}`} />
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                {metric.value}
                            </span>
                            <span className={`flex items-center text-xs font-medium ${metric.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                                }`}>
                                {metric.trend === 'up' ? (
                                    <ArrowUpRight className="h-3 w-3" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3" />
                                )}
                                {metric.change}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {metric.description}
                        </p>

                        {/* Animated bottom border */}
                        <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${metric.gradient} w-0 group-hover:w-full transition-all duration-500`} />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
