"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordReset } from "@/actions/auth";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 px-6 rounded-xl font-semibold text-sm tracking-wide hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20"
        >
            {pending ? (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando enlace...
                </>
            ) : (
                <>
                    <Mail size={16} />
                    Enviar enlace de recuperación
                </>
            )}
        </button>
    );
}

export default function RecuperarContrasenaPage() {
    const [state, dispatch] = useActionState(requestPasswordReset, undefined);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-100/60 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-md"
            >
                {/* Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    {/* Top accent */}
                    <div className="h-1 bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400" />

                    <div className="p-8">
                        {/* Back link */}
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            Volver al inicio de sesión
                        </Link>

                        <AnimatePresence mode="wait">
                            {state?.success ? (
                                /* ── Success State ── */
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-4"
                                >
                                    <div className="flex justify-center mb-6">
                                        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center">
                                            <CheckCircle size={40} className="text-teal-500" />
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-3">
                                        ¡Revisa tu email!
                                    </h2>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                        Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                                    </p>
                                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left">
                                        <p className="text-amber-700 text-xs leading-relaxed">
                                            <strong>💡 Consejo:</strong> Revisa también tu carpeta de spam o correo no deseado. El enlace expira en <strong>1 hora</strong>.
                                        </p>
                                    </div>
                                    <Link
                                        href="/auth/login"
                                        className="mt-6 inline-block text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                                    >
                                        Volver al inicio de sesión →
                                    </Link>
                                </motion.div>
                            ) : (
                                /* ── Form State ── */
                                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {/* Icon + Header */}
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck size={22} className="text-teal-400" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-slate-900">
                                                Recuperar contraseña
                                            </h1>
                                            <p className="text-slate-500 text-sm mt-0.5">
                                                Te enviaremos un enlace seguro
                                            </p>
                                        </div>
                                    </div>

                                    {/* Error message */}
                                    <AnimatePresence>
                                        {state?.error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mb-5 flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm"
                                            >
                                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                                <p>{state.error}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <form action={dispatch} className="space-y-5">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Email de tu cuenta
                                            </label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    autoComplete="email"
                                                    required
                                                    placeholder="tu@email.com"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50"
                                                />
                                            </div>
                                        </div>

                                        <SubmitButton />
                                    </form>

                                    <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
                                        Por seguridad, el enlace expira en 1 hora y solo puede usarse una vez.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Brand */}
                <p className="text-center mt-6 text-xs text-slate-400">
                    © {new Date().getFullYear()} LegacyMark · Todos los derechos reservados
                </p>
            </motion.div>
        </div>
    );
}
