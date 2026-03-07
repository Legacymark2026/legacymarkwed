"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight, TrendingDown } from "lucide-react";
import { useMemo } from "react";
import { motion } from "framer-motion";

interface FunnelProps {
    data: { name: string; value: number }[];
}

// Colores en gradiente de alta conversión
const STAGE_COLORS = [
    "from-indigo-600 to-blue-500",
    "from-blue-500 to-sky-400",
    "from-sky-400 to-emerald-400",
    "from-emerald-400 to-teal-400",
    "from-teal-400 to-green-400"
];

export function SalesFunnel({ data }: FunnelProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="col-span-4 h-full bg-white/70 backdrop-blur-xl border border-slate-200/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-slate-500 uppercase tracking-widest text-sm font-bold">Embudo de Ventas</CardTitle>
                    <CardDescription>Sin datos de progresión de deals.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // Calcular Drop-off rates
    const funnelData = useMemo(() => {
        const sortedData = [...data].sort((a, b) => b.value - a.value); // Asumimos orden descendente natural del funnel
        let maxVal = sortedData[0]?.value || 1;

        return sortedData.map((stage, i) => {
            const nextVal = sortedData[i + 1]?.value;
            const dropOff = nextVal !== undefined ? ((stage.value - nextVal) / stage.value) * 100 : 0;
            const percentageOfMax = (stage.value / maxVal) * 100;

            return {
                ...stage,
                percentageOfMax,
                dropOff: isNaN(dropOff) ? 0 : dropOff,
                hasNext: nextVal !== undefined
            };
        });
    }, [data]);

    return (
        <Card className="col-span-4 h-full bg-white/70 backdrop-blur-xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between relative z-10 pb-6">
                <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">
                        Embudo de Ventas Isométrico
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-400 mt-1">
                        Conversión por etapa y métricas de caída (Drop-off rate)
                    </CardDescription>
                </div>
                <Link href="/dashboard/admin/crm/pipeline" className="text-slate-400 hover:text-emerald-500 transition-colors bg-slate-50 hover:bg-emerald-50 p-2 rounded-full shadow-sm">
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </CardHeader>
            <CardContent className="relative z-10 px-6 pb-6">
                <div className="flex flex-col space-y-3">
                    {funnelData.map((stage, idx) => (
                        <div key={stage.name} className="relative w-full">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{stage.name}</span>
                                <span className="text-sm font-black font-mono text-slate-800">{stage.value}</span>
                            </div>

                            {/* Barra 3D Izométrica */}
                            <div className="w-full h-8 bg-slate-100 rounded-lg shadow-inner overflow-visible relative group-hover/stage">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(stage.percentageOfMax, 5)}%` }}
                                    transition={{ duration: 1, delay: idx * 0.15, ease: "easeOut" }}
                                    className={`h-full bg-gradient-to-r ${STAGE_COLORS[idx % STAGE_COLORS.length]} rounded-lg relative flex items-center shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.3)]`}
                                >
                                    {/* Reflejo 3D */}
                                    <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20 rounded-t-lg" />
                                </motion.div>
                            </div>

                            {/* Indicador de Drop-off (Caída) */}
                            {stage.hasNext && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 + (idx * 0.1) }}
                                    className="absolute -bottom-3 right-8 z-20 flex items-center gap-1 bg-white border border-rose-100 px-2 py-0.5 rounded-full shadow-md transform translate-y-1/2"
                                >
                                    <TrendingDown className="w-3 h-3 text-rose-500" />
                                    <span className="text-[10px] font-bold text-rose-600 font-mono">-{stage.dropOff.toFixed(1)}%</span>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
