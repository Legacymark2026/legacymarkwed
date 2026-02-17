'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    MessageSquare, Inbox, Send, Archive, Trash2,
    MoreVertical, Search, Filter, Phone, Video, Info, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from '@/lib/utils'; // Assuming utils exists

interface InboxLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}

export function InboxLayout({ children, sidebar }: InboxLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-white border-t border-gray-200">
            {/* Sidebar (Folders/Filters) - Desktop Only */}
            <div className="hidden md:flex w-16 flex-col items-center py-4 border-r border-gray-200 bg-gray-50/50 space-y-4">
                <Button variant="ghost" size="icon" className="rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200">
                    <Inbox size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl text-gray-500 hover:bg-gray-200">
                    <MessageSquare size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl text-gray-500 hover:bg-gray-200">
                    <Send size={20} />
                </Button>
                <div className="flex-1" />
                <Button variant="ghost" size="icon" className="rounded-xl text-gray-500 hover:bg-gray-200">
                    <Archive size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl text-gray-500 hover:bg-gray-200">
                    <Trash2 size={20} />
                </Button>
            </div>

            {/* Conversation List - Desktop */}
            <div className={cn(
                "hidden md:flex w-80 border-r border-gray-200 flex-col bg-white transition-all duration-300",
                !isSidebarOpen && "w-0 opacity-0 overflow-hidden"
            )}>
                <div className="p-4 border-b border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg">Messages</h2>
                        <Button variant="ghost" size="icon">
                            <MoreVertical size={16} />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search messages..."
                            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                        />
                    </div>
                    <div className="flex gap-2 text-xs font-medium text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded-md text-black cursor-pointer">All</span>
                        <span className="px-2 py-1 hover:bg-gray-100 rounded-md cursor-pointer">Unread</span>
                        <span className="px-2 py-1 hover:bg-gray-100 rounded-md cursor-pointer">Groups</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {sidebar}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center p-3 border-b border-gray-100 bg-white">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="mr-2">
                                <Menu size={20} />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-[320px] sm:w-[360px]">
                            <div className="h-full flex flex-col">
                                <div className="p-4 border-b border-gray-100">
                                    <h2 className="font-bold text-lg">Inbox</h2>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {sidebar}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <span className="font-semibold text-gray-900">Inbox</span>
                </div>

                {children}
            </div>
        </div>
    );
}
