import { auth } from "@/lib/auth";
import { AnalyticsOverview } from "@/modules/analytics/components/overview";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
    const session = await auth();
    const user = session?.user;

    // Fetch recent activity
    const activityLogs: any[] = user?.id ? await prisma.userActivityLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
    }) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user?.name}</h1>
                    <p className="text-sm text-gray-500">Aquí tienes un resumen de tu actividad reciente.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium capitalize">
                    {user?.role || 'Guest'}
                </span>
            </div>

            {/* Analytics Overview Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Resumen de Rendimiento</h2>
                <AnalyticsOverview />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h2>
                <div className="space-y-4">
                    {activityLogs.length > 0 ? (
                        activityLogs.map((log) => (
                            <div key={log.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 hover:bg-slate-50 rounded-lg px-2 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                    <span className="text-blue-600 text-xs font-bold">
                                        {(log.action || 'LOG')[0]}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{log.action}</p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {/* @ts-ignore: JSON handling in JSX */}
                                        {log.details ? JSON.stringify(log.details) : 'Sin detalles'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-400 whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No hay actividad reciente registrada.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
