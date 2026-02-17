"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BarChart3, Target, Calendar } from "lucide-react";
import Image from "next/image";

const PROJECTS = [
    {
        id: "CS-01",
        client: "FinTech Global",
        title: "Escalado de Infraestructura",
        desc: "Migración a arquitectura serverless reduciendo latencia un 40%.",
        metric: "+240% Speed",
        tags: ["Cloud", "DevOps"],
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: "CS-02",
        client: "E-Commerce Giant",
        title: "Optimización de Conversión",
        desc: "Rediseño UX/UI enfocado en checkout y recuperación de carritos.",
        metric: "+85% Sales",
        tags: ["UX/UI", "CRO"],
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
    },
    {
        id: "CS-03",
        client: "SaaS Enterprise",
        title: "Sistema de Diseño Unificado",
        desc: "Implementación de Design System para 12 productos internos.",
        metric: "3x Dev Speed",
        tags: ["Design System", "React"],
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=2055&auto=format&fit=crop"
    }
];

export function CaseStudies() {
    return (
        <section className="bg-slate-50 py-32 relative overflow-hidden border-y border-gray-200">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

            <div className="mx-auto max-w-7xl px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-white text-teal-700 text-xs font-mono mb-4 uppercase tracking-widest shadow-sm">
                            <Target size={12} />
                            Project Holodeck
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900">
                            Resultados que <span className="text-teal-600">Definen</span>
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Live Database</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {PROJECTS.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                        >
                            {/* Image Header */}
                            <div className="relative h-48 overflow-hidden">
                                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10" />
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-sm">
                                    {project.id}
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs font-mono text-teal-600 uppercase tracking-wider mb-1 font-bold">{project.client}</p>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                                            {project.title}
                                        </h3>
                                    </div>
                                    <button className="h-8 w-8 rounded-full bg-slate-50 border border-gray-200 flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white group-hover:border-teal-500 transition-all">
                                        <ArrowUpRight size={16} />
                                    </button>
                                </div>

                                <p className="text-slate-600 text-sm mb-6 line-clamp-2">
                                    {project.desc}
                                </p>

                                {/* Footer Metrics */}
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded border border-gray-200">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-teal-700 font-bold text-sm bg-teal-50 px-2 py-1 rounded border border-teal-100">
                                        <BarChart3 size={14} />
                                        {project.metric}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
