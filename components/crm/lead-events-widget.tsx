"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Video, MapPin, Plus, Clock } from "lucide-react";
import { EventDrawer } from "@/components/events/EventDrawer";

interface LeadEventsWidgetProps {
    leadId: string;
    initialEvents: any[];
}

export function LeadEventsWidget({ leadId, initialEvents }: LeadEventsWidgetProps) {
    const [events, setEvents] = useState(initialEvents);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleEventSaved = (newEvent: any) => {
        setEvents(prev => {
            const exists = prev.find(e => e.id === newEvent.id);
            if (exists) return prev.map(e => e.id === newEvent.id ? newEvent : e);
            // Append and sort
            const updated = [...prev, newEvent];
            return updated.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        });
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 mt-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-500" /> Eventos
                </h2>
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-600 border border-slate-200 hover:border-teal-200 transition-all rounded-lg text-xs font-bold"
                >
                    <Plus className="w-3.5 h-3.5" /> Nuevo
                </button>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-slate-100 border-dashed rounded-2xl">
                    <p className="text-sm text-slate-500 font-medium">No hay eventos vinculados a este lead.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {events.map(event => (
                        <div key={event.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-start gap-4 hover:border-teal-200 transition-colors">
                            <div className="flex-none w-12 text-center bg-white rounded-xl py-1 border border-slate-100 shadow-sm">
                                <p className="text-[9px] font-black uppercase text-slate-400">{format(new Date(event.startDate), 'MMM', { locale: es })}</p>
                                <p className="text-base font-black text-slate-700">{format(new Date(event.startDate), 'dd')}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-slate-900 truncate">{event.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-1">{event.description || "Sin descripción"}</p>
                                <div className="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span className="flex items-center gap-1 text-slate-500">
                                        <Clock className="w-3 h-3" /> {format(new Date(event.startDate), 'HH:mm')}
                                    </span>
                                    {event.type === 'ONLINE' && <span className="flex items-center gap-1 text-blue-500"><Video className="w-3 h-3" /> Online</span>}
                                    {event.type === 'PHYSICAL' && <span className="flex items-center gap-1 text-orange-500"><MapPin className="w-3 h-3" /> Presencial</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Embedded drawer configured for this lead */}
            <EventDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                eventId={null}
                onEventSaved={handleEventSaved}
            />
        </div>
    );
}
