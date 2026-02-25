import api from './api';

export interface EmployeeFilters {
    buId?: string;
    specialization?: string;
    status?: string;
    search?: string;
}

export const employeeService = {
    async getAll(filters?: EmployeeFilters) {
        const response = await api.get('/employees', { params: filters });
        return response.data;
    },

    async getById(id: string) {
        const response = await api.get(`/employees/${id}`);
        return response.data;
    },

    async create(data: any) {
        const response = await api.post('/employees', data);
        return response.data;
    },

    async update(id: string, data: any) {
        const response = await api.put(`/employees/${id}`, data);
        return response.data;
    },

    // Dedicated salary-only update (uses PATCH for reliability)
    async updateSalary(id: string, actualSalary: number, description?: string) {
        const response = await api.patch(`/employees/${id}/salary`, { actualSalary, description });
        return response.data;
    },

    // Get salary change history for an employee
    async getSalaryHistory(id: string) {
        const response = await api.get(`/employees/${id}/salary-history`);
        return response.data;
    },

    async delete(id: string) {
        const response = await api.delete(`/employees/${id}`);
        return response.data;
    }
};
