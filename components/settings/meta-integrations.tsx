
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
    const isFacebookConfigured = fb?.isConfigured;

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
                            <IntegrationConfigDialog provider="facebook" title="Meta" />
                            {isFacebookConnected ? (
                                <MetaDisconnectButton provider="facebook" />
                            ) : (
                                isFacebookConfigured ? (
                                    <MetaConnectButton provider="facebook" />
                                ) : (
                                    <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded">
                                        Missing Env Vars
                                    </span>
                                )
                            )}
                        </div>
                    </div>
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
