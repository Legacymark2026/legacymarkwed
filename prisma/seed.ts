import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seed...");

    // Clean existing experts
    await prisma.expert.deleteMany({});
    console.log("✓ Cleaned existing experts");

    // Seed sample experts
    const experts = [
        {
            name: "Heyber Enrique Bohorquez Florez",
            role: "Head of Strategy",
            bio: "Leading our strategic initiatives with over 10 years of experience in digital transformation. Passionate about data-driven decision making and innovative solutions.",
            imageUrl: "/images/team/heyber.png",
            socialLinks: [
                { platform: "linkedin", url: "https://linkedin.com/in/example" },
                { platform: "twitter", url: "https://twitter.com/example" },
            ],
            order: 1,
            isVisible: true,
        },
        {
            name: "Sarah Johnson",
            role: "Creative Director",
            bio: "Award-winning designer with a keen eye for aesthetics and user experience. Transforming brands through compelling visual narratives.",
            imageUrl: "",
            socialLinks: [
                { platform: "website", url: "https://sarahjohnson.design" },
                { platform: "linkedin", url: "https://linkedin.com/in/sarahjohnson" },
            ],
            order: 2,
            isVisible: true,
        },
        {
            name: "Marcus Chen",
            role: "Tech Lead",
            bio: "Full-stack architect specializing in scalable web applications and cloud infrastructure. Building the future, one commit at a time.",
            imageUrl: "",
            socialLinks: [
                { platform: "github", url: "https://github.com/marcuschen" },
                { platform: "twitter", url: "https://twitter.com/marcuschen" },
                { platform: "linkedin", url: "https://linkedin.com/in/marcuschen" },
            ],
            order: 3,
            isVisible: true,
        },
    ];

    for (const expert of experts) {
        await prisma.expert.create({
            data: expert,
        });
        console.log(`✓ Created expert: ${expert.name}`);
    }

    // Seed Default Company
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
    .catch((e) => {
        console.error("❌ Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
