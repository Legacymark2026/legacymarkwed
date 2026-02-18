"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Eye, EyeOff } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExpertToolbarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filterStatus: string;
    onFilterChange: (status: string) => void;
}

export function ExpertToolbar({ searchQuery, onSearchChange, filterStatus, onFilterChange }: ExpertToolbarProps) {
    return (
        <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search experts by name or role..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                />
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <SlidersHorizontal className="h-4 w-4" />
                            Filter: {filterStatus === 'all' ? 'All' : filterStatus === 'active' ? 'Active' : 'Hidden'}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={filterStatus} onValueChange={onFilterChange}>
                            <DropdownMenuRadioItem value="all" className="cursor-pointer">
                                All Experts
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="active" className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4 text-teal-500" /> Active
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="hidden" className="cursor-pointer">
                                <EyeOff className="mr-2 h-4 w-4 text-orange-500" /> Hidden
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
