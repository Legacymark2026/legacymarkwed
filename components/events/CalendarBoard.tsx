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
        const query = filters.query?.toLowerCase() || '';

        return events
            .filter(e => {
                const matchType = filters.type === 'ALL' || e.type === filters.type;
                const matchQuery = !query || e.title.toLowerCase().includes(query);
                return matchType && matchQuery;
            })
            .map(e => {
                // Determine color based on type, making it slightly more vibrant
                const backgroundColor =
                    e.type === 'ONLINE' ? '#2563eb' : // blue-600
                        e.type === 'PHYSICAL' ? '#ea580c' : // orange-600
                            '#9333ea'; // purple-600

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
        const { event } = dropInfo;
        onEventDropped(event.id, event.start, event.end);
    };

    const handleDateSelect = (selectInfo: any) => {
        if (onDateSelect) {
            onDateSelect(selectInfo.start, selectInfo.end, selectInfo.allDay);
        }
        selectInfo.view.calendar.unselect();
    };

    const renderEventContent = (eventInfo: any) => {
        const { event, timeText } = eventInfo;
        const type = event.extendedProps.type;

        let pointColor = "bg-slate-400";
        let bgColorClass = "bg-slate-800/70";
        if (type === 'ONLINE') {
            pointColor = 'bg-blue-400';
            bgColorClass = 'bg-blue-500/20';
        }
        if (type === 'PHYSICAL') {
            pointColor = 'bg-orange-400';
            bgColorClass = 'bg-orange-500/20';
        }
        if (type === 'HYBRID') {
            pointColor = 'bg-purple-400';
            bgColorClass = 'bg-purple-500/20';
        }

        return (
            <div
                className={`flex flex-col h-full w-full justify-start items-start p-1.5 overflow-hidden group rounded-md transition-colors ${bgColorClass} hover:brightness-110`}
                title={`${event.title}${timeText ? ` (${timeText})` : ''}`}
            >
                <div className="flex items-center gap-1.5 w-full mb-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pointColor} shadow-sm`} />
                    <span className="text-[10px] font-black truncate tracking-wide text-slate-300">{timeText}</span>
                </div>
                <div className="text-[11px] font-bold leading-tight truncate w-full text-white whitespace-normal line-clamp-2">
                    {event.title}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 h-full w-full relative fc-theme-standard">
            <style jsx global>{`
                .fc { 
                    --fc-border-color: rgba(71, 85, 105, 0.4);
                    --fc-button-bg-color: rgba(30, 41, 59, 0.8);
                    --fc-button-border-color: rgba(71, 85, 105, 0.5);
                    --fc-button-text-color: #94a3b8;
                    --fc-button-hover-bg-color: rgba(51, 65, 85, 0.8);
                    --fc-button-hover-border-color: rgba(100, 116, 139, 0.6);
                    --fc-button-active-bg-color: rgba(20, 184, 166, 0.15);
                    --fc-button-active-border-color: rgba(20, 184, 166, 0.4);
                    --fc-today-bg-color: rgba(20, 184, 166, 0.06);
                    --fc-event-border-color: transparent;
                    --fc-page-bg-color: transparent;
                    --fc-neutral-bg-color: transparent;
                    --fc-list-event-hover-bg-color: rgba(30, 41, 59, 0.6);
                    font-family: inherit;
                }
                .fc-view-harness,
                .fc-scrollgrid,
                .fc-scroller,
                .fc-daygrid-body,
                .fc-scrollgrid-sync-table,
                .fc-col-header,
                table.fc-scrollgrid {
                    background: transparent !important;
                }
                .fc-theme-standard td,
                .fc-theme-standard th {
                    background: transparent !important;
                    border-color: var(--fc-border-color);
                }
                .fc .fc-toolbar-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #f1f5f9;
                    text-transform: capitalize;
                    letter-spacing: -0.025em;
                }
                .fc .fc-button {
                    font-weight: 600;
                    font-size: 0.875rem;
                    text-transform: capitalize;
                    border-radius: 0.5rem;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    padding: 0.5rem 1rem;
                }
                .fc .fc-button-primary:not(:disabled):active, 
                .fc .fc-button-primary:not(:disabled).fc-button-active {
                    background-color: rgba(20, 184, 166, 0.2);
                    color: #2dd4bf;
                    border-color: rgba(20, 184, 166, 0.5);
                    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.2);
                }
                .fc-scrollgrid {
                    border-radius: 0.75rem;
                    overflow: hidden;
                    border: 1px solid rgba(71, 85, 105, 0.4) !important;
                }
                .fc-col-header-cell-cushion {
                    padding: 12px 0 !important;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #64748b;
                }
                .fc-daygrid-day-number {
                    font-weight: 600;
                    color: #94a3b8;
                    padding: 8px 12px !important;
                    font-size: 0.875rem;
                }
                .fc-day-other .fc-daygrid-day-number {
                    color: #334155;
                }
                .fc-day-today .fc-daygrid-day-number {
                    background-color: #2dd4bf;
                    color: #020617;
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 4px;
                    padding: 0 !important;
                }
                .fc-event {
                    border-radius: 6px;
                    border: none;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
                    transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s;
                    cursor: pointer;
                    overflow: hidden;
                    background-color: transparent !important;
                }
                .fc-daygrid-event {
                    margin-top: 2px !important;
                }
                .fc-daygrid-event-dot {
                    display: none;
                }
                .fc-event-main {
                    padding: 0 !important;
                }
                .fc-event:hover {
                    transform: translateY(-1px) scale(1.01);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
                    z-index: 5 !important;
                    filter: brightness(1.1);
                }
                .fc-timegrid-slot-label-cushion {
                    font-size: 0.75rem;
                    color: #475569;
                    font-weight: 500;
                }
                .fc-timegrid-axis-cushion {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    color: #475569;
                }
                .fc-timegrid-col.fc-day-today {
                    background-color: rgba(20, 184, 166, 0.04) !important;
                }
                .fc-list-day-cushion {
                    background-color: rgba(30, 41, 59, 0.6) !important;
                    color: #94a3b8;
                }
                .fc-list-event td {
                    color: #cbd5e1;
                }
                /* Scrollbar */
                ::-webkit-scrollbar {
                  width: 6px;
                  height: 6px;
                }
                ::-webkit-scrollbar-track {
                  background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                  background: rgba(71, 85, 105, 0.5);
                  border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                  background: rgba(100, 116, 139, 0.7);
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
                    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
                }}
                locales={[esLocale]}
                locale="es"
                timeZone="local"
                events={calendarEvents}
                resources={resources}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                height="100%"
                eventContent={renderEventContent}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                select={handleDateSelect}
                nowIndicator={true}
                slotMinTime="06:00:00"
                slotMaxTime="23:00:00"
                allDayText="Día entero"
                slotLabelFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    omitZeroMinute: false,
                    meridiem: 'short'
                }}
                buttonText={{
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    list: 'Agenda'
                }}
            />
        </div>
    );
}
