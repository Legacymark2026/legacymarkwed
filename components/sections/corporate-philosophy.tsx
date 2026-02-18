"use client";

import { motion } from "framer-motion";
import { Eye, Flag, Heart } from "lucide-react";

const features = [
    {
        title: "Misión",
        description: "Impulsamos el desarrollo de empresas a través de estrategias de marketing y publicidad basadas en el ADN de cada marca. Diagnosticamos y resolvemos los obstáculos de comunicación para transformar el potencial de nuestros clientes en resultados de ventas y posicionamiento real.",
        icon: Flag,
        color: "bg-blue-500",
        delay: 0
    },
    {
        title: "Visión 2030",
        description: "Ser el referente del marketing táctico y estratégico en Latinoamérica, reconocidos por transformar marcas emergentes en legados corporativos a través de resultados de alto impacto y crecimiento sostenible.",
        icon: Eye,
        color: "bg-teal-500",
        delay: 0.2
    },
    {
        title: "Personalidad",
        description: "Somos una agencia creativa, innovadora y comprometida. Nuestra amabilidad y cercanía destacará al inicio de una conversación, pues nuestro legado es cultivar la calidez humana en cada empresa que trabaje con nosotros.",
        icon: Heart,
        color: "bg-rose-500",
        delay: 0.4
    }
];

export function CorporatePhilosophy() {
    return (
        <section className="py-24 relative overflow-hidden bg-slate-50">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-6">
                        Nuestro <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">ADN Corporativo</span>
                    </h2>
                    <p className="text-slate-500 text-lg">
                        Más que una agencia, somos arquitectos de crecimiento empresarial.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
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

                            <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed text-pretty">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
