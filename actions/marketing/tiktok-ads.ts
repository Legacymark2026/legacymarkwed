'use server';

import { db as prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3';

/**
 * Gets the stored TikTok Ads configuration for the current company.
 */
export async function getTikTokAdsConfig() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const companyUser = await prisma.companyUser.findFirst({
        where: { userId: session.user.id },
        select: { companyId: true }
    });

    if (!companyUser) throw new Error("Company not found");

    const config = await prisma.integrationConfig.findUnique({
        where: {
            companyId_provider: {
                companyId: companyUser.companyId,
                provider: 'tiktok_ads'
            }
        }
    });

    return config;
}

/**
 * Saves or updates the TikTok Ads credentials.
 */
export async function connectTikTokAds(advertiserId: string, accessToken: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const companyUser = await prisma.companyUser.findFirst({
        where: { userId: session.user.id },
        select: { companyId: true }
    });

    if (!companyUser) throw new Error("Company not found");

    const configRecord = await prisma.integrationConfig.upsert({
        where: {
            companyId_provider: {
                companyId: companyUser.companyId,
                provider: 'tiktok_ads'
            }
        },
        update: {
            config: { advertiserId, accessToken },
            isEnabled: true
        },
        create: {
            companyId: companyUser.companyId,
            provider: 'tiktok_ads',
            config: { advertiserId, accessToken },
            isEnabled: true
        }
    });

    return { success: true, configId: configRecord.id };
}

/**
 * Fetches Real Campaigns from TikTok Business API
 */
export async function getTikTokCampaigns() {
    const config = await getTikTokAdsConfig();
    if (!config || !config.isEnabled) {
        throw new Error("TikTok Ads is not configured or is disabled.");
    }

    const { advertiserId, accessToken } = config.config as any;

    try {
        const response = await fetch(
            `${TIKTOK_API_URL}/campaign/get/?advertiser_id=${advertiserId}`,
            {
                method: 'GET',
                headers: {
                    'Access-Token': accessToken,
                    'Content-Type': 'application/json'
                }
            }
        );

        const data = await response.json();

        if (data.code !== 0) {
            console.error("TikTok API Error:", data.message);
            throw new Error(data.message || "Failed to fetch TikTok campaigns");
        }

        return data.data?.list || [];
    } catch (error) {
        console.error("Failed to get TikTok campaigns:", error);
        throw error;
    }
}

/**
 * Fetches campaign performance insights from TikTok API
 */
export async function getTikTokInsights() {
    // Note: TikTok reporting often requires asynchronous batch generation depending on the volume.
    // For MVP, we mock or use basic sync reporting if available.
    return [];
}
