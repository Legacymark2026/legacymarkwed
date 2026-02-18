"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initializeChat } from "@/actions/chat";
import { Loader2 } from "lucide-react";

interface LeadFormProps {
    onChatStarted: (conversationId: string, visitorId: string) => void;
}

export function LeadForm({ onChatStarted }: LeadFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        // Generate or retrieve visitorId
        let visitorId = localStorage.getItem("chat_visitor_id");
        if (!visitorId) {
            visitorId = crypto.randomUUID();
            localStorage.setItem("chat_visitor_id", visitorId);
        }

        try {
            const result = await initializeChat({
                name,
                email,
                message,
                visitorId,
            });

            if (result.success && result.conversationId) {
                onChatStarted(result.conversationId, visitorId);
            } else {
                setError("Error al iniciar el chat. Intenta de nuevo.");
            }
        } catch (err) {
            setError("Algo salió mal. Por favor intenta más tarde.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 space-y-4">
            <div className="text-center space-y-2 mb-6">
                <h3 className="font-semibold text-lg">¡Hola! 👋</h3>
                <p className="text-sm text-muted-foreground">
                    Déjanos tus datos para que un experto te contacte si se corta la conexión.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                        id="name"
                        placeholder="Tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message">¿En qué podemos ayudarte?</Label>
                    <Input
                        id="message"
                        placeholder="Escribe tu mensaje..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    />
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Iniciando...
                        </>
                    ) : (
                        "Iniciar Chat"
                    )}
                </Button>
            </form>
        </div>
    );
}
