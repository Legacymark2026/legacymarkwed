'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { updateSettings } from "@/actions/settings";
import { SettingsSchema } from "@/lib/schemas";
import { Loader2, User, Globe, Bell, Palette, Languages } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useFacebookPixel } from "@/hooks/use-facebook-pixel";
import ImageUpload from "@/components/ui/image-upload";
import { toast } from "sonner";

interface SettingsFormProps {
    initialData: {
        firstName: string;
        lastName: string;
        phone: string;
        jobTitle: string;
        bio: string;
        linkedin: string;
        github: string;
        theme: "light" | "dark" | "system";
        language: "es" | "en" | "pt";
        emailNotifications: boolean;
        image?: string | null;
        timezone?: string;
        currency?: string;
    };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const router = useRouter();
    const { update } = useSession();
    const { setTheme: setSystemTheme, theme: currentSystemTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const { trackCustom } = useFacebookPixel();

    const form = useForm({
        resolver: zodResolver(SettingsSchema),
        defaultValues: {
            ...initialData,
            firstName: initialData.firstName || "",
            lastName: initialData.lastName || "",
            phone: initialData.phone || "",
            jobTitle: initialData.jobTitle || "",
            bio: initialData.bio || "",
            linkedin: initialData.linkedin || "",
            github: initialData.github || "",
            language: initialData.language || "es",
            image: initialData.image || null,
            timezone: initialData.timezone || "America/Bogota",
            currency: initialData.currency || "USD",
        },
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        const toastId = toast.loading("Guardando cambios...");
        try {
            const result = await updateSettings(data);
            trackCustom("SaveSettings", { section: "Profile" });

            if (result.success) {
                await update(); // Force session update

                if (data.theme) {
                    setSystemTheme(data.theme);
                }

                toast.success("Perfil actualizado", {
                    id: toastId,
                    description: "Tus ajustes han sido guardados exitosamente."
                });
                router.refresh();
            } else {
                toast.error("Error al guardar", { id: toastId, description: result.error });
            }
        } catch (e) {
            toast.error("Error de conexión", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Perfil y Preferencias</h2>
            </div>

            <div className="p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Sección: Información Personal */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-gray-900 font-medium">
                            <User size={18} className="text-gray-500" />
                            <h3>Información Personal</h3>
                        </div>

                        {/* Avatar Upload */}
                        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <div className="shrink-0">
                                {form.watch("image") ? (
                                    <img src={form.watch("image")!} alt="Avatar" className="w-20 h-20 rounded-full object-cover border border-gray-200 shadow-sm" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
                                        <User className="w-8 h-8 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <div className="w-full sm:w-auto flex-1 max-w-sm">
                                <label className="text-sm font-semibold mb-2 block">Foto de Perfil</label>
                                <ImageUpload
                                    value={form.watch("image") ? [form.watch("image")!] : []}
                                    onChange={(url) => {
                                        form.setValue("image", url, { shouldDirty: true });
                                        // Auto-save just the image change for better UX
                                        onSubmit(form.getValues());
                                    }}
                                    onRemove={() => form.setValue("image", null, { shouldDirty: true })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre</label>
                                <Input {...form.register("firstName")} placeholder="Tu nombre" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Apellido</label>
                                <Input {...form.register("lastName")} placeholder="Tu apellido" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cargo / Título</label>
                                <Input {...form.register("jobTitle")} placeholder="Ej. Senior Dev" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Teléfono</label>
                                <Input {...form.register("phone")} placeholder="+57 300..." />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Biografía</label>
                                <textarea
                                    {...form.register("bio")}
                                    className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                                    placeholder="Cuéntanos un poco sobre ti..."
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Sección: Redes Sociales */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-gray-900 font-medium">
                            <Globe size={18} className="text-gray-500" />
                            <h3>Enlaces Sociales</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">LinkedIn URL</label>
                                <Input {...form.register("linkedin")} placeholder="https://linkedin.com/in/..." />
                                {form.formState.errors.linkedin && <p className="text-xs text-red-500">{form.formState.errors.linkedin.message?.toString()}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">GitHub URL</label>
                                <Input {...form.register("github")} placeholder="https://github.com/..." />
                                {form.formState.errors.github && <p className="text-xs text-red-500">{form.formState.errors.github.message?.toString()}</p>}
                            </div>
                        </div>
                    </div>


                    <hr className="border-gray-100" />

                    {/* Sección: Preferencias */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-gray-900 font-medium">
                                <Palette size={18} className="text-gray-500" />
                                <h3>Apariencia</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        value="light"
                                        id="theme-light"
                                        {...form.register("theme")}
                                        className="text-black focus:ring-black"
                                    />
                                    <label htmlFor="theme-light">Claro</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        value="dark"
                                        id="theme-dark"
                                        {...form.register("theme")}
                                        className="text-black focus:ring-black"
                                    />
                                    <label htmlFor="theme-dark">Oscuro</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        value="system"
                                        id="theme-system"
                                        {...form.register("theme")}
                                        className="text-black focus:ring-black"
                                    />
                                    <label htmlFor="theme-system">Sistema</label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-4 text-gray-900 font-medium">
                                <Bell size={18} className="text-gray-500" />
                                <h3>Notificaciones</h3>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex h-5 items-center">
                                    <input
                                        id="email-notif"
                                        type="checkbox"
                                        {...form.register("emailNotifications")}
                                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                    />
                                </div>
                                <div className="text-sm">
                                    <label htmlFor="email-notif" className="font-medium text-gray-900">Notificaciones por Correo</label>
                                    <p className="text-gray-500">Recibe actualizaciones sobre actividad importante en tu cuenta.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Sección: Moneda y Zona Horaria */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-gray-900 font-medium">
                            <Languages size={18} className="text-gray-500" />
                            <h3>Localización y Preferencias Regionales</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Configura cómo quieres que se muestren los datos en tu sistema.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Zona Horaria (Timezone)</label>
                                <select
                                    {...form.register("timezone")}
                                    className="w-full p-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white"
                                >
                                    <option value="America/Bogota">Bogotá (GMT-5)</option>
                                    <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                                    <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
                                    <option value="Europe/Madrid">Madrid (GMT+1)</option>
                                    <option value="America/New_York">New York (EST)</option>
                                    <option value="UTC">UTC Universal</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Moneda Predeterminada</label>
                                <select
                                    {...form.register("currency")}
                                    className="w-full p-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white"
                                >
                                    <option value="USD">Dólar Estadounidense (USD)</option>
                                    <option value="EUR">Euro (EUR)</option>
                                    <option value="COP">Peso Colombiano (COP)</option>
                                    <option value="MXN">Peso Mexicano (MXN)</option>
                                </select>
                            </div>
                        </div>

                        <label className="text-sm font-medium mb-3 block">Idioma de la Interfaz</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <label
                                htmlFor="lang-es"
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${form.watch("language") === "es"
                                    ? "border-black bg-gray-50"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    value="es"
                                    id="lang-es"
                                    {...form.register("language")}
                                    className="sr-only"
                                />
                                <span className="text-2xl">🇪🇸</span>
                                <div>
                                    <p className="font-medium text-gray-900">Español</p>
                                    <p className="text-xs text-gray-500">Spanish</p>
                                </div>
                            </label>

                            <label
                                htmlFor="lang-en"
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${form.watch("language") === "en"
                                    ? "border-black bg-gray-50"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    value="en"
                                    id="lang-en"
                                    {...form.register("language")}
                                    className="sr-only"
                                />
                                <span className="text-2xl">🇺🇸</span>
                                <div>
                                    <p className="font-medium text-gray-900">English</p>
                                    <p className="text-xs text-gray-500">Inglés</p>
                                </div>
                            </label>

                            <label
                                htmlFor="lang-pt"
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${form.watch("language") === "pt"
                                    ? "border-black bg-gray-50"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    value="pt"
                                    id="lang-pt"
                                    {...form.register("language")}
                                    className="sr-only"
                                />
                                <span className="text-2xl">🇧🇷</span>
                                <div>
                                    <p className="font-medium text-gray-900">Português</p>
                                    <p className="text-xs text-gray-500">Portugués</p>
                                </div>
                            </label>
                        </div>
                        <p className="text-xs text-gray-400 mt-3">
                            ⚡ El cambio de idioma se aplicará después de guardar y recargar la página.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={loading} className="min-w-[150px]">
                            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
