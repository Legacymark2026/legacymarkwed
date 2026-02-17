"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Edit, Trash2, Play, Plus, MoreHorizontal, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteWorkflow, toggleWorkflow } from "@/actions/automation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Workflow {
    id: string;
    name: string;
    triggerType: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        executions: number;
    };
}

export default function WorkflowListClient({ initialWorkflows }: { initialWorkflows: Workflow[] }) {
    const [workflows, setWorkflows] = useState(initialWorkflows);
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this workflow?")) return;

        setIsLoading(id);
        const result = await deleteWorkflow(id);
        if (result.success) {
            setWorkflows(prev => prev.filter(w => w.id !== id));
            toast.success("Workflow deleted");
        } else {
            toast.error("Failed to delete");
        }
        setIsLoading(null);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        setIsLoading(id);
        const result = await toggleWorkflow(id, !currentStatus);
        if (result.success) {
            setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isActive: !currentStatus } : w));
            toast.success(currentStatus ? "Workflow paused" : "Workflow activated");
        } else {
            toast.error("Failed to update status");
        }
        setIsLoading(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Automatización (Beta)</h1>
                    <p className="text-gray-500">Gestiona tus flujos de trabajo automáticos y disparadores.</p>
                </div>
                <Link href={`/dashboard/admin/automation/builder?new=true`}>
                    <Button className="flex items-center gap-2">
                        <Plus size={16} /> Crear Flujo
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disparador</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ejecuciones</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                            <th className="relative px-6 py-3">
                                <span className="sr-only">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {workflows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No tienes flujos de trabajo creados. ¡Crea el primero!
                                </td>
                            </tr>
                        ) : (
                            workflows.map((workflow) => (
                                <tr key={workflow.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-0">
                                                <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                                                <div className="text-xs text-gray-500">ID: {workflow.id.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {workflow.triggerType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggle(workflow.id, workflow.isActive)}
                                            disabled={isLoading === workflow.id}
                                            className={`px-2 py-1 inline-flex items-center text-xs font-medium rounded-full cursor-pointer transition-colors ${workflow.isActive
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                        >
                                            {workflow.isActive ? 'Activo' : 'Inactivo'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {workflow._count.executions}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(workflow.createdAt), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(workflow.id)}>
                                                    Copiar ID
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <Link href={`/dashboard/admin/automation/builder?id=${workflow.id}`}>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Edit className="mr-2 h-4 w-4" /> Editar
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem onClick={() => handleToggle(workflow.id, workflow.isActive)}>
                                                    {workflow.isActive ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                                                    {workflow.isActive ? 'Desactivar' : 'Activar'}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(workflow.id)}
                                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
