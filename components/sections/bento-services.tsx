"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect } from "react";
import { Search, PenTool, LayoutTemplate, Briefcase, ChevronRight, BarChart3, Cloud, Code, LineChart, Globe } from "lucide-react";
import { motion } from "framer-motion";

export const BentoServices = () => {
    return (
        <div className="relative bg-white py-24 sm:py-32 overflow-hidden border-b border-gray-100">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-xs font-mono mb-6 uppercase tracking-widest"
                    >
                        <Briefcase size={12} />
                        Service Architecture
                    </motion.div>

                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        Soluciones <span className="text-teal-600">Integrales</span>
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Infraestructura digital diseñada para escalar. Desde la estrategia hasta el código.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[300px]">

                    {/* CARD 1: Large (Span 2) - Marketing */}
                    <TechCard
                        className="md:col-span-2"
                        title="Marketing Estratégico"
                        description="Campañas de alto rendimiento impulsadas por datos. ROAS optimizado."
                        icon={BarChart3}
                        bgCode="MKT_SYS_01"
                    >
                        <div className="absolute bottom-0 right-0 w-64 h-32 bg-gradient-to-t from-teal-50 to-transparent opacity-50 pointer-events-none" />
                    </TechCard>

                    {/* CARD 2: Branding */}
                    <TechCard
                        title="Branding & Identidad"
                        description="Diseño de marca que comunica autoridad y confianza."
                        icon={PenTool}
                        bgCode="DSGN_CORE"
                    />

                    {/* CARD 3: Web Dev */}
                    <TechCard
                        title="Desarrollo Web"
                        description="Sitios ultra-rápidos construidos con Next.js y React."
                        icon={LayoutTemplate}
                        bgCode="DEV_OPS"
                    />

                    {/* CARD 4: Large (Span 2) - Automation */}
                    <TechCard
                        className="md:col-span-2"
                        title="Automatización IA"
                        description="Sistemas autónomos que reducen carga operativa."
                        icon={Code}
                        bgCode="AUTO_BOT_V3"
                    >
                        {/* Abstract Vis */}
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-1 opacity-20">
                            <div className="w-2 h-12 bg-teal-500 rounded-full animate-pulse" />
                            <div className="w-2 h-8 bg-teal-500 rounded-full animate-pulse delay-75" />
                            <div className="w-2 h-16 bg-teal-500 rounded-full animate-pulse delay-150" />
                        </div>
                    </TechCard>

                    {/* CARD 5: SEO */}
                    <TechCard
                        title="SEO Técnico"
                        description="Posicionamiento orgánico para dominio de mercado."
                        icon={Search}
                        bgCode="SERP_RANK_1"
                    />

                    {/* CARD 6: Cloud */}
                    <TechCard
                        title="Infraestructura Cloud"
                        description="Hosting escalable y seguro en Vercel/AWS."
                        icon={Cloud}
                        bgCode="AWS_VPC"
                    />

                    {/* CARD 7: Analytics */}
                    <TechCard
                        title="Analítica Avanzada"
                        description="Dashboards en tiempo real para toma de decisiones."
                        icon={LineChart}
                        bgCode="DATA_LAKE"
                    />
                </div>
            </div>
        </div>
    );
};

const TechCard = ({
    className,
    title,
    description,
    icon: Icon,
    children,
    bgCode
}: {
    className?: string;
    title: string;
    description: string;
    icon: any;
    children?: React.ReactNode;
    bgCode?: string;
}) => {
    return (
        <div className={cn(
            "relative group overflow-hidden rounded-3xl bg-slate-50 border border-gray-200 p-6 md:p-8 min-h-[200px] md:min-h-0 transition-all hover:bg-white hover:shadow-xl hover:shadow-teal-900/5 hover:-translate-y-1",
            className
        )}>
            {/* Tech Decoration */}
            <div className="absolute top-4 right-4 text-[10px] font-mono text-gray-300 group-hover:text-teal-600 transition-colors uppercase tracking-widest">
                [{bgCode}]
            </div>

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center mb-6 shadow-sm group-hover:border-teal-200 group-hover:scale-110 transition-all">
                <Icon size={24} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-teal-700 transition-colors mb-2">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    {description}
                </p>
            </div>

            {children}

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
    )
}
