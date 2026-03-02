import { getConversations, getMessages } from "@/actions/inbox";
import { InboxLayout } from "@/components/inbox/inbox-layout";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ChatWindow } from "@/components/inbox/chat-window";
import { RightSidebar } from "@/components/inbox/right-sidebar";
import { EmptyState } from "@/components/inbox/empty-state";

export default async function InboxConversationPage({
    params,
    searchParams
}: {
    params: Promise<{ conversationId: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { conversationId } = await params;
    // Fetch conversations list for sidebar (companyId is handled server-side via session)
    const { data: conversations } = await getConversations({ limit: 50 });

    // Fetch active conversation details & messages
    // In a real app, optimize to not re-fetch list if possible (stream it), but server components make this pattern common.
    // Ideally getConversationById would be a separate efficient query
    const activeConversation = conversations?.find((c: any) => c.id === conversationId);

    // If not found in list (e.g. pagination), fetch individually (omitted for MVP brevity)

    const { data: messages } = await getMessages(conversationId);

    // Fetch Full Lead Intelligence (Phase 4)
    let leadDetails = null;
    if (activeConversation?.lead?.id) {
        const { getLeadDetails } = await import("@/actions/inbox");
        leadDetails = await getLeadDetails(activeConversation.lead.id);
    }

    // Mock Current User
    const currentUserId = "user-123";

    return (
        <InboxLayout
            conversationList={
                <ConversationList conversations={conversations as any || []} />
            }
            leadProfile={
                <div className="h-full bg-slate-50 border-l border-slate-200">
                    <RightSidebar
                        conversation={activeConversation as any}
                        leadDetails={leadDetails}
                    />
                </div>
            }
        >
            <div className="flex-1 h-full min-w-0">
                {activeConversation ? (
                    <ChatWindow
                        conversation={activeConversation as any}
                        messages={messages || []}
                        currentUserId={currentUserId}
                    />
                ) : (
                    <EmptyState title="Conversation not found" description="The conversation you are looking for does not exist or has been deleted." />
                )}
            </div>
        </InboxLayout>
    );
}
