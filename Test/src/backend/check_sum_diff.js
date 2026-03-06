const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
    console.log("=== Transaction Stats ===");

    // Like PaymentMethods.ts
    const pmSum = await prisma.$queryRaw`
        SELECT 
            SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount ELSE 0 END) as income,
            SUM(CASE WHEN t.transaction_type = 'EXPENSE' THEN t.amount ELSE 0 END) as expense,
            SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount WHEN t.transaction_type = 'EXPENSE' THEN -t.amount ELSE 0 END) as balance
        FROM transactions t
        WHERE t.approval_status = 'APPROVED'
    `;
    console.log("SQL (paymentMethods like):", pmSum[0]);

    // Like QuanLyThuChi.tsx
    // The query it sends:
    // status? approvalStatus filtered? no, it gets ALL except date and BU
    // then in JS:
    // t.paymentStatus === 'PAID' && t.approvalStatus !== 'CANCELLED' && t.approvalStatus !== 'REJECTED'
    const qltcSum = await prisma.$queryRaw`
        SELECT 
            SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount ELSE 0 END) as income,
            SUM(CASE WHEN t.transaction_type = 'EXPENSE' THEN t.amount ELSE 0 END) as expense,
            SUM(CASE WHEN t.transaction_type = 'INCOME' THEN t.amount WHEN t.transaction_type = 'EXPENSE' THEN -t.amount ELSE 0 END) as balance
        FROM transactions t
        WHERE t.payment_status = 'PAID' AND t.approval_status NOT IN ('CANCELLED', 'REJECTED')
    `;
    console.log("SQL (QuanLyThuChi like):", qltcSum[0]);

    // Let's find the divergent ones
    const divergent = await prisma.$queryRaw`
        SELECT id, transaction_code, amount, transaction_type, approval_status, payment_status, transaction_date
        FROM transactions t
        WHERE (t.approval_status = 'APPROVED') != (t.payment_status = 'PAID' AND t.approval_status NOT IN ('CANCELLED', 'REJECTED'))
    `;
    console.log("Divergent transactions:", divergent);
}

checkDb().finally(() => prisma.$disconnect());
