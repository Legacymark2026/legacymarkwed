"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { loginUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending} className="w-full flex justify-center py-2 px-4">
            {pending ? "Iniciando..." : "Entrar"}
        </Button>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const [errorMessage, dispatch, isPending] = useActionState(loginUser, undefined);

    useEffect(() => {
        // If form was submitted (isPending was true) and there's no error, redirect
        if (!isPending && errorMessage === undefined) {
            // Check if we actually submitted the form (not just initial render)
            const hasSubmitted = sessionStorage.getItem('loginAttempted');
            if (hasSubmitted) {
                sessionStorage.removeItem('loginAttempted');
                router.push('/dashboard');
            }
        }
    }, [errorMessage, isPending, router]);

    const handleSubmit = (formData: FormData) => {
        sessionStorage.setItem('loginAttempted', 'true');
        dispatch(formData);
    };

    return (
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Iniciar Sesión</h2>
                <p className="mt-2 text-sm text-gray-600">
                    ¿No tienes una cuenta?{' '}
                    <Link href="/auth/register" className="font-medium text-black hover:text-gray-800">
                        Regístrate gratis
                    </Link>
                </p>
            </div>

            <form action={handleSubmit} className="space-y-6">
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center text-sm">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <p>{errorMessage}</p>
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Contraseña
                    </label>
                    <div className="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                            Recordarme
                        </label>
                    </div>

                    <div className="text-sm">
                        <Link href="/auth/recuperar" className="font-medium text-black hover:text-gray-800">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </div>

                <div>
                    <SubmitButton />
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500">O continuar con</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button type="button" disabled className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50 disabled:opacity-50">
                        Google
                    </button>
                    <button type="button" disabled className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50 disabled:opacity-50">
                        LinkedIn
                    </button>
                </div>
            </div>
        </div>
    );
}
