"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface LeaderboardEntry {
    name: string;
    wonValue: number;
}

interface SalesLeaderboardProps {
    data: LeaderboardEntry[];
}

export function SalesLeaderboard({ data }: SalesLeaderboardProps) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    });

    const fireKudos = (name: string, e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
            particleCount: 80,
            spread: 60,
            origin: { x, y },
            colors: ['#3b82f6', '#10b981', '#f59e0b'],
            zIndex: 9999
        });
        toast.success(`¡Kudos enviados a ${name}! 🚀`);
    };

    return (
        <Card className="col-span-4 lg:col-span-3 h-full bg-white/70 backdrop-blur-xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between pb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg shadow-sm">
                        <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">
                            Leaderboard
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-400">
                            Top Performers (Por Monto)
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="space-y-4 pt-2">
                    {data.length === 0 ? (
                        <p className="text-sm text-center font-medium text-slate-400 py-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">No hay datos de rendimiento registrados aún.</p>
                    ) : (
                        data.map((user, index) => {
                            const isTop1 = index === 0;
                            const isTop2 = index === 1;
                            const isTop3 = index === 2;

                            return (
                                <motion.div
                                    key={user.name}
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
                                    className={`flex items-center p-3 rounded-2xl transition-all duration-300 border ${isTop1 ? 'bg-gradient-to-r from-amber-50 to-white/50 border-amber-200/50 shadow-sm' :
                                            isTop2 ? 'bg-gradient-to-r from-slate-100 to-white/50 border-slate-200/60' :
                                                isTop3 ? 'bg-gradient-to-r from-orange-50/50 to-white/50 border-orange-200/50' :
                                                    'bg-transparent border-transparent hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="mr-3 flex-shrink-0 w-6 flex justify-center">
                                        {isTop1 ? <Trophy className="w-5 h-5 text-amber-500 drop-shadow-md" /> :
                                            isTop2 ? <Medal className="w-5 h-5 text-slate-400" /> :
                                                isTop3 ? <Medal className="w-5 h-5 text-orange-400" /> :
                                                    <span className="text-sm font-bold text-slate-400">{index + 1}</span>}
                                    </div>
                                    <Avatar className={`h-10 w-10 ring-2 ${isTop1 ? 'ring-amber-400 ring-offset-2' : isTop2 ? 'ring-slate-300 ring-offset-1' : isTop3 ? 'ring-orange-300 ring-offset-1' : 'ring-transparent'}`}>
                                        <AvatarFallback className="bg-slate-800 text-white font-bold text-xs tracking-wider">
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-0.5 flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-700 truncate">{user.name}</p>
                                        <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 truncate">
                                            {isTop1 ? 'MVB (Most Valuable Biller)' : 'Sales Representative'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="font-mono font-bold text-slate-800 tracking-tighter bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">
                                            {formatter.format(user.wonValue)}
                                        </span>
                                        <button
                                            onClick={(e) => fireKudos(user.name, e)}
                                            className="opacity-0 group-hover:opacity-100 md:opacity-100 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-sm transition-all"
                                            title="Repartir Kudos"
                                        >
                                            <PartyPopper className="w-2.5 h-2.5" /> Kudos
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
