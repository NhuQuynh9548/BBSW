const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'routes', 'chamCong.ts');
let content = fs.readFileSync(filePath, 'utf8');

const SYNC_ENDPOINT = `
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
        const existingIds = new Set(existing.map((e) => e.employeeId));
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

`;

// Insert after the closing of POST /ky route (before PUT /ky/:id)
const INSERT_BEFORE = '// PUT /api/cham-cong/ky/:id';
const idx = content.indexOf(INSERT_BEFORE);
if (idx === -1) {
    console.error('❌ Không tìm thấy vị trí chèn');
    process.exit(1);
}

const newContent = content.slice(0, idx) + SYNC_ENDPOINT + content.slice(idx);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ Đã thêm endpoint /sync-nhan-vien thành công!');
