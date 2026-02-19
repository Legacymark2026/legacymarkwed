
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
        const config = await getIntegrationConfig('facebook');
        if (!config?.appId || !config?.appSecret) {
            throw new Error("Missing Facebook App Configuration in DB");
        }

        // 2. Exchange Code for Token
        const redirectUri = `${new URL(req.url).origin}/api/integrations/facebook/callback`;
        const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${config.appId}&redirect_uri=${redirectUri}&client_secret=${config.appSecret}&code=${code}`;

        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            throw new Error(tokenData.error.message);
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
        return NextResponse.redirect(new URL("/dashboard/settings?tab=integrations&success=facebook_connected", req.url));

    } catch (error: any) {
        console.error("[Facebook Callback] Error:", error);
        return NextResponse.redirect(new URL(`/dashboard/settings?error=${encodeURIComponent(error.message)}`, req.url));
    }
}
