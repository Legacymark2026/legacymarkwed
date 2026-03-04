import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Crear middleware de next-intl
const intlMiddleware = createIntlMiddleware(routing);

// Obtener la función auth de NextAuth
const { auth } = NextAuth(authConfig);

// Combinar ambos middlewares
export default auth(function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Si es una ruta de API o Auth, dejamos que NextAuth se encargue 
    const isApiOrAuth = pathname.startsWith("/api") || pathname.startsWith("/auth") || pathname.startsWith("/_next");
    if (isApiOrAuth) {
        return NextResponse.next();
    }

    // Para el dashboard, pasamos directo ya que NextAuth maneja la protección
    // (A menos que también quieras traducir el dashboard, en cuyo caso lo quitamos de aquí)
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
        return NextResponse.next();
    }

    // Para todo lo demás (marketing), aplicamos Next-Intl.
    // === ULTRA-PROFESSIONAL GEO-IP ROUTING ===
    // We intercept requests at the root '/' to dynamically redirect them based on their country
    // before next-intl uses just the browser defaults.
    if (pathname === '/') {
        // Vercel injects the ISO 3166-1 alpha-2 country code
        const country = req.headers.get('x-vercel-ip-country') || 'Unknown';

        // English speaking countries
        const enCountries = new Set(['US', 'GB', 'CA', 'AU', 'NZ', 'IE']);
        // Spanish speaking countries
        const esCountries = new Set(['ES', 'CO', 'MX', 'AR', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'GQ']);

        let targetLocale = 'es'; // Default to Spanish for LegacyMark's core market

        if (enCountries.has(country)) {
            targetLocale = 'en';
        } else if (esCountries.has(country)) {
            targetLocale = 'es';
        } else {
            // Fallback to browser's accept-language if country is neither (e.g., DE, FR, etc.)
            const acceptLanguage = req.headers.get('accept-language') || '';
            if (acceptLanguage.toLowerCase().includes('en')) {
                targetLocale = 'en';
            }
        }

        // Perform the ultra-fast edge redirect to the corresponding locale subpath
        const url = req.nextUrl.clone();
        url.pathname = `/${targetLocale}`;
        return NextResponse.redirect(url);
    }

    // Para cualquier otra sub-ruta (ej. /es/servicios), aplicamos el middleware de internacionalización estándar
    return intlMiddleware(req);
} as any);
export const config = {
    // Ignorar estáticos
    matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|images/|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|txt|xml|json|html)$).*)"],
};
