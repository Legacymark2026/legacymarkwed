'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Users, Mail, Send, CheckCircle, XCircle, AlertCircle, ChevronRight, ChevronLeft, Loader2, Eye, Paperclip } from 'lucide-react';
import { createEmailBlast } from '@/actions/email-blast';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────

interface Recipient {
    email: string;
    name?: string;
    [key: string]: string | undefined;
}

interface WizardState {
    name: string;
    subject: string;
    htmlBody: string;
    fromName: string;
    fromEmail: string;
    recipients: Recipient[];
    csvHeaders: string[];
}

interface SendProgress {
    sent: number;
    failed: number;
    total: number;
    done: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function parseCSV(text: string): { headers: string[]; rows: Recipient[] } {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows: Recipient[] = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        const row: Recipient = { email: '' };
        headers.forEach((h, idx) => {
            row[h.toLowerCase()] = cols[idx] ?? '';
        });
        if (row.email) rows.push(row);
    }
    return { headers, rows };
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Step indicators ─────────────────────────────────────────────────────

const STEPS = [
    { id: 1, label: 'Contactos', icon: Users },
    { id: 2, label: 'Correo', icon: Mail },
    { id: 3, label: 'Preview', icon: Eye },
    { id: 4, label: 'Enviar', icon: Send },
];

// ─── Main Wizard ──────────────────────────────────────────────────────────

export function EmailBlastWizard({ onDone }: { onDone: () => void }) {
    const [step, setStep] = useState(1);
    const [state, setState] = useState<WizardState>({
        name: '',
        subject: '',
        htmlBody: DEFAULT_TEMPLATE,
        fromName: 'LegacyMark',
        fromEmail: 'noreply@legacymarksas.com',
        recipients: [],
        csvHeaders: [],
    });
    const [dragOver, setDragOver] = useState(false);
    const [progress, setProgress] = useState<SendProgress | null>(null);
    const [sending, setSending] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    // CSV upload handling
    const handleFile = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const { headers, rows } = parseCSV(text);
            const valid = rows.filter((r) => isValidEmail(r.email));
            setState((s) => ({ ...s, csvHeaders: headers, recipients: valid }));
            if (valid.length === 0) toast.error('No se encontraron emails válidos en el CSV');
            else toast.success(`${valid.length} contactos cargados correctamente`);
        };
        reader.readAsText(file);
    }, []);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    // Send via SSE stream
    const handleSend = async () => {
        if (!state.recipients.length || !state.subject || !state.htmlBody) return;
        setSending(true);

        try {
            const blast = await createEmailBlast({
                name: state.name || `Campaña ${new Date().toLocaleDateString()}`,
                subject: state.subject,
                htmlBody: state.htmlBody,
                fromName: state.fromName,
                fromEmail: state.fromEmail,
                recipients: state.recipients,
            });

            setProgress({ sent: 0, failed: 0, total: blast.recipients.length, done: false });

            const res = await fetch('/api/email-blast/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blastId: blast.id }),
            });

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) return;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const lines = decoder.decode(value).split('\n');
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const data = JSON.parse(line.slice(6));
                    if (data.type === 'progress') {
                        setProgress({ sent: data.sent, failed: data.failed, total: data.total, done: false });
                    } else if (data.type === 'done') {
                        setProgress({ sent: data.sent, failed: data.failed, total: data.total, done: true });
                        toast.success(`Campaña enviada: ${data.sent} exitosos, ${data.failed} fallidos`);
                        setTimeout(() => onDone(), 2000);
                    }
                }
            }
        } catch (err) {
            toast.error('Error al enviar la campaña');
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    const validRecipients = state.recipients.filter((r) => isValidEmail(r.email));
    const canNext = [
        validRecipients.length > 0,
        state.subject.length > 2 && state.htmlBody.length > 10,
        true,
        true,
    ][step - 1];

    return (
        <div className="w-full">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-10">
                {STEPS.map((s, idx) => {
                    const Icon = s.icon;
                    const isActive = s.id === step;
                    const isDone = s.id < step;
                    return (
                        <div key={s.id} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                                    style={{
                                        background: isActive ? 'linear-gradient(135deg,#0d9488,#0891b2)' : isDone ? 'rgba(13,148,136,0.2)' : 'rgba(30,41,59,0.6)',
                                        border: isActive ? 'none' : isDone ? '1px solid rgba(13,148,136,0.4)' : '1px solid rgba(30,41,59,0.8)',
                                    }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: isActive ? '#fff' : isDone ? '#2dd4bf' : '#475569' }} />
                                </div>
                                <span className="text-xs mt-1.5 font-bold" style={{ color: isActive ? '#2dd4bf' : isDone ? '#0d9488' : '#475569' }}>
                                    {s.label}
                                </span>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div className="flex-1 h-px mx-3" style={{ background: isDone ? 'rgba(13,148,136,0.4)' : 'rgba(30,41,59,0.6)' }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step 1: Upload CSV */}
            {step === 1 && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Nombre de la campaña</label>
                        <input
                            type="text"
                            value={state.name}
                            onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
                            placeholder="Ej: Newsletter Marzo 2026"
                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                            style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,41,59,0.8)' }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(13,148,136,0.5)')}
                            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(30,41,59,0.8)')}
                        />
                    </div>

                    <div
                        className="relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer"
                        style={{ borderColor: dragOver ? 'rgba(13,148,136,0.6)' : 'rgba(30,41,59,0.6)', background: dragOver ? 'rgba(13,148,136,0.05)' : 'rgba(15,23,42,0.4)' }}
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onClick={() => fileRef.current?.click()}
                    >
                        <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                        <Upload className="w-10 h-10 mx-auto mb-4" style={{ color: dragOver ? '#2dd4bf' : '#475569' }} />
                        <p className="text-slate-300 font-bold mb-2">Arrastra tu archivo CSV aquí</p>
                        <p className="text-slate-500 text-sm">o haz click para seleccionar</p>
                        <p className="text-slate-600 text-xs mt-3">El CSV debe tener columna <code className="text-teal-500">email</code>. Opcional: <code className="text-teal-500">name</code> y cualquier variable custom.</p>
                    </div>

                    {validRecipients.length > 0 && (
                        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(30,41,59,0.8)' }}>
                            <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(15,23,42,0.8)' }}>
                                <span className="text-sm font-black text-white flex items-center gap-2">
                                    <Users className="w-4 h-4 text-teal-400" />
                                    {validRecipients.length} contactos cargados
                                </span>
                                <span className="text-xs text-slate-500 font-mono">Columnas: {state.csvHeaders.join(', ')}</span>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                {validRecipients.slice(0, 8).map((r, i) => (
                                    <div key={i} className="px-5 py-2.5 flex items-center gap-4 text-sm" style={{ borderTop: '1px solid rgba(30,41,59,0.4)' }}>
                                        <CheckCircle className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                                        <span className="text-slate-300 font-mono">{r.email}</span>
                                        {r.name && <span className="text-slate-500">{r.name}</span>}
                                    </div>
                                ))}
                                {validRecipients.length > 8 && (
                                    <div className="px-5 py-2.5 text-sm text-slate-600 italic" style={{ borderTop: '1px solid rgba(30,41,59,0.4)' }}>
                                        + {validRecipients.length - 8} más...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <CSVTemplateDownload />
                </div>
            )}

            {/* Step 2: Email Editor */}
            {step === 2 && (
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Nombre del remitente</label>
                            <input
                                type="text"
                                value={state.fromName}
                                onChange={(e) => setState((s) => ({ ...s, fromName: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,41,59,0.8)' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Email remitente</label>
                            <input
                                type="email"
                                value={state.fromEmail}
                                onChange={(e) => setState((s) => ({ ...s, fromEmail: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,41,59,0.8)' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Asunto del correo</label>
                        <input
                            type="text"
                            value={state.subject}
                            onChange={(e) => setState((s) => ({ ...s, subject: e.target.value }))}
                            placeholder="Ej: ¡Oferta exclusiva para {{name}}!"
                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none"
                            style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,41,59,0.8)' }}
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-slate-300">Cuerpo del correo (HTML)</label>
                            <span className="text-xs text-teal-500 font-mono">Usa {'{{nombre}}'} para variables personalizadas</span>
                        </div>
                        <textarea
                            value={state.htmlBody}
                            onChange={(e) => setState((s) => ({ ...s, htmlBody: e.target.value }))}
                            rows={14}
                            className="w-full px-4 py-3 rounded-xl text-sm text-slate-300 font-mono outline-none resize-none"
                            style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,41,59,0.8)' }}
                        />
                    </div>
                    {state.csvHeaders.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-slate-500 mr-1">Variables disponibles:</span>
                            {state.csvHeaders.map((h) => (
                                <button
                                    key={h}
                                    className="text-xs px-2.5 py-1 rounded-lg font-mono text-teal-400 transition-all hover:scale-105"
                                    style={{ background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.25)' }}
                                    onClick={() => setState((s) => ({ ...s, htmlBody: s.htmlBody + `{{${h.toLowerCase()}}}` }))}
                                >
                                    {`{{${h.toLowerCase()}}}`}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
                <div className="space-y-5">
                    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(30,41,59,0.8)' }}>
                        <div className="px-5 py-3 flex items-center gap-3" style={{ background: 'rgba(15,23,42,0.8)' }}>
                            <Mail className="w-4 h-4 text-teal-400" />
                            <div>
                                <p className="text-xs text-slate-500">De: <span className="text-slate-300">{state.fromName} &lt;{state.fromEmail}&gt;</span></p>
                                <p className="text-xs text-slate-500">Asunto: <span className="text-slate-300 font-bold">{state.subject}</span></p>
                            </div>
                        </div>
                        <div className="bg-white rounded-b-2xl overflow-hidden" style={{ maxHeight: 400 }}>
                            <iframe
                                srcDoc={state.htmlBody}
                                className="w-full border-0"
                                style={{ height: 400 }}
                                title="Preview del correo"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="tu@email.com"
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none"
                            style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,41,59,0.8)' }}
                        />
                        <button
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 transition-all hover:text-white"
                            style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(30,41,59,0.8)' }}
                            onClick={async () => {
                                if (!testEmail) return;
                                const { sendTestEmail } = await import('@/actions/email-blast');
                                await sendTestEmail(state.subject, state.htmlBody, testEmail);
                                toast.success(`Email de prueba enviado a ${testEmail}`);
                            }}
                        >
                            Enviar prueba
                        </button>
                    </div>

                    <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.2)' }}>
                        <AlertCircle className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-400">
                            Se enviarán <strong className="text-white">{validRecipients.length} correos</strong> en lotes de 50.
                            El proceso puede tardar algunos minutos según el volumen.
                        </p>
                    </div>
                </div>
            )}

            {/* Step 4: Send with progress */}
            {step === 4 && (
                <div className="space-y-8">
                    {!progress ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,rgba(13,148,136,0.2),rgba(8,145,178,0.2))', border: '1px solid rgba(13,148,136,0.3)' }}>
                                <Send className="w-9 h-9 text-teal-400" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Todo listo</h3>
                            <p className="text-slate-400 mb-2">
                                <strong className="text-white">{validRecipients.length}</strong> destinatarios · <strong className="text-white">{state.subject}</strong>
                            </p>
                            <p className="text-slate-500 text-sm">Haz click en Enviar para iniciar la campaña</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center">
                                {progress.done ? (
                                    <CheckCircle className="w-14 h-14 mx-auto text-teal-400 mb-3" />
                                ) : (
                                    <Loader2 className="w-14 h-14 mx-auto text-teal-400 animate-spin mb-3" />
                                )}
                                <p className="text-xl font-black text-white">
                                    {progress.done ? '¡Campaña enviada!' : 'Enviando...'}
                                </p>
                            </div>

                            {/* Progress bar */}
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-2">
                                    <span>Progreso</span>
                                    <span>{progress.sent + progress.failed} / {progress.total}</span>
                                </div>
                                <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(30,41,59,0.8)' }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${((progress.sent + progress.failed) / progress.total) * 100}%`,
                                            background: 'linear-gradient(90deg,#0d9488,#0891b2)',
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.2)' }}>
                                    <p className="text-3xl font-black text-teal-400">{progress.sent}</p>
                                    <p className="text-xs text-slate-500 mt-1">Enviados</p>
                                </div>
                                <div className="rounded-xl p-4 text-center" style={{ background: progress.failed > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(30,41,59,0.4)', border: progress.failed > 0 ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(30,41,59,0.6)' }}>
                                    <p className="text-3xl font-black" style={{ color: progress.failed > 0 ? '#f87171' : '#475569' }}>{progress.failed}</p>
                                    <p className="text-xs text-slate-500 mt-1">Fallidos</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid rgba(30,41,59,0.6)' }}>
                <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 transition-all hover:text-white disabled:opacity-30"
                    style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(30,41,59,0.8)' }}
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                    disabled={step === 1 || sending}
                >
                    <ChevronLeft className="w-4 h-4" /> Atrás
                </button>

                {step < 4 ? (
                    <button
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-40"
                        style={{ background: canNext ? 'linear-gradient(135deg,#0d9488,#0891b2)' : 'rgba(30,41,59,0.5)', cursor: canNext ? 'pointer' : 'not-allowed' }}
                        onClick={() => canNext && setStep((s) => Math.min(4, s + 1))}
                        disabled={!canNext}
                    >
                        Siguiente <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-40"
                        style={{ background: sending || (progress?.done) ? 'rgba(30,41,59,0.5)' : 'linear-gradient(135deg,#0d9488,#0891b2)' }}
                        onClick={handleSend}
                        disabled={sending || progress?.done}
                    >
                        {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar campaña</>}
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── CSV Template Download ────────────────────────────────────────────────

function CSVTemplateDownload() {
    const download = () => {
        const csv = 'email,name,empresa\nejemplo@correo.com,Juan García,Mi Empresa\notro@email.com,Ana López,Otra Empresa';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_contactos.csv';
        a.click();
    };

    return (
        <button
            onClick={download}
            className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors font-bold"
        >
            <Paperclip className="w-4 h-4" />
            Descargar plantilla CSV de ejemplo
        </button>
    );
}

// ─── Default email template ───────────────────────────────────────────────

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #042f2e 100%); padding: 40px 40px 32px; text-align: center; }
    .logo { color: #2dd4bf; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
    .body { padding: 40px; }
    h1 { color: #0f172a; font-size: 26px; font-weight: 800; margin: 0 0 16px; }
    p { color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 20px; }
    .cta { display: inline-block; background: linear-gradient(135deg,#0d9488,#0891b2); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; margin: 8px 0; }
    .footer { background: #f1f5f9; padding: 24px 40px; text-align: center; }
    .footer p { color: #94a3b8; font-size: 13px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">⚡ LegacyMark</div>
    </div>
    <div class="body">
      <h1>Hola, {{name}} 👋</h1>
      <p>Tenemos algo especial para ti. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <a href="https://legacymarksas.com" class="cta">Ver más →</a>
    </div>
    <div class="footer">
      <p>© 2026 LegacyMark · <a href="#" style="color:#0d9488">Cancelar suscripción</a></p>
    </div>
  </div>
</body>
</html>`;
