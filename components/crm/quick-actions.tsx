"use client";

import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Phone, MessageSquare } from "lucide-react";

export function QuickActions() {
    return (
        <div className="flex items-center space-x-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 border rounded-lg shadow-sm">
            <Button size="sm" variant="ghost" className="h-8 gap-1">
                <Plus className="h-4 w-4" />
                <span>Nuevo Deal</span>
            </Button>
            <Button size="sm" variant="ghost" className="h-8 gap-1">
                <UserPlus className="h-4 w-4" />
                <span>Add Lead</span>
            </Button>
            <Button size="sm" variant="ghost" className="h-8 gap-1">
                <Phone className="h-4 w-4" />
                <span>Log Call</span>
            </Button>
            <Button size="sm" variant="ghost" className="h-8 gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>Nota</span>
            </Button>
        </div>
    );
}
