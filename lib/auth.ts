import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Facebook from "next-auth/providers/facebook";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";

const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    trustHost: true,
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account, profile }) {
            console.log('[AUTH] signIn callback triggered');
            console.log('[AUTH] Provider:', account?.provider);
            console.log('[AUTH] User email:', user?.email);

            // For OAuth providers, save the account to database
            if (account && account.provider !== 'credentials') {
                console.log('[AUTH] Processing OAuth provider:', account.provider);

                try {
                    // Check if user exists
                    let dbUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    });

                    // PROFESSIONAL FIX: Map known social email to admin account
                    // This prevents creating a duplicate user when the social email differs from the admin email
                    if (!dbUser && user.email === 'nestor.garcia1603@outlook.com') {
                        console.log('[AUTH] 🔄 Mapping Facebook email to Admin account...');
                        dbUser = await prisma.user.findUnique({
                            where: { email: 'administrador@legacymark.com' }
                        });
                        if (dbUser) {
                            console.log('[AUTH] ✅ Successfully mapped to:', dbUser.email);
                        }
                    }

                    console.log('[AUTH] Existing user found:', !!dbUser);

                    // Create user if doesn't exist
                    if (!dbUser) {
                        console.log('[AUTH] Creating new user...');
                        dbUser = await prisma.user.create({
                            data: {
                                email: user.email!,
                                name: user.name,
                                image: user.image,
                                role: 'CLIENT_USER',
                            }
                        });
                        console.log('[AUTH] User created:', dbUser.id);
                    }

                    // Check if account already exists
                    const existingAccount = await prisma.account.findUnique({
                        where: {
                            provider_providerAccountId: {
                                provider: account.provider,
                                providerAccountId: account.providerAccountId
                            }
                        }
                    });

                    console.log('[AUTH] Existing account found:', !!existingAccount);

                    // Create account if doesn't exist
                    if (!existingAccount) {
                        console.log('[AUTH] Creating new account...');
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
                            }
                        });
                        console.log('[AUTH] ✅ Account created successfully!');
                    } else {
                        console.log('[AUTH] ℹ️ Account already exists, skipping creation');
                    }
                } catch (error) {
                    console.error('[AUTH] ❌ Error saving OAuth account:', error);
                    return false;
                }
            }

            console.log('[AUTH] signIn callback completed successfully');
            return true;
        },
        async jwt({ token, user, account }) {
            // Initial sign in
            if (user) {
                console.log('[AUTH] JWT Callback - Initial Sign In');
                console.log('[AUTH] Original User ID:', user.id);

                try {
                    // 1. Priority: Check if this OAuth account is already linked to a user
                    if (account) {
                        const dbAccount = await prisma.account.findUnique({
                            where: {
                                provider_providerAccountId: {
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId
                                }
                            },
                            include: { user: true }
                        });

                        if (dbAccount && dbAccount.user) {
                            console.log('[AUTH] JWT: Found linked account for user:', dbAccount.user.email);
                            token.id = dbAccount.user.id;
                            token.role = dbAccount.user.role;
                            return token;
                        }
                    }

                    // 2. Fallback: Lookup by email
                    // Fetch the real user from DB to get the correct UUID
                    let dbUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    });

                    // Handle Alias (same logic as signIn)
                    if (!dbUser && user.email === 'nestor.garcia1603@outlook.com') {
                        dbUser = await prisma.user.findUnique({
                            where: { email: 'administrador@legacymark.com' }
                        });
                    }

                    if (dbUser) {
                        console.log('[AUTH] JWT: Setting token ID to DB User ID:', dbUser.id);
                        token.id = dbUser.id;
                        token.role = dbUser.role;
                        // token.permissions = dbUser.permissions;
                    } else {
                        console.log('[AUTH] JWT: User not found in DB, using OAuth ID');
                        token.id = user.id;
                        token.role = (user as any).role;
                    }
                } catch (error) {
                    console.error('[AUTH] JWT Error:', error);
                    token.id = user.id;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = (token.role as any);

                // CRITICAL VALIDATION: Ensure user exists in DB
                // This handles the "Phantom User" case (Self-Healing)
                if (token.id) {
                    try {
                        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
                        if (!dbUser) {
                            console.log('❌ Session Validation Failed: User not found in DB', token.id);
                            // Invalid session because user was deleted
                            return null as any;
                        }
                    } catch (e) {
                        console.error("Session validation error:", e);
                    }
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
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const parsedCredentials = signInSchema.safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    const user = await prisma.user.findUnique({
                        where: { email },
                        include: { companies: true }
                    });

                    if (!user || !user.passwordHash) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            role: user.role,
                        } as any;
                    }
                }

                console.log("Invalid credentials");
                return null;
            },
        }),
    ],
});
