"use client";

import { useEffect, useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { CheckCircle2, Lock, Building2, TerminalSquare, AlertCircle } from "lucide-react";

export default function PublicProposalPage({ params }: { params: { token: string } }) {
    const [proposal, setProposal] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSignature, setShowSignature] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const sigCanvas = useRef<any>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/public/proposals/${params.token}`);
                if (!res.ok) {
                    setError("Propuesta no encontrada o expirada.");
                    return;
                }
                const data = await res.json();
                setProposal(data);
            } catch (err: any) {
                setError("Error de conexión");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [params.token]);

    const handleClearSignature = () => {
        sigCanvas.current?.clear();
    };

    const handleAccept = async () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            alert("Por favor brinde su firma digital para aceptar los términos.");
            return;
        }
        
        const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
        setIsSubmitting(true);
        
        try {
            const res = await fetch(`/api/public/proposals/${params.token}/sign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ signature: signatureData })
            });
            const data = await res.json();
            if (res.ok) {
                setProposal(data.proposal);
                setShowSignature(false);
            } else {
                alert(data.error || "Ocurrió un error");
            }
        } catch (e) {
            alert("Connection error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-500">Cargando propuesta segura...</div>;
    if (error) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-red-400 gap-4"><AlertCircle className="h-12 w-12" />{error}</div>;

    const isSigned = proposal.status === "SIGNED";

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 font-sans selection:bg-teal-500/30">
            <div className="max-w-4xl mx-auto">
                {/* Header Branding */}
                <header className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                        {proposal.company?.logoUrl ? (
                            <img src={proposal.company.logoUrl} alt="Company Logo" className="h-12 object-contain" />
                        ) : (
                            <div className="h-12 w-12 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800">
                                <Building2 className="text-teal-500" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-white">{proposal.company?.name || "Agencia"}</h2>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                <Lock className="h-3 w-3" /> Documento Privado y Encriptado
                            </p>
                        </div>
                    </div>
                </header>

                {/* Status Banner */}
                {isSigned && (
                    <div className="mb-8 p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-start gap-4 shadow-[0_0_30px_rgba(20,184,166,0.1)]">
                        <CheckCircle2 className="h-6 w-6 text-teal-400 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-teal-300 font-semibold mb-1">Propuesta Aceptada y Firmada Digitalmente</h3>
                            <p className="text-sm text-teal-400/80">Este documento constituye un acuerdo vinculante firmado el {new Date(proposal.signedAt).toLocaleDateString()}.</p>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
                    <div className="p-8 md:p-12">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
                            {proposal.title}
                        </h1>
                        <p className="text-slate-400 mb-8 border-b border-slate-800 pb-8">
                            Preparado para: <strong className="text-slate-200">{proposal.contactName || proposal.contactEmail}</strong><br />
                            Emitido: {new Date(proposal.createdAt).toLocaleDateString()}
                        </p>

                        <div className="prose prose-invert prose-teal max-w-none text-slate-300 leading-relaxed space-y-6">
                            {proposal.content ? (
                                <div dangerouslySetInnerHTML={{ __html: proposal.content.replace(/\n/g, "<br/>") }} />
                            ) : (
                                <p className="italic text-slate-500">Resumen y alcances no proporcionados en el documento principal.</p>
                            )}
                        </div>

                        {/* Items Table */}
                        {proposal.items && proposal.items.length > 0 && (
                            <div className="mt-12">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <TerminalSquare className="h-5 w-5 text-teal-400" />
                                    Desglose de Inversión
                                </h3>
                                <div className="overflow-x-auto rounded-xl border border-slate-800">
                                    <table className="min-w-full divide-y divide-slate-800">
                                        <thead className="bg-slate-950/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Concepto</th>
                                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Cant.</th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800 bg-slate-900">
                                            {proposal.items.map((item: any) => (
                                                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-slate-200">{item.title}</div>
                                                        {item.description && <div className="text-sm text-slate-500 mt-1">{item.description}</div>}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-slate-400">{item.quantity}</td>
                                                    <td className="px-6 py-4 text-right text-slate-300 font-mono">
                                                        ${(item.price * item.quantity).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-950/80">
                                            <tr>
                                                <td colSpan={2} className="px-6 py-4 text-right font-semibold text-slate-400 uppercase tracking-wider">Total Acordado:</td>
                                                <td className="px-6 py-4 text-right font-bold text-teal-400 text-xl font-mono">
                                                    ${proposal.value.toLocaleString()} <span className="text-sm text-slate-500">{proposal.currency}</span>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Area / Signature Section */}
                    <div className="bg-slate-950 py-8 px-8 md:px-12 border-t border-slate-800">
                        {isSigned ? (
                            <div className="flex flex-col items-end">
                                <p className="text-sm text-slate-500 mb-2 uppercase tracking-widest font-bold">Firma Digital Verificada</p>
                                <div className="bg-slate-900 p-4 rounded-xl border border-teal-500/20 shadow-inner">
                                    <img src={proposal.signature} alt="Firma del Cliente" className="h-24 object-contain brightness-0 invert opacity-80" />
                                </div>
                                <p className="text-xs text-slate-600 mt-3 font-mono">ID: {proposal.id.split("-")[0]}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <p className="text-slate-400 text-sm max-w-sm">
                                    Al firmar este documento, estás aceptando los términos y alcances estipulados arriba para iniciar con el desarrollo/servicio.
                                </p>
                                {showSignature ? (
                                    <div className="w-full md:w-auto flex flex-col gap-3">
                                        <div className="bg-slate-200 rounded-xl overflow-hidden border-2 border-slate-700 w-full max-w-[400px]">
                                            <SignatureCanvas 
                                                ref={sigCanvas} 
                                                penColor="black"
                                                canvasProps={{width: 400, height: 150, className: 'sigCanvas'}} 
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button onClick={handleClearSignature} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">Limpiar</button>
                                            <button 
                                                onClick={handleAccept} 
                                                disabled={isSubmitting}
                                                className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all disabled:opacity-50"
                                            >
                                                {isSubmitting ? "Procesando..." : "Firmar Contrato"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setShowSignature(true)}
                                        className="w-full md:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all flex items-center justify-center gap-3 text-lg"
                                    >
                                        Aceptar y Firmar Digitalmente
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                <footer className="mt-8 text-center text-slate-600 text-xs flex items-center justify-center gap-2">
                    <Lock className="h-3 w-3" />
                    Auditoria Digital Registrada por LegacyMark ERP
                </footer>
            </div>
        </div>
    );
}
