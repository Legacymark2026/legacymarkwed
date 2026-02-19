
import { ChannelType, ProcessingResult } from "@/types/inbox";
import { ChannelProvider, OutboundMessage, InboundMessage } from "./types";
import crypto from "crypto";
import { getSystemIntegrationConfig } from "@/lib/integration-config-service";
import { IntegrationConfigData } from "@/actions/integration-config";

export class WhatsAppProvider implements ChannelProvider {
    channel: ChannelType = 'WHATSAPP';
    // WhatsApp Cloud API Tokens are typically different from Page Tokens.
    // They are System User tokens or Permanent tokens.
    private apiToken: string;
    private phoneNumberId: string;

    constructor(token: string = '', phoneNumberId: string = '') {
        this.apiToken = token || process.env.WHATSAPP_API_TOKEN || '';
        this.phoneNumberId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    }

    async sendMessage(message: OutboundMessage): Promise<ProcessingResult> {
        console.log(`[WhatsAppProvider] Sending message to ${message.conversationId}`);

        let apiToken = this.apiToken;
        let phoneNumberId = this.phoneNumberId;

        // Dynamic Config
        const config = await getSystemIntegrationConfig('whatsapp');
        if (config?.accessToken) apiToken = config.accessToken;
        if (config?.phoneNumberId) phoneNumberId = config.phoneNumberId;

        if (!apiToken || !phoneNumberId) {
            console.log("Mocking WhatsApp Success (Missing Credentials in ENV/DB)");
            await new Promise(r => setTimeout(r, 500));
            return { success: true, messageId: `wa-mock-${Date.now()}` };
        }

        try {
            const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: message.conversationId, // Phone number
                    text: { body: message.content }
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            return { success: true, messageId: data.messages?.[0]?.id };
        } catch (error: any) /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
            console.error("WhatsApp Send Error:", error);
            return { success: false, error: error.message };
        }
    }

    async verifySignature(request: Request): Promise<boolean> {
        const signature = request.headers.get("x-hub-signature-256");
        // WhatsApp sometimes uses specific app secrets or the same as Meta
        let appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;

        // Dynamic Config
        const config = await getSystemIntegrationConfig('whatsapp');
        if (config?.appSecret) appSecret = config.appSecret;

        if (!appSecret) {
            console.warn("[WhatsAppProvider] WHATSAPP_APP_SECRET not set. Skipping verification (UNSAFE).");
            return true;
        }

        if (!signature) {
            console.warn("[WhatsAppProvider] No signature header found.");
            return false;
        }

        try {
            const body = await request.clone().arrayBuffer();
            const expectedSignature = "sha256=" + crypto
                .createHmac("sha256", appSecret)
                .update(Buffer.from(body))
                .digest("hex");

            return crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );
        } catch (error) {
            console.error("[WhatsAppProvider] Signature verification failed:", error);
            return false;
        }
    }

    async validateWebhook(request: Request): Promise<boolean> {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        let verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

        const config = await getSystemIntegrationConfig('whatsapp');
        if (config?.verifyToken) verifyToken = config.verifyToken;

        return mode === "subscribe" && token === verifyToken;
    }

    async parseWebhook(request: Request): Promise<InboundMessage | null> {
        try {
            const body = await request.json();

            if (body.object === 'whatsapp_business_account') {
                for (const entry of body.entry) {
                    for (const change of entry.changes) {
                        const value = change.value;
                        if (value.messages && value.messages.length > 0) {
                            const msg = value.messages[0];
                            const contact = value.contacts?.[0];

                            return {
                                channel: this.channel,
                                externalId: msg.id, // FIX: Use Message ID
                                content: msg.text?.body || "[Media/Template]",
                                sender: {
                                    id: msg.from,
                                    name: contact?.profile?.name || "WhatsApp User",
                                    avatar: undefined
                                },
                                metadata: {
                                    wabaId: entry.id,
                                    messageId: msg.id,
                                    phoneNumberId: value.metadata?.phone_number_id
                                }
                            }
                        }
                    }
                }
            }
            return null;
        } catch (error) {
            console.error("Error parsing WhatsApp webhook:", error);
            return null;
        }
    }
}
