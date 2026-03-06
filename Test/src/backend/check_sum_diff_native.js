const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function checkDb() {
    const pmSum = await prisma.$queryRaw`
        SELECT 
            SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount ELSE 0 END) as income,
            SUM(CASE WHEN t.transaction_type = 'EXPENSE' THEN t.amount ELSE 0 END) as expense,
            SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount WHEN t.transaction_type = 'EXPENSE' THEN -t.amount ELSE 0 END) as balance
        FROM transactions t
        WHERE t.approval_status = 'APPROVED'
    `;

    const qltcSum = await prisma.$queryRaw`
        SELECT 
            SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount ELSE 0 END) as income,
            SUM(CASE WHEN t.transaction_type = 'EXPENSE' THEN t.amount ELSE 0 END) as expense,
            SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount WHEN t.transaction_type = 'EXPENSE' THEN -t.amount ELSE 0 END) as balance
        FROM transactions t
        WHERE t.payment_status = 'PAID' AND t.approval_status NOT IN ('CANCELLED', 'REJECTED')
    `;

    const divergent = await prisma.$queryRaw`
        SELECT id, transaction_code, amount, transaction_type, approval_status, payment_status, transaction_date
        FROM transactions t
        WHERE (t.approval_status = 'APPROVED') != (t.payment_status = 'PAID' AND t.approval_status NOT IN ('CANCELLED', 'REJECTED'))
    `;

    fs.writeFileSync('output-native.json', JSON.stringify({ pmSum, qltcSum, divergent }, null, 2));
}

checkDb().finally(() => prisma.$disconnect());
