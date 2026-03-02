"use client";

import { useState } from 'react';
import {
    MessageSquare, Inbox, Send, Archive, Trash2,
    MoreVertical, Search, Filter, Phone, Video, Info, Menu,
    Hash, Star, Clock, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InboxCommandMenu } from "@/components/inbox/inbox-command-menu";

interface InboxLayoutProps {
    children: React.ReactNode;
    conversationList: React.ReactNode;
    leadProfile?: React.ReactNode; // Optional 4th panel or right-side info
}

export function InboxLayout({ children, conversationList, leadProfile }: InboxLayoutProps) {
    const [isFoldersOpen, setIsFoldersOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(true);

    return (
        <TooltipProvider>
            <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-white border-t border-slate-200">

                {/* Panel 1: Folders & Filters (Left) */}
                <div className={cn(
                    "hidden md:flex flex-col border-r border-slate-200 bg-slate-50/50 transition-all duration-300",
                    isFoldersOpen ? "w-64" : "w-16 items-center"
                )}>
                    <div className={cn("p-4 flex items-center border-b border-slate-200 h-16", isFoldersOpen ? "justify-between" : "justify-center")}>
                        {isFoldersOpen && <h2 className="font-bold text-slate-800 tracking-tight">Bandeja</h2>}
                        <Button variant="ghost" size="icon" onClick={() => setIsFoldersOpen(!isFoldersOpen)} className="text-slate-500 hover:bg-slate-200 rounded-xl">
                            <Menu size={20} />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-hide">
                        {/* Status Folders */}
                        <div className="space-y-1 px-3">
                            {isFoldersOpen && <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Vistas</p>}
                            <NavItem icon={Inbox} label="Sin Asignar" count={12} active isOpen={isFoldersOpen} badgeColor="bg-blue-100 text-blue-700" />
                            <NavItem icon={MessageSquare} label="Mis Chats" count={5} isOpen={isFoldersOpen} />
                            <NavItem icon={Clock} label="Pendientes" count={3} isOpen={isFoldersOpen} badgeColor="bg-amber-100 text-amber-700" />
                            <NavItem icon={CheckCircle2} label="Resueltos" isOpen={isFoldersOpen} />
                        </div>

                        {/* Tags */}
                        <div className="space-y-1 px-3">
                            {isFoldersOpen && <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Etiquetas</p>}
                            <NavItem icon={Hash} iconColor="text-rose-500" label="Soporte VIP" count={2} isOpen={isFoldersOpen} />
                            <NavItem icon={Hash} iconColor="text-emerald-500" label="Ventas" count={8} isOpen={isFoldersOpen} />
                            <NavItem icon={Hash} iconColor="text-violet-500" label="Dudas" isOpen={isFoldersOpen} />
                        </div>

                        {/* Other */}
                        <div className="space-y-1 px-3">
                            {isFoldersOpen && <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Otros</p>}
                            <NavItem icon={Star} label="Destacados" isOpen={isFoldersOpen} />
                            <NavItem icon={Archive} label="Archivados" isOpen={isFoldersOpen} />
                            <NavItem icon={AlertCircle} label="Spam" isOpen={isFoldersOpen} />
                        </div>
                    </div>

                    {/* User Mini Profile / Settings at bottom */}
                    {isFoldersOpen && (
                        <div className="p-4 border-t border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                    AG
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">Agente Ventas</p>
                                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                        En línea
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Panel 2: Conversation List (Center) */}
                <div className="hidden md:flex w-80 lg:w-96 border-r border-slate-200 flex-col bg-white overflow-hidden">
                    {conversationList}
                </div>

                {/* Panel 3: Main Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] relative">
                    {/* Mobile Flow (Drawer Header inside Main Area) */}
                    <div className="md:hidden flex items-center p-3 border-b border-slate-200 bg-white sticky top-0 z-10">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2">
                                    <Menu size={20} />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-[320px] sm:w-[360px]">
                                <div className="h-full flex flex-col">
                                    <div className="p-4 border-b border-slate-200">
                                        <h2 className="font-bold text-lg">Inbox</h2>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        {conversationList}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <span className="font-semibold text-slate-900">Inbox</span>
                    </div>

                    {children}
                </div>

                {/* Optional Panel 4: Lead Profile (Right) */}
                {leadProfile && (
                    <div className={cn(
                        "hidden xl:flex border-l border-slate-200 flex-col bg-white transition-all duration-300",
                        isProfileOpen ? "w-80" : "w-0 opacity-0 overflow-hidden border-none"
                    )}>
                        {leadProfile}
                    </div>
                )}
                <InboxCommandMenu />
            </div>
        </TooltipProvider>
    );
}

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    count?: number;
    active?: boolean;
    isOpen?: boolean;
    badgeColor?: string;
    iconColor?: string;
}

function NavItem({ icon: Icon, label, count, active, isOpen, badgeColor, iconColor }: NavItemProps) {
    if (!isOpen) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn(
                        "rounded-xl w-10 h-10 mb-2 relative",
                        active ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                        iconColor
                    )}>
                        <Icon size={20} />
                        {count && (
                            <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-semibold">
                    {label} {count && `(${count})`}
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <button className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors group",
            active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}>
            <div className="flex items-center gap-3">
                <Icon size={18} className={cn(active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600", iconColor)} />
                <span className="truncate">{label}</span>
            </div>
            {count && (
                <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold group-hover:bg-opacity-80 transition-opacity",
                    badgeColor || (active ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700")
                )}>
                    {count}
                </span>
            )}
        </button>
    );
}
