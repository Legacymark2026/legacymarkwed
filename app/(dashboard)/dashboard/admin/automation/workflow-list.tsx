"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
    Edit, Trash2, Plus, MoreHorizontal, Power, PowerOff,
    Search, LayoutGrid, List as ListIcon, Copy, AlertCircle,
    TrendingUp, Activity, CheckCircle2, XCircle, Play, Pause, CopyPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { deleteWorkflow, toggleWorkflow, bulkDeleteWorkflows, bulkToggleWorkflows } from "@/actions/automation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// --- TYPES ---
interface Workflow {
    id: string;
    name: string;
    triggerType: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: { executions: number };
}

interface Analytics {
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
    recentActivity: { status: string; _count: number }[];
    topWorkflows: Workflow[];
}

interface Execution {
    id: string;
    status: string;
    startedAt: Date;
    workflow: { name: string; id: string };
}

interface Props {
    initialWorkflows: Workflow[];
    analytics: Analytics;
    recentExecutions: Execution[];
}

export default function WorkflowListClient({ initialWorkflows, analytics, recentExecutions }: Props) {
    const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // --- FILTERING & SEARCH ---
    const filteredWorkflows = useMemo(() => {
        if (!searchQuery) return workflows;
        const q = searchQuery.toLowerCase();
        return workflows.filter(w =>
            w.name.toLowerCase().includes(q) ||
            w.id.toLowerCase().includes(q) ||
            w.triggerType.toLowerCase().includes(q)
        );
    }, [workflows, searchQuery]);

    // --- BULK SELECTION ---
    const toggleSelectAll = () => {
        if (selectedIds.size === filteredWorkflows.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredWorkflows.map(w => w.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    // --- ACTIONS ---
    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este flujo de trabajo definitivamente?")) return;
        setIsLoading(id);
        const result = await deleteWorkflow(id);
        if (result.success) {
            setWorkflows(prev => prev.filter(w => w.id !== id));
            selectedIds.delete(id);
            setSelectedIds(new Set(selectedIds));
            toast.success("Flujo eliminado");
        } else {
            toast.error("Error al eliminar");
        }
        setIsLoading(null);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        setIsLoading(id);
        const result = await toggleWorkflow(id, !currentStatus);
        if (result.success) {
            setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isActive: !currentStatus } : w));
            toast.success(currentStatus ? "Flujo pausado" : "Flujo activado");
        } else {
            toast.error("Error al cambiar estado");
        }
        setIsLoading(null);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`¿Eliminar ${selectedIds.size} flujo(s) definitivamente?`)) return;

        setIsLoading("bulk");
        const idsArray = Array.from(selectedIds);
        const result = await bulkDeleteWorkflows(idsArray);
        if (result.success) {
            setWorkflows(prev => prev.filter(w => !selectedIds.has(w.id)));
            setSelectedIds(new Set());
            toast.success(`${idsArray.length} flujos eliminados`);
        } else {
            toast.error("Error en eliminación masiva");
        }
        setIsLoading(null);
    };

    const handleBulkToggle = async (activate: boolean) => {
        if (selectedIds.size === 0) return;
        setIsLoading("bulk");
        const idsArray = Array.from(selectedIds);
        const result = await bulkToggleWorkflows(idsArray, activate);
        if (result.success) {
            setWorkflows(prev => prev.map(w => selectedIds.has(w.id) ? { ...w, isActive: activate } : w));
            setSelectedIds(new Set()); // Clear selection or keep it, clearing is usually better
            toast.success(`${idsArray.length} flujos ${activate ? 'activados' : 'pausados'}`);
        } else {
            toast.error("Error en operación masiva");
        }
        setIsLoading(null);
    };

    const copyToClipboard = (text: string, message: string) => {
        navigator.clipboard.writeText(text);
        toast.info(message);
    };

    // --- BADGE HELPERS ---
    const getTriggerBadgeDetails = (type: string) => {
        if (type.includes("FORM")) return { label: "Formulario", color: "bg-purple-100 text-purple-800" };
        if (type.includes("DEAL") || type.includes("SCORE")) return { label: "CRM (Ventas)", color: "bg-blue-100 text-blue-800" };
        if (type.includes("SCHEDULE") || type.includes("TIME")) return { label: "Horario/Cron", color: "bg-orange-100 text-orange-800" };
        if (type.includes("WEBHOOK")) return { label: "Webhook/API", color: "bg-indigo-100 text-indigo-800" };
        return { label: type, color: "bg-gray-100 text-gray-800" };
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* HEROS SECTION / HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Automation Center</h1>
                    <p className="text-gray-500 mt-1">Orquesta y monitorea todos tus flujos de trabajo automáticos a gran escala.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/dashboard/admin/automation/builder?new=true`}>
                        <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                            <Plus size={16} /> Crear Nuevo Flujo
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KEY METRICS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Flujos Totales</CardTitle>
                        <Activity className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalWorkflows}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            <span className="text-green-600 font-medium">{analytics.activeWorkflows} activos</span> en este momento
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ejecuciones Históricas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(analytics.totalExecutions || 0).toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Disparos registrados en total</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.successRate}%</div>
                        <Progress value={analytics.successRate} className={`mt-2 h-2 ${analytics.successRate > 90 ? "[&>div]:bg-green-500" : "[&>div]:bg-yellow-500"}`} />
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Alertas Recientes</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {recentExecutions.filter(e => e.status === 'FAILED').length}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Fallos en los últimos 10 disparos</p>
                    </CardContent>
                </Card>
            </div>

            {/* OPERATIONS BAR */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar por nombre, ID o disparador..."
                            className="pl-9 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    {/* BULK ACTIONS (Visible only if selection > 0) */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 mr-4 animate-in slide-in-from-right-4">
                            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md">
                                {selectedIds.size} seleccionados
                            </span>
                            <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" onClick={() => handleBulkToggle(true)} disabled={isLoading === "bulk"}>
                                <Play className="h-4 w-4 mr-1" /> Activar
                            </Button>
                            <Button size="sm" variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50" onClick={() => handleBulkToggle(false)} disabled={isLoading === "bulk"}>
                                <Pause className="h-4 w-4 mr-1" /> Pausar
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={handleBulkDelete} disabled={isLoading === "bulk"}>
                                <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                            </Button>
                        </div>
                    )}

                    <div className="flex p-1 bg-gray-100 rounded-md border">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-sm transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                        >
                            <ListIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-sm transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* WORKFLOWS DISPLAY (LIST OR GRID) */}
            {filteredWorkflows.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                        <Activity className="h-10 w-10 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No hay flujos de trabajo</h3>
                    <p className="text-gray-500 mt-1 max-w-sm text-center">
                        {searchQuery ? "No se encontraron flujos que coincidan con tu búsqueda." : "Crea tu primera automatización para ahorrar tiempo y optimizar tus procesos."}
                    </p>
                    {!searchQuery && (
                        <Link href={`/dashboard/admin/automation/builder?new=true`} className="mt-6">
                            <Button>Crear mi primer flujo</Button>
                        </Link>
                    )}
                </div>
            ) : viewMode === "list" ? (
                /* LIST VIEW */
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-6 py-3 text-left w-12">
                                    <Checkbox
                                        checked={selectedIds.size === filteredWorkflows.length && filteredWorkflows.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre del Flujo</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Disparador</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ejecuciones</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actualizado</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredWorkflows.map((workflow) => {
                                const badge = getTriggerBadgeDetails(workflow.triggerType);
                                const isSelected = selectedIds.has(workflow.id);
                                return (
                                    <tr key={workflow.id} className={`hover:bg-indigo-50/30 transition-colors ${isSelected ? 'bg-indigo-50/40' : ''}`}>
                                        <td className="px-6 py-4">
                                            <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(workflow.id)} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-md ${workflow.isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    <Activity size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{workflow.name}</div>
                                                    <div className="text-xs text-gray-400 font-mono mt-0.5 cursor-pointer hover:text-indigo-600" onClick={() => copyToClipboard(workflow.id, "ID Copiado")}>
                                                        {workflow.id.substring(0, 12)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggle(workflow.id, workflow.isActive)}
                                                disabled={isLoading === workflow.id}
                                                className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all border ${workflow.isActive
                                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 shadow-sm'
                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                                    }`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${workflow.isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                                {workflow.isActive ? 'On' : 'Off'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                            {((workflow as any)._count?.executions || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(workflow.updatedAt), 'dd MMM yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Acciones de Flujo</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <Link href={`/dashboard/admin/automation/builder?id=${workflow.id}`}>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4 text-blue-600" /> Editar flujograma
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem onClick={() => copyToClipboard(workflow.id, "ID Copiado")}>
                                                        <Copy className="mr-2 h-4 w-4 text-gray-500" /> Copiar ID
                                                    </DropdownMenuItem>
                                                    {/* Duplicate placeholder (needs backend logic) */}
                                                    <DropdownMenuItem className="cursor-not-allowed text-gray-400" disabled>
                                                        <CopyPlus className="mr-2 h-4 w-4" /> Duplicar (Próximamente)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleToggle(workflow.id, workflow.isActive)}>
                                                        {workflow.isActive ? <Pause className="mr-2 h-4 w-4 text-orange-600" /> : <Play className="mr-2 h-4 w-4 text-green-600" />}
                                                        {workflow.isActive ? 'Pausar automatización' : 'Activar automatización'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDelete(workflow.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar definitivamente
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* GRID VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredWorkflows.map((workflow) => {
                        const badge = getTriggerBadgeDetails(workflow.triggerType);
                        const isSelected = selectedIds.has(workflow.id);
                        return (
                            <Card key={workflow.id} className={`group relative transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}>
                                <div className="absolute top-3 left-3 z-10">
                                    <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(workflow.id)} className="bg-white/80 backdrop-blur-sm" />
                                </div>
                                <div className="absolute top-3 right-3 z-10">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white data-[state=open]:bg-white">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <Link href={`/dashboard/admin/automation/builder?id=${workflow.id}`}>
                                                <DropdownMenuItem className="cursor-pointer"><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuItem onClick={() => handleToggle(workflow.id, workflow.isActive)}>
                                                {workflow.isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                                                {workflow.isActive ? 'Pausar' : 'Activar'}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(workflow.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <CardHeader className="pt-10 pb-2">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${workflow.isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Activity size={24} />
                                    </div>
                                    <CardTitle className="text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                        <Link href={`/dashboard/admin/automation/builder?id=${workflow.id}`}>{workflow.name}</Link>
                                    </CardTitle>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-0.5 inline-flex text-[10px] font-medium rounded-full ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                        <span className={`px-2 py-0.5 inline-flex text-[10px] items-center gap-1 font-medium rounded-full border ${workflow.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${workflow.isActive ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                                            {workflow.isActive ? 'Activo' : 'Pausado'}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 pb-4 border-t mt-4 flex justify-between items-center text-sm text-gray-500">
                                    <div className="flex flex-col">
                                        <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Ejecuciones</span>
                                        <span className="font-medium text-gray-900">{((workflow as any)._count?.executions || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Actualizado</span>
                                        <span>{format(new Date(workflow.updatedAt), 'MMM d, yyyy')}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
