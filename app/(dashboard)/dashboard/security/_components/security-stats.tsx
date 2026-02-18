import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, Activity, Users } from "lucide-react";

interface SecurityStatsProps {
    totalEvents: number;
    failedLogins: number; // or errors
    uniqueUsers: number;
}

export function SecurityStats({
    totalEvents,
    failedLogins,
    uniqueUsers
}: SecurityStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Eventos
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalEvents}</div>
                    <p className="text-xs text-muted-foreground">
                        Registrados en el sistema
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Logins Fallidos / Errores
                    </CardTitle>
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{failedLogins}</div>
                    <p className="text-xs text-muted-foreground">
                        Eventos de seguridad crítica
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Usuarios Activos
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{uniqueUsers}</div>
                    <p className="text-xs text-muted-foreground">
                        Interactuando con el sistema
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
