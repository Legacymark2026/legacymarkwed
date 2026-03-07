"use client";

import * as React from "react";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CalendarDateRangePicker({
    className,
}: React.HTMLAttributes<HTMLDivElement>) {
    const [date, setDate] = React.useState({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    return (
        <div className={cn("grid gap-2", className)}>
            <Button
                id="date"
                variant={"outline"}
                className={cn(
                    "w-[280px] justify-between text-left font-medium bg-white/70 backdrop-blur-md border-slate-200/60 shadow-sm hover:bg-white hover:border-blue-300 transition-all duration-300 rounded-xl h-10",
                    !date && "text-muted-foreground"
                )}
            >
                <div className="flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-lg mr-2 text-blue-600">
                        <CalendarIcon className="h-4 w-4" />
                    </div>
                    {date?.from ? (
                        date.to ? (
                            <span className="text-slate-700 tracking-tight">
                                {format(date.from, "LLL dd", { locale: es })} -{" "}
                                {format(date.to, "LLL dd, y", { locale: es })}
                            </span>
                        ) : (
                            format(date.from, "LLL dd, y", { locale: es })
                        )
                    ) : (
                        <span>Seleccionar fechas</span>
                    )}
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 opacity-50" />
            </Button>
        </div>
    );
}
