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
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const companyUser = await prisma.companyUser.findFirst({
        where: { userId: session.user.id },
        select: { companyId: true }
    });

    if (!companyUser) throw new Error("No company found");

    await prisma.integrationConfig.upsert({
        where: {
            companyId_provider: {
                companyId: companyUser.companyId,
                provider
            }
        },
        update: {
            config: data as any,
        },
        create: {
            companyId: companyUser.companyId,
            provider,
            config: data as any,
            isEnabled: true
        }
    });

    revalidatePath('/dashboard/settings/integrations');
    return { success: true };
}
