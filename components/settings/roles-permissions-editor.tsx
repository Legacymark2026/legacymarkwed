"use client";

import { ShieldCheck, UserCheck, Eye, Edit3, Trash, Check, Lock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

// Roles Mocked
const INITIAL_ROLES = [
    { id: "admin", name: "Administrador de Workspace", color: "red" },
    { id: "manager", name: "Jefe de Ventas", color: "indigo" },
    { id: "agent", name: "Agente de Ventas", color: "emerald" },
    { id: "viewer", name: "Solo Lectura", color: "slate" },
];

const PERMISSIONS = [
    {
        module: "CRM (Ventas)",
        actions: [
            { id: "crm.view_own", label: "Ver Leads Asignados" },
            { id: "crm.view_all", label: "Ver Todos los Leads" },
            { id: "crm.edit", label: "Editar Leads/Negocios" },
            { id: "crm.delete", label: "Eliminar Leads" },
            { id: "crm.export", label: "Exportar a CSV" },
        ]
    },
    {
        module: "Marketing & Automatización",
        actions: [
            { id: "mkt.view", label: "Ver Campañas" },
            { id: "mkt.edit", label: "Crear/Editar Campañas" },
            { id: "mkt.send", label: "Enviar Correos Masivos" },
            { id: "mkt.integrations", label: "Gestionar Integraciones" },
        ]
    },
    {
        module: "Administración de Equipo",
        actions: [
            { id: "team.view", label: "Ver Miembros" },
            { id: "team.invite", label: "Invitar/Eliminar Usuarios" },
            { id: "team.roles", label: "Modificar Roles y Permisos" },
        ]
    }
];

export function RolesPermissionsEditor() {
    const [roles, setRoles] = useState(INITIAL_ROLES);
    const [selectedRole, setSelectedRole] = useState(INITIAL_ROLES[1]);
    const [activePermissions, setActivePermissions] = useState<string[]>(["crm.view_own", "crm.view_all", "crm.edit", "mkt.view", "team.view"]);

    // New Role State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");

    const handleToggle = (id: string) => {
        setActivePermissions(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSave = () => {
        const toastId = toast.loading(`Actualizando permisos para ${selectedRole.name}...`);
        setTimeout(() => {
            toast.success("Rol actualizado con éxito.", { id: toastId });
        }, 1200);
    };

    const handleCreateRole = () => {
        if (!newRoleName.trim()) {
            toast.error("El nombre del rol no puede estar vacío");
            return;
        }

        const newRole = {
            id: newRoleName.toLowerCase().replace(/\s+/g, "_"),
            name: newRoleName,
            color: "blue" // default color
        };

        setRoles([...roles, newRole]);
        setSelectedRole(newRole);
        setActivePermissions([]);
        setNewRoleName("");
        setIsDialogOpen(false);
        toast.success(`Rol ${newRoleName} creado exitosamente`);
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm mt-6">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-900 text-white shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Control de Acceso Basado en Roles (RBAC)</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-lg">
                            Define qué módulos y acciones están permitidas para cada nivel de usuario en tu organización.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row min-h-[500px]">
                {/* Sidebar Roles */}
                <div className="w-full lg:w-64 border-r border-slate-100 bg-slate-50/50 p-4 space-y-2">
                    <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-4 px-2">Selecciona un Rol</h4>
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setSelectedRole(role)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex justify-between items-center ${selectedRole.id === role.id
                                ? `bg-${role.color}-100 text-${role.color}-800 border border-${role.color}-200 shadow-sm`
                                : "text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent"
                                }`}
                        >
                            {role.name}
                            {selectedRole.id === role.id && <Settings className="w-4 h-4 opacity-50" />}
                        </button>
                    ))}

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full mt-4 bg-white border-dashed text-slate-500 hover:text-indigo-600 hover:border-indigo-300">
                                + Crear Nuevo Rol
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Crear Nuevo Rol Personalizado</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <label className="text-sm font-semibold text-slate-700 block mb-2">Nombre del Rol</label>
                                <Input
                                    placeholder="ej. Analista de Datos"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                <Button onClick={handleCreateRole} className="bg-indigo-600 hover:bg-indigo-700 text-white">Crear Rol</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Main Content - Permissions Matrix */}
                <div className="flex-1 p-6 bg-white flex flex-col">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                Editando: <span className={`text-${selectedRole.color}-600`}>{selectedRole.name}</span>
                            </h4>
                            <p className="text-sm text-slate-500">
                                {activePermissions.length} permisos habilitados
                            </p>
                        </div>
                        <Button onClick={handleSave} className="bg-slate-900 hover:bg-slate-800 text-white">
                            Guardar Cambios
                        </Button>
                    </div>

                    <div className="space-y-8 flex-1 overflow-auto pr-2">
                        {selectedRole.id === 'admin' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                <Lock className="w-12 h-12 mb-4 text-slate-300" />
                                <h3 className="text-lg font-bold text-slate-700 mb-2">Permisos Totales Activos</h3>
                                <p className="max-w-md">El Administrador de Workspace tiene control absoluto e irrestricto sobre todos los módulos. Estos permisos no pueden revocarse para este rol.</p>
                            </div>
                        ) : (
                            PERMISSIONS.map((group) => (
                                <div key={group.module}>
                                    <h5 className="font-semibold text-slate-900 mb-4 bg-slate-50 py-2 px-3 rounded-md border border-slate-100">
                                        {group.module}
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {group.actions.map((action) => {
                                            const isActive = activePermissions.includes(action.id);
                                            return (
                                                <button
                                                    key={action.id}
                                                    onClick={() => handleToggle(action.id)}
                                                    className={`text-left flex items-start gap-3 p-3 rounded-lg border transition-all ${isActive
                                                        ? "bg-indigo-50/50 border-indigo-200 hover:border-indigo-300"
                                                        : "bg-white border-slate-200 hover:border-slate-300"
                                                        }`}
                                                >
                                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isActive ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300"
                                                        }`}>
                                                        {isActive && <Check className="w-3 h-3" />}
                                                    </div>
                                                    <div>
                                                        <span className={`block text-sm font-semibold ${isActive ? 'text-indigo-950' : 'text-slate-700'}`}>
                                                            {action.label}
                                                        </span>
                                                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                                                            SCOPE: {action.id}
                                                        </span>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
