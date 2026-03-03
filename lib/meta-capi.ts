import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface CapiEventData {
    eventName: string;
    eventTime?: number;
    actionSource?: 'website' | 'app' | 'physical_store' | 'system_generated' | 'other';
    userData: {
        em?: string; // Email (will be hashed)
        ph?: string; // Phone (will be hashed)
        fn?: string; // First Name (will be hashed)
        ln?: string; // Last Name (will be hashed)
        client_ip_address?: string;
        client_user_agent?: string;
        external_id?: string;
    };
    customData?: {
        currency?: string;
        value?: number;
        content_name?: string;
        content_category?: string;
        content_ids?: string[];
        status?: string;
    };
    eventSourceUrl?: string; // URL where the event occurred
}

function hashSha256(str: string): string {
    return crypto.createHash('sha256').update(str.toLowerCase().trim()).digest('hex');
}

export async function sendMetaCapiEvent(companyId: string, event: CapiEventData) {
    try {
        const configRecord = await prisma.integrationConfig.findUnique({
            where: {
                companyId_provider: {
                    companyId: companyId,
                    provider: 'facebook-pixel'
                }
            }
        });

        if (!configRecord || !configRecord.isEnabled) return null;

        const data = configRecord.config as any;
        const pixelId = data?.pixelId;
        const capiToken = data?.capiToken;

        if (!pixelId || !capiToken) {
            console.warn(`[MetaCAPI] Missing Pixel ID or Token for company ${companyId}`);
            return null;
        }

        // Hash required user data fields according to Meta's specs
        const hashedUserData: any = { ...event.userData };
        ['em', 'ph', 'fn', 'ln', 'external_id'].forEach(key => {
            if (hashedUserData[key]) {
                // Remove spaces and format before hashing
                let val = hashedUserData[key].toLowerCase().trim();
                // Strip non-numeric from phone
                if (key === 'ph') {
                    val = val.replace(/[^0-9]/g, '');
                }

                if (val.length === 64 && /^[0-9a-f]{64}$/i.test(val)) {
                    // It's already an SHA256 hex string, keep it
                    hashedUserData[key] = val;
                } else {
                    hashedUserData[key] = hashSha256(val);
                }
            }
        });

        // Clean undefined fields
        Object.keys(hashedUserData).forEach(key => hashedUserData[key] === undefined && delete hashedUserData[key]);

        const payload = {
            data: [
                {
                    event_name: event.eventName,
                    event_time: event.eventTime || Math.floor(Date.now() / 1000),
                    action_source: event.actionSource || "system_generated",
                    event_source_url: event.eventSourceUrl,
                    user_data: hashedUserData,
                    custom_data: {
                        currency: 'COP', // Default currency for LegacyMark
                        value: 0.00,
                        ...event.customData
                    }
                }
            ]
        };

        const currentApiVersion = "v19.0";
        const url = `https://graph.facebook.com/${currentApiVersion}/${pixelId}/events?access_token=${capiToken}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("[MetaCAPI] Error sending event to Meta:", JSON.stringify(result, null, 2));
            return { success: false, error: result.error?.message || "Unknown error" };
        }

        console.log(`[MetaCAPI] Event ${event.eventName} sent successfully to pixel ${pixelId}. Tracking trace: ${result.events_received}`);
        return { success: true, result };

    } catch (error: any) {
        console.error("[MetaCAPI] Exception sending event:", error);
        return { success: false, error: error.message };
    }
}
