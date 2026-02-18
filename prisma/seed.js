const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Explicitly load .env from root with custom parsing to handle "export " prefix
const envPath = path.resolve(__dirname, '../.env');

try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        console.log("Loaded .env file content. Parsing...");

        let dbUrlFound = false;

        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;

            // Match KEY=VAL, optionally prefixed with "export "
            const match = trimmed.match(/^(?:export\s+)?([A-Za-z0-9_]+)=(.*)$/);
            if (match) {
                const key = match[1];
                let val = match[2];

                // Remove quotes if wrapping the value
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                }

                process.env[key] = val;
                if (key === 'DATABASE_URL') dbUrlFound = true;
            }
        });

        if (dbUrlFound) {
            console.log("✓ Manually extracted DATABASE_URL from .env");
        } else {
            console.warn("⚠️ DATABASE_URL not found in .env via manual parsing. Falling back to what might be in process.env");
        }
    } else {
        console.warn("⚠️ .env file not found at:", envPath);
    }

} catch (err) {
    console.error("Error manually reading .env:", err.message);
}

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seed (JS)...");

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
