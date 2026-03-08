export const dynamic = 'force-dynamic';

import { getCampaignsList, getAggregatedSpend } from "@/actions/marketing";
import CampaignsDashboardClient from "@/components/marketing/CampaignsDashboardClient";
import CampaignMetricsCards from "@/components/marketing/CampaignMetricsCards";
import { Plus, Settings, Target } from "lucide-react";
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
        <div className="ds-page space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6"
                style={{ borderBottom: '1px solid var(--ds-border)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.2)' }}>
                        <Target className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                        <h1 className="ds-heading-page">Campañas & Ad Spend</h1>
                        <p className="ds-subtext mt-0.5">Vista CMO centralizada · Meta · Google · TikTok · LinkedIn</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Link href="/dashboard/admin/marketing/settings">
                        <Button id="campaigns-api-btn" variant="outline" className="h-9 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 gap-1.5 text-sm">
                            <Settings className="h-3.5 w-3.5" />
                            Conexiones API
                        </Button>
                    </Link>
                    <Link href="/dashboard/admin/marketing/campaigns/new">
                        <Button id="campaigns-new-btn" className="h-9 bg-violet-600 hover:bg-violet-500 text-white gap-1.5 text-sm">
                            <Plus className="h-3.5 w-3.5" />
                            Nueva Campaña
                        </Button>
                    </Link>
                </div>
            </div>

            <CampaignMetricsCards metrics={metricsResult} />

            <div>
                <CampaignsDashboardClient initialCampaigns={formattedCampaigns} />
            </div>
        </div>
    );
}
