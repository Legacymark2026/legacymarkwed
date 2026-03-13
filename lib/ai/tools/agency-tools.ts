import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Definición de las Herramientas (Tools) manejadas por la IA.
// Nota: Zod valida que la IA siempre devuelva objetos estructurados exactos.

export const updateDealStageTool = {
    description: "Actualiza la etapa de un negocio (Deal) en el CRM.",
    parameters: z.object({
        dealId: z.string().uuid().describe("El ID único del trato/negocio en la base de datos."),
        newStage: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]).describe("La nueva etapa del embudo a asignar."),
        reason: z.string().optional().describe("Razón opcional del cambio, útil cuando se marca como LOST."),
    }),
    execute: async ({ dealId, newStage, reason }: { dealId: string; newStage: string; reason?: string }) => {
        try {
            const updatedDeal = await prisma.deal.update({
                where: { id: dealId },
                data: { stage: newStage },
            });
            return {
                success: true,
                message: `El trato '${updatedDeal.title}' ha sido movido a la etapa ${newStage}.`,
                deal: updatedDeal,
            };
        } catch (error: any) {
            return { success: false, error: "No se pudo actualizar el trato en Prisma: " + error.message };
        }
    },
};

export const createInvoiceTool = {
    description: "Crea una factura real en la base de datos aplicando la regla del 60/40 de la agencia.",
    parameters: z.object({
        clientName: z.string().describe("Nombre del cliente o empresa."),
        totalAmount: z.number().describe("Monto total del proyecto (100%)."),
        description: z.string().describe("Servicio contratado (Ej: Desarrollo Web Avanzado)."),
    }),
    execute: async ({ clientName, totalAmount, description, companyId }: { clientName: string; totalAmount: number; description: string; companyId?: string }) => {
        if (!companyId) return { success: false, error: "Falta el ID de compañía." };

        // Lógica de negocio 60/40 integrada a nivel de código para doble seguridad.
        const advancePayment = totalAmount * 0.6;
        const finalPayment = totalAmount * 0.4;
        
        try {
            const invoice = await prisma.invoice.create({
                data: {
                    clientName,
                    serviceDescription: description,
                    totalAmount,
                    advanceAmount: advancePayment,
                    finalAmount: finalPayment,
                    status: "DRAFT_AWAITING_PAYMENT",
                    companyId
                }
            });

            return {
                success: true,
                action: "Factura Generada Estructurada Guardada en Base de Datos",
                data: invoice
            };
        } catch (error: any) {
            return { success: false, error: "Fallo al guardar factura en base de datos: " + error.message };
        }
    },
};

export const getCRMDealsTool = {
    description: "Busca tratos (deals) activos en el CRM de la compañía basándose en una palabra clave.",
    parameters: z.object({
        searchQuery: z.string().describe("Palabra clave para buscar clientes o títulos de tratos."),
        companyId: z.string().optional().describe("ID de la compañía a filtrar (usualmente inyectado por auth)."),
    }),
    execute: async ({ searchQuery, companyId }: { searchQuery: string; companyId?: string }) => {
        // En un entorno real se extraería de la sesión de autenticación.
        // Si no hay companyId, retornamos error simulado por seguridad.
        if (!companyId) {
            return { success: false, error: "Falta el ID de compañía en el contexto para hacer la búsqueda segura." };
        }

        const deals = await prisma.deal.findMany({
            where: {
                companyId,
                title: { contains: searchQuery, mode: 'insensitive' }
            },
            take: 5,
            select: { id: true, title: true, value: true, stage: true }
        });

        return {
            success: true,
            count: deals.length,
            deals
        };
    }
};
