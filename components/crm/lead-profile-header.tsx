"use client";

import { Mail, Phone } from "lucide-react";

interface Props {
    lead: {
        id: string;
        name: string | null;
        email: string;
        phone: string | null;
        jobTitle: string | null;
        company: string | null;
        score: number;
        message: string | null;
    };
    children?: React.ReactNode; // For status and tags components
}

// Helper for the radial score chart
function ScoreRadial({ score }: { score: number }) {
    const size = 64;
    const strokeWidth = 6;
    const center = size / 2;
    const radius = center - strokeWidth;
    const dashArray = 2 * Math.PI * radius;
    const dashOffset = dashArray * ((100 - score) / 100);

    const scoreColorClass = score >= 70 ? "text-emerald-500" : score >= 40 ? "text-amber-500" : "text-rose-500";
    const bgGradient = score >= 70 ? "from-emerald-500/10 to-teal-500/10" : score >= 40 ? "from-amber-500/10 to-orange-500/10" : "from-red-500/10 to-rose-500/10";

    return (
        <div className={`relative flex items-center justify-center p-2 rounded-2xl bg-gradient-to-br ${bgGradient} border border-white/50 backdrop-blur-sm self-start shrink-0`}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-slate-200" />
                <circle
                    cx={center} cy={center} r={radius} fill="none" strokeWidth={strokeWidth}
                    className={`${scoreColorClass} transition-all duration-1000 ease-in-out`}
                    strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeLinecap="round"
                />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center`}>
                <span className={`text-xl font-black ${scoreColorClass}`}>{score}</span>
            </div>
        </div>
    );
}

export function LeadProfileHeader({ lead, children }: Props) {
    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-xl shadow-slate-200/40 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 opacity-50 pointer-events-none" />
            <div className="h-1.5 bg-gradient-to-r from-teal-400 via-sky-500 to-violet-500 transform origin-left transition-transform duration-500 group-hover:scale-x-105" />

            <div className="p-6 sm:p-8 relative z-10 flex flex-col sm:flex-row gap-6 items-start">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-sky-500 flex items-center justify-center text-white font-black text-3xl shrink-0 shadow-lg shadow-teal-200/50 transform transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                    {(lead.name || lead.email)[0].toUpperCase()}
                </div>

                {/* Identity info */}
                <div className="min-w-0 flex-1 w-full space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600">
                                {lead.name || "Sin nombre"}
                            </h1>
                            {lead.jobTitle && <p className="text-slate-600 font-semibold mt-1.5">{lead.jobTitle}</p>}
                            {lead.company && (
                                <p className="text-sm font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                                    <span className="text-slate-400">🏢</span> {lead.company}
                                </p>
                            )}
                        </div>

                        {/* Interactive Children (Status, Tags) */}
                        <div className="flex flex-col gap-3 sm:items-end">
                            {children}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5 pt-1">
                        {lead.email && (
                            <a href={`mailto:${lead.email}`} className="group/btn flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md hover:shadow-teal-100 transition-all shadow-sm">
                                <Mail className="w-4 h-4 text-slate-400 group-hover/btn:text-teal-500 transition-colors" />
                                {lead.email}
                            </a>
                        )}
                        {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="group/btn flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md hover:shadow-teal-100 transition-all shadow-sm">
                                <Phone className="w-4 h-4 text-slate-400 group-hover/btn:text-teal-500 transition-colors" />
                                {lead.phone}
                            </a>
                        )}
                        {lead.phone && (
                            <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-100/50 transition-all shadow-sm">
                                <span className="text-base leading-none">💬</span> WhatsApp
                            </a>
                        )}
                    </div>
                </div>

                {/* Score component inline */}
                <div className="hidden sm:block">
                    <ScoreRadial score={lead.score} />
                </div>
            </div>

            {/* Mobile Score & Message */}
            {(lead.message || lead.score !== undefined) && (
                <div className="px-6 sm:px-8 pb-6 bg-slate-50/50 border-t border-slate-100/50 mt-2 pt-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        {lead.message && (
                            <div className="flex-1 space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    Mensaje del Lead
                                </p>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium bg-white/60 p-4 rounded-2xl border border-white shadow-sm">
                                    "{lead.message}"
                                </p>
                            </div>
                        )}
                        <div className="sm:hidden flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-white shadow-sm self-start">
                            <span className="text-xs font-bold text-slate-500 uppercase">Score del Lead</span>
                            <ScoreRadial score={lead.score} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
