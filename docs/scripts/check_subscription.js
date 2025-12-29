const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tenants = await prisma.tenant.findMany({
        select: {
            id: true,
            name: true,
            subscriptionPlan: true,
            subscriptionEnd: true,
            subscriptions: {
                where: { status: 'ACTIVE' },
                orderBy: { endDate: 'desc' },
                take: 1
            }
        }
    });

    console.log('Tenants Subscription Info:');
    tenants.forEach(t => {
        console.log(`- ${t.name} (${t.id}):`);
        console.log(`  Plan: ${t.subscriptionPlan}`);
        console.log(`  Tenant Table End: ${t.subscriptionEnd}`);
        if (t.subscriptions.length > 0) {
            console.log(`  Last Active Sub End: ${t.subscriptions[0].endDate}`);
        } else {
            console.log(`  No active subscriptions found in Subscription table.`);
        }

        if (t.subscriptionEnd) {
            const now = new Date();
            const diffTime = t.subscriptionEnd.getTime() - now.getTime();
            const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            console.log(`  Calculated Days Remaining: ${days}`);
        }
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
