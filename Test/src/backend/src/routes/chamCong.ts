import { Router, Response, Request } from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import * as XLSX from 'xlsx';

const router = Router();
router.use(authenticate);

const upload = multer({ storage: multer.memoryStorage() });

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
const NGAY_LE_VIET_NAM: string[] = [
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
function isNgayLe(date: Date): boolean {
    const str = date.toISOString().split('T')[0];
    return NGAY_LE_VIET_NAM.includes(str);
}

// Trả về true nếu là Thứ 7 (6) hoặc Chủ nhật (0) — cả 2 đều nghỉ
function isNghiCuoiTuan(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = CN, 6 = T7
}

// ===================== KỲ CHẤM CÔNG =====================

// GET /api/cham-cong/ky
router.get('/ky', async (req: AuthRequest, res: Response) => {
    try {
        const ky = await (prisma as any).kyChamCong.findMany({
            orderBy: { ngayBatDau: 'desc' },
        });
        res.json(ky);
    } catch (error) {
        console.error('Get ky cham cong error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/cham-cong/ky
router.post('/ky', async (req: AuthRequest, res: Response) => {
    try {
        const { tenKy, ngayBatDau, ngayKetThuc, loaiTruChuNhat, loaiTruNgayLe } = req.body;

        const ky = await (prisma as any).kyChamCong.create({
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
        const employees = await prisma.employee.findMany({
            where: { workStatus: { in: ['WORKING', 'PROBATION'] } },
            select: { id: true },
        });

        if (employees.length > 0) {
            await (prisma as any).tongHopChamCong.createMany({
                data: employees.map((e: any) => ({
                    kyId: ky.id,
                    employeeId: e.id,
                })),
                skipDuplicates: true,
            });
        }

        res.status(201).json(ky);
    } catch (error) {
        console.error('Create ky cham cong error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// POST /api/cham-cong/sync-nhan-vien/:kyId — Đồng bộ nhân viên chưa có vào kỳ
router.post('/sync-nhan-vien/:kyId', async (req: AuthRequest, res: Response) => {
    try {
        const { kyId } = req.params;
        const ky = await (prisma as any).kyChamCong.findUnique({ where: { id: kyId } });
        if (!ky) return res.status(404).json({ error: 'Kỳ không tồn tại' });

        const allEmployees = await prisma.employee.findMany({
            where: { workStatus: { in: ['WORKING', 'PROBATION'] } },
            select: { id: true },
        });
        const existing = await (prisma as any).tongHopChamCong.findMany({
            where: { kyId },
            select: { employeeId: true },
        });
        const existingIds = new Set(existing.map((e: any) => e.employeeId));
        const missing = allEmployees.filter((e) => !existingIds.has(e.id));

        if (missing.length > 0) {
            await (prisma as any).tongHopChamCong.createMany({
                data: missing.map((e) => ({
                    kyId,
                    employeeId: e.id,
                    congChuan: ky.congChuan || 0,
                })),
                skipDuplicates: true,
            });
        }
        res.json({ soNhanVienMoi: missing.length, tongNhanVien: allEmployees.length });
    } catch (error) {
        console.error('Sync nhan vien error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/cham-cong/ky/:id
router.put('/ky/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { tenKy, ngayBatDau, ngayKetThuc, loaiTruChuNhat, loaiTruNgayLe } = req.body;

        const ky = await (prisma as any).kyChamCong.update({
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
    } catch (error) {
        console.error('Update ky cham cong error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/cham-cong/ky/:id/tinh-cong — Tính công chuẩn
router.post('/ky/:id/tinh-cong', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const ky = await (prisma as any).kyChamCong.findUnique({ where: { id } });
        if (!ky) return res.status(404).json({ error: 'Kỳ không tồn tại' });

        let congChuan = 0;
        const start = new Date(ky.ngayBatDau);
        const end = new Date(ky.ngayKetThuc);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (ky.loaiTruChuNhat && isNghiCuoiTuan(new Date(d))) continue;
            if (ky.loaiTruNgayLe && isNgayLe(new Date(d))) continue;
            congChuan++;
        }

        await (prisma as any).kyChamCong.update({
            where: { id },
            data: { congChuan },
        });

        // Cập nhật cột congChuan trong tổng hợp
        await (prisma as any).tongHopChamCong.updateMany({
            where: { kyId: id },
            data: { congChuan },
        });

        res.json({ congChuan });
    } catch (error) {
        console.error('Tinh cong error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/cham-cong/ky/:id/khoa — Khóa kỳ
router.post('/ky/:id/khoa', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const ky = await (prisma as any).kyChamCong.update({
            where: { id },
            data: { trangThai: 'da_khoa' },
        });
        res.json(ky);
    } catch (error) {
        console.error('Khoa ky error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ===================== MÃ CHẤM CÔNG =====================

// GET /api/cham-cong/ma-cham-cong
router.get('/ma-cham-cong', async (req: AuthRequest, res: Response) => {
    try {
        const dsMa = await (prisma as any).maChamCong.findMany({
            orderBy: { ma: 'asc' },
        });
        res.json(dsMa);
    } catch (error) {
        console.error('Get ma cham cong error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/cham-cong/ma-cham-cong
router.post('/ma-cham-cong', async (req: AuthRequest, res: Response) => {
    try {
        const { ma, ten, loai, giaTriCong, duocTinhLuong } = req.body;
        const mcc = await (prisma as any).maChamCong.create({
            data: { ma: ma.toUpperCase().trim(), ten, loai, giaTriCong, duocTinhLuong },
        });
        res.status(201).json(mcc);
    } catch (error: any) {
        if (error.code === 'P2002') return res.status(400).json({ error: 'Mã đã tồn tại' });
        console.error('Create ma cham cong error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ===================== TỔNG HỢP =====================

// GET /api/cham-cong/tong-hop/:kyId
router.get('/tong-hop/:kyId', async (req: AuthRequest, res: Response) => {
    try {
        const { kyId } = req.params;
        const { search } = req.query;

        const tongHop = await (prisma as any).tongHopChamCong.findMany({
            where: {
                kyId,
                employee: search
                    ? {
                        OR: [
                            { fullName: { contains: search as string, mode: 'insensitive' } },
                            { employeeId: { contains: search as string, mode: 'insensitive' } },
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

        res.json(tongHop);
    } catch (error) {
        console.error('Get tong hop error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ===================== CHI TIẾT THEO NV =====================

// GET /api/cham-cong/chi-tiet/:kyId/:employeeId
router.get('/chi-tiet/:kyId/:employeeId', async (req: AuthRequest, res: Response) => {
    try {
        const { kyId, employeeId } = req.params;

        const ky = await (prisma as any).kyChamCong.findUnique({ where: { id: kyId } });
        if (!ky) return res.status(404).json({ error: 'Kỳ không tồn tại' });

        // Lấy tất cả ngày trong kỳ
        const days: string[] = [];
        const start = new Date(ky.ngayBatDau);
        const end = new Date(ky.ngayKetThuc);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push(d.toISOString().split('T')[0]);
        }

        // Lấy chi tiết hiện có
        const chiTiet = await (prisma as any).chiTietChamCong.findMany({
            where: { kyId, employeeId },
            include: { maChamCong: true },
        });

        const chiTietMap: Record<string, any> = {};
        chiTiet.forEach((ct: any) => {
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
        const freshTongHop = {
            congChuan,
            congChinhThuc: 0, congThuViec: 0, phepNam: 0,
            khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0, tongCongTinhLuong: 0,
        };
        chiTiet.forEach((ct: any) => {
            if (!ct.maChamCong) return;
            const loai = ct.maChamCong.loai; const gia = ct.giaTriCong;
            if (loai === 'chinh_thuc') freshTongHop.congChinhThuc += gia;
            else if (loai === 'thu_viec') freshTongHop.congThuViec += gia;
            else if (loai === 'phep') freshTongHop.phepNam += gia;
            else if (loai === 'khong_luong') freshTongHop.khongLuong += gia;
            else if (loai === 'le') freshTongHop.nghiLe += gia;
            else if (loai === 'nghi_bu') freshTongHop.nghiBu += gia;
            else if (loai === 'vang') freshTongHop.vang += gia;
            if (ct.maChamCong.duocTinhLuong) freshTongHop.tongCongTinhLuong += gia;
        });
        await (prisma as any).tongHopChamCong.upsert({
            where: { kyId_employeeId: { kyId, employeeId } },
            update: freshTongHop,
            create: { kyId, employeeId, ...freshTongHop },
        });

        res.json({ days: result, tongHop: freshTongHop });

    } catch (error) {
        console.error('Get chi tiet error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/cham-cong/chi-tiet/:kyId/:employeeId — Xóa toàn bộ chi tiết 1 NV và reset tổng hợp
router.delete('/chi-tiet/:kyId/:employeeId', async (req: AuthRequest, res: Response) => {
    try {
        const { kyId, employeeId } = req.params;
        const ky = await (prisma as any).kyChamCong.findUnique({ where: { id: kyId } });
        if (!ky) return res.status(404).json({ error: 'Kỳ không tồn tại' });
        if (ky.trangThai === 'da_khoa') return res.status(400).json({ error: 'Kỳ đã khóa' });

        await (prisma as any).chiTietChamCong.deleteMany({ where: { kyId, employeeId } });
        await (prisma as any).tongHopChamCong.updateMany({
            where: { kyId, employeeId },
            data: { congChinhThuc: 0, congThuViec: 0, phepNam: 0, khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0, tongCongTinhLuong: 0 },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete chi tiet error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/cham-cong/reset-tong-hop/:kyId — Reset & tính lại tổng hợp dựa trên chi tiết hiện có
router.post('/reset-tong-hop/:kyId', async (req: AuthRequest, res: Response) => {
    try {
        const { kyId } = req.params;
        const ky = await (prisma as any).kyChamCong.findUnique({ where: { id: kyId } });
        if (!ky) return res.status(404).json({ error: 'Kỳ không tồn tại' });

        const congChuan = ky.congChuan || 0;

        // Bước 1: Reset TẤT CẢ về 0
        await (prisma as any).tongHopChamCong.updateMany({
            where: { kyId },
            data: { congChinhThuc: 0, congThuViec: 0, phepNam: 0, khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0, tongCongTinhLuong: 0, congChuan },
        });

        // Bước 2: Tính lại cho NV có chi tiết
        const allChiTiet = await (prisma as any).chiTietChamCong.findMany({ where: { kyId }, include: { maChamCong: true } });
        const byEmployee: Record<string, any[]> = {};
        allChiTiet.forEach((ct: any) => {
            if (!byEmployee[ct.employeeId]) byEmployee[ct.employeeId] = [];
            byEmployee[ct.employeeId].push(ct);
        });

        for (const [employeeId, chiTiets] of Object.entries(byEmployee)) {
            const data: any = { congChuan, congChinhThuc: 0, congThuViec: 0, phepNam: 0, khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0, tongCongTinhLuong: 0 };
            (chiTiets as any[]).forEach((ct: any) => {
                if (!ct.maChamCong) return;
                const loai = ct.maChamCong.loai; const gia = ct.giaTriCong;
                if (loai === 'chinh_thuc') data.congChinhThuc += gia;
                else if (loai === 'thu_viec') data.congThuViec += gia;
                else if (loai === 'phep') data.phepNam += gia;
                else if (loai === 'khong_luong') data.khongLuong += gia;
                else if (loai === 'le') data.nghiLe += gia;
                else if (loai === 'nghi_bu') data.nghiBu += gia;
                else if (loai === 'vang') data.vang += gia;
                if (ct.maChamCong.duocTinhLuong) data.tongCongTinhLuong += gia;
            });
            await (prisma as any).tongHopChamCong.updateMany({ where: { kyId, employeeId }, data });
        }

        res.json({ success: true, message: `Đã reset và tính lại tổng hợp cho kỳ` });
    } catch (error) {
        console.error('Reset tong hop error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/cham-cong/chi-tiet — Cập nhật 1 ô chấm công
router.put('/chi-tiet', async (req: AuthRequest, res: Response) => {
    try {
        const { kyId, employeeId, ngay, maChamCongId, ghiChu } = req.body;

        const ky = await (prisma as any).kyChamCong.findUnique({ where: { id: kyId } });
        if (!ky) return res.status(404).json({ error: 'Kỳ không tồn tại' });
        if (ky.trangThai === 'da_khoa') return res.status(400).json({ error: 'Kỳ đã khóa, không thể chỉnh sửa' });

        let giaTriCong = 0;
        let loai = null;
        let duocTinhLuong = false;

        if (maChamCongId) {
            const mcc = await (prisma as any).maChamCong.findUnique({ where: { id: maChamCongId } });
            if (mcc) {
                giaTriCong = mcc.giaTriCong;
                loai = mcc.loai;
                duocTinhLuong = mcc.duocTinhLuong;
            }
        }

        // Upsert chi tiết
        const chiTiet = await (prisma as any).chiTietChamCong.upsert({
            where: { kyId_employeeId_ngay: { kyId, employeeId, ngay: new Date(ngay) } },
            update: { maChamCongId: maChamCongId || null, giaTriCong, ghiChu },
            create: { kyId, employeeId, ngay: new Date(ngay), maChamCongId: maChamCongId || null, giaTriCong, ghiChu },
            include: { maChamCong: true },
        });

        // Tính lại tổng hợp cho NV này trong kỳ
        const allChiTiet = await (prisma as any).chiTietChamCong.findMany({
            where: { kyId, employeeId },
            include: { maChamCong: true },
        });

        const tongHopData = {
            congChinhThuc: 0,
            congThuViec: 0,
            phepNam: 0,
            khongLuong: 0,
            nghiLe: 0,
            nghiBu: 0,
            vang: 0,
            tongCongTinhLuong: 0,
        };

        allChiTiet.forEach((ct: any) => {
            if (!ct.maChamCong) return;
            const loaiCt = ct.maChamCong.loai;
            const gia = ct.giaTriCong;
            if (loaiCt === 'chinh_thuc') tongHopData.congChinhThuc += gia;
            else if (loaiCt === 'thu_viec') tongHopData.congThuViec += gia;
            else if (loaiCt === 'phep') tongHopData.phepNam += gia;
            else if (loaiCt === 'khong_luong') tongHopData.khongLuong += gia;
            else if (loaiCt === 'le') tongHopData.nghiLe += gia;
            else if (loaiCt === 'nghi_bu') tongHopData.nghiBu += gia;
            else if (loaiCt === 'vang') tongHopData.vang += gia;
            if (ct.maChamCong.duocTinhLuong) tongHopData.tongCongTinhLuong += gia;
        });

        await (prisma as any).tongHopChamCong.upsert({
            where: { kyId_employeeId: { kyId, employeeId } },
            update: tongHopData,
            create: { kyId, employeeId, ...tongHopData },
        });

        res.json({ chiTiet, tongHop: tongHopData });
    } catch (error) {
        console.error('Update chi tiet error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ===================== IMPORT EXCEL =====================

// POST /api/cham-cong/import/:kyId
router.post('/import/:kyId', upload.single('file'), async (req: AuthRequest, res: Response) => {
    try {
        const { kyId } = req.params;
        const ghiDe = req.body.ghiDe === 'true';

        const ky = await (prisma as any).kyChamCong.findUnique({ where: { id: kyId } });
        if (!ky) return res.status(404).json({ error: 'Kỳ không tồn tại' });
        if (ky.trangThai !== 'nhap') return res.status(400).json({ error: 'Chỉ được import khi kỳ ở trạng thái Nhập' });
        if (!req.file) return res.status(400).json({ error: 'Không có file' });

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (rows.length < 2) return res.status(400).json({ error: 'File trống hoặc không đúng định dạng' });

        const headerRow: any[] = rows[0];

        // Debug log
        console.log('[IMPORT] Header:', headerRow);
        console.log('[IMPORT] Rows count:', rows.length - 1, '| Sample row 1:', rows[1]);

        // ---- Dò cột Mã NV ----
        function normalizeStr(s: string): string {
            return s.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, ' ').trim();
        }
        const MA_NV_PATTERNS = ['ma nv', 'ma nhan vien', 'employee id', 'employee_id', 'ma so nv', 'ma so', 'ma'];
        let maNVColIdx = headerRow.findIndex((h: any) => {
            const norm = normalizeStr(String(h));
            return MA_NV_PATTERNS.some(p => norm.includes(p));
        });
        // Fallback: scan sample rows xem cột nào có dạng mã NV (chữ + số)
        if (maNVColIdx === -1) {
            for (let c = 0; c < Math.min(4, headerRow.length); c++) {
                const sample = String(rows[1]?.[c] || '').trim();
                if (/^[A-Za-z]{1,4}\d{2,5}$/.test(sample)) { maNVColIdx = c; break; }
            }
        }
        // Cuối cùng: dùng cột 1 làm mặc định (sau cột STT)
        if (maNVColIdx === -1) maNVColIdx = 1;
        console.log('[IMPORT] maNVColIdx =', maNVColIdx, '| header value:', headerRow[maNVColIdx]);

        // ---- Dò cột ngày (header là số 1-31) ----
        const dayColumns: { idx: number; day: number }[] = [];
        headerRow.forEach((h: any, idx: number) => {
            if (idx === maNVColIdx) return;
            const str = String(h).trim();
            const n = Math.floor(parseFloat(str)); // hỗ trợ cả "26.0"
            if (!isNaN(n) && n >= 1 && n <= 31 && parseFloat(str) === n) {
                dayColumns.push({ idx, day: n });
            }
        });
        console.log('[IMPORT] dayColumns:', dayColumns.map(d => d.day).join(', ') || '(none)');

        if (dayColumns.length === 0) {
            return res.status(400).json({
                error: 'Không tìm thấy cột ngày trong file. Header hàng đầu phải có các số ngày (VD: 26, 27, 28...).',
                debug: { headerRow, maNVColIdx }
            });
        }

        // Lấy tất cả mã chấm công
        const allMaChamCong = await (prisma as any).maChamCong.findMany();
        const mccMap: Record<string, any> = {};
        allMaChamCong.forEach((mcc: any) => { mccMap[mcc.ma.toUpperCase()] = mcc; });

        // Lấy tất cả nhân viên
        const allEmployees = await prisma.employee.findMany({ select: { id: true, employeeId: true } });
        const empMap: Record<string, string> = {};
        allEmployees.forEach((e) => { empMap[e.employeeId.toUpperCase()] = e.id; });

        const TONG_HOP_ZERO = {
            congChinhThuc: 0, congThuViec: 0, phepNam: 0,
            khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0, tongCongTinhLuong: 0,
        };

        if (ghiDe) {
            // Xóa toàn bộ chi tiết
            await (prisma as any).chiTietChamCong.deleteMany({ where: { kyId } });
            // Reset tổng hợp về 0 cho tất cả NV trong kỳ
            await (prisma as any).tongHopChamCong.updateMany({
                where: { kyId },
                data: TONG_HOP_ZERO,
            });
        }

        let soDongThanhCong = 0;
        let soDongLoi = 0;
        const danhSachLoi: any[] = [];

        const startDate = new Date(ky.ngayBatDau);
        const endDate = new Date(ky.ngayKetThuc);

        for (let rIdx = 1; rIdx < rows.length; rIdx++) {
            const row = rows[rIdx];
            const maNV = String(row[maNVColIdx] || '').toUpperCase().trim();
            if (!maNV) continue;

            const employeeId = empMap[maNV];
            if (!employeeId) {
                soDongLoi++;
                danhSachLoi.push({ dong: rIdx + 1, maNV, lyDo: `Nhân viên ${maNV} không tồn tại` });
                continue;
            }

            for (const { idx, day } of dayColumns) {
                const maCC = String(row[idx] || '').toUpperCase().trim();
                if (!maCC) continue;

                // Xây dựng ngày — dùng UTC để tránh lệch múi giờ
                const year = startDate.getUTCFullYear();
                const month = startDate.getUTCMonth(); // 0-indexed UTC
                let targetDate = new Date(Date.UTC(year, month, day));
                // Nếu ngày nhỏ hơn ngày bắt đầu → sang tháng kế tiếp
                if (targetDate < startDate) targetDate = new Date(Date.UTC(year, month + 1, day));
                if (targetDate > endDate) continue;


                const mccObj = mccMap[maCC];
                if (!mccObj) {
                    soDongLoi++;
                    danhSachLoi.push({ dong: rIdx + 1, maNV, lyDo: `Mã công '${maCC}' ngày ${day} không tồn tại` });
                    continue;
                }

                try {
                    await (prisma as any).chiTietChamCong.upsert({
                        where: { kyId_employeeId_ngay: { kyId, employeeId, ngay: targetDate } },
                        update: { maChamCongId: mccObj.id, giaTriCong: mccObj.giaTriCong },
                        create: { kyId, employeeId, ngay: targetDate, maChamCongId: mccObj.id, giaTriCong: mccObj.giaTriCong },
                    });
                    soDongThanhCong++;
                } catch {
                    soDongLoi++;
                    danhSachLoi.push({ dong: rIdx + 1, maNV, lyDo: `Lỗi khi lưu ngày ${day}` });
                }
            }
        }

        // ===== AUTO RECALC TONGHOP sau import =====
        // Reset tất cả về 0 rồi tính lại từ chi tiết hiện có
        const congChuan = ky.congChuan || 0;
        await (prisma as any).tongHopChamCong.updateMany({
            where: { kyId },
            data: { congChinhThuc: 0, congThuViec: 0, phepNam: 0, khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0, tongCongTinhLuong: 0, congChuan },
        });

        const allChiTietPost = await (prisma as any).chiTietChamCong.findMany({ where: { kyId }, include: { maChamCong: true } });
        const byEmp: Record<string, any[]> = {};
        allChiTietPost.forEach((ct: any) => {
            if (!byEmp[ct.employeeId]) byEmp[ct.employeeId] = [];
            byEmp[ct.employeeId].push(ct);
        });
        for (const [employeeId, chiTiets] of Object.entries(byEmp)) {
            const d: any = { congChuan, congChinhThuc: 0, congThuViec: 0, phepNam: 0, khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0, tongCongTinhLuong: 0 };
            (chiTiets as any[]).forEach((ct: any) => {
                if (!ct.maChamCong) return;
                const loai = ct.maChamCong.loai; const gia = ct.giaTriCong;
                if (loai === 'chinh_thuc') d.congChinhThuc += gia;
                else if (loai === 'thu_viec') d.congThuViec += gia;
                else if (loai === 'phep') d.phepNam += gia;
                else if (loai === 'khong_luong') d.khongLuong += gia;
                else if (loai === 'le') d.nghiLe += gia;
                else if (loai === 'nghi_bu') d.nghiBu += gia;
                else if (loai === 'vang') d.vang += gia;
                if (ct.maChamCong.duocTinhLuong) d.tongCongTinhLuong += gia;
            });
            await (prisma as any).tongHopChamCong.upsert({
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
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/cham-cong/ky/:id/tinh-luong — Tính lại toàn bộ tổng hợp cho kỳ
router.post('/ky/:id/tinh-luong', async (req: AuthRequest, res: Response) => {
    try {
        const { id: kyId } = req.params;

        const allChiTiet = await (prisma as any).chiTietChamCong.findMany({
            where: { kyId },
            include: { maChamCong: true },
        });

        const byEmployee: Record<string, any[]> = {};
        allChiTiet.forEach((ct: any) => {
            if (!byEmployee[ct.employeeId]) byEmployee[ct.employeeId] = [];
            byEmployee[ct.employeeId].push(ct);
        });

        const ky = await (prisma as any).kyChamCong.findUnique({ where: { id: kyId } });
        const congChuan = ky?.congChuan || 0;

        // Bước 1: Reset tất cả TongHop về 0 trước khi tính lại
        // (đảm bảo NV đã bị xóa chi tiết cũng được reset)
        await (prisma as any).tongHopChamCong.updateMany({
            where: { kyId },
            data: {
                congChinhThuc: 0, congThuViec: 0, phepNam: 0,
                khongLuong: 0, nghiLe: 0, nghiBu: 0, vang: 0,
                tongCongTinhLuong: 0, congChuan,
            },
        });

        // Bước 2: Tính lại cho từng NV có chi tiết
        for (const [employeeId, chiTiets] of Object.entries(byEmployee)) {
            const tongHopData: any = {
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

            chiTiets.forEach((ct: any) => {
                if (!ct.maChamCong) return;
                const loai = ct.maChamCong.loai;
                const gia = ct.giaTriCong;
                if (loai === 'chinh_thuc') tongHopData.congChinhThuc += gia;
                else if (loai === 'thu_viec') tongHopData.congThuViec += gia;
                else if (loai === 'phep') tongHopData.phepNam += gia;
                else if (loai === 'khong_luong') tongHopData.khongLuong += gia;
                else if (loai === 'le') tongHopData.nghiLe += gia;
                else if (loai === 'nghi_bu') tongHopData.nghiBu += gia;
                else if (loai === 'vang') tongHopData.vang += gia;
                if (ct.maChamCong.duocTinhLuong) tongHopData.tongCongTinhLuong += gia;
            });

            await (prisma as any).tongHopChamCong.upsert({
                where: { kyId_employeeId: { kyId, employeeId } },
                update: tongHopData,
                create: { kyId, employeeId, ...tongHopData },
            });
        }

        res.json({ success: true, message: 'Đã tính lại tổng hợp toàn kỳ' });
    } catch (error) {
        console.error('Tinh luong error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
