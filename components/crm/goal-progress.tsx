"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GoalProgressProps {
    wonValue: number;
    monthlyTarget: number;
    progress: number;
}

export function GoalProgress({ wonValue, monthlyTarget, progress }: GoalProgressProps) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meta Mensual de Ventas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{progress}%</div>
                <Progress value={progress} className="mt-2" />
                <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                    <span>{formatter.format(wonValue)} ganados</span>
                    <span>Objetivo: {formatter.format(monthlyTarget)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
