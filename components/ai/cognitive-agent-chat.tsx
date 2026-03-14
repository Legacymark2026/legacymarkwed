"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Loader2, Sparkles, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export function CognitiveAgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, setInput, handleSubmit: chatSubmit, append, isLoading } = useChat({
    api: "/api/agent",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    chatSubmit(e);
  };

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
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
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
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
              <Terminal className="h-10 w-10 text-slate-600 mb-2" />
              <p className="text-sm text-slate-400 max-w-[250px]">
                Soy tu Copiloto C-Level. Puedo consultar el CRM, generar facturas y operar la agencia por ti.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <span
                  className="text-[10px] px-2 py-1 bg-slate-800 rounded-full text-slate-300 border border-slate-700 cursor-pointer hover:bg-slate-700"
                  onClick={() => { append({ role: "user", content: "Genera una factura de ejemplo" }); }}
                >
                  &quot;Genera una factura&quot;
                </span>
                <span
                  className="text-[10px] px-2 py-1 bg-slate-800 rounded-full text-slate-300 border border-slate-700 cursor-pointer hover:bg-slate-700"
                  onClick={() => { append({ role: "user", content: "Busca mis tratos activos" }); }}
                >
                  &quot;Busca mis tratos activos&quot;
                </span>
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
              {/* Tool invocations en API 4.x */}
              {(m as any).toolInvocations?.map((tool: any) => (
                <div key={tool.toolCallId} className="bg-slate-900 border border-slate-700 text-slate-400 rounded p-2 text-xs font-mono my-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> {tool.toolName}()
                  </div>
                  {tool.state === "result" && (
                    <div className="text-teal-500 pl-4 border-l-2 border-slate-800 truncate">
                      Operación en DB completada.
                    </div>
                  )}
                </div>
              ))}
              <span className="whitespace-pre-wrap leading-relaxed">{m.content}</span>
            </div>
          ))}

          {isLoading && (
            <div className="bg-slate-800 p-3 rounded-xl self-start w-fit border border-slate-700">
              <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
            </div>
          )}
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
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-md disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
