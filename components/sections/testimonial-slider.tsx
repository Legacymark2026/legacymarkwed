"use client";

import { MeteorCard } from "@/components/ui/meteor-card";
import { MessageSquare, Quote } from "lucide-react";


const REVIEWS = [
    {
        name: "Carlos Mendez",
        username: "@cmendez_ceo",
        body: "La reingeniería de nuestra plataforma aumentó el tráfico un 300% en el primer Q. Absolutamente brutal.",
        role: "CEO, Fincorp",
        img: "https://avatar.vercel.sh/carlos",
    },
    {
        name: "Elena Torres",
        username: "@elena_ux",
        body: "Nunca había visto un equipo de desarrollo tan alineado con los objetivos de negocio. Calidad impecable.",
        role: "Product Lead, Nova",
        img: "https://avatar.vercel.sh/elena",
    },
    {
        name: "Javier Ruiz",
        username: "@crypto_jav",
        body: "Velocidad de ejecución militar. Entregaron el MVP dos semanas antes de lo previsto.",
        role: "Founder, Blockify",
        img: "https://avatar.vercel.sh/javier",
    },
    {
        name: "Ana Soto",
        username: "@ana_growth",
        body: "El dashboard de analítica nos dio la claridad que necesitábamos para escalar la inversión publicitaria.",
        role: "CMO, E-Shop",
        img: "https://avatar.vercel.sh/ana",
    },
];

export function TestimonialSlider() {
    return (
        <section className="bg-slate-50 py-24 border-y border-gray-200 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-0">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-white text-teal-700 text-xs font-mono mb-4 uppercase tracking-widest shadow-sm">
                        <MessageSquare size={12} />
                        Encrypted Transmissions
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance">
                        Lo que dicen nuestros <span className="text-teal-600">Aliados</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {REVIEWS.map((review, idx) => (
                        <MeteorCard key={idx} className="bg-white border-gray-200 shadow-md">
                            <div className="flex flex-col h-full justify-between">
                                <div className="mb-4 text-teal-500 opacity-20">
                                    <Quote size={40} />
                                </div>
                                <p className="text-slate-600 font-medium leading-relaxed mb-6 relative z-10">
                                    &quot;{review.body}&quot;
                                </p>
                                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200" src={review.img} alt="" />
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">{review.name}</div>
                                        <div className="text-xs text-gray-500">{review.role}</div>
                                    </div>
                                </div>
                            </div>
                        </MeteorCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
