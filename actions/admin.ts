"use server";

import { prisma } from "@/lib/prisma";
import { UserRole } from "@/types/auth";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Verify admin access
async function checkAdmin() {
    const session = await auth();
    // Cast user to any to avoid lint errors until types are perfectly aligned, or use ExtendedUser if available
    const userRole = (session?.user as any)?.role;

    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
        return { error: "Unauthorized" };
    }
    return null;
}

export async function getUsers() {
    const authCheck = await checkAdmin();
    if (authCheck) return authCheck;

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { sessions: true }
                }
            }
        });
        return { users };
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return { error: "Failed to fetch users" };
    }
}

export async function deleteUser(userId: string) {
    const authCheck = await checkAdmin();
    if (authCheck) return authCheck;

    try {
        await prisma.user.delete({
            where: { id: userId },
        });
        revalidatePath("/dashboard/users");
        return { success: "User deleted" };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { error: "Failed to delete user" };
    }
}

export async function updateUserRole(userId: string, newRole: UserRole) {
    const authCheck = await checkAdmin();
    if (authCheck) return authCheck;

    try {
        // Prevent changing own role if critical/implementation detail
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        });
        revalidatePath("/dashboard/users");
        return { success: "User role updated" };
    } catch (error) {
        console.error("Failed to update user role", error);
        return { error: "Failed to update role" };
    }
}

export async function getSecurityLogs({
    page = 1,
    limit = 20,
    search,
    type
}: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
} = {}) {
    const authCheck = await checkAdmin();
    if (authCheck) return authCheck;

    try {
        const skip = (page - 1) * limit;
        const where: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ = {};

        if (search) {
            where.OR = [
                { user: { name: { contains: search, mode: "insensitive" } } },
                { user: { email: { contains: search, mode: "insensitive" } } },
                { action: { contains: search, mode: "insensitive" } },
                { ipAddress: { contains: search, mode: "insensitive" } },
            ];
        }

        if (type && type !== "all") {
            if (type === "login") {
                where.action = { contains: "LOGIN", mode: "insensitive" };
            } else if (type === "error") {
                where.OR = [
                    { action: { contains: "ERROR", mode: "insensitive" } },
                    { action: { contains: "FAIL", mode: "insensitive" } }
                ];
            }
        }

        const [logs, total] = await Promise.all([
            prisma.userActivityLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                },
                skip,
                take: limit
            }),
            prisma.userActivityLog.count({ where })
        ]);

        return {
            logs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        };
    } catch (error) {
        console.error("Failed to fetch security logs:", error);
        return { error: "Failed to fetch logs" };
    }
}

export async function getSecurityStats() {
    const authCheck = await checkAdmin();
    if (authCheck) return { totalEvents: 0, failedLogins: 0, uniqueUsers: 0 };

    try {
        const [totalEvents, failedLogins, uniqueUsersGroup] = await Promise.all([
            prisma.userActivityLog.count(),
            prisma.userActivityLog.count({
                where: {
                    OR: [
                        { action: { contains: "ERROR", mode: "insensitive" } },
                        { action: { contains: "FAIL", mode: "insensitive" } }
                    ]
                }
            }),
            prisma.userActivityLog.groupBy({
                by: ['userId'],
            })
        ]);

        return {
            totalEvents,
            failedLogins,
            uniqueUsers: uniqueUsersGroup.length
        };
    } catch (error) {
        console.error("Failed to fetch stats:", error);
        return { totalEvents: 0, failedLogins: 0, uniqueUsers: 0 };
    }
}
