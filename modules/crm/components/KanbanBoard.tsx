"use client";

import { useState, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragStartEvent,
    DragEndEvent
} from "@dnd-kit/core";
import { updateDealStage } from "@/actions/crm";
import { createPortal } from "react-dom";
import { DealDetailsDialog } from "./DealDetailsDialog";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, Rows, Filter } from "lucide-react";
import { STAGES } from "@/lib/crm-config";
import confetti from "canvas-confetti";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DealCard } from "./DealCard";
import { DealContextMenu } from "./DealContextMenu";
import { toast } from "sonner";
import { createDeal, deleteDeal } from "@/actions/crm";

function DroppableStage({ stage, children, totalValue, dealCount, onQuickAdd, stagnantCount, avgDaysInStage }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stage: any,
    children: React.ReactNode,
    totalValue: number,
    dealCount: number,
    onQuickAdd?: () => void,
    stagnantCount?: number,
    avgDaysInStage?: number
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: stage.id,
    });

    const avgValue = dealCount > 0 ? totalValue / dealCount : 0;
    const isBottleneck = (stagnantCount || 0) > 2; // More than 2 stagnant deals = bottleneck

    return (
        <div
            ref={setNodeRef}
            className={`min-w-[320px] w-[320px] shrink-0 flex flex-col rounded-[24px] border transition-all duration-500 ease-out overlay-gradient relative overflow-hidden group/stage ${isOver ? 'ring-2 ring-blue-500/50 bg-blue-50/90 shadow-[inset_0_4px_20px_rgba(59,130,246,0.1)] scale-[1.01]' :
                isBottleneck ? 'border-red-200/60 bg-red-50/40 shadow-sm' :
                    'border-slate-200/50 bg-slate-50/40 hover:bg-slate-50/60 shadow-sm'
                }`}
        >
            <div className={`p-4 border-b border-slate-200/40 bg-white/70 backdrop-blur-xl rounded-t-[24px] z-10 sticky top-0 transition-colors ${isBottleneck ? 'bg-red-50/90 border-red-200/50' : ''}`}>
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${stage.color.replace('bg-', 'bg-').replace('border-', 'bg-')} shadow-[0_0_10px_rgba(0,0,0,0.1)] ring-2 ring-white`} />
                        <h3 className="font-bold text-sm text-slate-800 tracking-tight uppercase">{stage.label}</h3>
                        {isBottleneck && (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] text-red-600 ring-1 ring-red-300 animate-pulse" title="Alerta: Acumulación (+2) de deals estancados">
                                ⚠️
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {onQuickAdd && (
                            <button
                                onClick={onQuickAdd}
                                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg p-1.5 transition-all active:scale-95 duration-200"
                                title="Añadir Deal Rápido"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        )}
                        <Badge variant="outline" className="bg-white/80 text-[11px] font-mono text-slate-600 border-slate-200 shadow-sm font-semibold tracking-tight">
                            ${(totalValue / 1000).toFixed(1)}k
                        </Badge>
                    </div>
                </div>

                {/* Advanced Stage Metrics (Fase 1) */}
                <div className="flex justify-between items-center text-[10.5px] text-slate-500 font-medium tracking-wide">
                    <div className="flex gap-3">
                        <span className="flex items-center gap-1.5 opacity-80">
                            <Rows className="w-3.5 h-3.5" /> {dealCount}
                        </span>
                        {avgDaysInStage !== undefined && avgDaysInStage > 0 && (
                            <span className="text-indigo-600/90 flex items-center gap-1.5 bg-indigo-50/50 px-1.5 rounded-md" title="Promedio de días en etapa">
                                ⏱️ ~{avgDaysInStage}d
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {(stagnantCount || 0) > 0 && (
                            <span className="text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm border border-amber-200/50 font-semibold animate-pulse">
                                ⏳ {stagnantCount} estancados
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Scrollbars ocultas en Y */}
            <div className="flex-1 p-3 overflow-y-auto min-h-0 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none mix-blend-multiply group-hover/stage:opacity-[0.05] transition-opacity duration-500" />

                <div className="space-y-3 min-h-[150px] relative z-10 pb-4">
                    {dealCount === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-slate-400/70 border-2 border-dashed border-slate-200/60 rounded-xl m-2 bg-white/30 backdrop-blur-sm transition-colors group-hover/stage:border-blue-200/50 group-hover/stage:bg-blue-50/20">
                            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <span className="text-[11px] font-semibold tracking-wider uppercase">Soltar Aquí</span>
                        </div>
                    ) : children}
                </div>
            </div>
        </div>
    );
}

function DraggableDeal({ deal, onClick, onEdit, onDuplicate, onDelete }: { deal: any, onClick: () => void, onEdit: () => void, onDuplicate: () => void, onDelete: () => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: deal.id,
        data: deal
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50, // Keep dragged item above others
    } : undefined;

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="opacity-40 scale-105 transition-transform duration-200 cursor-grabbing">
                <div className="pointer-events-none shadow-2xl ring-2 ring-blue-500 rounded-xl relative">
                    <DealCard deal={deal} />
                </div>
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform duration-200">
            <DealContextMenu
                deal={deal}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            >
                <div onClick={onClick} className="group">
                    <DealCard deal={deal} />
                    {/* Visual Hover Feedback Ring */}
                    <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-blue-200 transition-colors pointer-events-none" />
                </div>
            </DealContextMenu>
        </div>
    );
}

export function KanbanBoard({ initialDeals }: { initialDeals: any[] }) {
    const [deals, setDeals] = useState(initialDeals);
    const [activeDeal, setActiveDeal] = useState<any | null>(null);
    const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
    const [sortBy, setSortBy] = useState<"date" | "value">("date");
    const [compactMode, setCompactMode] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    // Sincronizar estado local cuando llegan nuevos props del servidor (por ejemplo al borrar o editar)
    useEffect(() => {
        setDeals(initialDeals);
    }, [initialDeals]);

    // Filter deals
    const filteredDeals = deals.filter(deal => {
        const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            deal.contactName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = priorityFilter === 'ALL' || deal.priority === priorityFilter;
        return matchesSearch && matchesPriority;
    });

    // Sort deals
    const sortedDeals = [...filteredDeals].sort((a, b) => {
        if (sortBy === 'value') {
            return b.value - a.value;
        }
        // Default to date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    function handleDragStart(event: DragStartEvent) {
        setActiveDeal(event.active.data.current);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveDeal(null);

        if (!over) return;

        const dealId = active.id as string;
        const newStage = over.id as string;
        const currentDeal = deals.find(d => d.id === dealId);

        if (currentDeal && currentDeal.stage !== newStage) {
            // Confetti v2: Enhanced for WON deals, extra for big deals > $10k
            if (newStage === 'WON') {
                const isBigDeal = currentDeal.value >= 10000;
                if (isBigDeal) {
                    // Fireworks effect for big deals!
                    const duration = 3 * 1000;
                    const animationEnd = Date.now() + duration;
                    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

                    const interval = setInterval(() => {
                        const timeLeft = animationEnd - Date.now();
                        if (timeLeft <= 0) return clearInterval(interval);
                        const particleCount = 50 * (timeLeft / duration);
                        confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
                    }, 250);
                } else {
                    // Normal celebration
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
            }

            setDeals(deals.map(d =>
                d.id === dealId ? { ...d, stage: newStage, lastActivity: new Date() } : d
            ));

            try {
                // We use updateDealStage which now calls updateDeal (generic)
                await updateDealStage(dealId, newStage);
            } catch (e) {
                console.error(e);
            }
        }
    }

    // Handlers for Context Menu
    async function executeDuplicate(dealToDupe: any) {
        try {
            const { id, createdAt, updatedAt, ...dealData } = dealToDupe;
            const res = await createDeal({
                ...dealData,
                title: `${dealData.title} (Copy)`,
            });
            if (res.error) toast.error("Error al duplicar deal");
            else toast.success("Deal duplicado con éxito");
        } catch (e) {
            toast.error("Error intentando duplicar...");
        }
    }

    async function executeDelete(dealId: string) {
        if (confirm("¿Estás seguro de que deseas eliminar este Deal? Esta acción no se puede deshacer.")) {
            try {
                const res = await deleteDeal(dealId);
                if (res.error) toast.error("Error al eliminar deal");
                else toast.success("Deal eliminado");
            } catch (e) {
                toast.error("Error inesperado al borrar");
            }
        }
    }

    if (!mounted) {
        return (
            <div className="flex gap-4 h-[calc(100vh-250px)] overflow-x-auto pb-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex-shrink-0 w-80 bg-muted/50 rounded-xl p-4 space-y-4">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    // Phase 15 Batch B: Calculate Pipeline Metrics
    const totalPipeline = deals.reduce((sum, d) => sum + (d.stage !== 'WON' && d.stage !== 'LOST' ? d.value : 0), 0);
    const weightedForecast = deals.reduce((sum, d) => sum + (d.stage !== 'WON' && d.stage !== 'LOST' ? d.value * (d.probability || 50) / 100 : 0), 0);
    const wonDeals = deals.filter(d => d.stage === 'WON').length;
    const closedDeals = deals.filter(d => d.stage === 'WON' || d.stage === 'LOST').length;
    const winRate = closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0;

    // Phase 15: Calculate funnel data
    const funnelData = STAGES.filter(s => s.id !== 'WON' && s.id !== 'LOST').map(stage => ({
        name: stage.label,
        count: deals.filter(d => d.stage === stage.id).length
    }));
    const maxFunnelCount = Math.max(...funnelData.map(d => d.count), 1);

    return (
        <div className="flex flex-col h-full space-y-5">
            {/* Phase 15 & Fase 1: Pipeline Intelligence Dashboard (Premium Glassmorphism) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="col-span-1 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[20px] p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
                    <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1 flex items-center justify-between">
                        Total Pipeline
                        <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 font-mono tracking-tighter">
                        ${(totalPipeline / 1000).toFixed(1)}<span className="text-lg text-slate-400">k</span>
                    </div>
                </div>

                <div className="col-span-1 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[20px] p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
                    <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1 flex items-center justify-between">
                        Forecast Ponderado
                        <span className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg></span>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 font-mono tracking-tighter">
                        ${(weightedForecast / 1000).toFixed(1)}<span className="text-lg text-slate-400">k</span>
                    </div>
                </div>

                <div className="col-span-1 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[20px] p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500" />
                    <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1 flex items-center justify-between">
                        Win Rate
                        <span className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-purple-500"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg></span>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 font-mono tracking-tighter">
                        {winRate}<span className="text-xl text-slate-400">%</span>
                    </div>
                </div>

                <div className="col-span-1 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[20px] p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500" />
                    <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1 flex items-center justify-between">
                        Active Deals
                        <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-500"><Rows className="w-3.5 h-3.5" /></span>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 font-mono tracking-tighter">
                        {deals.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').length}
                    </div>
                </div>

                {/* Funnel Visual */}
                <div className="col-span-1 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[20px] p-3 shadow-sm flex flex-col justify-end relative h-full">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 absolute top-4 left-4">Conversion Funnel</div>
                    <div className="flex items-end gap-1.5 h-12 mt-6">
                        {funnelData.map((stage, i) => (
                            <div
                                key={stage.name}
                                className="flex-1 rounded-t-sm transition-all duration-700 hover:opacity-100 opacity-80 group/bar relative"
                                style={{
                                    height: `${Math.max((stage.count / maxFunnelCount) * 100, 15)}%`,
                                    background: `linear-gradient(to top, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, ${0.4 + (i * 0.1)}))`
                                }}
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-white px-1 shadow-sm rounded">
                                    {stage.count}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Toolbar Principal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-white/50 backdrop-blur-md border border-slate-200/50 rounded-2xl">
                <div className="relative w-full sm:max-w-md group">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                        placeholder="Buscar deals, clientes, emails..."
                        className="pl-10 lg:w-[400px] h-10 bg-white/80 border-slate-200/60 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 rounded-xl shadow-sm transition-all text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center bg-white/80 border border-slate-200/60 rounded-xl shadow-sm p-1">
                        <ArrowUpDown className="w-4 h-4 text-slate-400 mx-2" />
                        <select
                            className="text-sm bg-transparent border-none focus:ring-0 text-slate-600 font-medium cursor-pointer pl-0 py-1.5 outline-none appearance-none"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as "date" | "value")}
                        >
                            <option value="date">Ordenar por Fecha</option>
                            <option value="value">Ordenar por Valor</option>
                        </select>
                    </div>

                    <div className="flex items-center bg-white/80 border border-slate-200/60 rounded-xl shadow-sm p-1">
                        <Filter className="w-4 h-4 text-slate-400 mx-2" />
                        <select
                            className="text-sm bg-transparent border-none focus:ring-0 text-slate-600 font-medium cursor-pointer pl-0 py-1.5 outline-none appearance-none"
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="ALL">Todo</option>
                            <option value="HIGH">Alta Prioridad 🔥</option>
                            <option value="MEDIUM">Prioridad Media</option>
                            <option value="LOW">Baja Prioridad</option>
                        </select>
                    </div>

                    {/* Batch 3: Compact Mode Toggle */}
                    <button
                        onClick={() => setCompactMode(!compactMode)}
                        className={`p-2.5 rounded-xl border border-transparent transition-all shadow-sm ${compactMode ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-white/80 border-slate-200/60 text-slate-500 hover:bg-white hover:text-slate-800'}`}
                        title={compactMode ? 'Vista Extendida' : 'Vista Compacta'}
                    >
                        <Rows className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex gap-5 h-[calc(100vh-320px)] overflow-x-auto pb-6 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {STAGES.map(stage => {
                        const stageDeals = sortedDeals.filter(d => d.stage === stage.id);
                        const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

                        // Phase 15: Calculate stagnant count (deals > 7 days in stage)
                        const stagnantCount = stageDeals.filter(d => {
                            const daysInStage = d.lastActivity
                                ? Math.floor((new Date().getTime() - new Date(d.lastActivity).getTime()) / (1000 * 3600 * 24))
                                : 0;
                            return daysInStage > 7;
                        }).length;

                        // Phase 15: Calculate avg days in stage
                        const avgDaysInStage = stageDeals.length > 0
                            ? Math.round(stageDeals.reduce((sum, d) => {
                                const days = d.lastActivity
                                    ? Math.floor((new Date().getTime() - new Date(d.lastActivity).getTime()) / (1000 * 3600 * 24))
                                    : 0;
                                return sum + days;
                            }, 0) / stageDeals.length)
                            : 0;

                        return (
                            <DroppableStage
                                key={stage.id}
                                stage={stage}
                                totalValue={totalValue}
                                dealCount={stageDeals.length}
                                stagnantCount={stagnantCount}
                                avgDaysInStage={avgDaysInStage}
                            >
                                {stageDeals.map(deal => (
                                    <DraggableDeal
                                        key={deal.id}
                                        deal={deal}
                                        onClick={() => setSelectedDeal(deal)}
                                        onEdit={() => setSelectedDeal(deal)}
                                        onDuplicate={() => executeDuplicate(deal)}
                                        onDelete={() => executeDelete(deal.id)}
                                    />
                                ))}
                            </DroppableStage>
                        )
                    })}
                </div>

                {createPortal(
                    <DragOverlay>
                        {activeDeal ? <DealCard deal={activeDeal} /> : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>

            {selectedDeal && (
                <DealDetailsDialog
                    deal={selectedDeal}
                    open={!!selectedDeal}
                    onOpenChange={(open) => {
                        if (!open) setSelectedDeal(null);
                    }}
                />
            )}
        </div>
    )
}
