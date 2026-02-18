'use server';

import { db } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";

export async function getMarketingKPIs(companyId: string) {
    noStore();

    // 1. Total Leads (This Month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
        totalLeads,
        newLeads,
        totalSpend,
        marketingEvents
    ] = await Promise.all([
        db.lead.count({ where: { companyId } }),
        db.lead.count({
            where: {
                companyId,
                createdAt: { gte: startOfMonth }
            }
        }),
        db.adSpend.aggregate({
            where: {
                companyId,
                date: { gte: startOfMonth }
            },
            _sum: { amount: true }
        }),
        db.marketingEvent.count({
            where: {
                companyId,
                createdAt: { gte: startOfMonth }
            }
        })
    ]);

    // Calculate Cost Per Lead (CPL)
    const spend = totalSpend._sum.amount || 0;
    const cpl = newLeads > 0 ? spend / newLeads : 0;

    return {
        totalLeads,
        newLeads,
        spend,
        cpl,
        totalEvents: marketingEvents
    };
}

export async function getAttributionStats(companyId: string) {
    noStore();

    // Group leads by Source
    const leadsBySource = await db.lead.groupBy({
        by: ['source'],
        where: { companyId },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
    });

    return leadsBySource.map(item => ({
        source: item.source,
        count: item._count.id
    }));
}

export async function getRecentActivity(companyId: string) {
    noStore();

    return await db.marketingEvent.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
            lead: {
                select: { name: true, email: true }
            }
        }
    });
}

export async function trackMarketingEvent(data: {
    eventType: string;
    eventName?: string;
    url?: string;
    visitorId?: string;
    userId?: string;
    companyId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any;
}) {
    try {
        await db.marketingEvent.create({
            data: {
                eventType: data.eventType,
                eventName: data.eventName,
                url: data.url,
                visitorId: data.visitorId,
                userId: data.userId,
                companyId: data.companyId,
                properties: data.metadata || {}
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to track event:", error);
        return { success: false };
    }
}
