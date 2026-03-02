import { AdvancedUserDirectory } from "@/components/settings/advanced-user-directory";
import { RolesPermissionsEditor } from "@/components/settings/roles-permissions-editor";
import { CustomFieldsBuilder } from "@/components/settings/custom-fields-builder";

export const dynamic = 'force-dynamic';

export default function SettingsMembersPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-10">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 border-b border-slate-200 pb-4">
                    Equipo, Roles y Formularios
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                    Gestiona los accesos de tu equipo (RBAC) y estructura la información requerida en tus proesos comerciales.
                </p>
            </div>

            <section className="space-y-4">
                <AdvancedUserDirectory />
            </section>

            <section className="space-y-4 pt-4">
                <RolesPermissionsEditor />
            </section>

            <section className="space-y-4 pt-4">
                <CustomFieldsBuilder />
            </section>
        </div>
    );
}
