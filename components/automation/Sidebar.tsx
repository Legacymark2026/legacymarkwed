"use client";

import React from 'react';
import {
    Mail, MessageSquare, Clock, Split, Zap, Bot, Webhook, Smartphone, Phone,
    Briefcase, Users, CheckCircle, LayoutDashboard, ArrowRight, CalendarClock,
    ActivitySquare, Tags, UserPlus, Network, GitBranch, Repeat, Mic, BookOpen,
    FileJson, Terminal, Search, CalendarPlus, CreditCard, ShoppingCart, Target,
    Inbox, FileText, Bell, Sparkles, Database, Layers, Globe, Star, ShieldCheck,
    PhoneCall, Wand2, ArrowLeftRight
} from 'lucide-react';

export default function Sidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string, label: string, data?: any) => {
        event.dataTransfer.setData('application/reactflow/type', nodeType);
        event.dataTransfer.setData('application/reactflow/label', label);
        if (data) {
            event.dataTransfer.setData('application/reactflow/data', JSON.stringify(data));
        }
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-72 border-r border-gray-200 bg-white flex flex-col h-full z-10 shadow-lg">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                    <LayoutDashboard size={16} className="text-blue-600" />
                    Catálogo de Nodos
                </h2>
                <p className="text-xs text-gray-500 mt-1">Arrastra los bloques hacia el canvas.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">

                {/* Triggers Section */}
                <Section title="Disparadores" description="Inicia tu flujo de trabajo">
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'triggerNode', 'Form Submission', { triggerType: 'FORM_SUBMISSION' })}
                        icon={<Zap size={16} className="text-amber-600" />}
                        label="Formulario Enviado"
                        color="bg-amber-50 border-amber-200 text-amber-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'triggerNode', 'WhatsApp Keyword', { triggerType: 'WHATSAPP_TRIGGER' })}
                        icon={<MessageSquare size={16} className="text-green-600" />}
                        label="Mensaje Entrante WA"
                        color="bg-green-50 border-green-200 text-green-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'triggerNode', 'Meta Lead Ads', { triggerType: 'META_LEADS' })}
                        icon={<Target size={16} className="text-blue-600" />}
                        label="Lead Capturado (Meta)"
                        color="bg-blue-50 border-blue-200 text-blue-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'triggerNode', 'Stripe Payment', { triggerType: 'STRIPE_PAYMENT' })}
                        icon={<CreditCard size={16} className="text-indigo-600" />}
                        label="Pago Recibido (Stripe)"
                        color="bg-indigo-50 border-indigo-200 text-indigo-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'triggerNode', 'Shopify Order', { triggerType: 'SHOPIFY_ORDER' })}
                        icon={<ShoppingCart size={16} className="text-emerald-600" />}
                        label="Nueva Orden Shopify"
                        color="bg-emerald-50 border-emerald-200 text-emerald-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'triggerNode', 'Email Inbound', { triggerType: 'EMAIL_LISTENER' })}
                        icon={<Inbox size={16} className="text-gray-600" />}
                        label="Email Recibido"
                        color="bg-gray-50 border-gray-300 text-gray-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'triggerNode', 'Deal Stage Changed', { triggerType: 'DEAL_STAGE_CHANGED' })}
                        icon={<Briefcase size={16} className="text-purple-600" />}
                        label="Cambio de Etapa (Deal)"
                        color="bg-purple-50 border-purple-200 text-purple-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'triggerNode', 'Scheduled Time', { triggerType: 'SCHEDULE' })}
                        icon={<CalendarClock size={16} className="text-rose-600" />}
                        label="Horario / Cron"
                        color="bg-rose-50 border-rose-200 text-rose-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'triggerNode', 'Webhook Listener', { triggerType: 'WEBHOOK_LISTENER' })}
                        icon={<Webhook size={16} className="text-teal-600" />}
                        label="Escuchar Webhook"
                        color="bg-teal-50 border-teal-200 text-teal-900"
                    />
                </Section>

                {/* CRM Actions Section */}
                <Section title="Acciones CRM & Ventas" description="Actualiza base de datos">
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'crmActionNode', 'Create Task', { actionType: 'CREATE_TASK' })}
                        icon={<CheckCircle size={16} className="text-emerald-600" />}
                        label="Crear Tarea"
                        color="bg-emerald-50 border-emerald-200 text-emerald-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'crmActionNode', 'Update Deal', { actionType: 'UPDATE_DEAL' })}
                        icon={<Briefcase size={16} className="text-emerald-600" />}
                        label="Actualizar Deal"
                        color="bg-emerald-50 border-emerald-200 text-emerald-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'crmActionNode', 'Adjust Score', { actionType: 'ADJUST_SCORE' })}
                        icon={<Star size={16} className="text-fuchsia-600" />}
                        label="Ajustar Lead Score"
                        color="bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'crmActionNode', 'Meta Audience', { actionType: 'META_AUDIENCE' })}
                        icon={<Users size={16} className="text-blue-600" />}
                        label="Añadir Audiencia Ads"
                        color="bg-blue-50 border-blue-200 text-blue-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'crmActionNode', 'Generate Invoice', { actionType: 'GENERATE_INVOICE' })}
                        icon={<FileText size={16} className="text-indigo-600" />}
                        label="Generar Factura"
                        color="bg-indigo-50 border-indigo-200 text-indigo-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'crmActionNode', 'Validate Data', { actionType: 'VALIDATE_DATA' })}
                        icon={<ShieldCheck size={16} className="text-emerald-600" />}
                        label="Validar Email/Teléfono"
                        color="bg-emerald-50 border-emerald-200 text-emerald-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'crmActionNode', 'Add Tag', { actionType: 'ADD_TAG' })}
                        icon={<Tags size={16} className="text-emerald-600" />}
                        label="Añadir Etiqueta"
                        color="bg-emerald-50 border-emerald-200 text-emerald-900"
                    />
                </Section>

                {/* Communication Section */}
                <Section title="Canales & Comunicación" description="Mensajería y notificaciones">
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'actionNode', 'Send Email')}
                        icon={<Mail size={16} className="text-indigo-600" />}
                        label="Enviar Email"
                        color="bg-indigo-50 border-indigo-200 text-indigo-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'whatsappNode', 'WhatsApp Msg')}
                        icon={<Phone size={16} className="text-green-600" />}
                        label="Enviar WhatsApp"
                        color="bg-green-50 border-green-200 text-green-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'socialNode', 'IG Direct Message', { channel: 'IG_DM' })}
                        icon={<MessageSquare size={16} className="text-pink-600" />}
                        label="Enviar IG Direct"
                        color="bg-pink-50 border-pink-200 text-pink-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'phoneCallNode', 'AI Voice Call')}
                        icon={<PhoneCall size={16} className="text-violet-600" />}
                        label="Llamada IA (Vapi/Twilio)"
                        color="bg-violet-50 border-violet-200 text-violet-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'pushNode', 'Push Notification')}
                        icon={<Bell size={16} className="text-amber-600" />}
                        label="Enviar Notificación Push"
                        color="bg-amber-50 border-amber-200 text-amber-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'socialNode', 'Reply Comment', { channel: 'SOCIAL_COMMENT' })}
                        icon={<MessageSquare size={16} className="text-blue-500" />}
                        label="Responder Comentario"
                        color="bg-blue-50 border-blue-200 text-blue-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'smsNode', 'Send SMS')}
                        icon={<Smartphone size={16} className="text-sky-600" />}
                        label="Enviar SMS"
                        color="bg-sky-50 border-sky-200 text-sky-900"
                    />

                </Section>

                {/* Logic Section */}
                <Section title="Lógica, Transformación & IA" description="Control de flujo e integraciones">
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'waitNode', 'Wait / Delay', { delayValue: '1', delayUnit: 'h' })}
                        icon={<Clock size={16} className="text-orange-600" />}
                        label="Espera / Retraso"
                        color="bg-orange-50 border-orange-200 text-orange-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'splitNode', 'A/B Split Test')}
                        icon={<ArrowLeftRight size={16} className="text-fuchsia-600" />}
                        label="Split A/B Test"
                        color="bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'conditionNode', 'Condition (If/Else)')}
                        icon={<Split size={16} className="text-gray-600" />}
                        label="Condición (Si/Sino)"
                        color="bg-gray-50 border-gray-300 text-gray-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'switchNode', 'Switch (Múltiples caminos)')}
                        icon={<GitBranch size={16} className="text-indigo-600" />}
                        label="Switch (Múltiples)"
                        color="bg-indigo-50 border-indigo-200 text-indigo-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'aiNode', 'Intent Classifier', { aiTask: 'CLASSIFY_INTENT' })}
                        icon={<Sparkles size={16} className="text-yellow-600" />}
                        label="Clasificar Intención (IA)"
                        color="bg-yellow-50 border-yellow-200 text-yellow-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'transformerNode', 'Transform Data')}
                        icon={<Layers size={16} className="text-teal-600" />}
                        label="Transformar Formato"
                        color="bg-teal-50 border-teal-200 text-teal-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'aiNode', 'AI Translator', { aiTask: 'TRANSLATOR' })}
                        icon={<Globe size={16} className="text-blue-600" />}
                        label="Traductor IA"
                        color="bg-blue-50 border-blue-200 text-blue-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'enrichmentNode', 'Data Enrichment')}
                        icon={<Database size={16} className="text-emerald-600" />}
                        label="Enriquecer Lead Data"
                        color="bg-emerald-50 border-emerald-200 text-emerald-900"
                    />
                </Section>

                {/* Advanced AI & Code Section */}
                <Section title="Agentes IA & Avanzados" description="Procesamiento y Scripts">
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'voiceNode', 'Audio Transcriber')}
                        icon={<Mic size={16} className="text-violet-600" />}
                        label="Transcribir Audio (IA)"
                        color="bg-violet-50 border-violet-200 text-violet-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'ragNode', 'Knowledge Retrieval')}
                        icon={<BookOpen size={16} className="text-blue-600" />}
                        label="Buscar en Docs (RAG)"
                        color="bg-blue-50 border-blue-200 text-blue-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'extractorNode', 'Data Extractor')}
                        icon={<FileJson size={16} className="text-amber-600" />}
                        label="Extraer JSON (IA)"
                        color="bg-amber-50 border-amber-200 text-amber-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'codeNode', 'Run JavaScript')}
                        icon={<Terminal size={16} className="text-gray-800" />}
                        label="Ejecutar Código JS"
                        color="bg-gray-100 border-gray-300 text-gray-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'findRecordNode', 'Find Record')}
                        icon={<Search size={16} className="text-emerald-600" />}
                        label="Buscar Contacto"
                        color="bg-emerald-50 border-emerald-200 text-emerald-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'calendarNode', 'Activity / Calendar')}
                        icon={<CalendarPlus size={16} className="text-rose-600" />}
                        label="Agendar Cita"
                        color="bg-rose-50 border-rose-200 text-rose-900"
                    />
                </Section>
            </div>
        </aside>
    );
}

// Subcomponents for cleaner code
function Section({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-3">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{title}</h3>
                {description && <p className="text-[10px] text-gray-400">{description}</p>}
            </div>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}

interface DraggableItemProps {
    onDragStart: (event: React.DragEvent) => void;
    icon: React.ReactNode;
    label: string;
    color: string;
}

function DraggableItem({ onDragStart, icon, label, color }: DraggableItemProps) {
    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] shadow-sm hover:shadow-md ${color}`}
            onDragStart={onDragStart}
            draggable
        >
            <div className="bg-white p-1.5 rounded-md shadow-sm">
                {icon}
            </div>
            <span className="text-sm font-medium">{label}</span>
            <ArrowRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
