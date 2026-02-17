import { NextRequest } from "next/server";
import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";

// Use the authorized callback from authConfig
export default NextAuth(authConfig).auth;

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
