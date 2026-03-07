import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Mail, Phone, Clock, Calendar, Tag, Star, TrendingUp, TrendingDown, Bell } from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";

// Helper: Star Rating component
function StarRating({ priority }: { priority: string }) {
    const stars = priority === 'HIGH' ? 5 : priority === 'MEDIUM' ? 3 : 1;
    return (
        <div className="flex gap-0.5" title={`Priority: ${priority}`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${i <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );
}

export function DealCard({ deal }: { deal: any }) {
    const daysSinceAction = deal.lastActivity
        ? Math.floor((new Date().getTime() - new Date(deal.lastActivity).getTime()) / (1000 * 3600 * 24))
        : 0;

    // Phase 15: Deal Age
    const dealAge = deal.createdAt ? differenceInDays(new Date(), new Date(deal.createdAt)) : 0;

    const isStagnant = daysSinceAction > 7;
    const isOverdue = deal.expectedClose && new Date(deal.expectedClose) < new Date();

    // Phase 15: Value Trend (simulated - would come from DB in real app)
    const valueTrend = deal.previousValue ? (deal.value > deal.previousValue ? 'up' : deal.value < deal.previousValue ? 'down' : null) : null;

    // Phase 15: Next Action Reminder (days until expected close or follow-up)
    const daysUntilAction = deal.expectedClose
        ? differenceInDays(new Date(deal.expectedClose), new Date())
        : null;

    // Phase 15 Batch D: AI Deal Score (0-100 based on signals)
    const calculateDealScore = () => {
        let score = 50; // Base score
        // Positive signals
        if (deal.probability >= 70) score += 15;
        else if (deal.probability >= 50) score += 10;
        if (deal.value >= 10000) score += 10;
        if (deal.source === 'Referral') score += 10;
        if (deal.contactEmail && deal.contactPhone) score += 5;
        // Negative signals
        if (isStagnant) score -= 15;
        if (isOverdue) score -= 20;
        if (!deal.expectedClose) score -= 10;
        if (deal.priority === 'LOW') score -= 5;
        return Math.max(0, Math.min(100, score));
    };
    const dealScore = calculateDealScore();

    return (
        <Card className={`mb-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-300 group relative border-l-4 overflow-hidden bg-white/95 backdrop-blur-sm ${isStagnant ? 'ring-1 ring-amber-400/50 shadow-[0_0_15px_-3px_rgba(251,191,36,0.3)]' : ''} ${isOverdue ? 'ring-1 ring-red-400/50 shadow-[0_0_15px_-3px_rgba(248,113,113,0.3)]' : ''}`} style={{ borderLeftColor: deal.priority === 'HIGH' ? '#ef4444' : deal.priority === 'MEDIUM' ? '#3b82f6' : '#e5e7eb' }}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gray-50/50 to-transparent pointer-events-none" />

            <CardContent className="p-3.5 relative z-10">
                {/* Phase 15: Deal Age Badge & AI Score - Top Right Corner */}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm border ${dealScore >= 70 ? 'bg-green-50 text-green-700 border-green-200 shadow-[0_0_10px_rgba(34,197,94,0.2)]' :
                            dealScore >= 40 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-red-50 text-red-700 border-red-200'
                            }`}
                        title={`AI Score: ${dealScore}/100`}
                    >
                        {dealScore >= 70 ? '🔥 ' : ''}{dealScore}
                    </span>
                </div>

                {/* Header: Title, Stars, Source */}
                <div className="flex justify-between items-start mb-3 pr-12">
                    <div className="space-y-1.5 w-full">
                        <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-[13px] text-gray-800 line-clamp-2 leading-tight flex-1 group-hover:text-blue-600 transition-colors">{deal.title}</h4>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <StarRating priority={deal.priority} />

                            {deal.source && deal.source !== 'Unknown' && (
                                <Badge variant="outline" className="text-[9px] h-4 px-1.5 py-0 bg-blue-50/50 text-blue-700 border-blue-100 font-medium">
                                    <Tag className="w-2.5 h-2.5 mr-1 opacity-70" />{deal.source}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Value Row with Trend */}
                <div className="flex items-end justify-between mb-3 bg-gray-50/50 rounded-lg p-2 border border-gray-100/50">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Valor Estimado</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[15px] font-black tracking-tight text-gray-900">
                                {formatCurrency(deal.value)}
                            </span>
                            {/* Phase 15: Value Trend Icon */}
                            {valueTrend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-green-500 stroke-[3]" />}
                            {valueTrend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-red-500 stroke-[3]" />}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        {isOverdue && (
                            <div className="flex items-center text-[10px] font-bold text-red-600 bg-red-100/80 px-2 py-0.5 rounded-full shadow-sm" title="Overdue!">
                                <Calendar className="w-3 h-3 mr-1" />
                                Vencido
                            </div>
                        )}
                        {isStagnant && (
                            <div className="group/stagnant flex items-center bg-amber-100/80 rounded-full shadow-sm pr-0.5 pl-2 py-0.5 transition-all" title="Stagnant: > 7 days">
                                <Clock className="w-3 h-3 mr-1 text-amber-700" />
                                <span className="text-[10px] font-bold text-amber-700 mr-1.5">
                                    Estancado ({daysSinceAction}d)
                                </span>
                                {deal.contactEmail && (
                                    <a href={`mailto:${deal.contactEmail}?subject=Seguimiento%20sobre:%20${encodeURIComponent(deal.title)}&body=Hola%20${encodeURIComponent(deal.contactName?.split(' ')[0] || 'allí')},%0A%0A`}
                                        className="bg-white p-1 rounded-full text-amber-600 hover:bg-amber-600 hover:text-white transition-colors shadow-sm border border-amber-200"
                                        title="Enviar Email Rápido"
                                        onClick={(e) => { e.stopPropagation(); }}
                                        onPointerDown={(e) => e.stopPropagation()}
                                    >
                                        <Mail className="w-2.5 h-2.5" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Company & Probability */}
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-md border shadow-sm max-w-[50%]">
                        <img
                            src={`https://logo.clearbit.com/${deal.company?.domain || deal.contactEmail?.split('@')[1] || 'example.com'}`}
                            alt=""
                            className="w-4 h-4 rounded-full bg-gray-100 ring-1 ring-gray-200"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <span className="text-[11px] font-semibold text-gray-700 truncate">{deal.company?.name || 'Empresa'}</span>
                    </div>

                    {deal.probability > 0 ? (
                        <div className="w-[40%] flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-500 mb-1">{deal.probability}% Prob</span>
                            <Progress value={deal.probability} className="h-1.5 w-full bg-gray-100 [&>div]:bg-blue-500" />
                        </div>
                    ) : (
                        <span className="text-[10px] text-gray-400">Sin prob.</span>
                    )}
                </div>

                {/* Phase 15: Next Action Reminder */}
                {daysUntilAction !== null && daysUntilAction > 0 && daysUntilAction <= 7 && (
                    <div className="text-[10px] font-medium text-purple-700 bg-purple-50/80 px-2.5 py-1.5 rounded-md mb-3 flex items-center border border-purple-100/50">
                        <Bell className="w-3 h-3 mr-1.5 text-purple-500" />
                        Seguimiento en {daysUntilAction} día{daysUntilAction !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Expected Close Date */}
                {deal.expectedClose && !isOverdue && daysUntilAction && daysUntilAction > 7 && (
                    <div className="text-[10px] font-medium text-gray-500 mb-3 flex items-center">
                        <Calendar className="w-3 h-3 mr-1.5 text-gray-400" />
                        Cierra en {formatDistanceToNow(new Date(deal.expectedClose))}
                    </div>
                )}

                {/* Contact Row with Quick Actions */}
                <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 ring-2 ring-white shadow-sm">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${deal.contactName}`} />
                            <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600 font-bold">{deal.contactName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-700 truncate max-w-[100px] leading-tight">{deal.contactName || 'Sin Contacto'}</span>
                            <span className="text-[9px] text-gray-400 font-medium">Hace {dealAge} días</span>
                        </div>
                    </div>

                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                        {deal.contactEmail && (
                            <a href={`mailto:${deal.contactEmail}`} className="p-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-md text-gray-400 transition-colors shadow-sm border border-gray-100" title="Enviar Email">
                                <Mail className="w-3.5 h-3.5" />
                            </a>
                        )}
                        {deal.contactPhone && (
                            <a href={`tel:${deal.contactPhone}`} className="p-1.5 bg-gray-50 hover:bg-green-50 hover:text-green-600 rounded-md text-gray-400 transition-colors shadow-sm border border-gray-100" title="Llamar">
                                <Phone className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
