import { prisma } from "@/lib/prisma";

export const MetaService = {
    // 1. Get connected pages
    async getConnectedPages(userId: string) {
        const account = await prisma.account.findFirst({
            where: {
                userId,
                provider: 'facebook'
            },
            include: { user: { include: { profile: true } } }
        });

        if (!account || !account.access_token) {
            console.log('[MetaSync] No Facebook account or token found for user:', userId);
            return [];
        }

        console.log('[MetaSync] Found Facebook Account. Token Length:', account.access_token.length);

        let pages = [];

        try {
            const response = await fetch(
                `https://graph.facebook.com/v19.0/me/accounts?access_token=${account.access_token}`
            );
            const data = await response.json();

            if (data.error) {
                console.error('[MetaSync] Facebook API Error (getConnectedPages):', data.error);
            } else {
                pages = data.data || [];
                console.log(`[MetaSync] Facebook Pages Found via API: ${pages.length}`);
            }
        } catch (error) {
            console.error('[MetaSync] Error fetching pages:', error);
        }

        // --- MANUAL OVERRIDE CHECK ---
        try {
            const profile = account.user.profile;
            if (profile && profile.metadata) {
                const meta = profile.metadata as any;
                if (meta.manualConnectedPageId) {
                    console.log(`[MetaSync] Found MANUAL PAGE override: ${meta.manualConnectedPageId}`);

                    // Check if already in list to avoid duplicates
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const exists = pages.find((p: any) => p.id === meta.manualConnectedPageId);
                    if (!exists) {
                        pages.push({
                            id: meta.manualConnectedPageId,
                            name: meta.manualConnectedPageName || 'Manually Linked Page',
                            category: 'Manual Link',
                            tasks: ['MANAGE', 'MESSAGING'],
                            access_token: meta.manualConnectedPageToken // Might be undefined, handled later
                        });
                        console.log('[MetaSync] Injected manual page into sync list.');
                    }
                }
            }
        } catch (e) {
            console.error('[MetaSync] Error checking manual override:', e);
        }

        return pages;
    },

    // 2. Get conversations for a page (Generic)
    async getPageConversations(pageId: string, accessToken: string, platform: 'instagram' | 'messenger' = 'messenger', folder: 'inbox' | 'general' = 'inbox') {
        try {
            // Note: 'folder' param support varies by version/platform, but we try it for IG 'general'
            let url = platform === 'instagram'
                ? `https://graph.facebook.com/v19.0/${pageId}/conversations?platform=instagram&access_token=${accessToken}`
                : `https://graph.facebook.com/v19.0/${pageId}/conversations?platform=messenger&access_token=${accessToken}`;

            if (platform === 'instagram' && folder === 'general') {
                url += '&folder=general';
            }

            console.log(`[MetaSync] Fetching ${platform} conversations (${folder})...`);
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                // Ignore "folder not found" errors casually
                if (data.error.code !== 10 && data.error.code !== 100) {
                    console.log(`[MetaSync] Waring fetching ${platform}/${folder}:`, data.error.message);
                }
                return [];
            }

            return data.data || [];
        } catch (error) {
            console.error(`Error fetching ${platform} conversations:`, error);
            return [];
        }
    },

    // 3. Get messages for a conversation
    async getConversationMessages(conversationId: string, accessToken: string) {
        try {
            const response = await fetch(
                `https://graph.facebook.com/v19.0/${conversationId}/messages?fields=id,message,created_time,from,to,attachments&access_token=${accessToken}`
            );
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    },

    // 4. Get Page Access Token (Needed for syncing)
    async getPageAccessToken(pageId: string, userAccessToken: string) {
        try {
            const response = await fetch(
                `https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${userAccessToken}`
            );
            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Error fetching page access token:', error);
            return null;
        }
    },

    // 5. Send Reply (New)
    async sendReply(recipientId: string, pageId: string, content: string, accessToken: string) {
        try {
            const response = await fetch(
                `https://graph.facebook.com/v19.0/${pageId}/messages?access_token=${accessToken}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        recipient: { id: recipientId },
                        message: { text: content },
                        messaging_type: 'RESPONSE'
                    })
                }
            );
            const data = await response.json();

            if (data.error) {
                console.error('[MetaSync] Error sending reply:', data.error);
                return { success: false, error: data.error };
            }

            return { success: true, data };
        } catch (error) {
            console.error('[MetaSync] Exception sending reply:', error);
            return { success: false, error };
        }
    }
};

export const MetaSyncService = {
    async syncAllConversations(userId: string, companyId: string) {
        console.log(`[MetaSync] Starting sync for user ${userId} in company ${companyId}`);

        // 1. Get user's pages
        const pages = await MetaService.getConnectedPages(userId);

        if (pages.length === 0) {
            console.error('[MetaSync] No pages found. Aborting.');
            return {
                success: false,
                error: "No Facebook pages connected. Please check permissions."
            };
        }

        let totalConversations = 0;
        let totalMessages = 0;
        const account = await prisma.account.findFirst({
            where: { userId, provider: 'facebook' }
        });

        if (!account?.access_token) return { success: false, error: "No access token" };

        // 2. Iterate pages
        for (const page of pages) {
            console.log(`[MetaSync] Processing page: ${page.name} (${page.id})`);

            // Use existing token (from manual override) or fetch new one
            let pageAccessToken = (page as any).access_token;
            if (!pageAccessToken) {
                pageAccessToken = await MetaService.getPageAccessToken(page.id, account.access_token);
            }

            if (!pageAccessToken) {
                console.error(`[MetaSync] Could not get Access Token for page ${page.id}`);
                continue;
            }

            // 3. Get Conversations (BOTH Instagram & Messenger)
            console.log(`[MetaSync] Fetching ${page.name} conversations (IG + FB)...`);

            // IG: Primary + General
            const igInbox = await MetaService.getPageConversations(page.id, pageAccessToken, 'instagram', 'inbox');
            console.log(`[MetaSync] IG Inbox Count: ${igInbox.length}`);

            const igGeneral = await MetaService.getPageConversations(page.id, pageAccessToken, 'instagram', 'general');
            console.log(`[MetaSync] IG General Count: ${igGeneral.length}`);

            const igConversations = [...igInbox, ...igGeneral];

            const messengerConversations = await MetaService.getPageConversations(page.id, pageAccessToken, 'messenger', 'inbox');
            console.log(`[MetaSync] Messenger Count: ${messengerConversations.length}`);

            const allConversations = [
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...igConversations.map((c: any) => ({ ...c, platform: 'INSTAGRAM' })),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...messengerConversations.map((c: any) => ({ ...c, platform: 'MESSENGER' }))
            ];

            console.log(`[MetaSync] Found ${allConversations.length} total conversations for page ${page.name}`);

            for (const conv of allConversations) {
                // 4. Find or Create Lead/Conversation in our DB
                const messages = await MetaService.getConversationMessages(conv.id, pageAccessToken);

                if (messages.length > 0) {
                    const lastMessage = messages[messages.length - 1]; // Newest

                    // Determine sender (Lead)
                    // Logic: If message 'from' is NOT the page, it's the lead
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const leadData = messages.find((m: any) => m.from.id !== page.id)?.from;

                    if (leadData) {
                        // Find or Create Lead
                        let lead = await prisma.lead.findFirst({
                            where: {
                                companyId,
                                // For social, we might store the scoped ID in a social_id field, 
                                // but for now using a "fake" email based on ID if not exists
                                email: `${conv.platform === 'INSTAGRAM' ? 'ig' : 'fb'}-${leadData.id}@social.user`
                            }
                        });

                        if (!lead) {
                            lead = await prisma.lead.create({
                                data: {
                                    companyId,
                                    name: leadData.username || leadData.name || 'Social User',
                                    email: `${conv.platform === 'INSTAGRAM' ? 'ig' : 'fb'}-${leadData.id}@social.user`,
                                    source: conv.platform,
                                    status: 'NEW'
                                }
                            });
                        }

                        // Find or Create Conversation
                        let dbConv = await prisma.conversation.findFirst({
                            where: {
                                companyId,
                                leadId: lead.id,
                                channel: conv.platform
                            }
                        });

                        if (!dbConv) {
                            dbConv = await prisma.conversation.create({
                                data: {
                                    companyId,
                                    leadId: lead.id,
                                    channel: conv.platform,
                                    status: 'OPEN',
                                    lastMessageAt: new Date(lastMessage.created_time),
                                    lastMessagePreview: lastMessage.message || '[Media]',
                                    metadata: {
                                        pageId: page.id,
                                        recipientId: leadData.id
                                    }
                                }
                            });
                        } else {
                            // Update existing conversation metadata if needed
                            await prisma.conversation.update({
                                where: { id: dbConv.id },
                                data: {
                                    metadata: {
                                        pageId: page.id,
                                        recipientId: leadData.id
                                    }
                                }
                            });
                        }

                        // Sync Messages
                        for (const msg of messages) {
                            const exists = await prisma.message.findFirst({
                                where: {
                                    conversationId: dbConv!.id,
                                    content: msg.message || '[Media]',
                                    createdAt: new Date(msg.created_time)
                                }
                            });

                            if (!exists) {
                                await prisma.message.create({
                                    data: {
                                        conversationId: dbConv!.id,
                                        content: msg.message || '[Media]',
                                        direction: msg.from.id === page.id ? 'OUTBOUND' : 'INBOUND',
                                        status: 'SENT', // assumed
                                        senderId: msg.from.id === page.id ? userId : lead.id,
                                        createdAt: new Date(msg.created_time)
                                    }
                                });
                                totalMessages++;
                            }
                        }
                        totalConversations++;
                    }
                }
            }
        }

        return {
            success: true,
            conversationsSynced: totalConversations,
            messagesSynced: totalMessages
        };
    }
};
