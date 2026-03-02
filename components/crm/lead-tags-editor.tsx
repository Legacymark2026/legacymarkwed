"use client";

import { useState, useTransition } from "react";
import { updateLead } from "@/actions/crm";
import { X, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
    leadId: string;
    initialTags: string[];
}

export function LeadTagsEditor({ leadId, initialTags }: Props) {
    const [tags, setTags] = useState<string[]>(initialTags);
    const [isPending, startTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState("");

    async function handleAddTag(e: React.FormEvent) {
        e.preventDefault();
        const newTag = inputValue.trim().toUpperCase();
        if (!newTag || tags.includes(newTag)) {
            setInputValue("");
            setIsEditing(false);
            return;
        }

        const prevTags = [...tags];
        const newTags = [...tags, newTag];
        setTags(newTags); // Optimistic UI update
        setInputValue("");
        setIsEditing(false);

        startTransition(async () => {
            const res = await updateLead(leadId, { tags: newTags });
            if (res.error) {
                setTags(prevTags); // Revert on failure
                toast?.error?.(res.error) || alert("Error: " + res.error);
            }
        });
    }

    async function handleRemoveTag(tagToRemove: string) {
        const prevTags = [...tags];
        const newTags = tags.filter(t => t !== tagToRemove);
        setTags(newTags); // Optimistic UI update

        startTransition(async () => {
            const res = await updateLead(leadId, { tags: newTags });
            if (res.error) {
                setTags(prevTags); // Revert on failure
                toast?.error?.(res.error) || alert("Error: " + res.error);
            }
        });
    }

    return (
        <div className="flex flex-wrap gap-2 items-center">
            {tags.map((tag) => (
                <span
                    key={tag}
                    className={`group flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100 rounded-full transition-all ${isPending ? 'opacity-70' : 'hover:bg-teal-100 hover:border-teal-200'}`}
                >
                    {tag}
                    <button
                        onClick={() => handleRemoveTag(tag)}
                        disabled={isPending}
                        className="text-teal-400 hover:text-teal-700 focus:outline-none transition-colors"
                        aria-label={`Remove tag ${tag}`}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}

            {isEditing ? (
                <form onSubmit={handleAddTag} className="flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={handleAddTag}
                        autoFocus
                        placeholder="NUEVO_TAG..."
                        className="px-2.5 py-1 text-xs font-bold uppercase w-28 border border-teal-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 text-teal-700 placeholder:text-teal-300 transition-all shadow-sm"
                        disabled={isPending}
                    />
                </form>
            ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    disabled={isPending}
                    className="flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-slate-300 text-slate-400 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50 transition-all focus:outline-none"
                    aria-label="Add new tag"
                >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
            )}
        </div>
    );
}
