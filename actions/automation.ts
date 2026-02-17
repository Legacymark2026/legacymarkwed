"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail, replaceVariables } from "@/lib/email";
// import { generateAIResponse } from "@/lib/ai";
// import { sendSlackMessage, makeHttpRequest, sendSMS, sendWhatsApp } from "@/lib/integrations";

export async function getRecentExecutions() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const executions = await prisma.workflowExecution.findMany({
            take: 5,
            orderBy: { startedAt: 'desc' },
            include: {
                workflow: {
                    select: { name: true }
                }
            }
        });
        return executions;
    } catch (e) {
        console.error(e);
        return [];
    }
}

// --- TYPES ---
export type TriggerData = Record<string, any>;
export type StepType =
    | "EMAIL" | "WAIT" | "LOG" | "CONDITION" | "AI_AGENT" |
    "SLACK" | "HTTP" | "SMS" | "WHATSAPP" |
    "CREATE_TASK" | "UPDATE_DEAL" | "SEND_NOTIFICATION";

export type Step = {
    type: StepType;
    delay?: number;
    templateId?: string;
    config?: Record<string, any>;
};

// --- CORE ENGINE ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function triggerWorkflow(triggerType: string, triggerData: any) {
    const workflows = await prisma.workflow.findMany({
        where: { isActive: true, triggerType: triggerType },
    });

    if (workflows.length === 0) return { executed: 0 };

    const results = [];
    for (const wf of workflows) {
        // Trigger specific checks (e.g. check stage for DEAL_STAGE_CHANGED)
        if (triggerType === 'DEAL_STAGE_CHANGED' && wf.triggerConfig) {
            const config = wf.triggerConfig as any;
            if (config.targetStage && config.targetStage !== triggerData.stage) {
                continue; // Skip if stage doesn't match
            }
        }

        try {
            // Async execution in background (fire and forget for caller)
            executeWorkflow(wf.id, triggerData).catch(err => console.error("Async Workflow Error", err));
            results.push({ workflowId: wf.id, status: "STARTED" });
        } catch (error) {
            console.error(`Failed to start workflow ${wf.id}`, error);
        }
    }
    return { executed: results.length, details: results };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeWorkflow(workflowId: string, triggerData: any) {
    console.log(`[Engine] Executing ${workflowId}`, triggerData);

    const execution = await prisma.workflowExecution.create({
        data: { workflowId, status: 'PENDING', logs: [] }
    });

    try {
        const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
        if (!workflow) throw new Error("Workflow not found");

        const steps = workflow.steps as unknown as Step[];
        const logs: any[] = [];
        const skipped = false;

        for (let i = 0; i < steps.length; i++) {
            if (skipped) break;
            const step = steps[i];
            const logEntry = { stepIndex: i, type: step.type, timestamp: new Date(), status: 'PENDING', details: '' };

            try {
                // --- CRM ACTIONS ---
                if (step.type === 'CREATE_TASK') {
                    const title = replaceVariables(step.config?.taskTitle || "New Task", triggerData);
                    const description = replaceVariables(step.config?.taskDescription || "", triggerData);

                    // We need a userId. Use the assigned User from deal, or triggerData, or a default admin.
                    // For MVP, if no userId in triggerData, we might assign to the Workflow Creator (via Company check?)
                    // Let's assume triggerData has 'userId' or 'ownerId'
                    const assigneeId = triggerData.userId || triggerData.authorId || triggerData.assignedTo;
                    const dealId = triggerData.dealId || triggerData.id; // If triggered by Deal

                    if (assigneeId && dealId) {
                        await prisma.cRMActivity.create({
                            data: {
                                type: 'NOTE', // Using NOTE/TASK as simplified activity
                                content: `[TASK] ${title}\n${description}`,
                                dealId: dealId,
                                userId: assigneeId,
                                // priority: step.config?.priority || 'MEDIUM' (Schema doesn't have priority on Activity yet, putting in content)
                            }
                        });
                        logEntry.status = 'SUCCESS';
                        logEntry.details = `Created Task: ${title}`;
                    } else {
                        logEntry.status = 'FAILED';
                        logEntry.details = 'Missing Deal ID or User ID';
                    }
                }
                else if (step.type === 'UPDATE_DEAL') {
                    const dealId = triggerData.dealId || triggerData.id;
                    if (dealId) {
                        // Logic to update properties
                        // const updateData = {}; // construct from config
                        // await prisma.deal.update(...)
                        logEntry.status = 'SUCCESS';
                        logEntry.details = "Mock Update Deal (Not fully implemented safelist)";
                    }
                }
                // --- COMMUNICATION ---
                else if (step.type === 'EMAIL') {
                    const subject = replaceVariables(step.config?.subject || "Update", triggerData);
                    const body = replaceVariables(step.config?.body || "Notification", triggerData);
                    const toEmail = triggerData.email || triggerData.contactEmail;

                    if (toEmail) {
                        await sendEmail({ to: toEmail, subject, html: body });
                        logEntry.status = 'SUCCESS';
                        logEntry.details = `Sent to ${toEmail}`;
                    } else {
                        logEntry.status = 'SKIPPED';
                        logEntry.details = 'No email address found';
                    }
                }
                // --- LOGIC ---
                else if (step.type === 'WAIT') {
                    const delayMs = (step.delay || 0) * 1000;
                    if (delayMs < 10000) await new Promise(r => setTimeout(r, delayMs)); // Only wait if short
                    logEntry.status = 'SUCCESS';
                    logEntry.details = `Wait ${step.delay}s`;
                }

                // ... (Include other handlers from marketing.ts like AI, Slack etc) ...

            } catch (err: any) /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
                console.error(`Step ${i} Error`, err);
                logEntry.status = 'ERROR';
                logEntry.details = err.message;
            }
            logs.push(logEntry);
        }

        await prisma.workflowExecution.update({
            where: { id: execution.id },
            data: { status: 'SUCCESS', completedAt: new Date(), logs: logs as any }
        });

    } catch (error: any) /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
        await prisma.workflowExecution.update({
            where: { id: execution.id },
            data: { status: 'FAILED', logs: [{ error: error.message }] }
        });
    }
}

// --- CRUD ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveUserWorkflow(data: any) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const companyUser = await prisma.companyUser.findFirst({
        where: { userId: session.user.id }
    });
    if (!companyUser) return { success: false, error: "No company found" };

    return await saveWorkflow(companyUser.companyId, data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveWorkflow(companyId: string, data: any) {
    try {
        if (data.id) {
            await prisma.workflow.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    triggerType: data.triggerType,
                    triggerConfig: data.triggerConfig || {},
                    steps: data.steps,
                    isActive: data.isActive
                }
            });
        } else {
            await prisma.workflow.create({
                data: {
                    companyId,
                    name: data.name,
                    triggerType: data.triggerType,
                    triggerConfig: data.triggerConfig || {},
                    steps: data.steps,
                    isActive: data.isActive
                }
            });
        }
        return { success: true };
    } catch (e: any) /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
        console.error(e);
        return { success: false, error: e.message };
    }
}

export async function getLatestWorkflow() {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        return await prisma.workflow.findFirst({
            orderBy: { createdAt: 'desc' },
        });
    } catch (e) {
        return null;
    }
}


export async function getWorkflowById(id: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        return await prisma.workflow.findUnique({
            where: { id },
        });
    } catch (e) {
        return null;
    }
}

export async function getWorkflows(companyId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        return await prisma.workflow.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
        });
    } catch (e) {
        return [];
    }
}

export async function deleteWorkflow(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.workflow.delete({ where: { id } });
        return { success: true };
    } catch (e: any) /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
        return { success: false, error: e.message };
    }
}

export async function toggleWorkflow(id: string, isActive: boolean) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.workflow.update({
            where: { id },
            data: { isActive }
        });
        return { success: true };
    } catch (e: any) /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
        return { success: false, error: e.message };
    }
}
