"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CRM_CURRENCY_FORMATTER } from "@/lib/crm-charts-config";
import { ArrowUpRight, Maximize2, X, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface Deal {
    id: string;
    title: string;
    value: number;
    stage: string;
    probability: number;
}

interface TopDealsProps {
    deals: Deal[];
}

export function TopDeals({ deals }: TopDealsProps) {
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

    return (
        <>
            <Card className="col-span-4 h-full bg-white/70 backdrop-blur-xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -ml-16 -mt-16 pointer-events-none" />

                <CardHeader className="flex flex-row items-center justify-between pb-4 relative z-10 border-b border-slate-100/50 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-lg shadow-sm">
                            <Flame className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">
                                Top Deals Priority
                            </CardTitle>
                            <CardDescription className="text-xs font-medium text-slate-400">
                                Tratos calientes próximos al cierre
                            </CardDescription>
                        </div>
                    </div>
                    <Link href="/dashboard/admin/crm/pipeline" className="text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 hover:bg-emerald-50 p-2 rounded-full shadow-sm">
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </CardHeader>
                <CardContent className="px-5 relative z-10">
                    <div className="space-y-3">
                        {deals.length === 0 ? (
                            <div className="py-8 bg-slate-50/50 rounded-xl border border-slate-200/50 border-dashed flex flex-col items-center justify-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No hay pipeline crítico</p>
                            </div>
                        ) : (
                            deals.map((deal, index) => {
                                const isSuperHot = deal.value > 10000 && deal.probability > 70;

                                return (
                                    <motion.div
                                        key={deal.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`group/item flex items-center justify-between p-3 rounded-xl transition-all duration-300 border ${isSuperHot ? 'bg-orange-50/50 border-orange-200/50 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200/60'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-bold text-sm text-slate-700">{deal.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded flex items-center gap-1 ${isSuperHot ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {isSuperHot && <Flame className="w-2.5 h-2.5" />}
                                                        Prob. {deal.probability}%
                                                    </span>
                                                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-slate-200/60 text-slate-400 font-bold bg-white/50">{deal.stage}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-black font-mono text-base text-slate-800 tracking-tighter">
                                                {CRM_CURRENCY_FORMATTER.format(deal.value)}
                                            </p>
                                            <button
                                                onClick={() => setSelectedDeal(deal)}
                                                className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg shadow-sm bg-white"
                                                title="Vista Previa Rápida"
                                            >
                                                <Maximize2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Modular Peek View Modal */}
            <AnimatePresence>
                {selectedDeal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedDeal(null)}
                            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white/90 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]"
                        >
                            <button
                                onClick={() => setSelectedDeal(null)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-6">
                                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl inline-flex shadow-sm mb-4 border border-indigo-100">
                                    <Flame className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 leading-tight mb-2">{selectedDeal.title}</h2>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{selectedDeal.stage}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor Potencial</p>
                                    <p className="text-xl font-black font-mono text-emerald-600">{CRM_CURRENCY_FORMATTER.format(selectedDeal.value)}</p>
                                </div>
                                <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Probabilidad</p>
                                    <p className="text-xl font-black font-mono text-orange-600">{selectedDeal.probability}%</p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Link
                                    href="/dashboard/admin/crm/pipeline"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all ease-out hover:-translate-y-0.5"
                                >
                                    Ir al Pipeline
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
