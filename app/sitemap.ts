import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getRecentPosts } from "@/lib/data"; // Assuming this exists from previous context

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = await getRecentPosts(100); // Fetch all posts for sitemap

    const routes = [
        "",
        "/servicios",
        "/soluciones/automatizacion",
        "/soluciones/web-dev",
        "/portfolio",
        "/metodologia",
        "/blog",
        "/contacto",
        "/nosotros",
        "/privacy",
        "/terms",
    ].map((route) => ({
        url: `${siteConfig.url}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    const blogRoutes = posts.map((post) => ({
        url: `${siteConfig.url}/blog/${post.slug}`,
        lastModified: new Date().toISOString(), // In real app, use post.updatedAt
        changeFrequency: "monthly" as const,
        priority: 0.6,
    }));

    return [...routes, ...blogRoutes];
}
