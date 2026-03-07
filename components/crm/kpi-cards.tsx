"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Briefcase, TrendingUp, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// CountUp hook for numbers
function useCountUp(end: number, duration: number = 1000) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Ease out quart
            const easeOut = 1 - Math.pow(1 - percentage, 4);
            setCount(end * easeOut);

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return count;
}

interface StatsProps {
    stats: {
        pipelineValue: number;
        activeDeals: number;
        winRate: number;
        avgDealSize: number;
    }
}

export function KPICards({ stats }: StatsProps) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    });

    // Animate values
    const pipelineAnimated = useCountUp(stats.pipelineValue, 1500);
    const activeDealsAnimated = useCountUp(stats.activeDeals, 1500);
    const winRateAnimated = useCountUp(stats.winRate, 1500);
    const avgDealAnimated = useCountUp(stats.avgDealSize, 1500);

    const cards = [
        {
            title: "Pipeline Total",
            value: formatter.format(pipelineAnimated),
            trend: "+20.1%",
            isPositive: true,
            icon: DollarSign,
            color: "text-blue-600",
            bgLight: "bg-blue-50",
            borderRef: "group-hover:border-blue-500/50"
        },
        {
            title: "Deals Activos",
            value: Math.floor(activeDealsAnimated).toString(),
            trend: "+5 esta sem.",
            isPositive: true,
            icon: Briefcase,
            color: "text-indigo-600",
            bgLight: "bg-indigo-50",
            borderRef: "group-hover:border-indigo-500/50"
        },
        {
            title: "Win Rate",
            value: `${Math.floor(winRateAnimated)}%`,
            trend: "+2.4%",
            isPositive: true,
            icon: Target,
            color: "text-emerald-600",
            bgLight: "bg-emerald-50",
            borderRef: "group-hover:border-emerald-500/50"
        },
        {
            title: "Ticket Promedio",
            value: formatter.format(avgDealAnimated),
            trend: "-1.2%",
            isPositive: false,
            icon: TrendingUp,
            color: "text-amber-600",
            bgLight: "bg-amber-50",
            borderRef: "group-hover:border-amber-500/50"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, idx) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                >
                    <Card className={`group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 ${card.borderRef}`}>
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 group-hover:translate-x-full ease-out -skew-x-12" style={{ left: '-100%', width: '200%' }} />

                        <CardContent className="p-6 relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">{card.title}</p>
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter font-mono">
                                        {card.value}
                                    </h3>
                                </div>
                                <div className={`p-3 rounded-2xl ${card.bgLight} ${card.color} ring-1 ring-inset ring-black/5 shadow-sm group-hover:scale-110 transition-transform duration-300 ease-out`}>
                                    <card.icon className="w-5 h-5 stroke-[2.5]" />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${card.isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-rose-50 text-rose-700 border-rose-200/60'}`}>
                                    {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {card.trend}
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium tracking-wide">vs mes anterior</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
