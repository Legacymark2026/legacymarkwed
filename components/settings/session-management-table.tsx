"use client";

import { Monitor, Smartphone, Laptop, LogOut, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Mock data representing active sessions
const MOCK_SESSIONS = [
    {
        id: "1",
        device: "MacBook Pro",
        browser: "Chrome",
        os: "macOS",
        ip: "192.168.1.100",
        location: "Bogotá, Colombia",
        lastActive: "Activo ahora",
        isCurrent: true,
        icon: Laptop,
    },
    {
        id: "2",
        device: "iPhone 13 Pro",
        browser: "Safari",
        os: "iOS",
        ip: "201.217.15.22",
        location: "Medellín, Colombia",
        lastActive: "Hace 2 horas",
        isCurrent: false,
        icon: Smartphone,
    },
    {
        id: "3",
        device: "Windows PC",
        browser: "Edge",
        os: "Windows 11",
        ip: "186.142.11.5",
        location: "Bogotá, Colombia",
        lastActive: "Hace 3 días",
        isCurrent: false,
        icon: Monitor,
    }
];

export function SessionManagementTable() {

    const handleRevoke = (id: string, isCurrent: boolean) => {
        if (isCurrent) {
            toast.error("No puedes revocar tu sesión actual.");
            return;
        }
        toast.success("Sesión revocada exitosamente", {
            description: "El dispositivo ha sido desconectado de tu cuenta."
        });
    };

    const handleRevokeAll = () => {
        toast.success("Todas las demás sesiones han sido revocadas", {
            description: "Es posible que algunas tomen unos minutos en cerrarse completamente."
        });
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Dispositivos y Sesiones</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Cierra sesión en dispositivos que ya no uses para mantener tu cuenta segura.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shrink-0"
                    onClick={handleRevokeAll}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar todas las demás
                </Button>
            </div>

            <div className="divide-y divide-slate-100">
                {MOCK_SESSIONS.map((session) => (
                    <div key={session.id} className={`p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between ${session.isCurrent ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'}`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${session.isCurrent ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <session.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-slate-900">{session.device}</span>
                                    <span className="text-slate-400 text-sm px-1.5">{session.browser} en {session.os}</span>
                                    {session.isCurrent && (
                                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                            Actual
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {session.lastActive}
                                    </span>
                                    <span className="hidden sm:inline text-slate-300">•</span>
                                    <span>{session.location}</span>
                                    <span className="hidden sm:inline text-slate-300">•</span>
                                    <span className="font-mono text-xs">{session.ip}</span>
                                </div>
                            </div>
                        </div>

                        {!session.isCurrent && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevoke(session.id, session.isCurrent)}
                                className="text-slate-400 hover:text-red-600 hover:bg-red-50 self-start sm:self-center shrink-0 -ml-2 sm:ml-0"
                            >
                                Revocar acceso
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
