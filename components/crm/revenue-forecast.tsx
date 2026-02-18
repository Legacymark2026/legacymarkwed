"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { CRM_CURRENCY_FORMATTER, CRM_TOOLTIP_STYLE, chartConfig, CRM_CHART_COLORS } from "@/lib/crm-charts-config";
import { ArrowUpRight } from "lucide-react";

interface ForecastData {
    name: string;
    weighted: number;
    total: number;
}

interface RevenueForecastProps {
    data: ForecastData[];
}

export function RevenueForecast({ data }: RevenueForecastProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Forecast de Ingresos</CardTitle>
                    <CardDescription>No hay suficientes datos para generar proyecciones.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="col-span-4 transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Forecast de Ingresos</CardTitle>
                    <CardDescription>Próximos 3 meses (Weighted vs Total)</CardDescription>
                </div>
                <Link href="/dashboard/admin/crm/pipeline" className="text-muted-foreground hover:text-primary transition-colors">
                    <ArrowUpRight className="h-5 w-5" />
                </Link>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                {...chartConfig.xAxis}
                            />
                            <YAxis
                                {...chartConfig.yAxis}
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <Tooltip
                                formatter={(value: any) => CRM_CURRENCY_FORMATTER.format(Number(value))}
                                contentStyle={CRM_TOOLTIP_STYLE}
                            />
                            <Legend />
                            <Bar
                                dataKey="weighted"
                                name="Probable (Weighted)"
                                fill={CRM_CHART_COLORS.primary}
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                            <Bar
                                dataKey="total"
                                name="Máximo Potencial"
                                fill={CRM_CHART_COLORS.quaternary}
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
