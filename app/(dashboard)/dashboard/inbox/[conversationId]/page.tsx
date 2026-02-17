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
    const companyId = "default-company-id"; // Placeholder

    // Fetch conversations list for sidebar
    const { data: conversations } = await getConversations({ companyId });

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
            sidebar={
                <ConversationList conversations={conversations as any || []} />
            }
        >
            <div className="flex h-full">
                <div className="flex-1 min-w-0 border-r border-gray-200">
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

                {/* Marketing Brain Sidebar (Right Pane) */}
                <div className="w-80 hidden xl:block bg-white h-full">
                    <RightSidebar
                        conversation={activeConversation as any}
                        leadDetails={leadDetails}
                    />
                </div>
            </div>
        </InboxLayout>
    );
}
