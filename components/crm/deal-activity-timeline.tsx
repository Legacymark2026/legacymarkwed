"use client";

import { useState } from "react";
import { createDealActivity } from "@/actions/crm";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MessageSquare, Phone, Mail, Users, FileText, Plus } from "lucide-react";

interface Activity {
    id: string; type: string; content: string; createdAt: Date;
    user?: { name: string | null; image: string | null };
}

interface Props { dealId: string; activities: Activity[]; }

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
    NOTE: { icon: <FileText className="w-3.5 h-3.5" />, label: "Nota", color: "text-slate-600", bg: "bg-slate-100" },
    CALL: { icon: <Phone className="w-3.5 h-3.5" />, label: "Llamada", color: "text-teal-600", bg: "bg-teal-50" },
    EMAIL: { icon: <Mail className="w-3.5 h-3.5" />, label: "Email", color: "text-sky-600", bg: "bg-sky-50" },
    MEETING: { icon: <Users className="w-3.5 h-3.5" />, label: "Reunión", color: "text-violet-600", bg: "bg-violet-50" },
};

export function DealActivityTimeline({ dealId, activities: initial }: Props) {
    const [activities, setActivities] = useState(initial);
    const [type, setType] = useState("NOTE");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!content.trim()) return;
        setLoading(true);
        const result = await createDealActivity(dealId, type, content.trim());
        if ("success" in result) {
            setActivities([{ id: Date.now().toString(), type, content: content.trim(), createdAt: new Date(), user: undefined }, ...activities]);
            setContent("");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-5">
            {/* Add activity */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5">
                <div className="flex gap-2 mb-3">
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                        <button key={k} onClick={() => setType(k)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${type === k ? `${v.bg} ${v.color} border-current` : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                            {v.icon} {v.label}
                        </button>
                    ))}
                </div>
                <textarea
                    value={content} onChange={(e) => setContent(e.target.value)}
                    placeholder={`Añadir ${TYPE_CONFIG[type]?.label.toLowerCase()}...`}
                    rows={3}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                />
                <div className="flex justify-end mt-2">
                    <button onClick={handleAdd} disabled={loading || !content.trim()} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl disabled:opacity-40 hover:bg-teal-700 transition-colors">
                        <Plus className="w-4 h-4" /> {loading ? "Guardando…" : "Añadir"}
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative space-y-4">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-100" aria-hidden />
                {activities.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No hay actividades registradas.</p>}
                {activities.map((a) => {
                    const cfg = TYPE_CONFIG[a.type] ?? TYPE_CONFIG["NOTE"];
                    return (
                        <div key={a.id} className="flex gap-4 relative">
                            <div className={`relative z-10 w-10 h-10 rounded-full ${cfg.bg} ${cfg.color} flex items-center justify-center flex-shrink-0 border border-white shadow-sm`}>
                                {cfg.icon}
                            </div>
                            <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                                    <span className="text-xs text-slate-400">
                                        {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true, locale: es })}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                                {a.user?.name && <p className="text-xs text-slate-400 mt-2">— {a.user.name}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
