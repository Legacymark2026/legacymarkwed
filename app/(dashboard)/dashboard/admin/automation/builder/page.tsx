"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    Connection,
    Edge,
    MarkerType,
    Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Loader2, Save, Play, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

import Sidebar from '@/components/automation/Sidebar';
import { nodeTypes } from '@/components/automation/CustomNodes';
import NodeConfigPanel from '@/components/automation/NodeConfigPanel';
import { saveUserWorkflow, getLatestWorkflow, getWorkflowById } from '@/actions/automation';

const initialNodes = [
    {
        id: 'start',
        type: 'triggerNode',
        data: { label: 'Form Submission', triggerType: 'FORM_SUBMISSION' },
        position: { x: 250, y: 50 },
    },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

function AutomationBuilder() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [workflowId, setWorkflowId] = useState<string | null>(null);
    const [workflowName, setWorkflowName] = useState('New Workflow');

    // Config Panel State
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();

    // --- Load Workflow on Mount ---
    useEffect(() => {
        const idParam = searchParams.get('id');
        const isNew = searchParams.get('new');

        if (idParam) {
            loadWorkflowById(idParam);
        } else if (isNew) {
            setIsLoading(false); // Start fresh
        } else {
            // Fallback: Try load latest if no params
            loadLatestWorkflow();
        }
    }, [searchParams]);

    const loadWorkflowById = async (id: string) => {
        setIsLoading(true);
        try {
            const workflow = await getWorkflowById(id);
            if (workflow) {
                setWorkflowId(workflow.id);
                setWorkflowName(workflow.name);
                if (workflow.steps) {
                    const { nodes: newNodes, edges: newEdges } = transformStepsToGraph(workflow);
                    setNodes(newNodes);
                    setEdges(newEdges);
                    setTimeout(() => reactFlowInstance?.fitView(), 100);
                }
            } else {
                toast.error("Workflow not found");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load workflow");
        } finally {
            setIsLoading(false);
        }
    };

    const loadLatestWorkflow = async () => {
        setIsLoading(true);
        try {
            const workflow = await getLatestWorkflow();
            if (workflow && workflow.steps) {
                setWorkflowId(workflow.id);
                setWorkflowName(workflow.name);
                const { nodes: newNodes, edges: newEdges } = transformStepsToGraph(workflow);
                setNodes(newNodes);
                setEdges(newEdges);
                setTimeout(() => reactFlowInstance?.fitView(), 100);
            }
        } catch (error) {
            console.error("Failed to load workflow", error);
        } finally {
            setIsLoading(false);
        }
    };

    const transformStepsToGraph = (workflow: any) => {
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        let yPos = 50;
        const xPos = 250;

        // 1. Trigger Node
        const triggerId = 'start';
        newNodes.push({
            id: triggerId,
            type: 'triggerNode',
            position: { x: xPos, y: yPos },
            data: {
                label: workflow.triggerType === 'DEAL_STAGE_CHANGED' ? 'Deal Stage' : 'Trigger',
                triggerType: workflow.triggerType,
                ...(workflow.triggerConfig as any)
            }
        });

        yPos += 150;
        let previousNodeId = triggerId;

        // 2. Steps
        const steps = workflow.steps as any[];
        if (Array.isArray(steps)) {
            steps.forEach((step, index) => {
                const stepId = `step_${index}`;
                let type = 'actionNode'; // Default
                let data = { ...step.config };

                // Map Step Type to Node Type
                if (step.type === 'WAIT') {
                    type = 'waitNode';
                    // Convert seconds back to display value
                    const delay = step.delay || 0;
                    if (delay >= 86400 && delay % 86400 === 0) {
                        data = { delayValue: delay / 86400, delayUnit: 'd' };
                    } else if (delay >= 3600 && delay % 3600 === 0) {
                        data = { delayValue: delay / 3600, delayUnit: 'h' };
                    } else {
                        data = { delayValue: Math.floor(delay / 60), delayUnit: 'm' };
                    }
                } else if (step.type === 'CREATE_TASK' || step.type === 'UPDATE_DEAL') {
                    type = 'crmActionNode';
                    data = { ...step.config, actionType: step.type };
                } else if (step.type === 'SLACK') {
                    type = 'slackNode';
                } else if (step.type === 'AI_AGENT') {
                    type = 'aiNode';
                } else if (step.type === 'CONDITION') {
                    type = 'conditionNode';
                    data = {
                        variable: step.config?.variable,
                        operator: step.config?.operator,
                        conditionValue: step.config?.value
                    };
                }

                newNodes.push({
                    id: stepId,
                    type,
                    position: { x: xPos, y: yPos },
                    data
                });

                // Create Edge
                newEdges.push({
                    id: `e_${previousNodeId}_${stepId}`,
                    source: previousNodeId,
                    target: stepId,
                    markerEnd: { type: MarkerType.ArrowClosed }
                });

                previousNodeId = stepId;
                yPos += 150;

                // Ensure ID counter is ahead of steps
                id = Math.max(id, index + 2);
            });
        }

        return { nodes: newNodes, edges: newEdges };
    };

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow/type');
            const label = event.dataTransfer.getData('application/reactflow/label');
            const dataStr = event.dataTransfer.getData('application/reactflow/data');
            const extraData = dataStr ? JSON.parse(dataStr) : {};

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: getId(),
                type,
                position,
                data: { label: label, ...extraData },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onNodeDataChange = (nodeId: string, newData: any) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === nodeId) {
                return { ...node, data: newData };
            }
            return node;
        }));
        setSelectedNode((prev) => prev?.id === nodeId ? { ...prev, data: newData } : prev);
    };

    const transformGraphToSteps = () => {
        const steps: any[] = [];
        let currentNode = nodes.find((n) => n.type === 'triggerNode');
        let limit = 0;

        while (currentNode && limit < 50) {
            let edge = edges.find((e) => e.source === currentNode?.id);
            if (currentNode?.type === 'conditionNode') {
                const trueEdge = edges.find(e => e.source === currentNode?.id && e.sourceHandle === 'true');
                edge = trueEdge || edges.find(e => e.source === currentNode?.id);
                steps.push({
                    type: 'CONDITION',
                    config: {
                        variable: (currentNode.data as any).variable || 'email',
                        operator: (currentNode.data as any).operator || 'contains',
                        value: (currentNode.data as any).conditionValue || (currentNode.data as any).value
                    }
                });
            }

            if (!edge) break;
            const nextNode = nodes.find((n) => n.id === edge.target);
            if (!nextNode) break;

            const nodeData = nextNode.data as any;

            if (nextNode.type === 'actionNode') {
                steps.push({
                    type: 'EMAIL',
                    templateId: nodeData.templateId || 'default-template',
                    config: { subject: nodeData.subject, body: nodeData.body }
                });
            } else if (nextNode.type === 'crmActionNode') {
                steps.push({
                    type: (nodeData.actionType as any) || 'CREATE_TASK',
                    config: {
                        taskTitle: nodeData.taskTitle,
                        taskDescription: nodeData.taskDescription,
                        priority: nodeData.priority,
                        dealStage: nodeData.dealStage
                    }
                });
            } else if (nextNode.type === 'waitNode') {
                const val = parseInt(nodeData.delayValue || '24');
                const unit = nodeData.delayUnit || 'h';
                let seconds = val * 3600;
                if (unit === 'm') seconds = val * 60;
                if (unit === 'd') seconds = val * 86400;

                steps.push({ type: 'WAIT', delay: seconds });
            } else if (nextNode.type === 'conditionNode') {
                // Handled in loop start
            } else if (nextNode.type === 'aiNode') {
                steps.push({
                    type: 'AI_AGENT',
                    config: { aiTask: nodeData.aiTask || 'SENTIMENT', promptContext: nodeData.promptContext || '' }
                });
            } else if (nextNode.type === 'slackNode') {
                steps.push({
                    type: 'SLACK',
                    config: { webhookUrl: nodeData.webhookUrl, message: nodeData.message }
                });
            } else if (nextNode.type === 'httpNode') {
                steps.push({
                    type: 'HTTP',
                    config: { url: nodeData.url, method: nodeData.method || 'POST' }
                });
            } else if (nextNode.type === 'smsNode') {
                steps.push({
                    type: 'SMS',
                    config: { phoneNumber: nodeData.phoneNumber, message: nodeData.message }
                });
            } else if (nextNode.type === 'whatsappNode') {
                steps.push({
                    type: 'WHATSAPP',
                    config: { phoneNumber: nodeData.phoneNumber, message: nodeData.message }
                });
            }

            currentNode = nextNode;
            limit++;
        }
        return steps;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const steps = transformGraphToSteps();
            // Get trigger node for config
            const triggerNode = nodes.find(n => n.type === 'triggerNode');
            const triggerType = triggerNode?.data?.triggerType || 'FORM_SUBMISSION';
            const triggerConfig = { ...triggerNode?.data };
            delete triggerConfig.label; // clean up

            const result = await saveUserWorkflow({
                id: workflowId, // Update existing if ID present
                name: workflowName, // Could add name edit field
                triggerType: triggerType,
                triggerConfig: triggerConfig,
                steps: steps,
                isActive: true
            });

            if (result.success) {
                toast.success('Workflow saved successfully!');
                // If new, maybe redirect or set ID? For now, just success.
            } else {
                toast.error(result.error || 'Failed to save');
            }
        } catch (e: any) {
            toast.error('Error saving: ' + e.message);
        }
        setIsSaving(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] w-full relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
                </div>
            )}

            <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-10 w-full">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin/automation">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <ChevronLeft size={16} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{workflowName}</h1>
                        {workflowId && <div className="text-[10px] text-gray-400 font-mono">{workflowId}</div>}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-300 px-3 py-1.5 rounded-md transition-all text-sm">
                        <Play size={16} /> Test Run
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar />
                <div className="flex-1 h-full bg-gray-50 relative" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        onPaneClick={() => setSelectedNode(null)}
                        fitView
                    >
                        <Background color="#f1f5f9" gap={16} size={1} />
                        <Controls className="bg-white shadow-md border-gray-200" />
                    </ReactFlow>

                    {selectedNode && (
                        <NodeConfigPanel
                            selectedNode={selectedNode}
                            onChange={onNodeDataChange}
                            onClose={() => setSelectedNode(null)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>}>
            <ReactFlowProvider>
                <AutomationBuilder />
            </ReactFlowProvider>
        </Suspense>
    );
}
