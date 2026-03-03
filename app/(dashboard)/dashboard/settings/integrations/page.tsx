import { GoogleIntegrations } from "@/components/settings/google-integrations";
import { MetaIntegrations } from "@/components/settings/meta-integrations";
import { HotjarIntegrations } from "@/components/settings/hotjar-integrations";

import { IntegrationsToastHandler } from "@/components/settings/integrations-toast-handler";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default function SettingsIntegrationsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-10">
            <Suspense fallback={null}>
                <IntegrationsToastHandler />
            </Suspense>
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 border-b border-slate-200 pb-4">
                    App Store de Integraciones
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                    Conecta tus herramientas favoritas para sincronizar contactos, leads y análisis con tu CRM.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <MetaIntegrations />
                <GoogleIntegrations />
                <HotjarIntegrations />
            </div>
        </div>
    );
}
