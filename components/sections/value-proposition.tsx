"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { Target, Cpu, Activity, Globe } from "lucide-react";

export function ValueProposition() {
    const values = [
        {
            icon: Target,
            title: "Visión a Ejecución",
            description: "No solo entregamos reportes. Construimos, desplegamos y operamos la infraestructura que tu negocio necesita.",
        },
        {
            icon: Cpu,
            title: "Ingeniería de Primer Nivel",
            description: "Código limpio, arquitecturas escalables y estándares de seguridad bancaria. Calidad técnica sin compromisos.",
        },
        {
            icon: Activity,
            title: "Crecimiento Predecible",
            description: "Sistemas de adquisición de clientes automatizados que generan resultados constantes, mes a mes.",
        }
    ];

    return (
        <section className="bg-white py-24 sm:py-32 relative overflow-hidden border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Header */}
                    <div className="lg:col-span-3 text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance">
                            Ingeniería de Valor <span className="text-teal-600">Absoluto</span>
                        </h2>
                        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                            Eliminamos la fricción entre la estrategia y la tecnología.
                        </p>
                    </div>

                    {values.map((val, idx) => (
                        <TiltCard key={idx} val={val} index={idx} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function TiltCard({ val, index }: { val: any, index: number }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    // Use proper refs for Framer Motion
    const ref = useRef<HTMLDivElement>(null);

    const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]); // Reduced rotation for card
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const clientX = e.clientX;
        const clientY = e.clientY;

        const xPct = (clientX - rect.left) / width - 0.5;
        const yPct = (clientY - rect.top) / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            style={{ perspective: 1000 }}
            className="group h-full"
        >
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="bg-slate-50 p-10 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 h-full flex flex-col items-start relative overflow-hidden"
            >
                {/* Holographic BG on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="h-16 w-16 bg-white border border-gray-200 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10 shadow-sm group-hover:bg-teal-50">
                    <val.icon size={32} strokeWidth={1.5} />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10 group-hover:text-teal-700 transition-colors">
                    {val.title}
                </h3>

                <p className="text-slate-600 leading-relaxed text-lg relative z-10 font-medium">
                    {val.description}
                </p>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 text-gray-200 group-hover:text-teal-100 transition-colors pointer-events-none">
                    <Globe size={48} strokeWidth={0.5} />
                </div>
            </motion.div>
        </motion.div>
    );
}
