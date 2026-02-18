"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/actions/auth";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ShieldCheck, XCircle } from "lucide-react";

// Password strength checker
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: "Muy débil", color: "bg-red-500" };
    if (score === 2) return { score, label: "Débil", color: "bg-orange-500" };
    if (score === 3) return { score, label: "Regular", color: "bg-yellow-500" };
    if (score === 4) return { score, label: "Fuerte", color: "bg-teal-500" };
    return { score, label: "Muy fuerte", color: "bg-green-500" };
}

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
                    Actualizando contraseña...
                </>
            ) : (
                <>
                    <Lock size={16} />
                    Establecer nueva contraseña
                </>
            )}
        </button>
    );
}

export default function NuevaContrasenaPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [state, dispatch] = useActionState(resetPassword, undefined);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [password, setPassword] = useState("");

    const strength = getPasswordStrength(password);

    // Redirect to login after success
    useEffect(() => {
        if (state?.success) {
            const timer = setTimeout(() => router.push("/auth/login"), 3000);
            return () => clearTimeout(timer);
        }
    }, [state?.success, router]);

    // No token — show error
    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/20 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center"
                >
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle size={40} className="text-red-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-3">Enlace inválido</h1>
                    <p className="text-slate-500 text-sm mb-6">
                        Este enlace de recuperación no es válido o ha expirado.
                    </p>
                    <Link
                        href="/auth/recuperar"
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all"
                    >
                        Solicitar nuevo enlace
                    </Link>
                </motion.div>
            </div>
        );
    }

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
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    {/* Top accent */}
                    <div className="h-1 bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400" />

                    <div className="p-8">
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
                                        ¡Contraseña actualizada!
                                    </h2>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                        Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión en unos segundos.
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-teal-600 text-sm font-medium">
                                        <Loader2 size={14} className="animate-spin" />
                                        Redirigiendo...
                                    </div>
                                </motion.div>
                            ) : (
                                /* ── Form State ── */
                                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {/* Header */}
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck size={22} className="text-teal-400" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-slate-900">
                                                Nueva contraseña
                                            </h1>
                                            <p className="text-slate-500 text-sm mt-0.5">
                                                Elige una contraseña segura
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
                                        {/* Hidden token */}
                                        <input type="hidden" name="token" value={token} />

                                        {/* New Password */}
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Nueva contraseña
                                            </label>
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    minLength={8}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Mínimo 8 caracteres"
                                                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>

                                            {/* Password strength bar */}
                                            {password && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    className="mt-2"
                                                >
                                                    <div className="flex gap-1 mb-1">
                                                        {[1, 2, 3, 4, 5].map((i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : "bg-slate-200"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className={`text-xs font-medium ${strength.score <= 2 ? "text-red-500" : strength.score === 3 ? "text-yellow-600" : "text-teal-600"}`}>
                                                        {strength.label}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Confirmar contraseña
                                            </label>
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type={showConfirm ? "text" : "password"}
                                                    required
                                                    minLength={8}
                                                    placeholder="Repite tu contraseña"
                                                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-slate-50/50"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirm(!showConfirm)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Requirements */}
                                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Requisitos</p>
                                            {[
                                                { label: "Mínimo 8 caracteres", met: password.length >= 8 },
                                                { label: "Al menos una mayúscula", met: /[A-Z]/.test(password) },
                                                { label: "Al menos un número", met: /[0-9]/.test(password) },
                                            ].map((req) => (
                                                <div key={req.label} className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${req.met ? "bg-teal-500" : "bg-slate-200"}`}>
                                                        {req.met && <CheckCircle size={10} className="text-white" />}
                                                    </div>
                                                    <span className={`text-xs transition-colors ${req.met ? "text-teal-700 font-medium" : "text-slate-400"}`}>
                                                        {req.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <SubmitButton />
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <p className="text-center mt-6 text-xs text-slate-400">
                    © {new Date().getFullYear()} LegacyMark · Todos los derechos reservados
                </p>
            </motion.div>
        </div>
    );
}
