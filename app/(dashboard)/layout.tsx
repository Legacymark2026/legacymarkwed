import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { UserRole } from "@/types/auth";
import { prisma } from "@/lib/prisma";
import { MobileSidebarWrapper } from "@/components/dashboard/MobileSidebarWrapper";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    let role = (session.user.role as UserRole) || UserRole.GUEST;

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    });

    if (dbUser?.role) {
        role = dbUser.role as UserRole;
    }

    if (role === UserRole.GUEST) {
        redirect("/dashboard/unauthorized");
    }

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans overflow-hidden"
            style={{ background: 'var(--ds-bg)', color: 'var(--ds-text-primary)' }}>

            {/* Sidebar */}
            <MobileSidebarWrapper
                sidebar={
                    <DashboardSidebar
                        role={role}
                        name={session.user.name}
                        email={session.user.email}
                        image={session.user.image}
                        userId={session.user.id}
                    />
                }
            />

            {/* Main Content — scrollable */}
            <main className="flex-1 overflow-auto relative w-full h-full"
                style={{ background: 'var(--ds-bg)' }}>
                <div className="max-w-[1440px] mx-auto px-6 py-6 md:px-10 md:py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
