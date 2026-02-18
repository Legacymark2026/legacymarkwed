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
            className={`min-w-[280px] w-[300px] flex flex-col rounded-xl border transition-colors ${stage.color} ${isOver ? 'ring-2 ring-blue-400 bg-blue-50/50' : 'border-gray-200'} ${isBottleneck ? 'ring-2 ring-red-400' : ''}`}
        >
            <div className={`p-3 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-t-xl ${isBottleneck ? 'bg-red-50/50' : ''}`}>
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-sm text-gray-700">{stage.label}</h3>
                        {/* Phase 15: Bottleneck Indicator */}
                        {isBottleneck && (
                            <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium" title="Bottleneck: Too many stagnant deals">
                                ⚠️
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Phase 15: Quick Add Button */}
                        {onQuickAdd && (
                            <button
                                onClick={onQuickAdd}
                                className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded p-0.5 transition-colors"
                                title="Quick Add Deal"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        )}
                        <div className="text-xs font-mono font-medium text-gray-600">
                            ${(totalValue / 1000).toFixed(1)}k
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                    <div className="flex gap-2">
                        <span>{dealCount} deals</span>
                        {/* Phase 15: Deal Velocity */}
                        {avgDaysInStage !== undefined && avgDaysInStage > 0 && (
                            <span className="text-blue-600" title="Avg days in stage">
                                ~{avgDaysInStage}d
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {dealCount > 0 && (
                            <span>Avg: ${(avgValue / 1000).toFixed(1)}k</span>
                        )}
                        {/* Phase 15: Stagnant Count */}
                        {(stagnantCount || 0) > 0 && (
                            <span className="text-amber-600">{stagnantCount} old</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 p-2 overflow-y-auto min-h-0">
                <div className="space-y-1 min-h-[100px]">
                    {dealCount === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <span className="text-xs">Drop deals here</span>
                        </div>
                    ) : children}
                </div>
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DraggableDeal({ deal, onClick, onEdit }: { deal: any, onClick: () => void, onEdit: () => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: deal.id,
        data: deal
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="opacity-50">
                <DealCard deal={deal} />
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <DealContextMenu
                deal={deal}
                onEdit={onEdit}
                onDelete={onEdit} // We open details dialog to delete for now, or can implement direct delete
            >
                <div onClick={onClick}>
                    <DealCard deal={deal} />
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
        <div className="flex flex-col h-full">
            {/* Phase 15: Pipeline Intelligence Dashboard */}
            <div className="mb-4 grid grid-cols-5 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
                    <div className="text-xs opacity-80">Total Pipeline</div>
                    <div className="text-xl font-bold">${(totalPipeline / 1000).toFixed(1)}k</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
                    <div className="text-xs opacity-80">Weighted Forecast</div>
                    <div className="text-xl font-bold">${(weightedForecast / 1000).toFixed(1)}k</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white">
                    <div className="text-xs opacity-80">Win Rate</div>
                    <div className="text-xl font-bold">{winRate}%</div>
                </div>
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-3 text-white">
                    <div className="text-xs opacity-80">Active Deals</div>
                    <div className="text-xl font-bold">{deals.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').length}</div>
                </div>
                {/* Phase 15: Mini Conversion Funnel */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-[10px] text-gray-500 mb-1">Conversion Funnel</div>
                    <div className="flex items-end gap-1 h-8">
                        {funnelData.map((stage, i) => (
                            <div
                                key={stage.name}
                                className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all"
                                style={{ height: `${(stage.count / maxFunnelCount) * 100}%`, minHeight: '4px' }}
                                title={`${stage.name}: ${stage.count}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search deals..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                        <select
                            className="text-sm border rounded-md p-2 bg-background cursor-pointer"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as "date" | "value")}
                        >
                            <option value="date">Sort by Date</option>
                            <option value="value">Sort by Value</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <select
                            className="text-sm border rounded-md p-2 bg-background cursor-pointer"
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="ALL">All Priorities</option>
                            <option value="HIGH">High Priority</option>
                            <option value="MEDIUM">Medium Priority</option>
                            <option value="LOW">Low Priority</option>
                        </select>
                    </div>

                    {/* Batch 3: Compact Mode Toggle */}
                    <button
                        onClick={() => setCompactMode(!compactMode)}
                        className={`p-2 rounded-md border transition-colors ${compactMode ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-background hover:bg-muted'}`}
                        title={compactMode ? 'Normal View' : 'Compact View'}
                    >
                        <Rows className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex gap-4 h-[calc(100vh-300px)] overflow-x-auto pb-4">
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
