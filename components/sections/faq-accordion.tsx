"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Terminal, HelpCircle } from "lucide-react";

export function FaqAccordion() {
    return (
        <section className="bg-slate-50 py-24 relative border-y border-gray-200">
            <div className="mx-auto max-w-3xl px-6 lg:px-8 relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-white text-teal-700 text-xs font-mono mb-4 uppercase tracking-widest shadow-sm">
                        <HelpCircle size={12} />
                        Knowledge Base
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl text-balance">
                        Protocolos de <span className="text-teal-600">Respuesta</span>
                    </h2>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        </div>
                        <div className="mx-auto text-[10px] font-mono text-gray-400">faq_terminal_v1.sh</div>
                    </div>

                    <div className="p-6 md:p-8">
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            <AccordionItem value="item-1" className="border border-gray-100 rounded-lg px-4 data-[state=open]:border-teal-200 data-[state=open]:bg-teal-50/30 transition-all">
                                <AccordionTrigger className="text-slate-800 hover:text-teal-700 font-medium text-left hover:no-underline">
                                    <span className="flex items-center gap-3">
                                        <Terminal size={14} className="text-teal-500 shrink-0" />
                                        ¿Cuánto tarda la implementación?
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-600 pl-7 leading-relaxed font-normal">
                                    Dependiendo de la complejidad. Landing pages tácticas: 2-3 semanas. Sistemas complejos: 4-8 semanas. Nuestro sprint inicial dura 5 días.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2" className="border border-gray-100 rounded-lg px-4 data-[state=open]:border-teal-200 data-[state=open]:bg-teal-50/30 transition-all">
                                <AccordionTrigger className="text-slate-800 hover:text-teal-700 font-medium text-left hover:no-underline">
                                    <span className="flex items-center gap-3">
                                        <Terminal size={14} className="text-teal-500 shrink-0" />
                                        ¿Tienen soporte post-lanzamiento?
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-600 pl-7 leading-relaxed font-normal">
                                    Absolutamente. Ofrecemos paquetes de mantenimiento "Always-On" para asegurar uptime del 99.9%, actualizaciones de seguridad y optimización continua.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3" className="border border-gray-100 rounded-lg px-4 data-[state=open]:border-teal-200 data-[state=open]:bg-teal-50/30 transition-all">
                                <AccordionTrigger className="text-slate-800 hover:text-teal-700 font-medium text-left hover:no-underline">
                                    <span className="flex items-center gap-3">
                                        <Terminal size={14} className="text-teal-500 shrink-0" />
                                        ¿Se integran con mi stack actual?
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-600 pl-7 leading-relaxed font-normal">
                                    Sí. Nos conectamos vía API a cualquier CRM (HubSpot, Salesforce), ERP o base de datos. Somos agnósticos a la tecnología pero expertos en integración.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    );
}
