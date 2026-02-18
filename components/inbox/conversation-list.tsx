'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Search, Filter, SlidersHorizontal, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChannelIcon } from './channel-icon';
import { Badge } from '@/components/ui/badge';
import { ChannelType } from '@/types/inbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Users, UserX } from 'lucide-react';

// Mock types for props - replace with actual types later
interface Conversation {
    id: string;
    channel: ChannelType;
    status: string;
    unreadCount: number;
    lastMessageAt: Date;
    lastMessagePreview: string;
    lead: {
        id: string;
        name: string;
        image?: string;
    } | null;
    assignedTo?: string | null;
}

export function ConversationList({ conversations }: { conversations: Conversation[] }) {
    const router = useRouter();
    const params = useParams();
    const activeId = params?.conversationId;
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // all, mine, unassigned
    const [statusFilter, setStatusFilter] = useState<'OPEN' | 'CLOSED' | 'ALL'>('OPEN');
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const mockUserId = "user-123"; // TODO: get from context

    // Real-time Polling (Phase 1 Improvement)
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [router]);

    // Filter logic
    const filteredConversations = conversations.filter(convo => {
        const matchesSearch = convo.lead?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            convo.lastMessagePreview?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' ? true : convo.status === statusFilter;

        let matchesTab = true;
        if (activeTab === 'mine') matchesTab = convo.assignedTo === mockUserId;
        if (activeTab === 'unassigned') matchesTab = !convo.assignedTo;

        return matchesSearch && matchesStatus && matchesTab;
    });

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 w-80 md:w-96">
            {/* Header / Search */}
            <div className="p-4 border-b border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-xl text-gray-900 tracking-tight">Inbox</h2>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                        <Plus size={20} />
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search messages..."
                        className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all h-9 text-sm rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Tabs */}
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-9 bg-gray-100/80 p-1">
                        <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                        <TabsTrigger value="mine" className="text-xs">Mine</TabsTrigger>
                        <TabsTrigger value="unassigned" className="text-xs">Unassigned</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Status Tabs (Mini) */}
                <div className="flex gap-1">
                    {['OPEN', 'CLOSED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as any)}
                            className={cn(
                                "text-[10px] font-medium px-2 py-1 rounded-md transition-all border",
                                statusFilter === status
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                    <div className="flex-1"></div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSelectionMode(!selectionMode);
                            setSelectedIds([]);
                        }}
                        className={cn("h-6 text-[10px] px-2", selectionMode ? "bg-blue-50 text-blue-600" : "text-gray-400")}
                    >
                        {selectionMode ? 'Cancel' : 'Select'}
                    </Button>
                </div>

                {/* Bulk Actions Bar */}
                {selectionMode && selectedIds.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 flex items-center justify-between animate-in slide-in-from-top-2">
                        <span className="text-xs font-semibold text-blue-700 ml-1">{selectedIds.length} selected</span>
                        <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-blue-100 rounded text-blue-600">
                                <Filter size={14} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 p-8 text-center mt-10">
                        <Filter size={32} className="mb-3 opacity-20" />
                        <p className="text-sm font-medium">No results found</p>
                        <p className="text-xs mt-1">Try adjusting filters or search</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredConversations.map((convo) => {
                            const isActive = activeId === convo.id;

                            return (
                                <Link
                                    key={convo.id}
                                    href={`/dashboard/inbox/${convo.id}`}
                                    className={cn(
                                        "block p-4 hover:bg-gray-50 transition-all cursor-pointer relative group",
                                        isActive && "bg-blue-50/60 hover:bg-blue-50/80"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                                    )}

                                    <div className="flex items-start gap-3">
                                        {/* Selection Checkbox */}
                                        {selectionMode && (
                                            <div className="pt-3" onClick={(e) => { e.preventDefault(); toggleSelection(convo.id); }}>
                                                <Checkbox checked={selectedIds.includes(convo.id)} />
                                            </div>
                                        )}
                                        {/* Avatar & Icon */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-white border border-gray-100 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm">
                                                {convo.lead?.name?.substring(0, 2).toUpperCase() || 'UN'}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 ring-2 ring-white">
                                                <ChannelIcon channel={convo.channel} className="text-[10px]" />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h3 className={cn(
                                                    "truncate text-sm text-gray-900",
                                                    (convo.unreadCount > 0 || isActive) ? "font-semibold" : "font-medium"
                                                )}>
                                                    {convo.lead?.name || 'Unknown Lead'}
                                                </h3>
                                                <span className={cn(
                                                    "text-[10px] whitespace-nowrap ml-2",
                                                    convo.unreadCount > 0 ? "text-blue-600 font-medium" : "text-gray-400"
                                                )}>
                                                    {formatDistanceToNow(new Date(convo.lastMessageAt), { addSuffix: false })}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <p className={cn(
                                                    "text-xs truncate pr-2 max-w-[180px]",
                                                    convo.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500"
                                                )}>
                                                    {convo.lastMessagePreview || 'Started a conversation'}
                                                </p>

                                                {convo.unreadCount > 0 && (
                                                    <Badge variant="default" className="h-5 min-w-[20px] px-1.5 flex items-center justify-center bg-blue-600 hover:bg-blue-700">
                                                        {convo.unreadCount}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
