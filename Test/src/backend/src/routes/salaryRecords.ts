import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

/**
 * GET /api/salary-records/:kyId
 * Lấy toàn bộ bản ghi lương đã lưu cho một kỳ
 */
router.get('/:kyId', async (req: AuthRequest, res: Response) => {
    try {
        const { kyId } = req.params;
        const records = await (prisma as any).salaryRecord.findMany({
            where: { kyId },
            include: {
                employee: { select: { id: true, employeeId: true, fullName: true } },
            },
        });
        res.json(records);
    } catch (error) {
        console.error('Get salary records error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * PUT /api/salary-records/:kyId/:employeeDbId
 * Upsert bản ghi lương cho một nhân viên trong một kỳ
 * Body: { phuCap, thuong, soNPT, luongCoBan?, congThucTe?, ghiChu? }
 */
router.put('/:kyId/:employeeDbId', async (req: AuthRequest, res: Response) => {
    try {
        const kyId = req.params.kyId as string;
        const employeeDbId = req.params.employeeDbId as string;
        const { phuCap = 0, thuong = 0, soNPT = 0, luongCoBan, congThucTe, ghiChu } = req.body;

        const record = await (prisma as any).salaryRecord.upsert({
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
    } catch (error) {
        console.error('Upsert salary record error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * DELETE /api/salary-records/:kyId/:employeeDbId
 * Xóa bản ghi lương (reset về mặc định)
 */
router.delete('/:kyId/:employeeDbId', async (req: AuthRequest, res: Response) => {
    try {
        const kyId = req.params.kyId as string;
        const employeeDbId = req.params.employeeDbId as string;
        await (prisma as any).salaryRecord.deleteMany({
            where: { kyId, employeeId: employeeDbId },
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Delete salary record error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
