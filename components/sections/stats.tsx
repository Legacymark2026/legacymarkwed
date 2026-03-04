"use client";

import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useMemo } from "react";
import { Activity, Users, TrendingUp, Server } from "lucide-react";
import { useTranslations } from "next-intl";

// Base stats config without text keys
const STATS_CONFIG = [
    {
        id: "ROI-01",
        key: "roi",
        value: 450,
        suffix: "%",
        icon: TrendingUp
    },
    {
        id: "LDS-02",
        key: "leads",
        value: 12000,
        suffix: "+",
        icon: Users
    },
    {
        id: "CNV-03",
        key: "conversion",
        value: 15,
        suffix: "%",
        icon: Activity
    },
    {
        id: "SCL-04",
        key: "scale",
        value: 85,
        suffix: "+",
        icon: Server
    },
];

function Counter({ value, suffix }: { value: number, suffix: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const springValue = useSpring(0, { stiffness: 40, damping: 15, duration: 2500 });

    useEffect(() => {
        if (inView) {
            springValue.set(value);
        }
    }, [inView, value, springValue]);

    const displayValue = useTransform(springValue, (current) => Math.floor(current).toLocaleString());

    return (
        <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 flex items-center justify-center font-mono relative z-10">
            <motion.span ref={ref}>{displayValue}</motion.span>
            <span className="text-teal-600 ml-1">{suffix}</span>
        </span>
    );
}

export function Stats() {
    const t = useTranslations("home.stats");

    const statsArray = useMemo(() => {
        return STATS_CONFIG.map(s => ({
            ...s,
            label: t(`items.${s.key}.label`),
            desc: t(`items.${s.key}.desc`)
        }));
    }, [t]);

    return (
        <section className="bg-slate-50 py-20 sm:py-32 relative overflow-hidden border-y border-gray-200">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-transparent to-slate-50" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
                {/* Section Header */}
                <div className="flex justify-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-xs font-mono uppercase tracking-widest backdrop-blur-md">
                        <Activity size={12} />
                        {t('badge')}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 divide-gray-200 lg:divide-x">
                    {statsArray.map((stat, index) => (
                        <motion.div
                            key={stat.id}
                            className="text-center group relative px-4"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                        >
                            {/* Hover BG */}
                            <div className="absolute inset-0 bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl -inset-x-4 -inset-y-4 z-0" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="mb-6 relative">
                                    <div className="absolute inset-0 bg-teal-200 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
                                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                        <stat.icon className="text-teal-600 w-6 h-6" />
                                    </div>
                                </div>

                                <Counter value={stat.value} suffix={stat.suffix} />

                                <div className="mt-4 space-y-2">
                                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-600 group-hover:text-teal-700 transition-colors">
                                        {stat.label}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-mono">
                                        [{stat.id}] :: {stat.desc}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
