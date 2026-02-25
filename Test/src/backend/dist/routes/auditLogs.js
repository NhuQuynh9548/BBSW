"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_1 = require("../middleware/auth");
const json2csv_1 = require("json2csv");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const actionTranslations = {
    'CREATE': 'THÊM MỚI',
    'UPDATE': 'CẬP NHẬT',
    'DELETE': 'XÓA',
    'APPROVE': 'DUYỆT',
    'REJECT': 'TỪ CHỐI',
    'LOGIN': 'ĐĂNG NHẬP',
    'LOGOUT': 'ĐĂNG XUẤT'
};
const tableTranslations = {
    'Transaction': 'Giao dịch',
    'Partner': 'Đối tác',
    'Employee': 'Nhân viên',
    'Category': 'Danh mục',
    'User': 'Người dùng'
};
// GET /api/audit-logs/export - Export logs to CSV
router.get('/export', async (req, res) => {
    try {
        const { tableName, action, userId, startDate, endDate } = req.query;
        const where = {};
        // Security: Non-admins can only export their own logs
        if (req.user.role !== 'Admin' && req.user.role !== 'Administrator') {
            where.userId = req.user.id;
        }
        else if (userId) {
            where.userId = userId;
        }
        if (tableName)
            where.tableName = tableName;
        if (action)
            where.action = action;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const logs = await prisma_1.default.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const csvData = logs.map(log => ({
            'Thời gian': new Date(log.createdAt).toLocaleString('vi-VN'),
            'Người dùng': log.user.fullName,
            'Email': log.user.email,
            'Hành động': actionTranslations[log.action] || log.action,
            'Bảng': tableTranslations[log.tableName] || log.tableName,
            'Record ID': log.recordId,
            'Lý do': log.reason || '',
            'IP Address': log.ipAddress || '',
            'User Agent': log.userAgent || ''
        }));
        const json2csvParser = new json2csv_1.Parser({ withBOM: true });
        const csv = json2csvParser.parse(csvData);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
        res.status(200).send(csv);
    }
    catch (error) {
        console.error('Export audit logs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/audit-logs - Get all audit logs with filters
router.get('/', async (req, res) => {
    try {
        const { tableName, action, userId, startDate, endDate, limit = 50, offset = 0 } = req.query;
        const where = {};
        // Security: Non-admins can only see their own logs
        if (req.user.role !== 'Admin' && req.user.role !== 'Administrator') {
            where.userId = req.user.id;
        }
        else if (userId) {
            // Admin can filter by any user
            where.userId = userId;
        }
        if (tableName)
            where.tableName = tableName;
        if (action)
            where.action = action;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const [logs, total] = await Promise.all([
            prisma_1.default.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: Number(limit),
                skip: Number(offset)
            }),
            prisma_1.default.auditLog.count({ where })
        ]);
        res.json({
            logs,
            pagination: {
                total,
                limit: Number(limit),
                offset: Number(offset)
            }
        });
    }
    catch (error) {
        console.error('Get all audit logs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/audit-logs/transaction/:id - Get logs for specific transaction
router.get('/transaction/:id', async (req, res) => {
    try {
        const logs = await prisma_1.default.auditLog.findMany({
            where: {
                tableName: 'Transaction',
                recordId: req.params.id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(logs);
    }
    catch (error) {
        console.error('Get transaction audit logs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
