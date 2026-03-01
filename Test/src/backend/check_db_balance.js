const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking PaymentMethod Records ---');
    const records = await prisma.paymentMethod.findMany();
    console.log(`Found ${records.length} records.`);
    if (records.length > 0) {
        console.log('Sample record fields:', Object.keys(records[0]));
        console.log('Sample balance:', records[0].balance);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
