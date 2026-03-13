"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type SocialPostPayload = {
    content: string;
    mediaUrls?: string[];
    platforms: string[];
    scheduledAt?: Date | null;
    status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED";
};

/**
 * Obtiene todos los posts sociales de una compañía para armar el calendario.
 */
export async function getSocialPosts(companyId: string) {
    try {
        const posts = await prisma.socialPost.findMany({
            where: { companyId },
            include: {
                author: { select: { name: true, image: true, email: true } }
            },
            orderBy: { scheduledAt: 'asc' }
        });
        return { success: true, data: posts };
    } catch (error) {
        console.error("Error fetching social posts:", error);
        return { success: false, error: "Error al obtener las publicaciones." };
    }
}

/**
 * Crea un nuevo post social.
 */
export async function createSocialPost(companyId: string, authorId: string, payload: SocialPostPayload) {
    try {
        const post = await prisma.socialPost.create({
            data: {
                companyId,
                authorId,
                content: payload.content,
                mediaUrls: payload.mediaUrls || [],
                platforms: payload.platforms,
                scheduledAt: payload.scheduledAt,
                status: payload.status,
            }
        });
        revalidatePath('/dashboard/marketing/calendar');
        return { success: true, data: post };
    } catch (error) {
        console.error("Error creating social post:", error);
        return { success: false, error: "Error al crear la publicación." };
    }
}

/**
 * Actualiza un post social (por ejemplo, al hacer Drag & Drop en el calendario para cambiar la fecha).
 */
export async function updateSocialPost(postId: string, payload: Partial<SocialPostPayload>) {
    try {
        const post = await prisma.socialPost.update({
            where: { id: postId },
            data: {
                content: payload.content,
                mediaUrls: payload.mediaUrls,
                platforms: payload.platforms,
                scheduledAt: payload.scheduledAt,
                status: payload.status,
                // Si pasa a publicado, registramos la fecha.
                publishedAt: payload.status === "PUBLISHED" ? new Date() : undefined
            }
        });
        revalidatePath('/dashboard/marketing/calendar');
        return { success: true, data: post };
    } catch (error) {
        console.error("Error updating social post:", error);
        return { success: false, error: "Error al actualizar la publicación." };
    }
}

/**
 * Elimina un post del calendario.
 */
export async function deleteSocialPost(postId: string) {
    try {
        await prisma.socialPost.delete({ where: { id: postId } });
        revalidatePath('/dashboard/marketing/calendar');
        return { success: true };
    } catch (error) {
        console.error("Error deleting social post:", error);
        return { success: false, error: "Error al eliminar la publicación." };
    }
}
