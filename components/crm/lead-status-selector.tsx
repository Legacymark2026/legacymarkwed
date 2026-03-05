"use client";

import { useTransition, useState, useEffect } from "react";
import { updateLead } from "@/actions/crm";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    NEW: { label: "Nuevo", color: "text-sky-700", bg: "bg-sky-50 border-sky-200 hover:bg-sky-100" },
    CONTACTED: { label: "Contactado", color: "text-violet-700", bg: "bg-violet-50 border-violet-200 hover:bg-violet-100" },
    QUALIFIED: { label: "Calificado", color: "text-teal-700", bg: "bg-teal-50 border-teal-200 hover:bg-teal-100" },
    CONVERTED: { label: "Convertido", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
    LOST: { label: "Perdido", color: "text-red-700", bg: "bg-red-50 border-red-200 hover:bg-red-100" },
};

interface Props {
    leadId: string;
    initialStatus: string;
    isMobile?: boolean;
    canManageLeads?: boolean;
}

export function LeadStatusSelector({ leadId, initialStatus, isMobile = false, canManageLeads = false }: Props) {
    const [status, setStatus] = useState(initialStatus);
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);

    // Keep state in sync if initialStatus changes
    useEffect(() => {
        setStatus(initialStatus);
    }, [initialStatus]);

    const activeConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG["NEW"];

    async function handleStatusChange(newStatus: string) {
        if (newStatus === status) return;
        setIsOpen(false);
        const prevStatus = status;
        setStatus(newStatus); // Optimistic UI update

        startTransition(async () => {
            const res = await updateLead(leadId, { status: newStatus });
            if (res.error) {
                setStatus(prevStatus); // Revert on failure
                toast?.error?.(res.error) || alert("Error: " + res.error);
            } else {
                toast?.success?.("Estado actualizado") || alert("Estado actualizado exitosamente");
            }
        });
    }

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => canManageLeads && setIsOpen(!isOpen)}
                disabled={isPending || !canManageLeads}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${activeConfig.bg} ${activeConfig.color} ${isPending ? 'opacity-70 cursor-wait' : canManageLeads ? 'cursor-pointer hover:shadow-sm' : 'cursor-default opacity-80'}`}
            >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {activeConfig.label}
                {canManageLeads && <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className={`absolute z-50 mt-2 w-40 rounded-xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden ${isMobile ? 'bottom-full mb-2 left-0' : 'right-0 origin-top-right'}`}>
                        <div className="py-1">
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => handleStatusChange(key)}
                                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors hover:bg-slate-50 ${status === key ? config.color : 'text-slate-600'}`}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
