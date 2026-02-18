
import { NextRequest, NextResponse } from "next/server";
import { automationHub } from "@/lib/integrations/providers";
import { ChannelType } from "@/types/inbox";
import { prisma } from "@/lib/prisma";
import { createLead } from "@/modules/leads/actions/leads";

// Map URL param to ChannelType
const getChannelFromProvider = (provider: string): ChannelType | null => {
    switch (provider.toLowerCase()) {
        case 'facebook': return 'MESSENGER';
        case 'instagram': return 'INSTAGRAM';
        case 'twitter': return 'TWITTER';
        case 'linkedin': return 'LINKEDIN';
        case 'youtube': return 'YOUTUBE';
        case 'whatsapp': return 'WHATSAPP';
        default: return null;
    }
};

export async function POST(
    req: NextRequest,
    params: { params: Promise<{ provider: string }> }
) {
    return handlePost(req, params);
}

async function handlePost(
    req: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider } = await params;
    const channel = getChannelFromProvider(provider);

    if (!channel) {
        return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const channelProvider = automationHub.get(channel);
    if (!channelProvider) {
        return NextResponse.json({ error: "Provider not configured" }, { status: 501 });
    }

    try {
        // 1. Parse incoming webhook
        const inboundMessage = await channelProvider.parseWebhook(req);

        if (!inboundMessage) {
            return NextResponse.json({ message: "Ignored event" });
        }

        // 2. Resolve Company (For now, use the first available company or a default fallback)
        // In a multi-tenant setup, this would come from the PhoneNumberID mapping
        const company = await prisma.company.findFirst();

        if (!company) {
            console.error("No company found for incoming webhook");
            return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
        }

        // 3. Find or Create Lead
        let lead = await prisma.lead.findFirst({
            where: {
                phone: inboundMessage.externalId,
                companyId: company.id
            }
        });

        if (!lead) {
            // Create a new lead for this WhatsApp user
            // Use a placeholder email since it's required by the schema/action
            const placeholderEmail = `wa_${inboundMessage.externalId}@placeholder.com`;

            const result = await createLead({
                email: placeholderEmail,
                companyId: company.id,
                name: inboundMessage.sender.name || "WhatsApp User",
                phone: inboundMessage.externalId,
                source: 'WHATSAPP',
                utmSource: 'whatsapp',
                tags: ['whatsapp-inbound']
            });

            if (result.success && result.data) {
                lead = result.data as any;
            } else {
                console.error("Failed to create lead from WhatsApp:", result.error);
                // Continue without linking lead? Or fail? 
                // We will proceed to save the message but leadId will be null
            }
        }

        // 4. Find or Create Conversation
        let conversation = await prisma.conversation.findFirst({
            where: {
                platformId: inboundMessage.externalId,
                channel: 'WHATSAPP',
                companyId: company.id
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    channel: 'WHATSAPP',
                    platformId: inboundMessage.externalId,
                    companyId: company.id,
                    leadId: lead?.id,
                    status: 'OPEN',
                    unreadCount: 1,
                    lastMessageAt: new Date(),
                    lastMessagePreview: inboundMessage.content.substring(0, 100)
                }
            });
        } else {
            // Update conversation state
            await prisma.conversation.update({
                where: { id: conversation.id },
                data: {
                    unreadCount: { increment: 1 },
                    lastMessageAt: new Date(),
                    lastMessagePreview: inboundMessage.content.substring(0, 100),
                    status: conversation.status === 'ARCHIVED' ? 'OPEN' : conversation.status
                }
            });
        }

        // 5. Create Message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                content: inboundMessage.content,
                type: 'TEXT', // TODO: Enhance for media support
                direction: 'INBOUND',
                status: 'DELIVERED',
                externalId: inboundMessage.metadata?.messageId,
                senderId: null, // System/User
                metadata: inboundMessage.metadata
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error(`[Webhook:${channel}] Error:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
