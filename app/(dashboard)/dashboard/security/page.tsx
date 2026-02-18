import { getSecurityLogs, getSecurityStats } from "@/actions/admin";
import { LogsFilter } from "./_components/logs-filter";
import { LogsTable } from "./_components/logs-table";
import { SecurityStats } from "./_components/security-stats";
import { SecurityPagination } from "./_components/security-pagination";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SecurityLogsPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams.page) || 1;
    const search = resolvedParams.search as string | undefined;
    const type = resolvedParams.type as string | undefined;

    const [logsResult, statsResult] = await Promise.all([
        getSecurityLogs({ page, limit: 15, search, type }),
        getSecurityStats()
    ]);

    if ('error' in logsResult) {
        return <div className="text-red-500">Error loading logs: {logsResult.error}</div>;
    }

    const { logs, pagination } = logsResult;
    const stats = 'error' in statsResult ? { totalEvents: 0, failedLogins: 0, uniqueUsers: 0 } : statsResult;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Seguridad y Auditoría</h1>
                    <p className="text-sm text-gray-500">Monitoreo de actividad, accesos y alertas del sistema.</p>
                </div>
            </div>

            <SecurityStats
                totalEvents={stats.totalEvents}
                failedLogins={stats.failedLogins}
                uniqueUsers={stats.uniqueUsers}
            />

            <div className="space-y-4">
                <LogsFilter />
                <LogsTable logs={logs} />
                <SecurityPagination
                    currentPage={page}
                    totalPages={pagination?.pages || 1}
                />
            </div>
        </div>
    );
}
