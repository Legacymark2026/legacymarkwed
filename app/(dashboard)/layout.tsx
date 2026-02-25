import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { UserRole } from "@/types/auth";

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
        <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
            {/* Sidebar dinámico — filtrado por rol */}
            <DashboardSidebar
                role={role}
                name={session.user.name}
                email={session.user.email}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:hidden">
                    <span className="font-bold text-slate-900">Dashboard</span>
                </header>
                <main className="flex-1 p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
