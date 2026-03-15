import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CreditCard, Download, CheckCircle2, ShieldCheck, Mail, Building, FileText } from "lucide-react";

interface InvoicePageProps {
    params: {
        token: string;
        locale: string;
    }
}

export default async function PublicInvoicePage({ params }: InvoicePageProps) {
    const resolvedParams = await params;
    const { token } = resolvedParams;

    try {
        const invoice = await prisma.invoice.findUnique({
            where: { token },
            include: {
                company: true,
                items: true
            }
        });

        if (!invoice) return notFound();

    const isPaid = invoice.status === 'PAID';
    const isCancelled = invoice.status === 'CANCELLED';

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-teal-500/30">
            {/* Top Navigation Bar */}
            <nav className="w-full bg-slate-900 border-b border-slate-800/60 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {invoice.company?.logoUrl ? (
                             <img src={invoice.company.logoUrl} alt={invoice.company?.name || "Empresa"} className="h-8 object-contain" />
                        ) : (
                            <div className="h-8 w-8 bg-teal-600 rounded flex items-center justify-center font-bold text-white">
                                {invoice.company?.name?.charAt(0) || "E"}
                            </div>
                        )}
                        <span className="font-semibold text-lg text-white">{invoice.company?.name || "Empresa Sin Nombre"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium">
                        {isPaid && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Pagado</span>}
                        {isCancelled && <span className="text-red-400">Anulada</span>}
                        {(!isPaid && !isCancelled) && <span className="text-amber-400">Pendiente de Pago</span>}
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Status Banner */}
                {isPaid && (
                     <div className="mb-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-emerald-400 shadow-lg shadow-emerald-500/5">
                        <CheckCircle2 className="h-6 w-6" />
                        <div>
                            <h3 className="font-semibold text-emerald-300">Pago Recibido</h3>
                            <p className="text-sm opacity-90">Gracias por tu pago. El servicio se encuentra procesado.</p>
                        </div>
                     </div>
                )}

                {/* Main Receipt Card */}
                <div className="bg-slate-900 shadow-2xl rounded-2xl overflow-hidden border border-slate-800 relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <FileText className="w-64 h-64 text-teal-500" />
                    </div>

                    <div className="p-8 md:p-12 relative z-10">
                        {/* Header details */}
                        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
                            <div>
                                <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Factura</h1>
                                <p className="text-slate-400 font-mono text-sm">Ref. #{invoice.id.split('-')[0].toUpperCase()}</p>
                            </div>
                            <div className="md:text-right">
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Fecha Emisión</p>
                                <p className="text-slate-200">{format(new Date(invoice.createdAt), "dd 'de' MMMM, yyyy", { locale: es })}</p>
                                {invoice.dueDate && (
                                    <>
                                        <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1 mt-4">Vencimiento</p>
                                        <p className="text-slate-200">{format(new Date(invoice.dueDate), "dd 'de' MMMM, yyyy", { locale: es })}</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Entities info */}
                        <div className="grid md:grid-cols-2 gap-12 mb-12 py-8 border-y border-slate-800/80">
                            <div>
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-3">Facturado A</p>
                                <h3 className="text-lg font-semibold text-white mb-2">{invoice.clientName}</h3>
                                {invoice.serviceDescription && (
                                     <p className="text-slate-400 text-sm">{invoice.serviceDescription}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-3">Emitido Por</p>
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                     <Building className="w-5 h-5 text-teal-500 opacity-70" />
                                     {invoice.company?.name || "Empresa"}
                                </h3>
                                <p className="text-slate-400 text-sm flex items-center gap-2 mb-1">
                                    <Mail className="w-4 h-4 opacity-70" /> contacto@empresa.com
                                </p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-12">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-sm font-medium text-slate-500 uppercase tracking-wider">
                                            <th className="pb-3 text-left font-medium">Descripción</th>
                                            <th className="pb-3 text-right font-medium">Cant.</th>
                                            <th className="pb-3 text-right font-medium">Precio Unit.</th>
                                            <th className="pb-3 text-right font-medium">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-slate-300">
                                        {(invoice.items && invoice.items.length > 0) ? invoice.items.map((item, i) => (
                                            <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                                <td className="py-4 font-medium text-slate-200">
                                                    {item.title}
                                                    {item.description && <span className="block text-xs text-slate-500 mt-1 font-normal">{item.description}</span>}
                                                </td>
                                                <td className="py-4 text-right tabular-nums">{item.quantity}</td>
                                                <td className="py-4 text-right tabular-nums">${item.unitPrice.toLocaleString()}</td>
                                                <td className="py-4 text-right font-medium text-white tabular-nums">${item.totalAmount.toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr className="border-b border-slate-800/50">
                                                <td colSpan={4} className="py-4 text-center text-slate-500">Sin items detallados</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Totals Section */}
                            <div className="mt-6 flex flex-col items-end w-full">
                                <div className="w-full md:w-1/2 space-y-3 text-sm">
                                    <div className="flex justify-between text-slate-400">
                                        <span>Subtotal</span>
                                        <span className="tabular-nums">${(invoice.subtotalAmount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Impuestos</span>
                                        <span className="tabular-nums">${(invoice.taxAmount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-semibold text-white pt-4 border-t border-slate-800">
                                        <span>Total</span>
                                        <span className="tabular-nums">${(invoice.totalAmount || 0).toLocaleString()} {invoice.currency}</span>
                                    </div>
                                    {(invoice.advanceAmount || 0) > 0 && (
                                        <div className="flex justify-between text-rose-400/80">
                                            <span>Monto Reservado (no exigible)</span>
                                            <span className="tabular-nums">-${(invoice.advanceAmount || 0).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xl font-bold text-teal-400 pt-4 border-t border-slate-800 mt-2">
                                        <span>Total a Pagar</span>
                                        <span className="tabular-nums">${(invoice.finalAmount || 0).toLocaleString()} {invoice.currency}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes Section */}
                        {(invoice.notes || invoice.terms) && (
                            <div className="bg-slate-950/80 rounded-lg p-5 border border-slate-800/50 text-sm mb-12">
                                {invoice.notes && (
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-slate-300 mb-1">Notas</h4>
                                        <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
                                    </div>
                                )}
                                {invoice.terms && (
                                    <div>
                                        <h4 className="font-semibold text-slate-300 mb-1">Términos y Condiciones</h4>
                                        <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">{invoice.terms}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions (Pay button) */}
                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-800/80 pt-8">
                             <div className="flex items-center gap-2 text-slate-500 text-xs">
                                <ShieldCheck className="w-4 h-4" />
                                Transacción segura procesada por Stripe Inc.
                             </div>
                             
                             {(!isPaid && !isCancelled && invoice.paymentUrl) ? (
                                <a
                                    href={invoice.paymentUrl}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-teal-500/20 hover:bg-teal-500 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ring-offset-[#020617]"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Pagar Ahora ${(invoice.finalAmount || 0).toLocaleString()} {invoice.currency}
                                </a>
                             ) : isPaid ? (
                                <div className="px-6 py-3 rounded-xl bg-slate-800/50 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" /> Módulo Pagado
                                </div>
                             ) : null}
                        </div>
                    </div>
                </div>

                {/* Footer Footer */}
                <div className="text-center mt-12 opacity-50 text-sm">
                    <p>Powered by LegacyMark Business Operations</p>
                </div>
            </main>
        </div>
    );
    } catch (error) {
        console.error("🔴 ERROR INVOICE PAGE:", error);
        return <div>Internal Server Error in Invoice Portal. Check console logs.</div>;
    }
}
