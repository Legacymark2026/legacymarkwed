"use client";

import { useState } from "react";
import { CalendarBoard } from "./CalendarBoard";
import { EventDrawer } from "./EventDrawer";
import { EventFilters } from "./EventFilters";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { updateEvent } from "@/actions/events/event-actions";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";

export function EventsClient({ initialEvents }: { initialEvents: any[] }) {
    const [events, setEvents] = useState(initialEvents);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [filters, setFilters] = useState({ type: 'ALL', organizerId: null });
    const [prefilledDates, setPrefilledDates] = useState<{ start: Date, end: Date } | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const handleOpenDrawer = (eventId?: string) => {
        setPrefilledDates(null); // Clear any prefilled dates on manual open or edit
        setSelectedEventId(eventId || null);
        setIsDrawerOpen(true);
    };

    const handleDateSelect = (start: Date, end: Date, allDay: boolean) => {
        setPrefilledDates({ start, end });
        setSelectedEventId(null);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setSelectedEventId(null);
        setPrefilledDates(null);
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

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex relative">

                {/* Mini Calendar Sidebar */}
                <div className="hidden lg:block w-72 border-r border-slate-200 bg-white/50 overflow-y-auto p-4 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Navegación Rápida</h3>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-2">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    if (date) setSelectedDate(date);
                                }}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Próximos (Esta Semana)</h3>
                        <div className="space-y-2 px-2">
                            {events
                                .filter(e => new Date(e.startDate) >= new Date() && new Date(e.startDate) <= new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000))
                                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                                .slice(0, 3)
                                .map(e => (
                                    <div key={e.id} onClick={() => handleOpenDrawer(e.id)} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:border-teal-300 transition-colors">
                                        <p className="text-xs font-bold text-slate-800 truncate">{e.title}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">{new Date(e.startDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                                    </div>
                                ))
                            }
                            {events.length === 0 && <p className="text-xs text-slate-400 italic">No hay eventos próximos.</p>}
                        </div>
                    </div>
                </div>

                {/* Calendar Board */}
                <div className="flex-1 overflow-hidden relative">
                    <CalendarBoard
                        events={events}
                        filters={filters}
                        selectedDate={selectedDate}
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
                        onDateSelect={handleDateSelect}
                    />
                </div>
            </div>

            {/* Slide-out Drawer for Create/Edit */}
            <EventDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                eventId={selectedEventId}
                initialEvent={events.find(e => e.id === selectedEventId)}
                prefilledDates={prefilledDates}
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
