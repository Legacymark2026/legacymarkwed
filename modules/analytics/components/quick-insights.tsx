'use client';

import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Target } from 'lucide-react';

import { Insight } from "@/modules/analytics/actions/analytics";

interface QuickInsightsProps {
    data?: Insight[];
}

const iconMap: Record<string, any> = {
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    'alert': AlertCircle,
    'target': Target,
};

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
    red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
};

export function QuickInsights({ data = [] }: QuickInsightsProps) {
    if (data.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Insights Inteligentes</h3>
                    <p className="text-xs text-gray-500">Generados por análisis de datos</p>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {data.map((insight) => {
                    const Icon = iconMap[insight.iconType] || Sparkles;
                    const colors = colorMap[insight.color] || colorMap.blue;

                    return (
                        <div
                            key={insight.id}
                            className={`p-4 rounded-xl border ${colors.border} bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all group`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${colors.bg} group-hover:scale-110 transition-transform`}>
                                    <Icon className={`h-4 w-4 ${colors.text}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                        {insight.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        {insight.description}
                                    </p>
                                    {insight.action && (
                                        <button className={`mt-2 text-xs font-medium ${colors.text} hover:underline`}>
                                            {insight.action} →
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
