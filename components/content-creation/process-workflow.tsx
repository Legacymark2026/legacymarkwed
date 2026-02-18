"use client";

import { motion } from "framer-motion";
import {
    Lightbulb,
    Clapperboard,
    Scissors,
    Rocket,
    CheckCircle,
    Calendar
} from "lucide-react";
import { useState } from "react";

const steps = [
    {
        icon: Lightbulb,
        title: "Estrategia & Concepto",
        description: "Analizamos tendencias y diseñamos ganchos virales adaptados a tu nicho.",
        time: "Día 1-2"
    },
    {
        icon: Calendar,
        title: "Planificación",
        description: "Guiones palabra-por-palabra y storyboards listos para aprobar.",
        time: "Día 3"
    },
    {
        icon: Clapperboard,
        title: "Producción Premium",
        description: "Grabación con equipo de cine (o dirección remota para ti).",
        time: "Día 4-5"
    },
    {
        icon: Scissors,
        title: "Edición Hormozi-Style",
        description: "Cortes dinámicos, subtítulos animados y sound design inmersivo.",
        time: "Día 6-8"
    },
    {
        icon: Rocket,
        title: "Distribución & Optimización",
        description: "Publicación estratégica y análisis de métricas para iterar.",
        time: "Día 9+"
    }
];

export default function ProcessWorkflow() {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <section className="py-20 bg-white text-slate-900 relative">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4 text-slate-900">Nuestro Proceso Viral</h2>
                    <p className="text-slate-600">De la idea al "Para Ti" en tiempo récord.</p>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Central Scroll Beam */}
                    <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 -translate-x-1/2 md:translate-x-[-1px]">
                        <motion.div
                            className="w-full bg-gradient-to-b from-teal-500 via-sky-500 to-teal-500"
                            initial={{ height: "0%" }}
                            whileInView={{ height: "100%" }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                    </div>

                    <div className="space-y-16 relative">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? "md:flex-row-reverse" : ""
                                    } pl-12 md:pl-0`}
                                onMouseEnter={() => setActiveStep(idx)}
                            >
                                {/* Content Side */}
                                <div className={`flex-1 w-full ${idx % 2 === 0 ? "text-left md:text-left" : "text-left md:text-right"}`}>
                                    <div className={`p-6 rounded-2xl border transition-all duration-500 group relative overflow-hidden shadow-sm ${activeStep === idx
                                        ? "bg-white border-teal-500/50 shadow-xl shadow-teal-500/10"
                                        : "bg-white border-slate-200 hover:border-slate-300"
                                        }`}>

                                        {activeStep === idx && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-transparent opacity-50 pointer-events-none" />
                                        )}

                                        <h3 className={`text-xl font-bold mb-2 transition-colors ${activeStep === idx ? "text-teal-600" : "text-slate-900"}`}>{step.title}</h3>
                                        <p className="text-slate-500 text-sm mb-4 leading-relaxed">{step.description}</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider ${activeStep === idx ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
                                            ⏱ {step.time}
                                        </span>
                                    </div>
                                </div>

                                {/* Center Icon */}
                                <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 flex-shrink-0 z-10">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${activeStep >= idx
                                        ? "bg-teal-600 border-teal-200 text-white scale-125 shadow-lg"
                                        : "bg-white border-slate-200 text-slate-400"
                                        }`}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Empty Side for layout balance */}
                                <div className="flex-1 hidden md:block"></div>

                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="mt-20 text-center"
                >
                    <div className="p-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl border border-slate-700 inline-block max-w-3xl w-full text-white shadow-2xl">
                        <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                        <h3 className="text-3xl font-bold mb-4">¿Listo para escalar tu contenido?</h3>
                        <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                            Agenda una auditoría gratuita de 15 minutos. Analizaremos tu perfil actual y te daremos 3 ideas virales personalizadas, sin compromiso.
                        </p>
                        <button className="px-8 py-4 bg-teal-500 text-white font-bold rounded-lg hover:scale-105 hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20">
                            Agendar Auditoría Gratis
                        </button>
                        <p className="mt-4 text-xs text-slate-400">Solo 3 cupos disponibles para esta semana.</p>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
