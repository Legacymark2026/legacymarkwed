"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

interface GoalProgressProps {
    wonValue: number;
    monthlyTarget: number;
    progress: number;
}

export function GoalProgress({ wonValue, monthlyTarget, progress }: GoalProgressProps) {
    const [simulatedWon, setSimulatedWon] = useState(wonValue);
    const [isSimulating, setIsSimulating] = useState(false);

    const displayValue = isSimulating ? simulatedWon : wonValue;
    const rawProgress = Math.min((displayValue / monthlyTarget) * 100, 100);
    const displayProgress = isNaN(rawProgress) ? 0 : rawProgress;

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    });

    return (
        <Card className="h-full bg-white/70 backdrop-blur-xl border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-emerald-50/50 opacity-20 pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg shadow-sm">
                        <Target className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">
                        Meta Mensual {isSimulating && <span className="text-blue-500 ml-1">(Simulando)</span>}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h4 className="text-4xl font-black font-mono text-slate-800 tracking-tighter">
                            {formatter.format(displayValue)}
                        </h4>
                        <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                            Ganados hasta ahora
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 shadow-sm">
                            {displayProgress.toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* 3D Thermometer Progress Bar */}
                <div className="relative h-6 w-full rounded-full bg-slate-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] overflow-hidden border border-slate-200/50 p-[3px]">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${displayProgress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.4)] relative overflow-hidden"
                    >
                        <motion.div
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                        />
                    </motion.div>
                </div>

                <div className="mt-4 flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span>$0</span>
                    <span>Objetivo: {formatter.format(monthlyTarget)}</span>
                </div>

                {/* What-If Simulator */}
                <div className="mt-8 pt-6 border-t border-slate-200/50 border-dashed relative">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Simulador de Escenarios</span>
                        <button
                            onClick={() => {
                                setIsSimulating(!isSimulating);
                                setSimulatedWon(wonValue);
                            }}
                            className={`text-[10px] px-2.5 py-1.5 rounded-md transition-all font-bold uppercase tracking-wider ${isSimulating ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            {isSimulating ? 'Cancelar Sim.' : 'Activar Sim.'}
                        </button>
                    </div>

                    <div className={`transition-all duration-500 ease-out origin-top ${isSimulating ? 'opacity-100 scale-y-100 h-auto' : 'opacity-0 scale-y-0 h-0 overflow-hidden'}`}>
                        <input
                            type="range"
                            min={wonValue}
                            max={monthlyTarget * 1.5}
                            value={displayValue}
                            onChange={(e) => setSimulatedWon(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                        />
                        <div className="flex justify-between mt-3 text-[11px] text-slate-400 font-semibold font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span>Mover para simular tratos cerrados</span>
                            <span className="text-indigo-600">+{formatter.format(displayValue - wonValue)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
