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
// Get notifications for current user
router.get('/', async (req, res) => {
    try {
        const notifications = await prisma_1.default.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await prisma_1.default.notification.update({
            where: { id },
            data: { unread: false }
        });
        res.json(notification);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
});
// Mark all as read
router.put('/mark-all-read', async (req, res) => {
    try {
        await prisma_1.default.notification.updateMany({
            where: { userId: req.user.id, unread: true },
            data: { unread: false }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update notifications' });
    }
});
exports.default = router;
