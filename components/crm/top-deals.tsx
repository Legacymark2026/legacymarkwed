"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CRM_CURRENCY_FORMATTER } from "@/lib/crm-charts-config";
import { ArrowUpRight } from "lucide-react";

interface Deal {
    id: string;
    title: string;
    value: number;
    stage: string;
    probability: number;
}

interface TopDealsProps {
    deals: Deal[];
}

export function TopDeals({ deals }: TopDealsProps) {
    return (
        <Card className="col-span-4 transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Top Deals (Cierre Próximo)</CardTitle>
                    <CardDescription>Deals con mayor valor y probabilidad</CardDescription>
                </div>
                <Link href="/dashboard/admin/crm/pipeline" className="text-muted-foreground hover:text-primary transition-colors">
                    <ArrowUpRight className="h-5 w-5" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {deals.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay deals activos importantes.</p>
                    ) : (
                        deals.map((deal) => (
                            <div key={deal.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium text-sm">{deal.title}</p>
                                    <p className="text-xs text-muted-foreground">Probabilidad: {deal.probability}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">{CRM_CURRENCY_FORMATTER.format(deal.value)}</p>
                                    <Badge variant="outline" className="text-[10px] mt-1">{deal.stage}</Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
