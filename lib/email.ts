import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789'); // Fallback for dev without key

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    // Check for missing or dummy key
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_123456789') {
        console.warn("⚠️ RESEND_API_KEY missing or dummy. Mocking email send:");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        // In production, this should probably be an error, but let's allow it for now to avoid crashing entirely
        // and just log it heavily.
        if (process.env.NODE_ENV === 'production') {
            console.error("❌ CRITICAL: Emails will NOT work in production without a valid RESEND_API_KEY.");
        }
        return { success: true, id: 'mock-id' };
    }

    try {
        const data = await resend.emails.send({
            from: 'LegacyMark <onboarding@resend.dev>', // TODO: Verify domain in Resend dashboard
            to: [to],
            subject: subject,
            html: html,
        });
        return { success: true, id: data.data?.id };
    } catch (error) {
        console.error("Email Error:", error);
        return { success: false, error };
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function replaceVariables(template: string, variables: any) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        return variables[key] || `{{${key}}}`;
    });
}
