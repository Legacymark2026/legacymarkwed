'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

import { Resend } from 'resend';

// Lazy getter — avoids running Resend() at module level during Next.js build
function getResend() {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY not configured');
    return new Resend(key);
}

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
            // Case-insensitive variables lookup
            const getVar = (key: string) => {
                const k = key.toLowerCase();
                if (k === 'unsubscribe_url') return `https://legacymarksas.com/unsubscribe?e=${encodeURIComponent(r.email)}`;
                const foundKey = Object.keys(vars).find(v => v.toLowerCase() === k);
                return (foundKey ? vars[foundKey] : null) ?? r.name ?? '';
            };

            const html = blast.htmlBody.replace(/\{\{(\w+)\}\}/g, (_, k) => getVar(k));
            const subject = blast.subject.replace(/\{\{(\w+)\}\}/g, (_, k) => getVar(k));
            
            return {
                from: `${blast.fromName} <${blast.fromEmail}>`,
                to: r.email,
                subject,
                html,
                // headers: {
                //    'List-Unsubscribe': `<https://legacymarksas.com/unsubscribe?e=${encodeURIComponent(r.email)}>, <mailto:unsubscribe@legacymarksas.com?subject=unsubscribe%20${r.email}>`,
                // }
            };
        });

        try {
            // Envío secuencial con retraso para respetar el límite gratuito de Resend (2/seg)
            for (let i = 0; i < emails.length; i++) {
                const e = emails[i];
                const recipient = chunk[i];

                try {
                    console.log(`[EmailBlast] Enviando (${i+1}/${emails.length}) a ${e.to} | De: ${e.from}`);
                    const result = await getResend().emails.send({
                        from: e.from,
                        to: e.to,
                        subject: e.subject,
                        html: e.html,
                        // headers: e.headers
                    });

                    if (result.data?.id) {
                        await prisma.emailBlastRecipient.update({
                            where: { id: recipient.id },
                            data: { status: 'SENT', sentAt: new Date() },
                        });
                        totalSent++;
                    } else if (result.error) {
                        await prisma.emailBlastRecipient.update({
                            where: { id: recipient.id },
                            data: { status: 'FAILED', errorMessage: result.error.message || 'Error de la API de Resend' },
                        });
                        totalFailed++;
                    }
                } catch (err: any) {
                    await prisma.emailBlastRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'FAILED', errorMessage: err.message || String(err) },
                    });
                    totalFailed++;
                }

                // Pausa de 600ms para asegurar máximo 1.6 envíos por segundo
                await new Promise((r) => setTimeout(r, 600));
            }
        } catch (err: any) {
            // Failsafe general
            await prisma.emailBlastRecipient.updateMany({
                where: { id: { in: chunk.map((r) => r.id) } },
                data: { status: 'FAILED', errorMessage: 'Error crítico en el lote: ' + (err.message || String(err)) },
            });
            totalFailed += chunk.length;
        }

        // Ya hemos pausado 600ms por correo, no necesitamos pausar 300ms tontos extra al final.
        // Pero dejaremos un pequeño respiro si queremos:
        await new Promise((r) => setTimeout(r, 500));
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
    const result = await getResend().emails.send({
        from: 'LegacyMark <noreply@legacymarksas.com>',
        to: toEmail,
        subject: `[PRUEBA] ${subject}`,
        html,
    });
    return { success: !!result.data?.id, id: result.data?.id };
}
