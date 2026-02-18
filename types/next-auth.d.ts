import { UserRole } from "./auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            role: UserRole;
            permissions?: string[];
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: UserRole;
        permissions?: string[];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        role?: UserRole;
        permissions?: string[];
    }
}
