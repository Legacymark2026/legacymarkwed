import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Settings, FileText, LogOut, Shield, BookOpen, Briefcase, BarChart2, Workflow, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

import Image from "next/image";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    return (
        <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-10">
                <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative h-8 w-[140px] transition-opacity hover:opacity-80">
                            <Image src="/logo.png" alt="LegacyMark" fill className="object-contain object-left" />
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Main
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <LayoutDashboard size={18} className="text-slate-400 group-hover:text-teal-500 transition-colors" /> Dashboard
                    </Link>
                    <Link href="/dashboard/inbox" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <MessageSquare size={18} className="text-slate-400 group-hover:text-teal-500 transition-colors" /> Inbox (Omnichannel)
                    </Link>

                    <div className="px-4 py-2 mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Management
                    </div>
                    <Link href="/dashboard/users" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <Users size={18} className="text-slate-400 group-hover:text-teal-500 transition-colors" /> Usuarios
                    </Link>
                    <Link href="/dashboard/experts" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <Users size={18} className="text-slate-400 group-hover:text-teal-500 transition-colors" /> Equipo (Expertos)
                    </Link>
                    <Link href="/dashboard/security" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <Shield size={18} className="text-slate-400 group-hover:text-teal-500 transition-colors" /> Seguridad
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <Settings size={18} className="text-slate-400 group-hover:text-teal-500 transition-colors" /> Configuración
                    </Link>

                    <div className="px-4 py-2 mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Content & Assets
                    </div>
                    <Link href="/dashboard/posts" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <BookOpen size={18} className="text-slate-400 group-hover:text-teal-500 transition-colors" /> Blog
                    </Link>
                    <Link href="/dashboard/projects" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <Briefcase size={18} className="text-slate-400 group-hover:text-teal-500 transition-colors" /> Portafolio
                    </Link>
                    <Link href="/dashboard/analytics" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <BarChart2 size={18} className="text-slate-400 group-hover:text-teal-500 transition-colors" /> Analítica
                    </Link>

                    {/* Marketing Hub */}
                    <div className="px-4 py-2 mt-6 text-[10px] font-bold text-teal-600 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                        Marketing Hub
                    </div>
                    <Link href="/dashboard/marketing" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <BarChart2 size={18} className="text-indigo-500 group-hover:text-indigo-600 transition-colors" /> CMO Dashboard
                    </Link>
                    <Link href="/dashboard/marketing/spend" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <BarChart2 size={18} className="text-green-500 group-hover:text-green-600 transition-colors" /> Ad Spend (ROI)
                    </Link>
                    <Link href="/dashboard/marketing/links" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <FileText size={18} className="text-blue-500 group-hover:text-blue-600 transition-colors" /> Link Tracker
                    </Link>
                    <Link href="/dashboard/admin/architecture" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <Settings size={18} className="text-slate-400 group-hover:text-teal-500 transition-colors" /> Organización
                    </Link>
                    <Link href="/dashboard/admin/automation" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <Workflow size={18} className="text-purple-500 group-hover:text-purple-600 transition-colors" /> Automatización
                    </Link>
                    <Link href="/dashboard/admin/crm/pipeline" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors group">
                        <Briefcase size={18} className="text-amber-500 group-hover:text-amber-600 transition-colors" /> Ventas (CRM)
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold border border-gray-300">
                            {session.user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{session.user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                        </div>
                    </div>
                    <form action={async () => {
                        "use server";
                        await signOut();
                    }}>
                        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200 hover:border-red-200 transition-all">
                            <LogOut size={16} className="mr-2" /> Cerrar Sesión
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:hidden">
                    <span className="font-bold text-slate-900">Dashboard</span>
                    {/* Mobile Toggle would go here */}
                </header>
                <main className="flex-1 p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
