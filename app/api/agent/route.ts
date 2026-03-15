import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { AGENCY_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import {
    updateDealStageTool,
    createInvoiceTool,
    getCRMDealsTool,
    sendFollowUpEmailTool,
    scheduleMeetingTool,
    sendWhatsAppAlertTool,
    generateSalesReportTool,
} from "@/lib/ai/tools/agency-tools";
import { auth } from "@/lib/auth";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const session = await auth();
        const companyId = (session?.user as any)?.companyId || session?.user?.id;
        const userId = session?.user?.id;

        if (!session?.user || !companyId) {
            return new Response(JSON.stringify({ error: "Unauthorized." }), { status: 401 });
        }

        const result = streamText({
            model: google("gemini-2.0-flash"),
            system: AGENCY_SYSTEM_PROMPT,
            messages,
            tools: {
                // ── CRM Tools ──────────────────────────────────────────────
                updateDealStage: {
                    description: updateDealStageTool.description,
                    parameters: updateDealStageTool.parameters,
                    execute: async (args) => await updateDealStageTool.execute(args),
                },
                createInvoice: {
                    description: createInvoiceTool.description,
                    parameters: createInvoiceTool.parameters,
                    execute: async (args) => await createInvoiceTool.execute({ ...args, companyId }),
                },
                searchCRMDeals: {
                    description: getCRMDealsTool.description,
                    parameters: getCRMDealsTool.parameters,
                    execute: async (args) => await getCRMDealsTool.execute({ ...args, companyId }),
                },
                // ── Communication Tools ─────────────────────────────────────
                sendFollowUpEmail: {
                    description: sendFollowUpEmailTool.description,
                    parameters: sendFollowUpEmailTool.parameters,
                    execute: async (args) => await sendFollowUpEmailTool.execute(args),
                },
                sendWhatsAppAlert: {
                    description: sendWhatsAppAlertTool.description,
                    parameters: sendWhatsAppAlertTool.parameters,
                    execute: async (args) => await sendWhatsAppAlertTool.execute(args),
                },
                // ── Calendar Tool ───────────────────────────────────────────
                scheduleMeeting: {
                    description: scheduleMeetingTool.description,
                    parameters: scheduleMeetingTool.parameters,
                    execute: async (args) => await scheduleMeetingTool.execute({ ...args, companyId, userId }),
                },
                // ── Analytics Tool ──────────────────────────────────────────
                generateSalesReport: {
                    description: generateSalesReportTool.description,
                    parameters: generateSalesReportTool.parameters,
                    execute: async (args) => await generateSalesReportTool.execute({ ...args, companyId }),
                },
            }
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error("Agent Error:", error);
        return new Response(JSON.stringify({ error: "Error en el servidor de IA Cognitiva." }), { status: 500 });
    }
}
