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
// GET /api/salary-configs
router.get('/', async (req, res) => {
    try {
        const configs = await prisma_1.default.salaryConfig.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(configs);
    }
    catch (error) {
        console.error('Get salary configs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/salary-configs
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const newConfig = await prisma_1.default.salaryConfig.create({
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
    }
    catch (error) {
        console.error('Create salary config error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/salary-configs/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedConfig = await prisma_1.default.salaryConfig.update({
            where: { id: id },
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
    }
    catch (error) {
        console.error('Update salary config error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/salary-configs/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.salaryConfig.delete({
            where: { id: id }
        });
        res.json({ message: 'Configuration deleted successfully' });
    }
    catch (error) {
        console.error('Delete salary config error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
