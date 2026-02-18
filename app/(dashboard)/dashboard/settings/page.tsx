import { SettingsForm } from "@/components/settings-form";
import { IntegrationsForm } from "@/components/integrations-form";
import { getSettings } from "@/actions/settings";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrackPageEvent } from "@/modules/analytics/components/track-page-event";
import { MetaIntegrations } from "@/components/settings/meta-integrations";

// Force dynamic rendering to support OAuth callbacks
export const dynamic = 'force-dynamic';

export default async function SettingsPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const settings = await getSettings();

    if (!settings) {
        redirect("/auth/login");
    }

    const params = await searchParams;
    const defaultTab = params.tab === 'integrations' ? 'integrations' : 'profile';

    return (
        <div className="space-y-6">
            <TrackPageEvent eventName="ViewSettings" isCustom={true} />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                    <p className="text-gray-500 mt-2">Gestiona tu perfil, preferencias e integraciones.</p>
                </div>
            </div>

            <Tabs defaultValue={defaultTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Perfil y Preferencias</TabsTrigger>
                    <TabsTrigger value="integrations">Integraciones</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <SettingsForm initialData={{ ...settings, language: (settings as any).language || "es" }} />
                </TabsContent>

                <TabsContent value="integrations" className="space-y-8">
                    <MetaIntegrations />

                    <div className="border-t border-gray-100 pt-6">
                        <IntegrationsForm initialData={settings} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
