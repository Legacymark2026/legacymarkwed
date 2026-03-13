"use client";

import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Upload, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { createSocialPost, updateSocialPost, SocialPostPayload } from "@/actions/social-publisher";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { FaFacebook, FaLinkedin, FaTiktok, FaGoogle } from "react-icons/fa";

type ComposerDrawerProps = {
    companyId: string;
    authorId: string;
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
    selectedDate: Date | null;
    existingPost?: any | null; // Si se está editando un post
};

const PLATFORMS = [
    { id: "FACEBOOK", label: "Facebook", icon: FaFacebook, color: "text-blue-500" },
    { id: "LINKEDIN", label: "LinkedIn", icon: FaLinkedin, color: "text-blue-700" },
    { id: "TIKTOK",   label: "TikTok",   icon: FaTiktok,   color: "text-white" },
    { id: "GOOGLE",   label: "Google",   icon: FaGoogle,   color: "text-red-500" },
];

export function SocialComposerDrawer({ companyId, authorId, open, onClose, onSaved, selectedDate, existingPost }: ComposerDrawerProps) {
    const [content, setContent] = useState("");
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    // Para simplificar, asumimos status SCHEDULED si hay fecha futura
    const [status, setStatus] = useState<"DRAFT" | "SCHEDULED">("DRAFT");

    useEffect(() => {
        if (open) {
            if (existingPost) {
                setContent(existingPost.content || "");
                setSelectedPlatforms(existingPost.platforms || []);
                setMediaUrls(existingPost.mediaUrls || []);
                setStatus(existingPost.status === "DRAFT" ? "DRAFT" : "SCHEDULED");
            } else {
                setContent("");
                setSelectedPlatforms(["FACEBOOK", "LINKEDIN"]);
                setMediaUrls([]);
                setStatus("DRAFT");
            }
        }
    }, [open, existingPost]);

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSave = async (forceStatus?: "DRAFT" | "SCHEDULED" | "PUBLISHED") => {
        if (!content.trim()) {
            toast.error("El contenido no puede estar vacío");
            return;
        }
        if (selectedPlatforms.length === 0) {
            toast.error("Selecciona al menos una plataforma");
            return;
        }

        setIsSaving(true);
        const targetStatus = forceStatus || status;

        const payload: SocialPostPayload = {
            content,
            platforms: selectedPlatforms,
            mediaUrls,
            status: targetStatus,
            scheduledAt: selectedDate
        };

        let res;
        if (existingPost?.id) {
            res = await updateSocialPost(existingPost.id, payload);
        } else {
            res = await createSocialPost(companyId, authorId, payload);
        }

        setIsSaving(false);

        if (res.success) {
            toast.success(existingPost ? "Publicación actualizada" : "Publicación creada con éxito");
            onSaved();
            onClose();
        } else {
            toast.error(res.error || "Error al procesar la publicación");
        }
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]" onClick={onClose} />

            {/* Panel */}
            <div className={`fixed top-0 right-0 h-full w-[500px] bg-slate-950 border-l border-slate-800 shadow-2xl z-[90] flex flex-col transform transition-transform duration-300`}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                            {existingPost ? "Editar Publicación" : "Nueva Publicación"}
                        </h2>
                        {selectedDate && (
                            <p className="text-sm font-mono text-teal-400 mt-1 flex items-center gap-1.5">
                                <CalendarIcon size={14} /> 
                                {format(selectedDate, "MMM dd, yyyy")}
                            </p>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <X size={20} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Platforms */}
                    <div className="space-y-3">
                        <Label className="text-xs uppercase font-mono tracking-widest text-slate-400">Canales de Destino</Label>
                        <div className="flex flex-wrap gap-2">
                            {PLATFORMS.map(p => {
                                const active = selectedPlatforms.includes(p.id);
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => togglePlatform(p.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                                            active 
                                            ? 'bg-slate-800 border-slate-700 text-slate-100' 
                                            : 'bg-slate-900/50 border-slate-800/50 text-slate-500 hover:bg-slate-900'
                                        }`}
                                    >
                                        <p.icon className={active ? p.color : "text-slate-500"} />
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                        <Label className="text-xs uppercase font-mono tracking-widest text-slate-400">Copy de la Publicación</Label>
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            placeholder="Escribe el contenido de tu post aquí..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-md p-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none font-mono"
                        />
                    </div>

                    {/* Media Upload Placeholder */}
                    <div className="space-y-3">
                        <Label className="text-xs uppercase font-mono tracking-widest text-slate-400">Multimedia (Ads / Creativos)</Label>
                        <div className="border border-dashed border-slate-700 rounded-lg bg-slate-900/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/50 transition-colors">
                            <Upload className="w-8 h-8 text-slate-500 mb-2" />
                            <p className="text-sm font-medium text-slate-300">Sube imágenes o videos cortos</p>
                            <p className="text-xs text-slate-500 mt-1">Soporta JPG, PNG, MP4 (Max 50MB)</p>
                            
                            {mediaUrls.length > 0 && (
                                <div className="mt-4 flex gap-2">
                                    {mediaUrls.map((url, i) => (
                                        <div key={i} className="w-16 h-16 rounded bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 break-all p-1">
                                            {url.substring(0, 15)}...
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-slate-800 bg-slate-900/80 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} disabled={isSaving} className="text-slate-400 hover:text-white">
                        Cancelar
                    </Button>
                    <Button 
                        variant="outline" 
                        disabled={isSaving}
                        onClick={() => handleSave("DRAFT")}
                        className="bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Guardar Borrador
                    </Button>
                    <Button 
                        disabled={isSaving}
                        onClick={() => handleSave("SCHEDULED")}
                        className="bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        Programar
                    </Button>
                </div>
            </div>
        </>
    );
}
