import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/salary-configs
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const configs = await prisma.salaryConfig.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(configs);
    } catch (error) {
        console.error('Get salary configs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/salary-configs
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const data = req.body;
        const newConfig = await prisma.salaryConfig.create({
            data: {
                code: data.code,
                name: data.name,
                status: data.status || 'ACTIVE',
                cycleStartDay: data.cycleStartDay,
                cycleEndDay: data.cycleEndDay,
                workingDaysOfWeek: data.workingDaysOfWeek,
                excludedDaysOfWeek: data.excludedDaysOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
                breakMinutes: data.breakMinutes
            }
        });
        res.status(201).json(newConfig);
    } catch (error) {
        console.error('Create salary config error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/salary-configs/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updatedConfig = await prisma.salaryConfig.update({
            where: { id: id as string },
            data: {
                code: data.code,
                name: data.name,
                status: data.status,
                cycleStartDay: data.cycleStartDay,
                cycleEndDay: data.cycleEndDay,
                workingDaysOfWeek: data.workingDaysOfWeek,
                excludedDaysOfWeek: data.excludedDaysOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
                breakMinutes: data.breakMinutes
            }
        });
        res.json(updatedConfig);
    } catch (error) {
        console.error('Update salary config error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/salary-configs/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.salaryConfig.delete({
            where: { id: id as string }
        });
        res.json({ message: 'Configuration deleted successfully' });
    } catch (error) {
        console.error('Delete salary config error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
