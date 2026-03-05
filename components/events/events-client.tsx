"use client";

import { useState } from "react";
import { CalendarBoard } from "./CalendarBoard";
import { EventDrawer } from "./EventDrawer";
import { EventFilters } from "./EventFilters";
import { Plus } from "lucide-react";
import { updateEvent } from "@/actions/events/event-actions";
import { toast } from "sonner";

export function EventsClient({ initialEvents }: { initialEvents: any[] }) {
    const [events, setEvents] = useState(initialEvents);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [filters, setFilters] = useState({ type: 'ALL', organizerId: null });

    const handleOpenDrawer = (eventId?: string) => {
        setSelectedEventId(eventId || null);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setSelectedEventId(null);
        setIsDrawerOpen(false);
    };

    return (
        <div className="flex-1 flex flex-col h-full relative">
            {/* Header & Filters */}
            <div className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Calendario</h1>
                    <p className="text-sm text-slate-500">Gestión de eventos híbridos, ferias y reuniones</p>
                </div>

                <div className="flex items-center gap-4">
                    <EventFilters filters={filters} onChange={setFilters} />

                    <button
                        onClick={() => handleOpenDrawer()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Evento
                    </button>
                </div>
            </div>

            {/* Main Calendar Board */}
            <div className="flex-1 overflow-hidden relative">
                <CalendarBoard
                    events={events}
                    filters={filters}
                    onEventClick={(id) => handleOpenDrawer(id)}
                    onEventDropped={async (id, start, end) => {
                        const originalEvent = events.find(e => e.id === id);
                        if (!originalEvent) return;

                        // Optimistic update
                        setEvents(prev => prev.map(e => e.id === id ? { ...e, startDate: start, endDate: end || e.endDate } : e));

                        const res = await updateEvent(id, {
                            startDate: start.toISOString(),
                            endDate: end ? end.toISOString() : originalEvent.endDate,
                        });

                        if (res.success) {
                            toast?.success("Horario de evento actualizado");
                        } else {
                            toast?.error(res.error || "Error al actualizar evento");
                            // Revert on failure
                            setEvents(prev => prev.map(e => e.id === id ? originalEvent : e));
                        }
                    }}
                />
            </div>

            {/* Slide-out Drawer for Create/Edit */}
            <EventDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                eventId={selectedEventId}
                initialEvent={events.find(e => e.id === selectedEventId)}
                onEventSaved={(newEvent) => {
                    setEvents(prev => {
                        const exists = prev.find(e => e.id === newEvent.id);
                        if (exists) return prev.map(e => e.id === newEvent.id ? newEvent : e);
                        return [...prev, newEvent];
                    });
                }}
                onEventDeleted={(deletedId) => {
                    setEvents(prev => prev.filter(e => e.id !== deletedId));
                    handleCloseDrawer();
                }}
            />
        </div>
    );
}
