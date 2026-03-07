
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

            {/* KPI Cards (Premium UI Redesign Phase 1) */}
            <div className="grid grid-cols-4 gap-5 mb-2">
                <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" /></svg>
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Pipeline</div>
                        <span className="flex h-5 items-center rounded-full bg-green-50 px-2 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            +12.5% M/M
                        </span>
                    </div>
                    <div className="text-3xl font-black tracking-tighter text-gray-900 mt-2">${totalValue.toLocaleString()}</div>
                    <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-800 rounded-full w-[85%]" />
                    </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)] transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-900 group-hover:opacity-10 transition-opacity">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z" /></svg>
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="text-[11px] font-bold text-blue-600/80 uppercase tracking-widest mb-1">Weighted Forecast</div>
                        <span className="flex h-5 items-center rounded-full bg-blue-100 px-2 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                            Predictivo
                        </span>
                    </div>
                    <div className="text-3xl font-black tracking-tighter text-blue-600 mt-2">${Math.round(weightedValue).toLocaleString()}</div>
                    <div className="mt-4 flex gap-1 h-3 items-end">
                        {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                            <div key={i} className="w-full bg-blue-200 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(34,197,94,0.1)] transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-green-900 group-hover:opacity-10 transition-opacity">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2v-6h2v6z" /></svg>
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="text-[11px] font-bold text-green-700/80 uppercase tracking-widest mb-1">Revenue Cerrado (WON)</div>
                        <span className="flex h-5 items-center rounded-full bg-green-100 px-2 text-[10px] font-medium text-green-800 ring-1 ring-inset ring-green-600/20">
                            YTD
                        </span>
                    </div>
                    <div className="text-3xl font-black tracking-tighter text-green-600 mt-2">${wonValue.toLocaleString()}</div>
                    <div className="mt-4 flex gap-1 h-3 items-end">
                        {[20, 30, 50, 40, 70, 80, 100].map((h, i) => (
                            <div key={i} className={`w-full ${i === 6 ? 'bg-green-500' : 'bg-green-200'} rounded-t-sm`} style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(168,85,247,0.1)] transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-900 group-hover:opacity-10 transition-opacity">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="text-[11px] font-bold text-purple-700/80 uppercase tracking-widest mb-1">Deals Activos</div>
                    </div>
                    <div className="text-3xl font-black tracking-tighter text-purple-700 mt-2">{pipelineCount}</div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {[...Array(Math.min(3, pipelineCount))].map((_, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-purple-200 border-2 border-white" />
                            ))}
                        </div>
                        <span className="text-[10px] font-medium text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                            Manejados
                        </span>
                    </div>
                </div>
            </div>

            {/* Board */}
            <div className="flex-1 min-h-[500px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/30 p-4">
                <KanbanBoard initialDeals={deals} />
            </div>
        </div>
    );
}
