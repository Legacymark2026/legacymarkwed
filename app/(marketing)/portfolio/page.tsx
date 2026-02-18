"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Code2, Layers,
    Zap,
    Layout, Database, Terminal, Cpu,
    Box, Monitor, PenTool, Trophy, Shield, Brain
} from "lucide-react";
import Link from "next/link";
import { motion, useTransform, AnimatePresence, useMotionValue, useMotionTemplate } from "framer-motion";
import { useState } from "react";

// --- ULTRA-PREMIUM VISUAL FX COMPONENTS ---

// 1. Noise Overlay (Texture)
const NoiseOverlay = () => (
    <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-overlay">
        <svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'>
            <filter id='noise'>
                <feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch' />
            </filter>
            <rect width='100%' height='100%' filter='url(#noise)' />
        </svg>
    </div>
);

// 2. Animated Counter (Stats)
const AnimatedCounter = ({ value, label }: { value: string, label: string }) => {
    // Basic implementation for visual demo - in real app use framer-motion useSpring
    return (
        <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors group">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 group-hover:text-green-400 transition-colors">{label}</div>
            <div className="text-xl font-bold text-white tabular-nums tracking-tight">{value}</div>
        </div>
    );
};

// 3. 3D Tilt Project Card (Holographic)
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
    stack: React.ElementType[]; // Ideally defined as LucideIcon or similar, keeping loose for now to match usage
    stats: ProjectStats[];
}

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const xPct = (clientX - left) / width - 0.5;
        const yPct = (clientY - top) / height - 0.5;
        x.set(xPct);
        y.set(yPct);
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
        mouseX.set(0);
        mouseY.set(0);
    }

    const rotateX = useTransform(y, [-0.5, 0.5], [7, -7]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-7, 7]);
    const sheenGradient = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.15), transparent 80%)`;

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.8, type: "spring" }}
            viewport={{ once: true, margin: "-100px" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="group relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] rounded-2xl bg-black cursor-none perspective-1000"
        >
            {/* Dynamic Border Gradient */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 rounded-2xl opacity-50 group-hover:opacity-100 blur-sm transition-opacity duration-500" />

            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-950">
                {/* Background Image/Gradient */}
                <div className="absolute inset-0 bg-slate-900 transition-transform duration-700 group-hover:scale-105">
                    <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                    {/* Abstract Shapes */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-40 h-40 border border-white/20 rounded-full" />
                        <div className="absolute bottom-20 right-20 w-60 h-60 border border-white/10 rounded-full" />
                    </div>
                </div>

                {/* Holographic Sheen */}
                <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
                    style={{ background: sheenGradient }}
                />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between z-30 transform-gpu translate-z-10">
                    <div className="flex justify-between items-start">
                        <Badge className="bg-white/5 backdrop-blur-md text-white border-white/10 uppercase tracking-widest shadow-lg">
                            {project.category}
                        </Badge>
                        <div className="flex gap-2 translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            {project.stack.map((Icon: React.ElementType, i: number) => (
                                <div key={i} className="p-2 bg-black/80 backdrop-blur-md rounded-full text-slate-300 border border-white/10 shadow-lg">
                                    <Icon size={14} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="transform transition-all duration-500 group-hover:translate-y-[-10px]">
                        <h3 className="text-4xl md:text-6xl font-black text-white mb-4 leading-none tracking-tighter mix-blend-overlay opacity-80 group-hover:opacity-100 group-hover:mix-blend-normal transition-all">
                            {project.title}
                        </h3>

                        <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500">
                            <p className="text-slate-300 max-w-xl text-lg mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                {project.description}
                            </p>

                            {/* ROI Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                                {project.stats.map((stat: ProjectStats, i: number) => (
                                    <AnimatedCounter key={i} value={stat.value} label={stat.label} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Cursor Follower */}
            <motion.div
                className="absolute w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center z-40 pointer-events-none opacity-0 group-hover:opacity-100"
                style={{
                    left: 0, top: 0,
                    x: mouseX,
                    y: mouseY,
                    translateX: "-50%",
                    translateY: "-50%"
                }}
            >
                <span className="text-white font-black uppercase tracking-widest text-xs">View Case</span>
            </motion.div>
        </motion.div>
    );
}

// 4. Scramble Text (Tech Aesthetic)
const ScrambleTitle = ({ text }: { text: string }) => {
    // Simplified for demo - use framer-motion text animation normally
    return (
        <span className="inline-block relative">
            <span className="absolute top-0 left-0 -ml-[2px] text-red-500 opacity-50 mix-blend-screen animate-pulse">{text}</span>
            <span className="absolute top-0 left-0 ml-[2px] text-blue-500 opacity-50 mix-blend-screen animate-pulse delay-75">{text}</span>
            <span className="relative z-10">{text}</span>
        </span>
    );
};

// 5. Magnetic Filter Button
const FilterButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={`relative px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-500 ${active
            ? "text-white scale-110"
            : "text-slate-500 hover:text-slate-900"
            }`}
    >
        <span className="relative z-10">{children}</span>
        {active && (
            <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-black rounded-full shadow-xl"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
        )}
    </button>
);

// DATA
const projects = [
    {
        id: 1,
        title: "NEOBANK",
        category: "FinTech",
        description: "Re-architecting the core banking core. 99.99% uptime with 5M+ daily transactions.",
        gradient: "from-blue-600 via-indigo-900 to-black",
        stack: [Code2, Database, Layout, Shield],
        stats: [
            { label: "Latency", value: "12ms" },
            { label: "Uptime", value: "99.99%" },
            { label: "Transact", value: "$5B+" }
        ]
    },
    {
        id: 2,
        title: "AURA MODA",
        category: "E-Commerce",
        description: "Immersive 3D shopping experience for luxury streetwear. WebGL powered.",
        gradient: "from-purple-600 via-pink-900 to-black",
        stack: [Layers, PenTool, Monitor, Box],
        stats: [
            { label: "Returns", value: "-30%" },
            { label: "AOV", value: "$450" },
            { label: "Conversion", value: "4.8%" }
        ]
    },
    {
        id: 3,
        title: "SYNTH AI",
        category: "SaaS",
        description: "Generative AI platform with real-time scaling and edge inference.",
        gradient: "from-emerald-600 via-teal-900 to-black",
        stack: [Cpu, Terminal, Zap, Brain],
        stats: [
            { label: "Users", value: "100k+" },
            { label: "Tokens/s", value: "4M" },
            { label: "MRR", value: "$80k" }
        ]
    }
];

export default function PortfolioPage() {
    const [filter, setFilter] = useState("All");

    return (
        <main className="bg-slate-50 min-h-screen selection:bg-pink-500 selection:text-white cursor-crosshair">
            <NoiseOverlay />

            {/* AMBIENT BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>

            {/* HERO */}
            <section className="relative pt-48 pb-32 px-6 container mx-auto z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-5xl"
                >
                    <div className="inline-flex items-center gap-3 mb-12 px-6 py-3 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm hover:scale-105 transition-transform cursor-pointer">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                        <span className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-slate-500">
                            Classified: Level 5 Clearance
                        </span>
                    </div>

                    <h1 className="text-8xl md:text-[11rem] font-black text-slate-900 leading-[0.8] tracking-tighter mb-12 mix-blend-darken">
                        <ScrambleTitle text="PROOF" /><br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-400">OF WORK.</span>
                    </h1>

                    <div className="flex flex-col md:flex-row gap-12 items-start opacity-0 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500 fill-mode-forwards">
                        <p className="text-2xl text-slate-600 max-w-xl font-medium leading-relaxed border-l-4 border-black pl-8">
                            We don&apos;t just write code. We engineer dominance.
                            Explore the vault of our most ambitious deployments.
                        </p>

                        <div className="flex gap-8">
                            <div className="text-center">
                                <div className="text-4xl font-black text-slate-900">$50M+</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">Client Revenue</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-black text-slate-900">100%</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">Success Rate</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* GALLERY */}
            <section className="relative py-32 container mx-auto px-6 z-10">

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-24 justify-center md:justify-start border-b border-slate-200 pb-8">
                    {["All", "FinTech", "E-Commerce", "SaaS"].map((f) => (
                        <FilterButton key={f} active={filter === f} onClick={() => setFilter(f)}>
                            {f === "All" ? "View All" : f}
                        </FilterButton>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid gap-24">
                    <AnimatePresence mode="popLayout">
                        {projects.filter(p => filter === "All" || p.category === filter).map((project, index) => (
                            <ProjectCard key={project.id} project={project} index={index} />
                        ))}
                    </AnimatePresence>
                </div>

                <div className="mt-40 text-center">
                    <p className="font-mono text-slate-400 text-sm mb-4">{"/// END OF PUBLIC RECORDS ///"}</p>
                    <Button variant="outline" className="h-20 px-12 border-2 border-dashed border-slate-300 text-slate-400 uppercase tracking-widest hover:border-black hover:text-black hover:bg-transparent transition-all">
                        Request Full Credentials
                    </Button>
                </div>
            </section>

            {/* CTA */}
            <section className="relative py-40 bg-black text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 mix-blend-overlay" />

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="mb-12 inline-block">
                        <Trophy size={64} className="text-yellow-500 mb-6 mx-auto animate-bounce" />
                        <h2 className="text-6xl md:text-9xl font-black mb-4 tracking-tighter">
                            BE THE NEXT<br />UNICORN.
                        </h2>
                    </div>

                    <div className="flex justify-center gap-6">
                        <Link href="/contacto">
                            <Button className="h-24 px-16 bg-white text-black text-xl font-bold uppercase tracking-widest rounded-none hover:bg-green-400 hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                                Start Project
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

