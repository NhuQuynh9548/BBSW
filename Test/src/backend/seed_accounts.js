
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const initialAccounts = [
        {
            code: 'B001',
            name: 'Techcombank Vốn KD',
            type: 'Ngân hàng',
            owner: 'Công ty ABC',
            accountInfo: '1234567890',
            buName: 'Tất cả BU',
            status: 'active',
        },
        {
            code: 'C001',
            name: 'Két sắt công ty',
            type: 'Tiền mặt',
            owner: 'Thủ quỹ',
            accountInfo: 'N/A',
            buName: 'Trụ sở chính',
            status: 'active',
        },
        {
            code: 'W001',
            name: 'Ví Momo Marketing',
            type: 'Ví điện tử',
            owner: 'Phòng Marketing',
            accountInfo: '0987654321',
            buName: 'Phòng Marketing',
            status: 'active',
        },
        {
            code: 'B002',
            name: 'Vietcombank Thanh Toán',
            type: 'Ngân hàng',
            owner: 'Công ty ABC',
            accountInfo: '9876543210',
            buName: 'Tất cả BU',
            status: 'locked',
        },
    ];

    console.log('Seeding financial accounts...');

    for (const acc of initialAccounts) {
        await prisma.paymentMethod.upsert({
            where: { name: acc.name },
            update: acc,
            create: acc,
        });
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
