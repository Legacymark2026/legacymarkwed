"use client";

import { Filter } from "lucide-react";

interface EventFiltersProps {
    filters: any;
    onChange: (filters: any) => void;
}

export function EventFilters({ filters, onChange }: EventFiltersProps) {
    return (
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 overflow-hidden">
            <button
                onClick={() => onChange({ ...filters, type: 'ALL' })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filters.type === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Todos
            </button>
            <button
                onClick={() => onChange({ ...filters, type: 'ONLINE' })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filters.type === 'ONLINE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-500'}`}
            >
                Online
            </button>
            <button
                onClick={() => onChange({ ...filters, type: 'PHYSICAL' })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filters.type === 'PHYSICAL' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-orange-500'}`}
            >
                Presencial
            </button>
            <button
                onClick={() => onChange({ ...filters, type: 'HYBRID' })}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filters.type === 'HYBRID' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-purple-500'}`}
            >
                Híbrido
            </button>
        </div>
    );
}
