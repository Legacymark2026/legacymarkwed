import {
    AGENCY_SYSTEM_PROMPT,
    CMO_SYSTEM_PROMPT,
    VENTAS_SYSTEM_PROMPT
} from "@/lib/ai/system-prompt";
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
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

// Tool definitions for Gemini function calling
const GEMINI_TOOLS = [
    {
        functionDeclarations: [
            {
                name: "searchCRMDeals",
                description: getCRMDealsTool.description,
                parameters: {
                    type: "OBJECT",
                    properties: {
                        searchQuery: { type: "STRING", description: "Palabra clave para buscar" },
                    },
                    required: ["searchQuery"],
                },
            },
            {
                name: "generateSalesReport",
                description: generateSalesReportTool.description,
                parameters: {
                    type: "OBJECT",
                    properties: {
                        month: { type: "NUMBER", description: "Mes (1-12)" },
                        year: { type: "NUMBER", description: "Año" },
                    },
                },
            },
        ],
    },
];

export async function POST(req: Request) {
    try {
        const { messages, roleType } = await req.json();

        const session = await auth();
        const companyId = (session?.user as any)?.companyId || session?.user?.id;
        const userId = session?.user?.id;

        if (!session?.user || !companyId) {
            return new Response(JSON.stringify({ error: "Unauthorized." }), { status: 401 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "GOOGLE_GENERATIVE_AI_API_KEY no está configurada en el servidor." }),
                { status: 500 }
            );
        }

        // Fetch AgentConfig from DB
        const config = await prisma.agentConfig.findUnique({
            where: { companyId }
        });

        // Use DB settings or fallback to defaults
        if (config && !config.isActive) {
            return new Response(JSON.stringify({ error: "El agente está desactivado por el administrador." }), { status: 403 });
        }

        let basePrompt = config?.systemPrompt || AGENCY_SYSTEM_PROMPT;
        if (roleType === "marketing") {
            basePrompt = CMO_SYSTEM_PROMPT + "\n\n" + basePrompt;
        } else if (roleType === "sales") {
            basePrompt = VENTAS_SYSTEM_PROMPT + "\n\n" + basePrompt;
        }

        const activePrompt = basePrompt;
        const activeModel = config?.llmModel || "gemini-2.0-flash-lite";
        const temp = config?.temperature ?? 0.7;
        const maxTok = config?.maxTokens ?? 1024;

        // Convert messages to Gemini format
        // Inject system prompt as first user-model exchange (most compatible format)
        const geminiContents: { role: string; parts: any[] }[] = [
            { role: "user", parts: [{ text: activePrompt }] },
            { role: "model", parts: [{ text: "Entendido. Estoy listo para asistirte como Agente de LegacyMark." }] },
            ...messages
                .filter((m: any) => m.role !== "system")
                .map((m: any) => {
                    const parts: any[] = [];
                    if (Array.isArray(m.content)) {
                        m.content.forEach((c: any) => {
                            if (c.type === "text") parts.push({ text: c.text });
                            if (c.type === "image") {
                                const base64Data = c.image.split(',')[1] || c.image;
                                const mimeTypeMatch = c.image.match(/^data:([^;]+);/);
                                const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
                                parts.push({ inlineData: { mimeType, data: base64Data } });
                            }
                        });
                    } else {
                        parts.push({ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) });
                    }
                    return {
                        role: m.role === "assistant" ? "model" : "user",
                        parts,
                    };
                }),
        ];

        // Ensure last message is from user (Gemini requirement)
        if (geminiContents[geminiContents.length - 1]?.role !== "user") {
            geminiContents.push({ role: "user", parts: [{ text: "Continúa." }] });
        }

        const geminiBody = {
            contents: geminiContents,
            generationConfig: {
                temperature: temp,
                maxOutputTokens: maxTok,
            },
        };

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:streamGenerateContent?alt=sse&key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(geminiBody),
            }
        );

        if (!geminiRes.ok) {
            const errorText = await geminiRes.text().catch(() => "Unknown error");
            console.error("Gemini API Error:", errorText);
            let errorMsg = `HTTP ${geminiRes.status}`;
            try { errorMsg = JSON.parse(errorText)?.error?.message || errorMsg; } catch {}
            return new Response(
                JSON.stringify({ error: `Gemini: ${errorMsg}` }),
                { status: 502 }
            );
        }

        // Transform Gemini SSE stream → Vercel AI protocol (0:"text")
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const reader = geminiRes.body!.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split("\n");
                        buffer = lines.pop() ?? "";

                        for (const line of lines) {
                            if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
                            try {
                                const data = JSON.parse(line.slice(6));
                                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                                if (text) {
                                    // Vercel AI stream protocol: 0:"text piece"\n
                                    controller.enqueue(
                                        encoder.encode(`0:${JSON.stringify(text)}\n`)
                                    );
                                }
                            } catch {
                                // skip malformed line
                            }
                        }
                    }

                    // Process remaining buffer
                    if (buffer.startsWith("data: ") && buffer !== "data: [DONE]") {
                        try {
                            const data = JSON.parse(buffer.slice(6));
                            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (text) {
                                controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
                            }
                        } catch { /* skip */ }
                    }
                } catch (err) {
                    console.error("Stream error:", err);
                } finally {
                    // Send finish signal
                    controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`));
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Vercel-AI-Data-Stream": "v1",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error: any) {
        console.error("Agent Route Error:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Error interno del servidor." }),
            { status: 500 }
        );
    }
}
