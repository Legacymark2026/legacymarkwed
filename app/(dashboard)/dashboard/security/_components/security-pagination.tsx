"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface SecurityPaginationProps {
    currentPage: number;
    totalPages: number;
}

export function SecurityPagination({ currentPage, totalPages }: SecurityPaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `?${params.toString()}`;
    };

    const handlePageChange = (page: number) => {
        router.push(createPageURL(page));
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-2">
            <div className="text-sm text-gray-500">
                Página <span className="font-medium text-gray-900">{currentPage}</span> de{" "}
                <span className="font-medium text-gray-900">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Anterior</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Siguiente</span>
                </Button>
            </div>
        </div>
    );
}
