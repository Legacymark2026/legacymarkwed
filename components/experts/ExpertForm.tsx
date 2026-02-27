"use client";

import { useState, KeyboardEvent, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ui/image-upload";
import { SocialLinksInput } from "@/components/ui/social-links-input";
import { Loader2, User, Briefcase, Hash, Info, X, Sparkles, CheckCircle2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const expertSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters.").max(100, "Name is too long."),
    role: z.string().min(2, "Role is required.").max(100, "Role is too long."),
    bio: z.string().max(500, "Bio must be 500 characters or less.").optional(),
    imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
    socialLinks: z.array(z.object({
        platform: z.string(),
        url: z.string().url("Must be a valid URL."),
    })).optional(),
    badgeId: z.string().optional(),
    iconName: z.string().optional(),
    skills: z.array(z.string()).default([]), // Now handling strictly as array internally
    isVisible: z.boolean().default(true),
});

type ExpertFormValues = z.infer<typeof expertSchema>;

interface ExpertFormProps {
    initialData?: Omit<ExpertFormValues, "skills"> & { skills?: string };
    onSubmit: (data: any) => Promise<void>; // Any due to the string conversion needed by parent for legacy reasons
    onCancel: () => void;
    isLoading: boolean;
}

export function ExpertForm({ initialData, onSubmit, onCancel, isLoading }: ExpertFormProps) {
    // Determine initial skills array from legacy comma-separated string if provided
    const initialSkillsArray = useMemo(() => {
        if (!initialData?.skills) return [];
        return initialData.skills.split(',').map(s => s.trim()).filter(Boolean);
    }, [initialData?.skills]);

    const form = useForm<ExpertFormValues>({
        resolver: zodResolver(expertSchema) as any,
        defaultValues: {
            name: initialData?.name || "",
            role: initialData?.role || "",
            bio: initialData?.bio || "",
            imageUrl: initialData?.imageUrl || "",
            socialLinks: initialData?.socialLinks || [],
            badgeId: initialData?.badgeId || "",
            iconName: initialData?.iconName || "",
            skills: initialSkillsArray,
            isVisible: initialData?.isVisible ?? true,
        },
    });

    const [skillInput, setSkillInput] = useState("");
    const watchIconName = form.watch("iconName");
    const watchBio = form.watch("bio");

    // Dynamic Icon Preview
    const IconComponent = useMemo(() => {
        if (!watchIconName) return null;
        // @ts-ignore
        const Icon = LucideIcons[watchIconName];
        return Icon ? Icon : null;
    }, [watchIconName]);

    // Handle Skill Pills Addition
    const handleAddSkill = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newSkill = skillInput.trim();
            if (newSkill && newSkill.length > 0) {
                const currentSkills = form.getValues("skills");
                if (!currentSkills.includes(newSkill)) {
                    form.setValue("skills", [...currentSkills, newSkill], { shouldDirty: true });
                }
                setSkillInput("");
            }
        }
    };

    const removeSkill = (skillToRemove: string) => {
        const currentSkills = form.getValues("skills");
        form.setValue("skills", currentSkills.filter(s => s !== skillToRemove), { shouldDirty: true });
    };

    // Auto-Format Badge ID (Uppercase) on Blur
    const handleBadgeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val) {
            form.setValue("badgeId", val.toUpperCase(), { shouldValidate: true });
        }
    };

    // Prepare data for submit
    const handleSubmit = async (data: ExpertFormValues) => {
        // Parent component expects skills as string for legacy handling
        const submitData = {
            ...data,
            skills: data.skills.join(", ")
        };
        await onSubmit(submitData);
    };

    return (
        <TooltipProvider>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 pb-8">

                    {/* SECTION 1: Basic Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <User className="w-5 h-5 text-teal-600" />
                            <h3 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">Información Básica</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre Completo</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input className="pl-9 bg-slate-50/50 focus:bg-white transition-colors" placeholder="Ej. Alex Rivera" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rol / Posición</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input className="pl-9 bg-slate-50/50 focus:bg-white transition-colors" placeholder="Ej. Head of Engineering" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => {
                                const bioLength = watchBio?.length || 0;
                                const isApproachingLimit = bioLength > 450;
                                const isOverLimit = bioLength > 500;

                                return (
                                    <FormItem>
                                        <FormLabel>Biografía Corta</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="resize-none bg-slate-50/50 focus:bg-white transition-colors"
                                                placeholder="Breve descripción del perfil..."
                                                {...field}
                                                rows={3}
                                            />
                                        </FormControl>
                                        <div className="flex justify-between items-center mt-1">
                                            <FormMessage />
                                            <div className="flex-1" />
                                            {/* Smart Progress Bar */}
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all duration-300",
                                                            isOverLimit ? "bg-red-500" : isApproachingLimit ? "bg-amber-400" : "bg-teal-500"
                                                        )}
                                                        style={{ width: `${Math.min((bioLength / 500) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-medium tabular-nums",
                                                    isOverLimit ? "text-red-500" : isApproachingLimit ? "text-amber-500" : "text-gray-400"
                                                )}>
                                                    {bioLength}/500
                                                </span>
                                            </div>
                                        </div>
                                    </FormItem>
                                );
                            }}
                        />
                    </div>

                    {/* SECTION 2: Visual Identity */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mt-6">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            <h3 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">Identidad & Habilidades</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="badgeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-1.5">
                                            <FormLabel>Badge ID</FormLabel>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3.5 w-3.5 text-gray-400 hover:text-slate-700 transition-colors cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>Identificador oficial interno (Ej: OP-01)</TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    className="pl-9 font-mono uppercase bg-slate-50/50 focus:bg-white"
                                                    placeholder="Ej. OP-01"
                                                    {...field}
                                                    onBlur={(e) => {
                                                        field.onBlur();
                                                        handleBadgeBlur(e);
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="iconName"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-1.5">
                                            <FormLabel>Icono (Lucide)</FormLabel>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3.5 w-3.5 text-gray-400 hover:text-slate-700 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>Escribe el nombre de un icono de <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="underline">lucide.dev</a></TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                {/* ICON REAL-TIME PREVIEW */}
                                                <div className="absolute left-3 top-2.5 flex items-center justify-center text-teal-600 font-bold">
                                                    {IconComponent ? <IconComponent size={16} /> : <div className="h-4 w-4 border border-dashed border-gray-300 rounded-sm" />}
                                                </div>
                                                <Input className="pl-9 bg-slate-50/50 focus:bg-white" placeholder="Ej. Shield, Rocket" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Interactive Skills System */}
                        <FormField
                            control={form.control}
                            name="skills"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-1.5">
                                        <FormLabel>Habilidades Clave (Skills)</FormLabel>
                                        <FormDescription className="text-xs m-0">Presiona Enter o Coma para agregar</FormDescription>
                                    </div>
                                    <FormControl>
                                        <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                <AnimatePresence>
                                                    {field.value.map((skill) => (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            key={skill}
                                                            className="flex items-center gap-1 bg-white border border-slate-200 shadow-sm px-2.5 py-1 rounded-full text-xs font-medium text-slate-700 group hover:border-teal-300 transition-colors"
                                                        >
                                                            {skill}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSkill(skill)}
                                                                className="text-slate-400 hover:text-red-500 focus:outline-none bg-slate-50 hover:bg-red-50 rounded-full p-0.5 ml-1 transition-colors"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                            <Input
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyDown={handleAddSkill}
                                                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 text-sm"
                                                placeholder="Ej. Strategy, React, Ventas..."
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem className="pt-2">
                                    <FormLabel>Fotografía / Avatar</FormLabel>
                                    <FormControl>
                                        <div className="p-1 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                            <ImageUpload
                                                value={field.value ? [field.value] : []}
                                                disabled={isLoading}
                                                onChange={(url) => field.onChange(url)}
                                                onRemove={() => field.onChange("")}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* SECTION 3: Social & Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mt-6">
                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
                            <h3 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">Redes & Ajustes</h3>
                        </div>

                        <FormField
                            control={form.control}
                            name="socialLinks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Enlaces Sociales</FormLabel>
                                    <FormControl>
                                        <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                                            <SocialLinksInput
                                                value={field.value || []}
                                                onChange={field.onChange}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isVisible"
                            render={({ field }) => (
                                <FormItem className={cn(
                                    "flex flex-row items-center justify-between rounded-xl border p-4 shadow-sm transition-all duration-300",
                                    field.value ? "border-teal-200 bg-teal-50/30" : "border-gray-200 bg-gray-50"
                                )}>
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base font-semibold flex items-center gap-2">
                                            Estado Público
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className={cn(
                                                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                                    field.value ? "bg-teal-400" : "hidden"
                                                )}></span>
                                                <span className={cn(
                                                    "relative inline-flex rounded-full h-2.5 w-2.5",
                                                    field.value ? "bg-teal-500" : "bg-gray-400"
                                                )}></span>
                                            </span>
                                        </FormLabel>
                                        <FormDescription className={field.value ? "text-teal-700/70" : "text-gray-500"}>
                                            {field.value
                                                ? "Visible: Aparecerá listado en la web."
                                                : "Oculto: Solo tú puedes verlo aquí."}
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-teal-500"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Floater footer actions */}
                    <div className="sticky bottom-0 left-0 right-0 p-4 -mx-6 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-end gap-3 rounded-b-lg shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading} className="hover:bg-gray-100 rounded-xl">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 shadow-md hover:shadow-lg transition-all">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : "Guardar Operativo"}
                        </Button>
                    </div>
                </form>
            </Form>
        </TooltipProvider>
    );
}
