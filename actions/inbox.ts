'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ChannelType } from "@/types/inbox";

// --- Types ---
export interface GetConversationsParams {
    companyId: string;
    status?: string;
    channel?: string;
    assignedTo?: string;
    search?: string;
    page?: number;
    limit?: number;
}

// --- Actions ---

export async function getConversations({
    status,
    channel,
    assignedTo,
    search,
    page = 1,
    limit = 20
}: Omit<GetConversationsParams, 'companyId'>) {
    try {
        const { auth } = await import("@/lib/auth");
        const { prisma } = await import("@/lib/prisma"); // Use singleton if available
        const session = await auth();

        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { companies: true }
        });
        let companyId = user?.companies[0]?.companyId;

        // Fallback for single-tenant / reset scenarios: Use default company
        if (!companyId) {
            const defaultCompany = await prisma.company.findFirst();
            if (defaultCompany) {
                companyId = defaultCompany.id;
            }
        }

        if (!companyId) return { success: false, error: "No company found" };
        const skip = (page - 1) * limit;

        const where: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ = {
            companyId,
            ...(status && { status }),
            ...(channel && { channel }),
            ...(assignedTo && { assignedTo }),
        };

        if (search) {
            where.OR = [
                { lead: { name: { contains: search, mode: 'insensitive' } } },
                { lead: { email: { contains: search, mode: 'insensitive' } } },
                { messages: { some: { content: { contains: search, mode: 'insensitive' } } } }
            ];
        }

        const [conversations, total] = await Promise.all([
            db.conversation.findMany({
                where,
                include: {
                    lead: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            // image: true, // Field does not exist on Lead model
                        }
                    },
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    },
                    _count: {
                        select: { messages: true }
                    }
                },
                orderBy: {
                    lastMessageAt: 'desc'
                },
                skip,
                take: limit
            }),
            db.conversation.count({ where })
        ]);

        return {
            success: true,
            data: conversations,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return { success: false, error: "Failed to fetch conversations" };
    }
}

export async function getMessages(conversationId: string) {
    try {
        const messages = await db.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            include: {
                conversation: {
                    select: {
                        channel: true,
                        lead: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        // Mark as read when fetching
        await db.conversation.update({
            where: { id: conversationId },
            data: { unreadCount: 0 }
        });

        return { success: true, data: messages };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { success: false, error: "Failed to fetch messages" };
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendMessage(conversationId: string, content: string, userId: string, attachments: any[] = []) {
    try {
        if (!content && attachments.length === 0) {
            return { success: false, error: "Message content or attachment required" };
        }

        // 1. Create the message in DB
        const message = await db.message.create({
            data: {
                conversationId,
                content,
                direction: 'OUTBOUND',
                senderId: userId,
                status: 'SENT',
                // For MVP, handling first attachment as mediaUrl if present
                mediaUrl: attachments.length > 0 ? attachments[0].url : null,
                mediaType: attachments.length > 0 ? attachments[0].type : null,
            }
        });

        // 2. Update Conversation (last message, preview)
        await db.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessageAt: new Date(),
                lastMessagePreview: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                status: 'OPEN' // Re-open if closed
            }
        });

        // 3. Integrate with Meta API
        const conversation = await db.conversation.findUnique({
            where: { id: conversationId },
            include: { lead: true }
        });

        if (conversation && (conversation.channel === 'FACEBOOK' || conversation.channel === 'MESSENGER' || conversation.channel === 'INSTAGRAM') && conversation.metadata) {

            // Dynamic Import to avoid cycle
            const { MetaService } = await import("@/lib/services/meta-sync");

            const meta = conversation.metadata as any; // Cast JSON to expected shape

            // We need the page access token.
            // Improvement: Store pageAccessToken in Account or Metadata. For now, fetch from User Accounts.
            const pages = await MetaService.getConnectedPages(userId);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const page = pages.find((p: any) => p.id === meta.pageId);

            if (page && meta.recipientId) {
                await MetaService.sendReply(
                    meta.recipientId,
                    page.id,
                    content,
                    page.access_token
                );
            } else {
                console.warn("[Inbox] Cannot send Meta reply: Missing Page Context or Recipient ID in metadata");
            }
        }

        revalidatePath(`/dashboard/inbox`);
        return { success: true, data: message };
    } catch (error) {
        console.error("Error sending message:", error);
        return { success: false, error: "Failed to send message" };
    }
}

export async function createConversation(companyId: string, leadId: string, channel: string) {
    try {
        // Check if exists
        const existing = await db.conversation.findFirst({
            where: {
                companyId,
                leadId,
                channel,
                status: { not: 'ARCHIVED' }
            }
        });

        if (existing) {
            return { success: true, data: existing, isNew: false };
        }

        const conversation = await db.conversation.create({
            data: {
                companyId,
                leadId,
                channel,
                status: 'OPEN',
                lastMessageAt: new Date(),
                lastMessagePreview: 'New conversation started'
            }
        });

        revalidatePath(`/dashboard/inbox`);
        return { success: true, data: conversation, isNew: true };
    } catch (error) {
        console.error("Error creating conversation:", error);
        return { success: false, error: "Failed to create conversation" };
    }
}

export async function updateConversationStatus(conversationId: string, status: string) {
    try {
        const conversation = await db.conversation.update({
            where: { id: conversationId },
            data: { status }
        });

        revalidatePath(`/dashboard/inbox`);
        return { success: true, data: conversation };
    } catch (error) {
        console.error("Error updating status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

export async function simulateIncomingMessage(params: {
    channel: ChannelType;
    senderName: string;
    senderHandle: string;
    content: string;
    companyId: string;
}) {
    try {
        let { channel, senderName, senderHandle, content, companyId } = params;

        // Auto-detect company from session if creating a simulation manually
        if (companyId === 'default-company-id' || !companyId) {
            const { auth } = await import("@/lib/auth");
            const { prisma } = await import("@/lib/prisma");

            const session = await auth();
            if (session?.user?.id) {
                const userCompany = await prisma.companyUser.findFirst({
                    where: { userId: session.user.id },
                    select: { companyId: true }
                });
                if (userCompany) {
                    companyId = userCompany.companyId;
                }
            }
        }

        // 1. Find or Create Lead
        let lead = await db.lead.findFirst({
            where: {
                companyId,
                OR: [
                    { email: senderHandle.includes('@') ? senderHandle : undefined },
                    { phone: !senderHandle.includes('@') ? senderHandle : undefined }
                ]
            }
        });

        if (!lead) {
            lead = await db.lead.create({
                data: {
                    companyId,
                    name: senderName,
                    email: senderHandle.includes('@') ? senderHandle : `temp-${Date.now()}@example.com`,
                    phone: !senderHandle.includes('@') ? senderHandle : undefined,
                    status: 'NEW',
                    source: channel
                }
            });
        }

        // 2. Find or Create Conversation
        let conversation = await db.conversation.findFirst({
            where: {
                companyId,
                leadId: lead.id,
                channel,
                status: { not: 'ARCHIVED' }
            }
        });

        if (!conversation) {
            conversation = await db.conversation.create({
                data: {
                    companyId,
                    leadId: lead.id,
                    channel,
                    status: 'OPEN',
                    lastMessageAt: new Date(),
                    lastMessagePreview: content.substring(0, 50)
                }
            });
        } else {
            await db.conversation.update({
                where: { id: conversation.id },
                data: {
                    status: 'OPEN',
                    lastMessageAt: new Date(),
                    lastMessagePreview: content.substring(0, 50)
                }
            });
        }

        // 3. Create Message
        await db.message.create({
            data: {
                conversationId: conversation.id,
                content,
                direction: 'INBOUND',
                status: 'RECEIVED',
                senderId: lead.id
            }
        });

        revalidatePath('/dashboard/inbox');
        return { success: true };

    } catch (error: any) /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
        console.error("Simulation error:", error);
        return { success: false, error: error.message };
    }
}

// ==================== META INBOX INTEGRATION ====================

export async function syncMetaConversations() {
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    // Get user's company
    const userCompany = await prisma.companyUser.findFirst({
        where: { userId: session.user.id },
        select: { companyId: true }
    });

    if (!userCompany) {
        return { success: false, error: "No company found for user" };
    }

    try {
        const { MetaSyncService } = await import("@/lib/services/meta-sync");
        const result = await MetaSyncService.syncAllConversations(
            session.user.id,
            userCompany.companyId
        );

        // Revalidate inbox page to show new conversations
        revalidatePath('/dashboard/inbox');

        return result;
    } catch (error: any) /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
        console.error("[syncMetaConversations] Error:", error);
        return {
            success: false,
            conversationsSynced: 0,
            messagesSynced: 0,
            errors: [error.message]
        };
    }
}

export async function getLeadDetails(leadId: string) {
    try {
        const { prisma } = await import("@/lib/prisma"); // Dynamic import to avoid build loops

        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                marketingEvents: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                campaign: true,
                conversations: {
                    orderBy: { lastMessageAt: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        channel: true,
                        status: true,
                        lastMessageAt: true
                    }
                }
            }
        });

        if (!lead) return null;

        return lead;
    } catch (error) {
        console.error("Error fetching lead details:", error);
        return null;
    }
}
