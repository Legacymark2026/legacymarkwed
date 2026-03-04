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
        <section className="bg-slate-50 py-24 border-y border-gray-200 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-0">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-white text-teal-700 text-xs font-mono mb-4 uppercase tracking-widest shadow-sm">
                        <MessageSquare size={12} />
                        {t('badge')}
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance">
                        {t('titleStart')} <span className="text-teal-600">{t('titleHighlight')}</span>
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
