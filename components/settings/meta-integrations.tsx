
import { getConnectedIntegrations, disconnectIntegration } from "@/actions/integrations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Facebook, MessageSquare } from "lucide-react";
import { MetaConnectButton } from "./meta-connect-button";
import { MetaDisconnectButton } from "./meta-disconnect-button";
import { IntegrationConfigDialog } from "./integration-config-dialog";

export async function MetaIntegrations() {
    const integrations = await getConnectedIntegrations();
    const fb = integrations.find(i => i.provider === 'facebook');
    const isFacebookConnected = fb?.connected;

    // Fetch DB Config specifically for Facebook to get the App ID
    const { getIntegrationConfig } = await import("@/actions/integration-config");
    const fbConfig = await getIntegrationConfig('facebook');
    const dbAppId = fbConfig?.appId;

    // Use DB AppID or fallback to Env Var (for button)
    const activeAppId = dbAppId || process.env.FACEBOOK_CLIENT_ID || "";

    return (
        <div className="grid gap-6">
            {/* Meta / Facebook */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex flex-col space-y-1">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Facebook className="h-5 w-5 text-blue-600" />
                            Meta (Facebook & Instagram)
                        </CardTitle>
                        <CardDescription>
                            Connect to allow access to Pages, Inbox messaging, and Ads Manager.
                        </CardDescription>
                    </div>
                    {isFacebookConnected ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Connected</Badge>
                    ) : (
                        <Badge variant="outline">Not Connected</Badge>
                    )}
                </CardHeader>
                <CardContent className="grid gap-4 pt-4">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex flex-col">
                            <span className="font-medium">Permissions</span>
                            <span className="text-muted-foreground text-xs">Read Pages, Manage Messages, Read Ads.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {activeAppId && (
                                <div className="hidden md:flex items-center gap-2 mr-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-100">
                                    <span className="text-xs text-gray-500 font-medium">App ID:</span>
                                    <code className="text-xs font-mono text-gray-700">
                                        {activeAppId.slice(0, 4)}••••{activeAppId.slice(-4)}
                                    </code>
                                </div>
                            )}
                            <IntegrationConfigDialog provider="facebook" title="Meta" />
                            {isFacebookConnected ? (
                                <MetaDisconnectButton provider="facebook" />
                            ) : (
                                <MetaConnectButton
                                    provider="facebook"
                                    appId={activeAppId}
                                />
                            )}
                        </div>
                    </div>

                    {!isFacebookConnected && activeAppId && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md flex gap-3 items-start">
                            <div className="mt-0.5">
                                <Facebook className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-xs text-blue-800">
                                <p className="font-semibold mb-1">¿Error "Función no disponible"?</p>
                                <p>
                                    Esto ocurre cuando tu App de Facebook está en <strong>Modo Desarrollo</strong>.
                                    Ve al <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-950">Panel de Desarrolladores</a>, selecciona tu App y cambia el modo a <strong>En vivo</strong> (Live).
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Coming Soon - WhatsApp */}
            <Card className="opacity-60 bg-gray-50 border-dashed">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-500">
                        <MessageSquare className="h-5 w-5" />
                        WhatsApp Business API
                    </CardTitle>
                    <CardDescription>Direct integration with WhatsApp Cloud API (Coming Soon).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end">
                        <IntegrationConfigDialog provider="whatsapp" title="WhatsApp" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
