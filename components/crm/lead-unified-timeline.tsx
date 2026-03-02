import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, MessageSquare, MousePointerClick, UserPlus, Globe } from "lucide-react";

interface Props {
    leadId: string;
    createdAt: Date;
    formData: any;
    source: string;
}

export async function LeadUnifiedTimeline({ leadId, createdAt, formData, source }: Props) {
    // Artificial delay to demonstrate Suspense streaming
    // await new Promise(resolve => setTimeout(resolve, 1500));

    // Fetch related data
    const [conversations, marketingEvents] = await Promise.all([
        prisma.conversation.findMany({
            where: { leadId },
            orderBy: { updatedAt: "desc" },
            take: 10,
        }),
        prisma.marketingEvent.findMany({
            where: { leadId },
            orderBy: { createdAt: "desc" },
            take: 15,
        }),
    ]);

    // Normalize events into a single timeline array
    type TimelineItem = {
        id: string;
        date: Date;
        type: "lead_created" | "conversation" | "marketing_event";
        icon: React.ReactNode;
        title: string;
        description: string | React.ReactNode;
        colorClass: string;
        bgClass: string;
    };

    const timeline: TimelineItem[] = [];

    // 1. Initial Creation Event
    timeline.push({
        id: "created",
        date: createdAt,
        type: "lead_created",
        icon: <UserPlus className="w-4 h-4" />,
        title: "Lead capturado",
        description: (
            <div className="space-y-2 mt-1">
                <p className="text-sm text-slate-600">Entró mediante <span className="font-bold">{source}</span></p>
                {formData && Object.keys(formData).length > 0 && (
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Datos del formulario</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(formData as Record<string, unknown>).map(([k, v]) => (
                                <div key={k} className="flex gap-2">
                                    <span className="text-slate-400 capitalize">{k}:</span>
                                    <span className="font-medium text-slate-800 truncate" title={String(v)}>{String(v)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ),
        colorClass: "text-blue-500",
        bgClass: "bg-blue-50 border-blue-200",
    });

    // 2. Conversations
    conversations.forEach((conv) => {
        timeline.push({
            id: `conv-${conv.id}`,
            date: conv.updatedAt,
            type: "conversation",
            icon: <MessageSquare className="w-4 h-4" />,
            title: `Conversación en ${conv.channel}`,
            description: (
                <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${conv.status === "OPEN" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {conv.status}
                    </span>
                    <Link href={`/dashboard/inbox/${conv.id}`} className="text-xs font-semibold text-teal-600 hover:text-teal-700 underline underline-offset-2">
                        Ver hilo completo &rarr;
                    </Link>
                </div>
            ),
            colorClass: "text-emerald-500",
            bgClass: "bg-emerald-50 border-emerald-200",
        });
    });

    // 3. Marketing Events
    marketingEvents.forEach((ev) => {
        const isClick = ev.eventType.includes("CLICK");
        timeline.push({
            id: `ev-${ev.id}`,
            date: ev.createdAt,
            type: "marketing_event",
            icon: isClick ? <MousePointerClick className="w-4 h-4" /> : <Globe className="w-4 h-4" />,
            title: ev.eventType.replace(/_/g, " "),
            description: (
                <div className="mt-1">
                    <p className="text-sm font-medium text-slate-700">{ev.eventName || "Actividad en el sitio"}</p>
                    {ev.url && <a href={ev.url} target="_blank" rel="noreferrer" className="text-[10px] text-sky-500 hover:underline truncate block mt-1">{ev.url}</a>}
                </div>
            ),
            colorClass: isClick ? "text-amber-500" : "text-purple-500",
            bgClass: isClick ? "bg-amber-50 border-amber-200" : "bg-purple-50 border-purple-200",
        });
    });

    // Sort by date descending
    timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-500" /> Historial Unificado
            </h2>

            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                {timeline.map((item, idx) => (
                    <div key={item.id} className="relative pl-6 sm:pl-8">
                        {/* Timeline dot */}
                        <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${item.bgClass} ${item.colorClass}`}>
                            {item.icon}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-1">
                            <h3 className="text-sm font-bold text-slate-900 capitalize">{item.title}</h3>
                            <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap" title={format(item.date, "PPpp", { locale: es })}>
                                {formatDistanceToNow(item.date, { addSuffix: true, locale: es })}
                            </span>
                        </div>

                        <div className="mt-1">
                            {item.description}
                        </div>
                    </div>
                ))}
            </div>

            {timeline.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                    <p className="text-sm font-medium">No hay actividad registrada aún.</p>
                </div>
            )}
        </div>
    );
}

export function LeadUnifiedTimelineSkeleton() {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 animate-pulse">
            <div className="h-4 w-40 bg-slate-200 rounded-full mb-8" />

            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="relative pl-8">
                        <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-slate-200 border-2 border-white" />
                        <div className="flex justify-between items-start mb-2">
                            <div className="h-4 w-32 bg-slate-200 rounded-full" />
                            <div className="h-3 w-20 bg-slate-100 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-3/4 bg-slate-100 rounded-full" />
                            <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
