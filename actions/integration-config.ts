'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type IntegrationProvider = 'facebook' | 'whatsapp' | 'instagram' | 'google-analytics' | 'google-tag-manager' | 'facebook-pixel' | 'hotjar';

export interface IntegrationConfigData {
    // Meta Config
    appId?: string;
    appSecret?: string;
    verifyToken?: string;
    accessToken?: string; // Long-lived page token
    phoneNumberId?: string; // WhatsApp
    wabaId?: string; // WhatsApp Business Account ID
    pixelId?: string; // Facebook Pixel

    // Google Config
    propertyId?: string; // GA4
    clientEmail?: string; // GA4
    privateKey?: string; // GA4
    containerId?: string; // GTM

    // Hotjar Config
    siteId?: string;
}

export async function getIntegrationConfig(provider: IntegrationProvider): Promise<IntegrationConfigData | null> {
    const session = await auth();
    if (!session?.user?.email) return null; // Simple auth check

    // Get user's company
    const companyUser = await prisma.companyUser.findFirst({
        where: { userId: session.user.id },
        select: { companyId: true }
    });

    if (!companyUser) return null;

    const config = await prisma.integrationConfig.findUnique({
        where: {
            companyId_provider: {
                companyId: companyUser.companyId,
                provider
            }
        }
    });

    if (!config || !config.config) return null;

    return config.config as unknown as IntegrationConfigData;
}

export async function updateIntegrationConfig(provider: IntegrationProvider, data: IntegrationConfigData) {
    console.log(`[IntegrationConfig] Updating config for ${provider}...`);
    try {
        const session = await auth();
        if (!session?.user?.email || !session?.user?.id) {
            console.error("[IntegrationConfig] No session or user email/id found.");
            throw new Error("Unauthorized");
        }

        console.log(`[IntegrationConfig] User ID: ${session.user.id}`);

        const companyUser = await prisma.companyUser.findFirst({
            where: { userId: session.user.id },
            select: { companyId: true }
        });

        if (!companyUser) {
            console.warn(`[IntegrationConfig] No companyUser link found for user ${session.user.id}. Attempting to find/create company...`);

            // Fallback 1: Check if any company exists and link to it (Single Tenant Mode)
            const firstCompany = await prisma.company.findFirst();

            if (firstCompany) {
                console.log(`[IntegrationConfig] Linking user to existing company: ${firstCompany.id}`);
                await prisma.companyUser.create({
                    data: {
                        userId: session.user.id,
                        companyId: firstCompany.id,
                        role: 'OWNER' // Assume owner since they are configuring integrations
                    }
                });
                // Continue with this company
                const result = await prisma.integrationConfig.upsert({
                    where: {
                        companyId_provider: {
                            companyId: firstCompany.id,
                            provider
                        }
                    },
                    update: {
                        config: data as any,
                        isEnabled: true
                    },
                    create: {
                        companyId: firstCompany.id,
                        provider,
                        config: data as any,
                        isEnabled: true
                    }
                });
                console.log(`[IntegrationConfig] Saved successfully (with new link). ID: ${result.id}`);
                revalidatePath('/dashboard/settings/integrations');
                return { success: true };
            } else {
                // Fallback 2: Create a default Company
                console.log(`[IntegrationConfig] No company found at all. Creating default company.`);
                const newCompany = await prisma.company.create({
                    data: {
                        name: 'My Company',
                        slug: 'my-company-' + Math.random().toString(36).substring(7),
                        members: {
                            create: {
                                userId: session.user.id,
                                role: 'OWNER'
                            }
                        }
                    }
                });

                const result = await prisma.integrationConfig.upsert({
                    where: {
                        companyId_provider: {
                            companyId: newCompany.id,
                            provider
                        }
                    },
                    update: {
                        config: data as any,
                        isEnabled: true
                    },
                    create: {
                        companyId: newCompany.id,
                        provider,
                        config: data as any,
                        isEnabled: true
                    }
                });
                console.log(`[IntegrationConfig] Saved successfully (new company created). ID: ${result.id}`);
                revalidatePath('/dashboard/settings/integrations');
                return { success: true };
            }
        }

        console.log(`[IntegrationConfig] Found Company ID: ${companyUser.companyId}`);

        const result = await prisma.integrationConfig.upsert({
            where: {
                companyId_provider: {
                    companyId: companyUser.companyId,
                    provider
                }
            },
            update: {
                config: data as any,
                isEnabled: true
            },
            create: {
                companyId: companyUser.companyId,
                provider,
                config: data as any,
                isEnabled: true
            }
        });

        console.log(`[IntegrationConfig] Saved successfully. ID: ${result.id}`);
        revalidatePath('/dashboard/settings/integrations');
        return { success: true };
    } catch (error: any) {
        console.error("[IntegrationConfig] Error updating config:", error);
        throw new Error(error.message || "Failed to update configuration");
    }
}
