"use client";

import { useState, useEffect } from "react";
import { Mail, Phone } from "lucide-react";

interface Props {
    leadName: string;
    leadEmail: string;
    leadPhone: string | null;
    children?: React.ReactNode; // For the status selector clone
}

export function LeadStickyActions({ leadName, leadEmail, leadPhone, children }: Props) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show header when scrolled down 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 py-3 transform animate-in slide-in-from-top-full duration-300 pointer-events-none">
            {/* Inner container to restrict width and apply styles */}
            <div className="flex items-center justify-between w-full max-w-4xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg shadow-slate-200/50 rounded-2xl px-5 py-3 pointer-events-auto transition-all">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-sky-500 flex items-center justify-center text-white font-bold shrink-0">
                        {leadName[0]?.toUpperCase() || "L"}
                    </div>
                    <div className="truncate hidden sm:block">
                        <p className="text-sm font-black text-slate-900 truncate">{leadName || "Sin nombre"}</p>
                        <p className="text-xs text-slate-500 truncate">{leadEmail}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                    {children}

                    <div className="w-px h-6 bg-slate-200 hidden sm:block mx-1" />

                    <div className="flex items-center gap-2">
                        <a href={`mailto:${leadEmail}`} className="p-2 rounded-xl text-slate-600 hover:text-teal-600 hover:bg-teal-50 border border-transparent hover:border-teal-100 transition-all focus:outline-none" title="Enviar Email">
                            <Mail className="w-4 h-4" />
                        </a>
                        {leadPhone && (
                            <a href={`tel:${leadPhone}`} className="p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all focus:outline-none" title="Llamar">
                                <Phone className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
