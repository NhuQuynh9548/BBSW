import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/payment-methods
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const paymentMethods: any[] = await prisma.$queryRaw`
            SELECT 
                pm.*,
                COALESCE(SUM(t.amount), 0) AS "totalTransactions",
                (pm.opening_balance - COALESCE(SUM(t.amount), 0)) AS "balance"
            FROM payment_methods pm
            LEFT JOIN transactions t ON t.payment_method_id = pm.id
            GROUP BY pm.id
            ORDER BY pm.name ASC
        `;

        // Map snake_case to camelCase for frontend
        const result = paymentMethods.map((pm: any) => ({
            id: pm.id,
            code: pm.code,
            name: pm.name,
            type: pm.type,
            accountInfo: pm.account_info,
            owner: pm.owner,
            buName: pm.bu_name,
            status: pm.status,
            openingBalance: Number(pm.opening_balance || 0),
            balance: Number(pm.balance || 0),
            totalTransactions: Number(pm.totalTransactions || 0),
            createdAt: pm.created_at,
            updatedAt: pm.updated_at,
        }));

        res.json(result);
    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/payment-methods
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const { openingBalance, balance, ...rest } = req.body;
        const ob = openingBalance ?? 0;

        const paymentMethod = await prisma.paymentMethod.create({
            data: { ...rest, balance: ob }
        });

        // Also set opening_balance via raw SQL
        await prisma.$executeRawUnsafe(
            `UPDATE payment_methods SET opening_balance = $1 WHERE id = $2`,
            ob, paymentMethod.id
        );

        res.status(201).json({ ...paymentMethod, openingBalance: ob });
    } catch (error) {
        console.error('Create payment method error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/payment-methods/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { openingBalance, balance, ...rest } = req.body;
        const id = req.params.id as string;

        // Update main fields via Prisma (excluding openingBalance and balance)
        const paymentMethod = await prisma.paymentMethod.update({
            where: { id },
            data: rest
        });

        // Update opening_balance via raw SQL if provided
        if (openingBalance !== undefined) {
            await prisma.$executeRawUnsafe(
                `UPDATE payment_methods SET opening_balance = $1 WHERE id = $2`,
                Number(openingBalance), id
            );
        }

        res.json({ ...paymentMethod, openingBalance: openingBalance ?? 0 });
    } catch (error) {
        console.error('Update payment method error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/payment-methods/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const pm: any = await prisma.paymentMethod.findUnique({
            where: { id: req.params.id as string },
            include: { _count: { select: { transactions: true, partners: true } } }
        });

        if (pm && (pm._count.transactions > 0 || pm._count.partners > 0)) {
            return res.status(400).json({ error: 'Cannot delete payment method used in transactions or partners' });
        }

        await prisma.paymentMethod.delete({
            where: { id: req.params.id as string }
        });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
