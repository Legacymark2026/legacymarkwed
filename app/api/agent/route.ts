import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { AGENCY_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { updateDealStageTool, createInvoiceTool, getCRMDealsTool } from "@/lib/ai/tools/agency-tools";
import { auth } from "@/lib/auth";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        
        // 1. Obtener la sesión para Inyectar RBAC y contexto de Compañía al Agente.
        const session = await auth();
        // Fallback robusto para buscar ID de la compañía o del usuario local
        const companyId = (session?.user as any)?.companyId || session?.user?.id;

        // Validamos autenticación. El Agente no se comunica con usuarios anónimos.
        if (!session?.user || !companyId) {
            return new Response(JSON.stringify({ error: "Unauthorized. AI Agent require a valid session context." }), { status: 401 });
        }

        // 2. Configuramos el streaming con Vercel AI SDK
        const result = streamText({
            model: openai("gpt-4o"), // Usamos GPT-4o para mejor seguimiento de esquemas y reasoning.
            system: AGENCY_SYSTEM_PROMPT,
            messages,
            // 3. Inyectamos el "JSON Mode" Tools con contexto auth
            tools: {
                updateDealStage: tool({
                    description: updateDealStageTool.description,
                    parameters: updateDealStageTool.parameters,
                    execute: async (args: any) => await updateDealStageTool.execute(args),
                }),
                createInvoice: tool({
                    description: createInvoiceTool.description,
                    parameters: createInvoiceTool.parameters,
                    execute: async (args: any) => await createInvoiceTool.execute({ ...args, companyId }),
                }),
                searchCRMDeals: tool({
                    description: getCRMDealsTool.description,
                    parameters: getCRMDealsTool.parameters,
                    execute: async (args: any) => await getCRMDealsTool.execute({ ...args, companyId }),
                }),
            }
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Agent Error:", error);
        return new Response(JSON.stringify({ error: "Error en el servidor de IA Cognitiva." }), { status: 500 });
    }
}
