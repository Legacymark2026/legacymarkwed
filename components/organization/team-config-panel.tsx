"use client";

import { useEffect, useState } from "react";
import { X, Users, Settings, TrendingUp, DollarSign, Target, Loader2, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTeamDetails } from "@/actions/organization";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamConfigPanelProps {
    teamId: string | null;
    open: boolean;
    onClose: () => void;
}

export function TeamConfigPanel({ teamId, open, onClose }: TeamConfigPanelProps) {
    const [loading, setLoading] = useState(false);
    const [team, setTeam] = useState<any>(null);

    useEffect(() => {
        if (open && teamId) {
            loadTeam();
        } else {
            setTeam(null);
        }
    }, [open, teamId]);

    const loadTeam = async () => {
        setLoading(true);
        const res = await getTeamDetails(teamId!);
        if (res.success) {
            setTeam(res.data);
        } else {
            toast.error(res.error);
            onClose();
        }
        setLoading(false);
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" 
                onClick={onClose}
            />

            {/* Panel */}
            <div 
                className={`fixed top-0 right-0 h-full w-[450px] bg-slate-950 border-l border-slate-800 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                            <Settings size={18} className="text-teal-500" /> 
                            Configuración de Equipo
                        </h2>
                        {team && <p className="text-xs text-slate-400 mt-0.5">{team.path}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <X size={20} />
                    </Button>
                </div>

                {loading || !team ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-500 mb-4" />
                        <p>Cargando información segura...</p>
                    </div>
                ) : (
                    <Tabs defaultValue="general" className="flex-1 flex flex-col">
                        <div className="px-4 pt-4 border-b border-slate-800">
                            <TabsList className="bg-slate-900 border border-slate-800 w-full mb-4">
                                <TabsTrigger value="general" className="flex-1 text-xs data-[state=active]:bg-teal-950 data-[state=active]:text-teal-400">General</TabsTrigger>
                                <TabsTrigger value="members" className="flex-1 text-xs data-[state=active]:bg-teal-950 data-[state=active]:text-teal-400">Personal ({team.members?.length || 0})</TabsTrigger>
                                <TabsTrigger value="kpis" className="flex-1 text-xs data-[state=active]:bg-teal-950 data-[state=active]:text-teal-400">Rendimiento</TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-6">
                                {/* TAB: GENERAL */}
                                <TabsContent value="general" className="space-y-4 mt-0 outline-none">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Nombre del Departamento</Label>
                                        <Input 
                                            defaultValue={team.name} 
                                            className="bg-slate-900 border-slate-700 focus-visible:ring-teal-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Descripción Estratégica</Label>
                                        <textarea 
                                            defaultValue={team.description || ''}
                                            rows={3}
                                            className="w-full rounded-md bg-slate-900 border-slate-700 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 p-3 text-slate-200"
                                            placeholder="Ej: Lidera la captación de leads en redes..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                            <p className="text-xs text-slate-400 font-medium">Headcount Actual</p>
                                            <p className="text-2xl font-semibold text-slate-200 mt-1">{team.members?.length || 0}</p>
                                        </div>
                                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                            <p className="text-xs text-slate-400 font-medium">Nivel de Jerarquía</p>
                                            <p className="text-2xl font-semibold text-slate-200 mt-1">L{team.level}</p>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <Button variant="destructive" className="w-full bg-red-950/50 text-red-400 hover:bg-red-900 hover:text-white border border-red-900/50">
                                            <Trash2 size={16} className="mr-2" /> Eliminar Equipo
                                        </Button>
                                    </div>
                                </TabsContent>

                                {/* TAB: MEMBERS */}
                                <TabsContent value="members" className="mt-0 outline-none">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-slate-300">Lista de Asignación</h3>
                                        <Button size="sm" variant="outline" className="h-7 text-xs bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-teal-400">
                                            <UserPlus size={14} className="mr-1" /> Reubicar Talento
                                        </Button>
                                    </div>

                                    {(!team.members || team.members.length === 0) ? (
                                        <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg bg-slate-900/30">
                                            <Users size={24} className="mx-auto text-slate-600 mb-2" />
                                            <p className="text-sm text-slate-500">No hay usuarios asignados a este rubro.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {team.members.map((m: any) => (
                                                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8 border border-slate-700">
                                                            <AvatarImage src={m.user.image} />
                                                            <AvatarFallback className="bg-slate-800 text-xs text-slate-300">
                                                                {m.user.name?.substring(0, 2).toUpperCase() || 'US'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-200 leading-none">{m.user.name || 'Sin Nombre'}</p>
                                                            <p className="text-xs text-slate-500 mt-1">{m.role.toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-red-400">
                                                        <X size={14} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                {/* TAB: KPIS (Placeholder Milestone 2) */}
                                <TabsContent value="kpis" className="mt-0 outline-none space-y-4">
                                    <div className="bg-teal-950/20 border border-teal-500/20 p-4 rounded-xl text-center">
                                        <TrendingUp size={24} className="mx-auto text-teal-500 mb-2" />
                                        <h4 className="font-semibold text-teal-400">Inteligencia CRM (Próxima Fase)</h4>
                                        <p className="text-xs text-teal-500/70 mt-2">
                                            Aquí conectaremos los Deals ganados por los miembros de este equipo y la velocidad de resolución.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 opacity-50">
                                            <DollarSign size={16} className="text-emerald-500 mb-2"/>
                                            <p className="text-xs text-slate-400 font-medium">Monthly Target</p>
                                            <p className="text-lg font-semibold text-slate-200 mt-1">$0.00</p>
                                        </div>
                                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 opacity-50">
                                            <Target size={16} className="text-amber-500 mb-2"/>
                                            <p className="text-xs text-slate-400 font-medium">Task Velocity</p>
                                            <p className="text-lg font-semibold text-slate-200 mt-1">0 / week</p>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </ScrollArea>
                        
                        <div className="p-4 border-t border-slate-800 mt-auto bg-slate-900/50">
                            <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                                Guardar Cambios
                            </Button>
                        </div>
                    </Tabs>
                )}
            </div>
        </>
    );
}
