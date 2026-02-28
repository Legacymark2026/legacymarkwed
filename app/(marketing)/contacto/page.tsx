import { Metadata } from 'next';
import { ContactForm } from "@/components/sections/contact-form";

export const metadata: Metadata = {
    title: 'Contacto | Legacy Mark',
    description: 'Hablemos de tu proyecto. Agenda una auditoría gratuita de 15 minutos con nuestro equipo de estrategia digital.',
};

// ─── STATIC DATA ─────────────────────────────────────────────────────────────

const contactMethods = [
    {
        icon: '✉️', label: 'Email Principal', value: 'legacymarkcolombia@legacymarksas.com',
        href: 'mailto:legacymarkcolombia@legacymarksas.com', sub: 'Respuesta < 24h',
        color: 'from-violet-500 to-purple-600',
    },
    {
        icon: '📱', label: 'WhatsApp', value: '+57 322 304 7353',
        href: 'https://wa.me/573223047353', sub: 'Disponible L–V 8am–6pm',
        color: 'from-teal-500 to-emerald-600',
    },
    {
        icon: '📍', label: 'Oficina', value: 'Crr18a 22-21 Villa Linda, Girón, Santander',
        href: '#', sub: 'NIT 902028722-3 · Colombia 687541',
        color: 'from-sky-500 to-blue-600',
    },
];

const processSteps = [
    { num: '01', title: 'Envía tu mensaje', desc: 'Cuéntanos sobre tu proyecto, objetivos y presupuesto estimado.', icon: '📝' },
    { num: '02', title: 'Revisamos tu caso', desc: 'Nuestro equipo analiza tu negocio en menos de 24 horas.', icon: '🔍' },
    { num: '03', title: 'Auditoría gratuita', desc: 'Llamada de 15 min para entender tus metas y presentar un plan.', icon: '📞' },
    { num: '04', title: 'Propuesta a medida', desc: 'Recibes una estrategia personalizada con proyecciones de ROI.', icon: '🚀' },
];

const trustedBy = ['TechStart', 'InmoGroup', 'EcoBrand', 'MediaFlow', 'GrowthCo', 'BrandLab'];

const faqs = [
    { q: '¿Cuánto tiempo tarda la primera entrega?', a: 'El onboarding inicia en 48h. Las primeras piezas se entregan en 9 días hábiles.' },
    { q: '¿Hay permanencia mínima?', a: 'No. Operamos mes a mes. Creemos en los resultados, no en los contratos.' },
    { q: '¿Trabajan con marcas internacionales?', a: 'Sí, atendemos clientes de Colombia, USA, México y España con equipos bi-lingüe.' },
];

// SVG globe decoration
const GridOrb = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="0.5">
        <circle cx="100" cy="100" r="90" strokeDasharray="4 3" />
        <circle cx="100" cy="100" r="60" />
        <circle cx="100" cy="100" r="30" />
        <ellipse cx="100" cy="100" rx="90" ry="30" />
        <ellipse cx="100" cy="100" rx="90" ry="60" />
        <line x1="100" y1="10" x2="100" y2="190" />
        <line x1="10" y1="100" x2="190" y2="100" />
        <circle cx="100" cy="100" r="6" fill="currentColor" opacity=".5" />
        <circle cx="64" cy="64" r="3" fill="currentColor" opacity=".4" />
        <circle cx="140" cy="130" r="2.5" fill="currentColor" opacity=".3" />
    </svg>
);

// Floating dot grid
const DotGrid = ({ cols = 8, rows = 6 }: { cols?: number; rows?: number }) => (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols * rows }).map((_, i) => (
            <div
                key={i}
                className="w-1 h-1 rounded-full bg-current"
                style={{ animationDelay: `${(i * 0.07) % 2}s`, opacity: 0.08 + (i % 5) * 0.04 }}
            />
        ))}
    </div>
);

// Pulse ring component (pure CSS)
const PulseRings = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
        {[1, 2, 3].map((i) => (
            <div
                key={i}
                className="absolute rounded-full border border-teal-400/10 animate-ping"
                style={{ width: i * 180, height: i * 180, animationDuration: `${2 + i}s`, animationDelay: `${i * 0.5}s` }}
            />
        ))}
    </div>
);

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-white overflow-hidden">

            {/* ── HERO SECTION ─────────────────────────────────────────────── */}
            <section className="relative pt-28 pb-20 overflow-hidden" style={{ background: 'radial-gradient(ellipse 130% 70% at 50% 0%, #f0fdf4 0%, #f8fafc 60%, #eff6ff 100%)' }}>

                {/* Animated radial blobs */}
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-violet-100/40 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />

                {/* Dot grids */}
                <div className="absolute top-20 left-6 text-teal-400 hidden lg:block pointer-events-none" aria-hidden>
                    <DotGrid cols={8} rows={5} />
                </div>
                <div className="absolute bottom-8 right-6 text-slate-400 hidden lg:block pointer-events-none" aria-hidden>
                    <DotGrid cols={6} rows={4} />
                </div>

                {/* Globe orb top right */}
                <div className="absolute top-16 right-8 w-48 h-48 text-teal-300/20 hidden xl:block pointer-events-none" aria-hidden>
                    <GridOrb />
                </div>

                {/* Top accent line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-teal-400 to-transparent" aria-hidden />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-teal-500 -translate-y-1" aria-hidden />

                {/* Viewfinder corners */}
                {['top-20 left-4 border-t-2 border-l-2', 'top-20 right-4 border-t-2 border-r-2', 'bottom-4 left-4 border-b-2 border-l-2', 'bottom-4 right-4 border-b-2 border-r-2'].map((cls, i) => (
                    <div key={i} className={`absolute w-6 h-6 border-teal-300/40 hidden md:block ${cls}`} aria-hidden />
                ))}

                {/* Status indicator */}
                <div className="absolute top-24 right-5 flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-full shadow-sm hidden md:flex" aria-hidden>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" style={{ animationDuration: '2s' }} />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Equipo disponible</span>
                </div>

                <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-teal-200 bg-white/70 backdrop-blur-md shadow-md mb-8">
                        <span className="text-teal-500 text-sm">📬</span>
                        <span className="text-teal-700 text-xs font-black tracking-widest uppercase">Comienza Aquí</span>
                    </div>

                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6">
                        <span className="block text-slate-900">Hablemos</span>
                        <span className="block bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #7c3aed 100%)' }}>de tu Proyecto</span>
                    </h1>

                    <p className="text-xl text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
                        ¿Tienes un proyecto en mente? Estamos listos para ayudarte a{' '}
                        <span className="text-slate-800 font-semibold">llevarlo al siguiente nivel.</span>
                    </p>

                    {/* Trust micro-proof */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2">
                            {['✓ Sin contrato', '✓ Respuesta en 24h', '✓ Primera consulta gratis'].map((t) => (
                                <span key={t} className="text-xs font-medium text-slate-500 px-3 py-1 rounded-full border border-slate-200 bg-white shadow-sm">{t}</span>
                            ))}
                        </div>

                        {/* Trusted by marquee */}
                        <div className="mt-4 overflow-hidden w-full max-w-xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Con la confianza de</p>
                            <div className="flex gap-6 overflow-hidden">
                                <div className="flex gap-6 shrink-0 animate-marquee">
                                    {[...trustedBy, ...trustedBy].map((name, i) => (
                                        <span key={i} className="text-sm font-bold text-slate-300 whitespace-nowrap">{name}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PROCESS STEPS ────────────────────────────────────────────── */}
            <section className="py-16 bg-white border-y border-slate-100">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                        {processSteps.map((step, i) => (
                            <div key={step.num} className="relative group flex flex-col items-center text-center p-6">
                                {/* Connector line */}
                                {i < processSteps.length - 1 && (
                                    <div className="absolute right-0 top-[44px] w-1/2 h-px bg-gradient-to-r from-teal-200 to-slate-100 hidden md:block" aria-hidden />
                                )}
                                <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-100 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 group-hover:border-teal-300 transition-all duration-300 shadow-sm">
                                    {step.icon}
                                    <span className="absolute -top-1.5 -right-1.5 text-[10px] font-black text-teal-600 bg-teal-50 border border-teal-200 rounded-full w-5 h-5 flex items-center justify-center">{step.num}</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── MAIN: INFO + FORM ─────────────────────────────────────────── */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-6 max-w-6xl">
                    <div className="grid gap-12 lg:grid-cols-5 items-start">

                        {/* ─── LEFT COLUMN: Contact Info ─── */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Section label */}
                            <div>
                                <span className="text-xs font-black text-teal-600 uppercase tracking-widest block mb-3">Canales directos</span>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">¿Prefieres contactarnos directo?</h2>
                                <p className="text-slate-500 text-sm leading-relaxed">Selecciona el canal que más te convenga. Nuestro equipo está disponible por todos los medios.</p>
                            </div>

                            {/* Contact method cards */}
                            <div className="space-y-4">
                                {contactMethods.map((m) => (
                                    <a
                                        key={m.label}
                                        href={m.href}
                                        className="card-lift group flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:border-teal-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden no-underline"
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-[0.04] transition-opacity`} />
                                        <div className={`relative z-10 w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
                                            {m.icon}
                                        </div>
                                        <div className="relative z-10 min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{m.label}</p>
                                            <p className="font-bold text-slate-900 text-sm truncate">{m.value}</p>
                                            <p className="text-xs text-teal-600 font-medium mt-0.5">{m.sub}</p>
                                        </div>
                                        <div className="relative z-10 ml-auto text-slate-300 group-hover:text-teal-400 group-hover:translate-x-1 transition-all flex-shrink-0 self-center">→</div>
                                    </a>
                                ))}
                            </div>

                            {/* Response time card */}
                            <div className="relative p-6 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white overflow-hidden">
                                <PulseRings />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Tiempo de Respuesta Promedio</span>
                                    </div>
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-5xl font-black text-slate-900">&lt;4</span>
                                        <span className="text-xl font-bold text-slate-400 mb-2">horas</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-2 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full" style={{ width: '85%' }} />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">85% de consultas respondidas en el día</p>
                                </div>
                            </div>

                            {/* FAQs */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Preguntas Frecuentes</h3>
                                {faqs.map((faq, i) => (
                                    <div key={i} className="p-5 rounded-xl border border-slate-100 bg-white hover:border-teal-200 hover:shadow-sm transition-all">
                                        <p className="font-bold text-slate-900 text-sm mb-1">{faq.q}</p>
                                        <p className="text-slate-500 text-xs leading-relaxed">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ─── RIGHT COLUMN: Form ─── */}
                        <div className="lg:col-span-3">
                            {/* Form wrapper with premium feel */}
                            <div className="relative rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-100 overflow-hidden">
                                {/* Gradient top bar */}
                                <div className="h-1.5 bg-gradient-to-r from-teal-400 via-sky-500 to-violet-500" />

                                {/* Form header */}
                                <div className="px-8 pt-8 pb-4 border-b border-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900">Envíanos un Mensaje</h2>
                                            <p className="text-slate-400 text-sm mt-0.5">Recibirás respuesta antes de 24h.</p>
                                        </div>
                                        {/* Security badge */}
                                        <div className="flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-100 bg-slate-50">
                                            <span className="text-xl">🔒</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">100% Seguro</span>
                                        </div>
                                    </div>

                                    {/* Form progress hint */}
                                    <div className="flex gap-1 mt-5">
                                        {[1, 2, 3].map((s) => (
                                            <div key={s} className={`h-1 flex-1 rounded-full ${s === 1 ? 'bg-gradient-to-r from-teal-400 to-sky-400' : 'bg-slate-100'}`} />
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Paso 1 de 1 — Solo 2 minutos</p>
                                </div>

                                {/* The form itself */}
                                <div className="p-8">
                                    <ContactForm />
                                </div>

                                {/* Form footer trust signals */}
                                <div className="px-8 pb-8 pt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                                    {['🔒 Datos protegidos por GDPR', '⚡ Respuesta en &lt;24h', '🤝 Sin spam, prometido'].map((t, i) => (
                                        <span key={i} dangerouslySetInnerHTML={{ __html: t }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SOCIAL PROOF STRIP ───────────────────────────────────────── */}
            <section className="py-14 bg-slate-50 border-y border-slate-100">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center">
                        {trustedBy.map((name) => (
                            <div key={name} className="text-center p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-default">
                                <span className="text-sm font-bold text-slate-300 hover:text-slate-500 transition-colors">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── MAP SECTION ──────────────────────────────────────────────── */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-10 items-center">

                        {/* Globe visualization */}
                        <div className="relative aspect-square max-w-sm mx-auto">
                            {/* Pulse rings around globe */}
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="absolute inset-0 rounded-full border border-teal-200/40 animate-ping"
                                    style={{ animationDuration: `${3 + i}s`, animationDelay: `${i * 0.8}s`, transform: `scale(${0.85 + i * 0.1})` }}
                                    aria-hidden
                                />
                            ))}
                            <div className="absolute inset-8 text-teal-300 opacity-60">
                                <GridOrb />
                            </div>
                            {/* Location pin */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="relative">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-400/50 animate-pulse" />
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-teal-400 to-transparent" />
                                </div>
                            </div>
                            {/* Coordinate badge */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-lg text-center whitespace-nowrap">
                                <p className="text-[10px] font-mono text-slate-400">4.7110° N, 74.0721° W</p>
                                <p className="text-xs font-bold text-slate-700">📍 Bogotá, Colombia</p>
                            </div>
                        </div>

                        {/* Info */}
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-teal-600 block mb-4">Nuestra Ubicación</span>
                            <h2 className="text-3xl font-black text-slate-900 mb-6">Presencia en<br /><span className="bg-gradient-to-r from-teal-500 to-sky-500 bg-clip-text text-transparent">Latinoamérica</span></h2>
                            <div className="space-y-4 text-sm text-slate-500 leading-relaxed">
                                <p>Aunque somos nativos digitales y trabajamos de forma remota, tenemos base en <strong className="text-slate-700">Bogotá, Colombia</strong> y atendemos clientes en toda la región.</p>
                                <p>Las reuniones presenciales están disponibles con previa cita. También nos conectamos por videollamada en cualquier zona horaria.</p>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Clientes Activos', val: '120+', icon: '🌎' },
                                    { label: 'Años de Experiencia', val: '5+', icon: '📅' },
                                    { label: 'Proyectos Entregados', val: '340+', icon: '✅' },
                                    { label: 'Países Atendidos', val: '6', icon: '🗺️' },
                                ].map((s) => (
                                    <div key={s.label} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-teal-100 hover:shadow transition-all">
                                        <span className="text-xl block mb-1">{s.icon}</span>
                                        <span className="text-2xl font-black text-slate-900 block">{s.val}</span>
                                        <span className="text-xs text-slate-500">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA BANNER ─────────────────────────────────────────── */}
            <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 60%, #0c2340 100%)' }}>
                {/* Radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(13,148,136,0.15),transparent)] pointer-events-none" />
                {/* Dot pattern */}
                <div
                    className="absolute inset-0 opacity-[0.07] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
                    aria-hidden
                />
                {/* Top accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent" aria-hidden />

                <div className="container mx-auto px-4 md:px-6 max-w-2xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 mb-6">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                        <span className="text-teal-400 text-xs font-black uppercase tracking-widest">Respuesta Garantizada</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        ¿Prefieres que te<br />
                        <span className="bg-gradient-to-r from-teal-400 to-sky-400 bg-clip-text text-transparent">llamemos nosotros?</span>
                    </h2>
                    <p className="text-slate-400 text-lg mb-8">Envíanos tu número y te contactamos en menos de 2 horas en días hábiles.</p>

                    <a
                        href="https://wa.me/573223047353"
                        className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-lg rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-teal-500/30"
                    >
                        💬 +57 322 304 7353 — Escríbenos →
                    </a>
                    <p className="mt-4 text-slate-500 text-sm">Sin bots · Personas reales · Sin spam</p>
                </div>
            </section>

        </main>
    );
}
