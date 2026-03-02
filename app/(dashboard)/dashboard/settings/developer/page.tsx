import { Code2, Key, Terminal, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default function SettingsDeveloperPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-10">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 border-b border-slate-200 pb-4">
                    Developer & API
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                    Gestiona tus claves API, webhooks y herramientas para desarrolladores.
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Key className="w-5 h-5 text-slate-400" /> Claves API Activas
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Utiliza estas claves para autenticar tus peticiones a la API de LegacyMark.</p>
                    </div>
                    <Button className="bg-slate-900 text-white hover:bg-slate-800">Generar Nueva Clave</Button>
                </div>

                <div className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 gap-4">
                        <div className="w-full">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-slate-900 text-sm">Producción - Main App</span>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Activa</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <code className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-600 truncate">
                                    lm_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                                </code>
                                <Button variant="outline" size="sm" className="shrink-0 h-8">
                                    <Copy className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Webhooks</h3>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center min-h-[250px] text-center">
                    <Terminal className="w-12 h-12 text-slate-300 mb-4" strokeWidth={1} />
                    <h3 className="font-bold text-slate-900 mb-1">Endpoints de Eventos</h3>
                    <p className="text-sm text-slate-500 max-w-md mb-6">
                        Configura URLs para recibir notificaciones en tiempo real cuando ocurran eventos en tu cuenta (ej: nuevos leads, pagos).
                    </p>
                    <Button variant="outline">Añadir Endpoint</Button>
                </div>
            </section>
        </div>
    );
}
