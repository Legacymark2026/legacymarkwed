'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface RecipientInput {
    email: string;
    name?: string;
    [key: string]: string | undefined;
}

export interface CreateEmailBlastInput {
    name: string;
    subject: string;
    htmlBody: string;
    fromName?: string;
    fromEmail?: string;
    recipients: RecipientInput[];
}

// ── Obtener empresas activas del usuario ──────────────────────────────────

async function getCompanyId(): Promise<string> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('No autenticado');

    const cu = await prisma.companyUser.findFirst({
        where: { userId: session.user.id },
        select: { companyId: true },
    });
    if (!cu) throw new Error('Sin empresa asignada');
    return cu.companyId;
}

// ── Crear un blast (guardarlo en BD como DRAFT) ───────────────────────────

export async function createEmailBlast(input: CreateEmailBlastInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('No autenticado');
    const companyId = await getCompanyId();

    const blast = await prisma.emailBlast.create({
        data: {
            name: input.name,
            subject: input.subject,
            htmlBody: input.htmlBody,
            fromName: input.fromName ?? 'LegacyMark',
            fromEmail: input.fromEmail ?? 'noreply@legacymarksas.com',
            status: 'DRAFT',
            totalRecipients: input.recipients.length,
            companyId,
            createdById: session.user.id,
            recipients: {
                create: input.recipients.map((r) => ({
                    email: r.email,
                    name: r.name,
                    variables: Object.fromEntries(
                        Object.entries(r).filter(([k]) => !['email', 'name'].includes(k))
                    ),
                    status: 'PENDING',
                })),
            },
        },
        include: { recipients: true },
    });

    return blast;
}

// ── Obtener lista de blasts de la empresa ─────────────────────────────────

export async function getEmailBlasts() {
    const companyId = await getCompanyId();

    return prisma.emailBlast.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            subject: true,
            status: true,
            totalRecipients: true,
            sent: true,
            failed: true,
            sentAt: true,
            createdAt: true,
        },
    });
}

// ── Enviar un blast (procesado chunk-by-chunk) ────────────────────────────

export async function sendEmailBlast(blastId: string) {
    const companyId = await getCompanyId();

    const blast = await prisma.emailBlast.findFirst({
        where: { id: blastId, companyId },
        include: { recipients: { where: { status: 'PENDING' } } },
    });

    if (!blast) throw new Error('Blast no encontrado');
    if (blast.status === 'SENDING') throw new Error('Ya está enviándose');

    await prisma.emailBlast.update({
        where: { id: blastId },
        data: { status: 'SENDING' },
    });

    const CHUNK_SIZE = 50;
    let totalSent = 0;
    let totalFailed = 0;

    const recipients = blast.recipients;
    const chunks: typeof recipients[] = [];
    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
        chunks.push(recipients.slice(i, i + CHUNK_SIZE));
    }

    for (const chunk of chunks) {
        const emails = chunk.map((r) => {
            const vars = (r.variables as Record<string, string>) ?? {};
            const html = blast.htmlBody.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? r.name ?? '');
            return {
                from: `${blast.fromName} <${blast.fromEmail}>`,
                to: r.email,
                subject: blast.subject,
                html,
            };
        });

        try {
            // Resend free tier: send individually in parallel within chunk
            const results = await Promise.allSettled(
                emails.map((e) => resend.emails.send({ from: e.from, to: e.to, subject: e.subject, html: e.html }))
            );

            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const recipient = chunk[i];
                if (result.status === 'fulfilled' && result.value.data?.id) {
                    await prisma.emailBlastRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'SENT', sentAt: new Date() },
                    });
                    totalSent++;
                } else {
                    const errMsg = result.status === 'rejected' ? String(result.reason) : 'Error desconocido';
                    await prisma.emailBlastRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'FAILED', errorMessage: errMsg },
                    });
                    totalFailed++;
                }
            }
        } catch (err) {
            // Mark all in chunk as failed
            await prisma.emailBlastRecipient.updateMany({
                where: { id: { in: chunk.map((r) => r.id) } },
                data: { status: 'FAILED', errorMessage: String(err) },
            });
            totalFailed += chunk.length;
        }

        // Rate limit pause between chunks
        await new Promise((r) => setTimeout(r, 300));
    }

    await prisma.emailBlast.update({
        where: { id: blastId },
        data: {
            status: totalFailed === recipients.length ? 'FAILED' : 'COMPLETED',
            sent: totalSent,
            failed: totalFailed,
            sentAt: new Date(),
        },
    });

    return { sent: totalSent, failed: totalFailed };
}

// ── Estadísticas de un blast ──────────────────────────────────────────────

export async function getEmailBlastStats(blastId: string) {
    const companyId = await getCompanyId();

    const blast = await prisma.emailBlast.findFirst({
        where: { id: blastId, companyId },
        include: {
            recipients: {
                select: { email: true, name: true, status: true, errorMessage: true, sentAt: true },
                orderBy: { status: 'asc' },
            },
        },
    });
    if (!blast) throw new Error('Blast no encontrado');
    return blast;
}

// ── Eliminar un blast ─────────────────────────────────────────────────────

export async function deleteEmailBlast(blastId: string) {
    const companyId = await getCompanyId();
    await prisma.emailBlast.delete({ where: { id: blastId, companyId } });
    return { success: true };
}

// ── Enviar email de prueba ────────────────────────────────────────────────

export async function sendTestEmail(subject: string, html: string, toEmail: string) {
    const result = await resend.emails.send({
        from: 'LegacyMark <noreply@legacymarksas.com>',
        to: toEmail,
        subject: `[PRUEBA] ${subject}`,
        html,
    });
    return { success: !!result.data?.id, id: result.data?.id };
}
