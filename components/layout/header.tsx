"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavLink {
    name: string;
    href: string;
    submenu?: { name: string; href: string }[];
}

const navLinks: NavLink[] = [
    { name: "Inicio", href: "/" },
    { name: "Nosotros", href: "/nosotros" },
    {
        name: "Soluciones",
        href: "#",
        submenu: [
            { name: "Creación de Contenido", href: "/soluciones/creacion-contenido" },
            { name: "Estrategia Digital", href: "/soluciones/estrategia" },
            { name: "Estrategia de Marca", href: "/soluciones/estrategia-de-marca" },
            { name: "Automatización IA", href: "/soluciones/automatizacion" },
            { name: "Desarrollo Web", href: "/soluciones/web-dev" },
            { name: "Growth Marketing", href: "/servicios" },
            { name: "Marketing 360°", href: "/flyering" }
        ]
    },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Metodología", href: "/metodologia" },
    { name: "Blog", href: "/blog" },
    { name: "Contacto", href: "/contacto" },
];

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled
                ? "bg-white/80 backdrop-blur-lg border-b border-gray-200/50 py-2 shadow-sm"
                : "bg-transparent border-transparent py-4 md:py-6"
                }`}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative h-12 w-[200px] sm:h-14 sm:w-[280px] transition-transform duration-300 ease-out group-hover:scale-105">
                        {/* TODO: Update with dark logo for light theme if needed. Assuming current logo works on white or is adaptive */}
                        <Image src="/logo.png" alt="LegacyMark" fill className="object-contain" priority />
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <div
                            key={link.name}
                            className="relative"
                            onMouseEnter={() => setHoveredLink(link.name)}
                            onMouseLeave={() => setHoveredLink(null)}
                        >
                            <Link
                                href={link.href}
                                className={`flex items-center gap-1 text-sm font-medium transition-colors ${isScrolled ? "text-slate-600 hover:text-teal-600" : "text-slate-800 hover:text-teal-600"
                                    }`}
                            >
                                {link.name}
                                {link.submenu && <ChevronDown size={14} />}
                            </Link>

                            {/* Simple Dropdown */}
                            {link.submenu && hoveredLink === link.name && (
                                <div className="absolute top-full left-0 pt-4 w-56">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden p-1"
                                    >
                                        {link.submenu.map(sub => (
                                            <Link
                                                key={sub.name}
                                                href={sub.href}
                                                className="block px-4 py-3 rounded-lg text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors font-medium"
                                            >
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    ))}
                    <Link href="/contacto">
                        <Button size="sm" className={`rounded-full px-6 shadow-lg hover:shadow-xl transition-all ${isScrolled ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-900 text-white hover:bg-slate-800"
                            }`}>
                            Transforma tu marca
                        </Button>
                    </Link>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className={`md:hidden ${isScrolled ? "text-slate-900" : "text-slate-900"}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-b border-gray-200 bg-white absolute top-full left-0 right-0 shadow-xl"
                    >
                        <div className="flex flex-col gap-4 p-6">
                            {navLinks.map((link) => (
                                <div key={link.name}>
                                    {link.submenu ? (
                                        <div className="space-y-2">
                                            <div className="font-bold text-slate-900 text-lg">{link.name}</div>
                                            <div className="pl-4 space-y-2 border-l-2 border-teal-100 ml-1">
                                                {link.submenu.map(sub => (
                                                    <Link
                                                        key={sub.name}
                                                        href={sub.href}
                                                        className="block text-base font-medium text-slate-600 active:text-teal-600"
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            href={link.href}
                                            className="block text-lg font-bold text-slate-800 hover:text-teal-600"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    )}
                                </div>
                            ))}
                            <div className="pt-4">
                                <Link href="/contacto" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full h-12 rounded-full text-lg bg-slate-900 text-white">
                                        Transforma tu marca
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
