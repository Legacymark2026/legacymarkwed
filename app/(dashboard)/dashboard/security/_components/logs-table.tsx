import { Shield, AlertTriangle, Info, Clock, Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Log {
    id: string;
    action: string;
    user?: {
        name: string | null;
        email: string | null;
    } | null;
    ipAddress: string | null;
    details: any;
    createdAt: Date;
}

export function LogsTable({ logs }: { logs: Log[] }) {
    if (!logs || logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                <Shield className="h-12 w-12 text-gray-300 mb-3" />
                <p>No se encontraron registros de actividad.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableHead>Evento</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Detalles / IP</TableHead>
                        <TableHead>Fecha</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map((log) => {
                        const isError =
                            log.action.toLowerCase().includes("error") ||
                            log.action.toLowerCase().includes("fail");

                        return (
                            <TableRow key={log.id} className="hover:bg-gray-50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-2 rounded-full ${isError
                                                    ? "bg-red-100 text-red-600"
                                                    : "bg-blue-100 text-blue-600"
                                                }`}
                                        >
                                            {isError ? (
                                                <AlertTriangle size={16} />
                                            ) : (
                                                <Info size={16} />
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-900">
                                            {log.action}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">
                                            {log.user?.name || "Sistema / Anónimo"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {log.user?.email}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded w-fit">
                                            <Monitor size={12} />
                                            {log.ipAddress || "N/A"}
                                        </div>
                                        {/* Simplified details view */}
                                        {log.details && Object.keys(log.details).length > 0 && (
                                            <span className="text-xs text-gray-400 truncate max-w-[200px]" title={JSON.stringify(log.details)}>
                                                {JSON.stringify(log.details)}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Clock size={14} />
                                        {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
