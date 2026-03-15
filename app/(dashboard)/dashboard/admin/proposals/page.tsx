"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Search, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";

export default function ProposalsPage() {
    const [proposals, setProposals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/proposals");
            if (res.ok) {
                const data = await res.json();
                setProposals(data);
            }
        } catch (error) {
            console.error("Error fetching proposals:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta propuesta?")) return;
        try {
            await fetch(`/api/admin/proposals/${id}`, { method: "DELETE" });
            fetchProposals();
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    const statusColors: Record<string, string> = {
        DRAFT: "bg-slate-800 text-slate-300",
        SENT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        VIEWED: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        SIGNED: "bg-teal-500/20 text-teal-400 border-teal-500/30",
        REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-slate-950 text-slate-200 p-6 md:p-8">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <FileText className="h-6 w-6 text-teal-400" />
                        Propuestas Comerciales
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Crea y gestiona cotizaciones para tus clientes con Firma Digital.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar propuestas..."
                            className="bg-slate-900 border border-slate-800 text-sm pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 w-64"
                        />
                    </div>
                    <Link href="/dashboard/admin/proposals/new" className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                        <Plus className="h-4 w-4" />
                        Nueva Propuesta
                    </Link>
                </div>
            </header>

            <div className="bg-slate-900 overflow-hidden shadow ring-1 ring-slate-800 sm:rounded-lg">
                <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-950/50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-slate-400 sm:pl-6 uppercase tracking-wider">Título</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Cliente</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900">
                        {isLoading ? (
                            <tr><td colSpan={5} className="py-4 text-center text-sm text-slate-500">Cargando propuestas...</td></tr>
                        ) : proposals.length === 0 ? (
                            <tr><td colSpan={5} className="py-4 text-center text-sm text-slate-500">No hay propuestas creadas. Crea una nueva para comenzar.</td></tr>
                        ) : proposals.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-200 sm:pl-6">
                                    <Link href={`/dashboard/admin/proposals/${p.id}`} className="hover:text-teal-400 transition-colors">{p.title}</Link>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-400">
                                    {p.contactName || "Sin cliente"}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-slate-300">
                                    ${p.value?.toLocaleString() || "0"} {p.currency}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[p.status] || statusColors.DRAFT}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <a href={`/proposal/${p.token}`} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 transition-colors" title="Vista Cliente Pública">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                        <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 transition-colors ml-2" title="Eliminar Propuesta">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
