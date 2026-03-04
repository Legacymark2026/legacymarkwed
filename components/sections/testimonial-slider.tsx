"use client";

import { MeteorCard } from "@/components/ui/meteor-card";
import { MessageSquare, Quote } from "lucide-react";
import { useTranslations } from "next-intl";


export function TestimonialSlider() {
    const t = useTranslations("home.testimonials");

    const REVIEWS = [
        {
            name: t('reviews.r1.name'),
            username: "@cmendez_ceo",
            body: t('reviews.r1.body'),
            role: t('reviews.r1.role'),
            img: "https://avatar.vercel.sh/carlos",
        },
        {
            name: t('reviews.r2.name'),
            username: "@elena_ux",
            body: t('reviews.r2.body'),
            role: t('reviews.r2.role'),
            img: "https://avatar.vercel.sh/elena",
        },
        {
            name: t('reviews.r3.name'),
            username: "@crypto_jav",
            body: t('reviews.r3.body'),
            role: t('reviews.r3.role'),
            img: "https://avatar.vercel.sh/javier",
        },
        {
            name: t('reviews.r4.name'),
            username: "@ana_growth",
            body: t('reviews.r4.body'),
            role: t('reviews.r4.role'),
            img: "https://avatar.vercel.sh/ana",
        },
    ];

    return (
        <section className="bg-transparent py-32 rounded-sm overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#F9FAFB] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#F9FAFB] to-transparent z-10 pointer-events-none" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-0">
                <div className="text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-slate-200 bg-white text-slate-800 text-[10px] font-mono mb-6 uppercase tracking-widest shadow-sm">
                        <MessageSquare size={12} strokeWidth={1.5} />
                        {t('badge')}
                    </div>
                    <h2 className="text-4xl font-black tracking-[-0.04em] text-slate-900 sm:text-6xl text-balance">
                        {t('titleStart')} <span className="text-slate-400 font-light">{t('titleHighlight')}</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {REVIEWS.map((review, idx) => (
                        <MeteorCard key={idx} className="bg-white/70 backdrop-blur-xl border border-white shadow-xl hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-2 transition-all duration-500 rounded-sm">
                            <div className="flex flex-col h-full justify-between p-2">
                                <div className="mb-6 text-slate-200 group-hover:text-slate-300 transition-colors">
                                    <Quote size={40} strokeWidth={1} />
                                </div>
                                <p className="text-slate-600 font-light leading-relaxed mb-8 relative z-10 text-sm">
                                    &quot;{review.body}&quot;
                                </p>
                                <div className="flex items-center gap-4 border-t border-slate-200/50 pt-6">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img className="h-12 w-12 rounded-sm bg-[#F9FAFB] border border-slate-200 grayscale" src={review.img} alt="" />
                                    <div>
                                        <div className="text-sm font-black tracking-tight text-slate-900 uppercase font-mono">{review.name}</div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">{review.role}</div>
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
