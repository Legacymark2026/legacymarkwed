import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface TiktokEventData {
    eventName: string;
    eventTime?: number;
    eventId?: string;
    eventSourceUrl?: string;
    userData: {
        email?: string; // Will be hashed SHA256
        phone?: string; // Will be hashed SHA256
        clientIpAddress?: string;
        clientUserAgent?: string;
    };
    customData?: {
        contentName?: string;
        value?: number;
        currency?: string;
    };
}

function hashSha256(str: string): string {
    return crypto.createHash('sha256').update(str.toLowerCase().trim()).digest('hex');
}

export async function sendTiktokCapiEvent(companyId: string, event: TiktokEventData) {
    try {
        const configRecord = await prisma.integrationConfig.findUnique({
            where: {
                companyId_provider: {
                    companyId: companyId,
                    provider: 'tiktok-pixel'
                }
            }
        });

        if (!configRecord || !configRecord.isEnabled) return null;

        const data = configRecord.config as any;
        const pixelCode = data?.tiktokPixelId;
        const accessToken = data?.tiktokAccessToken;

        if (!pixelCode || !accessToken) {
            console.warn(`[TikTok-CAPI] Missing Pixel ID or Token for company ${companyId}`);
            return null;
        }

        const userPayload: any = {};
        if (event.userData.email) {
            userPayload.email = hashSha256(event.userData.email);
        }
        if (event.userData.phone) {
            userPayload.phone_number = hashSha256(event.userData.phone.replace(/[^0-9]/g, ''));
        }
        if (event.userData.clientIpAddress) userPayload.ip = event.userData.clientIpAddress;
        if (event.userData.clientUserAgent) userPayload.user_agent = event.userData.clientUserAgent;

        const timestamp = event.eventTime || Math.floor(Date.now() / 1000);

        const payload = {
            event_source: "web",
            event_source_id: pixelCode,
            data: [
                {
                    event: event.eventName,
                    event_time: timestamp,
                    user: userPayload,
                    properties: {
                        currency: event.customData?.currency || "COP",
                        value: event.customData?.value || 0,
                        content_name: event.customData?.contentName,
                    },
                    page: {
                        url: event.eventSourceUrl,
                    }
                }
            ]
        };

        const url = "https://business-api.tiktok.com/open_api/v1.3/pixel/track/";

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Token': accessToken
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.code !== 0) {
            console.error("[TikTok-CAPI] Error sending event to TikTok:", JSON.stringify(result, null, 2));
            return { success: false, error: result.message || "Unknown TikTok error" };
        }

        console.log(`[TikTok-CAPI] Event ${event.eventName} sent successfully to pixel ${pixelCode}.`);
        return { success: true, result };

    } catch (error: any) {
        console.error("[TikTok-CAPI] Exception sending event:", error);
        return { success: false, error: error.message };
    }
}
