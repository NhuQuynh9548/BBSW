const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$executeRawUnsafe(`
            ALTER TABLE payment_methods 
            ADD COLUMN IF NOT EXISTS opening_balance FLOAT DEFAULT 0
        `);
        console.log('✅ Successfully added opening_balance column to payment_methods');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
