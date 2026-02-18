"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Handshake, TrendingUp, CheckCircle2, ShieldCheck, Globe, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const PARTNERS = [
    { name: "Google Ads", tier: "Premier Partner", metric: "Top 3% Global", icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Meta Business", tier: "Marketing Pro", metric: "Ad Spend >$1M", icon: Handshake, color: "text-blue-400", bg: "bg-blue-400/10" },
    { name: "Vercel Enterprise", tier: "Expert System", metric: "99.99% Uptime", icon: Cpu, color: "text-gray-800", bg: "bg-gray-100" },
    { name: "HubSpot", tier: "Solutions Partner", metric: "CRM Integration", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
    { name: "Shopify Plus", tier: "Agency Partner", metric: "E-comm Scale", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10" },
];

export function StrategicAlliances() {
    return (
        <section className="py-24 bg-white border-y border-gray-100 overflow-hidden relative">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">

                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-xs font-mono mb-4 uppercase tracking-widest"
                    >
                        <ShieldCheck size={12} />
                        Strategic Ecosystem
                    </motion.div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Alianzas que <span className="text-teal-600">Potencian tu Crecimiento</span></h2>
                </div>

                {/* Partners Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {PARTNERS.map((partner, index) => (
                        <motion.div
                            key={partner.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="group relative flex flex-col items-center justify-between p-6 bg-slate-50 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300"
                        >
                            <div className={cn("p-4 rounded-xl mb-4 transition-colors", partner.bg)}>
                                <partner.icon className={cn("w-6 h-6", partner.color)} />
                            </div>

                            <div className="text-center">
                                <h3 className="font-bold text-slate-800 mb-1">{partner.name}</h3>
                                <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3 leading-tight">
                                    {partner.tier}
                                </p>
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded border border-gray-200 text-[10px] font-bold text-gray-600 shadow-sm">
                                    <CheckCircle2 size={10} className="text-teal-500" />
                                    {partner.metric}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Performance Ticker */}
                <div className="mt-16 relative flex overflow-hidden border-y border-gray-100 bg-slate-50/50 py-3">
                    <div className="animate-marquee whitespace-nowrap flex gap-16 items-center">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex gap-16">
                                {["SYSTEM STATUS: ONLINE", "AVG. ROAS: 450%", "UPTIME: 99.99%", "SECURE CONNECTION", "LIVE TELEMETRY"].map((text, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                        {text}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
