"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, X, Loader2, Sparkles, Terminal, GripHorizontal } from "lucide-react";
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

  // Draggable position — starts top-right, clear of all UI
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Set initial position on client (top-right area, safe from sidebar)
  useEffect(() => {
    setPos({ x: window.innerWidth - 80, y: 80 });
    setInitialized(true);
  }, []);

  // Drag handlers via Pointer Events
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (isOpen) return; // Don't drag when chat is open
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  }, [isOpen, pos]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    const newX = Math.min(Math.max(e.clientX - dragOffset.current.x, 0), window.innerWidth - 64);
    const newY = Math.min(Math.max(e.clientY - dragOffset.current.y, 0), window.innerHeight - 64);
    setPos({ x: newX, y: newY });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const userText = input.trim();
      if (!userText || isLoading) return;

      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: userText };
      const assistantId = crypto.randomUUID();
      const assistantMsg: Message = { id: assistantId, role: "assistant", content: "" };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.ok || !res.body) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            // Vercel AI stream protocol: text chunks start with "0:"
            if (line.startsWith("0:")) {
              try {
                const textPiece = JSON.parse(line.slice(2));
                if (typeof textPiece === "string") {
                  fullText += textPiece;
                  setMessages((prev) =>
                    prev.map((m) => m.id === assistantId ? { ...m, content: fullText } : m)
                  );
                }
              } catch { /* skip malformed */ }
            }
            // SSE format: data: {"choices":[{"delta":{"content":"..."}}]}
            else if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                const piece = data?.choices?.[0]?.delta?.content
                  ?? data?.candidates?.[0]?.content?.parts?.[0]?.text
                  ?? "";
                if (piece) {
                  fullText += piece;
                  setMessages((prev) =>
                    prev.map((m) => m.id === assistantId ? { ...m, content: fullText } : m)
                  );
                }
              } catch { /* skip malformed */ }
            }
            // Plain text fallback (non-protocol streaming)
            else if (line && !line.startsWith("2:") && !line.startsWith("d:") && !line.startsWith("e:") && !line.startsWith("8:") && !line.startsWith("f:")) {
              const cleaned = line.trim();
              if (cleaned && !/^\d+:/.test(cleaned)) {
                fullText += cleaned + " ";
                setMessages((prev) =>
                  prev.map((m) => m.id === assistantId ? { ...m, content: fullText.trim() } : m)
                );
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.startsWith("0:")) {
          try {
            const textPiece = JSON.parse(buffer.slice(2));
            if (typeof textPiece === "string" && textPiece) {
              fullText += textPiece;
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, content: fullText } : m)
              );
            }
          } catch { /* skip */ }
        }

        if (!fullText.trim()) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: "⚠️ El agente no retornó texto. Verifica que GOOGLE_GENERATIVE_AI_API_KEY esté configurada en el .env del servidor." }
                : m
            )
          );
        }
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `⚠️ Error: ${err.message || "Error de conexión con el Agente."}` }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages]
  );

  if (!initialized) return null;

  // Determine chat window position: try to open it to the left of the button,
  // adjusting so it stays within the viewport
  const chatWidth = 380;
  const chatHeight = 540;
  const chatX = pos.x + 64 + chatWidth > window.innerWidth
    ? Math.max(pos.x - chatWidth - 8, 8)
    : pos.x + 68;
  const chatY = pos.y + chatHeight > window.innerHeight
    ? Math.max(window.innerHeight - chatHeight - 16, 8)
    : pos.y;

  return (
    <>
      {/* Floating Draggable Button */}
      <button
        ref={buttonRef}
        onClick={() => { if (!dragging.current) setIsOpen((v) => !v); }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ left: pos.x, top: pos.y, touchAction: "none" }}
        className={cn(
          "fixed p-4 rounded-full text-white transition-colors z-[9999] flex items-center justify-center group select-none cursor-grab active:cursor-grabbing shadow-[0_0_24px_rgba(20,184,166,0.7)]",
          isOpen ? "bg-teal-500" : "bg-teal-600 hover:bg-teal-500"
        )}
        aria-label="Agente de IA"
      >
        {isOpen
          ? <X className="h-6 w-6" />
          : <Sparkles className="h-6 w-6 group-hover:scale-110 transition-transform" />
        }
      </button>

      {/* Chat Window — anchored near the button */}
      {isOpen && (
        <div
          style={{ left: chatX, top: chatY, width: chatWidth, height: chatHeight }}
          className="fixed bg-slate-950 border border-teal-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9998]"
        >
          {/* Header — drag handle */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-teal-500/20 rounded-md">
                <Bot className="h-4 w-4 text-teal-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Agente Cognitivo</h3>
                <p className="text-[10px] text-teal-500 tracking-wider font-mono">EN LÍNEA · ACCESO CRM ACTIVO</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GripHorizontal className="h-4 w-4 text-slate-600" />
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                <Terminal className="h-10 w-10 text-slate-600 mb-2" />
                <p className="text-sm text-slate-400 max-w-[250px]">
                  Soy tu Copiloto C-Level. Puedo consultar el CRM, generar facturas y operar la agencia.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {["Genera una factura de ejemplo", "Busca mis tratos activos", "¿Qué puedes hacer?"].map((p) => (
                    <button key={p} type="button" onClick={() => setInput(p)}
                      className="text-[10px] px-2 py-1 bg-slate-800 rounded-full text-slate-300 border border-slate-700 hover:bg-slate-700">
                      &quot;{p}&quot;
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id}
                className={cn(
                  "max-w-[85%] rounded-xl p-3 text-sm flex flex-col gap-1",
                  m.role === "user"
                    ? "bg-teal-600 text-white self-end ml-auto"
                    : "bg-slate-800 text-slate-200 self-start border border-slate-700"
                )}
              >
                {m.role === "assistant" && !m.content && isLoading
                  ? <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                  : <span className="whitespace-pre-wrap leading-relaxed">{m.content}</span>
                }
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
            <div className="relative flex items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ordena un comando o haz una petición..."
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder:text-slate-600 disabled:opacity-50"
              />
              <button type="submit" disabled={!input.trim() || isLoading}
                className="absolute right-2 p-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-md disabled:opacity-50 transition-colors">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
