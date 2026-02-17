"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Shield, Code2, Users } from "lucide-react";
import Image from "next/image";

const TEAM = [
    {
        name: "HEYBER ENRIQUE BOHORQUEZ FLOREZ",
        role: "Head of Strategy",
        id: "OP-01",
        bio: "Arquitecto de soluciones escalables. Experto en transformar visión de negocio en código eficiente.",
        skills: ["System Design", "Cloud Arch", "Leadership"],
        image: "/images/team/heyber.png",
        icon: Shield
    },
    {
        name: "Sarah Chen",
        role: "Lead Engineer",
        id: "OP-02",
        bio: "Full Stack Developer obsesionada con la performance y la experiencia de usuario fluida.",
        skills: ["React", "Node.js", "Perf Opt"],
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop",
        icon: Code2
    },
    {
        name: "Marcus Reynolds",
        role: "Product Manager",
        id: "OP-03",
        bio: "Puente entre necesidades del cliente y ejecución técnica. Metodologías ágiles.",
        skills: ["Agile", "Product Strategy", "UX"],
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
        icon: Users
    }
];

export function TeamGrid() {
    return (
        <section className="bg-white py-32 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            <div className="mx-auto max-w-7xl px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                        Operativos de <span className="text-teal-600">Élite</span>
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Mentes maestras detrás de la infraestructura.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {TEAM.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className="relative bg-slate-50 border border-gray-200 rounded-2xl p-2 overflow-hidden hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300">
                                {/* Profile Header */}
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-white mb-4">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                    />
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />

                                    <div className="absolute bottom-4 left-4 text-white">
                                        <div className="flex items-center gap-2 mb-1">
                                            <member.icon size={14} className="text-teal-400" />
                                            <span className="text-[10px] font-mono tracking-widest uppercase bg-slate-900/50 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">{member.id}</span>
                                        </div>
                                        <div className="font-bold text-lg leading-tight text-shadow-sm">{member.name}</div>
                                        <div className="text-xs text-gray-300 font-medium">{member.role}</div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-4 pb-4">
                                    <p className="text-sm text-slate-600 mb-6 leading-relaxed min-h-[60px]">
                                        {member.bio}
                                    </p>

                                    {/* Skills Tags */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {member.skills.map(skill => (
                                            <span key={skill} className="text-[10px] px-2 py-1 bg-white border border-gray-200 rounded text-gray-500 font-medium group-hover:border-teal-200 group-hover:text-teal-700 transition-colors">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Social Actions */}
                                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                                        <button className="p-2 rounded hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-colors"><Linkedin size={16} /></button>
                                        <button className="p-2 rounded hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-colors"><Github size={16} /></button>
                                        <button className="p-2 rounded hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-colors ml-auto"><Mail size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
