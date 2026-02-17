import Link from "next/link";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";

export function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-gray-50 pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="block group">
                            <div className="relative h-16 w-[240px] sm:h-20 sm:w-[360px] transition-transform duration-300 ease-out group-hover:scale-105 origin-left drop-shadow-sm">
                                <NextImage
                                    src="/logo.png"
                                    alt="LegacyMark"
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 640px) 240px, 360px"
                                />
                            </div>
                        </Link>
                        <p className="text-sm text-gray-500">
                            Transformamos marcas a través de la innovación, el diseño y la estrategia digital.
                        </p>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-black">Servicios</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/servicios/estrategia" className="hover:text-black">Estrategia de Marca</Link></li>
                            <li><Link href="/servicios/creacion-contenido" className="hover:text-black">Creación de Contenido</Link></li>
                            <li><Link href="/servicios/marketing" className="hover:text-black">Marketing Digital</Link></li>
                            <li><Link href="/servicios/deseno" className="hover:text-black">Diseño & Creatividad</Link></li>
                            <li><Link href="/servicios/analytics" className="hover:text-black">Analytics & ROI</Link></li>
                            <li><Link href="/flyering" className="hover:text-black">Marketing 360°</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-black">Empresa</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/metodologia" className="hover:text-black">Metodología</Link></li>
                            <li><Link href="/portfolio" className="hover:text-black">Portfolio</Link></li>
                            <li><Link href="/blog" className="hover:text-black">Insights</Link></li>
                            <li><Link href="/contacto" className="hover:text-black">Contacto</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-black">Newsletter</h3>
                        <p className="mb-4 text-sm text-gray-500">Recibe las últimas tendencias en marketing e innovación.</p>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Tu email"
                                    className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                />
                                <Button variant="primary" size="sm">Suscribir</Button>
                            </div>
                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="footer-newsletter-consent"
                                    className="mt-1 h-3 w-3 rounded border-gray-300 text-black focus:ring-black"
                                    required
                                />
                                <label htmlFor="footer-newsletter-consent" className="text-xs text-gray-500">
                                    Acepto la <Link href="/politica-privacidad" className="underline hover:text-black">Política de Privacidad</Link>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 border-t border-gray-200 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} LegacyMark. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <Link href="/politica-privacidad" className="hover:text-black">Privacidad</Link>
                        <Link href="/terms" className="hover:text-black">Términos</Link>
                        <Link href="/politica-cookies" className="hover:text-black">Cookies</Link>
                        <Link href="/sitemap" className="hover:text-black">Mapa del sitio</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
