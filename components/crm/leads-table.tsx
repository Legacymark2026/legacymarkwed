"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { bulkUpdateLeads } from "@/actions/crm";
import { CreateLeadDialog } from "@/components/crm/create-lead-dialog";
import { Search, Download, ChevronUp, ChevronDown, X, Mail, Phone } from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Lead {
    id: string; name: string | null; email: string; phone: string | null;
    company: string | null; status: string; source: string; score: number;
    assignedTo: string | null; createdAt: Date; tags: string[];
    utmSource: string | null; utmCampaign: string | null; convertedAt: Date | null;
}

interface Props {
    leads: Lead[];
    total: number;
    companyId: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    NEW: { label: "Nuevo", color: "text-sky-700", bg: "bg-sky-50 border-sky-200" },
    CONTACTED: { label: "Contactado", color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
    QUALIFIED: { label: "Calificado", color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
    CONVERTED: { label: "Convertido", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    LOST: { label: "Perdido", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

const SOURCE_ICONS: Record<string, string> = {
    GOOGLE: "🔍", FACEBOOK: "📘", INSTAGRAM: "📷", LINKEDIN: "💼",
    REFERRAL: "🤝", DIRECT: "🌐", EMAIL: "✉️", TIKTOK: "🎵", ORGANIC: "🌱",
};

function ScoreBar({ score }: { score: number }) {
    const color = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-400";
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
            </div>
            <span className="text-xs font-bold text-slate-600 tabular-nums w-7">{score}</span>
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function LeadsTable({ leads, total, companyId }: Props) {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterSource, setFilterSource] = useState("");
    const [sortCol, setSortCol] = useState<string>("createdAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [bulkStatus, setBulkStatus] = useState("");
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    const toggleAll = () => { if (selected.size === leads.length) setSelected(new Set()); else setSelected(new Set(leads.map((l) => l.id))); };
    const toggle = (id: string) => setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
    const sortBy = (col: string) => { if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("asc"); } };

    const filtered = leads.filter((l) => {
        const q = search.toLowerCase();
        const matchSearch = !q || l.name?.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.company?.toLowerCase().includes(q);
        const matchStatus = !filterStatus || l.status === filterStatus;
        const matchSource = !filterSource || l.source === filterSource;
        return matchSearch && matchStatus && matchSource;
    });

    const sorted = [...filtered].sort((a, b) => {
        const av = a[sortCol as keyof Lead]; const bv = b[sortCol as keyof Lead];
        if (av === null || av === undefined) return 1;
        if (bv === null || bv === undefined) return -1;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
    });

    const handleBulkAction = useCallback(async () => {
        if (!bulkStatus || selected.size === 0) return;
        setIsBulkLoading(true);
        await bulkUpdateLeads(Array.from(selected), { status: bulkStatus });
        setSelected(new Set()); setBulkStatus(""); setIsBulkLoading(false);
    }, [bulkStatus, selected]);

    const SortIcon = ({ col }: { col: string }) => sortCol === col
        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        : <div className="w-3 h-3" />;

    return (
        <div className="space-y-4">
            {/* ── Filters bar ── */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text" placeholder="Buscar por nombre, email, empresa..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400">
                    <option value="">Todos los estados</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400">
                    <option value="">Todas las fuentes</option>
                    {Object.keys(SOURCE_ICONS).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                    <Download className="w-4 h-4" /> Exportar
                </button>
                <CreateLeadDialog companyId={companyId} />
                <div className="ml-auto text-sm text-slate-400">{filtered.length} de {total} leads</div>
            </div>

            {/* ── Bulk actions bar ── */}
            {selected.size > 0 && (
                <div className="flex items-center gap-3 px-5 py-3 bg-teal-50 border border-teal-200 rounded-xl">
                    <span className="text-sm font-bold text-teal-700">{selected.size} seleccionados</span>
                    <div className="flex-1 flex items-center gap-2">
                        <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="text-sm px-3 py-1.5 rounded-lg border border-teal-300 bg-white focus:outline-none">
                            <option value="">Cambiar estado…</option>
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <button onClick={handleBulkAction} disabled={!bulkStatus || isBulkLoading} className="px-3 py-1.5 text-sm font-bold bg-teal-600 text-white rounded-lg disabled:opacity-40 transition-opacity hover:bg-teal-700">
                            {isBulkLoading ? "..." : "Aplicar"}
                        </button>
                    </div>
                    <button onClick={() => setSelected(new Set())} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* ── Table ── */}
            <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="w-10 px-4 py-3">
                                <input type="checkbox" checked={selected.size === leads.length && leads.length > 0} onChange={toggleAll} className="rounded border-slate-300 text-teal-600 focus:ring-teal-400" />
                            </th>
                            {[
                                { key: "name", label: "Lead" },
                                { key: "status", label: "Estado" },
                                { key: "source", label: "Fuente" },
                                { key: "score", label: "Score" },
                                { key: "company", label: "Empresa" },
                                { key: "createdAt", label: "Fecha" },
                            ].map((col) => (
                                <th key={col.key} className="px-4 py-3 text-left font-semibold text-slate-500 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => sortBy(col.key)}>
                                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                                </th>
                            ))}
                            <th className="px-4 py-3 text-left font-semibold text-slate-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {sorted.map((lead) => {
                            const cfg = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG["NEW"];
                            return (
                                <tr key={lead.id} className={`hover:bg-slate-50/50 transition-colors ${selected.has(lead.id) ? "bg-teal-50/30" : ""}`}>
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggle(lead.id)} className="rounded border-slate-300 text-teal-600 focus:ring-teal-400" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/dashboard/admin/crm/leads/${lead.id}`} className="group flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-sky-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                {(lead.name || lead.email)[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">{lead.name || "Sin nombre"}</p>
                                                <p className="text-xs text-slate-400">{lead.email}</p>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <span>{SOURCE_ICONS[lead.source] ?? "🌐"}</span>
                                            {lead.source}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3"><ScoreBar score={lead.score} /></td>
                                    <td className="px-4 py-3 text-slate-500">{lead.company || "—"}</td>
                                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: es })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            {lead.email && <a href={`mailto:${lead.email}`} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all"><Mail className="w-3.5 h-3.5" /></a>}
                                            {lead.phone && <a href={`tel:${lead.phone}`} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Phone className="w-3.5 h-3.5" /></a>}
                                            <Link href={`/dashboard/admin/crm/leads/${lead.id}`} className="px-2.5 py-1 text-xs font-bold text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">Ver</Link>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {sorted.length === 0 && (
                            <tr><td colSpan={8} className="px-4 py-16 text-center text-slate-400">No hay leads con estos filtros.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
