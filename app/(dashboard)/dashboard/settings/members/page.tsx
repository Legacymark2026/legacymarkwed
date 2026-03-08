import { AdvancedUserDirectory } from "@/components/settings/advanced-user-directory";
import { RolesPermissionsEditor } from "@/components/settings/roles-permissions-editor";
import { CustomFieldsBuilder } from "@/components/settings/custom-fields-builder";
import { fetchCustomFields } from "@/app/actions/crm-settings";
import { getUsers, getCustomRoles } from "@/actions/admin";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function SettingsMembersPage() {
    const fields = await fetchCustomFields() || [];
    const usersRes = await getUsers();
    const rolesRes = await getCustomRoles();
    const customRoles = rolesRes.success ? rolesRes.roles : [];
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    return (
        <div className="ds-page space-y-8 pb-10">
            {/* Header */}
            <div className="pb-6" style={{ borderBottom: '1px solid rgba(30,41,59,0.8)' }}>
                <div className="mb-3">
                    <span className="ds-badge ds-badge-teal">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
                        </span>
                        IAM &amp; RBAC SETTINGS
                    </span>
                </div>
                <h2 className="ds-heading-page">Equipo, Roles y Formularios</h2>
                <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest mt-2">
                    Gestiona accesos RBAC &middot; Configura permisos granulares &middot; Estructura campos comerciales
                </p>
            </div>

            <section className="space-y-4">
                <AdvancedUserDirectory
                    initialUsers={'users' in usersRes ? usersRes.users || [] : []}
                    customRoles={customRoles}
                />
            </section>

            <section className="space-y-4">
                <RolesPermissionsEditor customRoles={customRoles} currentUserRole={userRole} />
            </section>

            <section className="space-y-4">
                <CustomFieldsBuilder initialData={fields} />
            </section>
        </div>
    );
}
