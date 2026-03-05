require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const codesToDelete = ['X5', 'L', 'P5'];

    for (const code of codesToDelete) {
        const ma = await prisma.maChamCong.findUnique({ where: { ma: code } });
        if (ma) {
            // Xóa các chi tiết liên quan nếu có trước
            await prisma.chiTietChamCong.deleteMany({ where: { maChamCongId: ma.id } });
            // Xóa mã chuyên cần
            await prisma.maChamCong.delete({ where: { id: ma.id } });
            console.log(`✅ Đã xóa mã chấm công cũ: ${code}`);
        } else {
            console.log(`ℹ️ Mã chấm công ${code} không tồn tại (đã bị xóa).`);
        }
    }

    // Reset lại tổng hợp chấm công để làm sạch rác nếu có
    console.log('\nBạn có thể tải lại trang web để thấy danh sách mã chấm công mới.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
