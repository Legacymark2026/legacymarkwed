"use client";

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import {
    Mail,
    MessageSquare,
    Clock,
    Split,
    Zap,
    Bot,
    Webhook,
    Smartphone,
    MoreHorizontal,
    Briefcase,
    CheckCircle,
    LayoutDashboard,
    Users
} from 'lucide-react';

const NodeWrapper = ({ children, selected, colorClass = "border-gray-200", bgClass = "bg-white" }: any) => (
    <div className={`shadow-md rounded-xl border-2 min-w-[240px] transition-all duration-200 ${selected ? 'border-blue-500 shadow-lg ring-2 ring-blue-100' : `${colorClass} hover:border-gray-300`} ${bgClass}`}>
        {children}
    </div>
);

const NodeHeader = ({ icon, label, color }: any) => (
    <div className={`px-4 py-2 border-b flex items-center gap-2 rounded-t-lg bg-opacity-50 ${color}`}>
        {icon}
        <span className="text-sm font-bold text-gray-800">{label}</span>
        <div className="ml-auto">
            <MoreHorizontal size={14} className="text-gray-400" />
        </div>
    </div>
);

const NodeBody = ({ children }: any) => (
    <div className="p-3 text-xs text-gray-600 bg-white rounded-b-lg">
        {children}
    </div>
);

// 1. TRIGGER NODE
const TriggerNode = memo(({ data, selected }: any) => {
    // Determine icon based on trigger type which might be inside data
    const type = data.triggerType || 'FORM_SUBMISSION';
    let icon = <Zap size={14} className="text-amber-600" />;
    let headerColor = "bg-amber-50 border-amber-100";

    if (type === 'DEAL_STAGE_CHANGED') {
        icon = <LayoutDashboard size={14} className="text-purple-600" />;
        headerColor = "bg-purple-50 border-purple-100";
    } else if (type === 'LEAD_CREATED') {
        icon = <Users size={14} className="text-blue-600" />;
        headerColor = "bg-blue-50 border-blue-100";
    }

    return (
        <NodeWrapper selected={selected} colorClass="border-amber-200">
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-500 border-2 border-white" />
            <NodeHeader icon={icon} label={data.label} color={headerColor} />
            <NodeBody>
                {type === 'FORM_SUBMISSION' && <p>Type: Form Submit</p>}
                {type === 'DEAL_STAGE_CHANGED' && <p>When deal moves stage</p>}
                {type === 'LEAD_CREATED' && <p>When new lead enters</p>}
            </NodeBody>
        </NodeWrapper>
    );
});

// 2. CRM ACTION NODE
const CRMActionNode = memo(({ data, selected }: any) => {
    const type = data.actionType || 'CREATE_TASK';
    let icon = <CheckCircle size={14} className="text-emerald-600" />;
    let label = "CRM Action";
    let body = "Update CRM Record";

    if (type === 'CREATE_TASK') {
        label = "Create Task";
        body = data.taskTitle ? `Task: ${data.taskTitle}` : "Create a new task";
    } else if (type === 'UPDATE_DEAL') {
        icon = <Briefcase size={14} className="text-emerald-600" />;
        label = "Update Deal";
        body = "Modify properties";
    }

    return (
        <NodeWrapper selected={selected} colorClass="border-emerald-200">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={icon} label={data.label || label} color="bg-emerald-50 border-emerald-100" />
            <NodeBody>{body}</NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border-2 border-white" />
        </NodeWrapper>
    );
});

// 3. ACTION NODE (Email, etc)
const ActionNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-indigo-200">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<Mail size={14} className="text-indigo-600" />} label="Send Email" color="bg-indigo-50 border-indigo-100" />
            <NodeBody>
                <div className="truncate max-w-[200px]">{data.subject || "No Subject"}</div>
            </NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500 border-2 border-white" />
        </NodeWrapper>
    );
});

const SlackNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-pink-200">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<MessageSquare size={14} className="text-pink-600" />} label="Slack Notification" color="bg-pink-50 border-pink-100" />
            <NodeBody>
                <div className="truncate max-w-[200px]">{data.message || "No message configured"}</div>
            </NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-pink-500 border-2 border-white" />
        </NodeWrapper>
    );
});

// 4. LOGIC NODES
const WaitNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-orange-200">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<Clock size={14} className="text-orange-600" />} label="Delay" color="bg-orange-50 border-orange-100" />
            <NodeBody>
                Wait for <span className="font-bold">{data.delayValue || '24'} {data.delayUnit || 'h'}</span>
            </NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-500 border-2 border-white" />
        </NodeWrapper>
    );
});

const ConditionNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-gray-300">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />

            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg flex items-center gap-2">
                <Split size={14} className="text-gray-600" />
                <span className="font-bold text-sm">Condition (If/Else)</span>
            </div>

            <div className="p-3 bg-white text-xs space-y-2">
                <div>IF {data.variable || 'Data'} {data.operator || 'equals'} {data.conditionValue || '...'}</div>
            </div>

            <div className="flex justify-between px-3 pb-3 rounded-b-lg bg-white">
                <div className="relative">
                    <span className="absolute -bottom-6 -left-1 text-[10px] font-bold text-green-600">YES</span>
                    <Handle type="source" id="true" position={Position.Bottom} className="w-3 h-3 bg-green-500 border-2 border-white" style={{ left: 10 }} />
                </div>
                <div className="relative">
                    <span className="absolute -bottom-6 -right-1 text-[10px] font-bold text-red-600">NO</span>
                    <Handle type="source" id="false" position={Position.Bottom} className="w-3 h-3 bg-red-500 border-2 border-white" style={{ left: 'auto', right: 10 }} />
                </div>
            </div>
        </NodeWrapper>
    );
});

const AINode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-violet-200">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<Bot size={14} className="text-violet-600" />} label="AI Agent" color="bg-violet-50 border-violet-100" />
            <NodeBody>
                Task: <span className="font-bold">{data.aiTask || 'SENTIMENT'}</span>
            </NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-violet-500 border-2 border-white" />
        </NodeWrapper>
    );
});


export const nodeTypes = {
    triggerNode: TriggerNode,
    actionNode: ActionNode,
    crmActionNode: CRMActionNode,
    waitNode: WaitNode,
    conditionNode: ConditionNode,
    slackNode: SlackNode,
    aiNode: AINode,
    httpNode: ActionNode, // Reuse generic for now
    whatsappNode: SlackNode, // Reuse generic
    smsNode: SlackNode, // Reuse generic
};

// Required names for proper imports
TriggerNode.displayName = "TriggerNode";
CRMActionNode.displayName = "CRMActionNode";
ActionNode.displayName = "ActionNode";
WaitNode.displayName = "WaitNode";
ConditionNode.displayName = "ConditionNode";
SlackNode.displayName = "SlackNode";
AINode.displayName = "AINode";
