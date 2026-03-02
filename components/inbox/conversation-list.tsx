'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Search, Filter, SlidersHorizontal, Plus, X, Send, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChannelIcon } from './channel-icon';
import { Badge } from '@/components/ui/badge';
import { ChannelType } from '@/types/inbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Users, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { syncMetaConversations } from '@/actions/inbox';

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
    tags?: any;
}

export function ConversationList({ conversations, currentUser }: { conversations: Conversation[], currentUser?: any }) {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const folderParam = searchParams.get('folder');
    const tagParam = searchParams.get('tag');
    const activeId = params?.conversationId;
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // all, mine, unassigned
    const [statusFilter, setStatusFilter] = useState<'OPEN' | 'CLOSED' | 'ALL'>('OPEN');
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const mockUserId = currentUser?.id; // Real user ID
    const [activeChannel, setActiveChannel] = useState<ChannelType | 'ALL'>('ALL'); // Channel Filter

    // Interactive Modal States
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        toast.info("Sincronizando mensajes de Meta...");
        const res = await syncMetaConversations();
        if (res.success) {
            toast.success(`Sincronización completa: ${(res as any).messagesSynced} mensajes nuevos.`);
            router.refresh();
        } else {
            toast.error("Error al sincronizar: " + ((res as any).error || "Revisa la conexión de Meta."));
        }
        setIsSyncing(false);
    };

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

        const matchesChannel = activeChannel === 'ALL' ? true : convo.channel === activeChannel;

        let matchesFolder = true;
        if (folderParam === 'unassigned') matchesFolder = !convo.assignedTo;
        if (folderParam === 'mine') matchesFolder = convo.assignedTo === mockUserId;
        if (folderParam === 'pending') matchesFolder = convo.status === 'OPEN';
        if (folderParam === 'resolved') matchesFolder = convo.status === 'CLOSED';

        let matchesTag = true;
        if (tagParam) matchesTag = (convo.tags as string[])?.includes(tagParam);

        return matchesSearch && matchesStatus && matchesTab && matchesChannel && matchesFolder && matchesTag;
    });

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex flex-col h-full bg-white w-full">
            {/* Header / Search */}
            <div className="p-4 border-b border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-xl text-gray-900 tracking-tight">Inbox</h2>
                    <div className="flex items-center gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={handleSync}
                            disabled={isSyncing}
                            title="Sincronizar Meta (Facebook/Instagram)"
                        >
                            <RefreshCw size={18} className={cn(isSyncing && "animate-spin")} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-900" onClick={() => setShowNewMessageModal(true)}>
                            <Plus size={20} />
                        </Button>
                    </div>
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

                {/* Channel Filters (Mini Icons) */}
                <div className="flex gap-1.5 justify-start overflow-x-auto py-1 scrollbar-hide">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveChannel('ALL')}
                        className={cn("h-7 px-2 text-[10px] rounded-full border", activeChannel === 'ALL' ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200")}
                    >
                        All
                    </Button>
                    {(['WHATSAPP', 'MESSENGER', 'INSTAGRAM'] as ChannelType[]).map(ch => (
                        <button
                            key={ch}
                            onClick={() => setActiveChannel(ch)}
                            className={cn(
                                "h-7 w-7 rounded-full flex items-center justify-center border transition-all",
                                activeChannel === ch
                                    ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
                                    : "bg-white border-gray-200 hover:bg-gray-50"
                            )}
                            title={ch}
                        >
                            <ChannelIcon channel={ch} className={cn("text-sm", activeChannel !== ch && "opacity-60 grayscale")} />
                        </button>
                    ))}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-9 bg-gray-100/80 p-1">
                        <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
                        <TabsTrigger value="mine" className="text-xs">Míos</TabsTrigger>
                        <TabsTrigger value="unassigned" className="text-xs">Sin Asignar</TabsTrigger>
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
                            {status === 'OPEN' ? 'ABIERTOS' : 'CERRADOS'}
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
                        <div className="flex gap-1 relative">
                            <Button size="sm" variant="ghost" className={cn("h-6 w-6 p-0 rounded", showAdvancedFilters ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white" : "hover:bg-blue-100 text-blue-600")} onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                                <Filter size={14} />
                            </Button>
                            {/* Advanced Filters Popover */}
                            {showAdvancedFilters && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20 animate-in zoom-in-95">
                                    <h4 className="font-semibold text-xs text-gray-900 mb-3">Advanced Bulk Filters</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Date Range</label>
                                            <select className="w-full text-xs p-1.5 border border-gray-200 rounded">
                                                <option>Last 7 Days</option>
                                                <option>Last 30 Days</option>
                                                <option>This Month</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Lead Tags</label>
                                            <select className="w-full text-xs p-1.5 border border-gray-200 rounded">
                                                <option>VIP</option>
                                                <option>Urgent</option>
                                                <option>Sales</option>
                                            </select>
                                        </div>
                                        <Button size="sm" className="w-full text-xs h-7 bg-blue-600" onClick={() => {
                                            toast.success('Filters applied to selection');
                                            setShowAdvancedFilters(false);
                                        }}>Apply Filters</Button>
                                    </div>
                                </div>
                            )}
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

            {/* New Message Composition Modal */}
            {showNewMessageModal && (
                <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Send size={16} className="text-blue-600" /> New Message</h3>
                            <button onClick={() => setShowNewMessageModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500">Channel</label>
                                <div className="flex gap-2">
                                    {['WHATSAPP', 'MESSENGER', 'INSTAGRAM'].map(ch => (
                                        <button key={ch} className="p-2 border rounded-lg hover:bg-gray-50 flex-1 flex justify-center items-center">
                                            <ChannelIcon channel={ch as any} className="text-xl" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500">Recipient (Lead Name or Phone)</label>
                                <input type="text" className="w-full border-gray-200 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Search contacts..." autoFocus />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500">First Message</label>
                                <textarea className="w-full border-gray-200 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500 min-h-[80px]" placeholder="Type your message here..." />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                <Button variant="ghost" onClick={() => setShowNewMessageModal(false)}>Cancel</Button>
                                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                                    toast.success('Message queued for sending');
                                    setShowNewMessageModal(false);
                                    router.refresh();
                                }}>Send Message</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
