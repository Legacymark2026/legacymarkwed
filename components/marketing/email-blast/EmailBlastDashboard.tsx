'use client';

import { useState } from 'react';
import { Mail, Plus, Send, CheckCircle, XCircle, Clock, BarChart2, Trash2, X } from 'lucide-react';
import { EmailBlastWizard } from './EmailBlastWizard';
import { deleteEmailBlast } from '@/actions/email-blast';
import { toast } from 'sonner';

type BlastSummary = {
    id: string;
    name: string;
    subject: string;
    status: string;
    totalRecipients: number;
    sent: number;
    failed: number;
    sentAt: Date | null;
    createdAt: Date;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: typeof CheckCircle }> = {
    DRAFT: { label: 'Borrador', color: '#94a3b8', bg: 'rgba(30,41,59,0.6)', Icon: Clock },
    SENDING: { label: 'Enviando', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', Icon: Send },
    COMPLETED: { label: 'Completado', color: '#2dd4bf', bg: 'rgba(13,148,136,0.1)', Icon: CheckCircle },
    FAILED: { label: 'Fallido', color: '#f87171', bg: 'rgba(239,68,68,0.1)', Icon: XCircle },
};

export function EmailBlastDashboard({ initialBlasts }: { initialBlasts: BlastSummary[] }) {
    const [blasts, setBlasts] = useState(initialBlasts);
    const [showWizard, setShowWizard] = useState(false);

    const handleDone = () => {
        setShowWizard(false);
        // Refresh the list
        window.location.reload();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta campaña?')) return;
        await deleteEmailBlast(id);
        setBlasts((b) => b.filter((x) => x.id !== id));
        toast.success('Campaña eliminada');
    };

    const totalSent = blasts.reduce((a, b) => a + b.sent, 0);
    const totalFailed = blasts.reduce((a, b) => a + b.failed, 0);
    const totalRecipients = blasts.reduce((a, b) => a + b.totalRecipients, 0);
    const avgRate = totalRecipients > 0 ? Math.round((totalSent / totalRecipients) * 100) : 0;

    return (
        <div className="min-h-screen p-6 lg:p-8" style={{ background: '#020617' }}>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,rgba(13,148,136,0.2),rgba(8,145,178,0.2))', border: '1px solid rgba(13,148,136,0.3)' }}>
                                <Mail className="w-5 h-5 text-teal-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white tracking-tight">Email Masivo</h1>
                                <p className="text-slate-500 text-sm">Sube tu base de datos y envía campañas personalizadas</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowWizard(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)' }}
                    >
                        <Plus className="w-4 h-4" />
                        Nueva campaña
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Campañas', value: blasts.length, icon: Mail, color: '#2dd4bf' },
                    { label: 'Total enviados', value: totalSent, icon: Send, color: '#34d399' },
                    { label: 'Fallidos', value: totalFailed, icon: XCircle, color: '#f87171' },
                    { label: 'Tasa de éxito', value: `${avgRate}%`, icon: BarChart2, color: '#818cf8' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,41,59,0.6)' }}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
                            <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <p className="text-3xl font-black" style={{ color }}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Blast list */}
            {blasts.length === 0 ? (
                <div className="text-center py-24">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(30,41,59,0.8)' }}>
                        <Mail className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-bold text-lg mb-2">Sin campañas todavía</p>
                    <p className="text-slate-600 text-sm mb-6">Crea tu primera campaña de email masivo</p>
                    <button
                        onClick={() => setShowWizard(true)}
                        className="px-6 py-3 rounded-xl text-sm font-black text-white"
                        style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)' }}
                    >
                        Crear primera campaña
                    </button>
                </div>
            ) : (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(30,41,59,0.6)' }}>
                    <div className="px-6 py-4" style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(30,41,59,0.6)' }}>
                        <span className="text-sm font-black text-white">Historial de campañas</span>
                    </div>
                    <div style={{ background: 'rgba(2,6,23,0.6)' }}>
                        {blasts.map((blast) => {
                            const cfg = STATUS_CONFIG[blast.status] ?? STATUS_CONFIG.DRAFT;
                            const Icon = cfg.Icon;
                            const rate = blast.totalRecipients > 0 ? Math.round((blast.sent / blast.totalRecipients) * 100) : 0;
                            return (
                                <div key={blast.id} className="px-6 py-4 flex items-center gap-4 transition-colors hover:bg-slate-950/50" style={{ borderBottom: '1px solid rgba(30,41,59,0.3)' }}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
                                        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{blast.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{blast.subject}</p>
                                    </div>
                                    <div className="hidden md:flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-sm font-black text-white">{blast.totalRecipients}</p>
                                            <p className="text-xs text-slate-600">Total</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black text-teal-400">{blast.sent}</p>
                                            <p className="text-xs text-slate-600">Enviados</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black" style={{ color: blast.failed > 0 ? '#f87171' : '#475569' }}>{blast.failed}</p>
                                            <p className="text-xs text-slate-600">Fallidos</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black text-violet-400">{rate}%</p>
                                            <p className="text-xs text-slate-600">Tasa</p>
                                        </div>
                                    </div>
                                    <div className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: cfg.bg, color: cfg.color }}>
                                        {cfg.label}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(blast.id)}
                                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Wizard Modal */}
            {showWizard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}>
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(30,41,59,0.8)' }}>
                        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid rgba(30,41,59,0.6)' }}>
                            <div>
                                <h2 className="text-lg font-black text-white">Nueva campaña de email</h2>
                                <p className="text-sm text-slate-500">Sube tu CSV y personaliza el envío</p>
                            </div>
                            <button onClick={() => setShowWizard(false)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <EmailBlastWizard onDone={handleDone} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
