"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MouseEvent, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Activity, Wifi, ShieldCheck, Rocket } from "lucide-react";

const GLITCH_MSGS = ["INNOVATION", "DISRUPTION", "EVOLUTION", "DOMINATION", "GROWTH"];

export function FuturisticHero() {
    // Mouse Interaction
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth Mouse for Parallax
    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // Parallax Transforms
    const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]); // Reduced rotation for cleaner feel
    const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);
    const layer1X = useTransform(springX, [-0.5, 0.5], [-20, 20]);
    const layer1Y = useTransform(springY, [-0.5, 0.5], [-20, 20]);
    const layer2X = useTransform(springX, [-0.5, 0.5], [-40, 40]);
    const layer2Y = useTransform(springY, [-0.5, 0.5], [-40, 40]);

    function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
        const { width, height } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX / width - 0.5;
        const y = e.clientY / height - 0.5;

        const { left, top } = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);

        springX.set(x);
        springY.set(y);
    }

    // Text Glitch Effect
    const [glitchText, setGlitchText] = useState("Digital");
    const [glitchIndex, setGlitchIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (glitchIndex + 1) % GLITCH_MSGS.length;
            setGlitchIndex(nextIndex);
            let steps = 0;
            const glitchInterval = setInterval(() => {
                setGlitchText(prev => prev.split('').map(() => String.fromCharCode(65 + Math.random() * 26)).join(''));
                steps++;
                if (steps > 5) {
                    clearInterval(glitchInterval);
                    setGlitchText(GLITCH_MSGS[nextIndex]);
                }
            }, 50);

        }, 4000);
        return () => clearInterval(interval);
    }, [glitchIndex]);

    return (
        <div
            className="relative min-h-screen w-full flex items-center justify-center bg-white overflow-hidden group perspective-[2000px]"
            onMouseMove={handleMouseMove}
        >
            {/* 0. QUANTUM GRID (Light Mode) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Light Gray/Teal Grid on White */}
                <div className="absolute -inset-[100%] bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50 animate-grid-flow transform-gpu perspective-3d rotate-x-60 title-grid" style={{ transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)' }} />
            </div>

            {/* 1. Global Spotlight Follower (Subtle Shadow/Highlight) */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-10"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(13, 148, 136, 0.03),
              transparent 80%
            )
          `,
                }}
            />

            {/* 2. HUD Overlay Elements (Teal Text on White) */}
            <div className="absolute top-24 left-8 hidden lg:flex flex-col gap-2 pointer-events-none z-20">
                <div className="flex items-center gap-2 text-[10px] font-mono text-teal-600 uppercase tracking-widest border border-teal-200 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-sm shadow-sm">
                    <Wifi size={10} className="animate-pulse text-teal-500" /> NET: SECURE
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-teal-600 uppercase tracking-widest border border-teal-200 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-sm shadow-sm">
                    <Activity size={10} className="text-teal-500" /> SYS: OPTIMAL
                </div>
            </div>

            <div className="container relative z-20 px-4 md:px-6 pt-16 sm:pt-20">
                <div className="flex flex-col items-center text-center space-y-8 sm:space-y-10">

                    {/* 3. Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative"
                    >
                        <span className="relative inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-bold text-teal-700 shadow-sm uppercase tracking-wider">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                            </span>
                            <span className="hidden sm:inline">System v2.4 ::</span> Ready for Launch
                        </span>
                    </motion.div>

                    {/* 4. Main Headline (Dark Text) */}
                    <div className="max-w-5xl space-y-4 sm:space-y-6 relative w-full">
                        {/* Decorative Brackets (Light Gray) */}
                        <div className="absolute -left-12 top-0 text-6xl font-thin text-gray-200 hidden lg:block font-mono">{"{"}</div>
                        <div className="absolute -right-12 bottom-0 text-6xl font-thin text-gray-200 hidden lg:block font-mono">{"}"}</div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 mb-4 sm:mb-6 relative z-10 leading-[0.9]">
                            <span className="block mb-2 drop-shadow-sm">
                                Transformamos
                            </span>
                            <div className="flex justify-center items-center gap-2 sm:gap-4 flex-wrap">
                                <span className="text-xl sm:text-3xl md:text-5xl font-mono text-teal-600/50 uppercase tracking-widest align-super">El Futuro</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-600 animate-gradient-x font-mono relative">
                                    {glitchText}
                                </span>
                            </div>
                        </h1>
                        <p className="mx-auto max-w-2xl text-base md:text-xl text-slate-600 leading-relaxed text-pretty font-medium">
                            LegacyMark fusiona <span className="text-teal-700 font-bold bg-teal-50 px-2 rounded border border-teal-100">INTELIGENCIA ARTIFICIAL</span> con estrategia de élite para construir ecosistemas digitales que dominan mercados.
                        </p>
                    </div>

                    {/* 5. Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-6 sm:mt-8 w-full sm:w-auto"
                    >
                        <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-base sm:text-lg transition-all hover:scale-105 shadow-xl shadow-teal-700/20 relative overflow-hidden group">
                            <span className="relative flex items-center gap-2">
                                Iniciar Protocolo <Rocket className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                            </span>
                        </Button>

                        <Button variant="ghost" size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 rounded-full border border-gray-200 text-slate-700 hover:bg-gray-50 hover:text-teal-600 transition-all group relative overflow-hidden">
                            <span className="flex items-center gap-2 relative z-10 font-semibold">
                                <Play className="w-4 h-4 fill-current" /> Ver Demo Táctico
                            </span>
                        </Button>
                    </motion.div>

                    {/* 6. 3D Parallax Dashboard - Hidden on mobile for performance */}
                    <div className="w-full max-w-6xl mt-12 sm:mt-20 perspective-[2000px] relative z-10 group/dashboard hidden sm:block">
                        <motion.div
                            style={{ rotateX, rotateY }}
                            className="relative aspect-[16/9] md:aspect-[21/9] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Layer 0: Grid Background */}
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />

                            {/* Layer 1: Base UI */}
                            <motion.div style={{ x: layer1X, y: layer1Y }} className="absolute inset-0 p-8 flex flex-col justify-between">
                                {/* Header */}
                                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                    <div className="font-mono text-xs text-slate-400">DASHBOARD_V4.2.0_STABLE</div>
                                </div>
                                {/* Footer Graph Lines (Teal) */}
                                <div className="flex gap-1 items-end h-16 opacity-30">
                                    {[40, 60, 35, 80, 50, 90, 20, 70, 45, 60, 80, 50].map((h, i) => (
                                        <div key={i} className="flex-1 bg-teal-500 rounded-t-sm" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </motion.div>

                            {/* Layer 2: Floating Cards */}
                            <motion.div style={{ x: layer2X, y: layer2Y }} className="absolute inset-0 pointer-events-none">
                                {/* Card 1: Activity */}
                                <div className="absolute top-1/4 left-1/4 -translate-x-1/2 p-4 rounded-xl bg-white border border-gray-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] max-w-xs transform hover:scale-105 transition-transform duration-300 pointer-events-auto cursor-help">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-teal-50 rounded-lg text-teal-600"><Activity size={18} /></div>
                                        <div>
                                            <div className="text-xs text-gray-500 font-medium">Rendimiento</div>
                                            <div className="text-lg font-bold text-slate-900">+245%</div>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-teal-500 w-[75%]" />
                                    </div>
                                </div>

                                {/* Card 2: Code Snippet */}
                                <div className="absolute top-1/3 right-1/4 translate-x-1/2 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl max-w-xs hidden md:block transform hover:scale-105 transition-transform duration-300 pointer-events-auto">
                                    <div className="font-mono text-[10px] text-emerald-400 leading-tight">
                                        <p>{"> initializing_core..."}</p>
                                        <p>{"> loading_modules [OK]"}</p>
                                        <p className="animate-pulse">{"> awaiting_user_input_"}</p>
                                    </div>
                                </div>

                                {/* Card 3: Security Badge */}
                                <div className="absolute bottom-1/4 left-1/3 p-3 rounded-lg bg-white border border-teal-100 flex items-center gap-3 shadow-lg">
                                    <ShieldCheck size={16} className="text-teal-600" />
                                    <span className="text-xs font-bold text-slate-700">ENCRYPTED</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                </div>
            </div>

            {/* 7. Bottom Haze (White) */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent z-20 pointer-events-none" />
        </div>
    );
}
