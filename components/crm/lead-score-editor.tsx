"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateLeadScore } from "@/actions/leads";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Edit2, X } from "lucide-react";

// Helper for the radial score chart
export function ScoreRadial({ score }: { score: number }) {
    const size = 64;
    const strokeWidth = 6;
    const center = size / 2;
    const radius = center - strokeWidth;
    const dashArray = 2 * Math.PI * radius;
    const dashOffset = dashArray * ((100 - score) / 100);

    const scoreColorClass = score >= 70 ? "text-emerald-500" : score >= 40 ? "text-amber-500" : "text-rose-500";
    const bgGradient = score >= 70 ? "from-emerald-500/10 to-teal-500/10" : score >= 40 ? "from-amber-500/10 to-orange-500/10" : "from-red-500/10 to-rose-500/10";

    return (
        <div className={`relative flex items-center justify-center p-2 rounded-2xl bg-gradient-to-br ${bgGradient} border border-white/50 backdrop-blur-sm self-start shrink-0`}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-slate-200" />
                <circle
                    cx={center} cy={center} r={radius} fill="none" strokeWidth={strokeWidth}
                    className={`${scoreColorClass} transition-all duration-1000 ease-in-out`}
                    strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeLinecap="round"
                />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center`}>
                <span className={`text-xl font-black ${scoreColorClass}`}>{score}</span>
            </div>
        </div>
    );
}

export function LeadScoreEditor({ leadId, initialScore, canManageLeads = false }: { leadId: string; initialScore: number; canManageLeads?: boolean }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [score, setScore] = useState(initialScore);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!canManageLeads) return;
        if (score === initialScore) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await updateLeadScore(leadId, score);
            if (res.success) {
                setIsEditing(false);
                router.refresh();
            } else {
                console.error("Failed to update score", res.error);
                setScore(initialScore); // revert
            }
        } catch (error) {
            console.error("Failed to update score", error);
            setScore(initialScore);
        } finally {
            setIsLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1">
                    <Input
                        type="number"
                        min={0}
                        max={100}
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                        className="w-16 h-8 text-center text-sm font-bold border-slate-300 focus:ring-teal-500 focus:border-teal-500 shadow-inner rounded-xl"
                        autoFocus
                    />
                    <div className="flex flex-col gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6 rounded-md hover:bg-emerald-100 text-emerald-600 border border-transparent shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:border-emerald-200"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            <Check className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6 rounded-md hover:bg-rose-100 text-rose-500 border border-transparent shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:border-rose-200"
                            onClick={() => {
                                setScore(initialScore);
                                setIsEditing(false);
                            }}
                            disabled={isLoading}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`group/score relative ${canManageLeads ? 'cursor-pointer' : ''}`} onClick={() => canManageLeads && setIsEditing(true)}>
            <ScoreRadial score={score} />
            {canManageLeads && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md border border-slate-100 opacity-0 group-hover/score:opacity-100 transition-opacity transform scale-90 group-hover/score:scale-100 text-slate-400 hover:text-teal-600">
                    <Edit2 className="w-3.5 h-3.5" />
                </div>
            )}
        </div>
    );
}
