"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewInvoicePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        clientName: "",
        serviceDescription: "",
        totalAmount: 0,
        advanceAmount: 0,
        finalAmount: 0,
        currency: "USD"
    });

    const handleCalculate = (total: number) => {
        // Por defecto, asumimos escenario 60% anticipado, 40% remanente para cobrar en el portal
        const advance = total * 0.6;
        const final = total * 0.4;
        setFormData(prev => ({
            ...prev,
            totalAmount: total,
            advanceAmount: advance,
            finalAmount: final
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const response = await fetch("/api/admin/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Error al emitir factura");

            toast.success("Factura emitida y disponible en el portal del cliente.");
            router.push("/dashboard/admin/invoices");
            router.refresh();
        } catch (error) {
            toast.error("Hubo un problema al crear la factura.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] p-6 md:p-8 bg-slate-950 text-slate-200 overflow-y-auto w-full max-w-3xl mx-auto">
            <header className="mb-8 flex items-center gap-4">
                <Link href="/dashboard/admin/invoices" className="p-2 hover:bg-slate-900 rounded-full transition-colors text-slate-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <CreditCard className="h-6 w-6 text-teal-400" />
                        Emitir Nueva Factura B2B
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Genera un documento de cobro que el cliente pagará desde su portal seguro.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
                
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300">Empresa / Cliente</label>
                        <input
                            type="text"
                            required
                            placeholder="Nombre de la Institución o Cliente..."
                            className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            value={formData.clientName}
                            onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300">Concepto de Facturación (SLA / Hito)</label>
                        <input
                            type="text"
                            required
                            placeholder="Ej. Liquidación Final Remanente (40%) Ecommerce"
                            className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            value={formData.serviceDescription}
                            onChange={(e) => setFormData(prev => ({ ...prev, serviceDescription: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Monto Global del Contrato</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                            <input
                                type="number"
                                required
                                min="1"
                                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                value={formData.totalAmount || ""}
                                onChange={(e) => handleCalculate(Number(e.target.value))}
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 opacity-80">(Sirve como referencia auditiva para el cliente)</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Monto A Recaudar (Final)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500">$</span>
                            <input
                                type="number"
                                required
                                min="1"
                                className="flex h-10 w-full rounded-md border border-teal-500/50 bg-slate-950 pl-8 pr-3 py-2 text-sm text-teal-100 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                value={formData.finalAmount || ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, finalAmount: Number(e.target.value) }))}
                            />
                        </div>
                        <p className="text-[10px] text-emerald-500 opacity-80">Este es el valor exacto que procesará Stripe en el checkout.</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
                    <Link
                        href="/dashboard/admin/invoices"
                        className="px-4 py-2 rounded-md border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-teal-500 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Emitir hacia Portal Público
                    </button>
                </div>
            </form>
        </div>
    );
}
