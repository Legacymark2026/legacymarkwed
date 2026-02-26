import Link from "next/link";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

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
                        {/* Address & NIT */}
                        <div className="space-y-1.5">
                            <a
                                href={siteConfig.address.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-2 text-xs text-gray-500 hover:text-black transition-colors group"
                            >
                                <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400 group-hover:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{siteConfig.address.full}</span>
                            </a>
                            <p className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="font-medium text-gray-500">NIT:</span>
                                {siteConfig.nit}
                            </p>
                        </div>
                        {/* Social Links */}
                        <div className="flex items-center gap-3 pt-1">
                            {/* Facebook */}
                            <a
                                href={siteConfig.links.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook de LegacyMark"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-200 shadow-sm"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>
                            {/* Instagram */}
                            <a
                                href={siteConfig.links.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram de LegacyMark"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:text-white hover:border-transparent transition-all duration-200 shadow-sm"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                </svg>
                            </a>
                            {/* LinkedIn */}
                            <a
                                href={siteConfig.links.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn de LegacyMark"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5] transition-all duration-200 shadow-sm"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                            {/* WhatsApp */}
                            <a
                                href={siteConfig.links.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="WhatsApp de LegacyMark"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all duration-200 shadow-sm"
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </a>
                        </div>
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

