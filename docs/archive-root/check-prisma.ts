
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Prisma keys:', Object.keys(prisma));
    // Check if supportTicket exists in properties (it might be lazy loaded)
    // But strictly, we want to know the property reference.
    // Actually, we can check the instance prototype or just print the instance.
    // Or check if 'supportTicket' is in prisma.
    console.log('Has supportTicket:', 'supportTicket' in prisma);
    console.log('Has supportTickets:', 'supportTickets' in prisma);
    console.log('Has coupon:', 'coupon' in prisma);
    console.log('Has user:', 'user' in prisma);

    // Also print properties starting with 's' and 't'
    for (const key of Object.keys(prisma)) {
        console.log(key);
    }

    // Check dmmf
    // @ts-ignore
    if (prisma._dmmf) {
        // @ts-ignore
        console.log('Models in DMMF:', prisma._dmmf.datamodel.models.map(m => m.name));
    }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
