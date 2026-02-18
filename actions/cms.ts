'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';

import { PostSchema, ProjectSchema, PostFormData, ProjectFormData } from '@/lib/schemas';

// --- Post Actions ---

export async function getPosts() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    return prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            author: { select: { name: true, email: true } },
            categories: true,
            tags: true
        }
    });
}

export async function getPost(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    return prisma.post.findUnique({
        where: { id },
        include: {
            categories: true,
            tags: true
        }
    });
}

export async function createPost(data: PostFormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = PostSchema.parse(data);
    const { categoryIds, tagNames, scheduledDate, ...postData } = validated;

    try {
        // Process tags: find existing or create new
        const tagConnections = tagNames?.length ? {
            connectOrCreate: tagNames.map(name => ({
                where: { name },
                create: { name }
            }))
        } : undefined;

        // Process categories
        const categoryConnections = categoryIds?.length ? {
            connect: categoryIds.map(id => ({ id }))
        } : undefined;

        await prisma.post.create({
            data: {
                title: postData.title,
                slug: postData.slug,
                excerpt: postData.excerpt,
                content: postData.content,
                coverImage: postData.coverImage,
                imageAlt: postData.imageAlt,
                published: postData.published,
                metaTitle: postData.metaTitle,
                metaDescription: postData.metaDescription,
                status: postData.status,
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
                authorId: session.user.id,
                tags: tagConnections,
                categories: categoryConnections,
            }
        });
        revalidatePath('/dashboard/posts');
        return { success: true };
    } catch (error) {
        console.error("Failed to create post:", error);
        return { success: false, error: "Failed to create post. Slug might be taken." };
    }
}

export async function updatePost(id: string, data: PostFormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const validated = PostSchema.parse(data);
    const { categoryIds, tagNames, scheduledDate, ...postData } = validated;

    try {
        // Get current post to manage relationships
        const currentPost = await prisma.post.findUnique({
            where: { id },
            include: { tags: true, categories: true }
        });

        if (!currentPost) {
            return { success: false, error: "Post not found" };
        }

        // Process tags
        const tagConnections = tagNames?.length ? {
            set: [], // Disconnect all first
            connectOrCreate: tagNames.map(name => ({
                where: { name },
                create: { name }
            }))
        } : { set: [] };

        // Process categories
        const categoryConnections = categoryIds?.length ? {
            set: categoryIds.map(id => ({ id }))
        } : { set: [] };

        await prisma.post.update({
            where: { id },
            data: {
                title: postData.title,
                slug: postData.slug,
                excerpt: postData.excerpt,
                content: postData.content,
                coverImage: postData.coverImage,
                imageAlt: postData.imageAlt,
                published: postData.published,
                metaTitle: postData.metaTitle,
                metaDescription: postData.metaDescription,
                status: postData.status,
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
                tags: tagConnections,
                categories: categoryConnections,
            }
        });
        revalidatePath('/dashboard/posts');
        revalidatePath(`/blog/${postData.slug}`); // Update public page
        return { success: true };
    } catch (error) {
        console.error("Failed to update post:", error);
        return { success: false, error: "Failed to update post" };
    }
}

export async function deletePost(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    try {
        await prisma.post.delete({ where: { id } });
        revalidatePath('/dashboard/posts');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to delete post" };
    }
}

// --- Category Actions ---

export async function getCategories() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    return prisma.category.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function getTags() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    return prisma.tag.findMany({
        orderBy: { name: 'asc' },
        select: { name: true }
    });
}

// --- Project Actions ---

export async function getProjects() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    return prisma.project.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function getProject(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    return prisma.project.findUnique({ where: { id } });
}

export async function createProject(data: ProjectFormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const validated = ProjectSchema.parse(data);

    try {
        await prisma.project.create({ data: validated });
        revalidatePath('/dashboard/projects');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to create project" };
    }
}

export async function updateProject(id: string, data: ProjectFormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const validated = ProjectSchema.parse(data);

    try {
        await prisma.project.update({
            where: { id },
            data: validated
        });
        revalidatePath('/dashboard/projects');
        // revalidatePath(`/portfolio/${validated.slug}`); 
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to update project" };
    }
}

export async function deleteProject(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    try {
        await prisma.project.delete({ where: { id } });
        revalidatePath('/dashboard/projects');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to delete project" };
    }
}
