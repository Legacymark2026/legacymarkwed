import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Activity {
    id: string;
    type: string;
    title: string;
    desc: string;
    date: Date;
}

interface ActivityProps {
    activities: Activity[];
}

export function RecentActivity({ activities }: ActivityProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {activities.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay actividad reciente.</p>
                    ) : (
                        activities.map((activity) => (
                            <div key={`${activity.type}-${activity.id}`} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className={activity.type === 'DEAL' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                                        {activity.type === 'DEAL' ? 'DL' : 'LD'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                                    <p className="text-sm text-muted-foreground">{activity.desc}</p>
                                </div>
                                <div className="ml-auto font-medium text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: es })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
