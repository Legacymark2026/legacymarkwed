import { getHierarchy, getCustomObjectDefinitions } from "@/modules/crm/actions/crm";
import { HierarchyViewer } from "@/modules/crm/components/team-hierarchy";
import { Button } from "@/components/ui/button";
import { Plus, Database } from "lucide-react";
import { CreateTeamDialog } from "@/modules/crm/components/create-team-dialog";
import { CreateObjectDialog } from "@/modules/crm/components/create-object-dialog";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ArchitecturePage() {
    const session = await auth();
    const user = session?.user;

    // Fetch user's company
    const companyUser = user?.id ? await prisma.companyUser.findFirst({
        where: { userId: user.id }
    }) : null;

    // Fallback to a default company if no relation found (for dev/initial seed)
    // or just use what we found. 
    // Ideally we should handle the 'no company' case gracefully.
    const companyId = companyUser?.companyId;

    const hierarchy = await getHierarchy();
    const customObjects = await getCustomObjectDefinitions();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Arquitectura Empresarial</h1>
                    <p className="text-muted-foreground">Gestión de jerarquías de equipos y objetos personalizados.</p>
                </div>
                <CreateTeamDialog
                    companyId={companyId}
                    triggerButton={
                        <Button disabled={!companyId} title={!companyId ? "No company assigned" : ""}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Equipo Raíz
                        </Button>
                    }
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <h2 className="text-lg font-semibold mb-4">Jerarquía de Equipos</h2>
                    <HierarchyViewer data={hierarchy} />
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-4">Objetos Personalizados</h2>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Database className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-medium">Definiciones de Objetos</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                                Crea esquemas para Deals, Tickets, o Inventario personalizados.
                            </p>
                        </div>

                        <div className="w-full">
                            {companyId ? (
                                <CreateObjectDialog companyId={companyId} />
                            ) : (
                                <p className="text-xs text-red-500">Asigna una empresa a tu usuario para crear objetos.</p>
                            )}
                        </div>

                        <div className="w-full pt-4 border-t text-left space-y-2">
                            {customObjects.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center">No hay objetos definidos.</p>
                            ) : customObjects.map(obj => (
                                <Link key={obj.id} href={`/dashboard/admin/architecture/${obj.id}`}>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                                        <span className="font-medium text-sm">{obj.name}</span>
                                        {obj.description && <span className="text-xs text-gray-400 ml-2">{obj.description}</span>}
                                        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Activo</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
