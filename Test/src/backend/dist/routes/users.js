"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middleware/auth");
const auditService_1 = require("../services/auditService");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Helper function to calculate differences between objects
function getChanges(oldVal, newVal) {
    const changes = {};
    if (!oldVal || !newVal)
        return null;
    Object.keys(newVal).forEach(key => {
        if (JSON.stringify(oldVal[key]) !== JSON.stringify(newVal[key])) {
            changes[key] = {
                old: oldVal[key],
                new: newVal[key]
            };
        }
    });
    return Object.keys(changes).length > 0 ? changes : null;
}
// GET /api/users
router.get('/', async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            include: {
                role: true,
                businessUnit: true,
                loginHistory: {
                    orderBy: { timestamp: 'desc' },
                    take: 3
                }
            }
        });
        const transformedUsers = users.map(user => ({
            id: user.id,
            userId: user.email.split('@')[0].toUpperCase(), // Simple unique ID generation
            fullName: user.fullName || user.name,
            email: user.email,
            role: user.role?.name || 'N/A',
            roleId: user.roleId,
            businessUnits: user.businessUnit ? [user.businessUnit.name] : [],
            dataScope: user.dataScope,
            status: user.status,
            lastLogin: user.lastLogin ? user.lastLogin.toLocaleString('vi-VN') : 'Chưa đăng nhập',
            createdDate: user.createdAt.toLocaleDateString('vi-VN'),
            twoFAEnabled: user.twoFAEnabled,
            loginHistory: user.loginHistory.map(h => ({
                timestamp: h.timestamp.toLocaleString('vi-VN'),
                ip: h.ip || 'N/A',
                device: h.device || 'N/A'
            }))
        }));
        res.json(transformedUsers);
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/users
router.post('/', async (req, res) => {
    try {
        const { fullName, email, password, roleId, buId, dataScope, status, twoFAEnabled } = req.body;
        const hashedPassword = await bcryptjs_1.default.hash(password || 'admin123', 10);
        const user = await prisma_1.default.user.create({
            data: {
                fullName,
                name: fullName,
                email,
                password: hashedPassword,
                roleId,
                buId,
                dataScope: dataScope || 'personal',
                status: status || 'active',
                twoFAEnabled: !!twoFAEnabled
            },
            include: {
                role: true,
                businessUnit: true
            }
        });
        // Audit Log for CREATE
        await auditService_1.auditService.log({
            tableName: 'User',
            recordId: user.id,
            action: 'CREATE',
            userId: req.user.id,
            newValues: user,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.error('Create user error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/users/:id
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { fullName, email, roleId, buId, dataScope, status, twoFAEnabled, password } = req.body;
        const currentUser = await prisma_1.default.user.findUnique({ where: { id } });
        if (!currentUser)
            return res.status(404).json({ error: 'User not found' });
        const updateData = {
            fullName,
            name: fullName,
            email,
            roleId,
            buId,
            dataScope,
            status,
            twoFAEnabled
        };
        if (password) {
            updateData.password = await bcryptjs_1.default.hash(password, 10);
        }
        const user = await prisma_1.default.user.update({
            where: { id },
            data: updateData,
            include: {
                role: true,
                businessUnit: true
            }
        });
        // Audit Log for UPDATE
        await auditService_1.auditService.log({
            tableName: 'User',
            recordId: user.id,
            action: 'UPDATE',
            userId: req.user.id,
            oldValues: currentUser,
            newValues: user,
            changes: getChanges(currentUser, user),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.json(user);
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const currentUser = await prisma_1.default.user.findUnique({ where: { id } });
        if (!currentUser)
            return res.status(404).json({ error: 'User not found' });
        await prisma_1.default.user.delete({ where: { id } });
        // Audit Log for DELETE
        await auditService_1.auditService.log({
            tableName: 'User',
            recordId: id,
            action: 'DELETE',
            userId: req.user.id,
            oldValues: currentUser,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/users/:id/toggle-lock
router.post('/:id/toggle-lock', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const oldUser = { ...user };
        const newStatus = user.status === 'active' ? 'locked' : 'active';
        const updatedUser = await prisma_1.default.user.update({
            where: { id },
            data: { status: newStatus }
        });
        // Audit Log for UPDATE (Lock/Unlock)
        await auditService_1.auditService.log({
            tableName: 'User',
            recordId: id,
            action: 'UPDATE',
            userId: req.user.id,
            oldValues: oldUser,
            newValues: updatedUser,
            reason: `Toggled lock to ${newStatus}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.json({ status: newStatus });
    }
    catch (error) {
        console.error('Toggle lock error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
