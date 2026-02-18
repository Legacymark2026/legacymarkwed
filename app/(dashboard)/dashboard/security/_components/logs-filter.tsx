"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function LogsFilter() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", "1");
        if (term) {
            params.set("search", term);
        } else {
            params.delete("search");
        }
        router.replace(`?${params.toString()}`);
    }, 300);

    const handleTypeChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", "1");
        if (value && value !== "all") {
            params.set("type", value);
        } else {
            params.delete("type");
        }
        router.replace(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    placeholder="Buscar por usuario, acción o IP..."
                    className="pl-10"
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get("search")?.toString()}
                />
            </div>
            <div className="w-full sm:w-[200px]">
                <Select
                    onValueChange={handleTypeChange}
                    defaultValue={searchParams.get("type")?.toString() || "all"}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los eventos</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="error">Errores</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
