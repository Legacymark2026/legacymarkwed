import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { UserRole } from "@/types/auth";

import { MobileSidebarWrapper } from "@/components/dashboard/MobileSidebarWrapper";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const role = (session.user.role as UserRole) || UserRole.GUEST;

    // Invitados sin rol asignado → redirigir a página de acceso denegado
    if (role === UserRole.GUEST) {
        redirect("/dashboard/unauthorized");
    }

    return (
        <div className="h-screen flex flex-col md:flex-row font-sans selection:bg-teal-500 selection:text-white overflow-hidden">
            {/* Sidebar dinámico envuelto para responsiveness */}
            <MobileSidebarWrapper
                sidebar={
                    <DashboardSidebar
                        role={role}
                        name={session.user.name}
                        email={session.user.email}
                        image={session.user.image}
                    />
                }
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8 relative">
                <div className="max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
