import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Metodología | LegacyMark",
    description: "Conoce el proceso estratégico de LegacyMark: cómo transformamos marcas a través de una metodología probada en diagnóstico, estrategia, ejecución y crecimiento.",
};

const steps = [
    {
        number: "01",
        title: "Diagnóstico Profundo",
        description: "Analizamos tu marca, mercado y competencia con herramientas de inteligencia de datos. Identificamos brechas, oportunidades y el posicionamiento real que tienes vs. el que quieres.",
        color: "from-violet-600 to-purple-600",
        bg: "bg-violet-50",
        items: ["Auditoría de marca y comunicación", "Análisis de competencia digital", "Mapa de audiencias y segmentación", "Diagnóstico de presencia online"],
    },
    {
        number: "02",
        title: "Estrategia a Medida",
        description: "Diseñamos un plan estratégico personalizado con objetivos claros, KPIs medibles y un roadmap de acción. Sin plantillas genéricas — cada estrategia es única como tu marca.",
        color: "from-blue-600 to-cyan-500",
        bg: "bg-blue-50",
        items: ["Definición de propuesta de valor", "Arquitectura de contenido", "Plan de medios y canales", "Indicadores de éxito (KPIs)"],
    },
    {
        number: "03",
        title: "Ejecución de Alto Nivel",
        description: "Nuestro equipo senior implementa la estrategia con precisión: contenido que conecta, campañas que convierten y sistemas que escalan.",
        color: "from-orange-500 to-amber-400",
        bg: "bg-orange-50",
        items: ["Producción de contenido premium", "Gestión de campañas pagadas", "Automatización de marketing", "Desarrollo web y tecnología"],
    },
    {
        number: "04",
        title: "Medición y Optimización",
        description: "Medimos todo. Optimizamos constantemente. Los datos guían cada decisión para maximizar el retorno de tu inversión y acelerar el crecimiento.",
        color: "from-emerald-500 to-teal-400",
        bg: "bg-emerald-50",
        items: ["Reportes de rendimiento en tiempo real", "A/B Testing continuo", "Optimización de conversión (CRO)", "Reuniones de revisión periódicas"],
    },
];

export default function MetodologiaPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero */}
            <section className="relative pt-32 pb-20 bg-black text-white overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-black to-black opacity-80" />
                <div className="relative max-w-5xl mx-auto px-6 text-center">
                    <span className="inline-block text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">Nuestro Proceso</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                        Metodología<br />
                        <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">LegacyMark</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Un proceso estratégico probado, diseñado para transformar marcas con resultados medibles. Cada proyecto sigue cuatro fases que garantizan claridad, ejecución y crecimiento sostenido.
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
                    ¿Listo para empezar?
                </h2>
                <p className="text-xl text-gray-300 mb-10 max-w-xl mx-auto">
                    Aplica nuestra metodología a tu marca y transforma resultados en 90 días.
                </p>
                <Link
                    href="/contacto"
                    className="inline-block bg-white text-black font-bold text-lg px-10 py-4 rounded-full hover:bg-gray-100 transition-colors"
                >
                    Trabajemos juntos →
                </Link>
            </section>
        </main>
    );
}
