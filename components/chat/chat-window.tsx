"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, Bot, User } from "lucide-react";
import { getMessages, sendMessage } from "@/actions/chat";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    content: string | null;
    direction: string; // INBOUND, OUTBOUND
    createdAt: Date;
    senderId: string | null;
    status: string;
}

interface ChatWindowProps {
    conversationId: string;
    visitorId: string;
}

export function ChatWindow({ conversationId, visitorId }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Poll for messages
    useEffect(() => {
        const fetchMessages = async () => {
            const result = await getMessages(conversationId);
            if (result.success && result.messages) {
                setMessages(result.messages);
            }
        };

        fetchMessages(); // Initial fetch
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, [conversationId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const content = inputValue;
        setInputValue(""); // Optimistic clear

        // Optimistic add
        const tempMessage: Message = {
            id: crypto.randomUUID(),
            content,
            direction: "INBOUND",
            createdAt: new Date(),
            senderId: null,
            status: "SENDING",
        };
        setMessages((prev) => [...prev, tempMessage]);

        setIsLoading(true);
        try {
            const result = await sendMessage(conversationId, content);
            if (!result.success) {
                // Handle error (maybe remove temp message or show error)
                console.error("Failed to send");
            }
        } catch (error) {
            console.error("Error sending:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[450px] w-[350px] bg-background border rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-primary p-4 flex items-center space-x-3 text-primary-foreground">
                <Avatar className="h-10 w-10 border-2 border-white/20">
                    <AvatarImage src="/images/support-agent.png" />
                    <AvatarFallback className="bg-primary-foreground text-primary">LM</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold text-sm">LegacyMark Support</h3>
                    <p className="text-xs opacity-80 flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                        En línea ahora
                    </p>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-muted/30">
                <div className="space-y-4">
                    <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-lg rounded-tl-none text-sm max-w-[80%] shadow-sm">
                            ¡Hola! Bienvenido a LegacyMark. ¿En qué podemos ayudarte hoy?
                        </div>
                    </div>

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full",
                                msg.direction === "INBOUND" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "p-3 rounded-lg text-sm max-w-[80%] shadow-sm",
                                    msg.direction === "INBOUND"
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-muted text-foreground rounded-tl-none"
                                )}
                            >
                                {msg.content}
                                <div className="text-[10px] opacity-70 mt-1 text-right">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 bg-background border-t">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={!inputValue.trim() || isLoading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                    Desarrollado con ❤️ por LegacyMark
                </p>
            </div>
        </div>
    );
}
