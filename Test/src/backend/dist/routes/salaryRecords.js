"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
/**
 * GET /api/salary-records/:kyId
 * Lấy toàn bộ bản ghi lương đã lưu cho một kỳ
 */
router.get('/:kyId', async (req, res) => {
    try {
        const { kyId } = req.params;
        const records = await prisma_1.default.salaryRecord.findMany({
            where: { kyId },
            include: {
                employee: { select: { id: true, employeeId: true, fullName: true } },
            },
        });
        res.json(records);
    }
    catch (error) {
        console.error('Get salary records error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * PUT /api/salary-records/:kyId/:employeeDbId
 * Upsert bản ghi lương cho một nhân viên trong một kỳ
 * Body: { phuCap, thuong, soNPT, luongCoBan?, congThucTe?, ghiChu? }
 */
router.put('/:kyId/:employeeDbId', async (req, res) => {
    try {
        const kyId = req.params.kyId;
        const employeeDbId = req.params.employeeDbId;
        const { phuCap = 0, thuong = 0, soNPT = 0, luongCoBan, congThucTe, ghiChu } = req.body;
        const record = await prisma_1.default.salaryRecord.upsert({
            where: { kyId_employeeId: { kyId, employeeId: employeeDbId } },
            update: {
                phuCap: Number(phuCap),
                thuong: Number(thuong),
                soNPT: Number(soNPT),
                luongCoBan: luongCoBan != null ? Number(luongCoBan) : null,
                congThucTe: congThucTe != null ? Number(congThucTe) : null,
                ghiChu: ghiChu ?? null,
            },
            create: {
                kyId,
                employeeId: employeeDbId,
                phuCap: Number(phuCap),
                thuong: Number(thuong),
                soNPT: Number(soNPT),
                luongCoBan: luongCoBan != null ? Number(luongCoBan) : null,
                congThucTe: congThucTe != null ? Number(congThucTe) : null,
                ghiChu: ghiChu ?? null,
            },
        });
        res.json(record);
    }
    catch (error) {
        console.error('Upsert salary record error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * DELETE /api/salary-records/:kyId/:employeeDbId
 * Xóa bản ghi lương (reset về mặc định)
 */
router.delete('/:kyId/:employeeDbId', async (req, res) => {
    try {
        const kyId = req.params.kyId;
        const employeeDbId = req.params.employeeDbId;
        await prisma_1.default.salaryRecord.deleteMany({
            where: { kyId, employeeId: employeeDbId },
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete salary record error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
