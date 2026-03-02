import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { TrackPageEvent } from "@/modules/analytics/components/track-page-event";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <TrackPageEvent eventName="ViewSettings" isCustom={true} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                <div className="hidden lg:block mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Configuración</h1>
                    <p className="text-slate-500 mt-2 font-medium">Gestiona tu perfil, preferencias del sistema e integraciones empresariales.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    <SettingsSidebar />

                    <main className="flex-1 min-w-0 pb-20 lg:pb-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
