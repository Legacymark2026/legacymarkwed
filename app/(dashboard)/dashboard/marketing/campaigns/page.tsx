import { getDripCampaigns, createDripCampaign } from "@/actions/marketing/campaigns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Plus, Mail, Users, BarChart3, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Temp: Direct DB access
const prisma = new PrismaClient();

export default async function CampaignsPage() {
    const session = await auth();
    if (!session?.user?.id) return redirect("/auth/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { companies: true }
    });
    const companyId = user?.companies[0]?.companyId;
    if (!companyId) return <div>No company found.</div>;

    const campaigns = await getDripCampaigns(companyId);

    async function handleCreate(formData: FormData) {
        'use server';
        const name = formData.get("name") as string;
        await createDripCampaign({ name, companyId: companyId! });
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Email Campaigns</h1>
                    <p className="text-muted-foreground">Manage drip sequences and newsletters.</p>
                </div>

                {/* Simple Creation Form Dialog Trigger replacement for MVP */}
                <form action={handleCreate} className="flex gap-2">
                    <input name="name" placeholder="New Campaign Name" className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                    <Button type="submit">
                        <Plus className="mr-2 h-4 w-4" /> Create Drip
                    </Button>
                </form>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.map(campaign => (
                    <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Mail size={16} className="text-blue-500" />
                                    {campaign.name}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {campaign.code}
                                </CardDescription>
                            </div>
                            <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {campaign.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{campaign._count.leads}</div>
                                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                        <Users size={12} /> Leads
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">0%</div>
                                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                        <BarChart3 size={12} /> Open Rate
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">0%</div>
                                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                        <Clock size={12} /> CTR
                                    </div>
                                </div>
                            </div>
                            <Link href={`/dashboard/marketing/campaigns/${campaign.id}`} className="w-full">
                                <Button className="w-full mt-4" variant="outline">
                                    Edit Sequence
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}

                {campaigns.length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                        No active email campaigns. Create one above!
                    </div>
                )}
            </div>
        </div>
    );
}
