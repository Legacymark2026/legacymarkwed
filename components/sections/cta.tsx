"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, Radio } from "lucide-react";

export function CTA() {
    return (
        <section className="relative py-32 overflow-hidden bg-white">
            {/* Background Beams - Light Mode */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,white_0%,#f0f9ff_100%)]" />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-white shadow-sm text-teal-700 text-xs font-mono mb-8 uppercase tracking-widest"
                >
                    <Radio size={12} className="animate-pulse" />
                    Secure Channel Open
                </motion.div>

                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9]">
                    Listo para <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Escalar?</span>
                </h2>

                <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-medium">
                    No más excusas. Inicia la transformación digital de tu marca hoy. Agenda una sesión de estrategia táctica.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Button size="lg" className="h-16 px-12 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-lg font-bold shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <span className="flex items-center gap-3">
                            Iniciar Misión <Rocket className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </span>
                    </Button>
                    <Button variant="outline" size="lg" className="h-16 px-12 rounded-full border-2 border-gray-200 text-slate-700 hover:border-teal-500 hover:text-teal-700 text-lg font-bold bg-white/50 backdrop-blur-sm transition-all">
                        Consultar Disponibilidad
                    </Button>
                </div>

                {/* Footer Data */}
                <div className="mt-16 pt-8 border-t border-gray-100 flex justify-center gap-8 text-sm font-mono text-gray-400">
                    <span>EST. TIME: 2-4 WEEKS</span>
                    <span>SLOTS: LIMITED</span>
                    <span>REGION: GLOBAL</span>
                </div>
            </div>
        </section>
    );
}
