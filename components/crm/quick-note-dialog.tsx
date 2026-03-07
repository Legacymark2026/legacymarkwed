"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { createDealActivity } from "@/actions/crm";

interface Props {
    companyId: string;
    dealId?: string;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function QuickNoteDialog({ companyId, dealId, trigger, onSuccess }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [note, setNote] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim()) return;
        setLoading(true);
        setError("");
        try {
            if (dealId) {
                const result = await createDealActivity(dealId, "NOTE", `📝 ${note}`);
                if ("error" in result) {
                    setError(result.error ?? "Error al guardar nota");
                    return;
                }
            }

            toast.success("✅ Nota guardada correctamente");
            setNote("");
            setOpen(false);
            onSuccess?.();
            router.refresh();
        } catch {
            setError("Error inesperado. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const dialogContent = open && (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && !loading && setOpen(false)}
        >
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md my-auto">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Nota Rápida</h2>
                            <p className="text-xs text-slate-400">Añade un comentario o recordatorio</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 pt-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600">
                            Nota <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            required
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={5}
                            placeholder="Escribe un recordatorio, observación o nota interna..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-none"
                            autoFocus
                        />
                    </div>

                    {!dealId && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                            💡 Para asociar la nota a un Deal, ábrela desde el perfil del deal.
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-40"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !note.trim()}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-sm hover:from-amber-500 hover:to-orange-600 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-amber-200 disabled:opacity-50"
                        >
                            {loading ? "Guardando…" : "Guardar Nota ✓"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <>
            <div onClick={() => setOpen(true)}>
                {trigger ?? (
                    <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        Nota
                    </button>
                )}
            </div>
            {typeof window !== "undefined" && dialogContent
                ? createPortal(dialogContent, document.body)
                : null}
        </>
    );
}
