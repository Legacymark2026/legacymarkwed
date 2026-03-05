import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, MousePointerClick, TrendingUp, Users } from "lucide-react";

interface MetricsProps {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    cpa: number;
}

export default function CampaignMetricsCards({ metrics }: { metrics: MetricsProps }) {

    // Formatting helpers
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Ad Spend</p>
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-bold tracking-tighter">{formatCurrency(metrics.totalSpend)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Live synced from Meta & Google
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Impressions</p>
                        <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold tracking-tighter">{formatNumber(metrics.totalImpressions)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Across all active networks
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Clicks</p>
                        <MousePointerClick className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="text-3xl font-bold tracking-tighter">{formatNumber(metrics.totalClicks)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Aggregated from live endpoints
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-indigo-50/50 border-indigo-100">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Avg. CPA (Conversions)</p>
                        <TrendingUp className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="text-3xl font-bold tracking-tighter text-indigo-900">{formatCurrency(metrics.cpa)}</div>
                        <div className="text-sm font-medium text-indigo-600 mb-1">({formatNumber(metrics.totalConversions)} leads)</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
