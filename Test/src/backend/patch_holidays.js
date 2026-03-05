const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'routes', 'chamCong.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The broken single-line const that needs to be replaced
const brokenStart = 'const NGAY_LE_VIET_NAM: string[] = [\\n    // ===== 2025';
const brokenEnd = "// Nghỉ bù\\n];";

const startIdx = content.indexOf("const NGAY_LE_VIET_NAM: string[] = [");
const endIdx = content.indexOf("];", startIdx) + 2;

const correctArray = `const NGAY_LE_VIET_NAM: string[] = [
    // ===== 2025 =====
    '2025-01-01', // Tết Dương lịch (CN)

    // Tết Nguyên Đán Ất Tỵ — Mùng 1 = 29/01/2025 (T4)
    // 5 ngày: 27(T2)=28 Chạp, 28(T3)=29 Chạp, 29(T4)=Mùng1, 30(T5)=Mùng2, 31(T6)=Mùng3
    '2025-01-27', // 28 tháng Chạp (T2)
    '2025-01-28', // 29 tháng Chạp (T3)
    '2025-01-29', // Mùng 1 Tết (T4)
    '2025-01-30', // Mùng 2 Tết (T5)
    '2025-01-31', // Mùng 3 Tết (T6)
    // Nghỉ bù: 01/02(T7) và 02/02(CN) đã là cuối tuần → thêm 03/02(T2), 04/02(T3)
    '2025-02-03', // Nghỉ bù T7 01/02
    '2025-02-04', // Nghỉ bù CN 02/02

    // Giỗ Tổ Hùng Vương 10/3 âm = 07/04/2025 (T2)
    '2025-04-07',

    // Giải phóng miền Nam 30/04 (T4), Lao động 01/05 (T5)
    '2025-04-30',
    '2025-05-01',

    // Quốc khánh 02/09 (T3) — nghỉ bù 01/09 (T2)
    '2025-09-01', // Nghỉ bù Quốc khánh
    '2025-09-02', // Quốc khánh (02/09)

    // ===== 2026 =====
    '2026-01-01', // Tết Dương lịch (T5)

    // Tết Nguyên Đán Bính Ngọ — Mùng 1 = 17/02/2026 (T3)
    // Bộ luật LĐ: 1 ngày cuối năm âm + 4 ngày đầu năm mới = 5 ngày
    //   29 Chạp = 15/02 (CN) — đã là ngày cuối tuần
    //   30 Chạp = 16/02 (T2), Mùng1 = 17/02 (T3), Mùng2 = 18/02 (T4), Mùng3 = 19/02 (T5)
    // Nghỉ bù CN 15/02 → Mùng 4 = 20/02 (T6)
    '2026-02-16', // 30 tháng Chạp (T2)
    '2026-02-17', // Mùng 1 Tết Bính Ngọ (T3)
    '2026-02-18', // Mùng 2 Tết (T4)
    '2026-02-19', // Mùng 3 Tết (T5)
    '2026-02-20', // Mùng 4 Tết (T6) — nghỉ bù CN 15/02

    // Giỗ Tổ Hùng Vương 10/3 âm = 27/04/2026 (T2)
    '2026-04-27',

    // Giải phóng miền Nam 30/04 (T5), Lao động 01/05 (T6)
    '2026-04-30',
    '2026-05-01',

    // Quốc khánh 02/09 (T4) — nghỉ bù 03/09 (T5)
    '2026-09-02', // Quốc khánh
    '2026-09-03', // Nghỉ bù Quốc khánh

    // ===== 2027 =====
    '2027-01-01', // Tết Dương lịch (T6)

    // Tết Nguyên Đán Đinh Mùi — Mùng 1 = 06/02/2027 (T7)
    // 30 Chạp = 05/02 (T6), Mùng1 = 06/02 (T7), Mùng2 = 07/02 (CN)
    // Mùng3 = 08/02 (T2), Mùng4 = 09/02 (T3)
    // Nghỉ bù T7(06) → 10/02 (T4); Nghỉ bù CN(07) → 11/02 (T5)
    '2027-02-05', // 30 tháng Chạp (T6)
    '2027-02-08', // Mùng 3 Tết (T2)
    '2027-02-09', // Mùng 4 Tết (T3)
    '2027-02-10', // Nghỉ bù Mùng 1 (T7 06/02)
    '2027-02-11', // Nghỉ bù Mùng 2 (CN 07/02)

    // Giỗ Tổ Hùng Vương 10/3 âm = 16/04/2027 (T6)
    '2027-04-16',

    // Giải phóng miền Nam 30/04 (T6), Lao động 01/05 (T7) → nghỉ bù 03/05 (T2)
    '2027-04-30',
    '2027-05-03', // Nghỉ bù Quốc tế Lao động (01/05 là T7)

    // Quốc khánh 02/09 (T5) — nghỉ bù 03/09 (T6)
    '2027-09-02', // Quốc khánh
    '2027-09-03', // Nghỉ bù
];`;

const newContent = content.slice(0, startIdx) + correctArray + content.slice(endIdx);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ Đã cập nhật NGAY_LE_VIET_NAM thành công!');
console.log(`   Từ vị trí ${startIdx} đến ${endIdx}`);

// Verify
const verify = fs.readFileSync(filePath, 'utf8');
console.log('Kiểm tra 2026:', verify.includes("'2026-02-20'") ? '✅ Có Mùng 4 (20/02)' : '❌ Thiếu Mùng 4');
console.log('Kiểm tra 2026:', verify.includes("'2026-02-14'") ? '❌ Vẫn còn 14/02' : '✅ Đã xóa 14/02 (T7 cuối tuần)');
