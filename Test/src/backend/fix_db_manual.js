const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Running manual database fix for PaymentMethod table...');

        // Create columns if they don't exist
        await prisma.$executeRawUnsafe(`
      ALTER TABLE payment_methods 
      ADD COLUMN IF NOT EXISTS "code" TEXT,
      ADD COLUMN IF NOT EXISTS "type" TEXT,
      ADD COLUMN IF NOT EXISTS "account_info" TEXT,
      ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'active';
    `);

        // Add unique constraint to code if it doesn't exist
        // Note: This might fail if there are duplicate codes, but it's okay for now
        try {
            await prisma.$executeRawUnsafe(`
        ALTER TABLE payment_methods 
        ADD CONSTRAINT "payment_methods_code_key" UNIQUE ("code");
      `);
        } catch (e) {
            console.log('Unique constraint on "code" already exists or could not be added.');
        }

        console.log('Database updated successfully!');
    } catch (error) {
        console.error('Error updating database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
