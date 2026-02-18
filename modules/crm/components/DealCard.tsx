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
        <Card className={`mb-3 cursor-grab hover:shadow-md transition-all group relative border-l-4 ${isStagnant ? 'ring-1 ring-amber-400' : ''} ${isOverdue ? 'ring-1 ring-red-400' : ''}`} style={{ borderLeftColor: deal.priority === 'HIGH' ? '#ef4444' : deal.priority === 'MEDIUM' ? '#3b82f6' : '#e5e7eb' }}>
            <CardContent className="p-3">
                {/* Phase 15: Deal Age Badge & AI Score - Top Right Corner */}
                <div className="absolute top-1 right-1 flex gap-1">
                    <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${dealScore >= 70 ? 'bg-green-100 text-green-700' :
                                dealScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                            }`}
                        title={`AI Score: ${dealScore}/100`}
                    >
                        {dealScore}
                    </span>
                    <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {dealAge}d
                    </span>
                </div>

                {/* Header: Title, Stars, Source */}
                <div className="flex justify-between items-start mb-2 pr-10">
                    <div className="space-y-1 w-full">
                        <div className="flex justify-between items-start gap-1">
                            <h4 className="font-semibold text-sm line-clamp-2 leading-tight flex-1">{deal.title}</h4>
                            <div className="flex gap-1 shrink-0 items-center">
                                {/* Phase 15: Star Rating instead of Badge */}
                                <StarRating priority={deal.priority} />
                                {deal.source && deal.source !== 'Unknown' && (
                                    <Badge variant="outline" className="text-[10px] h-4 px-1 bg-blue-50 text-blue-700 border-blue-200">
                                        <Tag className="w-2 h-2 mr-0.5" />{deal.source}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        {/* Phase 15: Company Logo + Name */}
                        <div className="flex items-center gap-1.5">
                            <img
                                src={`https://logo.clearbit.com/${deal.company?.domain || deal.contactEmail?.split('@')[1] || 'example.com'}`}
                                alt=""
                                className="w-4 h-4 rounded-sm bg-gray-100"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <span className="text-xs text-muted-foreground truncate">{deal.company?.name || 'No Company'}</span>
                        </div>
                    </div>
                </div>

                {/* Value Row with Trend */}
                <div className="flex items-end justify-between mb-2">
                    <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(deal.value)}
                        </span>
                        {/* Phase 15: Value Trend Icon */}
                        {valueTrend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                        {valueTrend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="flex gap-1">
                        {isOverdue && (
                            <div className="flex items-center text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full" title="Overdue!">
                                <Calendar className="w-3 h-3 mr-1" />
                                Overdue
                            </div>
                        )}
                        {isStagnant && (
                            <div className="flex items-center text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full" title="Stagnant: > 7 days">
                                <Clock className="w-3 h-3 mr-1" />
                                {daysSinceAction}d
                            </div>
                        )}
                    </div>
                </div>

                {/* Phase 15: Next Action Reminder */}
                {daysUntilAction !== null && daysUntilAction > 0 && daysUntilAction <= 7 && (
                    <div className="text-[10px] text-purple-600 bg-purple-50 px-2 py-1 rounded mb-2 flex items-center">
                        <Bell className="w-3 h-3 mr-1" />
                        Follow up in {daysUntilAction} day{daysUntilAction !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Expected Close Date */}
                {deal.expectedClose && !isOverdue && daysUntilAction && daysUntilAction > 7 && (
                    <div className="text-[10px] text-gray-500 mb-2 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Closes {formatDistanceToNow(new Date(deal.expectedClose), { addSuffix: true })}
                    </div>
                )}

                {/* Probability Bar */}
                {deal.probability > 0 && (
                    <div className="mb-3 space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Probability</span>
                            <span>{deal.probability}%</span>
                        </div>
                        <Progress value={deal.probability} className="h-1.5" />
                    </div>
                )}

                {/* Contact Row with Quick Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-dashed">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${deal.contactName}`} />
                            <AvatarFallback className="text-[10px]">{deal.contactName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-gray-600 truncate max-w-[80px]">{deal.contactName?.split(' ')[0]}</span>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {deal.contactEmail && (
                            <a href={`mailto:${deal.contactEmail}`} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600" title="Email">
                                <Mail className="w-3.5 h-3.5" />
                            </a>
                        )}
                        {deal.contactPhone && (
                            <a href={`tel:${deal.contactPhone}`} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-green-600" title="Call">
                                <Phone className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
