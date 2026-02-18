"use client";

import { useState } from "react";
import { initializeChat } from "@/actions/chat";
import { Loader2, User, Mail, MessageSquare, ArrowRight, Shield, Clock, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LeadFormProps {
    onChatStarted: (conversationId: string, visitorId: string) => void;
}

const TEAM_AVATARS = [
    { initials: "LM", color: "from-violet-500 to-indigo-500" },
    { initials: "AS", color: "from-pink-500 to-rose-500" },
    { initials: "JR", color: "from-amber-500 to-orange-500" },
];

function FloatingInput({
    id,
    label,
    type = "text",
    value,
    onChange,
    icon: Icon,
    required,
    placeholder,
}: {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    icon: React.ElementType;
    required?: boolean;
    placeholder?: string;
}) {
    const [focused, setFocused] = useState(false);
    const active = focused || value.length > 0;

    return (
        <div className="relative">
            <div
                className={cn(
                    "flex items-center gap-3 border rounded-xl px-4 py-3 transition-all duration-200 bg-white dark:bg-zinc-900",
                    active
                        ? "border-violet-400 dark:border-violet-600 ring-2 ring-violet-100 dark:ring-violet-900/50"
                        : "border-zinc-200 dark:border-zinc-700"
                )}
            >
                <Icon
                    className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-violet-500" : "text-zinc-400"
                    )}
                />
                <div className="flex-1 relative">
                    <label
                        htmlFor={id}
                        className={cn(
                            "absolute left-0 transition-all duration-200 pointer-events-none text-zinc-400",
                            active ? "top-0 text-[10px] text-violet-500 font-medium" : "top-1/2 -translate-y-1/2 text-sm"
                        )}
                    >
                        {label}
                    </label>
                    <input
                        id={id}
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        required={required}
                        className="w-full bg-transparent outline-none text-sm text-foreground pt-3 pb-0"
                        placeholder={active ? placeholder : ""}
                    />
                </div>
            </div>
        </div>
    );
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

        let visitorId = localStorage.getItem("chat_visitor_id");
        if (!visitorId) {
            visitorId = crypto.randomUUID();
            localStorage.setItem("chat_visitor_id", visitorId);
        }

        try {
            const result = await initializeChat({ name, email, message, visitorId });
            if (result.success && result.conversationId) {
                onChatStarted(result.conversationId, visitorId);
            } else {
                setError("Error al iniciar el chat. Por favor intenta de nuevo.");
            }
        } catch {
            setError("Algo salió mal. Por favor intenta más tarde.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-5 space-y-5">
            {/* Social Proof */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
            >
                <div className="flex -space-x-2">
                    {TEAM_AVATARS.map((a, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-bold border-2 border-white dark:border-zinc-900",
                                a.color
                            )}
                        >
                            {a.initials}
                        </div>
                    ))}
                </div>
                <div>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-xs text-muted-foreground">+200 clientes satisfechos</p>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-2 gap-2"
            >
                <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-violet-600 shrink-0" />
                    <div>
                        <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">&lt; 2 min</p>
                        <p className="text-[10px] text-muted-foreground">Tiempo de respuesta</p>
                    </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">100% Seguro</p>
                        <p className="text-[10px] text-muted-foreground">Datos protegidos</p>
                    </div>
                </div>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                {[
                    { id: "name", label: "Tu nombre", value: name, onChange: setName, icon: User, placeholder: "Ej: María García" },
                    { id: "email", label: "Tu email", type: "email", value: email, onChange: setEmail, icon: Mail, placeholder: "tu@empresa.com" },
                    { id: "message", label: "¿En qué podemos ayudarte?", value: message, onChange: setMessage, icon: MessageSquare, placeholder: "Cuéntanos tu necesidad..." },
                ].map((field, i) => (
                    <motion.div
                        key={field.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.08 }}
                    >
                        <FloatingInput {...field} required />
                    </motion.div>
                ))}

                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                <motion.button
                    type="submit"
                    disabled={isSubmitting || !name || !email || !message}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                        "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300",
                        isSubmitting || !name || !email || !message
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
                    )}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Iniciando chat...
                        </>
                    ) : (
                        <>
                            Iniciar Chat Ahora
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </motion.button>
            </form>

            <p className="text-[10px] text-center text-muted-foreground">
                Al continuar aceptas nuestra{" "}
                <a href="/privacidad" className="underline hover:text-violet-600 transition-colors">
                    política de privacidad
                </a>
            </p>
        </div>
    );
}
