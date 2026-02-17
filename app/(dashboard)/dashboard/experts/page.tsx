"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, UserPlus, Loader2 } from "lucide-react";
import { getAllExpertsAdmin, createExpert, updateExpert, deleteExpert, reorderExperts } from "@/actions/experts";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ExpertCard } from "@/components/experts/ExpertCard";
import { ExpertForm } from "@/components/experts/ExpertForm";
import { ExpertStats } from "@/components/experts/ExpertStats";
import { ExpertToolbar } from "@/components/experts/ExpertToolbar";

// --- Expert Interface ---
interface Expert {
    id: string;
    name: string;
    role: string;
    bio: string | null;
    imageUrl: string | null;
    socialLinks: any;
    isVisible: boolean;
    order: number;
}

export default function ExpertsPage() {
    const [experts, setExperts] = useState<Expert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadExperts();
    }, []);

    async function loadExperts() {
        setIsLoading(true);
        try {
            const data = await getAllExpertsAdmin();
            // @ts-ignore
            setExperts(data);
        } catch (error) {
            toast.error("Failed to load experts.");
        } finally {
            setIsLoading(false);
        }
    }

    // --- Computed Stats & Filtered List ---
    const stats = useMemo(() => {
        const total = experts.length;
        const active = experts.filter(e => e.isVisible).length;
        const hidden = total - active;
        return { total, active, hidden };
    }, [experts]);

    const filteredExperts = useMemo(() => {
        return experts.filter(expert => {
            const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                expert.role.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterStatus === 'all'
                ? true
                : filterStatus === 'active' ? expert.isVisible
                    : !expert.isVisible;
            return matchesSearch && matchesFilter;
        });
    }, [experts, searchQuery, filterStatus]);

    const isDragEnabled = searchQuery === "" && filterStatus === "all";

    // --- Handlers ---

    function openCreateSheet() {
        setEditingExpert(null);
        setIsSheetOpen(true);
    }

    function openEditSheet(expert: Expert) {
        setEditingExpert(expert);
        setIsSheetOpen(true);
    }

    async function handleToggleVisibility(id: string, currentStatus: boolean) {
        // Optimistic UI Update
        const originalExperts = [...experts];
        setExperts(experts.map(e => e.id === id ? { ...e, isVisible: !currentStatus } : e));

        try {
            const res = await updateExpert(id, { isVisible: !currentStatus });
            if (res.success) {
                toast.success(currentStatus ? "Expert hidden." : "Expert is now visible.");
            } else {
                throw new Error(res.error);
            }
        } catch (error) {
            toast.error("Failed to update status.");
            setExperts(originalExperts); // Revert
        }
    }

    async function handleFormSubmit(data: any) {
        setIsSaving(true);
        try {
            if (editingExpert) {
                const res = await updateExpert(editingExpert.id, data);
                if (res.success) {
                    toast.success("Expert updated successfully.");
                } else {
                    throw new Error(res.error);
                }
            } else {
                const res = await createExpert({
                    ...data,
                    order: experts.length,
                });
                if (res.success) {
                    toast.success("Expert created successfully.");
                } else {
                    throw new Error(res.error);
                }
            }
            await loadExperts();
            setIsSheetOpen(false);
        } catch (error) {
            toast.error("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this expert?")) return;
        try {
            const res = await deleteExpert(id);
            if (res.success) {
                toast.success("Expert deleted.");
                setExperts(experts.filter(e => e.id !== id));
            } else {
                toast.error("Failed to delete expert.");
            }
        } catch (error) {
            toast.error("Error deleting expert.");
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setExperts((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Save new order
                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    order: index
                }));

                reorderExperts(updates).catch(() => toast.error("Failed to save new order."));

                return newItems;
            });
        }
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Team Management</h1>
                    <p className="text-slate-500 mt-1 text-lg">Manage the experts displayed on your "About Us" page.</p>
                </div>
                <Button onClick={openCreateSheet} size="lg" className="shadow-lg bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6">
                    <UserPlus size={20} className="mr-2" /> Add Expert
                </Button>
            </div>

            {/* Stats */}
            <ExpertStats total={stats.total} active={stats.active} hidden={stats.hidden} />

            {/* Toolbar */}
            <ExpertToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
            />

            {/* Content Area */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-teal-600 h-10 w-10" />
                </div>
            ) : (
                <div className="bg-slate-50/50 rounded-2xl p-6 min-h-[400px] border border-dashed border-slate-300">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={filteredExperts.map(e => e.id)}
                            strategy={verticalListSortingStrategy}
                            disabled={!isDragEnabled} // Disable dnd when filtering
                        >
                            {filteredExperts.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredExperts.map((expert) => (
                                        <ExpertCard
                                            key={expert.id}
                                            expert={expert}
                                            onEdit={openEditSheet}
                                            onDelete={handleDelete}
                                            onToggleVisibility={handleToggleVisibility}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="p-4 rounded-full bg-slate-100 mb-4">
                                        <UserPlus className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900">No experts found</h3>
                                    <p className="text-slate-500 max-w-sm mt-2">
                                        {searchQuery || filterStatus !== 'all'
                                            ? "Try adjusting your search or filters."
                                            : "Get started by adding the first member of your team."}
                                    </p>
                                    {!searchQuery && filterStatus === 'all' && (
                                        <Button variant="ghost" onClick={openCreateSheet} className="mt-4 text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                                            Add your first expert
                                        </Button>
                                    )}
                                </div>
                            )}
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            {/* Create/Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent
                    className="sm:max-w-md overflow-y-auto"
                    onInteractOutside={(e: any) => e.preventDefault()}
                >
                    <SheetHeader className="mb-6">
                        <SheetTitle>{editingExpert ? "Edit Expert" : "Add New Expert"}</SheetTitle>
                        <SheetDescription>
                            {editingExpert
                                ? "Make changes to the expert's profile here. Click save when you're done."
                                : "Fill in the details to add a new expert to your team."}
                        </SheetDescription>
                    </SheetHeader>

                    <ExpertForm
                        initialData={editingExpert ? {
                            name: editingExpert.name,
                            role: editingExpert.role,
                            bio: editingExpert.bio || "",
                            imageUrl: editingExpert.imageUrl || "",
                            isVisible: editingExpert.isVisible
                        } : undefined}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsSheetOpen(false)}
                        isLoading={isSaving}
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
}
