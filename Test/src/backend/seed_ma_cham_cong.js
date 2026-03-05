// Script để seed mã chấm công đầy đủ theo quy định công ty
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * loai values:
 *   chinh_thuc           — đi làm bình thường (X, CT)
 *   thu_viec             — nhân viên thử việc (TV)
 *   phep                 — phép năm (P)
 *   le                   — nghỉ lễ / tết (NL)
 *   nghi_bu              — nghỉ bù (NB)
 *   bh_che_do            — nghỉ chế độ BH / hiếu hỉ (BH, CĐ)
 *   khong_luong          — nghỉ không lương (KL)
 *   vang                 — vắng mặt không phép (V)
 *   chinh_thuc_phep      — X/P: 0.5 đi làm + 0.5 phép (cả 2 hưởng lương)
 *   chinh_thuc_nghi_bu   — X/NB: 0.5 đi làm + 0.5 nghỉ bù (cả 2 hưởng lương)
 *   chinh_thuc_khong_luong — X/KL: 0.5 đi làm (hưởng lương) + 0.5 KL
 *   phep_khong_luong     — P/KL: 0.5 phép (hưởng lương) + 0.5 KL
 */
const MA_CHAM_CONG = [
    // ── Nguyên ngày đi làm / nghỉ hưởng lương ──────────────────────────────
    { ma: 'X', ten: 'Ngày công chính thức', loai: 'chinh_thuc', giaTriCong: 1, duocTinhLuong: true },
    { ma: 'TV', ten: 'Ngày công thử việc', loai: 'thu_viec', giaTriCong: 1, duocTinhLuong: true },
    { ma: 'CT', ten: 'Công tác', loai: 'cong_tac', giaTriCong: 1, duocTinhLuong: true },
    { ma: 'NL', ten: 'Nghỉ lễ, tết (hưởng lương)', loai: 'le', giaTriCong: 1, duocTinhLuong: true },
    { ma: 'P', ten: 'Phép năm (hưởng lương)', loai: 'phep', giaTriCong: 1, duocTinhLuong: true },
    { ma: 'NB', ten: 'Nghỉ bù (hưởng lương)', loai: 'nghi_bu', giaTriCong: 1, duocTinhLuong: true },
    { ma: 'BH', ten: 'Nghỉ chế độ Bảo Hiểm', loai: 'bh_che_do', giaTriCong: 1, duocTinhLuong: true },
    { ma: 'CD', ten: 'Nghỉ Hiếu / Hỉ / Chế độ', loai: 'bh_che_do', giaTriCong: 1, duocTinhLuong: true },

    // ── Nửa ngày hỗn hợp ────────────────────────────────────────────────────
    { ma: 'X/P', ten: 'Nửa ngày làm + Nửa ngày phép', loai: 'chinh_thuc_phep', giaTriCong: 1, duocTinhLuong: true },
    { ma: 'X/NB', ten: 'Nửa ngày làm + Nửa ngày nghỉ bù', loai: 'chinh_thuc_nghi_bu', giaTriCong: 1, duocTinhLuong: true },
    { ma: 'X/KL', ten: 'Nửa ngày làm + Nửa ngày KL', loai: 'chinh_thuc_khong_luong', giaTriCong: 1, duocTinhLuong: true },
    { ma: 'P/KL', ten: 'Nửa ngày phép + Nửa ngày KL', loai: 'phep_khong_luong', giaTriCong: 1, duocTinhLuong: true },

    // ── Không hưởng lương ────────────────────────────────────────────────────
    { ma: 'KL', ten: 'Nghỉ không lương', loai: 'khong_luong', giaTriCong: 0, duocTinhLuong: false },
    { ma: 'V', ten: 'Vắng mặt (không phép)', loai: 'vang', giaTriCong: 0, duocTinhLuong: false },
];

async function main() {
    console.log('🔄 Đang cập nhật mã chấm công...\n');
    for (const item of MA_CHAM_CONG) {
        await prisma.maChamCong.upsert({
            where: { ma: item.ma },
            update: item,
            create: item,
        });
        console.log(`  ✅ ${item.ma.padEnd(5)} | ${item.loai.padEnd(25)} | ${item.ten}`);
    }
    console.log(`\n🎉 Hoàn tất! Đã upsert ${MA_CHAM_CONG.length} mã chấm công.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
