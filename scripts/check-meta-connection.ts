import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMetaConnection() {
    console.log('🔍 Checking Meta/Facebook connection status...\n');

    // Find current user
    const user = await prisma.user.findUnique({
        where: { email: 'administrador@legacymark.com' },
        include: {
            accounts: {
                where: { provider: 'facebook' }
            }
        }
    });

    if (!user) {
        console.log('❌ User not found');
        process.exit(1);
    }

    console.log(`✅ User: ${user.email} (ID: ${user.id})\n`);

    // Check for Facebook accounts
    const fbAccounts = user.accounts;

    if (fbAccounts.length === 0) {
        console.log('❌ No Facebook account connected');
        console.log('\n📋 Next steps:');
        console.log('1. Go to http://localhost:3000/dashboard/settings');
        console.log('2. Click "Connect" on Meta integration');
        console.log('3. Watch the terminal for [AUTH] logs');
        console.log('4. Run this script again to verify\n');
    } else {
        console.log(`✅ Facebook account(s) connected: ${fbAccounts.length}\n`);
        fbAccounts.forEach((acc, i) => {
            console.log(`Account ${i + 1}:`);
            console.log(`  Provider ID: ${acc.providerAccountId}`);
            console.log(`  Has Access Token: ${!!acc.access_token}`);
            console.log(`  Scope: ${acc.scope}`);
            console.log(`  Created: ${acc.createdAt}\n`);
        });
    }

    await prisma.$disconnect();
}

checkMetaConnection();
