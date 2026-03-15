import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the active company from the session (assuming it's available or fetching the first one for the user)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { companies: true }
        });

        const activeCompanyId = user?.companies[0]?.companyId;
        if (!activeCompanyId) {
            return NextResponse.json({ error: "No active company found." }, { status: 400 });
        }

        const projects = await prisma.kanbanProject.findMany({
            where: { companyId: activeCompanyId },
            include: {
                kanbanTasks: {
                    include: {
                        assignee: { select: { id: true, name: true, image: true } },
                    },
                    orderBy: { order: "asc" },
                },
                deal: { select: { id: true, title: true, value: true, stage: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(projects);
    } catch (error: any) {
        console.error("KANBAN_GET_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { name, description, companyId, dealId } = body;

        const newProject = await prisma.kanbanProject.create({
            data: {
                name,
                description,
                companyId,
                dealId: dealId || null,
            }
        });

        return NextResponse.json(newProject);
    } catch (error: any) {
        console.error("KANBAN_POST_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
