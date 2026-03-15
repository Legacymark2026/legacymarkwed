import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeSession } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { UserRole } from "@/types/auth";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const invoiceId = params.id;
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { company: true },
        });

        if (!invoice) {
            return new NextResponse("Invoice not found", { status: 404 });
        }

        // Validación de permisos B2B (Solo el dueño de la empresa puede generar el link de pago o el SuperAdmin)
        const role = session.user.role as UserRole;
        if (role !== UserRole.SUPER_ADMIN && invoice.companyId !== session.user.companyId) {
             return new NextResponse("Forbidden", { status: 403 });
        }

        if (invoice.status === "PAID") {
            return new NextResponse("Invoice already paid", { status: 400 });
        }

        // Si ya hay un URL generado previamente para evitar duplicidad de Session
        if (invoice.paymentUrl) {
             return NextResponse.json({ url: invoice.paymentUrl });
        }

        const host = req.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

        const stripeSession = await getStripeSession(
            invoice.companyId,
            invoice.finalAmount, // Cobrando el monto remanente del SLA o la factura,
            invoice.currency,
            `Factura: ${invoice.serviceDescription}`,
            { invoiceId: invoice.id, companyId: invoice.companyId },
            `${host}/dashboard/client?payment_success=true`,
            `${host}/dashboard/client?payment_canceled=true`,
            session.user.email ?? undefined
        );

        if (!stripeSession.url) {
            return new NextResponse("Could not create Stripe session", { status: 500 });
        }

        // Guardamos el Payment URL en BD
        await prisma.invoice.update({
            where: { id: invoice.id },
            data: { paymentUrl: stripeSession.url }
        });

        return NextResponse.json({ url: stripeSession.url });

    } catch (error) {
        console.error("[INVOICE_PAY_POST]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
