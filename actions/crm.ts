"use server";

import { prisma } from "@/lib/prisma";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Basic check for authenticated user (MVP)
async function checkAuth() {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };
    return null;
}

export interface TeamNode {
    id: string;
    name: string;
    parentId: string | null;
    children: TeamNode[];
    _count?: {
        members: number;
    };
}

export async function getCRMStats() {
    const authCheck = await checkAuth();
    if (authCheck) return authCheck;

    try {
        const [pipelineValue, activeDeals, wonDeals, lostDeals] = await Promise.all([
            prisma.deal.aggregate({
                _sum: { value: true },
                where: { stage: { notIn: ["WON", "LOST"] } }
            }),
            prisma.deal.count({
                where: { stage: { notIn: ["WON", "LOST"] } }
            }),
            prisma.deal.count({
                where: { stage: "WON" }
            }),
            prisma.deal.count({
                where: { stage: "LOST" }
            })
        ]);

        const totalClosed = wonDeals + lostDeals;
        const winRate = totalClosed > 0 ? (wonDeals / totalClosed) * 100 : 0;

        // Calculate Avg Deal Size (Won)
        const wonValue = await prisma.deal.aggregate({
            _sum: { value: true },
            where: { stage: "WON" }
        });

        const avgDealSize = wonDeals > 0 ? (wonValue._sum.value || 0) / wonDeals : 0;

        return {
            pipelineValue: pipelineValue._sum.value || 0,
            activeDeals,
            winRate: Math.round(winRate),
            avgDealSize: Math.round(avgDealSize)
        };
    } catch (error) {
        console.error("Failed to fetch CRM stats:", error);
        return { error: "Failed to load stats" };
    }
}

export async function getSalesFunnel() {
    // Return data format compatible with Recharts
    try {
        const stages = ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON"];
        const funnelData = [];

        for (const stage of stages) {
            const count = await prisma.deal.count({ where: { stage } });
            funnelData.push({ name: stage, value: count });
        }

        return funnelData;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getRecentActivity() {
    try {
        // Fetch recent leads and deals
        const [recentLeads, recentDeals] = await Promise.all([
            prisma.lead.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, name: true, status: true, createdAt: true }
            }),
            prisma.deal.findMany({
                orderBy: { updatedAt: 'desc' },
                take: 5,
                select: { id: true, title: true, stage: true, updatedAt: true, value: true }
            })
        ]);

        // Normalize and merge
        const activities = [
            ...recentLeads.map(l => ({
                id: l.id,
                type: 'LEAD',
                title: `Nuevo lead: ${l.name}`,
                desc: `Estado: ${l.status}`,
                date: l.createdAt
            })),
            ...recentDeals.map(d => ({
                id: d.id,
                type: 'DEAL',
                title: `Deal actualizado: ${d.title}`,
                desc: `Etapa: ${d.stage} - $${d.value}`,
                date: d.updatedAt
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);

        return activities;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getTopDeals() {
    try {
        const deals = await prisma.deal.findMany({
            where: {
                stage: { notIn: ["WON", "LOST"] }
            },
            orderBy: { value: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                value: true,
                stage: true,
                probability: true,
                expectedClose: true
            }
        });
        return deals;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getHighPerformanceStats() {
    const authCheck = await checkAuth();
    if (authCheck) return { error: "Unauthorized" };

    try {
        const today = new Date();
        const thirtyDaysAgo = subDays(today, 30);
        const lastMonthStart = startOfMonth(subDays(today, 30));
        const lastMonthEnd = endOfMonth(subDays(today, 30));

        // 1. Basic Stats (Reuse logic)
        const [wonDealsCount, lostDealsCount] = await Promise.all([
            // prisma.deal.aggregate({
            //     _sum: { value: true },
            //     where: { stage: { notIn: ["WON", "LOST"] } }
            // }),
            prisma.deal.count({ where: { stage: "WON" } }),
            prisma.deal.count({ where: { stage: "LOST" } })
        ]);

        // 2. Revenue Forecast (Next 3 Months Weighted)
        const next3Months = [
            { start: startOfMonth(today), end: endOfMonth(today), name: format(today, 'MMM') },
            { start: startOfMonth(subDays(today, -30)), end: endOfMonth(subDays(today, -30)), name: format(subDays(today, -30), 'MMM') },
            { start: startOfMonth(subDays(today, -60)), end: endOfMonth(subDays(today, -60)), name: format(subDays(today, -60), 'MMM') },
        ];

        const forecastData = await Promise.all(next3Months.map(async month => {
            const deals = await prisma.deal.findMany({
                where: {
                    stage: { notIn: ["WON", "LOST"] },
                    expectedClose: { gte: month.start, lte: month.end }
                },
                select: { value: true, probability: true }
            });

            const weighted = deals.reduce((acc, d) => acc + (d.value * (d.probability / 100)), 0);
            const total = deals.reduce((acc, d) => acc + d.value, 0);

            return {
                name: month.name,
                weighted: Math.round(weighted),
                total: Math.round(total)
            };
        }));

        const forecastValue = forecastData.reduce((acc, d) => acc + d.weighted, 0);

        // 3. Lead Sources
        const leadSources = await prisma.lead.groupBy({
            by: ['source'],
            _count: { source: true },
            orderBy: { _count: { source: 'desc' } },
            take: 5
        });

        // 4. Lost Reason Breakdown
        const lostReasons = await prisma.deal.groupBy({
            by: ['lostReason'],
            where: { stage: "LOST", lostReason: { not: null } },
            _count: { lostReason: true },
            orderBy: { _count: { lostReason: 'desc' } }
        });

        // 5. Stagnant Deals
        const stagnantDealsCount = await prisma.deal.count({
            where: {
                stage: { notIn: ["WON", "LOST"] },
                updatedAt: { lt: thirtyDaysAgo }
            }
        });

        // 6. MoM Growth
        const currentPipeline = await prisma.deal.aggregate({
            _sum: { value: true },
            where: { createdAt: { gte: startOfMonth(today) } }
        });

        const lastMonthPipeline = await prisma.deal.aggregate({
            _sum: { value: true },
            where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } }
        });

        const currentVal = currentPipeline._sum.value || 0;
        const lastVal = lastMonthPipeline._sum.value || 0;
        const momGrowth = lastVal === 0 ? 100 : ((currentVal - lastVal) / lastVal) * 100;

        // 7. Deal Velocity
        const wonDeals = await prisma.deal.findMany({
            where: { stage: "WON" },
            select: { createdAt: true, updatedAt: true, value: true }
        });

        const totalDays = wonDeals.reduce((acc, deal) => {
            const diffTime = Math.abs(deal.updatedAt.getTime() - deal.createdAt.getTime());
            return acc + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }, 0);

        const avgDaysToClose = wonDeals.length > 0 ? Math.round(totalDays / wonDeals.length) : 0;

        // 8. Goal Progress (Hardcoded target $50k for now)
        const wonValue = wonDeals.reduce((acc, deal) => acc + deal.value, 0);
        const monthlyTarget = 50000;
        const goalProgress = (wonValue / monthlyTarget) * 100;

        // 9. Activity Intensity (New Model)
        const recentActivitiesCount = await (prisma as any).cRMActivity.count({
            where: { createdAt: { gte: subDays(today, 7) } }
        });

        // 10. Sales Leaderboard (Rank by won value)
        const leaderboard = await (prisma as any).user.findMany({
            where: {
                assignedDeals: {
                    some: { stage: "WON" }
                }
            },
            select: {
                name: true,
                assignedDeals: {
                    where: { stage: "WON" },
                    select: { value: true }
                }
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rankedLeaderboard = leaderboard.map((user: any) => ({
            name: user.name || "Unknown",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            wonValue: user.assignedDeals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })).sort((a: any, b: any) => b.wonValue - a.wonValue).slice(0, 5);

        return {
            forecastValue: Math.round(forecastValue),
            forecastData,
            leadSources: leadSources.map(ls => ({ name: ls.source, value: ls._count.source })),
            lostReasons: lostReasons.map(lr => ({ reason: lr.lostReason || "Other", count: lr._count.lostReason })),
            stagnantDealsCount,
            momGrowth: Math.round(momGrowth),
            avgDaysToClose,
            wonValue: Math.round(wonValue),
            monthlyTarget,
            goalProgress: Math.min(100, Math.round(goalProgress)),
            activityIntensity: recentActivitiesCount,
            winRate: (wonDealsCount + lostDealsCount > 0) ? Math.round((wonDealsCount / (wonDealsCount + lostDealsCount)) * 100) : 0,
            leaderboard: rankedLeaderboard
        };

    } catch (error) {
        console.error("Failed to fetch high performance stats:", error);
        return { error: "Failed to load high performance stats" };
    }
}

export async function updateDealStage(dealId: string, stage: string) {
    const authCheck = await checkAuth();
    if (authCheck) return { error: "Unauthorized" };

    try {
        await prisma.deal.update({
            where: { id: dealId },
            data: {
                stage,
                updatedAt: new Date()
            }
        });

        revalidatePath('/dashboard/admin/crm');
        return { success: true };
    } catch (error) {
        console.error("Failed to update deal stage:", error);
        return { error: "Failed to update deal" };
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateDeal(dealId: string, data: any) {
    const authCheck = await checkAuth();
    if (authCheck) return { error: "Unauthorized" };

    try {
        await prisma.deal.update({
            where: { id: dealId },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });

        revalidatePath('/dashboard/admin/crm');
        return { success: true };
    } catch (error) {
        console.error("Failed to update deal:", error);
        return { error: "Failed to update deal" };
    }
}

export async function deleteDeal(dealId: string) {
    const authCheck = await checkAuth();
    if (authCheck) return { error: "Unauthorized" };

    try {
        await prisma.deal.delete({
            where: { id: dealId }
        });

        revalidatePath('/dashboard/admin/crm');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete deal:", error);
        return { error: "Failed to delete deal" };
    }
}

export async function createTeam(name: string, companyId: string, parentId?: string) {
    const authCheck = await checkAuth();
    if (authCheck) return { error: "Unauthorized" };

    try {
        await (prisma as any).team.create({
            data: {
                name,
                companyId,
                parentId: parentId || null
            }
        });

        revalidatePath('/dashboard/admin/crm');
        return { success: true };
    } catch (error) {
        console.error("Failed to create team:", error);
        return { error: "Failed to create team" };
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createDeal(data: any) {
    const authCheck = await checkAuth();
    if (authCheck) return { error: "Unauthorized" };

    try {
        await prisma.deal.create({
            data: {
                title: data.title,
                value: data.value,
                stage: data.stage,
                priority: data.priority,
                contactName: data.contactName,
                contactEmail: data.contactEmail,
                companyId: data.companyId,
                // Add other fields if needed or spread data if safe
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        revalidatePath('/dashboard/admin/crm');
        return { success: true };
    } catch (error) {
        console.error("Failed to create deal:", error);
        return { error: "Failed to create deal" };
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createCustomObjectDefinition(data: any) {
    const authCheck = await checkAuth();
    if (authCheck) return { error: "Unauthorized" };

    try {
        await (prisma as any).customObjectDefinition.create({
            data: {
                name: data.name,
                apiName: data.apiName,
                description: data.description,
                companyId: data.companyId,
                // Add default fields or empty lists if schema requires
            }
        });

        revalidatePath('/dashboard/admin/crm');
        return { success: true };
    } catch (error) {
        console.error("Failed to create custom object definition:", error);
        return { error: "Failed to create object definition" };
    }
}
