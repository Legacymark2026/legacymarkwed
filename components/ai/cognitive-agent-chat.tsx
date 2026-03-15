"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, X, Loader2, Sparkles, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function CognitiveAgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const userText = input.trim();
      if (!userText || isLoading) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: userText,
      };
      const assistantId = crypto.randomUUID();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok || !res.body) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Vercel AI data stream protocol: each line starts with "0:" for text chunks
          for (const line of chunk.split("\n")) {
            if (line.startsWith("0:")) {
              try {
                const textPiece = JSON.parse(line.slice(2));
                fullText += textPiece;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fullText } : m
                  )
                );
              } catch {
                // skip malformed lines
              }
            }
          }
        }

        if (!fullText) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content:
                      "✅ Comando ejecutado. Consulta el CRM para ver los cambios.",
                  }
                : m
            )
          );
        }
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: `⚠️ Error: ${err.message || "Error de conexión con el Agente de IA."}`,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages]
  );

  return (
    <>
      {/* Botón Flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 left-6 md:bottom-8 p-4 bg-teal-600 hover:bg-teal-500 text-white rounded-full shadow-[0_0_20px_rgba(20,184,166,0.8)] transition-all z-[9999] flex items-center justify-center group"
          aria-label="Abrir Agente de IA"
        >
          <Sparkles className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Ventana del Chat */}
      <div
        className={cn(
          "fixed bottom-24 left-6 md:bottom-8 w-[380px] h-[560px] bg-slate-950 border border-teal-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-[9999] origin-bottom-left",
          isOpen
            ? "scale-100 opacity-100"
            : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-500/20 rounded-md">
              <Bot className="h-4 w-4 text-teal-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Agente Cognitivo
              </h3>
              <p className="text-[10px] text-teal-500 tracking-wider font-mono">
                EN LÍNEA · ACCESO CRM ACTIVO
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
              <Terminal className="h-10 w-10 text-slate-600 mb-2" />
              <p className="text-sm text-slate-400 max-w-[250px]">
                Soy tu Copiloto C-Level. Puedo consultar el CRM, generar
                facturas y operar la agencia por ti.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {[
                  "Genera una factura de ejemplo",
                  "Busca mis tratos activos",
                  "¿Qué puede hacer el Agente?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    className="text-[10px] px-2 py-1 bg-slate-800 rounded-full text-slate-300 border border-slate-700 hover:bg-slate-700"
                  >
                    &quot;{prompt}&quot;
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[85%] rounded-xl p-3 text-sm flex flex-col gap-1",
                m.role === "user"
                  ? "bg-teal-600 text-white self-end ml-auto"
                  : "bg-slate-800 text-slate-200 self-start border border-slate-700"
              )}
            >
              {m.role === "assistant" && !m.content && isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
              ) : (
                <span className="whitespace-pre-wrap leading-relaxed">
                  {m.content}
                </span>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-slate-900 border-t border-slate-800 shrink-0"
        >
          <div className="relative flex items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ordena un comando o haz una petición..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder:text-slate-600 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-md disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
