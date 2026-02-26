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

    // Para todo lo demás (marketing), aplicamos el middleware de internacionalización
    return intlMiddleware(req);
} as any);

export const config = {
    // Ignorar estáticos
    matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|images/|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|txt|xml|json|html)$).*)"],
};
