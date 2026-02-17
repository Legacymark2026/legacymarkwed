import { LeadDashboard } from "@/modules/crm/components/LeadDashboard";
import { prisma } from "@/lib/prisma";

export default async function LeadsPage() {
    // Get company (in prod, get from session)
    const company = await prisma.company.findFirst();

    if (!company) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold">Leads</h1>
                <p className="text-gray-500">No company found. Please set up your company first.</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
                <p className="text-muted-foreground">Track and manage incoming leads with automatic source detection.</p>
            </div>

            <LeadDashboard companyId={company.id} />
        </div>
    );
}
