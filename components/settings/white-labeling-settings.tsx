"use client";

import { Upload, HelpCircle, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import Image from "next/image";

export function WhiteLabelingSettings() {
    const [logoUrl, setLogoUrl] = useState<string | null>("/logo.png");
    const [primaryColor, setPrimaryColor] = useState("#0f766e"); // teal-600

    const handleLogoUpload = () => {
        toast.info("Abre el selector de archivos del sistema");
        setTimeout(() => {
            toast.success("Logo corporativo actualizado.");
            // mock update
        }, 1500);
    };

    const handleSavePrimaryColor = () => {
        const toastId = toast.loading("Aplicando color primario...");
        setTimeout(() => {
            toast.success("Color corporativo aplicado con éxito.", { id: toastId });
        }, 1000);
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-teal-600" />
                        Marca Blanca (White-Labeling)
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Personaliza la apariencia del CRM para que coincida con la identidad visual de tu marca.
                    </p>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Logo Upload */}
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-1/3">
                        <h4 className="font-semibold text-slate-900">Logo de Empresa</h4>
                        <p className="text-xs text-slate-500 mt-1">
                            Aparecerá en el panel lateral, reportes y cotizaciones generadas en PDF.
                        </p>
                    </div>
                    <div className="flex-1 flex items-start gap-4">
                        <div className="w-48 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden group">
                            {logoUrl ? (
                                <>
                                    <Image src={logoUrl} alt="Company Logo" fill className="object-contain p-2" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" variant="secondary" onClick={handleLogoUpload}>
                                            Cambiar
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <button className="flex flex-col items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors" onClick={handleLogoUpload}>
                                    <Upload className="w-6 h-6" />
                                    <span className="text-xs font-medium">Subir Logo (.PNG transparent)</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                {/* Primary Color */}
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-1/3">
                        <h4 className="font-semibold text-slate-900">Color Primario</h4>
                        <p className="text-xs text-slate-500 mt-1">
                            Define el color de los botones principales y elementos destacados del sistema.
                        </p>
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                            />
                            <div className="flex flex-col">
                                <span className="font-mono text-sm text-slate-700 font-semibold">{primaryColor}</span>
                                <span className="text-xs text-slate-500">Valor HEX</span>
                            </div>
                        </div>

                        <div className="mt-2 flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-sm font-medium text-slate-600">Previsualización del Botón:</span>
                            <Button style={{ backgroundColor: primaryColor }} onClick={handleSavePrimaryColor}>
                                Guardar Preferencia
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
