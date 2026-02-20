

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, BarChart3, ExternalLink, CheckCircle2, Activity, Hash } from "lucide-react";
import { IntegrationConfigDialog } from "./integration-config-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { getIntegrationConfig } from "@/actions/integration-config";

export async function GoogleIntegrations() {
    // Fetch DB Config for Google Analytics
    const gaConfig = await getIntegrationConfig('google-analytics');

    // Check if GA4 is configured
    const isGaConfigured = !!gaConfig?.propertyId && !!gaConfig?.clientEmail;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Google Ecosystem</h2>
                    <p className="text-sm text-muted-foreground mt-1">Connect analytics and tracking tools.</p>
                </div>
                {/* Overall Status Badge (Optional, can just show individual) */}
            </div>

            <Separator className="bg-gradient-to-r from-gray-200 to-transparent" />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {/* Google Analytics 4 Card */}
                <Card className="group border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F9AB00] to-orange-400"></div>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-orange-50 rounded-xl">
                                <BarChart3 className="w-8 h-8 text-[#F9AB00]" />
                            </div>
                            <StatusBadge status={isGaConfigured ? 'connected' : 'disconnected'} pulse={isGaConfigured} />
                        </div>
                        <CardTitle className="mt-4 text-lg font-bold text-gray-900">Google Analytics 4</CardTitle>
                        <CardDescription className="text-sm">
                            Backend API integration for server-side event tracking.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Track server-side events</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Conversion API support</span>
                            </div>
                        </div>

                        {isGaConfigured && (
                            <div className="mt-4 p-3 bg-orange-50/50 border border-orange-100 rounded-lg">
                                <div className="flex gap-2 items-center text-xs text-orange-800">
                                    <Globe className="w-3.5 h-3.5" />
                                    Property ID: <span className="font-mono font-semibold">{gaConfig?.propertyId}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-3 border-t bg-gray-50/50 flex justify-end items-center gap-2">
                        <a
                            href="https://analytics.google.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 mr-auto transition-colors"
                        >
                            Console <ExternalLink className="w-3 h-3" />
                        </a>
                        <IntegrationConfigDialog provider="google-analytics" title="Google Analytics 4" />
                    </CardFooter>
                </Card>


                {/* Google Tag Manager Card */}
                <Card className="group border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-teal-400"></div>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-blue-50 rounded-xl">
                                <Activity className="w-8 h-8 text-blue-600" />
                            </div>
                            <StatusBadge status={!!gaConfig?.containerId ? 'connected' : 'disconnected'} pulse={!!gaConfig?.containerId} />
                        </div>
                        <CardTitle className="mt-4 text-lg font-bold text-gray-900">Google Tag Manager</CardTitle>
                        <CardDescription className="text-sm">
                            Manage all your website tags without editing code.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Tag management system</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Fast tag deployment</span>
                            </div>
                        </div>

                        {!!gaConfig?.containerId && (
                            <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                <div className="flex gap-2 items-center text-xs text-blue-800">
                                    <Hash className="w-3.5 h-3.5" />
                                    Container ID: <span className="font-mono font-semibold">{gaConfig.containerId}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-3 border-t bg-gray-50/50 flex justify-end items-center gap-2">
                        <a
                            href="https://tagmanager.google.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 mr-auto transition-colors"
                        >
                            Console <ExternalLink className="w-3 h-3" />
                        </a>
                        <IntegrationConfigDialog provider="google-tag-manager" title="Google Tag Manager" />
                    </CardFooter>
                </Card>
            </div>

        </div>
    );
}
