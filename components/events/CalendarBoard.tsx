"use client";

import { useMemo, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import resourcePlugin from "@fullcalendar/resource";
import esLocale from "@fullcalendar/core/locales/es";

interface CalendarBoardProps {
    events: any[];
    resources?: any[]; // optional for now
    filters: any;
    selectedDate?: Date;
    onEventClick: (id: string) => void;
    onEventDropped: (id: string, start: Date, end: Date | null) => void;
    onDateSelect?: (start: Date, end: Date, allDay: boolean) => void;
}

export function CalendarBoard({ events, resources = [], filters, selectedDate, onEventClick, onEventDropped, onDateSelect }: CalendarBoardProps) {
    const calendarRef = useRef<FullCalendar>(null);

    useEffect(() => {
        if (selectedDate && calendarRef.current) {
            calendarRef.current.getApi().gotoDate(selectedDate);
        }
    }, [selectedDate]);

    // Format events for FullCalendar
    const calendarEvents = useMemo(() => {
        return events
            .filter(e => filters.type === 'ALL' || e.type === filters.type)
            .map(e => {
                // Determine color based on type
                const backgroundColor =
                    e.type === 'ONLINE' ? '#3b82f6' :
                        e.type === 'PHYSICAL' ? '#f97316' :
                            '#a855f7'; // HYBRID

                return {
                    id: e.id,
                    title: e.title,
                    start: e.startDate,
                    end: e.endDate,
                    allDay: e.isAllDay,
                    backgroundColor,
                    borderColor: backgroundColor,
                    extendedProps: {
                        type: e.type,
                        status: e.status
                    }
                };
            });
    }, [events, filters]);

    const handleEventClick = (clickInfo: any) => {
        onEventClick(clickInfo.event.id);
    };

    const handleEventDrop = async (dropInfo: any) => {
        // Optimistic UI updates / Drag and drop logic will be wired to server action here
        const { event } = dropInfo;
        onEventDropped(event.id, event.start, event.end);
    };

    const handleDateSelect = (selectInfo: any) => {
        if (onDateSelect) {
            onDateSelect(selectInfo.start, selectInfo.end, selectInfo.allDay);
        }
        // Unselect after callback
        selectInfo.view.calendar.unselect();
    };

    return (
        <div className="p-6 h-full w-full bg-white relative fc-theme-standard">
            {/* 
                We use inline overarching styles here as an override 
                to make FullCalendar look highly professional and fit our theme 
            */}
            <style jsx global>{`
                .fc { 
                    --fc-border-color: #f1f5f9; 
                    --fc-button-bg-color: #fff;
                    --fc-button-border-color: #e2e8f0;
                    --fc-button-text-color: #475569;
                    --fc-button-hover-bg-color: #f8fafc;
                    --fc-button-hover-border-color: #cbd5e1;
                    --fc-button-active-bg-color: #f1f5f9;
                    --fc-button-active-border-color: #cbd5e1;
                    --fc-today-bg-color: #f0fdfa;
                    --fc-event-border-color: transparent;
                    font-family: inherit;
                }
                .fc .fc-toolbar-title {
                    font-size: 1.25rem;
                    font-weight: 900;
                    color: #1e293b;
                    text-transform: capitalize;
                }
                .fc .fc-button {
                    font-weight: 600;
                    text-transform: capitalize;
                    border-radius: 0.5rem;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    transition: all 0.2s;
                }
                .fc .fc-button-primary:not(:disabled):active, 
                .fc .fc-button-primary:not(:disabled).fc-button-active {
                    background-color: #f1f5f9;
                    color: #0f172a;
                    border-color: #cbd5e1;
                }
                .fc-theme-standard td, .fc-theme-standard th {
                    border-color: var(--fc-border-color);
                }
                .fc-col-header-cell-cushion {
                    padding: 12px 0 !important;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #64748b;
                }
                .fc-daygrid-day-number {
                    font-weight: 600;
                    color: #334155;
                    padding: 8px !important;
                }
                .fc-event {
                    border-radius: 6px;
                    padding: 2px 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    transition: transform 0.1s;
                    cursor: pointer;
                }
                .fc-event:hover {
                    transform: scale(1.02);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    z-index: 5 !important;
                }
                .fc-timegrid-event .fc-event-time {
                    font-size: 0.7rem;
                    opacity: 0.9;
                }
                .fc-timegrid-event .fc-event-title {
                    font-size: 0.8rem;
                    font-weight: 700;
                }
            `}</style>

            <FullCalendar
                ref={calendarRef}
                plugins={[
                    dayGridPlugin,
                    timeGridPlugin,
                    interactionPlugin,
                    resourcePlugin,
                    resourceTimelinePlugin
                ]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay,resourceTimelineDay,listWeek"
                }}
                locales={[esLocale]}
                locale="es"
                timeZone="local"
                events={calendarEvents}
                resources={resources}
                editable={true} // Enables Drag & Drop
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                height="100%"
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                select={handleDateSelect}
                nowIndicator={true}
                slotMinTime="06:00:00"
                slotMaxTime="23:00:00"
                allDayText="Todo el día"
                buttonText={{
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    list: 'Agenda',
                    resourceTimelineDay: 'Equipo (Hoy)',
                }}
            />
        </div>
    );
}
