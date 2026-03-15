import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreditCard, Plus, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { UserRole } from "@/types/auth";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function AdminInvoicesPage() {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const role = session.user.role as UserRole;
    if (role === UserRole.GUEST || role === UserRole.EXTERNAL_CLIENT) {
        redirect("/dashboard/unauthorized");
    }

    const invoices = await prisma.invoice.findMany({
        where: { companyId: session.user.companyId },
        orderBy: { createdAt: 'desc' },
    });

    const statusMap: Record<string, { label: string, color: string }> = {
        "DRAFT_AWAITING_PAYMENT": { label: "Por Pagar", color: "bg-amber-500/10 text-amber-400 ring-amber-500/20" },
        "PAID": { label: "Pagado", color: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" },
        "CANCELLED": { label: "Cancelado", color: "bg-red-500/10 text-red-500 ring-red-500/20" }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] p-6 md:p-8 bg-slate-950 text-slate-200 overflow-y-auto w-full max-w-[1600px] mx-auto">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <CreditCard className="h-6 w-6 text-teal-400" />
                        Finanzas y Cobranza (B2B)
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Gestiona los cobros recurrentes y facturas emitidas hacia el Portal del Cliente.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/dashboard/admin/invoices/new"
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-700 disabled:pointer-events-none disabled:opacity-50 bg-teal-600 text-white shadow hover:bg-teal-500 h-9 px-4 py-2"
                    >
                        <Plus className="h-4 w-4" />
                        Emitir Factura
                    </Link>
                </div>
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 bg-slate-950/50 border-b border-slate-800 uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-medium">Cliente / Empresa</th>
                                <th scope="col" className="px-6 py-4 font-medium">Concepto</th>
                                <th scope="col" className="px-6 py-4 font-medium">Monto</th>
                                <th scope="col" className="px-6 py-4 font-medium">Estado</th>
                                <th scope="col" className="px-6 py-4 font-medium">Fecha Emisión</th>
                                <th scope="col" className="px-6 py-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No se han emitido facturas.
                                    </td>
                                </tr>
                            ) : invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-slate-200">{invoice.clientName}</div>
                                        <div className="text-xs text-slate-500 font-mono">#{invoice.id.split('-')[0].toUpperCase()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 max-w-[250px] truncate">
                                        {invoice.serviceDescription}
                                    </td>
                                    <td className="px-6 py-4 font-mono">
                                        <div className="text-slate-200">${invoice.finalAmount.toLocaleString()} {invoice.currency}</div>
                                        <div className="text-[10px] text-slate-500">De ${invoice.totalAmount.toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusMap[invoice.status]?.color || 'bg-slate-800 text-slate-300 ring-slate-700'}`}>
                                            {statusMap[invoice.status]?.label || invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                                        {format(new Date(invoice.createdAt), "dd MMM yyyy", { locale: es })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-400">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {invoice.paymentUrl && (
                                                <a href={invoice.paymentUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:text-teal-400 hover:bg-teal-500/10 rounded border border-transparent hover:border-teal-500/20 transition-colors" title="Ver Link de Pago (Stripe)">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
