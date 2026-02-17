"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function RecentAutomations({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Automations</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xs text-muted-foreground py-4 text-center">
                        No automations run yet.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Automations</CardTitle>
                <Zap className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4 pt-2">
                    {data.map((exec) => (
                        <div key={exec.id} className="flex items-center">
                            <div className="mr-3">
                                {exec.status === 'SUCCESS' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                {exec.status === 'FAILED' && <XCircle className="h-4 w-4 text-red-500" />}
                                {exec.status === 'PENDING' && <Clock className="h-4 w-4 text-blue-500 animate-pulse" />}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {exec.workflow?.name || "Unknown Workflow"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(exec.startedAt), { addSuffix: true })}
                                </p>
                            </div>
                            <div className="text-xs font-medium text-muted-foreground uppercase">
                                {exec.status}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
