"use client";

import { motion } from "framer-motion";
import { Eye, Flag, Heart } from "lucide-react";

import { useTranslations } from "next-intl";

const featuresConfig = [
    {
        key: "mission",
        icon: Flag,
        color: "bg-blue-500",
        delay: 0
    },
    {
        key: "vision",
        icon: Eye,
        color: "bg-teal-500",
        delay: 0.2
    },
    {
        key: "personality",
        icon: Heart,
        color: "bg-rose-500",
        delay: 0.4
    }
];

export function CorporatePhilosophy() {
    const t = useTranslations("nosotrosPage.philosophy");

    return (
        <section className="py-24 relative overflow-hidden bg-slate-50">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-6">
                        {t('titleStart')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">{t('titleHighlight')}</span>
                    </h2>
                    <p className="text-slate-500 text-lg">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {featuresConfig.map((feature, i) => (
                        <motion.div
                            key={feature.key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: feature.delay, duration: 0.5 }}
                            className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${feature.color} opacity-[0.03] rounded-bl-full group-hover:scale-150 transition-transform duration-700 ease-out`} />

                            <div className={`w-14 h-14 rounded-2xl ${feature.color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`w-7 h-7 text-${feature.color.split("-")[1]}-600`} />
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-4">{t(`features.${feature.key}.title`)}</h3>
                            <p className="text-slate-600 leading-relaxed text-pretty">
                                {t(`features.${feature.key}.description`)}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
