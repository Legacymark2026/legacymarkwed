import { Bell, Mail, MessageSquare, Phone } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const dynamic = 'force-dynamic';

export default function SettingsNotificationsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-10">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 border-b border-slate-200 pb-4">
                    Notificaciones y Alertas
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                    Controla qué notificaciones recibes y por qué canales.
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-slate-400" /> Correo Electrónico
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Notificaciones enviadas a tu correo principal.</p>
                    </div>
                    <Switch defaultChecked />
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <label className="text-sm font-medium text-slate-900">Resumen Semanal</label>
                            <p className="text-xs text-slate-500">Un reporte con el rendimiento de tus campañas e integraciones.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <label className="text-sm font-medium text-slate-900">Nuevos Leads</label>
                            <p className="text-xs text-slate-500">Recibe una notificación cada vez que entre un lead al CRM.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <label className="text-sm font-medium text-slate-900">Actualizaciones de Producto</label>
                            <p className="text-xs text-slate-500">Novedades y mejoras en LegacyMark.</p>
                        </div>
                        <Switch />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden opacity-75">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-slate-400" /> WhatsApp (Próximamente)
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Alertas instantáneas directo a tu WhatsApp.</p>
                    </div>
                    <Switch disabled />
                </div>
            </div>
        </div>
    );
}
