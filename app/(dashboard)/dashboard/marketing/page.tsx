import { getMarketingKPIs, getAttributionStats, getRecentActivity } from "@/actions/marketing/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { AttributionChart } from "@/modules/marketing/components/attribution-chart";
import { DateRangePicker } from "@/modules/marketing/components/date-range-picker";

// Temp: Direct DB access for Company ID if not in session, though usually it is.
const prisma = new PrismaClient();

export default async function MarketingDashboardPage() {
    const session = await auth();
    if (!session?.user?.id) return redirect("/auth/login");

    // Get Company
    const companyUser = await prisma.companyUser.findFirst({
        where: { userId: session.user.id }
    });

    if (!companyUser) return <div>No company found.</div>;
    const companyId = companyUser.companyId;

    const kpis = await getMarketingKPIs(companyId);
    const attribution = await getAttributionStats(companyId);
    const recentEvents = await getRecentActivity(companyId);

    // Transform attribution data for chart if needed, but it matches { source, count }
    // We might need to ensure types match for recharts if strict.

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Marketing Command Center</h1>
                    <p className="text-muted-foreground">Real-time insights and performance tracking.</p>
                </div>
                <div className="flex gap-2">
                    <DateRangePicker />
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Leads (MoM)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{kpis.newLeads}</div>
                        <p className="text-xs text-muted-foreground">
                            Total: {kpis.totalLeads} leads
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ad Spend (Month)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${kpis.spend.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all platforms
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cost Per Lead (CPL)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${kpis.cpl.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Target: &lt; $15.00
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Traffic Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.totalEvents}</div>
                        <p className="text-xs text-muted-foreground">
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Attribution & Activities */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <AttributionChart data={attribution} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Channels</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {attribution.map((item) => (
                                <div key={item.source} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.source}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Best performing source
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">{item.count} Leads</div>
                                </div>
                            ))}
                            {attribution.length === 0 && (
                                <p className="text-sm text-muted-foreground">No data available yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Live Activity */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Live Activity Feed (Real-Time)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentEvents.map((event) => (
                            <div key={event.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                <div>
                                    <p className="text-sm font-medium">
                                        {event.eventType}
                                        {event.eventName && <span className="text-muted-foreground"> - {event.eventName}</span>}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {event.lead ? event.lead.email : (event.visitorId ? `Visitor ${event.visitorId.substring(0, 8)}...` : 'Anonymous')}
                                        &bull; {new Date(event.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {event.url}
                                </div>
                            </div>
                        ))}
                        {recentEvents.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Waiting for incoming traffic events...</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
