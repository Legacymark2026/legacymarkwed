"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Smile, Paperclip, Phone, MoreVertical, CheckCheck, Check, Minimize2, X } from "lucide-react";
import { getMessages, sendMessage } from "@/actions/chat";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    content: string | null;
    direction: string;
    createdAt: Date;
    senderId: string | null;
    status: string;
}

interface ChatWindowProps {
    conversationId: string;
    visitorId: string;
    onClose: () => void;
}

const QUICK_REPLIES = [
    "¿Cuáles son sus servicios?",
    "Quiero una cotización",
    "¿Cómo funciona?",
];

const AGENT = {
    name: "Soporte LegacyMark",
    avatar: "/images/support-agent.png",
    initials: "LM",
};

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2">
            <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={AGENT.avatar} />
                <AvatarFallback className="text-[10px] bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                    {AGENT.initials}
                </AvatarFallback>
            </Avatar>
            <div className="bg-white dark:bg-zinc-800 border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function DateSeparator({ date }: { date: Date }) {
    const label = new Date(date).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
    return (
        <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium px-2">
                {label}
            </span>
            <div className="flex-1 h-px bg-border/50" />
        </div>
    );
}

function MessageBubble({ msg, isLast }: { msg: Message; isLast: boolean }) {
    const isInbound = msg.direction === "INBOUND";
    const time = new Date(msg.createdAt).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn("flex items-end gap-2", isInbound ? "justify-end" : "justify-start")}
        >
            {!isInbound && (
                <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={AGENT.avatar} />
                    <AvatarFallback className="text-[10px] bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                        {AGENT.initials}
                    </AvatarFallback>
                </Avatar>
            )}

            <div className={cn("max-w-[75%] flex flex-col", isInbound ? "items-end" : "items-start")}>
                <div
                    className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                        isInbound
                            ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm"
                            : "bg-white dark:bg-zinc-800 border border-border/50 text-foreground rounded-bl-sm"
                    )}
                >
                    {msg.content}
                </div>
                <div className={cn("flex items-center gap-1 mt-1 px-1", isInbound ? "flex-row-reverse" : "flex-row")}>
                    <span className="text-[10px] text-muted-foreground">{time}</span>
                    {isInbound && (
                        msg.status === "SENDING"
                            ? <Check className="h-3 w-3 text-muted-foreground" />
                            : <CheckCheck className="h-3 w-3 text-violet-500" />
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export function ChatWindow({ conversationId, visitorId, onClose }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const fetchMessages = useCallback(async () => {
        const result = await getMessages(conversationId);
        if (result.success && result.messages) {
            setMessages(result.messages as Message[]);
        }
    }, [conversationId]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Auto-resize textarea
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        const el = textareaRef.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 120) + "px";
        }
    };

    const handleSend = async (content?: string) => {
        const text = content ?? inputValue;
        if (!text.trim()) return;

        setInputValue("");
        setShowQuickReplies(false);
        if (textareaRef.current) textareaRef.current.style.height = "auto";

        const tempMsg: Message = {
            id: crypto.randomUUID(),
            content: text,
            direction: "INBOUND",
            createdAt: new Date(),
            senderId: null,
            status: "SENDING",
        };
        setMessages((prev) => [...prev, tempMsg]);

        // Simulate agent typing response
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2500);

        setIsLoading(true);
        try {
            await sendMessage(conversationId, text);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col w-[380px] h-[520px] bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 flex items-center gap-3 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
                <div className="relative flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-white/30">
                            <AvatarImage src={AGENT.avatar} />
                            <AvatarFallback className="bg-white/20 text-white font-bold text-sm">
                                {AGENT.initials}
                            </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{AGENT.name}</p>
                        <p className="text-white/70 text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
                            En línea · Responde en minutos
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="relative text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
                {/* Welcome message */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-end gap-2"
                >
                    <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="text-[10px] bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                            LM
                        </AvatarFallback>
                    </Avatar>
                    <div className="bg-white dark:bg-zinc-800 border border-border/50 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm max-w-[75%]">
                        <p className="text-sm text-foreground">
                            ¡Hola! 👋 Soy el asistente de <strong>LegacyMark</strong>. ¿En qué te puedo ayudar hoy?
                        </p>
                    </div>
                </motion.div>

                {messages.map((msg, i) => (
                    <MessageBubble key={msg.id} msg={msg} isLast={i === messages.length - 1} />
                ))}

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <TypingIndicator />
                    </motion.div>
                )}

                <div ref={scrollRef} />
            </div>

            {/* Quick Replies */}
            <AnimatePresence>
                {showQuickReplies && messages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-2 flex gap-2 flex-wrap"
                    >
                        {QUICK_REPLIES.map((reply) => (
                            <button
                                key={reply}
                                onClick={() => handleSend(reply)}
                                className="text-xs px-3 py-1.5 rounded-full border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors font-medium"
                            >
                                {reply}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="px-4 py-3 bg-white dark:bg-zinc-900 border-t border-border/50 shrink-0">
                <div className="flex items-end gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-2 border border-transparent focus-within:border-violet-300 dark:focus-within:border-violet-700 transition-colors">
                    <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe un mensaje..."
                        rows={1}
                        className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground max-h-[120px] leading-relaxed py-0.5"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isLoading}
                        className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center transition-all shrink-0",
                            inputValue.trim()
                                ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30"
                                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400"
                        )}
                    >
                        <Send className="h-3.5 w-3.5" />
                    </motion.button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                    Powered by <span className="font-semibold text-violet-600">LegacyMark</span>
                </p>
            </div>
        </div>
    );
}
