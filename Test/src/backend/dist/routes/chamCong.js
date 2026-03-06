"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const XLSX = __importStar(require("xlsx"));
const exceljs_1 = __importDefault(require("exceljs"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
/**
 * NGÀY NGHỈ THEO QUY ĐỊNH NHÀ NƯỚC VIỆT NAM
 * Căn cứ: Bộ luật Lao động 2019, Điều 112
 *
 * 1. Tết Dương lịch:             01/01 (1 ngày)
 * 2. Tết Nguyên Đán:             5 ngày (1 ngày cuối năm âm + 4 ngày đầu năm mới)
 * 3. Giỗ Tổ Hùng Vương:         10/3 âm lịch (1 ngày)
 * 4. Ngày Giải phóng miền Nam:  30/04 (1 ngày)
 * 5. Ngày Quốc tế Lao động:     01/05 (1 ngày)
 * 6. Quốc khánh:                 02/09 (2 ngày kể cả ngày liền kề)
 *
 * Thứ 7 và Chủ nhật: nghỉ theo quy định (loaiTruChuNhat field bao gồm T7)
 *
 * Lưu ý: Tết Nguyên Đán và Giỗ Tổ theo lịch âm — các ngày dương lịch
 * được tính trước cho năm 2025, 2026, 2027 dựa trên lịch chuyển đổi.
 * Khi có Quyết định của Thủ tướng điều chỉnh ngày nghỉ bù, có thể cập nhật thêm.
 */
const NGAY_LE_VIET_NAM = [
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
];
// Trả về true nếu ngày là ngày lễ theo quy định Nhà nước
function isNgayLe(date) {
    const str = date.toISOString().split('T')[0];
    return NGAY_LE_VIET_NAM.includes(str);
}
// Trả về true nếu là Thứ 7 (6) hoặc Chủ nhật (0) — cả 2 đều nghỉ
function isNghiCuoiTuan(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = CN, 6 = T7
}
// Hàm helper tính tổng hợp chấm công dựa trên danh sách chi tiết
function tinhContributions(chiTietList) {
    const data = { congChinhThuc: 0, congThuViec: 0, phepNam: 0, khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0, tongCongTinhLuong: 0 };
    chiTietList.forEach((ct) => {
        if (!ct.maChamCong)
            return;
        const loai = ct.maChamCong.loai;
        const gia = ct.giaTriCong;
        switch (loai) {
            case 'chinh_thuc':
            case 'cong_tac':
                data.congChinhThuc += gia;
                data.tongCongTinhLuong += gia;
                break;
            case 'thu_viec':
                data.congThuViec += gia;
                data.tongCongTinhLuong += gia;
                break;
            case 'phep':
                data.phepNam += gia;
                data.tongCongTinhLuong += gia;
                break;
            case 'khong_luong':
                data.khongLuong += gia;
                break;
            case 'le':
                data.nghiLe += gia;
                data.tongCongTinhLuong += gia;
                break;
            case 'nghi_bu':
                data.nghiBu += gia;
                data.tongCongTinhLuong += gia;
                break;
            case 'bh_che_do':
                data.tongCongTinhLuong += gia;
                break; // Nghỉ chế độ không trừ lương
            case 'vang':
                data.vang += gia;
                break;
            case 'chinh_thuc_phep':
                data.congChinhThuc += 0.5;
                data.phepNam += 0.5;
                data.tongCongTinhLuong += 1;
                break;
            case 'chinh_thuc_nghi_bu':
                data.congChinhThuc += 0.5;
                data.nghiBu += 0.5;
                data.tongCongTinhLuong += 1;
                break;
            case 'chinh_thuc_khong_luong':
                data.congChinhThuc += 0.5;
                data.khongLuong += 0.5;
                data.tongCongTinhLuong += 0.5;
                break;
            case 'phep_khong_luong':
                data.phepNam += 0.5;
                data.khongLuong += 0.5;
                data.tongCongTinhLuong += 0.5;
                break;
            default:
                if (ct.maChamCong.duocTinhLuong)
                    data.tongCongTinhLuong += gia;
                break;
        }
    });
    return data;
}
// ===================== KỲ CHẤM CÔNG =====================
// GET /api/cham-cong/ky
router.get('/ky', async (req, res) => {
    try {
        const ky = await prisma_1.default.kyChamCong.findMany({
            orderBy: { ngayBatDau: 'desc' },
        });
        res.json(ky);
    }
    catch (error) {
        console.error('Get ky cham cong error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/cham-cong/ky
router.post('/ky', async (req, res) => {
    try {
        const { tenKy, ngayBatDau, ngayKetThuc, loaiTruChuNhat, loaiTruNgayLe } = req.body;
        const ky = await prisma_1.default.kyChamCong.create({
            data: {
                tenKy,
                ngayBatDau: new Date(ngayBatDau),
                ngayKetThuc: new Date(ngayKetThuc),
                trangThai: 'nhap',
                loaiTruChuNhat: loaiTruChuNhat !== false,
                loaiTruNgayLe: loaiTruNgayLe !== false,
            },
        });
        // Tự động tạo bản ghi tổng hợp cho tất cả nhân viên đang làm
        const employees = await prisma_1.default.employee.findMany({
            where: { workStatus: { in: ['WORKING', 'PROBATION'] } },
            select: { id: true },
        });
        if (employees.length > 0) {
            await prisma_1.default.tongHopChamCong.createMany({
                data: employees.map((e) => ({
                    kyId: ky.id,
                    employeeId: e.id,
                })),
                skipDuplicates: true,
            });
        }
        res.status(201).json(ky);
    }
    catch (error) {
        console.error('Create ky cham cong error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/cham-cong/sync-nhan-vien/:kyId — Đồng bộ nhân viên chưa có vào kỳ
router.post('/sync-nhan-vien/:kyId', async (req, res) => {
    try {
        const { kyId } = req.params;
        const ky = await prisma_1.default.kyChamCong.findUnique({ where: { id: kyId } });
        if (!ky)
            return res.status(404).json({ error: 'Kỳ không tồn tại' });
        const allEmployees = await prisma_1.default.employee.findMany({
            where: { workStatus: { in: ['WORKING', 'PROBATION'] } },
            select: { id: true },
        });
        const existing = await prisma_1.default.tongHopChamCong.findMany({
            where: { kyId },
            select: { employeeId: true },
        });
        const existingIds = new Set(existing.map((e) => e.employeeId));
        const missing = allEmployees.filter((e) => !existingIds.has(e.id));
        if (missing.length > 0) {
            await prisma_1.default.tongHopChamCong.createMany({
                data: missing.map((e) => ({
                    kyId,
                    employeeId: e.id,
                    congChuan: ky.congChuan || 0,
                })),
                skipDuplicates: true,
            });
        }
        res.json({ soNhanVienMoi: missing.length, tongNhanVien: allEmployees.length });
    }
    catch (error) {
        console.error('Sync nhan vien error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/cham-cong/ky/:id
router.put('/ky/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { tenKy, ngayBatDau, ngayKetThuc, loaiTruChuNhat, loaiTruNgayLe } = req.body;
        const ky = await prisma_1.default.kyChamCong.update({
            where: { id },
            data: {
                tenKy,
                ngayBatDau: ngayBatDau ? new Date(ngayBatDau) : undefined,
                ngayKetThuc: ngayKetThuc ? new Date(ngayKetThuc) : undefined,
                loaiTruChuNhat,
                loaiTruNgayLe,
            },
        });
        res.json(ky);
    }
    catch (error) {
        console.error('Update ky cham cong error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/cham-cong/ky/:id/tinh-cong — Tính công chuẩn
router.post('/ky/:id/tinh-cong', async (req, res) => {
    try {
        const { id } = req.params;
        const ky = await prisma_1.default.kyChamCong.findUnique({ where: { id } });
        if (!ky)
            return res.status(404).json({ error: 'Kỳ không tồn tại' });
        let congChuan = 0;
        const start = new Date(ky.ngayBatDau);
        const end = new Date(ky.ngayKetThuc);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (ky.loaiTruChuNhat && isNghiCuoiTuan(new Date(d)))
                continue;
            if (ky.loaiTruNgayLe && isNgayLe(new Date(d)))
                continue;
            congChuan++;
        }
        await prisma_1.default.kyChamCong.update({
            where: { id },
            data: { congChuan },
        });
        // Cập nhật cột congChuan trong tổng hợp
        await prisma_1.default.tongHopChamCong.updateMany({
            where: { kyId: id },
            data: { congChuan },
        });
        res.json({ congChuan });
    }
    catch (error) {
        console.error('Tinh cong error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/cham-cong/ky/:id/khoa — Khóa kỳ
router.post('/ky/:id/khoa', async (req, res) => {
    try {
        const { id } = req.params;
        const ky = await prisma_1.default.kyChamCong.update({
            where: { id },
            data: { trangThai: 'da_khoa' },
        });
        res.json(ky);
    }
    catch (error) {
        console.error('Khoa ky error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ===================== MÃ CHẤM CÔNG =====================
// GET /api/cham-cong/ma-cham-cong
router.get('/ma-cham-cong', async (req, res) => {
    try {
        const dsMa = await prisma_1.default.maChamCong.findMany({
            orderBy: { ma: 'asc' },
        });
        res.json(dsMa);
    }
    catch (error) {
        console.error('Get ma cham cong error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/cham-cong/ma-cham-cong
router.post('/ma-cham-cong', async (req, res) => {
    try {
        const { ma, ten, loai, giaTriCong, duocTinhLuong } = req.body;
        const mcc = await prisma_1.default.maChamCong.create({
            data: { ma: ma.toUpperCase().trim(), ten, loai, giaTriCong, duocTinhLuong },
        });
        res.status(201).json(mcc);
    }
    catch (error) {
        if (error.code === 'P2002')
            return res.status(400).json({ error: 'Mã đã tồn tại' });
        console.error('Create ma cham cong error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ===================== TỔNG HỢP =====================
// GET /api/cham-cong/tong-hop/:kyId
router.get('/tong-hop/:kyId', async (req, res) => {
    try {
        const { kyId } = req.params;
        const { search } = req.query;
        const tongHop = await prisma_1.default.tongHopChamCong.findMany({
            where: {
                kyId,
                employee: search
                    ? {
                        OR: [
                            { fullName: { contains: search, mode: 'insensitive' } },
                            { employeeId: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : undefined,
            },
            include: {
                employee: {
                    select: { id: true, employeeId: true, fullName: true },
                },
            },
            orderBy: { tongCongTinhLuong: 'desc' },
        });
        // Fetch chi tiết chấm công để lấy breakdown
        const allChiTiet = await prisma_1.default.chiTietChamCong.findMany({
            where: { kyId },
            include: { maChamCong: true }
        });
        const breakdownByEmp = {};
        allChiTiet.forEach((ct) => {
            if (!ct.maChamCong)
                return;
            const empId = ct.employeeId;
            const ma = ct.maChamCong.ma;
            if (!breakdownByEmp[empId])
                breakdownByEmp[empId] = {};
            breakdownByEmp[empId][ma] = (breakdownByEmp[empId][ma] || 0) + 1;
        });
        const result = tongHop.map((th) => ({
            ...th,
            breakdown: breakdownByEmp[th.employeeId] || {}
        }));
        res.json(result);
    }
    catch (error) {
        console.error('Get tong hop error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/cham-cong/export/:kyId
router.get('/export/:kyId', async (req, res) => {
    try {
        const { kyId } = req.params;
        const ky = await prisma_1.default.kyChamCong.findUnique({ where: { id: kyId } });
        if (!ky)
            return res.status(404).json({ error: 'Kỳ không tồn tại' });
        const start = new Date(ky.ngayBatDau);
        const end = new Date(ky.ngayKetThuc);
        const month = end.getMonth() + 1;
        const year = end.getFullYear();
        const formatDate = (d) => {
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        };
        const days = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
        }
        const tongHop = await prisma_1.default.tongHopChamCong.findMany({
            where: { kyId },
            include: { employee: true },
            orderBy: { tongCongTinhLuong: 'desc' },
        });
        const allChiTiet = await prisma_1.default.chiTietChamCong.findMany({
            where: { kyId },
            include: { maChamCong: true }
        });
        const chiTietByEmp = {};
        allChiTiet.forEach((ct) => {
            const dStr = new Date(ct.ngay).toISOString().split('T')[0];
            if (!chiTietByEmp[ct.employeeId])
                chiTietByEmp[ct.employeeId] = {};
            chiTietByEmp[ct.employeeId][dStr] = ct.maChamCong?.ma || '';
        });
        const wb = new exceljs_1.default.Workbook();
        const ws = wb.addWorksheet('Bảng Chấm Công');
        // Styles
        const titleStyle = { font: { name: 'Times New Roman', size: 16, bold: true }, alignment: { horizontal: 'center' } };
        const subtitleStyle = { font: { name: 'Times New Roman', size: 12, italic: true }, alignment: { horizontal: 'center' } };
        const headerStyle = { font: { name: 'Times New Roman', size: 11, bold: true }, alignment: { horizontal: 'center', vertical: 'middle' }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } };
        const cellStyle = { font: { name: 'Times New Roman', size: 11 }, alignment: { horizontal: 'center', vertical: 'middle' }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } };
        const nameStyle = { ...cellStyle, alignment: { horizontal: 'left', vertical: 'middle' } };
        const weekendFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } }; // Light green
        // Row 1: Title
        ws.mergeCells(1, 1, 1, 2 + days.length + 5);
        const titleCell = ws.getCell(1, 1);
        titleCell.value = `BẢNG CHẤM CÔNG THÁNG ${month} NĂM ${year}`;
        titleCell.style = titleStyle;
        // Row 2: Subtitle
        ws.mergeCells(2, 1, 2, 2 + days.length + 5);
        const subtitleCell = ws.getCell(2, 1);
        subtitleCell.value = `Từ ngày ${formatDate(start)} đến ngày ${formatDate(end)}`;
        subtitleCell.style = subtitleStyle;
        // Row 3: Header (Ngày)
        const row3 = ws.getRow(3);
        const row4 = ws.getRow(4);
        row3.getCell(1).value = 'Mã NV';
        row4.getCell(1).value = '';
        ws.mergeCells(3, 1, 4, 1);
        row3.getCell(1).style = headerStyle;
        row3.getCell(2).value = 'Họ tên';
        row4.getCell(2).value = '';
        ws.mergeCells(3, 2, 4, 2);
        row3.getCell(2).style = headerStyle;
        days.forEach((d, idx) => {
            const col = 3 + idx;
            row3.getCell(col).value = d.getDate();
            const thu = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
            row4.getCell(col).value = thu;
            row3.getCell(col).style = headerStyle;
            row4.getCell(col).style = headerStyle;
            if (d.getDay() === 0 || d.getDay() === 6) {
                row3.getCell(col).fill = weekendFill;
                row4.getCell(col).fill = weekendFill;
            }
        });
        // Summary columns
        const summaryHeaders = ['C.Chuẩn', 'TC.Làm', 'N.Lễ', 'P.Năm', 'Tổng TL'];
        summaryHeaders.forEach((h, idx) => {
            const col = 3 + days.length + idx;
            row3.getCell(col).value = h;
            row4.getCell(col).value = '';
            ws.mergeCells(3, col, 4, col);
            row3.getCell(col).style = headerStyle;
        });
        row3.height = 25;
        row4.height = 25;
        // Data rows
        tongHop.forEach((th, idx) => {
            const r = ws.getRow(5 + idx);
            r.getCell(1).value = th.employee.employeeId;
            r.getCell(1).style = cellStyle;
            r.getCell(2).value = th.employee.fullName;
            r.getCell(2).style = nameStyle;
            days.forEach((d, dIdx) => {
                const col = 3 + dIdx;
                const dStr = d.toISOString().split('T')[0];
                const code = chiTietByEmp[th.employeeId]?.[dStr] || '';
                r.getCell(col).value = code;
                r.getCell(col).style = cellStyle;
                if (d.getDay() === 0 || d.getDay() === 6) {
                    r.getCell(col).fill = weekendFill;
                }
            });
            // Summary data
            r.getCell(3 + days.length + 0).value = th.congChuan;
            r.getCell(3 + days.length + 0).style = cellStyle;
            r.getCell(3 + days.length + 1).value = th.congChinhThuc;
            r.getCell(3 + days.length + 1).style = cellStyle;
            r.getCell(3 + days.length + 2).value = th.nghiLe;
            r.getCell(3 + days.length + 2).style = cellStyle;
            r.getCell(3 + days.length + 3).value = th.phepNam;
            r.getCell(3 + days.length + 3).style = cellStyle;
            r.getCell(3 + days.length + 4).value = th.tongCongTinhLuong;
            const highlightStyle = { ...cellStyle, font: { ...cellStyle.font, bold: true, color: { argb: 'FF0000FF' } } };
            r.getCell(3 + days.length + 4).style = highlightStyle;
        });
        ws.getColumn(1).width = 12;
        ws.getColumn(2).width = 25;
        for (let i = 0; i < days.length; i++) {
            ws.getColumn(3 + i).width = 5;
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Bang_Cham_Cong_T${month}_${year}.xlsx"`);
        await wb.xlsx.write(res);
        res.end();
    }
    catch (error) {
        console.error('Export Excel error:', error);
        res.status(500).json({ error: 'Internal server error processing export' });
    }
});
// ===================== CHI TIẾT THEO NV =====================
// GET /api/cham-cong/chi-tiet/:kyId/:employeeId
router.get('/chi-tiet/:kyId/:employeeId', async (req, res) => {
    try {
        const { kyId, employeeId } = req.params;
        const ky = await prisma_1.default.kyChamCong.findUnique({ where: { id: kyId } });
        if (!ky)
            return res.status(404).json({ error: 'Kỳ không tồn tại' });
        // Lấy tất cả ngày trong kỳ
        const days = [];
        const start = new Date(ky.ngayBatDau);
        const end = new Date(ky.ngayKetThuc);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push(d.toISOString().split('T')[0]);
        }
        // Lấy chi tiết hiện có
        const chiTiet = await prisma_1.default.chiTietChamCong.findMany({
            where: { kyId, employeeId },
            include: { maChamCong: true },
        });
        const chiTietMap = {};
        chiTiet.forEach((ct) => {
            const key = new Date(ct.ngay).toISOString().split('T')[0];
            chiTietMap[key] = ct;
        });
        const result = days.map((day) => {
            const date = new Date(day);
            const ct = chiTietMap[day];
            return {
                ngay: day,
                thu: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()],
                isChuNhat: date.getDay() === 0 || date.getDay() === 6,
                isThu7: date.getDay() === 6,
                isNgayLe: isNgayLe(date),
                chiTietId: ct?.id || null,
                maChamCongId: ct?.maChamCongId || null,
                maChamCong: ct?.maChamCong?.ma || null,
                giaTriCong: ct?.giaTriCong ?? 0,
                ghiChu: ct?.ghiChu || '',
            };
        });
        // Auto-recalc TongHop từ chiTiet thực tế (fix stale data khi xóa trực tiếp DB)
        const congChuan = ky.congChuan || 0;
        const agg = tinhContributions(chiTiet);
        const freshTongHop = { congChuan, ...agg };
        await prisma_1.default.tongHopChamCong.upsert({
            where: { kyId_employeeId: { kyId, employeeId } },
            update: freshTongHop,
            create: { kyId, employeeId, ...freshTongHop },
        });
        res.json({ days: result, tongHop: freshTongHop });
    }
    catch (error) {
        console.error('Get chi tiet error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/cham-cong/chi-tiet/:kyId/:employeeId — Xóa toàn bộ chi tiết 1 NV và reset tổng hợp
router.delete('/chi-tiet/:kyId/:employeeId', async (req, res) => {
    try {
        const { kyId, employeeId } = req.params;
        const ky = await prisma_1.default.kyChamCong.findUnique({ where: { id: kyId } });
        if (!ky)
            return res.status(404).json({ error: 'Kỳ không tồn tại' });
        if (ky.trangThai === 'da_khoa')
            return res.status(400).json({ error: 'Kỳ đã khóa' });
        await prisma_1.default.chiTietChamCong.deleteMany({ where: { kyId, employeeId } });
        await prisma_1.default.tongHopChamCong.updateMany({
            where: { kyId, employeeId },
            data: { congChinhThuc: 0, congThuViec: 0, phepNam: 0, khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0, tongCongTinhLuong: 0 },
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete chi tiet error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/cham-cong/reset-tong-hop/:kyId — Reset & tính lại tổng hợp dựa trên chi tiết hiện có
router.post('/reset-tong-hop/:kyId', async (req, res) => {
    try {
        const { kyId } = req.params;
        const ky = await prisma_1.default.kyChamCong.findUnique({ where: { id: kyId } });
        if (!ky)
            return res.status(404).json({ error: 'Kỳ không tồn tại' });
        const congChuan = ky.congChuan || 0;
        // Bước 1: Reset TẤT CẢ về 0
        await prisma_1.default.tongHopChamCong.updateMany({
            where: { kyId },
            data: { congChinhThuc: 0, congThuViec: 0, phepNam: 0, khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0, tongCongTinhLuong: 0, congChuan },
        });
        // Bước 2: Tính lại cho NV có chi tiết
        const allChiTiet = await prisma_1.default.chiTietChamCong.findMany({ where: { kyId }, include: { maChamCong: true } });
        const byEmployee = {};
        allChiTiet.forEach((ct) => {
            if (!byEmployee[ct.employeeId])
                byEmployee[ct.employeeId] = [];
            byEmployee[ct.employeeId].push(ct);
        });
        for (const [employeeId, chiTiets] of Object.entries(byEmployee)) {
            const agg = tinhContributions(chiTiets);
            const data = { congChuan, ...agg };
            await prisma_1.default.tongHopChamCong.updateMany({ where: { kyId, employeeId }, data });
        }
        res.json({ success: true, message: `Đã reset và tính lại tổng hợp cho kỳ` });
    }
    catch (error) {
        console.error('Reset tong hop error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/cham-cong/chi-tiet — Cập nhật 1 ô chấm công
router.put('/chi-tiet', async (req, res) => {
    try {
        const { kyId, employeeId, ngay, maChamCongId, ghiChu } = req.body;
        const ky = await prisma_1.default.kyChamCong.findUnique({ where: { id: kyId } });
        if (!ky)
            return res.status(404).json({ error: 'Kỳ không tồn tại' });
        if (ky.trangThai === 'da_khoa')
            return res.status(400).json({ error: 'Kỳ đã khóa, không thể chỉnh sửa' });
        let giaTriCong = 0;
        let loai = null;
        let duocTinhLuong = false;
        if (maChamCongId) {
            const mcc = await prisma_1.default.maChamCong.findUnique({ where: { id: maChamCongId } });
            if (mcc) {
                giaTriCong = mcc.giaTriCong;
                loai = mcc.loai;
                duocTinhLuong = mcc.duocTinhLuong;
            }
        }
        // Upsert chi tiết
        const chiTiet = await prisma_1.default.chiTietChamCong.upsert({
            where: { kyId_employeeId_ngay: { kyId, employeeId, ngay: new Date(ngay) } },
            update: { maChamCongId: maChamCongId || null, giaTriCong, ghiChu },
            create: { kyId, employeeId, ngay: new Date(ngay), maChamCongId: maChamCongId || null, giaTriCong, ghiChu },
            include: { maChamCong: true },
        });
        // Tính lại tổng hợp cho NV này trong kỳ
        const allChiTiet = await prisma_1.default.chiTietChamCong.findMany({
            where: { kyId, employeeId },
            include: { maChamCong: true },
        });
        const tongHopData = tinhContributions(allChiTiet);
        await prisma_1.default.tongHopChamCong.upsert({
            where: { kyId_employeeId: { kyId, employeeId } },
            update: tongHopData,
            create: { kyId, employeeId, ...tongHopData },
        });
        res.json({ chiTiet, tongHop: tongHopData });
    }
    catch (error) {
        console.error('Update chi tiet error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ===================== IMPORT EXCEL =====================
// GET /api/cham-cong/import-template/:kyId — Tải file mẫu
router.get('/import-template/:kyId', async (req, res) => {
    try {
        const { kyId } = req.params;
        const ky = await prisma_1.default.kyChamCong.findUnique({ where: { id: kyId } });
        if (!ky)
            return res.status(404).json({ error: 'Kỳ không tồn tại' });
        const start = new Date(ky.ngayBatDau);
        const end = new Date(ky.ngayKetThuc);
        const month = end.getMonth() + 1;
        const year = end.getFullYear();
        const fmtDate = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        const days = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1))
            days.push(new Date(d));
        const employees = await prisma_1.default.employee.findMany({
            select: { employeeId: true, fullName: true },
            orderBy: { employeeId: 'asc' }
        });
        const wb = new exceljs_1.default.Workbook();
        const ws = wb.addWorksheet('Bảng Chấm Công');
        const hdrStyle = { font: { name: 'Times New Roman', size: 11, bold: true }, alignment: { horizontal: 'center', vertical: 'middle' }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } };
        const cellStyle = { font: { name: 'Times New Roman', size: 11 }, alignment: { horizontal: 'center', vertical: 'middle' }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } };
        const nameStyle = { ...cellStyle, alignment: { horizontal: 'left', vertical: 'middle' } };
        const weekendFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
        const summaryHeaders = ['C.Chuẩn', 'TC.Làm', 'Công TV', 'WFH', 'Phép Năm', 'Nghỉ KL', 'Nghỉ Chế Độ', 'Nghỉ Bù', 'TC Lễ', 'TC Cuối Tuần', 'Nghỉ Ốm', 'Thai Sản', 'Tổng TL'];
        const totalCols = 2 + days.length + summaryHeaders.length;
        // Row 1: Title
        ws.mergeCells(1, 1, 1, totalCols);
        const r1 = ws.getCell(1, 1);
        r1.value = `BẢNG CHẤM CÔNG THÁNG ${month} NĂM ${year}`;
        r1.style = { font: { name: 'Times New Roman', size: 16, bold: true }, alignment: { horizontal: 'center' } };
        ws.getRow(1).height = 30;
        // Row 2: Subtitle
        ws.mergeCells(2, 1, 2, totalCols);
        const r2 = ws.getCell(2, 1);
        r2.value = `Từ ngày ${fmtDate(start)} đến ngày ${fmtDate(end)}`;
        r2.style = { font: { name: 'Times New Roman', size: 12, italic: true }, alignment: { horizontal: 'center' } };
        // Row 3: Mã NV | Họ tên | date numbers | summary labels
        const row3 = ws.getRow(3);
        const row4 = ws.getRow(4);
        row3.getCell(1).value = 'Mã NV';
        row3.getCell(1).style = hdrStyle;
        row4.getCell(1).value = '';
        ws.mergeCells(3, 1, 4, 1);
        row3.getCell(2).value = 'Họ Tên';
        row3.getCell(2).style = hdrStyle;
        row4.getCell(2).value = '';
        ws.mergeCells(3, 2, 4, 2);
        days.forEach((d, i) => {
            const col = 3 + i;
            const thu = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
            row3.getCell(col).value = d.getDate();
            row3.getCell(col).style = hdrStyle;
            row4.getCell(col).value = thu;
            row4.getCell(col).style = hdrStyle;
            if (d.getDay() === 0 || d.getDay() === 6) {
                row3.getCell(col).fill = weekendFill;
                row4.getCell(col).fill = weekendFill;
            }
        });
        summaryHeaders.forEach((h, i) => {
            const col = 3 + days.length + i;
            row3.getCell(col).value = h;
            row3.getCell(col).style = hdrStyle;
            row4.getCell(col).value = '';
            ws.mergeCells(3, col, 4, col);
        });
        row3.height = 25;
        row4.height = 25;
        // Data rows
        employees.forEach((emp, i) => {
            const r = ws.getRow(5 + i);
            r.getCell(1).value = emp.employeeId;
            r.getCell(1).style = cellStyle;
            r.getCell(2).value = emp.fullName;
            r.getCell(2).style = nameStyle;
            days.forEach((d, dIdx) => {
                const col = 3 + dIdx;
                r.getCell(col).value = '';
                r.getCell(col).style = cellStyle;
                if (d.getDay() === 0 || d.getDay() === 6)
                    r.getCell(col).fill = weekendFill;
            });
            summaryHeaders.forEach((_, si) => {
                const col = 3 + days.length + si;
                r.getCell(col).style = { ...cellStyle, font: { ...cellStyle.font, bold: si === summaryHeaders.length - 1, color: si === summaryHeaders.length - 1 ? { argb: 'FF0000FF' } : { argb: 'FF000000' } } };
            });
        });
        ws.getColumn(1).width = 12;
        ws.getColumn(2).width = 25;
        for (let i = 0; i < days.length; i++)
            ws.getColumn(3 + i).width = 5;
        summaryHeaders.forEach((_, i) => { ws.getColumn(3 + days.length + i).width = 12; });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Mau_Cham_Cong_T${month}_${year}.xlsx"`);
        await wb.xlsx.write(res);
        res.end();
    }
    catch (err) {
        console.error('Template error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/cham-cong/import/:kyId
router.post('/import/:kyId', upload.single('file'), async (req, res) => {
    try {
        const { kyId } = req.params;
        const ghiDe = req.body.ghiDe === 'true';
        const ky = await prisma_1.default.kyChamCong.findUnique({ where: { id: kyId } });
        if (!ky)
            return res.status(404).json({ error: 'Kỳ không tồn tại' });
        if (ky.trangThai !== 'nhap')
            return res.status(400).json({ error: 'Chỉ được import khi kỳ ở trạng thái Nhập' });
        if (!req.file)
            return res.status(400).json({ error: 'Không có file' });
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        if (rows.length < 2)
            return res.status(400).json({ error: 'File trống hoặc không đúng định dạng' });
        // --- Phát hiện định dạng mới (tiêu đề ở dòng 0-1, ngày ở dòng 2, thứ ở dòng 3, dữ liệu từ dòng 4)
        const firstCellStr = String(rows[0]?.[0] || '').toUpperCase().trim();
        const isNewFormat = firstCellStr.includes('BẢNG CHẤM CÔNG') || firstCellStr.includes('BANG CHAM CONG');
        const dateRowIdx = isNewFormat ? 2 : 0;
        const dataStartIdx = isNewFormat ? 4 : 1;
        const headerRow = rows[dateRowIdx];
        // Debug log
        console.log('[IMPORT] Format:', isNewFormat ? 'new (4 header rows)' : 'old (1 header row)');
        console.log('[IMPORT] DateRow:', headerRow);
        console.log('[IMPORT] Rows count:', rows.length - dataStartIdx, '| Sample:', rows[dataStartIdx]);
        // ---- Dò cột Mã NV ----
        function normalizeStr(s) {
            return s.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, ' ').trim();
        }
        const MA_NV_PATTERNS = ['ma nv', 'ma nhan vien', 'employee id', 'employee_id', 'ma so nv', 'ma so', 'ma'];
        let maNVColIdx = headerRow.findIndex((h) => {
            const norm = normalizeStr(String(h));
            return MA_NV_PATTERNS.some(p => norm.includes(p));
        });
        // Fallback: scan sample rows xem cột nào có dạng mã NV (chữ + số)
        if (maNVColIdx === -1) {
            for (let c = 0; c < Math.min(4, headerRow.length); c++) {
                const sample = String(rows[dataStartIdx]?.[c] || '').trim();
                if (/^[A-Za-z]{1,4}\d{2,5}$/.test(sample)) {
                    maNVColIdx = c;
                    break;
                }
            }
        }
        // Cuối cùng: dùng cột 0 làm mặc định
        if (maNVColIdx === -1)
            maNVColIdx = 0;
        console.log('[IMPORT] maNVColIdx =', maNVColIdx, '| header value:', headerRow[maNVColIdx]);
        // ---- Dò cột ngày (header là số 1-31) và tính Date chính xác ----
        const startDate = new Date(ky.ngayBatDau);
        const endDate = new Date(ky.ngayKetThuc);
        const endDateUTC = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59));
        const dayColumns = [];
        let lastDay = -1;
        let lastTargetDate = null;
        let currentDateIterator = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
        headerRow.forEach((h, idx) => {
            if (idx <= maNVColIdx)
                return;
            const str = String(h).trim();
            let currentDay = -1;
            if (str === '' && lastDay !== -1) {
                currentDay = lastDay;
            }
            else {
                const nMatch = str.match(/^0*([1-9]|[12][0-9]|3[01])$/);
                if (nMatch) {
                    currentDay = parseInt(nMatch[1], 10);
                }
                else if (!isNaN(Number(h)) && Number(h) >= 1 && Number(h) <= 31) {
                    currentDay = Math.floor(Number(h));
                }
            }
            if (currentDay !== -1) {
                if (currentDay === lastDay && lastTargetDate) {
                    dayColumns.push({ idx, day: currentDay, targetDate: lastTargetDate });
                }
                else {
                    let foundDate = null;
                    while (currentDateIterator <= endDateUTC) {
                        if (currentDateIterator.getUTCDate() === currentDay) {
                            foundDate = new Date(currentDateIterator);
                            break;
                        }
                        currentDateIterator.setUTCDate(currentDateIterator.getUTCDate() + 1);
                    }
                    if (foundDate) {
                        dayColumns.push({ idx, day: currentDay, targetDate: foundDate });
                        lastTargetDate = foundDate;
                        lastDay = currentDay;
                    }
                    else {
                        dayColumns.push({ idx, day: currentDay, targetDate: null });
                        lastTargetDate = null;
                        lastDay = currentDay;
                    }
                }
            }
            else {
                lastDay = -1;
                lastTargetDate = null;
            }
        });
        console.log('[IMPORT] dayColumns mapped:', dayColumns.map(d => `${d.day}(${d.targetDate?.toISOString().split('T')[0] || 'null'})`).join(', '));
        if (dayColumns.length === 0) {
            return res.status(400).json({
                error: 'Không tìm thấy cột ngày trong file. Header hàng đầu phải có các số ngày (VD: 26, 27, 28...).',
                debug: { headerRow, maNVColIdx }
            });
        }
        // Lấy tất cả mã chấm công
        const allMaChamCong = await prisma_1.default.maChamCong.findMany();
        const mccMap = {};
        allMaChamCong.forEach((mcc) => { mccMap[mcc.ma.toUpperCase()] = mcc; });
        // Lấy tất cả nhân viên
        const allEmployees = await prisma_1.default.employee.findMany({ select: { id: true, employeeId: true } });
        const empMap = {};
        allEmployees.forEach((e) => { empMap[e.employeeId.toUpperCase()] = e.id; });
        const TONG_HOP_ZERO = {
            congChinhThuc: 0, congThuViec: 0, phepNam: 0,
            khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0, tongCongTinhLuong: 0,
        };
        if (ghiDe) {
            // Xóa toàn bộ chi tiết
            await prisma_1.default.chiTietChamCong.deleteMany({ where: { kyId } });
            // Reset tổng hợp về 0 cho tất cả NV trong kỳ
            await prisma_1.default.tongHopChamCong.updateMany({
                where: { kyId },
                data: TONG_HOP_ZERO,
            });
        }
        let soDongThanhCong = 0;
        let soDongLoi = 0;
        const danhSachLoi = [];
        console.log(`[IMPORT] Bắt đầu scan ngày. Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`);
        for (let rIdx = dataStartIdx; rIdx < rows.length; rIdx++) {
            const row = rows[rIdx];
            const maNV = String(row[maNVColIdx] || '').toUpperCase().trim();
            if (!maNV)
                continue;
            const employeeId = empMap[maNV];
            if (!employeeId) {
                soDongLoi++;
                danhSachLoi.push({ dong: rIdx + 1, maNV, lyDo: `Nhân viên ${maNV} không tồn tại` });
                continue;
            }
            for (const { idx, day, targetDate } of dayColumns) {
                const maCC = String(row[idx] || '').toUpperCase().trim();
                if (!maCC)
                    continue;
                if (!targetDate) {
                    soDongLoi++;
                    danhSachLoi.push({ dong: rIdx + 1, maNV, lyDo: `Ngày ${day} không khớp với lịch trong kỳ (hoặc bị lặp sai)` });
                    continue;
                }
                const mccObj = mccMap[maCC];
                if (!mccObj) {
                    soDongLoi++;
                    danhSachLoi.push({ dong: rIdx + 1, maNV, lyDo: `Mã công '${maCC}' ngày ${day} không tồn tại` });
                    continue;
                }
                try {
                    await prisma_1.default.chiTietChamCong.upsert({
                        where: { kyId_employeeId_ngay: { kyId, employeeId, ngay: targetDate } },
                        update: { maChamCongId: mccObj.id, giaTriCong: mccObj.giaTriCong },
                        create: { kyId, employeeId, ngay: targetDate, maChamCongId: mccObj.id, giaTriCong: mccObj.giaTriCong },
                    });
                    soDongThanhCong++;
                }
                catch {
                    soDongLoi++;
                    danhSachLoi.push({ dong: rIdx + 1, maNV, lyDo: `Lỗi khi lưu ngày ${day}` });
                }
            }
        }
        // ===== AUTO RECALC TONGHOP sau import =====
        // Reset tất cả về 0 rồi tính lại từ chi tiết hiện có
        const congChuan = ky.congChuan || 0;
        await prisma_1.default.tongHopChamCong.updateMany({
            where: { kyId },
            data: { congChinhThuc: 0, congThuViec: 0, phepNam: 0, khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0, tongCongTinhLuong: 0, congChuan },
        });
        const allChiTietPost = await prisma_1.default.chiTietChamCong.findMany({ where: { kyId }, include: { maChamCong: true } });
        const byEmp = {};
        allChiTietPost.forEach((ct) => {
            if (!byEmp[ct.employeeId])
                byEmp[ct.employeeId] = [];
            byEmp[ct.employeeId].push(ct);
        });
        for (const [employeeId, chiTiets] of Object.entries(byEmp)) {
            const d = { congChuan, congChinhThuc: 0, congThuViec: 0, phepNam: 0, khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0, tongCongTinhLuong: 0 };
            chiTiets.forEach((ct) => {
                if (!ct.maChamCong)
                    return;
                const loai = ct.maChamCong.loai;
                const gia = ct.giaTriCong;
                if (loai === 'chinh_thuc')
                    d.congChinhThuc += gia;
                else if (loai === 'thu_viec')
                    d.congThuViec += gia;
                else if (loai === 'phep')
                    d.phepNam += gia;
                else if (loai === 'khong_luong')
                    d.khongLuong += gia;
                else if (loai === 'le')
                    d.nghiLe += gia;
                else if (loai === 'nghi_bu')
                    d.nghiBu += gia;
                else if (loai === 'vang')
                    d.vang += gia;
                if (ct.maChamCong.duocTinhLuong)
                    d.tongCongTinhLuong += gia;
            });
            await prisma_1.default.tongHopChamCong.upsert({
                where: { kyId_employeeId: { kyId, employeeId } },
                update: d,
                create: { kyId, employeeId, ...d },
            });
        }
        // ===== END AUTO RECALC =====
        res.json({
            soDongThanhCong,
            soDongLoi,
            danhSachLoiChiTiet: danhSachLoi.slice(0, 100),
            debug: { maNVColIdx, maNVHeader: headerRow[maNVColIdx], soNgay: dayColumns.length }
        });
    }
    catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/cham-cong/ky/:id/tinh-luong — Tính lại toàn bộ tổng hợp cho kỳ
router.post('/ky/:id/tinh-luong', async (req, res) => {
    try {
        const { id: kyId } = req.params;
        const allChiTiet = await prisma_1.default.chiTietChamCong.findMany({
            where: { kyId },
            include: { maChamCong: true },
        });
        const byEmployee = {};
        allChiTiet.forEach((ct) => {
            if (!byEmployee[ct.employeeId])
                byEmployee[ct.employeeId] = [];
            byEmployee[ct.employeeId].push(ct);
        });
        const ky = await prisma_1.default.kyChamCong.findUnique({ where: { id: kyId } });
        const congChuan = ky?.congChuan || 0;
        // Bước 1: Reset tất cả TongHop về 0 trước khi tính lại
        // (đảm bảo NV đã bị xóa chi tiết cũng được reset)
        await prisma_1.default.tongHopChamCong.updateMany({
            where: { kyId },
            data: {
                congChinhThuc: 0, congThuViec: 0, phepNam: 0,
                khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0,
                tongCongTinhLuong: 0, congChuan,
            },
        });
        // Bước 2: Tính lại cho từng NV có chi tiết
        for (const [employeeId, chiTiets] of Object.entries(byEmployee)) {
            const tongHopData = {
                congChuan,
                congChinhThuc: 0,
                congThuViec: 0,
                phepNam: 0,
                khongLuong: 0,
                nghiLe: 0,
                nghiBu: 0,
                vang: 0,
                tongCongTinhLuong: 0,
            };
            chiTiets.forEach((ct) => {
                if (!ct.maChamCong)
                    return;
                const loai = ct.maChamCong.loai;
                const gia = ct.giaTriCong;
                if (loai === 'chinh_thuc')
                    tongHopData.congChinhThuc += gia;
                else if (loai === 'thu_viec')
                    tongHopData.congThuViec += gia;
                else if (loai === 'phep')
                    tongHopData.phepNam += gia;
                else if (loai === 'khong_luong')
                    tongHopData.khongLuong += gia;
                else if (loai === 'le')
                    tongHopData.nghiLe += gia;
                else if (loai === 'nghi_bu')
                    tongHopData.nghiBu += gia;
                else if (loai === 'vang')
                    tongHopData.vang += gia;
                if (ct.maChamCong.duocTinhLuong)
                    tongHopData.tongCongTinhLuong += gia;
            });
            await prisma_1.default.tongHopChamCong.upsert({
                where: { kyId_employeeId: { kyId, employeeId } },
                update: tongHopData,
                create: { kyId, employeeId, ...tongHopData },
            });
        }
        res.json({ success: true, message: 'Đã tính lại tổng hợp toàn kỳ' });
    }
    catch (error) {
        console.error('Tinh luong error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
