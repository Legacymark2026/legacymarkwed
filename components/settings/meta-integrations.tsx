
import { getConnectedIntegrations } from "@/actions/integrations";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Facebook, MessageSquare, ExternalLink, CheckCircle2, AlertCircle, Activity, Hash } from "lucide-react";
import { MetaConnectButton } from "./meta-connect-button";
import { MetaDisconnectButton } from "./meta-disconnect-button";
import { IntegrationConfigDialog } from "./integration-config-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";

export async function MetaIntegrations() {
    const integrations = await getConnectedIntegrations();
    const fb = integrations.find(i => i.provider === 'facebook');
    const isFacebookConnected = fb?.connected;

    // Fetch DB Config specifically for Facebook to get the App ID
    const { getIntegrationConfig } = await import("@/actions/integration-config");
    const fbConfig = await getIntegrationConfig('facebook');
    const waConfig = await getIntegrationConfig('whatsapp');

    // Check if WhatsApp is configured (has Phone ID and Access Token)
    const isWhatsappConfigured = !!waConfig?.phoneNumberId && !!waConfig?.accessToken;

    const dbAppId = fbConfig?.appId;

    // Use DB AppID or fallback to Env Var (for button)
    const activeAppId = dbAppId || process.env.FACEBOOK_CLIENT_ID || "";

    // Smart Redirect URI Calculation
    let serverOrigin = "";
    if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")) {
        serverOrigin = process.env.NEXTAUTH_URL;
    } else if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        serverOrigin = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    // If we have a valid server origin, construct the URI, otherwise undefined (let client handle it)
    const computedRedirectUri = serverOrigin ? `${serverOrigin}/api/integrations/facebook/callback` : undefined;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Meta Ecosystem</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your connection to Facebook, Instagram, and WhatsApp.</p>
                </div>
                <div className="flex gap-2">
                    <StatusBadge status={isFacebookConnected && isWhatsappConfigured ? 'connected' : 'loading'} />
                </div>
            </div>

            <Separator className="bg-gradient-to-r from-gray-200 to-transparent" />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {/* Meta / Facebook Card */}
                <Card className="group border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1877F2] to-blue-400"></div>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-blue-50 rounded-xl">
                                <Facebook className="w-8 h-8 text-[#1877F2]" />
                            </div>
                            <StatusBadge status={isFacebookConnected ? 'connected' : 'disconnected'} />
                        </div>
                        <CardTitle className="mt-4 text-lg font-bold text-gray-900">Facebook & Instagram</CardTitle>
                        <CardDescription className="text-sm">
                            Social Graph API connection for Pages, Messages, and Ads.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Read public page data</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Manage inbox messages</span>
                            </div>
                        </div>

                        {!isFacebookConnected && activeAppId && (
                            <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                <div className="flex gap-2 items-start">
                                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-blue-800">Setup Required</p>
                                        <p className="text-[11px] text-blue-700 leading-tight">
                                            Ensure your App is in <strong>Live Mode</strong>. Redirect URI:
                                        </p>
                                        <code className="block mt-1 p-1.5 bg-white rounded border border-blue-200 text-[10px] font-mono break-all text-blue-900">
                                            {computedRedirectUri || "Loading..."}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-3 border-t bg-gray-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {activeAppId && (
                                <Badge variant="outline" className="font-mono text-[10px] text-gray-500 bg-white">
                                    ID: {activeAppId.slice(0, 4)}...{activeAppId.slice(-4)}
                                </Badge>
                            )}
                            <IntegrationConfigDialog provider="facebook" title="Meta" />
                        </div>
                        {isFacebookConnected ? (
                            <MetaDisconnectButton provider="facebook" />
                        ) : (
                            <MetaConnectButton
                                provider="facebook"
                                appId={activeAppId}
                                redirectUri={computedRedirectUri}
                            />
                        )}
                    </CardFooter>
                </Card>

                {/* WhatsApp Business Card */}
                <Card className="group border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#25D366] to-emerald-400"></div>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-green-50 rounded-xl">
                                <MessageSquare className="w-8 h-8 text-[#25D366]" />
                            </div>
                            <StatusBadge status={isWhatsappConfigured ? 'connected' : 'disconnected'} pulse={isWhatsappConfigured} />
                        </div>
                        <CardTitle className="mt-4 text-lg font-bold text-gray-900">WhatsApp Business</CardTitle>
                        <CardDescription className="text-sm">
                            Cloud API integration for high-volume messaging and automation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Send automated templates</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Receive realtime webhooks</span>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Monthly Usage</span>
                                <span className="font-medium text-gray-900">0 / 1000</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-emerald-500 h-1.5 rounded-full w-[0%]"></div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-3 border-t bg-gray-50/50 flex justify-end items-center gap-2">
                        <a
                            href="https://developers.facebook.com/apps"
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 mr-auto transition-colors"
                        >
                            Console <ExternalLink className="w-3 h-3" />
                        </a>
                        <IntegrationConfigDialog provider="whatsapp" title="WhatsApp Business" />
                    </CardFooter>
                </Card>


                {/* Facebook Pixel Card */}
                <Card className="group border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden relative col-span-1 md:col-span-2">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-indigo-50 rounded-xl">
                                <Activity className="w-8 h-8 text-indigo-600" />
                            </div>
                            <StatusBadge status={fbConfig?.pixelId ? 'connected' : 'disconnected'} pulse={!!fbConfig?.pixelId} />
                        </div>
                        <CardTitle className="mt-4 text-lg font-bold text-gray-900">Meta Pixel (Facebook Pixel)</CardTitle>
                        <CardDescription className="text-sm">
                            Track website visitor actions and measure ad performance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3 grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Track page views & events</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Audience retargeting</span>
                            </div>
                        </div>

                        {fbConfig?.pixelId && (
                            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg flex flex-col justify-center">
                                <div className="flex gap-2 items-center text-xs text-indigo-800">
                                    <Hash className="w-3.5 h-3.5" />
                                    Pixel ID: <span className="font-mono font-semibold">{fbConfig.pixelId}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-3 border-t bg-gray-50/50 flex justify-end items-center gap-2">
                        <a
                            href="https://events_manager2.facebook.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 mr-auto transition-colors"
                        >
                            Events Manager <ExternalLink className="w-3 h-3" />
                        </a>
                        <IntegrationConfigDialog provider="facebook-pixel" title="Meta Pixel" />
                    </CardFooter>
                </Card>
            </div>

        </div>
    );
}
