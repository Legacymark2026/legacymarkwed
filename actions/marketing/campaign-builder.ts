'use server';

import { db as prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@/types/auth';

import { createFacebookAdSet } from './facebook-dispatch';
import { createTikTokCampaign } from './tiktok-dispatch';
import { createGoogleCampaign } from './google-dispatch';
import { createLinkedInCampaign } from './linkedin-dispatch';
export async function saveCampaignDraft(data: {
    name: string;
    platform: string;
    budget: number;
    startDate?: string;
    endDate?: string;
    description?: string;
    parameters: any;
    trackingConfig: any;
    campaignId?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const companyUser = await prisma.companyUser.findFirst({
        where: { userId: session.user.id },
        select: { companyId: true }
    });
    if (!companyUser) throw new Error("Company not found");

    const { campaignId, ...campaignData } = data;

    if (campaignId) {
        // Update existing draft
        const updated = await prisma.campaign.update({
            where: { id: campaignId, companyId: companyUser.companyId },
            data: {
                ...campaignData,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
            }
        });
        return { success: true, id: updated.id };
    } else {
        // Create new draft
        const created = await prisma.campaign.create({
            data: {
                ...campaignData,
                code: `DRAFT-${Date.now()}`,
                status: 'DRAFT',
                approvalStatus: 'DRAFT',
                launchStatus: 'PENDING',
                companyId: companyUser.companyId,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
            }
        });
        return { success: true, id: created.id };
    }
}

export async function submitForApproval(campaignId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.campaign.update({
        where: { id: campaignId },
        data: { approvalStatus: 'PENDING_APPROVAL' }
    });

    revalidatePath('/dashboard/admin/marketing/approvals');
    return { success: true };
}

export async function updateApprovalStatus(campaignId: string, status: 'APPROVED' | 'REJECTED', note?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Must be admin or have permissions to approve
    if (session.user.role !== UserRole.SUPER_ADMIN && session.user.role !== UserRole.CLIENT_ADMIN) {
        throw new Error("Unauthorized to approve campaigns");
    }

    const campaign = await prisma.campaign.update({
        where: { id: campaignId },
        data: {
            approvalStatus: status,
            approvedById: status === 'APPROVED' ? session.user.id : null,
        }
    });

    revalidatePath('/dashboard/admin/marketing/approvals');
    revalidatePath('/dashboard/admin/marketing/campaigns');

    // Optionally log the activity with the note...

    return { success: true, campaign };
}

export async function launchCampaign(campaignId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId }
    });

    if (!campaign) throw new Error("Campaign not found");
    if (campaign.approvalStatus !== 'APPROVED') {
        throw new Error("Campaign must be approved before launching");
    }

    // Setting status to launching
    await prisma.campaign.update({
        where: { id: campaignId },
        data: { launchStatus: 'LAUNCHING' }
    });

    try {
        let platformCampaignId = campaign.code; // Default to keep current if failed

        // Handle specific API Launching
        switch (campaign.platform) {
            case 'FACEBOOK_ADS':
                const fbResult = await createFacebookAdSet({
                    name: campaign.name,
                    parameters: campaign.parameters,
                    dailyBudget: campaign.budget, // Assume daily for now, form has lifetime logic
                });
                platformCampaignId = fbResult.campaignId as string;
                break
            case 'TIKTOK_ADS':
                const tkResult = await createTikTokCampaign({
                    name: campaign.name,
                    parameters: campaign.parameters,
                    dailyBudget: campaign.budget,
                });
                platformCampaignId = tkResult.campaignId as string;
                break;
            case 'GOOGLE_ADS':
                const ggResult = await createGoogleCampaign({
                    name: campaign.name,
                    parameters: campaign.parameters,
                    dailyBudget: campaign.budget,
                });
                platformCampaignId = ggResult.campaignId as string;
                break;
            case 'LINKEDIN_ADS':
                const liResult = await createLinkedInCampaign({
                    name: campaign.name,
                    parameters: campaign.parameters,
                    dailyBudget: campaign.budget,
                });
                platformCampaignId = liResult.campaignId as string;
                break;
            default:
                throw new Error("Unsupported platform");
        }

        // Updating with launched info
        await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                code: platformCampaignId, // Updating external ID
                launchStatus: 'LAUNCHED',
                status: 'ACTIVE',
                launchedAt: new Date()
            }
        });

        revalidatePath('/dashboard/admin/marketing/campaigns');
        return { success: true };
    } catch (error: any) {
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { launchStatus: 'FAILED' }
        });
        console.error("Failed to launch campaign:", error);
        throw new Error(`Failed to launch campaign to platform: ${error.message}`);
    }
}
