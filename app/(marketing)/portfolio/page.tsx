"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Code2, Layers,
    Zap,
    Layout, Database, Terminal, Cpu,
    Box, Monitor, PenTool, Trophy, Shield, Brain, ArrowUpRight, FolderOpen
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTranslations } from "next-intl";

// --- ULTRA-PREMIUM, HIGH PERFORMANCE VISUAL FX COMPONENTS ---

// 1. Animated Counter (Stats)
const StatsCounter = ({ value, label }: { value: string, label: string }) => {
    return (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-sm p-4 border border-slate-800 hover:border-teal-500/30 transition-all duration-300 group">
            <div className="text-[10px] text-teal-500/70 font-mono uppercase tracking-widest mb-2 group-hover:text-teal-400 transition-colors">{label}</div>
            <div className="text-2xl font-black text-white tracking-tight">{value}</div>
        </div>
    );
};

interface ProjectStats {
    label: string;
    value: string;
}

interface Project {
    id: number;
    title: string;
    category: string;
    description: string;
    gradient: string;
    stack: React.ElementType[];
    stats: ProjectStats[];
    slug: string;
    coverImage?: string;
}

// 2. High Performance Project Card (Inspired by Home page PortfolioPreview)
const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-50px" }}
            className="group relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] rounded-sm bg-slate-900 overflow-hidden border border-slate-800 hover:border-teal-500/50 transition-all duration-500"
        >
            {/* Background Image/Gradient */}
            <div className="absolute inset-0 bg-slate-950 transition-transform duration-700 group-hover:scale-[1.03]">
                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-700 mix-blend-screen`} />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] mix-blend-screen" />
            </div>

            {/* Dark gradient overlay from bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />

            {/* Content Container */}
            <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between z-10">
                {/* Top Bar: Category & Tech Stack */}
                <div className="flex justify-between items-start">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-slate-700 bg-slate-900/60 text-slate-300 text-[10px] font-mono uppercase tracking-widest backdrop-blur-md">
                        {project.category}
                    </div>
                    <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                        {project.stack.map((Icon: React.ElementType, i: number) => (
                            <div key={i} className="p-2 bg-slate-900 rounded-sm text-slate-400 border border-slate-800 shadow-sm group-hover:text-teal-400 transition-colors">
                                <Icon size={14} strokeWidth={1.5} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="transform transition-all duration-500 group-hover:translate-y-[-5px]">
                    <div className="flex items-end justify-between mb-4">
                        <h3 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tighter uppercase font-mono group-hover:text-teal-50 transition-colors">
                            {project.title}
                        </h3>
                        {/* Hidden Link Icon fading in on hover */}
                        <div className="w-12 h-12 rounded-sm bg-slate-900 border border-slate-800 text-teal-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg group-hover:bg-teal-500 group-hover:text-slate-950 group-hover:border-teal-400 translate-y-4 group-hover:translate-y-0">
                            <ArrowUpRight size={20} strokeWidth={1.5} />
                        </div>
                    </div>

                    <div className="relative">
                        <p className="text-slate-400 max-w-2xl text-base md:text-lg mb-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500 font-light">
                            {project.description}
                        </p>

                        {/* Expandable ROI Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-0 opacity-0 overflow-hidden transition-all duration-500 group-hover:h-[84px] group-hover:opacity-100 group-hover:mt-6">
                            {project.stats.map((stat: ProjectStats, i: number) => (
                                <StatsCounter key={i} value={stat.value} label={stat.label} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Click overlay wrapper */}
            {/* Ideally this wraps the whole card in a Link, but preserving layout */}
            <Link href={`/portfolio/${project.slug}`} className="absolute inset-0 z-20">
                <span className="sr-only">View {project.title} project details</span>
            </Link>
        </motion.div>
    );
};

// 3. Simple Text Effect
const CleanTitleEffect = ({ text }: { text: string }) => {
    return (
        <span className="inline-block relative">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-500">{text}</span>
        </span>
    );
};

// 4. Tab Filter Button
const FilterTab = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={`relative px-6 py-3 text-xs md:text-sm font-bold uppercase tracking-widest transition-all duration-300 border-b-2 ${active
            ? "text-teal-400 border-teal-500 bg-teal-500/10"
            : "text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-700"
            }`}
    >
        {children}
    </button>
);

// DATA Configuration
const projectsConfig = [
    {
        id: 1,
        key: "neobank",
        gradient: "from-teal-600 via-emerald-900 to-slate-900",
        stack: [Code2, Database, Layout, Shield],
        filterCategory: "FinTech",
        slug: "neobank"
    },
    {
        id: 2,
        key: "aura",
        gradient: "from-purple-600 via-indigo-900 to-slate-900",
        stack: [Layers, PenTool, Monitor, Box],
        filterCategory: "E-Commerce",
        slug: "aura-ecommerce"
    },
    {
        id: 3,
        key: "synth",
        gradient: "from-blue-600 via-cyan-900 to-slate-900",
        stack: [Cpu, Terminal, Zap, Brain],
        filterCategory: "SaaS",
        slug: "synth-saas"
    }
];

export default function PortfolioPage() {
    const [filter, setFilter] = useState("All");
    const t = useTranslations("portfolioPage");

    // Hydrate projects with translations
    const translatedProjects = projectsConfig.map(p => ({
        ...p,
        title: t(`projects.${p.key}.title`),
        category: t(`projects.${p.key}.category`),
        description: t(`projects.${p.key}.desc`),
        stats: [
            { label: t(`projects.${p.key}.stats.s1.label`), value: t(`projects.${p.key}.stats.s1.val`) },
            { label: t(`projects.${p.key}.stats.s2.label`), value: t(`projects.${p.key}.stats.s2.val`) },
            { label: t(`projects.${p.key}.stats.s3.label`), value: t(`projects.${p.key}.stats.s3.val`) }
        ]
    }));

    return (
        <main className="bg-slate-950 min-h-screen text-slate-200 selection:bg-teal-500/30 selection:text-teal-200">
            {/* AMBIENT BACKGROUND - Performance optimized */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[800px] bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.05)_0%,transparent_60%)]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] mix-blend-screen" />
            </div>

            {/* HERO SECTION */}
            <section className="relative pt-40 pb-20 px-6 container mx-auto z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-5xl"
                >
                    <div className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-sm border border-teal-900/50 bg-slate-900/60 backdrop-blur-sm shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_#14b8a6]" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-teal-400/80">
                            {t('hero.badge')}
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black text-white leading-[0.85] tracking-tighter mb-10 uppercase">
                        {t('hero.scramble')}<br />
                        <CleanTitleEffect text={t('hero.titleHighlight')} />
                    </h1>

                    <div className="flex flex-col md:flex-row gap-12 items-start opacity-0 animate-[fade-in_1s_ease-out_0.3s_forwards]">
                        <p className="text-lg md:text-xl text-slate-400 max-w-xl font-light font-mono uppercase tracking-widest leading-relaxed border-l-2 border-teal-500/50 pl-6">
                            {t('hero.desc')}
                        </p>

                        <div className="flex gap-8">
                            <div className="text-left md:text-center">
                                <div className="text-3xl font-black text-white">{t('hero.stats.s1.val')}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-teal-500/70 mt-1">{t('hero.stats.s1.label')}</div>
                            </div>
                            <div className="text-left md:text-center">
                                <div className="text-3xl font-black text-white">{t('hero.stats.s2.val')}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-teal-500/70 mt-1">{t('hero.stats.s2.label')}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* GALLERY SECTION */}
            <section className="relative py-20 container mx-auto px-6 z-10">

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-16 justify-start border-b border-slate-800/50">
                    {[
                        { key: "All", label: t('filters.all') },
                        { key: "FinTech", label: t('filters.fintech') },
                        { key: "E-Commerce", label: t('filters.ecommerce') },
                        { key: "SaaS", label: t('filters.saas') }
                    ].map((f) => (
                        <FilterTab key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
                            {f.label}
                        </FilterTab>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid gap-8">
                    <AnimatePresence mode="popLayout">
                        {translatedProjects.filter(p => filter === "All" || p.filterCategory === filter).map((project, index) => (
                            <ProjectCard key={project.id} project={project as any} index={index} />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Load More / Request Custom */}
                <div className="mt-32 text-center">
                    <p className="font-mono text-teal-500/60 text-xs tracking-widest uppercase mb-6">{t('gallery.end')}</p>
                    <Link href="/contacto">
                        <Button variant="outline" className="h-16 px-10 border-slate-700 bg-slate-900/50 text-slate-300 uppercase tracking-widest text-xs font-bold hover:border-teal-500 hover:text-teal-400 transition-all rounded-sm backdrop-blur-sm group">
                            <FolderOpen className="mr-3 w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                            {t('gallery.req')}
                        </Button>
                    </Link>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="relative py-32 bg-slate-900 border-t border-slate-800 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-[radial-gradient(ellipse_at_bottom,rgba(20,184,166,0.1)_0%,transparent_70%)] pointer-events-none" />

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="mb-12 inline-block">
                        <div className="w-16 h-16 bg-slate-800 border-slate-700 border rounded-sm flex items-center justify-center mx-auto mb-8 shadow-lg">
                            <Trophy size={28} className="text-teal-400" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase font-mono">
                            {t('cta.title')} <span className="text-teal-400">{t('cta.titleBr')}</span>
                        </h2>
                    </div>

                    <div className="flex justify-center gap-6">
                        <Link href="/contacto">
                            <Button className="h-16 px-12 bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold uppercase tracking-widest rounded-sm transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:shadow-[0_0_50px_rgba(20,184,166,0.5)]">
                                {t('cta.btn')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
