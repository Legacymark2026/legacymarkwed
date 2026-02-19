'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type IntegrationProvider = 'facebook' | 'whatsapp' | 'instagram';

export interface IntegrationConfigData {
    appId?: string;
    appSecret?: string;
    verifyToken?: string;
    accessToken?: string; // Long-lived page token
    phoneNumberId?: string; // WhatsApp
    wabaId?: string; // WhatsApp Business Account ID
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
            console.error(`[IntegrationConfig] No company found for user ${session.user.id}`);
            throw new Error("No company found for this user");
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
