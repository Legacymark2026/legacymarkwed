import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations('methodologyPage.meta');
    return {
        title: t('title'),
        description: t('description'),
    };
}

const stepsConfig = [
    { color: "from-violet-600 to-purple-600", bg: "bg-violet-50" },
    { color: "from-blue-600 to-cyan-500", bg: "bg-blue-50" },
    { color: "from-orange-500 to-amber-400", bg: "bg-orange-50" },
    { color: "from-emerald-500 to-teal-400", bg: "bg-emerald-50" },
];

export default async function MetodologiaPage() {
    const t = await getTranslations('methodologyPage');

    const steps = [0, 1, 2, 3].map((index) => ({
        number: `0${index + 1}`,
        title: t(`steps.${index}.title`),
        description: t(`steps.${index}.description`),
        color: stepsConfig[index].color,
        bg: stepsConfig[index].bg,
        items: [
            t(`steps.${index}.items.0`),
            t(`steps.${index}.items.1`),
            t(`steps.${index}.items.2`),
            t(`steps.${index}.items.3`),
        ]
    }));

    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative pt-32 pb-20 bg-black text-white overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-black to-black opacity-80" />
                <div className="relative max-w-5xl mx-auto px-6 text-center">
                    <span className="inline-block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">{t('hero.badge')}</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                        {t('hero.titleStart')}<br />
                        <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">{t('hero.titleHighlight')}</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        {t('hero.description')}
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className="max-w-6xl mx-auto px-6 py-24">
                <div className="space-y-20">
                    {steps.map((step, index) => (
                        <div
                            key={step.number}
                            className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-12 items-center`}
                        >
                            {/* Number + Title */}
                            <div className="flex-1 space-y-5">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} text-white font-black text-xl shadow-lg`}>
                                    {step.number}
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-black">{step.title}</h2>
                                <p className="text-lg text-gray-600 leading-relaxed">{step.description}</p>
                                <ul className="space-y-2">
                                    {step.items.map(item => (
                                        <li key={item} className="flex items-center gap-2 text-gray-700">
                                            <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${step.color} flex-shrink-0`} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Visual card */}
                            <div className={`flex-1 ${step.bg} rounded-3xl p-10 flex items-center justify-center min-h-[260px]`}>
                                <span className={`text-[120px] font-black bg-gradient-to-br ${step.color} bg-clip-text text-transparent leading-none select-none`}>
                                    {step.number}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-black text-white py-24 px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-black mb-6">
                    {t('cta.title')}
                </h2>
                <p className="text-xl text-gray-300 mb-10 max-w-xl mx-auto">
                    {t('cta.description')}
                </p>
                <Link
                    href="/contacto"
                    className="inline-block bg-white text-black font-bold text-lg px-10 py-4 rounded-full hover:bg-gray-100 transition-colors"
                >
                    {t('cta.button')}
                </Link>
            </section>
        </main>
    );
}
