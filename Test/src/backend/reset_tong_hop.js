const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const result = await p.tongHopChamCong.updateMany({
        data: {
            congChinhThuc: 0,
            congThuViec: 0,
            phepNam: 0,
            khongLuong: 0,
            nghiLe: 0,
            nghiBu: 0,
            vang: 0,
            tongCongTinhLuong: 0,
        }
    });
    console.log(`✅ Đã reset ${result.count} bản ghi TongHopChamCong về 0`);
}

main().catch(console.error).finally(() => p.$disconnect());
