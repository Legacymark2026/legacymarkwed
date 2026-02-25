import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Facebook from "next-auth/providers/facebook";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import type { UserRole, Permission } from "@/types/auth";
import { logger } from "@/lib/logger";

const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

/**
 * C-2 Fix: Email alias resuelto desde variables de entorno.
 * Nunca hardcodear emails en el código fuente.
 */
function resolveAdminAlias(email: string | null | undefined): string | null {
    const alias = process.env.ADMIN_OAUTH_EMAIL_ALIAS;
    const canonical = process.env.ADMIN_CANONICAL_EMAIL;
    if (alias && canonical && email === alias) return canonical;
    return null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    trustHost: true,
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account }) {
            logger.auth("signIn callback triggered");
            logger.auth("Provider:", account?.provider);

            // Para providers OAuth, guardar el account en BD
            if (account && account.provider !== "credentials") {
                logger.auth("Processing OAuth provider:", account.provider);

                try {
                    // Buscar usuario existente
                    let dbUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                    });

                    // C-2: Resolver alias desde env vars (no hardcodeado)
                    if (!dbUser) {
                        const aliasEmail = resolveAdminAlias(user.email);
                        if (aliasEmail) {
                            logger.auth("Resolving admin alias to canonical email...");
                            dbUser = await prisma.user.findUnique({
                                where: { email: aliasEmail },
                            });
                        }
                    }

                    // Crear usuario si no existe
                    if (!dbUser) {
                        logger.auth("Creating new user...");
                        dbUser = await prisma.user.create({
                            data: {
                                email: user.email!,
                                name: user.name,
                                image: user.image,
                                role: "CLIENT_USER",
                            },
                        });
                        logger.auth("User created:", dbUser.id);
                    }

                    // Verificar si la cuenta OAuth ya existe
                    const existingAccount = await prisma.account.findUnique({
                        where: {
                            provider_providerAccountId: {
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                            },
                        },
                    });

                    if (!existingAccount) {
                        await prisma.account.create({
                            data: {
                                userId: dbUser.id,
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                refresh_token: account.refresh_token,
                                access_token: account.access_token,
                                expires_at: account.expires_at,
                                token_type: account.token_type,
                                scope: account.scope,
                                id_token: account.id_token,
                            },
                        });
                        logger.auth("OAuth account linked successfully.");
                    } else {
                        logger.auth("Account already linked, skipping.");
                    }
                } catch (error) {
                    logger.error("Error saving OAuth account:", error);
                    return false;
                }
            }

            return true;
        },

        async jwt({ token, user, account }) {
            // Solo en el sign-in inicial (cuando `user` está presente)
            if (user) {
                logger.auth("JWT Callback — Initial sign-in, resolving DB user...");

                try {
                    // 1. Prioridad: Buscar por account OAuth vinculado
                    if (account) {
                        const dbAccount = await prisma.account.findUnique({
                            where: {
                                provider_providerAccountId: {
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                },
                            },
                            include: { user: true },
                        });

                        if (dbAccount?.user) {
                            logger.auth("JWT: Resolved via linked OAuth account →", dbAccount.user.email);
                            // B-2: Cargar companyId y permissions desde CompanyUser
                            const userWithMeta = await prisma.user.findUnique({
                                where: { id: dbAccount.user.id },
                                select: {
                                    id: true,
                                    role: true,
                                    companies: {
                                        select: { companyId: true, permissions: true },
                                        take: 1
                                    }
                                }
                            });
                            token.id = dbAccount.user.id;
                            token.role = dbAccount.user.role;
                            token.companyId = userWithMeta?.companies[0]?.companyId ?? null;
                            token.permissions = ((userWithMeta?.companies[0]?.permissions ?? []) as string[]) as Permission[];
                            return token;
                        }
                    }

                    // 2. Fallback: Buscar por email
                    let dbUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                    });

                    // C-2: Resolver alias desde env var
                    if (!dbUser) {
                        const aliasEmail = resolveAdminAlias(user.email);
                        if (aliasEmail) {
                            dbUser = await prisma.user.findUnique({
                                where: { email: aliasEmail },
                            });
                        }
                    }

                    if (dbUser) {
                        // B-2: Cargar companyId y permissions desde CompanyUser
                        const userWithMeta = await prisma.user.findUnique({
                            where: { id: dbUser.id },
                            select: {
                                id: true,
                                role: true,
                                companies: {
                                    select: { companyId: true, permissions: true },
                                    take: 1
                                }
                            }
                        });
                        token.id = dbUser.id;
                        token.role = dbUser.role;
                        token.companyId = userWithMeta?.companies[0]?.companyId ?? null;
                        token.permissions = ((userWithMeta?.companies[0]?.permissions ?? []) as string[]) as Permission[];
                    } else {
                        logger.auth("JWT: User not found in DB, using OAuth ID as fallback.");
                        token.id = user.id;
                        token.role = (user as { role?: string }).role;
                    }
                } catch (error) {
                    logger.error("JWT callback error:", error);
                    token.id = user.id;
                }
            }

            return token;
        },

        /**
         * C-3 Fix: Session callback sin query a BD por request.
         * B-2 Fix: companyId y permissions propagados desde JWT → sesión.
         */
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
                // B-2: Exponer companyId y permissions en la sesión del cliente
                if (token.companyId) {
                    session.user.companyId = token.companyId as string;
                }
                if (token.permissions) {
                    session.user.permissions = token.permissions as Permission[];
                }
            }
            return session;
        },
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        LinkedIn({
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        }),
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: "public_profile email pages_show_list pages_read_engagement pages_manage_metadata pages_messaging ads_read leads_retrieval instagram_basic instagram_manage_messages",
                },
            },
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsedCredentials = signInSchema.safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    const user = await prisma.user.findUnique({
                        where: { email },
                        include: { companies: true },
                    });

                    if (!user || !user.passwordHash) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            role: user.role as UserRole,
                        };
                    }
                }

                logger.warn("Invalid credentials attempt.");
                return null;
            },
        }),
    ],
});
