"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Lightbulb, Map, FileCode, BarChart3, Rocket, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    {
        id: "A",
        title: "Audit (Auditoría)",
        subtitle: "DIAGNÓSTICO PROFUNDO",
        desc: "Análisis forense de tu infraestructura digital actual, detectando cuellos de botella y fugas de eficiencia.",
        icon: Search,
        tech_spec: "ANALYSIS_PROTOCOL_V4",
        color: "text-teal-600",
        bg: "bg-teal-50",
        border: "border-teal-200",
        load: "84%"
    },
    {
        id: "C",
        title: "Conceptualize (Conceptualización)",
        subtitle: "ESTRATEGIA DE ARQUITECTURA",
        desc: "Diseño de soluciones personalizadas donde fusionamos objetivos de negocio con factibilidad técnica.",
        icon: Lightbulb,
        tech_spec: "BLUEPRINT_GEN_2.0",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        load: "92%"
    },
    {
        id: "T",
        title: "Tactical Plan (Plan Táctico)",
        subtitle: "HOJA DE RUTA OPERATIVA",
        desc: "Desglose granular de hitos, asignación de recursos y definición de KPIs críticos para el éxito.",
        icon: Map,
        tech_spec: "OPS_MATRIX_LOADED",
        color: "text-teal-500",
        bg: "bg-teal-50",
        border: "border-teal-200",
        load: "76%"
    },
    {
        id: "I",
        title: "Implement (Implementación)",
        subtitle: "DESPLIEGUE DE CÓDIGO",
        desc: "Ejecución ágil con estándares de calidad Enterprise. CI/CD pipelines y testing automatizado.",
        icon: FileCode,
        tech_spec: "EXEC_CORE_ACTIVE",
        color: "text-cyan-600",
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        load: "100%"
    },
    {
        id: "O",
        title: "Optimize (Optimización)",
        subtitle: "MAXIMIZACIÓN DE RENDIMIENTO",
        desc: "Ajuste fino basado en datos reales. A/B testing y monitoreo de latencia para mejora continua.",
        icon: BarChart3,
        tech_spec: "DATA_LOOP_SYNC",
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        load: "98%"
    },
    {
        id: "N",
        title: "Next Steps (Siguientes Pasos)",
        subtitle: "ESCALAMIENTO GLOBAL",
        desc: "Planificación de la siguiente fase de crecimiento. Preparación para carga masiva y nuevos mercados.",
        icon: Rocket,
        tech_spec: "SCALE_UP_READY",
        color: "text-teal-600",
        bg: "bg-teal-50",
        border: "border-teal-200",
        load: "89%"
    },
];

export function Methodology() {
    const [activeStep, setActiveStep] = useState(0);
    const [progress, setProgress] = useState(0);

    // Auto-rotate steps if not interacting
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % STEPS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setProgress((activeStep / (STEPS.length - 1)) * 100);
    }, [activeStep]);

    return (
        <section className="bg-slate-50 py-32 text-slate-900 relative overflow-hidden border-y border-gray-200">
            {/* 1. Technical Background Overlay - Light Mode */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-40" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#ffffff_0%,transparent_100%)] opacity-80" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
                {/* 2. Header with 'System Status' aesthetic */}
                <div className="text-center mb-12 sm:mb-24 relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-white text-teal-700 text-xs font-mono mb-4 uppercase tracking-widest shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                        </span>
                        Protocolo Activo v2.4
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-4 sm:mb-6 text-slate-900">
                        SISTEMA <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">A.C.T.I.O.N™</span>
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                        Nuestro framework propietario de ejecución. Una metodología probada para transformar caos en resultados predecibles y escalables.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-stretch">
                    {/* 3. Steps Navigation (Timeline) */}
                    <div className="flex flex-col justify-between py-4 relative">
                        {/* Connecting Line - Darker for visibility */}
                        <div className="absolute left-[2.25rem] top-8 bottom-8 w-px bg-gray-200 hidden lg:block">
                            <motion.div
                                className="w-full bg-gradient-to-b from-teal-500 to-emerald-500"
                                initial={{ height: "0%" }}
                                animate={{ height: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        <div className="space-y-4">
                            {STEPS.map((step, index) => (
                                <div
                                    key={step.id}
                                    onMouseEnter={() => setActiveStep(index)}
                                    className={cn(
                                        "group relative flex items-center gap-6 p-4 rounded-xl cursor-pointer transition-all duration-300 border",
                                        activeStep === index
                                            ? "bg-white border-teal-200 shadow-md"
                                            : "bg-transparent border-transparent hover:bg-white/50"
                                    )}
                                >
                                    {/* ID Circle */}
                                    <div className={cn(
                                        "relative h-14 w-14 rounded-full flex items-center justify-center font-bold text-xl border transition-all duration-300 z-10",
                                        activeStep === index
                                            ? "bg-teal-600 text-white border-teal-500 scale-110 shadow-lg"
                                            : "bg-white text-gray-400 border-gray-200 group-hover:border-teal-300 group-hover:text-teal-600 shadow-sm"
                                    )}>
                                        {step.id}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className={cn(
                                                "font-bold text-lg transition-colors duration-300",
                                                activeStep === index ? "text-slate-900" : "text-gray-500 group-hover:text-slate-700"
                                            )}>
                                                {step.title}
                                            </h3>
                                            {activeStep === index && <ArrowRight size={16} className="text-teal-600" />}
                                        </div>
                                        <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">{step.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Visualization Panel - Light Mode Card */}
                    <div className="relative lg:h-auto min-h-[350px] sm:min-h-[500px] flex items-center">
                        <div className="absolute inset-0 bg-white rounded-3xl border border-gray-200 md:rotate-2 hover:rotate-0 transition-transform duration-500 ease-out-expo shadow-2xl">
                            {/* Inner Grid */}
                            <div className="absolute inset-4 border border-gray-100 rounded-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />

                                {/* Corner Decorations */}
                                <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-teal-200 rounded-tl-2xl" />
                                <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-teal-200 rounded-br-2xl" />

                                <div className="absolute top-6 right-6 flex gap-2">
                                    <div className="h-2 w-2 rounded-full bg-red-400" />
                                    <div className="h-2 w-2 rounded-full bg-yellow-400" />
                                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Active Step Content Reveal */}
                        <div className="relative z-10 w-full p-8 md:p-12">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative"
                                >
                                    {/* Large Background Letter */}
                                    <span className="absolute -top-20 -left-10 text-[12rem] font-black text-slate-100 select-none pointer-events-none">
                                        {STEPS[activeStep].id}
                                    </span>

                                    {/* Tech Icon */}
                                    {(() => {
                                        const ActiveIcon = STEPS[activeStep].icon;
                                        return (
                                            <div className={cn(
                                                "inline-flex p-4 rounded-2xl mb-8 border backdrop-blur-sm shadow-sm",
                                                STEPS[activeStep].bg,
                                                STEPS[activeStep].border
                                            )}>
                                                <ActiveIcon className={cn("h-10 w-10", STEPS[activeStep].color)} />
                                            </div>
                                        );
                                    })()}

                                    {/* Tech Spec Label */}
                                    <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200">
                                        <CodeIcon />
                                        {STEPS[activeStep].tech_spec}
                                    </div>

                                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
                                        {STEPS[activeStep].title}
                                    </h3>

                                    <p className="text-xl text-slate-600 leading-relaxed border-l-4 border-teal-500 pl-6">
                                        {STEPS[activeStep].desc}
                                    </p>

                                    <div className="mt-8 flex items-center gap-4 text-sm text-gray-500 font-mono">
                                        <span>STATUS:</span>
                                        <span className="text-teal-600 font-bold">OPTIMAL</span>
                                        <span className="w-px h-4 bg-gray-300" />
                                        <span>LOAD:</span>
                                        <span className="text-teal-600 font-bold">{STEPS[activeStep].load}</span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function CodeIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    )
}
