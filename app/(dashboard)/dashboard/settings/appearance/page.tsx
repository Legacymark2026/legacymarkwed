"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Laptop } from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsAppearancePage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-10">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 border-b border-slate-200 pb-4">
                    Apariencia y Tema visual
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                    Personaliza la interfaz de LegacyMark para que se adapte a tu entorno de trabajo.
                </p>
            </div>

            <section className="space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Modo Principal</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Light Theme */}
                    <button
                        onClick={() => setTheme("light")}
                        className={`group relative flex flex-col items-start p-1 rounded-2xl border-2 transition-all text-left overflow-hidden ${theme === "light" ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        <div className="w-full h-32 bg-slate-100 rounded-xl mb-3 overflow-hidden border border-slate-200 relative flex items-center justify-center relative">
                            <div className="absolute inset-x-2 top-2 h-4 bg-white rounded-md shadow-sm border border-slate-200"></div>
                            <div className="absolute inset-x-2 bottom-2 h-16 bg-white rounded-md shadow-sm border border-slate-200 flex p-2 gap-2">
                                <div className="w-1/3 h-full bg-slate-100 rounded"></div>
                                <div className="w-2/3 h-full bg-slate-50 border border-slate-100 rounded"></div>
                            </div>
                        </div>
                        <div className="px-3 pb-3 flex items-center justify-between w-full">
                            <span className="font-medium text-slate-900 flex items-center gap-2">
                                <Sun className="w-4 h-4 text-orange-500" /> Claro
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${theme === "light" ? "border-slate-900 bg-slate-900" : "border-slate-300"}`}>
                                {theme === "light" && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                        </div>
                    </button>

                    {/* Dark Theme */}
                    <button
                        onClick={() => setTheme("dark")}
                        className={`group relative flex flex-col items-start p-1 rounded-2xl border-2 transition-all text-left overflow-hidden ${theme === "dark" ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        <div className="w-full h-32 bg-slate-900 rounded-xl mb-3 overflow-hidden border border-slate-800 relative flex items-center justify-center relative">
                            <div className="absolute inset-x-2 top-2 h-4 bg-slate-800 rounded-md shadow-sm border border-slate-700"></div>
                            <div className="absolute inset-x-2 bottom-2 h-16 bg-slate-800 rounded-md shadow-sm border border-slate-700 flex p-2 gap-2">
                                <div className="w-1/3 h-full bg-slate-900 rounded"></div>
                                <div className="w-2/3 h-full bg-slate-900 border border-slate-700 rounded"></div>
                            </div>
                        </div>
                        <div className="px-3 pb-3 flex items-center justify-between w-full">
                            <span className="font-medium text-slate-900 flex items-center gap-2">
                                <Moon className="w-4 h-4 text-indigo-500" /> Oscuro
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${theme === "dark" ? "border-slate-900 bg-slate-900" : "border-slate-300"}`}>
                                {theme === "dark" && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                        </div>
                    </button>

                    {/* System Theme */}
                    <button
                        onClick={() => setTheme("system")}
                        className={`group relative flex flex-col items-start p-1 rounded-2xl border-2 transition-all text-left overflow-hidden ${theme === "system" ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-900 rounded-xl mb-3 overflow-hidden border border-slate-300 relative flex items-center justify-center relative">
                            <Monitor className="absolute text-white/50 w-12 h-12" />
                        </div>
                        <div className="px-3 pb-3 flex items-center justify-between w-full">
                            <span className="font-medium text-slate-900 flex items-center gap-2">
                                <Laptop className="w-4 h-4 text-slate-500" /> Sistema
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${theme === "system" ? "border-slate-900 bg-slate-900" : "border-slate-300"}`}>
                                {theme === "system" && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                        </div>
                    </button>
                </div>
            </section>
        </div>
    );
}
