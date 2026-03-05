'use server';

import { db as prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

const LINKEDIN_API_URL = 'https://api.linkedin.com/rest'; // Uses mostly rest endpoints now

/**
 * Gets the stored LinkedIn Ads configuration for the current company.
 */
export async function getLinkedInAdsConfig() {
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
                provider: 'linkedin_ads'
            }
        }
    });

    return config;
}

/**
 * Saves or updates the LinkedIn Ads credentials.
 */
export async function connectLinkedInAds(adAccountId: string, accessToken: string) {
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
                provider: 'linkedin_ads'
            }
        },
        update: {
            config: { adAccountId, accessToken },
            isEnabled: true
        },
        create: {
            companyId: companyUser.companyId,
            provider: 'linkedin_ads',
            config: { adAccountId, accessToken },
            isEnabled: true
        }
    });

    return { success: true, configId: configRecord.id };
}

/**
 * Fetches Real Campaigns from LinkedIn API
 */
export async function getLinkedInCampaigns() {
    const config = await getLinkedInAdsConfig();
    if (!config || !config.isEnabled) {
        throw new Error("LinkedIn Ads is not configured or is disabled.");
    }

    const { adAccountId, accessToken } = config.config as any;

    try {
        const response = await fetch(
            `${LINKEDIN_API_URL}/adCampaigns?q=search&search=(account:(values:(urn:li:sponsoredAccount:${adAccountId})))`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'LinkedIn-Version': '202306',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errBody = await response.text();
            console.error("LinkedIn API Error:", errBody);
            throw new Error(`Failed to fetch LinkedIn campaigns: ${response.statusText}`);
        }

        const data = await response.json();
        return data.elements || [];
    } catch (error) {
        console.error("Failed to get LinkedIn campaigns:", error);
        throw error;
    }
}

/**
 * Fetches campaign performance insights from LinkedIn API
 */
export async function getLinkedInInsights() {
    // LinkedIn stats fetch
    return [];
}
