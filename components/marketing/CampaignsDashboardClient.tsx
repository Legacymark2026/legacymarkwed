'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Facebook, RefreshCcw, Loader2, Play, Pause, ExternalLink } from "lucide-react";
import { syncLiveCampaigns } from '@/actions/marketing';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

interface CampaignData {
    id: string;
    name: string;
    code: string;
    platform: string;
    status: string;
    budget: number | null;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
}

export default function CampaignsDashboardClient({ initialCampaigns }: { initialCampaigns: CampaignData[] }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    // Filter logic
    const filteredCampaigns = initialCampaigns.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await syncLiveCampaigns();
            toast.success(`Synched ${res.syncedCount} campaigns from Meta & Google Ads!`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to sync campaigns");
        } finally {
            setIsSyncing(false);
        }
    };

    const getPlatformIcon = (platform: string) => {
        if (platform === 'FACEBOOK_ADS') return <Facebook className="h-4 w-4 text-blue-600" />;
        if (platform === 'GOOGLE_ADS') return <Search className="h-4 w-4 text-emerald-600" />;
        return <Search className="h-4 w-4" />;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><Play className="h-3 w-3 mr-1" /> Active</Badge>;
            case 'PAUSED': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Pause className="h-3 w-3 mr-1" /> Paused</Badge>;
            case 'COMPLETED': return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Completed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 bg-white border-gray-200"
                        />
                    </div>
                    <Button variant="outline" size="sm" className="h-9">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div>

                <Button onClick={handleSync} disabled={isSyncing} className="bg-indigo-600 hover:bg-indigo-700 h-9">
                    {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                    Sync Live API Data
                </Button>
            </div>

            {/* Data Table */}
            <Card className="border-gray-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[300px]">Campaign Name</TableHead>
                            <TableHead>Platform</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Budget</TableHead>
                            <TableHead className="text-right">Spend</TableHead>
                            <TableHead className="text-right">Results (CPA)</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCampaigns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    No campaigns found. Click "Sync Live API Data" to fetch from Meta/Google.
                                </TableCell>
                            </TableRow>
                        ) : filteredCampaigns.map((camp) => {
                            const cpa = camp.conversions > 0 ? (camp.spend / camp.conversions) : 0;
                            return (
                                <TableRow key={camp.id} className="hover:bg-gray-50/50">
                                    <TableCell className="font-medium flex flex-col pt-3">
                                        <span className="text-sm truncate max-w-[280px]">{camp.name}</span>
                                        <span className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {camp.code}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                                            {getPlatformIcon(camp.platform)}
                                            {camp.platform.replace('_ADS', '')}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(camp.status)}</TableCell>
                                    <TableCell className="text-right font-mono text-sm">
                                        {camp.budget ? `$${camp.budget.toFixed(2)}` : '--'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm font-semibold text-gray-700">
                                        ${camp.spend.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-bold text-emerald-600">{camp.conversions}</span>
                                            <span className="text-[10px] text-gray-500 font-mono">
                                                CPA: ${cpa.toFixed(2)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
