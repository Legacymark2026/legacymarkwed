
import { simulateIncomingMessage } from "../actions/inbox";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedInbox() {
    console.log("🌱 Seeding Inbox with sample data...");

    // We rely on simulateIncomingMessage to resolve the user/company context if possible,
    // but since we run this as a script, there is no session.
    // We need to fetch a valid company ID manually.

    try {
        const user = await prisma.user.findFirst({
            include: { companies: true }
        });

        if (!user || user.companies.length === 0) {
            console.error("❌ No user or company found to seed data into.");
            return;
        }

        const companyId = user.companies[0].companyId;
        console.log(`🏢 Using Company ID: ${companyId}`);

        // Seed Instagram
        console.log("📲 Seeding Instagram message...");
        await simulateIncomingMessage({
            channel: 'INSTAGRAM',
            senderName: 'Sofia Trendy',
            senderHandle: '@sofia_style',
            content: 'Do you have this in blue? 👗',
            companyId
        });

        // Seed Messenger
        console.log("💬 Seeding Messenger message...");
        await simulateIncomingMessage({
            channel: 'MESSENGER',
            senderName: 'Mark Zuckerberg',
            senderHandle: 'mark.zuck',
            content: 'Is this the real metaverse? 👋',
            companyId
        });

        console.log("✅ Seeding complete!");
    } catch (error) {
        console.error("❌ Error seeding data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedInbox();
