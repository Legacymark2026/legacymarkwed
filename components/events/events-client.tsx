"use client";

import { useState } from "react";
import { CalendarBoard } from "./CalendarBoard";
import { EventDrawer } from "./EventDrawer";
import { EventFilters } from "./EventFilters";
import { Plus } from "lucide-react";

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
                />
            </div>

            {/* Slide-out Drawer for Create/Edit */}
            <EventDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                eventId={selectedEventId}
                onEventSaved={(newEvent) => {
                    setEvents(prev => {
                        const exists = prev.find(e => e.id === newEvent.id);
                        if (exists) return prev.map(e => e.id === newEvent.id ? newEvent : e);
                        return [...prev, newEvent];
                    });
                }}
            />
        </div>
    );
}
