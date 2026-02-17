"use client";

import { motion } from "framer-motion";
import { Star, User, Quote, TrendingUp, Award, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

const testimonials = [
    {
        author: "Sofia R.",
        role: "Marketing Director",
        company: "TechStart",
        text: "El impacto en nuestro engagement fue inmediato. Pasamos de 500 a 15k views promedio en reels en solo 3 semanas.",
        rating: 5
    },
    {
        author: "Carlos M.",
        role: "CEO",
        company: "InmoGroup",
        text: "La calidad visual es de otro nivel. Lograron capturar la esencia premium de nuestra marca inmobiliaria perfectamente.",
        rating: 5
    },
    {
        author: "Ana P.",
        role: "Founder",
        company: "EcoBrand",
        text: "No solo es contenido bonito, es contenido que vende. Nuestro ROI ha sido positivo desde el mes 1.",
        rating: 5
    }
];

const caseStudy = {
    title: "Campaña Black Friday",
    client: "Fashion Nova Style",
    stats: [
        { label: "Revenue", value: "$45k", icon: DollarSign },
        { label: "ROAS", value: "8.5x", icon: TrendingUp },
        { label: "New Users", value: "+12k", icon: User }
    ]
};



export default function SocialProofSection() {
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-20 bg-slate-50 border-t border-slate-200 overflow-hidden">
            <div className="container px-4 md:px-6">

                {/* Logos Marquee */}
                <div className="mb-24 opacity-60 hover:opacity-100 transition-opacity duration-500 relative">
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>

                    <p className="text-center text-xs font-bold tracking-[0.2em] text-teal-600 mb-10 uppercase">Powering Next-Gen Brands</p>
                    <div className="flex justify-between items-center gap-8 flex-wrap md:flex-nowrap grayscale hover:grayscale-0 transition-all duration-700">
                        {/* Placeholders for logos */}
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-16 w-32 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-400 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600 transition-all cursor-crosshair">
                                BRAND {i}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Testimonials Carousel */}
                    <div className="relative pl-8 border-l-2 border-teal-500/20">
                        <div className="absolute -top-12 -left-6 text-9xl text-slate-200 font-serif font-black select-none z-0">"</div>

                        <div className="flex items-center gap-1 mb-8 relative z-10">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <span className="text-slate-500 text-sm ml-3 font-medium tracking-wide">4.9/5 Average Rating</span>
                        </div>

                        <div className="h-64 relative z-10">
                            {testimonials.map((t, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                                    animate={{
                                        opacity: activeTestimonial === idx ? 1 : 0,
                                        x: activeTestimonial === idx ? 0 : 50,
                                        filter: activeTestimonial === idx ? "blur(0px)" : "blur(10px)",
                                        pointerEvents: activeTestimonial === idx ? 'auto' : 'none'
                                    }}
                                    transition={{ duration: 0.6, ease: "circOut" }}
                                    className="absolute inset-0"
                                >
                                    <p className="text-2xl md:text-3xl font-medium leading-tight mb-8 text-slate-800">
                                        {t.text}
                                    </p>
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <div className="absolute inset-0 rounded-full bg-teal-200 blur-md opacity-50 animate-pulse"></div>
                                            <div className="w-14 h-14 rounded-full bg-white border-2 border-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl relative z-10 shadow-sm">
                                                {t.author[0]}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-lg">{t.author}</div>
                                            <div className="text-teal-600 text-sm uppercase tracking-wider font-semibold">{t.role}, {t.company}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-8">
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTestimonial(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${activeTestimonial === idx ? "w-12 bg-teal-500" : "w-3 bg-slate-300 hover:bg-slate-400"}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 3D Case Study Card */}
                    <motion.div
                        whileHover={{ rotateY: 5, rotateX: -5, scale: 1.02 }}
                        initial={{ rotateY: 15, rotateX: 5 }}
                        animate={{ rotateY: 0, rotateX: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="perspective-1000"
                    >
                        <div className="glass-card rounded-[30px] p-8 relative overflow-hidden group border-t border-white/60 bg-white shadow-2xl shadow-teal-900/10">
                            {/* Holo Shine */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/5 via-transparent to-sky-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div>
                                    <span className="px-3 py-1 bg-sky-50 text-sky-600 text-[10px] font-bold tracking-widest uppercase rounded-full border border-sky-100 mb-3 inline-block">Case Study</span>
                                    <h3 className="text-3xl font-bold text-slate-900">{caseStudy.title}</h3>
                                    <p className="text-slate-500 font-medium">{caseStudy.client}</p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 shadow-sm">
                                    <Award className="w-8 h-8 text-orange-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 relative z-10">
                                {caseStudy.stats.map((stat, idx) => (
                                    <div key={idx} className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-teal-200 hover:bg-white transition-all duration-300 group/stat shadow-sm">
                                        <stat.icon className="w-6 h-6 mx-auto mb-3 text-slate-400 group-hover/stat:text-teal-500 transition-colors" />
                                        <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center relative z-10">
                                <div className="flex -space-x-3 pl-2">
                                    {/* Avatars */}
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-xs shadow-md z-1">
                                            <User className="w-4 h-4 text-slate-400" />
                                        </div>
                                    ))}
                                </div>
                                <button className="text-slate-700 text-sm font-bold flex items-center gap-2 group/btn relative overflow-hidden px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <span className="relative z-10">Ver Detalles</span>
                                    <span className="relative z-10 transform group-hover/btn:translate-x-1 transition-transform">→</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
