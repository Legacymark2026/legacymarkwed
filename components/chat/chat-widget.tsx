"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { LeadForm } from "./lead-form";
import { ChatWindow } from "./chat-window";
import { cn } from "@/lib/utils";

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Check for existing session on mount
    useEffect(() => {
        const storedVid = localStorage.getItem("chat_visitor_id");
        const storedCid = localStorage.getItem("chat_conversation_id");

        if (storedVid) setVisitorId(storedVid);
        if (storedCid) setConversationId(storedCid);
    }, []);

    const handleChatStarted = (cid: string, vid: string) => {
        setConversationId(cid);
        setVisitorId(vid);
        localStorage.setItem("chat_conversation_id", cid);
        localStorage.setItem("chat_visitor_id", vid);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 pointer-events-auto shadow-2xl rounded-lg overflow-hidden border border-border/50 bg-background"
                    >
                        {conversationId && visitorId ? (
                            <ChatWindow conversationId={conversationId} visitorId={visitorId} />
                        ) : (
                            <div className="w-[350px] bg-background border rounded-lg shadow-xl overflow-hidden">
                                <div className="bg-primary p-4 text-primary-foreground">
                                    <h3 className="font-bold">Chat con LegacyMark</h3>
                                </div>
                                <LeadForm onChatStarted={handleChatStarted} />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="pointer-events-auto"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    size="icon"
                    className={cn(
                        "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
                        isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
                    )}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                            >
                                <X className="h-6 w-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                            >
                                <MessageCircle className="h-6 w-6" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </motion.div>

        </div>
    );
}
