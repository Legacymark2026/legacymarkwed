
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getIntegrationConfig, updateIntegrationConfig } from "@/actions/integration-config";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(new URL("/dashboard/settings?error=" + error, req.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL("/dashboard/settings?error=no_code", req.url));
    }

    try {
        const session = await auth();
        // Note: Check session usually, but for callback we might rely on state or just identifying the user 
        // For now, let's assume valid session or we can't save.
        if (!session?.user?.id) {
            return NextResponse.redirect(new URL("/auth/login?returnUrl=/dashboard/settings", req.url));
        }

        // 1. Get App Config from DB
        let config = await getIntegrationConfig('facebook');

        // Fallback to Environment Variables if DB config is missing
        if (!config?.appId || !config?.appSecret) {
            console.log("[Facebook Callback] DB Config missing. Checking Environment Variables...");
            const envAppId = process.env.FACEBOOK_CLIENT_ID;
            const envAppSecret = process.env.FACEBOOK_CLIENT_SECRET;

            if (envAppId && envAppSecret) {
                config = {
                    ...config,
                    appId: envAppId,
                    appSecret: envAppSecret
                } as any;
                console.log("[Facebook Callback] Used Environment Variables fallback.");
            }
        }

        if (!config?.appId || !config?.appSecret) {
            const missing = [];
            if (!config?.appId) missing.push("App ID");
            if (!config?.appSecret) missing.push("App Secret");

            console.error(`[Facebook Callback] Missing Config: ${missing.join(", ")}`);
            throw new Error(`Missing Facebook Configuration in DB & Env. Missing: ${missing.join(", ")}. Check FACEBOOK_CLIENT_ID/SECRET.`);
        }

        // 2. Exchange Code for Token
        // CRITICAL: origin must match the one used in the frontend button
        let origin = new URL(req.url).origin;

        // Smart Origin Detection (Aggressive)
        const envUrl = process.env.NEXTAUTH_URL;
        const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

        // Check headers for real host (works behind Vercel/proxies)
        const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
        const protocol = req.headers.get("x-forwarded-proto") || "https";

        if (envUrl && !envUrl.includes("localhost")) {
            origin = envUrl;
        } else if (vercelUrl) {
            origin = `https://${vercelUrl}`;
        } else if (host && !host.includes("localhost")) {
            origin = `${protocol}://${host}`;
        }

        // FINAL SAFETY NET: If we are still "localhost" but clearly not in a local dev environment (no PORT),
        // or just to be absolutely sure for this user:
        if (origin.includes("localhost") && process.env.NODE_ENV === "production") {
            origin = "https://legacymarksas.com";
        }

        // Safety: ensure no trailing slash
        origin = origin.replace(/\/$/, "");

        const redirectUri = `${origin}/api/integrations/facebook/callback`;

        console.log(`[Facebook Callback] Exchanging code for token...`);
        console.log(`[Facebook Callback] Origin used: ${origin}`);
        console.log(`[Facebook Callback] Redirect URI sent to FB: ${redirectUri}`);

        // IMPORTANT: Params must be encoded
        const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${config.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${config.appSecret}&code=${code}`;

        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            console.error("[Facebook Callback] Token Exchange Error:", JSON.stringify(tokenData.error, null, 2));
            throw new Error(`Facebook Error: ${tokenData.error.message}`);
        }

        const shortLivedToken = tokenData.access_token;

        // 3. Exchange for Long-Lived Token
        const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${config.appId}&client_secret=${config.appSecret}&fb_exchange_token=${shortLivedToken}`;

        const longLivedRes = await fetch(longLivedUrl);
        const longLivedData = await longLivedRes.json();

        const finalToken = longLivedData.access_token || shortLivedToken;

        // 4. Save to DB
        await updateIntegrationConfig('facebook', {
            ...config,
            accessToken: finalToken
        });

        // 5. Redirect Success
        // Use the sanitized 'origin' to ensure we don't redirect to an internal localhost
        return NextResponse.redirect(`${origin}/dashboard/settings?tab=integrations&success=facebook_connected`);

    } catch (error: any) {
        console.error("[Facebook Callback] Error:", error);
        // Also use sanitized origin for error redirect if possible, otherwise safe fallback
        const base = process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")
            ? process.env.NEXTAUTH_URL
            : new URL(req.url).origin;

        return NextResponse.redirect(`${base}/dashboard/settings?error=${encodeURIComponent(error.message)}`);
    }
}
