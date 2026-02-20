

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ExternalLink, CheckCircle2, Flame, Hash } from "lucide-react";
import { IntegrationConfigDialog } from "./integration-config-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { getIntegrationConfig } from "@/actions/integration-config";

export async function HotjarIntegrations() {
    // Fetch DB Config for Hotjar
    const config = await getIntegrationConfig('hotjar');
    const isConfigured = !!config?.siteId;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Behavior Analytics</h2>
                    <p className="text-sm text-muted-foreground mt-1">Understand how users experience your site.</p>
                </div>
            </div>

            <Separator className="bg-gradient-to-r from-gray-200 to-transparent" />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {/* Hotjar Card */}
                <Card className="group border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FD3259] to-rose-400"></div>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-rose-50 rounded-xl">
                                <Flame className="w-8 h-8 text-[#FD3259]" />
                            </div>
                            <StatusBadge status={isConfigured ? 'connected' : 'disconnected'} pulse={isConfigured} />
                        </div>
                        <CardTitle className="mt-4 text-lg font-bold text-gray-900">Hotjar</CardTitle>
                        <CardDescription className="text-sm">
                            Heatmaps, recordings, and feedback polls.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Visualize user behavior</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Gather instant feedback</span>
                            </div>
                        </div>

                        {isConfigured && (
                            <div className="mt-4 p-3 bg-rose-50/50 border border-rose-100 rounded-lg">
                                <div className="flex gap-2 items-center text-xs text-rose-800">
                                    <Hash className="w-3.5 h-3.5" />
                                    Site ID: <span className="font-mono font-semibold">{config.siteId}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-3 border-t bg-gray-50/50 flex justify-end items-center gap-2">
                        <a
                            href="https://insights.hotjar.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 mr-auto transition-colors"
                        >
                            Insights <ExternalLink className="w-3 h-3" />
                        </a>
                        <IntegrationConfigDialog provider="hotjar" title="Hotjar" />
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
