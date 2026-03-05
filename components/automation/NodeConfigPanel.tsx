"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface NodeConfigPanelProps {
    selectedNode: any;
    onChange: (nodeId: string, newData: any) => void;
    onClose: () => void;
}

export default function NodeConfigPanel({ selectedNode, onChange, onClose }: NodeConfigPanelProps) {
    const { id, type, data } = selectedNode;

    const handleChange = (key: string, value: any) => {
        onChange(id, { ...data, [key]: value });
    };

    const renderContent = () => {
        // --- TRIGGERS ---
        if (type === 'triggerNode') {
            const triggerType = data.triggerType || 'FORM_SUBMISSION';
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="font-semibold text-indigo-900">Tipo de Disparador</Label>
                        <Select value={triggerType} onValueChange={(val) => handleChange('triggerType', val)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FORM_SUBMISSION">Form Submission</SelectItem>
                                <SelectItem value="DEAL_STAGE_CHANGED">Deal Stage Changed</SelectItem>
                                <SelectItem value="LEAD_CREATED">New Lead Created</SelectItem>
                                <SelectItem value="DEAL_WON">Deal Won (Closed)</SelectItem>
                                <SelectItem value="SCHEDULE">Time Schedule (Cron)</SelectItem>
                                <SelectItem value="WEBHOOK_LISTENER">Webhook Listener</SelectItem>
                                <SelectItem value="LEAD_SCORE">Lead Score Reached</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {triggerType === 'DEAL_STAGE_CHANGED' && (
                        <div className="space-y-2 bg-purple-50 p-3 rounded-lg border border-purple-100">
                            <Label>Target Stage</Label>
                            <Select value={data.stage || 'WON'} onValueChange={(val) => handleChange('stage', val)}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                                    <SelectItem value="PROPOSAL">Proposal Sent</SelectItem>
                                    <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                                    <SelectItem value="WON">Won</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {triggerType === 'SCHEDULE' && (
                        <div className="space-y-2 bg-rose-50 p-3 rounded-lg border border-rose-100">
                            <Label>Cron Expression</Label>
                            <Input
                                value={data.cronExpression || ''}
                                onChange={(e) => handleChange('cronExpression', e.target.value)}
                                placeholder="0 9 * * 1 (Every Monday at 9AM)"
                                className="font-mono bg-white"
                            />
                        </div>
                    )}

                    {triggerType === 'WEBHOOK_LISTENER' && (
                        <div className="space-y-2 bg-teal-50 p-3 rounded-lg border border-teal-100">
                            <Label>Webhook Endpoint (Auto-Generated)</Label>
                            <Input
                                disabled
                                value={`https://legacymark.com/api/webhooks/${id}`}
                                className="font-mono text-xs bg-gray-100 text-gray-500"
                            />
                            <p className="text-[10px] text-gray-500">Send POST requests to this URL.</p>
                        </div>
                    )}

                    {triggerType === 'LEAD_SCORE' && (
                        <div className="space-y-2 bg-fuchsia-50 p-3 rounded-lg border border-fuchsia-100">
                            <Label>Target Score (Greater Than)</Label>
                            <Input
                                type="number"
                                value={data.targetScore || 50}
                                onChange={(e) => handleChange('targetScore', e.target.value)}
                                className="bg-white"
                            />
                        </div>
                    )}
                </div>
            )
        }

        // --- CRM ACTIONS ---
        if (type === 'crmActionNode') {
            const actionType = data.actionType || 'CREATE_TASK';
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="font-semibold text-emerald-900">CRM Action Type</Label>
                        <Select value={actionType} onValueChange={(val) => handleChange('actionType', val)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CREATE_TASK">Create Task/Activity</SelectItem>
                                <SelectItem value="UPDATE_DEAL">Update Deal Property</SelectItem>
                                <SelectItem value="ADD_TAG">Add Tag to Contact</SelectItem>
                                <SelectItem value="REMOVE_TAG">Remove Tag</SelectItem>
                                <SelectItem value="ASSIGN_USER">Assign to Sales Rep</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {actionType === 'CREATE_TASK' && (
                        <div className="space-y-3 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                            <div className="space-y-1">
                                <Label>Task Title</Label>
                                <Input
                                    value={data.taskTitle || ''}
                                    onChange={(e) => handleChange('taskTitle', e.target.value)}
                                    placeholder="e.g. Call Client for Followup"
                                    className="bg-white"
                                />
                                <p className="text-[10px] text-gray-500">Variables allow: {'{{trigger.lead.name}}'}</p>
                            </div>
                            <div className="space-y-1">
                                <Label>Description</Label>
                                <Textarea
                                    value={data.taskDescription || ''}
                                    onChange={(e) => handleChange('taskDescription', e.target.value)}
                                    placeholder="Details about the task..."
                                    className="h-20 bg-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Priority</Label>
                                <Select value={data.priority || 'MEDIUM'} onValueChange={(val) => handleChange('priority', val)}>
                                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="LOW">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {(actionType === 'ADD_TAG' || actionType === 'REMOVE_TAG') && (
                        <div className="space-y-2 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                            <Label>Tag Name</Label>
                            <Input
                                value={data.tagName || ''}
                                onChange={(e) => handleChange('tagName', e.target.value)}
                                placeholder="High Value, VIP, etc"
                                className="bg-white"
                            />
                        </div>
                    )}

                    {actionType === 'ASSIGN_USER' && (
                        <div className="space-y-2 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                            <Label>User ID / Team</Label>
                            <Input
                                value={data.userId || ''}
                                onChange={(e) => handleChange('userId', e.target.value)}
                                placeholder="user_uuid or {{round_robin}}"
                                className="bg-white"
                            />
                        </div>
                    )}
                </div>
            )
        }

        // --- EMAIL ACTION ---
        if (type === 'actionNode') {
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Subject Line</Label>
                        <Input
                            value={data.subject || ''}
                            onChange={(e) => handleChange('subject', e.target.value)}
                            placeholder="Welcome to our service!"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Email Template Selector</Label>
                        <Select value={data.templateId || 'blank'} onValueChange={(val) => handleChange('templateId', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="blank">No Template (Blank HTML)</SelectItem>
                                <SelectItem value="welcome">Welcome Onboarding</SelectItem>
                                <SelectItem value="followup">Sales Follow-up</SelectItem>
                                <SelectItem value="newsletter">Monthly Newsletter</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Email Body (HTML/Markdown)</Label>
                        <Textarea
                            value={data.body || ''}
                            onChange={(e) => handleChange('body', e.target.value)}
                            placeholder="Hello {{lead.name}}, ..."
                            className="h-32 font-mono text-xs bg-gray-50"
                        />
                    </div>
                </div>
            );
        }

        // --- SLACK / MESSAGE ---
        if (type === 'slackNode' || type === 'smsNode' || type === 'whatsappNode') {
            return (
                <div className="space-y-4">
                    {type === 'slackNode' && (
                        <div className="space-y-2">
                            <Label>Webhook URL</Label>
                            <Input
                                value={data.webhookUrl || ''}
                                onChange={(e) => handleChange('webhookUrl', e.target.value)}
                                placeholder="https://hooks.slack.com/..."
                            />
                        </div>
                    )}
                    {(type === 'smsNode' || type === 'whatsappNode') && (
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                                value={data.phoneNumber || '{{lead.phone}}'}
                                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                placeholder="+123456789 (or {{lead.phone}})"
                                className="font-mono text-xs"
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            value={data.message || ''}
                            onChange={(e) => handleChange('message', e.target.value)}
                            placeholder="Your notification message... Variables: {{lead.name}}"
                            className="h-24"
                        />
                    </div>
                </div>
            );
        }

        // --- HTTP REQUEST ---
        if (type === 'httpNode') {
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Method</Label>
                        <Select value={data.method || 'POST'} onValueChange={(val) => handleChange('method', val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Endpoint URL</Label>
                        <Input
                            value={data.url || ''}
                            onChange={(e) => handleChange('url', e.target.value)}
                            placeholder="https://api.external.com/v1/data"
                            className="font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>JSON Payload Builder</Label>
                        <Textarea
                            value={data.payload || '{\n  "data": "{{lead.id}}"\n}'}
                            onChange={(e) => handleChange('payload', e.target.value)}
                            className="h-32 font-mono text-xs bg-gray-900 text-green-400"
                        />
                    </div>
                </div>
            );
        }

        // --- LOGIC: WAIT ---
        if (type === 'waitNode') {
            return (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <div className="w-1/2 space-y-2">
                            <Label>Value</Label>
                            <Input
                                type="number"
                                value={data.delayValue || '1'}
                                onChange={(e) => handleChange('delayValue', e.target.value)}
                            />
                        </div>
                        <div className="w-1/2 space-y-2">
                            <Label>Unit</Label>
                            <Select value={data.delayUnit || 'h'} onValueChange={(val) => handleChange('delayUnit', val)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="m">Minutes</SelectItem>
                                    <SelectItem value="h">Hours</SelectItem>
                                    <SelectItem value="d">Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            );
        }

        // --- LOGIC: CONDITION ---
        if (type === 'conditionNode') {
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Variable</Label>
                        <Input
                            value={data.variable || '{{lead.email}}'}
                            onChange={(e) => handleChange('variable', e.target.value)}
                            placeholder="{{lead.status}}"
                            className="font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Operator</Label>
                        <Select value={data.operator || 'EQUALS'} onValueChange={(val) => handleChange('operator', val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EQUALS">Equals</SelectItem>
                                <SelectItem value="NOT_EQUALS">Does not equal</SelectItem>
                                <SelectItem value="CONTAINS">Contains</SelectItem>
                                <SelectItem value="GREATER_THAN">Greater than</SelectItem>
                                <SelectItem value="LESS_THAN">Less than</SelectItem>
                                <SelectItem value="EXISTS">Exists</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Condition Value</Label>
                        <Input
                            value={data.conditionValue || ''}
                            onChange={(e) => handleChange('conditionValue', e.target.value)}
                            placeholder="Value to test against"
                        />
                    </div>
                </div>
            );
        }

        // --- LOGIC: SWITCH ---
        if (type === 'switchNode') {
            const branches = Array.isArray(data.branches) ? data.branches : [
                { id: 'case_1', label: 'Case 1', value: 'value1' },
                { id: 'case_2', label: 'Case 2', value: 'value2' }
            ];

            const updateBranch = (index: number, key: string, val: string) => {
                const newBranches = [...branches];
                newBranches[index] = { ...newBranches[index], [key]: val };
                handleChange('branches', newBranches);
            };

            const addBranch = () => {
                const newId = `case_${Date.now()}`;
                handleChange('branches', [...branches, { id: newId, label: `Case ${branches.length + 1}`, value: '' }]);
            };

            const removeBranch = (index: number) => {
                if (branches.length <= 1) return;
                const newBranches = [...branches];
                newBranches.splice(index, 1);
                handleChange('branches', newBranches);
            };

            return (
                <div className="space-y-4">
                    <div className="space-y-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-4">
                        <Label>Variable a Evaluar</Label>
                        <Input
                            value={data.variable || ''}
                            onChange={(e) => handleChange('variable', e.target.value)}
                            placeholder="{{lead.tier}}"
                            className="font-mono text-xs bg-white"
                        />
                        <p className="text-[10px] text-gray-500">Ej. {'{{lead.status}}'}</p>
                    </div>

                    <div className="space-y-3">
                        <Label className="flex justify-between items-center">
                            <span>Casos / Caminos</span>
                            <Button variant="outline" size="sm" onClick={addBranch} className="h-6 text-xs px-2">+ Añadir</Button>
                        </Label>

                        {branches.map((b: any, i: number) => (
                            <div key={b.id || i} className="flex gap-2 items-start bg-gray-50 p-2 rounded border border-gray-100">
                                <div className="space-y-2 flex-1">
                                    <Input
                                        value={b.label}
                                        onChange={e => updateBranch(i, 'label', e.target.value)}
                                        placeholder={`Etiqueta Camino ${i + 1}`}
                                        className="h-7 text-xs bg-white"
                                    />
                                    <Input
                                        value={b.value}
                                        onChange={e => updateBranch(i, 'value', e.target.value)}
                                        placeholder={`Valor para igualar`}
                                        className="h-7 text-xs font-mono bg-white"
                                    />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeBranch(i)} className="h-7 w-7 text-red-500 hover:bg-red-50" disabled={branches.length <= 1}>
                                    ×
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // --- LOGIC: LOOP ---
        if (type === 'loopNode') {
            return (
                <div className="space-y-4">
                    <div className="space-y-2 bg-teal-50 p-3 rounded-lg border border-teal-100">
                        <Label>Variable a Iterar (Array/Lista)</Label>
                        <Input
                            value={data.iterableVariable || ''}
                            onChange={(e) => handleChange('iterableVariable', e.target.value)}
                            placeholder="{{lead.purchases}}"
                            className="font-mono text-xs bg-white"
                        />
                        <p className="text-[10px] text-gray-500">
                            Itera sobre una lista. Dentro del bucle usa {'{{item}}'} para acceder al valor actual.
                        </p>
                    </div>
                </div>
            );
        }

        // --- ADVANCED AI & DATA NODES ---
        if (type === 'voiceNode') {
            return (
                <div className="space-y-4">
                    <div className="space-y-2 bg-violet-50 p-3 rounded-lg border border-violet-100">
                        <Label>URL del Audio a Transcribir</Label>
                        <Input
                            value={data.audioUrlVariable || ''}
                            onChange={(e) => handleChange('audioUrlVariable', e.target.value)}
                            placeholder="{{trigger.mediaUrl}}"
                            className="font-mono text-xs bg-white"
                        />
                        <p className="text-[10px] text-gray-500">Ej. URL del webhook entrante de WhatsApp.</p>
                    </div>
                </div>
            );
        }

        if (type === 'ragNode') {
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Fuente de Documentos</Label>
                        <Select value={data.documentSource || 'ALL'} onValueChange={(val) => handleChange('documentSource', val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todo el repositorio (Global)</SelectItem>
                                <SelectItem value="SALES">Manual de Ventas</SelectItem>
                                <SelectItem value="SUPPORT">FAQs de Soporte</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Pregunta / Query</Label>
                        <Textarea
                            value={data.queryVariable || ''}
                            onChange={(e) => handleChange('queryVariable', e.target.value)}
                            placeholder="{{lead.lastMessage}}"
                            className="h-20 font-mono text-xs"
                        />
                    </div>
                </div>
            );
        }

        if (type === 'extractorNode') {
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Texto de Entrada</Label>
                        <Input
                            value={data.textVariable || ''}
                            onChange={(e) => handleChange('textVariable', e.target.value)}
                            placeholder="{{lead.lastMessage}}"
                            className="font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Esquema JSON Esperado</Label>
                        <Textarea
                            value={data.schemaKeys || '{\n  "producto": "string",\n  "cantidad": "number",\n  "urgencia": "alta|media|baja"\n}'}
                            onChange={(e) => handleChange('schemaKeys', e.target.value)}
                            className="h-32 font-mono text-xs bg-gray-900 text-amber-400"
                        />
                        <p className="text-[10px] text-gray-500">La IA intentará estructurar el texto según este esquema exacto.</p>
                    </div>
                </div>
            );
        }

        if (type === 'codeNode') {
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="flex justify-between items-center">
                            <span>JavaScript (Node.js)</span>
                        </Label>
                        <Textarea
                            value={data.code || 'return { \n  result: true \n};'}
                            onChange={(e) => handleChange('code', e.target.value)}
                            className="h-48 font-mono text-[11px] bg-gray-950 text-green-400 border-gray-800"
                            spellCheck={false}
                        />
                        <p className="text-[10px] text-gray-500">Puedes acceder a <code>triggerData</code> y <code>workflowData</code>.</p>
                    </div>
                </div>
            );
        }

        if (type === 'findRecordNode') {
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Buscar Por</Label>
                        <Select value={data.searchBy || 'EMAIL'} onValueChange={(val) => handleChange('searchBy', val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EMAIL">Email</SelectItem>
                                <SelectItem value="PHONE">Teléfono (WhatsApp)</SelectItem>
                                <SelectItem value="ID">Lead ID Exacto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Valor a Buscar</Label>
                        <Input
                            value={data.searchValue || ''}
                            onChange={(e) => handleChange('searchValue', e.target.value)}
                            placeholder="{{trigger.phone}}"
                            className="font-mono text-xs"
                        />
                    </div>
                </div>
            );
        }

        if (type === 'calendarNode') {
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Título del Evento</Label>
                        <Input
                            value={data.eventTitle || 'Consultoría Inicial'}
                            onChange={(e) => handleChange('eventTitle', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Email del Invitado</Label>
                        <Input
                            value={data.attendeeEmail || '{{lead.email}}'}
                            onChange={(e) => handleChange('attendeeEmail', e.target.value)}
                            className="font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Duración (Minutos)</Label>
                        <Input
                            type="number"
                            value={data.eventDuration || '30'}
                            onChange={(e) => handleChange('eventDuration', e.target.value)}
                        />
                    </div>
                </div>
            );
        }

        // --- AI AGENT ---
        if (type === 'aiNode') {
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>AI Task</Label>
                        <Select value={data.aiTask || 'SENTIMENT'} onValueChange={(val) => handleChange('aiTask', val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SENTIMENT">Analyze Sentiment</SelectItem>
                                <SelectItem value="GENERATION">Generate Text Response</SelectItem>
                                <SelectItem value="SUMMARIZE">Summarize Data</SelectItem>
                                <SelectItem value="EXTRACTION">Extract Key Info</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Context / Prompt</Label>
                        <Textarea
                            value={data.promptContext || ''}
                            onChange={(e) => handleChange('promptContext', e.target.value)}
                            placeholder="Additional instructions for the AI..."
                            className="h-24"
                        />
                    </div>
                </div>
            );
        }

        return <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded">No configuration available for this node type. Select a different node.</div>;
    };

    return (
        <div className="w-80 border-l border-gray-200 p-0 bg-white absolute right-0 top-0 bottom-0 shadow-2xl z-20 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur">
                <div>
                    <h3 className="font-bold text-gray-800 tracking-tight">Configuration</h3>
                    <p className="text-xs text-indigo-600 font-medium">{data.label || 'Node Properties'}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-gray-200">×</Button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                <div className="mb-4">
                    <Label className="text-[10px] text-gray-400 font-bold mb-1 block uppercase tracking-wider">Node Name / Label</Label>
                    <Input
                        value={data.label || ''}
                        onChange={(e) => handleChange('label', e.target.value)}
                        className="bg-gray-50/50 font-medium border-gray-200 focus:bg-white transition-colors"
                    />
                </div>

                <Separator className="my-5" />

                {renderContent()}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-400 font-mono text-center truncate">
                ID: {id}
            </div>
        </div>
    );
}
