import { CreditCard, Download, Receipt, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default function SettingsBillingPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-10">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 border-b border-slate-200 pb-4">
                    Facturación y Suscripción
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                    Gestiona tu plan activo, métodos de pago y descarga tus facturas.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Plan Actual</h3>
                        <span className="bg-indigo-50 text-indigo-700 uppercase tracking-wide text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">Pro Plan</span>
                    </div>

                    <div className="mb-6">
                        <div className="text-3xl font-black text-slate-900">$49<span className="text-lg font-medium text-slate-500">/mes</span></div>
                        <p className="text-sm text-slate-500 mt-1">Próximo cobro el 15 de Octubre de 2023.</p>
                    </div>

                    <div className="space-y-3 mb-8">
                        <div className="flex items-center text-sm text-slate-600 gap-2">
                            <Zap className="w-4 h-4 text-amber-500" /> Integraciones Ilimitadas
                        </div>
                        <div className="flex items-center text-sm text-slate-600 gap-2">
                            <Zap className="w-4 h-4 text-amber-500" /> API de WhatsApp Business
                        </div>
                        <div className="flex items-center text-sm text-slate-600 gap-2">
                            <Zap className="w-4 h-4 text-amber-500" /> Soporte Prioritario
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button className="bg-slate-900 text-white hover:bg-slate-800">Mejorar a Enterprise</Button>
                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">Cancelar Plan</Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-slate-400" /> Método de Pago
                        </h3>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-6 bg-slate-200 rounded shrink-0"></div>
                                <div className="font-mono text-sm text-slate-700">•••• 4242</div>
                            </div>
                            <span className="text-xs text-slate-500">12/26</span>
                        </div>
                        <Button variant="ghost" className="px-0 mt-2 text-sm text-blue-600 hover:text-blue-800">Actualizar tarjeta</Button>
                    </div>
                </div>
            </div>

            <section className="space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Historial de Facturas</h3>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                                        <Receipt className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Factura FAC-{202400 + i}</p>
                                        <p className="text-xs text-slate-500">15 Sept, 2023</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-medium text-slate-900">$49.00</span>
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-900">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
