import { Metadata } from 'next';
import Link from 'next/link';
import '@/styles/content-animations.css';
import { RoiCalculatorClient } from './roi-calculator-client';
import { PricingClient } from './pricing-client';

export const metadata: Metadata = {
    title: 'Creación de Contenido Premium | Legacy Mark',
    description: 'Elevamos tu marca con contenido estratégico que genera resultados reales: más vistas, más leads, más ventas.',
};

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const services = [
    { icon: '🎬', title: 'Video Short-Form', desc: 'Reels, TikToks y Shorts optimizados para viralizarse. Guión, producción y edición estilo Hormozi.', stat: '2.4M Vistas' },
    { icon: '🎨', title: 'Identidad Visual', desc: 'Diseño gráfico de alto impacto que detiene el scroll. Miniaturas, carruseles y posts que convierten.', stat: '+12k Shares' },
    { icon: '✍️', title: 'Copywriting', desc: 'Palabras que venden. Email sequences, captions y scripts con tasas de apertura de 45%+.', stat: '45% Open Rate' },
    { icon: '📊', title: 'Estrategia & Datos', desc: 'No creamos a ciegas. Analizamos métricas, tendencias y competencia para maximizar cada acción.', stat: '8.7x ROAS' },
];

const steps = [
    { num: '01', title: 'Estrategia & Concepto', desc: 'Analizamos tendencias en tiempo real y diseñamos hooks virales para tu nicho específico.', time: 'Día 1–2', color: 'from-violet-500 to-purple-600' },
    { num: '02', title: 'Planificación Editorial', desc: 'Guiones palabra por palabra, storyboards y calendario de 30 días listos para tu aprobación.', time: 'Día 3', color: 'from-sky-500 to-cyan-500' },
    { num: '03', title: 'Producción Premium', desc: 'Grabación 4K, iluminación profesional y dirección creativa de nivel internacional.', time: 'Día 4–5', color: 'from-orange-500 to-red-500' },
    { num: '04', title: 'Edición Hormozi-Style', desc: 'Cortes dinámicos, subtítulos animados nativos y motion graphics que frenan el scroll.', time: 'Día 6–8', color: 'from-teal-500 to-emerald-500' },
    { num: '05', title: 'Distribución & Escala', desc: 'Publicación en horario pico, gestión primeras 48h y reporte de métricas detallado.', time: 'Día 9+', color: 'from-pink-500 to-rose-500' },
];

const testimonials = [
    { author: 'Sofia R.', role: 'Marketing Director · TechStart', text: 'Pasamos de 500 a 15k views promedio en reels en solo 3 semanas. Saben exactamente cómo crear contenido que para el scroll.', metric: '+2,900%', metricLabel: 'Views' },
    { author: 'Carlos M.', role: 'CEO · InmoGroup', text: 'La calidad visual es de otro nivel. Nuestros clientes ahora nos perciben como líderes del sector.', metric: '18x', metricLabel: 'ROAS' },
    { author: 'Ana P.', role: 'Founder · EcoBrand', text: 'ROI positivo desde el mes 1 y triplicamos nuestra base de suscriptores en 90 días.', metric: '3x', metricLabel: 'Base de clientes' },
];

const stats = [
    { value: '2.4B+', label: 'Views Generadas' },
    { value: '8.7x', label: 'ROAS Promedio' },
    { value: '$4.2M', label: 'Revenue Generado' },
    { value: '120+', label: 'Clientes Activos' },
];

// ─── PAGE (SERVER COMPONENT — zero hydration risk) ────────────────────────────

export default function ContentCreationPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900 overflow-hidden">

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 bg-gradient-to-br from-slate-50 via-white to-teal-50/40 overflow-hidden">
                {/* Decorative blobs — pure CSS, no JS, zero hydration risk */}
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal-200/30 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-sky-200/30 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-teal-100/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center max-w-5xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-xs md:text-sm font-bold tracking-widest uppercase mb-8 shadow-sm">
                        🚀 Next-Gen Content Studio
                    </span>

                    <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-800 to-teal-800 leading-[0.9]">
                        Creamos<br />
                        <span className="relative inline-block">
                            <span className="absolute -inset-2 blur-2xl bg-teal-300/30 rounded-full" />
                            <span className="relative">Contenido</span>
                        </span>{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-sky-500">que Vende.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mb-10 font-light leading-relaxed">
                        Estrategia. Producción. Viralidad.<br className="hidden md:block" />
                        <span className="text-slate-700 font-medium">Resultados desde el primer mes.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <Link href="/contacto" className="group relative px-10 py-5 bg-slate-900 text-white font-bold text-lg rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-xl shadow-slate-900/20">
                            <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative flex items-center gap-3">Iniciar Proyecto <span className="text-xl">→</span></span>
                        </Link>
                        <Link href="#proceso" className="px-10 py-5 rounded-xl border-2 border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all text-slate-700 font-semibold">
                            Ver Proceso
                        </Link>
                    </div>

                    {/* Stats row */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-3xl">
                        {stats.map((s) => (
                            <div key={s.label} className="text-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-3xl font-black bg-gradient-to-br from-teal-600 to-sky-600 bg-clip-text text-transparent">{s.value}</div>
                                <div className="text-xs text-slate-500 font-medium mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SERVICIOS ─────────────────────────────────────────────────── */}
            <section className="py-24 bg-white">
                <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-3 block">Lo que hacemos</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Servicios de Contenido</h2>
                        <p className="text-slate-500 text-lg max-w-xl mx-auto">Producción profesional en todos los formatos que dominan las plataformas de hoy.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {services.map((s) => (
                            <div key={s.title} className="group relative p-8 rounded-3xl border border-slate-100 bg-white hover:border-teal-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-4">
                                        <span className="text-4xl">{s.icon}</span>
                                        <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">{s.stat}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── ROI CALCULATOR (interactive — isolated client component) ──── */}
            <section className="py-24 bg-slate-50">
                <div className="container px-4 md:px-6 max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-3 block">Calculadora</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Calcula tu ROI Potencial</h2>
                        <p className="text-slate-500 text-lg">Visualiza el impacto financiero de una estrategia de contenido profesional.</p>
                    </div>
                    <RoiCalculatorClient />
                </div>
            </section>

            {/* ── PROCESO ───────────────────────────────────────────────────── */}
            <section id="proceso" className="py-32 bg-[#080c14] relative overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="container px-4 md:px-6 max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-bold tracking-widest uppercase mb-6">
                            ⚡ Proceso Comprobado
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                            De la idea al{' '}
                            <span className="bg-gradient-to-r from-teal-400 to-sky-400 bg-clip-text text-transparent">viral</span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto">Nuestro pipeline de producción en 9 días. Sin improvisación.</p>
                        <div className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full">
                            <span className="text-white/70 text-sm">⏱ Entrega garantizada en <strong className="text-teal-400">9 días hábiles</strong></span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {steps.map((step, i) => (
                            <div key={step.num} className="group flex gap-6 p-6 rounded-2xl border border-white/5 bg-white/2 hover:border-teal-500/20 hover:bg-white/5 transition-all duration-300">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                    <span className="text-white font-black text-sm">{step.num}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-white font-bold text-lg">{step.title}</h3>
                                        <span className="text-xs font-mono text-white/30">{step.time}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIOS ───────────────────────────────────────────────── */}
            <section className="py-24 bg-white">
                <div className="container px-4 md:px-6 max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-3 block">Clientes</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                            Números que <span className="bg-gradient-to-r from-teal-500 to-sky-500 bg-clip-text text-transparent">hablan solos</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div key={t.author} className="group p-8 rounded-3xl border border-slate-100 bg-white hover:border-teal-200 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-yellow-400 text-sm">★</span>)}
                                    </div>
                                    <span className="text-2xl font-black text-teal-600">{t.metric} <span className="text-xs font-normal text-slate-400">{t.metricLabel}</span></span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                                <div>
                                    <div className="font-bold text-slate-900 text-sm">{t.author}</div>
                                    <div className="text-slate-400 text-xs">{t.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRECIOS (interactive — isolated client component) ─────────── */}
            <section className="py-24 bg-slate-50" id="precios">
                <div className="container px-4 md:px-6 max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-3 block">Inversión</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Planes Flexibles</h2>
                        <p className="text-slate-500 text-lg">Escoge el nivel de impacto que necesitas.</p>
                    </div>
                    <PricingClient />
                </div>
            </section>

            {/* ── CTA FINAL ─────────────────────────────────────────────────── */}
            <section className="py-32 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-950/50 via-slate-900 to-slate-900 pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-teal-500 to-transparent" />

                <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-bold tracking-widest uppercase mb-8">
                        🚀 Solo 3 cupos esta semana
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        ¿Listo para escalar<br />tu contenido?
                    </h2>
                    <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                        Agenda tu auditoría gratuita de 15 min. Te entregamos 3 ideas virales personalizadas — sin compromiso.
                    </p>
                    <Link href="/contacto" className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-teal-500 to-sky-500 text-white font-bold text-lg rounded-xl hover:scale-105 transition-all shadow-xl shadow-teal-500/25">
                        Agendar Auditoría Gratis
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                    <p className="mt-6 text-slate-600 text-sm">Sin tarjeta de crédito · Respuesta en menos de 24h</p>
                </div>
            </section>
        </main>
    );
}
