"use client";

import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Phone, MessageSquare } from "lucide-react";

export function QuickActions() {
    return (
        <div className="flex flex-wrap items-center gap-2 mt-2">
            <Button size="sm" className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all duration-200 ease-out border-none rounded-xl px-4">
                <Plus className="h-4 w-4" />
                <span className="font-semibold tracking-wide text-xs">Nuevo Deal</span>
            </Button>

            <div className="flex items-center space-x-1.5 bg-white/60 backdrop-blur-xl p-1 border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-lg px-3 transition-colors">
                    <UserPlus className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">Lead</span>
                </Button>
                <div className="w-[1px] h-4 bg-slate-200/80" />
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/80 rounded-lg px-3 transition-colors">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">Llamada</span>
                </Button>
                <div className="w-[1px] h-4 bg-slate-200/80" />
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50/80 rounded-lg px-3 transition-colors">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">Nota</span>
                </Button>
            </div>
        </div>
    );
}
