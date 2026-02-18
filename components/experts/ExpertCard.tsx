"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch"; // Assuming we have a Switch component, or I'll use a button toggle

interface Expert {
    id: string;
    name: string;
    role: string;
    imageUrl: string | null;
    isVisible: boolean;
}

interface ExpertCardProps {
    expert: Expert;
    onEdit: (expert: Expert) => void;
    onDelete: (id: string) => void;
    onToggleVisibility: (id: string, currentStatus: boolean) => void;
}

export function ExpertCard({ expert, onEdit, onDelete, onToggleVisibility }: ExpertCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: expert.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.9 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative flex items-center gap-4 p-4 mb-3 bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300",
                isDragging && "shadow-xl ring-2 ring-teal-500/20 border-teal-500/50 rotate-1"
            )}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab text-slate-300 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
                <GripVertical size={20} />
            </div>

            {/* Avatar */}
            <div className={cn(
                "relative h-12 w-12 rounded-full overflow-hidden border-2 shrink-0 transition-colors",
                expert.isVisible ? "border-teal-500/20" : "border-slate-200 grayscale"
            )}>
                {expert.imageUrl ? (
                    <Image
                        src={expert.imageUrl}
                        alt={expert.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold">
                        {expert.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className={cn("flex-1 min-w-0 flex flex-col justify-center", !expert.isVisible && "opacity-60")}>
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{expert.name}</h3>
                    {!expert.isVisible && (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-slate-100 text-slate-500 border-slate-200">
                            Hidden
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-slate-500 truncate">{expert.role}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleVisibility(expert.id, expert.isVisible)}
                    className={cn(
                        "h-9 w-9 rounded-full transition-all",
                        expert.isVisible
                            ? "text-teal-600 bg-teal-50 hover:bg-teal-100 hover:text-teal-700"
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    )}
                    title={expert.isVisible ? "Visible (Click to hide)" : "Hidden (Click to show)"}
                >
                    {expert.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </Button>

                <div className="w-px h-8 bg-slate-200 mx-1" />

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(expert)}
                    className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Edit"
                >
                    <Pencil size={16} />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(expert.id)}
                    className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                    title="Delete"
                >
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    );
}
