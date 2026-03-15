import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { AGENCY_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { updateDealStageTool, createInvoiceTool, getCRMDealsTool } from "@/lib/ai/tools/agency-tools";
import { auth } from "@/lib/auth";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const session = await auth();
        const companyId = (session?.user as any)?.companyId || session?.user?.id;

        if (!session?.user || !companyId) {
            return new Response(JSON.stringify({ error: "Unauthorized." }), { status: 401 });
        }

        const result = streamText({
            model: google("gemini-2.0-flash"),
            system: AGENCY_SYSTEM_PROMPT,
            messages,
            tools: {
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
            }
        });

        // toDataStreamResponse() is used in ai@4.x. Returns Vercel AI stream protocol.
        return result.toDataStreamResponse();
    } catch (error) {
        console.error("Agent Error:", error);
        return new Response(JSON.stringify({ error: "Error en el servidor de IA Cognitiva." }), { status: 500 });
    }
}
