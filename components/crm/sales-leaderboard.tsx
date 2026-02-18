"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LeaderboardEntry {
    name: string;
    wonValue: number;
}

interface SalesLeaderboardProps {
    data: LeaderboardEntry[];
}

export function SalesLeaderboard({ data }: SalesLeaderboardProps) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    });

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Líderes de Ventas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {data.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay datos de ventas.</p>
                    ) : (
                        data.map((user, index) => (
                            <div key={user.name} className="flex items-center">
                                <span className="mr-4 text-sm font-bold text-muted-foreground w-4">
                                    {index + 1}
                                </span>
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {user.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">Top Sales Rep</p>
                                </div>
                                <div className="ml-auto font-medium">
                                    {formatter.format(user.wonValue)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
