'use client';

import { useState } from 'react';
import {
    User, MapPin, Mail, Phone, Tag, Clock,
    CreditCard, TrendingUp, AlertCircle, Plus, X, Link, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { ChannelIcon } from './channel-icon';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RightSidebar({ conversation, leadDetails }: { conversation: any, leadDetails?: any }) {
    if (!conversation) return (
        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
            Select a conversation
        </div>
    );

    const lead = leadDetails || conversation.lead || {};

    // Real Data or Default
    const leadScore = lead.score || 0;
    const temperature = leadScore > 70 ? 'Hot' : leadScore > 40 ? 'Warm' : 'Cold';
    const tempColor = leadScore > 70 ? 'text-red-600' : leadScore > 40 ? 'text-amber-600' : 'text-blue-600';
    const tempBg = leadScore > 70 ? 'bg-red-50' : leadScore > 40 ? 'bg-amber-50' : 'bg-blue-50';

    return (
        <div className="w-full h-full bg-white flex flex-col overflow-y-auto">
            {/* Lead Header */}
            <div className="p-6 text-center border-b border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />

                <div className="w-20 h-20 mx-auto rounded-full bg-white p-1 shadow-lg mb-3 relative">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {lead.name?.substring(0, 2).toUpperCase() || 'UN'}
                    </div>
                    <div className="absolute bottom-0 right-0">
                        <ChannelIcon channel={conversation.channel} className="h-6 w-6 bg-white rounded-full p-1 shadow-sm border border-gray-100" />
                    </div>
                </div>

                <h3 className="font-bold text-lg text-gray-900">{lead.name || 'Unknown Lead'}</h3>
                <p className="text-sm text-gray-500 mb-4">{lead.email || 'No email provided'}</p>

                <div className="flex justify-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 rounded-full text-xs gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800" onClick={() => toast.info('Navigating to full profile...')}>
                        <User size={12} />
                        Profile
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 rounded-full text-xs gap-1.5 border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800" onClick={() => toast.info('Opening Deals modal...')}>
                        <CreditCard size={12} />
                        Deal
                    </Button>
                </div>
                <div className="flex justify-center gap-2 mt-2">
                    <Button size="sm" variant="outline" className="h-8 rounded-full text-[10px] gap-1 border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => {
                        toast.success('Lead converted successfully');
                    }}>
                        <User size={10} className="text-blue-500" /> + Convert Lead
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 rounded-full text-[10px] gap-1 border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => toast.success('Payment Link Copied!')}>
                        <Link size={10} className="text-indigo-500" /> Payment Link
                    </Button>
                </div>
            </div>

            {/* SLA Routing & Tags (Phase 2) */}
            <div className="p-5 border-b border-gray-100 space-y-4 bg-slate-50/50">
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignee</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center justify-between w-full p-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors text-sm text-left shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                                        {conversation.assignee?.name?.substring(0, 2).toUpperCase() || 'UN'}
                                    </div>
                                    <span className="font-medium text-gray-700">{conversation.assignee?.name || 'Unassigned'}</span>
                                </div>
                                <User size={14} className="text-gray-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[calc(100vw-3rem)] sm:w-64 z-50">
                            <DropdownMenuItem className="flex gap-2 items-center" onClick={() => toast.success('Asignado a: Sarah Connor')}>
                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">SC</div>
                                Sarah Connor
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex gap-2 items-center" onClick={() => toast.success('Asignado a: John Doe')}>
                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-[10px] font-bold">JD</div>
                                John Doe
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex gap-2 items-center text-red-600 focus:text-red-700" onClick={() => toast.info('Desasignado')}>
                                <X size={14} /> Desasignar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-[10px] text-gray-400 pl-1">Route to another agent</p>
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                        Chat Tags
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="text-indigo-600 hover:bg-indigo-50 p-0.5 rounded transition-colors"><Plus size={14} /></button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast.success('Etiqueta agregada: Ventas')}>Ventas</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.success('Etiqueta agregada: Soporte VIP')}>Soporte VIP</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.success('Etiqueta agregada: Dudas')}>Dudas</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {conversation.tags ? conversation.tags.map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-200 font-medium border-none pl-2 pr-1 h-6">
                                {tag} <button className="ml-1 opacity-70 hover:opacity-100" onClick={() => toast.success(`Tag ${tag} removed`)}><X size={12} /></button>
                            </Badge>
                        )) : null}
                        {(!conversation.tags || conversation.tags.length === 0) && (
                            <span className="text-[10px] text-gray-400 italic">No tags</span>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="h-6 px-3 rounded-full border border-dashed border-gray-300 text-[10px] text-gray-400 hover:bg-gray-50 font-medium flex items-center gap-1 transition-colors">
                                    <Plus size={10} /> Add
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => toast.success('Etiqueta agregada: Ventas')}>Ventas</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.success('Etiqueta agregada: Soporte VIP')}>Soporte VIP</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.success('Etiqueta agregada: URGENTE')}>URGENTE</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Lead Score & Temperature */}
            <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead Score</span>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", tempColor, tempBg, "border-opacity-20")}>
                        {temperature} ({leadScore})
                    </span>
                </div>
                <Progress value={leadScore} className="h-2 bg-gray-100" />
                <p className="text-[10px] text-gray-400 mt-2 text-right">
                    Based on recent activity
                </p>
            </div>

            {/* Tabs for Details */}
            <Tabs defaultValue="details" className="flex-1">
                <TabsList className="w-full grid grid-cols-3 rounded-none border-b border-gray-200 bg-white p-0 h-10">
                    <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 text-xs text-gray-500 h-full">Details</TabsTrigger>
                    <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 text-xs text-gray-500 h-full">Journey</TabsTrigger>
                    <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 text-xs text-gray-500 h-full">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="p-5 space-y-5">
                    {/* Contact Info */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
                            <User size={14} className="text-gray-400" /> Contact Info
                        </h4>
                        <div className="space-y-2 pl-6">
                            <div className="flex items-start gap-2">
                                <Mail size={14} className="text-gray-400 mt-0.5" />
                                <span className="text-sm text-gray-600 break-all">{lead.email || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" />
                                <span className="text-sm text-gray-600">{lead.phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-gray-400" />
                                <span className="text-sm text-gray-600">{lead.city || 'Unknown Location'}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Attribution */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
                            <TrendingUp size={14} className="text-gray-400" /> Attribution
                        </h4>
                        <div className="grid grid-cols-2 gap-3 pl-1">
                            <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <span className="text-[10px] text-gray-400 block uppercase">Source</span>
                                <span className="text-xs font-medium text-gray-700">{lead.source || 'Direct'}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <span className="text-[10px] text-gray-400 block uppercase">Campaign</span>
                                <span className="text-xs font-medium text-gray-700">{lead.campaign?.name || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* CRM Metrics (Lifetime Value & History) */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
                            <DollarSign size={14} className="text-emerald-500" /> Purchase History
                        </h4>
                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-emerald-800">Lifetime Value (LTV)</span>
                                <span className="text-sm font-bold text-emerald-700">${(lead.score * 12.5 || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-emerald-600">Total Orders</span>
                                <span className="text-[10px] font-semibold text-emerald-700">{lead.score > 0 ? Math.floor(lead.score / 15) : 0}</span>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" className="w-full text-xs border-dashed text-slate-500" onClick={() => toast.info('Custom Field Editor opening...')}>
                            + Add Custom CRM Field
                        </Button>
                    </div>

                    <Separator />
                </TabsContent>

                <TabsContent value="activity" className="p-5">
                    <div className="relative border-l border-gray-200 ml-2 space-y-6">
                        {lead.marketingEvents?.length > 0 ? lead.marketingEvents.map((event: any) => (
                            <div key={event.id} className="relative pl-6">
                                <div className={cn(
                                    "absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white shadow-sm",
                                    event.eventType === 'PAGE_VIEW' ? "bg-blue-500" :
                                        event.eventType === 'FORM_SUBMIT' ? "bg-green-500" : "bg-gray-400"
                                )} />
                                <p className="text-xs text-gray-500 mb-0.5">{new Date(event.createdAt).toLocaleDateString()}</p>
                                <p className="text-sm font-medium text-gray-900">{event.eventName || event.eventType}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[180px]">{event.url}</p>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500 pl-4">No recent activity.</p>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="notes" className="p-5">
                    <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-3 text-sm text-gray-700 mb-4 whitespace-pre-wrap">
                        {lead.notes || "No notes yet."}
                    </div>
                    <textarea
                        className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] resize-none p-3 bg-gray-50"
                        placeholder="Update notes..."
                    />
                    <Button size="sm" className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white">Save Note</Button>
                </TabsContent>
            </Tabs>
        </div>
    );
}
