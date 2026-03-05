import api from './api';

export interface SalaryRecordData {
    phuCap: number;
    thuong: number;
    soNPT: number;
    luongCoBan?: number | null;
    congThucTe?: number | null;
    ghiChu?: string;
}

export interface SalaryRecord extends SalaryRecordData {
    id: string;
    kyId: string;
    employeeId: string;   // DB UUID
    createdAt: string;
    updatedAt: string;
    employee?: {
        id: string;
        employeeId: string; // mã NV (BB001...)
        fullName: string;
    };
}

const BASE = '/salary-records';

export const salaryRecordService = {
    /**
     * Lấy tất cả bản ghi lương theo kỳ
     */
    getByKy: async (kyId: string): Promise<SalaryRecord[]> => {
        const res = await api.get(`${BASE}/${kyId}`);
        return res.data;
    },

    /**
     * Lưu (upsert) bản ghi lương cho một nhân viên trong một kỳ
     * @param employeeDbId  UUID trong bảng employees (không phải mã BB001)
     */
    save: async (kyId: string, employeeDbId: string, data: SalaryRecordData): Promise<SalaryRecord> => {
        const res = await api.put(`${BASE}/${kyId}/${employeeDbId}`, data);
        return res.data;
    },

    /**
     * Xóa bản ghi lương (reset về mặc định)
     */
    delete: async (kyId: string, employeeDbId: string): Promise<void> => {
        await api.delete(`${BASE}/${kyId}/${employeeDbId}`);
    },
};
