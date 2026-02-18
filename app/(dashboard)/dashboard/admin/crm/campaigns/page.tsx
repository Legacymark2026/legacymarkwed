import { CampaignManager } from "@/modules/crm/components/CampaignManager";
import { prisma } from "@/lib/prisma";

export default async function CampaignsPage() {
    // Get company (in prod, get from session)
    const company = await prisma.company.findFirst();

    if (!company) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold">Campaigns</h1>
                <p className="text-gray-500">No company found. Please set up your company first.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <CampaignManager companyId={company.id} />
        </div>
    );
}
