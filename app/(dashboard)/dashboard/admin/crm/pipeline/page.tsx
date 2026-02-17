
import { KanbanBoard } from "@/modules/crm/components/KanbanBoard";
import { getDeals } from "@/modules/crm/actions/crm";
import { prisma } from "@/lib/prisma";
import { NewDealDialog } from "@/modules/crm/components/NewDealDialog";
import { CsvExportButton } from "@/modules/crm/components/CsvExportButton";

export default async function PipelinePage() {
    // Fetch real data
    // In prod, get companyId from session. For now, find first.
    const company = await prisma.company.findFirst();
    let deals: any[] = [];

    if (company) {
        const res = await getDeals(company.id);
        if (res.success) deals = res.data || [];
    }

    // Calc Stats
    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    const wonValue = deals.filter(d => d.stage === 'WON').reduce((sum, d) => sum + d.value, 0);
    const weightedValue = deals.reduce((sum, d) => sum + (d.value * (d.probability || 0) / 100), 0);
    const pipelineCount = deals.length;

    return (
        <div className="h-full flex flex-col space-y-4 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Sales Pipeline</h1>
                    <p className="text-muted-foreground">Manage your deals and track revenue.</p>
                </div>
                <div className="flex gap-2">
                    <CsvExportButton deals={deals} />
                    {company && <NewDealDialog companyId={company.id} />}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Pipeline</div>
                    <div className="text-2xl font-bold mt-1">${totalValue.toLocaleString()}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Weighted Forecast</div>
                    <div className="text-2xl font-bold mt-1 text-blue-600">${Math.round(weightedValue).toLocaleString()}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Revenue Won</div>
                    <div className="text-2xl font-bold mt-1 text-green-600">${wonValue.toLocaleString()}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Deals</div>
                    <div className="text-2xl font-bold mt-1">{pipelineCount}</div>
                </div>
            </div>

            {/* Board */}
            <div className="flex-1 min-h-0">
                <KanbanBoard initialDeals={deals} />
            </div>
        </div>
    );
}
