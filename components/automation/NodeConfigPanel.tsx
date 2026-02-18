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
                        <Label>Trigger Event</Label>
                        <Select value={triggerType} onValueChange={(val) => handleChange('triggerType', val)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FORM_SUBMISSION">Form Submission</SelectItem>
                                <SelectItem value="DEAL_STAGE_CHANGED">Deal Stage Changed</SelectItem>
                                <SelectItem value="LEAD_CREATED">New Lead Created</SelectItem>
                                <SelectItem value="DEAL_WON">Deal Won (Closed)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {triggerType === 'DEAL_STAGE_CHANGED' && (
                        <div className="space-y-2">
                            <Label>Target Stage</Label>
                            <Select value={data.stage || 'WON'} onValueChange={(val) => handleChange('stage', val)}>
                                <SelectTrigger>
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
                </div>
            )
        }

        // --- CRM ACTIONS ---
        if (type === 'crmActionNode') {
            const actionType = data.actionType || 'CREATE_TASK';
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>CRM Action Type</Label>
                        <Select value={actionType} onValueChange={(val) => handleChange('actionType', val)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CREATE_TASK">Create Task/Activity</SelectItem>
                                <SelectItem value="UPDATE_DEAL">Update Deal Property</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {actionType === 'CREATE_TASK' && (
                        <>
                            <div className="space-y-2">
                                <Label>Task Title</Label>
                                <Input
                                    value={data.taskTitle || ''}
                                    onChange={(e) => handleChange('taskTitle', e.target.value)}
                                    placeholder="e.g. Call Client for Followup"
                                />
                                <p className="text-[10px] text-gray-500">Supports variables like {'{{name}}'}</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={data.taskDescription || ''}
                                    onChange={(e) => handleChange('taskDescription', e.target.value)}
                                    placeholder="Details about the task..."
                                    className="h-20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select value={data.priority || 'MEDIUM'} onValueChange={(val) => handleChange('priority', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="LOW">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
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
                        <Label>Email Body (HTML)</Label>
                        <Textarea
                            value={data.body || ''}
                            onChange={(e) => handleChange('body', e.target.value)}
                            placeholder="Hello {{name}}, ..."
                            className="h-32 font-mono text-xs"
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
                                value={data.phoneNumber || ''}
                                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                placeholder="+123456789 (or {{phone}})"
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            value={data.message || ''}
                            onChange={(e) => handleChange('message', e.target.value)}
                            placeholder="Your notification message..."
                            className="h-24"
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
                                value={data.delayValue || '24'}
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

        return <div className="text-sm text-gray-500 italic">No configuration available for this node type.</div>;
    };

    return (
        <div className="w-80 border-l border-gray-200 p-0 bg-white absolute right-0 top-0 bottom-0 shadow-lg z-20 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                <div>
                    <h3 className="font-bold text-gray-800">Configuration</h3>
                    <p className="text-xs text-gray-500">{data.label}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">×</Button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                <div className="mb-4">
                    <Label className="text-xs text-gray-400 mb-1.5 block uppercase">Node Label</Label>
                    <Input
                        value={data.label || ''}
                        onChange={(e) => handleChange('label', e.target.value)}
                        className="bg-gray-50 font-medium"
                    />
                </div>

                <Separator className="my-4" />

                {renderContent()}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
                ID: {id}
            </div>
        </div>
    );
}
