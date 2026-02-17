'use client';

import { useState } from 'react';
import {
    User, MapPin, Mail, Phone, Tag, Clock,
    CreditCard, TrendingUp, AlertCircle, Plus, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { ChannelIcon } from './channel-icon';

export function RightSidebar({ conversation, leadDetails }: { conversation: any, leadDetails?: any }) {
    if (!conversation) return (
        <div className="w-80 border-l border-gray-200 h-full bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
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
        <div className="w-80 border-l border-gray-200 h-full bg-white flex flex-col overflow-y-auto">
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
                    <Button size="sm" variant="outline" className="h-8 rounded-full text-xs gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800">
                        <User size={12} />
                        Profile
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 rounded-full text-xs gap-1.5 border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800">
                        <CreditCard size={12} />
                        Deal
                    </Button>
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
