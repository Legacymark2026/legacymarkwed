"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
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
                    "w-[260px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                    date.to ? (
                        <>
                            {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                            {format(date.to, "LLL dd, y", { locale: es })}
                        </>
                    ) : (
                        format(date.from, "LLL dd, y", { locale: es })
                    )
                ) : (
                    <span>Seleccionar fechas</span>
                )}
            </Button>
        </div>
    );
}
