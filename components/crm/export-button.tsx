"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV } from "@/lib/csv-export";

interface CRMExportButtonProps {
    stats: Record<string, any>;
    advancedStats: Record<string, any>;
}

export function CRMExportButton({ stats, advancedStats }: CRMExportButtonProps) {
    const handleExport = () => {
        const exportData = [
            { Metric: "Pipeline Total", Value: stats.pipelineValue },
            { Metric: "Active Deals", Value: stats.activeDeals },
            { Metric: "Win Rate", Value: `${stats.winRate}%` },
            { Metric: "Avg Deal Size", Value: stats.avgDealSize },
            { Metric: "Forecast Next 3 Months", Value: advancedStats.forecastValue },
            { Metric: "Won Value (Month)", Value: advancedStats.wonValue },
            { Metric: "Month Over Month Growth", Value: `${advancedStats.momGrowth}%` },
            { Metric: "Avg Days to Close", Value: advancedStats.avgDaysToClose },
        ];

        exportToCSV(exportData, `CRM_Performance_Report_${new Date().toISOString().split('T')[0]}`);
    };

    return (
        <Button size="sm" variant="outline" className="hidden md:flex h-8 gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
        </Button>
    );
}
