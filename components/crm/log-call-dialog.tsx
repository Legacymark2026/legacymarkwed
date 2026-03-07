"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, X } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { createDealActivity } from "@/actions/crm";

const CALL_OUTCOMES = [
    { value: "ANSWERED", label: "📞 Contestó" },
    { value: "NO_ANSWER", label: "📵 No contestó" },
    { value: "VOICEMAIL", label: "📬 Buzón de voz" },
    { value: "CALLBACK_REQUESTED", label: "🔄 Solicita devolución" },
    { value: "WRONG_NUMBER", label: "❌ Número incorrecto" },
];

interface Props {
    companyId: string;
    dealId?: string;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function LogCallDialog({ companyId, dealId, trigger, onSuccess }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        contactName: "",
        phone: "",
        outcome: "ANSWERED",
        duration: "",
        notes: "",
    });

    const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const content = `📞 Llamada con ${form.contactName || "contacto"} | ${CALL_OUTCOMES.find(o => o.value === form.outcome)?.label ?? form.outcome}${form.duration ? ` | Duración: ${form.duration} min` : ""}${form.phone ? ` | Tel: ${form.phone}` : ""}${form.notes ? `\n\nNotas: ${form.notes}` : ""}`;

            if (dealId) {
                const result = await createDealActivity(dealId, "CALL", content);
                if ("error" in result) {
                    setError(result.error ?? "Error al registrar llamada");
                    return;
                }
            }

            toast.success("✅ Llamada registrada correctamente");
            setForm({ contactName: "", phone: "", outcome: "ANSWERED", duration: "", notes: "" });
            setOpen(false);
            onSuccess?.();
            router.refresh();
        } catch {
            setError("Error inesperado. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const inputCls =
        "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all";

    const dialogContent = open && (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && !loading && setOpen(false)}
        >
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto my-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white rounded-t-3xl px-8 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white flex-shrink-0">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Registrar Llamada</h2>
                            <p className="text-xs text-slate-400">Documenta la llamada en el CRM</p>
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
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600">Nombre del contacto</label>
                                <input
                                    value={form.contactName}
                                    onChange={(e) => set("contactName", e.target.value)}
                                    placeholder="Ana García"
                                    className={inputCls}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600">Teléfono</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => set("phone", e.target.value)}
                                    placeholder="+57 300 000 0000"
                                    className={inputCls}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Resultado de la llamada <span className="text-red-400">*</span></label>
                            <select required value={form.outcome} onChange={(e) => set("outcome", e.target.value)} className={inputCls}>
                                {CALL_OUTCOMES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Duración (minutos)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.duration}
                                onChange={(e) => set("duration", e.target.value)}
                                placeholder="5"
                                className={inputCls}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Notas de la llamada</label>
                            <textarea
                                value={form.notes}
                                onChange={(e) => set("notes", e.target.value)}
                                rows={3}
                                placeholder="¿De qué se habló? Próximos pasos..."
                                className={`${inputCls} resize-none`}
                            />
                        </div>
                    </div>

                    {!dealId && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                            💡 Para asociar la llamada a un Deal específico, ábrela desde el perfil del deal.
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
                    )}

                    <div className="flex gap-3 pt-2">
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
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-700 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
                        >
                            {loading ? "Registrando…" : "Registrar Llamada ✓"}
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
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                        <Phone className="w-4 h-4" />
                        Llamada
                    </button>
                )}
            </div>
            {typeof window !== "undefined" && dialogContent
                ? createPortal(dialogContent, document.body)
                : null}
        </>
    );
}
