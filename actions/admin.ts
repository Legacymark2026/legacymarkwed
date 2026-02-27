"use server";

import { prisma } from "@/lib/prisma";
import { UserRole } from "@/types/auth";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Verifica acceso de admin y retorna la sesión
async function checkAdmin(): Promise<{ error: string } | null> {
    const session = await auth();
    const userRole = (session?.user as { role?: string })?.role;

    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
        return { error: "No autorizado. Se requiere rol de Administrador o SuperAdmin." };
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
                phone: true,
                jobTitle: true,
                adminNotes: true,
                customTag: true,
                createdAt: true,
                deactivatedAt: true,
                mfaEnabled: true,
                emailVerified: true, // For visual check
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

export async function updateUserMeta(
    userId: string,
    data: { phone?: string; jobTitle?: string; adminNotes?: string; customTag?: string }
) {
    const authCheck = await checkAdmin();
    if (authCheck) return { success: false, error: authCheck.error };

    try {
        const updated = await prisma.user.update({
            where: { id: userId },
            data,
        });
        revalidatePath("/dashboard/users");
        return { success: true, user: updated };
    } catch (error) {
        console.error("Failed to update user meta:", error);
        return { success: false, error: "Failed to update user notes" };
    }
}

export async function forcePasswordReset(userId: string) {
    const authCheck = await checkAdmin();
    if (authCheck) return { success: false, error: authCheck.error };

    try {
        await prisma.passwordResetToken.create({
            data: {
                token: `admin-forced-${Math.random().toString(36).substring(7)}`,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
                email: (await prisma.user.findUnique({ where: { id: userId } }))?.email || ""
            }
        });

        await prisma.userActivityLog.create({
            data: {
                userId,
                action: "ADMIN_FORCED_PASSWORD_RESET",
                ipAddress: "System",
                userAgent: "Admin Dashboard",
            }
        });

        return { success: true, message: "Enlace de reseteo enviado" };
    } catch (error) {
        console.error("Failed to force reset:", error);
        return { success: false, error: "Error forzando reseteo" };
    }
}

export async function revokeAllSessions(userId: string) {
    const authCheck = await checkAdmin();
    if (authCheck) return { success: false, error: authCheck.error };

    try {
        await prisma.session.deleteMany({
            where: { userId }
        });
        return { success: true, message: "Todas las sesiones revocadas" };
    } catch (error) {
        console.error("Failed to revoke sessions:", error);
        return { success: false, error: "Error revocando sesiones" };
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

export async function toggleUserStatus(userId: string) {
    const session = await auth();
    const currentUserId = session?.user?.id;
    const authCheck = await checkAdmin();
    if (authCheck) return { success: false, error: authCheck.error };

    if (currentUserId === userId) {
        return { success: false, error: "No puedes suspender tu propia cuenta." };
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, error: "Usuario no encontrado" };

        const newStatus = user.deactivatedAt ? null : new Date();

        await prisma.user.update({
            where: { id: userId },
            data: { deactivatedAt: newStatus },
        });

        revalidatePath("/dashboard/users");
        return { success: true, isDeactivated: !!newStatus };
    } catch (error) {
        console.error("Failed to toggle user status:", error);
        return { success: false, error: "Error al actualizar estado" };
    }
}

export async function bulkDeleteUsers(userIds: string[]) {
    const session = await auth();
    const currentUserId = session?.user?.id;
    const authCheck = await checkAdmin();
    if (authCheck) return { success: false, error: authCheck.error };

    if (currentUserId && userIds.includes(currentUserId)) {
        return { success: false, error: "No puedes auto-eliminarte en una acción masiva." };
    }

    try {
        const res = await prisma.user.deleteMany({
            where: { id: { in: userIds } },
        });
        revalidatePath("/dashboard/users");
        return { success: true, count: res.count };
    } catch (error) {
        console.error("Failed to bulk delete users:", error);
        return { success: false, error: "Error al eliminar múltiples usuarios" };
    }
}

export async function bulkToggleUsersStatus(userIds: string[], deactivate: boolean) {
    const session = await auth();
    const currentUserId = session?.user?.id;
    const authCheck = await checkAdmin();
    if (authCheck) return { success: false, error: authCheck.error };

    const targetUserIds = userIds.filter(id => id !== currentUserId);

    if (targetUserIds.length === 0) {
        return { success: false, error: "Selección no válida o intentaste afectar tu propia cuenta." };
    }

    try {
        const res = await prisma.user.updateMany({
            where: { id: { in: targetUserIds } },
            data: { deactivatedAt: deactivate ? new Date() : null },
        });
        revalidatePath("/dashboard/users");
        return { success: true, count: res.count };
    } catch (error) {
        console.error("Failed to bulk toggle users:", error);
        return { success: false, error: "Error al actualizar múltiples usuarios" };
    }
}

export async function updateUserRole(
    userId: string,
    newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    const currentUserId = session?.user?.id;
    const authCheck = await checkAdmin();
    if (authCheck) return { success: false, error: authCheck.error };

    // Protección: un usuario no puede cambiarse su propio rol
    if (currentUserId === userId) {
        return { success: false, error: "No puedes cambiar tu propio rol." };
    }

    // Solo el SuperAdmin puede asignar el rol super_admin
    const callerRole = (session?.user as { role?: string })?.role;
    if (newRole === UserRole.SUPER_ADMIN && callerRole !== UserRole.SUPER_ADMIN) {
        return { success: false, error: "Solo el SuperAdmin puede asignar ese rol." };
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to update user role:", error);
        return { success: false, error: "Error al actualizar el rol. Inténtalo de nuevo." };
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
