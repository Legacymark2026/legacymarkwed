"use client";

import { Users, Search, MoreHorizontal, UserPlus, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MOCK_USERS = [
    { id: 1, name: "Ana Martínez", email: "ana@legacymark.com", role: "admin", status: "active", lastLogin: "Hoy, 10:00 AM" },
    { id: 2, name: "Carlos Ruiz", email: "carlos@legacymark.com", role: "manager", status: "active", lastLogin: "Ayer, 16:30 PM" },
    { id: 3, name: "Laura Gómez", email: "laura@legacymark.com", role: "agent", status: "invited", lastLogin: "Nunca" },
    { id: 4, name: "Diego Torres", email: "diego@legacymark.com", role: "agent", status: "active", lastLogin: "Hace 2 días" },
    { id: 5, name: "Sofía Blanco", email: "sofia@legacymark.com", role: "viewer", status: "inactive", lastLogin: "Hace 1 mes" },
];

export function AdvancedUserDirectory() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mt-6">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-teal-100 text-teal-600 shrink-0">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Directorio de Usuarios</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-lg">
                            Administra los miembros de tu equipo, asigna roles de acceso y controla su estado dentro del Workspace.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" className="bg-white">
                        <Download className="w-4 h-4 mr-2" /> Exportar
                    </Button>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                        <UserPlus className="w-4 h-4 mr-2" /> Invitar
                    </Button>
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Buscar por nombre o correo electrónico..." className="pl-9 bg-white border-slate-200" />
                </div>
                <Button variant="outline" className="bg-white text-slate-600">
                    <Filter className="w-4 h-4 mr-2" /> Filtros
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                            <th className="px-6 py-4 font-semibold">Usuario</th>
                            <th className="px-6 py-4 font-semibold">Rol Asignado</th>
                            <th className="px-6 py-4 font-semibold">Estado</th>
                            <th className="px-6 py-4 font-semibold">Último Acceso</th>
                            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_USERS.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold border border-slate-300">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 capitalize border border-slate-200">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                                            user.status === 'invited' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' :
                                                'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' :
                                                user.status === 'invited' ? 'bg-amber-500' :
                                                    'bg-slate-400'
                                            }`} />
                                        {user.status === 'active' ? 'Activo' : user.status === 'invited' ? 'Invitación Pndte.' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {user.lastLogin}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
                <span>Mostrando 5 de 12 usuarios</span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>Anterior</Button>
                    <Button variant="outline" size="sm">Siguiente</Button>
                </div>
            </div>
        </div>
    );
}
