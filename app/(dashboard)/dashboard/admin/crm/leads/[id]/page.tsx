import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Building, Star, Activity, Clock } from "lucide-react";
import Link from "next/link";
import { LeadScoringService } from "@/lib/services/lead-scoring";

export default async function LeadProfilePage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.id) return redirect("/auth/login");

    // 1. Fetch Lead Data
    const lead = await db.lead.findUnique({
        where: { id: params.id },
        include: {
            marketingEvents: {
                orderBy: { createdAt: 'desc' }
            },
            conversations: {
                include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } }
            },
            campaign: true
        }
    });

    if (!lead) return <div>Lead not found</div>;

    // 2. Calculate Real-time Score
    const score = await LeadScoringService.calculateScore(lead.id);

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin/crm/leads">
                    <Button variant="ghost" size="icon"><ArrowLeft /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">{lead.name || "Unnamed Lead"}</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        {lead.email}
                        <Badge variant="outline">{lead.status}</Badge>
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground">AI Score</div>
                        <div className={`text-2xl font-bold ${score > 70 ? 'text-green-600' : (score > 40 ? 'text-orange-500' : 'text-gray-500')}`}>
                            {score}/100
                        </div>
                    </div>
                    <Button>Create Deal</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Contact Info</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="text-gray-400" size={18} />
                                <span>{lead.email}</span>
                            </div>
                            {lead.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="text-gray-400" size={18} />
                                    <span>{lead.phone}</span>
                                </div>
                            )}
                            {lead.company && (
                                <div className="flex items-center gap-3">
                                    <Building className="text-gray-400" size={18} />
                                    <span>{lead.company} {lead.jobTitle && `(${lead.jobTitle})`}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Attribution</CardTitle></CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Source</span>
                                <span className="font-medium">{lead.source}</span>
                            </div>
                            {lead.campaign && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Campaign</span>
                                    <Link href={`/dashboard/marketing/campaigns/${lead.campaign.id}`} className="text-blue-500 hover:underline">
                                        {lead.campaign.name}
                                    </Link>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Medium</span>
                                <span>{lead.medium || '-'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Activity Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Activity size={20} /> Activity Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8 relative pl-6 border-l-2 border-gray-100">
                                {lead.marketingEvents.map((event) => (
                                    <div key={event.id} className="relative">
                                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold text-sm">{event.eventType} {event.eventName && `- ${event.eventName}`}</span>
                                            <span className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</span>
                                            {event.url && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">{event.url}</span>}
                                        </div>
                                    </div>
                                ))}

                                {lead.conversations.map((conv) => (
                                    <div key={conv.id} className="relative">
                                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-green-500"></div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold text-sm">Conversation Started ({conv.channel})</span>
                                            <span className="text-xs text-muted-foreground">{new Date(conv.createdAt).toLocaleString()}</span>
                                            <div className="text-sm bg-gray-50 p-2 rounded italic text-gray-600">
                                                "{conv.lastMessagePreview}"
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-300"></div>
                                    <span className="font-medium text-sm text-gray-500">Lead Created</span>
                                    <div className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleString()}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
