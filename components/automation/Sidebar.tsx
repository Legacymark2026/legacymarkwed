"use client";

import React from 'react';
import {
    Mail,
    MessageSquare,
    Clock,
    Split,
    Zap,
    Bot,
    Webhook,
    Smartphone,
    Phone,
    Briefcase,
    Users,
    CheckCircle,
    LayoutDashboard,
    ArrowRight
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
                    Components
                </h2>
                <p className="text-xs text-gray-500 mt-1">Drag and drop blocks to build your flow.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">

                {/* Triggers Section */}
                <Section title="Triggers" description="Start your workflow">
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'triggerNode', 'Form Submission', { triggerType: 'FORM_SUBMISSION' })}
                        icon={<Zap size={16} className="text-amber-600" />}
                        label="Form Submitted"
                        color="bg-amber-50 border-amber-200 text-amber-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'triggerNode', 'Deal Stage Changed', { triggerType: 'DEAL_STAGE_CHANGED' })}
                        icon={<Briefcase size={16} className="text-purple-600" />}
                        label="Deal Stage Changed"
                        color="bg-purple-50 border-purple-200 text-purple-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'triggerNode', 'New Lead Created', { triggerType: 'LEAD_CREATED' })}
                        icon={<Users size={16} className="text-blue-600" />}
                        label="New Lead Created"
                        color="bg-blue-50 border-blue-200 text-blue-900"
                    />
                </Section>

                {/* CRM Actions Section */}
                <Section title="CRM Actions" description="Update your database">
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'crmActionNode', 'Create Task', { actionType: 'CREATE_TASK' })}
                        icon={<CheckCircle size={16} className="text-emerald-600" />}
                        label="Create Task"
                        color="bg-emerald-50 border-emerald-200 text-emerald-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'crmActionNode', 'Update Deal', { actionType: 'UPDATE_DEAL' })}
                        icon={<Briefcase size={16} className="text-emerald-600" />}
                        label="Update Deal"
                        color="bg-emerald-50 border-emerald-200 text-emerald-900"
                    />
                </Section>

                {/* Communication Section */}
                <Section title="Communication" description="Reach out to contacts">
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'actionNode', 'Send Email')}
                        icon={<Mail size={16} className="text-indigo-600" />}
                        label="Send Email"
                        color="bg-indigo-50 border-indigo-200 text-indigo-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'slackNode', 'Send Slack')}
                        icon={<MessageSquare size={16} className="text-pink-600" />}
                        label="Slack Notification"
                        color="bg-pink-50 border-pink-200 text-pink-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'smsNode', 'Send SMS')}
                        icon={<Smartphone size={16} className="text-sky-600" />}
                        label="Send SMS"
                        color="bg-sky-50 border-sky-200 text-sky-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'whatsappNode', 'WhatsApp Msg')}
                        icon={<Phone size={16} className="text-green-600" />}
                        label="WhatsApp"
                        color="bg-green-50 border-green-200 text-green-900"
                    />
                </Section>

                {/* Logic Section */}
                <Section title="Logic & AI" description="Control flow">
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'waitNode', 'Wait', { delayValue: '1', delayUnit: 'h' })}
                        icon={<Clock size={16} className="text-orange-600" />}
                        label="Wait / Delay"
                        color="bg-orange-50 border-orange-200 text-orange-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'conditionNode', 'Condition')}
                        icon={<Split size={16} className="text-gray-600" />}
                        label="Condition (If/Else)"
                        color="bg-gray-50 border-gray-300 text-gray-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'aiNode', 'AI Agent')}
                        icon={<Bot size={16} className="text-violet-600" />}
                        label="AI Agent"
                        color="bg-violet-50 border-violet-200 text-violet-900"
                    />
                    <DraggableItem
                        onDragStart={(e) => onDragStart(e, 'httpNode', 'Webhook')}
                        icon={<Webhook size={16} className="text-cyan-600" />}
                        label="Webhook / HTTP"
                        color="bg-cyan-50 border-cyan-200 text-cyan-900"
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
