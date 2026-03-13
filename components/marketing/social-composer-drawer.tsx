"use client";

import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Upload, Loader2, Send, ShieldCheck, Link2, MessageSquare, Megaphone, Settings2 } from "lucide-react";
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
    const [activeTab, setActiveTab] = useState<"CONTENT" | "GOVERNANCE" | "ADVANCED">("CONTENT");

    // Eje Central: Contenido
    const [content, setContent] = useState("");
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [status, setStatus] = useState<"DRAFT" | "SCHEDULED">("DRAFT");
    const [isEvergreen, setIsEvergreen] = useState(false);

    // Eje 5: Gobernanza
    const [approvalStatus, setApprovalStatus] = useState<"PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED">("PENDING");
    const [internalNotes, setInternalNotes] = useState("");

    // Eje 3: Nativas
    const [firstComment, setFirstComment] = useState("");
    const [targetUrl, setTargetUrl] = useState("");
    const [tiktokAudioId, setTiktokAudioId] = useState("");

    // Eje 4: Analítica (UTMs)
    const [utmCampaign, setUtmCampaign] = useState("");
    const [utmSource, setUtmSource] = useState("");
    const [utmMedium, setUtmMedium] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            if (existingPost) {
                setContent(existingPost.content || "");
                setSelectedPlatforms(existingPost.platforms || []);
                setMediaUrls(existingPost.mediaUrls || []);
                setStatus(existingPost.status === "DRAFT" ? "DRAFT" : "SCHEDULED");
                setApprovalStatus(existingPost.approvalStatus || "PENDING");
                setInternalNotes(existingPost.internalNotes || "");
                setIsEvergreen(existingPost.isEvergreen || false);
                setFirstComment(existingPost.firstComment || "");
                setTargetUrl(existingPost.targetUrl || "");
                setTiktokAudioId(existingPost.tiktokAudioId || "");
                setUtmCampaign(existingPost.utmCampaign || "");
                setUtmSource(existingPost.utmSource || "");
                setUtmMedium(existingPost.utmMedium || "");
            } else {
                setContent("");
                setSelectedPlatforms(["FACEBOOK", "LINKEDIN"]);
                setMediaUrls([]);
                setStatus("DRAFT");
                setApprovalStatus("PENDING");
                setInternalNotes("");
                setIsEvergreen(false);
                setFirstComment("");
                setTargetUrl("");
                setTiktokAudioId("");
                setUtmCampaign("");
                setUtmSource("");
                setUtmMedium("");
            }
            setActiveTab("CONTENT");
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
            scheduledAt: selectedDate,
            approvalStatus,
            internalNotes,
            isEvergreen,
            targetUrl,
            tiktokAudioId,
            firstComment,
            utmCampaign,
            utmSource,
            utmMedium
        };

        let res;
        if (existingPost?.id) {
            res = await updateSocialPost(existingPost.id, authorId, payload);
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
            <div className={`fixed top-0 right-0 h-full w-[600px] bg-slate-950 border-l border-slate-800 shadow-2xl z-[90] flex flex-col transform transition-transform duration-300`}>
                {/* Header */}
                <div className="flex flex-col border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center justify-between p-5 pb-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                {existingPost ? "Editar Publicación" : "Nueva Publicación"}
                                {approvalStatus === "APPROVED" && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                            </h2>
                            {selectedDate && (
                                <p className="text-sm font-mono text-teal-400 mt-1 flex items-center gap-1.5">
                                    <CalendarIcon size={14} /> 
                                    {format(selectedDate, "MMM dd, yyyy · HH:mm")}
                                </p>
                            )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800">
                            <X size={20} />
                        </Button>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex gap-4 px-5">
                        <button 
                            onClick={() => setActiveTab("CONTENT")}
                            className={`pb-3 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${activeTab === "CONTENT" ? "border-teal-400 text-teal-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                        >
                            <Megaphone size={14} /> Contenido
                        </button>
                        <button 
                            onClick={() => setActiveTab("GOVERNANCE")}
                            className={`pb-3 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${activeTab === "GOVERNANCE" ? "border-teal-400 text-teal-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                        >
                            <ShieldCheck size={14} /> Gobernanza & Notas
                        </button>
                        <button 
                            onClick={() => setActiveTab("ADVANCED")}
                            className={`pb-3 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${activeTab === "ADVANCED" ? "border-teal-400 text-teal-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                        >
                            <Settings2 size={14} /> Avanzado / UTMs
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    
                    {/* TAB: CONTENT */}
                    {activeTab === "CONTENT" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                                <Label className="text-xs uppercase font-mono tracking-widest text-slate-400 flex items-center justify-between">
                                    <span>Copy de la Publicación</span>
                                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">IA Generativa Disp.</span>
                                </Label>
                                <textarea 
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={6}
                                    placeholder="Escribe el contenido del post o utiliza Gemini para generarlo..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-md p-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none font-mono"
                                />
                            </div>

                            {/* Media */}
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
                    )}

                    {/* TAB: GOVERNANCE */}
                    {activeTab === "GOVERNANCE" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                                <Label className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-slate-400 mb-4">
                                    <ShieldCheck size={14} className="text-indigo-400" /> C-Level Approval Flow
                                </Label>
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    {(["PENDING", "IN_REVIEW", "APPROVED", "REJECTED"] as const).map(astatus => (
                                        <div 
                                            key={astatus}
                                            onClick={() => setApprovalStatus(astatus)}
                                            className={`p-3 rounded-md border cursor-pointer transition-all ${
                                                approvalStatus === astatus 
                                                    ? astatus === "APPROVED" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300" :
                                                      astatus === "REJECTED" ? "bg-red-500/10 border-red-500/50 text-red-300" :
                                                      "bg-indigo-500/10 border-indigo-500/50 text-indigo-300"
                                                    : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${astatus === "APPROVED" ? "bg-emerald-500" : astatus === "REJECTED" ? "bg-red-500" : astatus === "IN_REVIEW" ? "bg-indigo-500" : "bg-slate-600"}`} />
                                                <span className="text-xs font-bold font-mono">{astatus}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-2">Los posts con rol PENDING o REJECTED no se publicarán, incluso si llega la fecha programada.</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-slate-400">
                                    <MessageSquare size={14} /> Notas Internas & Feedback
                                </Label>
                                <textarea 
                                    value={internalNotes}
                                    onChange={(e) => setInternalNotes(e.target.value)}
                                    rows={4}
                                    placeholder="Instrucciones para edición, notas del cliente, feedback de rechazo..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-md p-4 text-sm text-yellow-500/80 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 resize-none font-mono"
                                />
                                <p className="text-[10px] text-slate-600 font-mono">Visible solo para el equipo. No se publicará.</p>
                            </div>

                            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-5 space-y-3">
                                <Label className="text-xs uppercase font-mono tracking-widest text-indigo-400 flex items-center gap-2">
                                    <MessageSquare size={14} /> Primer Comentario (Auto-Comment)
                                </Label>
                                <textarea 
                                    value={firstComment}
                                    onChange={(e) => setFirstComment(e.target.value)}
                                    rows={2}
                                    placeholder="Ej: Link en nuestra biografía / Más info en: https..."
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-md p-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                />
                                <p className="text-[10px] text-slate-500">Se publicará automáticamente como 1er comentario tras postear (Meta/LinkedIn).</p>
                            </div>
                        </div>
                    )}

                    {/* TAB: ADVANCED */}
                    {activeTab === "ADVANCED" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            
                            <div className="space-y-4 bg-slate-900/50 border border-slate-800 rounded-lg p-5">
                                <h3 className="text-xs uppercase font-mono tracking-widest text-teal-400 mb-2">Tracking & UTMs</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-slate-400">UTM Campaign</Label>
                                        <Input value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} placeholder="Ej: black_friday" className="bg-slate-950 border-slate-800 text-xs font-mono h-8" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-slate-400">UTM Source</Label>
                                        <Input value={utmSource} onChange={e => setUtmSource(e.target.value)} placeholder="Ej: facebook" className="bg-slate-950 border-slate-800 text-xs font-mono h-8" />
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <Label className="text-xs text-slate-400">UTM Medium</Label>
                                        <Input value={utmMedium} onChange={e => setUtmMedium(e.target.value)} placeholder="Ej: social_post" className="bg-slate-950 border-slate-800 text-xs font-mono h-8" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-2 border-b border-slate-800 pb-2">Capacidades Plataforma</h3>
                                
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-400 flex items-center gap-2"><Link2 size={12} /> Target URL (GMB / LinkedIn)</Label>
                                    <Input value={targetUrl} onChange={e => setTargetUrl(e.target.value)} placeholder="https://..." className="bg-slate-950 border-slate-800 text-xs" />
                                </div>

                                <div className="space-y-1.5 pt-2">
                                    <Label className="text-xs text-slate-400 flex items-center gap-2"><FaTiktok className="text-white" /> TikTok Audio ID</Label>
                                    <Input value={tiktokAudioId} onChange={e => setTiktokAudioId(e.target.value)} placeholder="Ej: 69784..." className="bg-slate-950 border-slate-800 text-xs font-mono" />
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-md">
                                    <Checkbox id="evergreen" checked={isEvergreen} onCheckedChange={(c) => setIsEvergreen(Boolean(c))} className="border-emerald-500/50 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black" />
                                    <label htmlFor="evergreen" className="text-sm font-medium leading-none text-emerald-400 cursor-pointer">
                                        Evergreen Content Recycling
                                    </label>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1 ml-6">El motor republicará este contenido automáticamente cada "X" semanas para rellenar vacíos en el calendario.</p>
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
                    <div>
                        {selectedDate && <span className="text-xs text-slate-500 font-mono">Modo: Local Timezone</span>}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose} disabled={isSaving} className="text-slate-400 hover:text-white">
                            Cancelar
                        </Button>
                        <Button 
                            variant="outline" 
                            disabled={isSaving}
                            onClick={() => handleSave("DRAFT")}
                            className="bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 font-mono text-xs font-bold"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            DRAFT
                        </Button>
                        <Button 
                            disabled={isSaving}
                            onClick={() => handleSave("SCHEDULED")}
                            className="bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)] font-mono text-xs font-bold uppercase tracking-wider"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            {existingPost ? "Actualizar" : "Programar"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
