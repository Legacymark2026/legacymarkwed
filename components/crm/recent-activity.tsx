"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Activity as ActivityIcon, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Activity {
    id: string;
    type: string;
    title: string;
    desc: string;
    date: Date;
}

interface ActivityProps {
    activities: Activity[];
}

export function RecentActivity({ activities }: ActivityProps) {
    if (!activities || activities.length === 0) {
        return (
            <Card className="col-span-4 lg:col-span-3 h-full bg-white/70 backdrop-blur-xl border border-slate-200/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-slate-500 uppercase tracking-widest text-sm font-bold">Actividad Reciente</CardTitle>
                    <CardDescription>Sin actividad registrada.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="col-span-4 lg:col-span-3 h-full bg-white/70 backdrop-blur-xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between pb-4 relative z-10 border-b border-slate-100/50 mb-2">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-slate-400 to-slate-600 p-1.5 rounded-lg shadow-sm">
                        <ActivityIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">
                            Actividad Reciente
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-400 mt-0.5">
                            Historial automático de eventos
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-5 relative z-10 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="relative border-l-2 border-slate-200/50 ml-6 space-y-6 pt-2 pb-4 mt-2">
                    {activities.map((activity, index) => {
                        const isDeal = activity.type === 'DEAL';
                        return (
                            <motion.div
                                key={`${activity.type}-${activity.id}-${index}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                className="relative pl-6 group/item"
                            >
                                {/* Puntero del timeline */}
                                <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 h-10 w-10 ring-4 ring-white rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className={`text-[10px] font-bold ${isDeal ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {isDeal ? <ArrowUpCircle className="w-3.5 h-3.5" /> : <ArrowDownCircle className="w-3.5 h-3.5" />}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="bg-slate-50/50 border border-slate-200/40 rounded-xl p-3 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1 flex-1">
                                            <p className="text-sm font-bold text-slate-700 leading-snug">{activity.title}</p>
                                            <p className="text-xs text-slate-400 font-medium leading-relaxed">{activity.desc}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${isDeal ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                                        {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: es })}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
