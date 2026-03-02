"use client";

import { Download, Key, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

// Códigos generados simulados
const MOCK_BACKUP_CODES = [
    "A7B2-C9X4", "F3M1-P8K5", "L9Z6-W2R7", "T4H8-N5V3", "E1D7-Q0Y6",
    "U8J2-M3F9", "G5C4-S1P2", "B6X9-K7T0", "V2N5-R8H1", "Y0W3-L4Z9"
];

export function BackupCodesModal() {
    const [codesVisible, setCodesVisible] = useState(false);

    const handleGenerate = () => {
        const toastId = toast.loading("Generando nuevos códigos seguros...");
        setTimeout(() => {
            setCodesVisible(true);
            toast.success("Códigos generados", {
                id: toastId,
                description: "Por favor guárdalos en un lugar seguro."
            });
        }, 1200);
    };

    const handleDownload = () => {
        toast.success("Descargando códigos de respaldo...", {
            description: "El archivo legacymark-backup-codes.txt se guardará en tus descargas."
        });
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm mt-4">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600 shrink-0">
                        <Key className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Códigos de Respaldo</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-lg">
                            Usa estos códigos para recuperar tu cuenta si pierdes acceso a tu dispositivo de doble autenticación. Cada código solo se puede usar una vez.
                        </p>
                    </div>
                </div>
                {!codesVisible && (
                    <Button variant="outline" className="shrink-0 bg-white" onClick={handleGenerate}>
                        Generar Códigos
                    </Button>
                )}
            </div>

            {codesVisible && (
                <div className="p-6 bg-slate-50/50 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            10 códigos restantes
                        </span>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" />
                            Descargar (.txt)
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {MOCK_BACKUP_CODES.map((code, idx) => (
                            <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white text-center font-mono text-sm tracking-wider font-semibold text-slate-700 shadow-sm select-all">
                                {code}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
                        <p>
                            <strong>⚠️ Advertencia:</strong> Si generas nuevos códigos, los códigos anteriores dejarán de funcionar inmediatamente.
                        </p>
                        <Button variant="outline" size="sm" className="bg-white ml-auto shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100" onClick={handleGenerate}>
                            Regenerar Nuevos
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
