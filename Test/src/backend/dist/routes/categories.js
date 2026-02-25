"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_1 = require("../middleware/auth");
const auditService_1 = require("../services/auditService");
const router = (0, express_1.Router)();
// All routes require authentication
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
// GET /api/categories
router.get('/', async (req, res) => {
    try {
        const { type, status } = req.query;
        let where = {};
        if (type && type !== 'all') {
            where.type = type.toString().toUpperCase();
        }
        if (status && status !== 'all') {
            where.status = status.toString().toUpperCase();
        }
        const categories = await prisma_1.default.category.findMany({
            where,
            orderBy: { code: 'asc' }
        });
        // Transform to match frontend format
        const transformedCategories = categories.map(cat => ({
            id: cat.id,
            code: cat.code,
            name: cat.name,
            type: cat.type.toLowerCase().replace('_', '-'),
            description: cat.description,
            status: cat.status.toLowerCase()
        }));
        res.json(transformedCategories);
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/categories
router.post('/', async (req, res) => {
    try {
        const { code, name, type, description, status } = req.body;
        const category = await prisma_1.default.category.create({
            data: {
                code,
                name,
                type: type.toUpperCase().replace('-', '_'),
                description,
                status: status ? status.toUpperCase() : 'ACTIVE'
            }
        });
        // Audit Log for CREATE
        await auditService_1.auditService.log({
            tableName: 'Category',
            recordId: category.id,
            action: 'CREATE',
            userId: req.user.id,
            newValues: category,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.status(201).json(category);
    }
    catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { code, name, type, description, status } = req.body;
        const currentCategory = await prisma_1.default.category.findUnique({ where: { id } });
        if (!currentCategory)
            return res.status(404).json({ error: 'Category not found' });
        const category = await prisma_1.default.category.update({
            where: { id },
            data: {
                code,
                name,
                type: type.toUpperCase().replace('-', '_'),
                description,
                status: status.toUpperCase()
            }
        });
        // Audit Log for UPDATE
        await auditService_1.auditService.log({
            tableName: 'Category',
            recordId: category.id,
            action: 'UPDATE',
            userId: req.user.id,
            oldValues: currentCategory,
            newValues: category,
            changes: getChanges(currentCategory, category),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.json(category);
    }
    catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const currentCategory = await prisma_1.default.category.findUnique({ where: { id } });
        if (!currentCategory)
            return res.status(404).json({ error: 'Category not found' });
        await prisma_1.default.category.delete({
            where: { id }
        });
        // Audit Log for DELETE
        await auditService_1.auditService.log({
            tableName: 'Category',
            recordId: id,
            action: 'DELETE',
            userId: req.user.id,
            oldValues: currentCategory,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
