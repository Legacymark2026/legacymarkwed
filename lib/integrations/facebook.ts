import { ChannelType, ProcessingResult } from "@/types/inbox";
import { ChannelProvider, OutboundMessage, InboundMessage } from "./types";
import { MetaService } from "@/lib/meta-service";

export class FacebookProvider implements ChannelProvider {
    channel: ChannelType;
    private pageAccessToken: string;

    constructor(channel: ChannelType = 'MESSENGER', token: string = '') {
        this.channel = channel;
        this.pageAccessToken = token;
    }

    async sendMessage(message: OutboundMessage): Promise<ProcessingResult> {
        console.log(`[FacebookProvider] Sending message to ${message.conversationId}`);

        // In a real implementation:
        // 1. We need to lookup the Page Access Token associated with the channel instance or conversation.
        // For this MVP, we will assume a single page or fetch dynamically if we had context.
        // Since `sendMessage` interface doesn't pass the Page Token, we have a challenge.
        // Solution: The `channel` context should ideally store the Page Token.
        // For now, we will assume we can retrieve it via context or fail.

        // TEMPORARY: Retieve the first available page token from DB for the user who owns this conversation.
        // In production, we'd look up: Conversation -> Channel (Page ID) -> Token.

        if (!this.pageAccessToken) {
            return { success: false, error: "No Page Access Token available" };
        }

        try {
            // Recipient ID (PSID) is stored in the conversation or metadata
            // Assuming conversationId IS the PSID for now, or we look it up.
            // Just for the interface match, we'll assume message.conversationId maps to recipient PSID.
            const result = await MetaService.sendTextMessage(this.pageAccessToken, message.conversationId, message.content);
            return { success: true, messageId: result.message_id };
        } catch (error: any) /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
            console.error("Facebook Send Error:", error);
            return { success: false, error: error.message };
        }
    }

    async validateWebhook(request: Request): Promise<boolean> {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

        if (mode === "subscribe" && token === verifyToken) {
            return true;
        }
        return false;
    }

    async parseWebhook(request: Request): Promise<InboundMessage | null> {
        try {
            const body = await request.json();

            if (body.object === 'page') {
                for (const entry of body.entry) {
                    // 1. Handle Messaging Events
                    const webhookEvent = entry.messaging?.[0];

                    if (webhookEvent && webhookEvent.message) {
                        const senderPsid = webhookEvent.sender.id;
                        const pageId = entry.id;

                        return {
                            channel: this.channel,
                            externalId: senderPsid,
                            content: webhookEvent.message.text || "[Attachment]",
                            sender: {
                                id: senderPsid,
                                name: "Facebook User",
                                avatar: undefined
                            },
                            metadata: {
                                pageId: pageId,
                                messageId: webhookEvent.message.mid
                            }
                        };
                    }

                    // 2. Handle LeadGen Events
                    if (entry.changes) {
                        for (const change of entry.changes) {
                            if (change.field === 'leadgen') {
                                const leadgenId = change.value.leadgen_id;
                                const pageId = change.value.page_id;
                                const formId = change.value.form_id;

                                console.log(`[LeadAds] New Lead detected: ${leadgenId}`);

                                return {
                                    channel: 'EMAIL', // Treat as Lead
                                    externalId: leadgenId,
                                    content: `New Lead Ad Submission: ${leadgenId}`,
                                    sender: {
                                        id: 'system',
                                        name: 'Meta Lead Ads',
                                    },
                                    metadata: {
                                        type: 'LEAD_AD',
                                        leadgenId: leadgenId,
                                        formId: formId,
                                        pageId: pageId
                                    }
                                };
                            }
                        }
                    }
                }
            }
            return null;
        } catch (error) {
            console.error("Error parsing Facebook webhook:", error);
            return null;
        }
    }
}
