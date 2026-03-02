import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { TwoFactorToggle } from "@/components/settings/two-factor-toggle";
import { SessionManagementTable } from "@/components/settings/session-management-table";
import { DangerZone } from "@/components/settings/danger-zone";
import { LoginHistoryTable } from "@/components/settings/login-history-table";
import { BackupCodesModal } from "@/components/settings/backup-codes-modal";
import { PasswordPolicies } from "@/components/settings/password-policies";

export const dynamic = 'force-dynamic';

export default function SettingsSecurityPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-10">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 border-b border-slate-200 pb-4">
                    Seguridad y Accesos
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                    Gestiona tu contraseña, autenticación de dos factores y sesiones activas.
                </p>
            </div>

            <section className="space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Contraseña</h3>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                    <ChangePasswordForm />
                </div>
                <PasswordPolicies />
            </section>

            <section className="space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Doble Autenticación</h3>
                <TwoFactorToggle />
                <BackupCodesModal />
            </section>

            <section className="space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Sesiones Activas</h3>
                <SessionManagementTable />
            </section>

            <section className="space-y-4 pt-4">
                <LoginHistoryTable />
            </section>

            <section className="space-y-4 pt-8">
                <DangerZone />
            </section>
        </div>
    );
}
