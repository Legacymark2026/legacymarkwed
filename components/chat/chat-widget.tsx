"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { LeadForm } from "./lead-form";
import { ChatWindow } from "./chat-window";
import { cn } from "@/lib/utils";

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [visitorId, setVisitorId] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [hasUnread, setHasUnread] = useState(false); // Simulate unread for engagement

    // Check for existing session on mount
    useEffect(() => {
        const storedVid = localStorage.getItem("chat_visitor_id");
        const storedCid = localStorage.getItem("chat_conversation_id");

        if (storedVid) setVisitorId(storedVid);
        if (storedCid) setConversationId(storedCid);

        // Simulate a notification after 5 seconds if not open
        const timer = setTimeout(() => {
            if (!isOpen) setHasUnread(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, [isOpen]);

    const handleChatStarted = (cid: string, vid: string) => {
        setConversationId(cid);
        setVisitorId(vid);
        localStorage.setItem("chat_conversation_id", cid);
        localStorage.setItem("chat_visitor_id", vid);
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setHasUnread(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none font-sans">

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="mb-4 pointer-events-auto shadow-2xl rounded-2xl overflow-hidden border border-white/20 bg-background/80 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10"
                    >
                        {conversationId && visitorId ? (
                            <ChatWindow conversationId={conversationId} visitorId={visitorId} onClose={() => setIsOpen(false)} />
                        ) : (
                            <div className="w-[380px] bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl overflow-hidden">
                                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-xl tracking-tight">LegacyMark AI</h3>
                                        <p className="text-sm text-white/80 mt-1">Soporte y Ventas en tiempo real</p>
                                    </div>
                                    {/* Decorative circles */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-500/30 rounded-full blur-xl"></div>
                                </div>
                                <LeadForm onChatStarted={handleChatStarted} />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="group relative pointer-events-auto">
                {/* Tooltip / Engagement Message */}
                <AnimatePresence>
                    {!isOpen && (isHovered || hasUnread) && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 10, scale: 0.9 }}
                            className="absolute right-16 top-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 text-foreground px-4 py-2 rounded-xl shadow-xl border border-border/50 whitespace-nowrap text-sm font-medium mr-2"
                        >
                            {hasUnread ? "¡Tienes un mensaje nuevo! 👋" : "¿Podemos ayudarte?"}
                            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-zinc-900 border-r border-b border-border/50 rotate-[-45deg]"></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleChat}
                    className={cn(
                        "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center relative",
                        isOpen
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rotate-0"
                            : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
                    )}
                >
                    {/* Unread Badge */}
                    {!isOpen && hasUnread && (
                        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                        </span>
                    )}

                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown className="h-6 w-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <MessageCircle className="h-6 w-6 fill-current" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </div>
    );
}
