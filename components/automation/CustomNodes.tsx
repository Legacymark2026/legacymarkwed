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
    Phone,
    Briefcase,
    Users,
    CheckCircle,
    LayoutDashboard,
    MoreHorizontal,
    CalendarClock,
    ActivitySquare,
    Tags,
    UserPlus,
    Network,
    GitBranch,
    Repeat,
    Mic,
    BookOpen,
    FileJson,
    Terminal,
    Search,
    CalendarPlus
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
    const type = data.triggerType || 'FORM_SUBMISSION';
    let icon = <Zap size={14} className="text-amber-600" />;
    let headerColor = "bg-amber-50 border-amber-100";
    let colorClass = "border-amber-200";
    let bodyText = "Trigger event";

    if (type === 'DEAL_STAGE_CHANGED') {
        icon = <Briefcase size={14} className="text-purple-600" />;
        headerColor = "bg-purple-50 border-purple-100";
        colorClass = "border-purple-200";
        bodyText = data.stage ? `To stage: ${data.stage}` : "When deal moves stage";
    } else if (type === 'LEAD_CREATED') {
        icon = <Users size={14} className="text-blue-600" />;
        headerColor = "bg-blue-50 border-blue-100";
        colorClass = "border-blue-200";
        bodyText = "When new lead enters CRM";
    } else if (type === 'SCHEDULE') {
        icon = <CalendarClock size={14} className="text-rose-600" />;
        headerColor = "bg-rose-50 border-rose-100";
        colorClass = "border-rose-200";
        bodyText = data.cronExpression ? `Cron: ${data.cronExpression}` : "Time-based schedule";
    } else if (type === 'WEBHOOK_LISTENER') {
        icon = <Webhook size={14} className="text-teal-600" />;
        headerColor = "bg-teal-50 border-teal-100";
        colorClass = "border-teal-200";
        bodyText = "Listens for HTTP POST";
    } else if (type === 'LEAD_SCORE') {
        icon = <ActivitySquare size={14} className="text-fuchsia-600" />;
        headerColor = "bg-fuchsia-50 border-fuchsia-100";
        colorClass = "border-fuchsia-200";
        bodyText = `Score > ${data.targetScore || 50}`;
    } else if (type === 'FORM_SUBMISSION') {
        bodyText = "Type: Form Submit";
    }

    return (
        <NodeWrapper selected={selected} colorClass={colorClass}>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-500 border-2 border-white" />
            <NodeHeader icon={icon} label={data.label} color={headerColor} />
            <NodeBody>
                <p>{bodyText}</p>
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
    } else if (type === 'ADD_TAG') {
        icon = <Tags size={14} className="text-emerald-600" />;
        label = "Add Tag";
        body = data.tagName ? `Tag: ${data.tagName}` : "Add a tag to lead";
    } else if (type === 'REMOVE_TAG') {
        icon = <Tags size={14} className="text-emerald-600" />;
        label = "Remove Tag";
        body = data.tagName ? `Remove: ${data.tagName}` : "Remove tag from lead";
    } else if (type === 'ASSIGN_USER') {
        icon = <UserPlus size={14} className="text-emerald-600" />;
        label = "Assign User";
        body = data.userId ? `Assign to ID: ${data.userId}` : "Assign to sales rep";
    }

    return (
        <NodeWrapper selected={selected} colorClass="border-emerald-200">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={icon} label={data.label || label} color="bg-emerald-50 border-emerald-100" />
            <NodeBody><p>{body}</p></NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border-2 border-white" />
        </NodeWrapper>
    );
});

// 3. COMMUNICATION & ACTION NODES
const ActionNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-indigo-200">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<Mail size={14} className="text-indigo-600" />} label={data.label || "Send Email"} color="bg-indigo-50 border-indigo-100" />
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
            <NodeHeader icon={<MessageSquare size={14} className="text-pink-600" />} label={data.label || "Slack Notification"} color="bg-pink-50 border-pink-100" />
            <NodeBody>
                <div className="truncate max-w-[200px]">{data.message || "No message configured"}</div>
            </NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-pink-500 border-2 border-white" />
        </NodeWrapper>
    );
});

const WhatsappNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-green-200">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<Phone size={14} className="text-green-600" />} label={data.label || "WhatsApp"} color="bg-green-50 border-green-100" />
            <NodeBody>
                <p className="font-bold text-green-700">{data.phoneNumber || 'No Contact'}</p>
                <div className="truncate max-w-[200px]">{data.message || "No message configured"}</div>
            </NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500 border-2 border-white" />
        </NodeWrapper>
    );
});

const SmsNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-sky-200">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<Smartphone size={14} className="text-sky-600" />} label={data.label || "SMS"} color="bg-sky-50 border-sky-100" />
            <NodeBody>
                <div className="truncate max-w-[200px]">{data.message || "No message configured"}</div>
            </NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-sky-500 border-2 border-white" />
        </NodeWrapper>
    );
});

const HttpNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-cyan-200">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<Network size={14} className="text-cyan-600" />} label={data.label || "HTTP Request"} color="bg-cyan-50 border-cyan-100" />
            <NodeBody>
                <div className="flex items-center gap-1 font-mono">
                    <span className="font-bold text-cyan-600">{data.method || 'POST'}</span>
                    <span className="truncate max-w-[150px]">{data.url || 'http://...'}</span>
                </div>
            </NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-cyan-500 border-2 border-white" />
        </NodeWrapper>
    );
});

// 4. LOGIC NODES
const WaitNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-orange-200">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<Clock size={14} className="text-orange-600" />} label={data.label || "Delay"} color="bg-orange-50 border-orange-100" />
            <NodeBody>
                Wait for <span className="font-bold">{data.delayValue || '1'} {data.delayUnit || 'h'}</span>
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
                <span className="font-bold text-sm text-gray-800">{data.label || "Condition (If/Else)"}</span>
            </div>

            <div className="p-3 bg-white text-xs space-y-2 font-mono">
                <div className="text-center bg-gray-50 p-1 rounded border border-gray-100 text-gray-700">
                    IF {data.variable || 'Data'} {data.operator || 'equals'} {data.conditionValue || '...'}
                </div>
            </div>

            <div className="flex justify-between px-3 pb-3 rounded-b-lg bg-white mt-4">
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

const SwitchNode = memo(({ data, selected }: any) => {
    // We expect data.branches to be an array of strings/objects representing branch labels/values
    const branches = Array.isArray(data.branches) && data.branches.length > 0
        ? data.branches
        : [{ id: 'case_1', label: 'Case 1' }, { id: 'case_2', label: 'Case 2' }];

    return (
        <NodeWrapper selected={selected} colorClass="border-indigo-300">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-200 rounded-t-lg flex items-center gap-2">
                <GitBranch size={14} className="text-indigo-600" />
                <span className="font-bold text-sm text-gray-800">{data.label || "Switch Paths"}</span>
            </div>
            <div className="p-3 bg-white text-xs space-y-2 font-mono border-b border-gray-100">
                <div className="text-center bg-indigo-50/50 p-1 rounded border border-indigo-100 text-indigo-700">
                    Evaluate: {data.variable || 'Variable'}
                </div>
            </div>

            {/* Dynamic Branch Handles */}
            <div className="flex justify-evenly px-2 pb-5 pt-3 rounded-b-lg bg-white relative">
                {branches.map((branch: any, index: number) => {
                    // Calculate left percentage to evenly distribute handles
                    const leftPos = branches.length > 1
                        ? `${(index / (branches.length - 1)) * 100}%`
                        : '50%';

                    return (
                        <div key={branch.id} className="absolute flex flex-col items-center" style={{ left: leftPos, transform: 'translateX(-50%)', bottom: '-4px' }}>
                            <span className="absolute -bottom-5 whitespace-nowrap text-[10px] font-bold text-indigo-600 max-w-[50px] truncate" title={branch.label || branch.value}>
                                {branch.label || branch.value || `Path ${index + 1}`}
                            </span>
                            <Handle
                                type="source"
                                id={branch.id}
                                position={Position.Bottom}
                                className="w-3 h-3 bg-indigo-500 border-2 border-white !static !transform-none"
                            />
                        </div>
                    );
                })}
            </div>
        </NodeWrapper>
    );
});

const LoopNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-teal-300">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <div className="px-4 py-2 bg-teal-50 border-b border-teal-200 rounded-t-lg flex items-center gap-2">
                <Repeat size={14} className="text-teal-600" />
                <span className="font-bold text-sm text-gray-800">{data.label || "Loop / For-Each"}</span>
            </div>
            <div className="p-3 bg-white text-xs space-y-2 font-mono">
                <div className="text-center bg-teal-50/50 p-1 rounded border border-teal-100 text-teal-700">
                    Iterate: {data.iterableVariable || 'List'}
                </div>
            </div>

            <div className="flex justify-between px-3 pb-3 rounded-b-lg bg-white mt-4 relative">
                <div className="relative">
                    <span className="absolute -bottom-6 -left-4 text-[10px] font-bold text-teal-600 whitespace-nowrap">NEXT ITEM</span>
                    <Handle type="source" id="loop" position={Position.Bottom} className="w-3 h-3 bg-teal-500 border-2 border-white" style={{ left: 10 }} />
                </div>
                <div className="relative">
                    <span className="absolute -bottom-6 -right-4 text-[10px] font-bold text-gray-500 whitespace-nowrap">DONE</span>
                    <Handle type="source" id="done" position={Position.Bottom} className="w-3 h-3 bg-gray-500 border-2 border-white" style={{ left: 'auto', right: 10 }} />
                </div>
            </div>
        </NodeWrapper>
    );
});

// --- ADVANCED AI & DATA NODES ---

const VoiceNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-violet-300">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<Mic size={14} className="text-violet-600" />} label={data.label || "Audio Transcriber"} color="bg-violet-50 border-violet-200" />
            <NodeBody>
                <div className="flex items-center gap-1">
                    <span className="text-violet-600 font-bold truncate max-w-[180px]">Input: {data.audioUrlVariable || '{{trigger.audioUrl}}'}</span>
                </div>
            </NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-violet-500 border-2 border-white" />
        </NodeWrapper>
    );
});

const RagNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-blue-300">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<BookOpen size={14} className="text-blue-600" />} label={data.label || "Knowledge Retrieval"} color="bg-blue-50 border-blue-200" />
            <NodeBody>
                <div className="truncate max-w-[200px]">Doc: <span className="font-mono text-blue-700">{data.documentSource || 'All Company Docs'}</span></div>
            </NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-white" />
        </NodeWrapper>
    );
});

const ExtractorNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-amber-300">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<FileJson size={14} className="text-amber-600" />} label={data.label || "Data Extractor"} color="bg-amber-50 border-amber-200" />
            <NodeBody>
                <div className="truncate max-w-[200px] font-mono text-amber-700">Schema: {data.schemaKeys ? data.schemaKeys.toString() : '{ ... }'}</div>
            </NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-500 border-2 border-white" />
        </NodeWrapper>
    );
});

const CodeNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-gray-500" bgClass="bg-gray-900 border-gray-800">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-500 border-2 border-gray-900" />
            <div className="px-4 py-2 border-b flex items-center gap-2 rounded-t-lg bg-gray-800 border-gray-700">
                <Terminal size={14} className="text-green-400" />
                <span className="text-sm font-bold text-gray-100">{data.label || "Run JS Code"}</span>
            </div>
            <div className="p-3 text-xs bg-gray-900 text-green-400 rounded-b-lg font-mono truncate max-w-[200px]">
                {data.code ? '{ Script... }' : '// Code Block'}
            </div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500 border-2 border-gray-900" />
        </NodeWrapper>
    );
});

const FindRecordNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-emerald-300">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<Search size={14} className="text-emerald-600" />} label={data.label || "Find Contact"} color="bg-emerald-50 border-emerald-200" />
            <NodeBody>
                <div className="truncate max-w-[200px]">By: <span className="font-bold text-emerald-700">{data.searchBy || 'Email'}</span></div>
            </NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border-2 border-white" />
        </NodeWrapper>
    );
});

const CalendarNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-rose-300">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<CalendarPlus size={14} className="text-rose-600" />} label={data.label || "Schedule Meeting"} color="bg-rose-50 border-rose-200" />
            <NodeBody>
                <div className="truncate max-w-[200px]">Event: <span className="font-bold text-rose-700">{data.eventTitle || 'Consultation'}</span></div>
            </NodeBody>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-rose-500 border-2 border-white" />
        </NodeWrapper>
    );
});

const AINode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper selected={selected} colorClass="border-violet-200">
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 border-2 border-white" />
            <NodeHeader icon={<Bot size={14} className="text-violet-600" />} label={data.label || "AI Agent"} color="bg-violet-50 border-violet-100" />
            <NodeBody>
                Task: <span className="font-bold text-violet-700">{data.aiTask || 'SENTIMENT'}</span>
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
    switchNode: SwitchNode,
    loopNode: LoopNode,
    slackNode: SlackNode,
    aiNode: AINode,
    httpNode: HttpNode,
    whatsappNode: WhatsappNode,
    smsNode: SmsNode,
    voiceNode: VoiceNode,
    ragNode: RagNode,
    extractorNode: ExtractorNode,
    codeNode: CodeNode,
    findRecordNode: FindRecordNode,
    calendarNode: CalendarNode,
};

// Required names for proper imports
TriggerNode.displayName = "TriggerNode";
CRMActionNode.displayName = "CRMActionNode";
ActionNode.displayName = "ActionNode";
WaitNode.displayName = "WaitNode";
ConditionNode.displayName = "ConditionNode";
SwitchNode.displayName = "SwitchNode";
LoopNode.displayName = "LoopNode";
SlackNode.displayName = "SlackNode";
WhatsappNode.displayName = "WhatsappNode";
SmsNode.displayName = "SmsNode";
HttpNode.displayName = "HttpNode";
AINode.displayName = "AINode";
VoiceNode.displayName = "VoiceNode";
RagNode.displayName = "RagNode";
ExtractorNode.displayName = "ExtractorNode";
CodeNode.displayName = "CodeNode";
FindRecordNode.displayName = "FindRecordNode";
CalendarNode.displayName = "CalendarNode";
