const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Explicitly load .env from root
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env file from:", envPath);
    console.error(result.error);
} else {
    console.log("Loaded .env file successfully.");
}

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting manual database seed...");

    // Clean existing experts (optional, matching original seed)
    try {
        await prisma.expert.deleteMany();
        console.log("✓ Cleaned experts");
    } catch (e) {
        console.warn("⚠️ Could not clean experts (might not exist yet):", e.message);
    }

    // Seed Default Company
    console.log("Creating/Updating Default Company...");
    const company = await prisma.company.upsert({
        where: { slug: "legacymark" },
        update: {},
        create: {
            name: "LegacyMark SAS",
            slug: "legacymark",
            industry: "Technology",
            website: "https://legacymarksas.com",
            subscriptionTier: "enterprise",
            subscriptionStatus: "active",
        },
    });
    console.log(`✓ Default company ready: ${company.name}`);

    console.log("🎉 Seed complete!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
