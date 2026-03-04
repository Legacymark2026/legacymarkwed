"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, Radio } from "lucide-react";
import { useTranslations } from "next-intl";

export function CTA() {
    const t = useTranslations("home.cta");
    return (
        <section className="relative py-32 overflow-hidden bg-transparent border-t border-slate-100">
            {/* Background Beams - Light Mode */}
            <div className="absolute inset-0 bg-[#F9FAFB] pointer-events-none" />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-200/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-slate-300 bg-white shadow-sm text-slate-800 text-[10px] font-mono mb-12 uppercase tracking-widest"
                >
                    <Radio size={12} strokeWidth={1.5} className="animate-pulse" />
                    {t('badge')}
                </motion.div>

                <h2 className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-[-0.04em] text-slate-900 mb-10 leading-[0.85] uppercase">
                    {t('titleStart')} <span className="text-slate-400">{t('titleHighlight')}</span>
                </h2>

                <p className="text-xl md:text-2xl text-slate-500 mb-16 max-w-2xl mx-auto font-light font-mono uppercase tracking-widest">
                    {t('subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Button size="lg" className="h-16 px-12 rounded-sm bg-slate-900 text-white hover:bg-slate-950 hover:shadow-2xl hover:shadow-slate-900/20 text-lg font-bold shadow-xl hover:-translate-y-1 transition-all group">
                        <span className="flex items-center gap-3">
                            {t('btn1')} <Rocket strokeWidth={1.5} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </span>
                    </Button>
                    <Button variant="outline" size="lg" className="h-16 px-12 rounded-sm border border-slate-300 text-slate-800 hover:border-slate-900 hover:text-slate-900 text-lg font-bold bg-white backdrop-blur-sm transition-all shadow-sm">
                        {t('btn2')}
                    </Button>
                </div>

                {/* Footer Data */}
                <div className="mt-16 pt-8 border-t border-gray-100 flex justify-center gap-8 text-sm font-mono text-gray-400">
                    <span>{t('footerInfo.f1')}</span>
                    <span>{t('footerInfo.f2')}</span>
                    <span>{t('footerInfo.f3')}</span>
                </div>
            </div>
        </section>
    );
}
