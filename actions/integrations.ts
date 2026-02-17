'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

export async function getConnectedIntegrations() {
    noStore(); // Disable caching for this server action
    const session = await auth();
    if (!session?.user) return [];

    const accounts = await prisma.account.findMany({
        where: { userId: session.user.id },
        select: {
            provider: true,
            providerAccountId: true,
            // createdAt: true, // Field does not exist on Account model
        }
    });

    // Map to a cleaner structure
    const providers = [
        {
            id: 'facebook',
            name: 'Meta (Facebook)',
            isConfigured: !!process.env.FACEBOOK_CLIENT_ID && !!process.env.FACEBOOK_CLIENT_SECRET
        }
    ];

    return providers.map(p => {
        const account = accounts.find(a => a.provider === p.id);
        return {
            provider: p.id,
            name: p.name,
            connected: !!account,
            accountId: account?.providerAccountId,
            isConfigured: p.isConfigured
        };
    });
}

export async function disconnectIntegration(provider: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await prisma.account.deleteMany({
        where: {
            userId: session.user.id,
            provider: provider
        }
    });

    revalidatePath('/dashboard/settings/integrations');
    return { success: true };
}
