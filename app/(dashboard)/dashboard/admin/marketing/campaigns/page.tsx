export const dynamic = 'force-dynamic';

import { getCampaignsList, getAggregatedSpend } from "@/actions/marketing";
import CampaignsDashboardClient from "@/components/marketing/CampaignsDashboardClient";
import CampaignMetricsCards from "@/components/marketing/CampaignMetricsCards";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default async function CampaignsPage() {
    const campaigns = await getCampaignsList();
    const metricsResult = await getAggregatedSpend();

    // Map DB object to what the client component expects
    const formattedCampaigns = campaigns.map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        platform: c.platform,
        status: c.status,
        budget: c.budget,
        spend: c.spend,
        impressions: c.impressions,
        clicks: c.clicks,
        conversions: c.conversions
    }));

    return (
        <div className="flex-1 space-y-6 flex flex-col pt-6 pb-8 px-8">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Campaigns & Ad Spend</h2>
                    <p className="text-muted-foreground">
                        Centralized CMO view of all live marketing initiatives across Meta and Google.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href="/dashboard/admin/marketing/settings">
                        <Button variant="outline" className="h-9">
                            <Settings className="mr-2 h-4 w-4" />
                            API Connections
                        </Button>
                    </Link>
                    <Link href="/dashboard/admin/marketing/campaigns/new">
                        <Button className="h-9">
                            <Plus className="mr-2 h-4 w-4" />
                            New Campaign
                        </Button>
                    </Link>
                </div>
            </div>

            <CampaignMetricsCards metrics={metricsResult} />

            <div className="pt-4">
                <CampaignsDashboardClient initialCampaigns={formattedCampaigns} />
            </div>
        </div>
    );
}
