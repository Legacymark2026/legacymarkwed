"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";
import { CRM_TOOLTIP_STYLE, CRM_CHART_COLORS } from "@/lib/crm-charts-config";
import { ArrowUpRight } from "lucide-react";

interface LeadSource {
    name: string;
    value: number;
}

interface LeadSourcesProps {
    data: LeadSource[];
}

const COLORS = [
    CRM_CHART_COLORS.primary,
    CRM_CHART_COLORS.secondary,
    CRM_CHART_COLORS.tertiary,
    CRM_CHART_COLORS.quaternary,
    CRM_CHART_COLORS.quinary
];

export function LeadSources({ data }: LeadSourcesProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Fuentes de Leads</CardTitle>
                    <CardDescription>Sin datos de leads registrados.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="col-span-3 transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Fuentes de Leads</CardTitle>
                    <CardDescription>Distribución por origen</CardDescription>
                </div>
                <Link href="/dashboard/admin/crm/leads" className="text-muted-foreground hover:text-primary transition-colors">
                    <ArrowUpRight className="h-5 w-5" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={CRM_TOOLTIP_STYLE} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
