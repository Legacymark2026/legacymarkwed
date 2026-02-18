import { ChannelType, ProcessingResult } from "@/types/inbox";

export interface OutboundMessage {
    conversationId: string;
    content: string;
    attachments?: any[];
    replyToId?: string;
}

export interface InboundMessage {
    channel: ChannelType;
    externalId: string;
    content: string;
    sender: {
        id: string;
        name: string;
        avatar?: string;
    };
    attachments?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any;
}

export interface ChannelProvider {
    channel: ChannelType;
    sendMessage(message: OutboundMessage): Promise<ProcessingResult>;
    validateWebhook(request: Request): Promise<boolean>;
    parseWebhook(request: Request): Promise<InboundMessage | null>;
}
