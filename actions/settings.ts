'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsSchema, type SettingsFormData } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function getSettings() {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { profile: true }
        });

        if (!user) return null;

        // Parse preferences from JSON, ensuring type safety
        let preferences = { theme: "system", notifications: { email: true } };
        if (user.profile?.preferences) {
            try {
                const prefs = typeof user.profile.preferences === 'string'
                    ? JSON.parse(user.profile.preferences)
                    : user.profile.preferences;

                if (prefs) {
                    preferences = { ...preferences, ...prefs };
                }
            } catch { }
        }

        // Parse social links
        let socialLinks = { linkedin: "", github: "" };
        if (user.profile?.socialLinks) {
            try {
                const links = typeof user.profile.socialLinks === 'string'
                    ? JSON.parse(user.profile.socialLinks)
                    : user.profile.socialLinks;
                if (links) {
                    socialLinks = { ...socialLinks, ...links };
                }
            } catch { }
        }

        // Parse GA config
        let gaConfig: { propertyId?: string; clientEmail?: string; privateKey?: string } = {};
        if (user.profile && 'googleAnalytics' in user.profile) {
            try {
                // @ts-ignore: Prisma JSON types can be tricky if client not regenerated
                const ga = user.profile.googleAnalytics;
                const parsedGa = typeof ga === 'string' ? JSON.parse(ga) : ga;
                if (parsedGa) {
                    gaConfig = { ...gaConfig, ...parsedGa };
                }
            } catch { }
        }

        return {
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            phone: user.phone || "",
            jobTitle: user.profile?.jobTitle || "",
            bio: user.profile?.bio || "",
            linkedin: socialLinks.linkedin || "",
            github: socialLinks.github || "",
            theme: (["light", "dark", "system"].includes(preferences.theme) ? preferences.theme : "system") as "light" | "dark" | "system",
            emailNotifications: preferences.notifications?.email ?? true,
            gaPropertyId: gaConfig.propertyId || "",
            gaClientEmail: gaConfig.clientEmail || "",
            gaPrivateKey: gaConfig.privateKey || "",
            fbPixelId: (() => {
                if (user.profile && 'facebookPixel' in user.profile) {
                    try {
                        // @ts-ignore
                        const fb = user.profile.facebookPixel;
                        const p = typeof fb === 'string' ? JSON.parse(fb) : fb;
                        return p?.pixelId || "";
                    } catch { }
                }
                return "";
            })(),
            gtmId: (() => {
                if (user.profile && 'googleTagManager' in user.profile) {
                    try {
                        // @ts-ignore
                        const gtm = user.profile.googleTagManager;
                        const p = typeof gtm === 'string' ? JSON.parse(gtm) : gtm;
                        return p?.containerId || "";
                    } catch { }
                }
                return "";
            })(),
            hotjarId: (() => {
                if (user.profile && 'hotjar' in user.profile) {
                    try {
                        // @ts-ignore
                        const hj = user.profile.hotjar;
                        const p = typeof hj === 'string' ? JSON.parse(hj) : hj;
                        return p?.siteId || "";
                    } catch { }
                }
                return "";
            })(),
        };
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return null;
    }
}

export async function updateSettings(data: SettingsFormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = SettingsSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: "Invalid data" };
    }

    const {
        firstName, lastName, phone,
        jobTitle, bio,
        linkedin, github,
        theme, emailNotifications
    } = validated.data;

    try {
        // Update User basic info
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                firstName,
                lastName,
                phone,
            }
        });

        // Upsert User Profile
        await prisma.userProfile.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                jobTitle,
                bio,
                socialLinks: { linkedin, github },
                preferences: { theme, notifications: { email: emailNotifications } }
            },
            update: {
                jobTitle,
                bio,
                socialLinks: { linkedin, github },
                preferences: { theme, notifications: { email: emailNotifications } }
            }
        });

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        console.error("Failed to update settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}

export async function updateIntegrations(data: { gaPropertyId?: string; gaClientEmail?: string; gaPrivateKey?: string; fbPixelId?: string; gtmId?: string; hotjarId?: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        await prisma.userProfile.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                googleAnalytics: {
                    propertyId: data.gaPropertyId,
                    clientEmail: data.gaClientEmail,
                    privateKey: data.gaPrivateKey
                },
                facebookPixel: {
                    pixelId: data.fbPixelId
                },
                googleTagManager: {
                    containerId: data.gtmId
                },
                hotjar: {
                    siteId: data.hotjarId
                }
            },
            update: {
                googleAnalytics: {
                    propertyId: data.gaPropertyId,
                    clientEmail: data.gaClientEmail,
                    privateKey: data.gaPrivateKey
                },
                facebookPixel: {
                    pixelId: data.fbPixelId
                },
                googleTagManager: {
                    containerId: data.gtmId
                },
                hotjar: {
                    siteId: data.hotjarId
                }
            }
        });

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        console.error("Failed to update integrations:", error);
        return { success: false, error: "Failed to update integrations" };
    }
}

export async function getPublicIntegrations() {
    try {
        // Fetch the first user profile (assumes single tenant / admin is first)
        const profile = await prisma.userProfile.findFirst({
            where: {
                OR: [
                    { facebookPixel: { not: Prisma.DbNull } },
                    { googleTagManager: { not: Prisma.DbNull } },
                    { hotjar: { not: Prisma.DbNull } }
                ]
            }
        });

        if (profile) {
            let fbPixelId = "";
            let gtmId = "";
            let hotjarId = "";

            if (profile.facebookPixel) {
                try {
                    // @ts-ignore
                    const fb = profile.facebookPixel;
                    const p = typeof fb === 'string' ? JSON.parse(fb) : fb;
                    fbPixelId = p?.pixelId || "";
                } catch { }
            }

            if (profile.googleTagManager) {
                try {
                    // @ts-ignore
                    const gtm = profile.googleTagManager;
                    const p = typeof gtm === 'string' ? JSON.parse(gtm) : gtm;
                    gtmId = p?.containerId || "";
                } catch { }
            }

            if (profile.hotjar) {
                try {
                    // @ts-ignore
                    const hj = profile.hotjar;
                    const p = typeof hj === 'string' ? JSON.parse(hj) : hj;
                    hotjarId = p?.siteId || "";
                } catch { }
            }

            return { fbPixelId, gtmId, hotjarId };
        }
        return { fbPixelId: "", gtmId: "", hotjarId: "" };
    } catch (error) {
        console.error(error);
        // Fallback
        return { fbPixelId: "", gtmId: "", hotjarId: "" };
    }
}
