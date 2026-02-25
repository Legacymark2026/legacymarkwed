import { SettingsForm } from "@/components/settings-form";
import { IntegrationsForm } from "@/components/integrations-form";
import { getSettings } from "@/actions/settings";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrackPageEvent } from "@/modules/analytics/components/track-page-event";
import { GoogleIntegrations } from "@/components/settings/google-integrations";
import { MetaIntegrations } from "@/components/settings/meta-integrations";
import { HotjarIntegrations } from "@/components/settings/hotjar-integrations";
import { ChangePasswordForm } from "@/components/settings/change-password-form";

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
    const defaultTab = params.tab === 'integrations'
        ? 'integrations'
        : params.tab === 'security'
            ? 'security'
            : 'profile';

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
                    <TabsTrigger value="security">Seguridad</TabsTrigger>
                    <TabsTrigger value="integrations">Integraciones</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <SettingsForm initialData={{ ...settings, language: (settings as any).language || "es" }} />
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <ChangePasswordForm />
                </TabsContent>

                <TabsContent value="integrations" className="space-y-8">
                    <MetaIntegrations />
                    <GoogleIntegrations />
                    <HotjarIntegrations />
                </TabsContent>
            </Tabs>
        </div>
    );
}
