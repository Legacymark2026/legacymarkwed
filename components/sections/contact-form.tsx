"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, Suspense } from "react";
import { useAnalytics } from "@/modules/analytics/components/analytics-provider";
import { useSearchParams } from "next/navigation";

const formSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    email: z.string().email("Email inválido."),
    company: z.string().optional(),
    message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
    consent: z.literal(true, {
        errorMap: () => ({ message: "Debes aceptar la política de privacidad." }),
    }),
});

type FormValues = z.infer<typeof formSchema>;

function ContactFormContent() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { trackEvent } = useAnalytics();
    const searchParams = useSearchParams();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    // Auto-fill message based on URL context from Calculators
    useEffect(() => {
        const subject = searchParams.get('subject');

        if (subject) {
            let prefill = "";

            // ROI Calculator Context
            const savings = searchParams.get('savings');
            const hours = searchParams.get('hours');
            if (savings && hours) {
                prefill = `Hola, vengo de la calculadora de ROI.\n\nSegún mis datos, mi empresa podría ahorrar $${savings} al año y recuperar ${hours} horas automatizando procesos.\n\nMe gustaría saber cómo pueden ayudarme a lograr esto.`;
            }

            // Project Estimator Context
            const budget = searchParams.get('budget');
            const type = searchParams.get('type');
            if (budget) {
                prefill = `Hola, vengo del estimador de proyectos.\n\nEstoy interesado en un proyecto tipo "${type}" con un presupuesto estimado de $${budget}.\n\nMe gustaría agendar una consultoría para revisar los detalles.`;
            }

            if (prefill) {
                setValue("message", prefill);
            }
        }
    }, [searchParams, setValue]);

    async function onSubmit(data: FormValues) {
        setIsSubmitting(true);

        try {
            // Trigger Automation Workflow
            const { triggerWorkflow } = await import("@/actions/automation");

            await triggerWorkflow('FORM_SUBMISSION', {
                email: data.email,
                name: data.name,
                message: data.message,
                company: data.company
            });

            // Track Lead in Analytics
            trackEvent('GENERATE_LEAD', {
                source: 'contact_form',
                email: data.email,
                company: data.company
            });

            console.log("Workflow Triggered");
            setIsSuccess(true);
            reset();
            setTimeout(() => setIsSuccess(false), 5000);
        } catch (error) {
            console.error("Error triggering workflow:", error);
            setIsSuccess(true);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
            {isSuccess ? (
                <div className="flex h-[400px] flex-col items-center justify-center text-center">
                    <div className="mb-4 text-4xl">✨</div>
                    <h3 className="text-2xl font-bold text-black">¡Mensaje Enviado!</h3>
                    <p className="mt-2 text-gray-600">Gracias por contactarnos. Te responderemos en breve.</p>
                    <Button className="mt-6" onClick={() => setIsSuccess(false)} variant="outline">Enviar otro mensaje</Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Nombre
                        </label>
                        <Input id="name" placeholder="Tu nombre" {...register("name")} className="bg-gray-50 border-gray-300 text-black focus:ring-black" />
                        {errors.name && (
                            <p className="text-xs text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <Input id="email" type="email" placeholder="tu@email.com" {...register("email")} className="bg-gray-50 border-gray-300 text-black focus:ring-black" />
                        {errors.email && (
                            <p className="text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="company" className="text-sm font-medium text-gray-700">
                            Empresa (Opcional)
                        </label>
                        <Input id="company" placeholder="Nombre de tu empresa" {...register("company")} className="bg-gray-50 border-gray-300 text-black focus:ring-black" />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-gray-700">
                            Mensaje
                        </label>
                        <Textarea
                            id="message"
                            placeholder="Cuéntanos sobre tu proyecto..."
                            className="min-h-[120px] bg-gray-50 border-gray-300 text-black focus:ring-black"
                            {...register("message")}
                        />
                        {errors.message && (
                            <p className="text-xs text-red-500">{errors.message.message}</p>
                        )}
                    </div>

                    <div className="flex items-start space-x-2">
                        <input
                            type="checkbox"
                            id="contact-consent"
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                            {...register("consent", { required: true })}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="contact-consent"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                            >
                                He leído y acepto la <a href="/politica-privacidad" className="underline hover:text-black">Política de Privacidad</a> y el tratamiento de mis datos.
                            </label>
                            {errors.consent && (
                                <p className="text-xs text-red-500">{errors.consent.message}</p>
                            )}
                        </div>
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                    </Button>
                </form>
            )}
        </div>
    );
}

export function ContactForm() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando formulario...</div>}>
            <ContactFormContent />
        </Suspense>
    );
}
