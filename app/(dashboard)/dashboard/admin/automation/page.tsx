import { requireCompany } from "@/lib/company-utils";
import { getWorkflows } from "@/actions/automation";
import WorkflowListClient from "./workflow-list";

export const metadata = {
    title: "Automatización | Dashboard",
};

export default async function AutomationPage() {
    // This will redirect if no company
    const { companyId } = await requireCompany();

    const workflows = await getWorkflows(companyId);

    // Serialization for client component
    const serializedWorkflows = workflows.map(w => ({
        ...w,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt
    }));

    // Or better, let Next.js handle it if it supports Date serialization, 
    // but to be safe I'll pass them as is and rely on newer Next.js capabilities 
    // or TypeScript will complain if I missed string conversion.
    // The client component interface expects `Date`, so I'll pass Date.

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
            <WorkflowListClient initialWorkflows={serializedWorkflows as any} />
        </div>
    );
}
