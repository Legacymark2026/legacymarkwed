"use client";

import { useState, useMemo } from "react";
import { CalendarBoard } from "./CalendarBoard";
import { EventDrawer } from "./EventDrawer";
import { EventFilters } from "./EventFilters";
import { Plus, Download, Printer, Calendar as CalendarIcon, Users, Video, MapPin } from "lucide-react";
import { updateEvent } from "@/actions/events/event-actions";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";

export function EventsClient({ initialEvents }: { initialEvents: any[] }) {
    const [events, setEvents] = useState(initialEvents);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [filters, setFilters] = useState({ type: 'ALL', organizerId: null, query: '' });
    const [prefilledDates, setPrefilledDates] = useState<{ start: Date, end: Date } | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const handleOpenDrawer = (eventId?: string) => {
        setPrefilledDates(null);
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

    // Derived Statistics
    const stats = useMemo(() => {
        const upcoming = events.filter(e => new Date(e.startDate) >= new Date()).length;
        const online = events.filter(e => e.type === 'ONLINE').length;
        const physical = events.filter(e => e.type === 'PHYSICAL').length;
        return { total: events.length, upcoming, online, physical };
    }, [events]);

    return (
        <div className="flex-1 flex flex-col h-full relative bg-slate-50/50">
            {/* Header & Actions */}
            <div className="flex-none bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <CalendarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Calendario de Eventos</h1>
                        <p className="text-sm text-slate-500 font-medium">Gestión integral de citas, ferias y reuniones híbridas</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <EventFilters filters={filters} onChange={setFilters} />

                    <div className="w-px h-8 bg-slate-200 mx-2" />

                    <button className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors tooltip-trigger" title="Exportar a ICS">
                        <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors tooltip-trigger" title="Imprimir Visualización">
                        <Printer className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => handleOpenDrawer()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 ml-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Evento
                    </button>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="flex-none px-8 py-4 border-b border-slate-200 bg-white/40 flex items-center gap-4 overflow-x-auto">
                <StatCard icon={CalendarIcon} label="Total Eventos" value={stats.total} color="bg-slate-100 text-slate-700" ring="ring-slate-200" />
                <StatCard icon={Users} label="Próximos" value={stats.upcoming} color="bg-emerald-100 text-emerald-700" ring="ring-emerald-200" />
                <StatCard icon={Video} label="Eventos Online" value={stats.online} color="bg-blue-100 text-blue-700" ring="ring-blue-200" />
                <StatCard icon={MapPin} label="Presenciales" value={stats.physical} color="bg-orange-100 text-orange-700" ring="ring-orange-200" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex relative">

                {/* Mini Calendar Sidebar */}
                <div className="hidden lg:flex w-80 border-r border-slate-200 bg-white/60 flex-col overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-3 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    if (date) setSelectedDate(date);
                                }}
                                className="w-full max-w-[260px]"
                            />
                        </div>
                    </div>

                    <div className="p-5 flex-1 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Próximos (Esta Semana)</h3>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{stats.upcoming}</span>
                        </div>

                        <div className="space-y-3">
                            {events
                                .filter(e => new Date(e.startDate) >= new Date() && new Date(e.startDate) <= new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000))
                                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                                .slice(0, 5)
                                .map(e => (
                                    <div key={e.id} onClick={() => handleOpenDrawer(e.id)} className="group p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={`w-2 h-2 rounded-full ${e.type === 'ONLINE' ? 'bg-blue-500' : e.type === 'PHYSICAL' ? 'bg-orange-500' : 'bg-purple-500'}`} />
                                            <span className="text-[10px] font-bold text-slate-400 capitalize">{new Date(e.startDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">{e.title}</p>
                                    </div>
                                ))
                            }
                            {stats.upcoming === 0 && (
                                <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
                                    <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500 font-medium">No hay eventos próximos esta semana.</p>
                                </div>
                            )}
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

                            setEvents(prev => prev.map(e => e.id === id ? { ...e, startDate: start, endDate: end || e.endDate } : e));

                            const res = await updateEvent(id, {
                                startDate: start.toISOString(),
                                endDate: end ? end.toISOString() : originalEvent.endDate,
                            });

                            if (res.success) {
                                toast?.success("Horario de evento actualizado");
                            } else {
                                toast?.error(res.error || "Error al actualizar evento");
                                setEvents(prev => prev.map(e => e.id === id ? originalEvent : e));
                            }
                        }}
                        onDateSelect={handleDateSelect}
                    />
                </div>
            </div>

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

function StatCard({ icon: Icon, label, value, color, ring }: { icon: any, label: string, value: number, color: string, ring: string }) {
    return (
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm ring-1 ring-inset ${ring} min-w-[160px]`}>
            <div className={`p-2 rounded-xl scale-90 ${color}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-lg font-black text-slate-800 leading-none mt-0.5">{value}</p>
            </div>
        </div>
    );
}
