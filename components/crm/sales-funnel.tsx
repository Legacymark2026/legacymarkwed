"use client";

import Link from "next/link";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CRM_TOOLTIP_STYLE, chartConfig, CRM_CHART_COLORS } from "@/lib/crm-charts-config";
import { ArrowUpRight } from "lucide-react";

interface FunnelProps {
    data: { name: string; value: number }[];
}

const COLORS = [
    CRM_CHART_COLORS.primary,
    CRM_CHART_COLORS.success,
    CRM_CHART_COLORS.accent,
    CRM_CHART_COLORS.secondary,
    CRM_CHART_COLORS.tertiary
];

export function SalesFunnel({ data }: FunnelProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="col-span-4 transition-all hover:shadow-md">
                <CardHeader>
                    <CardTitle>Embudo de Ventas</CardTitle>
                    <CardDescription>Sin datos de progresión de deals.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="col-span-4 transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Embudo de Ventas</CardTitle>
                    <CardDescription>Conversión por etapa del pipeline</CardDescription>
                </div>
                <Link href="/dashboard/admin/crm/pipeline" className="text-muted-foreground hover:text-primary transition-colors">
                    <ArrowUpRight className="h-5 w-5" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                {...chartConfig.yAxis}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={CRM_TOOLTIP_STYLE}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
