"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { CRM_CURRENCY_FORMATTER, CRM_TOOLTIP_STYLE, chartConfig, CRM_CHART_COLORS } from "@/lib/crm-charts-config";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface ForecastData {
    name: string;
    weighted: number;
    total: number;
}

interface RevenueForecastProps {
    data: ForecastData[];
}

export function RevenueForecast({ data }: RevenueForecastProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="col-span-4 h-full bg-white/70 backdrop-blur-xl border border-slate-200/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-slate-500 uppercase tracking-widest text-sm font-bold">Forecast de Ingresos</CardTitle>
                    <CardDescription>No hay suficientes datos para generar proyecciones.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="col-span-4 h-full bg-white/70 backdrop-blur-xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between relative z-10 pb-2">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg shadow-sm">
                        <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">
                            Forecast Mensual
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-400">
                            Proyección a 3 meses (Probable vs Total)
                        </CardDescription>
                    </div>
                </div>
                <Link href="/dashboard/admin/crm/pipeline" className="text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50 p-2 rounded-full">
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </CardHeader>
            <CardContent className="px-2 pb-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="h-[320px] w-full mt-4"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorWeighted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={CRM_CHART_COLORS.primary} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={CRM_CHART_COLORS.primary} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={CRM_CHART_COLORS.quaternary} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={CRM_CHART_COLORS.quaternary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                            <XAxis
                                dataKey="name"
                                {...chartConfig.xAxis}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                                style={{ fontSize: '11px', fontWeight: 600, fill: '#64748b' }}
                            />
                            <YAxis
                                {...chartConfig.yAxis}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                                tickFormatter={(value) => `$${value / 1000}k`}
                                style={{ fontSize: '11px', fontWeight: 600, fill: '#94a3b8' }}
                            />
                            <Tooltip
                                formatter={(value: any) => CRM_CURRENCY_FORMATTER.format(Number(value))}
                                contentStyle={{ ...CRM_TOOLTIP_STYLE, borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)' }}
                                itemStyle={{ fontWeight: 700, fontSize: '13px' }}
                                labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '8px' }}
                            />

                            <Area
                                type="monotone"
                                dataKey="total"
                                name="Máximo Potencial"
                                stroke={CRM_CHART_COLORS.quaternary}
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                                animationDuration={1500}
                            />
                            <Area
                                type="monotone"
                                dataKey="weighted"
                                name="Probable (Weighted)"
                                stroke={CRM_CHART_COLORS.primary}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorWeighted)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </CardContent>
        </Card>
    );
}
