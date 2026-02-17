"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight, FolderOpen, Layers } from "lucide-react";

interface Project {
    id: string;
    title: string;
    slug: string;
    client?: string | null;
    coverImage?: string | null;
}

interface PortfolioPreviewProps {
    projects: Project[];
}

export function PortfolioPreview({ projects }: PortfolioPreviewProps) {
    if (!projects || projects.length === 0) return null;

    return (
        <section className="bg-white py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row md:items-end border-b border-gray-100 pb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-xs font-mono mb-4 uppercase tracking-widest shadow-sm">
                            <Layers size={12} />
                            System Archive
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                            Sistemas <span className="text-teal-600">Desplegados</span>
                        </h2>
                        <p className="mt-4 text-lg text-slate-600 max-w-xl font-medium">
                            Infraestructura digital activa en producción. Resultados auditados.
                        </p>
                    </div>
                    <Link href="/portfolio">
                        <Button variant="outline" className="text-slate-700 border-gray-200 hover:bg-slate-50 hover:text-teal-600 group">
                            <FolderOpen className="mr-2 h-4 w-4" />
                            Explorar Archivo Completo
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl bg-slate-100 border border-gray-200 hover:border-teal-200  shadow-sm hover:shadow-xl transition-all duration-500"
                        >
                            <Link href={`/portfolio/${project.slug}`} className="block h-full w-full relative">
                                {/* Image with Overlay */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                    style={{ backgroundImage: `url(${project.coverImage || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop'})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

                                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-xs font-mono text-teal-300 uppercase tracking-widest bg-slate-900/50 w-fit px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
                                                {project.client || "CONFIDENTIAL"}
                                            </p>
                                            <div className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                <ArrowUpRight size={20} />
                                            </div>
                                        </div>

                                        <h3 className="text-3xl font-bold text-white mb-2">{project.title}</h3>

                                        <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100">
                                            <p className="text-gray-300 text-sm mt-2">
                                                Click para acceder al informe detallado del proyecto ::
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
