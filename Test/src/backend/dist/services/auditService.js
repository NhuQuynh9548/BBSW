"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
exports.auditService = {
    async log(params) {
        try {
            return await prisma_1.default.auditLog.create({
                data: {
                    tableName: params.tableName,
                    recordId: params.recordId,
                    action: params.action,
                    userId: params.userId,
                    oldValues: params.oldValues || null,
                    newValues: params.newValues || null,
                    changes: params.changes || null,
                    reason: params.reason,
                    ipAddress: params.ipAddress,
                    userAgent: params.userAgent
                }
            });
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw error to avoid breaking main business logic
        }
    }
};
