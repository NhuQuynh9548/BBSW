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
// GET /api/payment-methods
router.get('/', async (req, res) => {
    try {
        const paymentMethods = await prisma_1.default.$queryRaw `
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
        const result = paymentMethods.map((pm) => ({
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
    }
    catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/payment-methods
router.post('/', async (req, res) => {
    try {
        const { openingBalance, balance, ...rest } = req.body;
        const ob = openingBalance ?? 0;
        const paymentMethod = await prisma_1.default.paymentMethod.create({
            data: { ...rest, balance: ob }
        });
        // Also set opening_balance via raw SQL
        await prisma_1.default.$executeRawUnsafe(`UPDATE payment_methods SET opening_balance = $1 WHERE id = $2`, ob, paymentMethod.id);
        res.status(201).json({ ...paymentMethod, openingBalance: ob });
    }
    catch (error) {
        console.error('Create payment method error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/payment-methods/:id
router.put('/:id', async (req, res) => {
    try {
        const { openingBalance, balance, ...rest } = req.body;
        const id = req.params.id;
        // Update main fields via Prisma (excluding openingBalance and balance)
        const paymentMethod = await prisma_1.default.paymentMethod.update({
            where: { id },
            data: rest
        });
        // Update opening_balance via raw SQL if provided
        if (openingBalance !== undefined) {
            await prisma_1.default.$executeRawUnsafe(`UPDATE payment_methods SET opening_balance = $1 WHERE id = $2`, Number(openingBalance), id);
        }
        res.json({ ...paymentMethod, openingBalance: openingBalance ?? 0 });
    }
    catch (error) {
        console.error('Update payment method error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/payment-methods/:id
router.delete('/:id', async (req, res) => {
    try {
        const pm = await prisma_1.default.paymentMethod.findUnique({
            where: { id: req.params.id },
            include: { _count: { select: { transactions: true, partners: true } } }
        });
        if (pm && (pm._count.transactions > 0 || pm._count.partners > 0)) {
            return res.status(400).json({ error: 'Cannot delete payment method used in transactions or partners' });
        }
        await prisma_1.default.paymentMethod.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Deleted successfully' });
    }
    catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
