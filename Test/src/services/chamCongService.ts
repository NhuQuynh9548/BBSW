import api from './api';

export interface KyChamCong {
    id: string;
    tenKy: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    trangThai: 'nhap' | 'da_tinh' | 'da_khoa';
    congChuan?: number;
    loaiTruChuNhat: boolean;
    loaiTruNgayLe: boolean;
    createdAt: string;
}

export interface MaChamCong {
    id: string;
    ma: string;
    ten: string;
    loai: string;
    giaTriCong: number;
    duocTinhLuong: boolean;
}

export interface TongHopChamCong {
    id: string;
    kyId: string;
    employeeId: string;
    congChuan: number;
    congChinhThuc: number;
    congThuViec: number;
    phepNam: number;
    khongLuong: number;
    nghiLe: number;
    nghiBu: number;
    vang: number;
    tongCongTinhLuong: number;
    employee: {
        id: string;
        employeeId: string;
        fullName: string;
    };
}

export interface ChiTietNgay {
    ngay: string;
    thu: string;
    isChuNhat: boolean;  // true nếu là T7 hoặc CN
    isThu7: boolean;     // true nếu là T7 (Thứ 7)
    isNgayLe: boolean;
    chiTietId: string | null;
    maChamCongId: string | null;
    maChamCong: string | null;
    giaTriCong: number;
    ghiChu: string;
}

export interface ImportResult {
    soDongThanhCong: number;
    soDongLoi: number;
    danhSachLoiChiTiet: { dong: number; maNV: string; lyDo: string }[];
    debug?: { maNVColIdx: number; maNVHeader: string; soNgay: number };
}

const chamCongService = {
    // Kỳ chấm công
    getDanhSachKy: () => api.get<KyChamCong[]>('/cham-cong/ky').then(r => r.data),
    taoKy: (data: Partial<KyChamCong>) => api.post<KyChamCong>('/cham-cong/ky', data).then(r => r.data),
    capNhatKy: (id: string, data: Partial<KyChamCong>) => api.put<KyChamCong>(`/cham-cong/ky/${id}`, data).then(r => r.data),
    tinhCong: (kyId: string) => api.post<{ congChuan: number }>(`/cham-cong/ky/${kyId}/tinh-cong`).then(r => r.data),
    tinhLuong: (kyId: string) => api.post<{ success: boolean }>(`/cham-cong/ky/${kyId}/tinh-luong`).then(r => r.data),
    resetTongHop: (kyId: string) => api.post<{ success: boolean; message: string }>(`/cham-cong/reset-tong-hop/${kyId}`).then(r => r.data),
    khoaKy: (kyId: string) => api.post<KyChamCong>(`/cham-cong/ky/${kyId}/khoa`).then(r => r.data),
    syncNhanVien: (kyId: string) => api.post<{ soNhanVienMoi: number; tongNhanVien: number }>(`/cham-cong/sync-nhan-vien/${kyId}`).then(r => r.data),

    // Mã chấm công
    getMaChamCong: () => api.get<MaChamCong[]>('/cham-cong/ma-cham-cong').then(r => r.data),
    taoMaChamCong: (data: Partial<MaChamCong>) => api.post<MaChamCong>('/cham-cong/ma-cham-cong', data).then(r => r.data),

    // Tổng hợp
    getTongHop: (kyId: string, search?: string) =>
        api.get<TongHopChamCong[]>(`/cham-cong/tong-hop/${kyId}`, { params: search ? { search } : {} }).then(r => r.data),

    // Chi tiết
    getChiTiet: (kyId: string, employeeId: string) =>
        api.get<{ days: ChiTietNgay[]; tongHop: Partial<TongHopChamCong> }>(`/cham-cong/chi-tiet/${kyId}/${employeeId}`).then(r => r.data),

    capNhatChiTiet: (data: {
        kyId: string;
        employeeId: string;
        ngay: string;
        maChamCongId: string | null;
        ghiChu?: string;
    }) => api.put('/cham-cong/chi-tiet', data).then(r => r.data),

    // Import Excel
    importExcel: (kyId: string, file: File, ghiDe: boolean): Promise<ImportResult> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('ghiDe', String(ghiDe));
        return api.post<ImportResult>(`/cham-cong/import/${kyId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data);
    },

    // Download Excel template (pre-filled with employees + styled)
    downloadTemplate: async (kyId: string, fileName: string): Promise<void> => {
        const res = await api.get(`/cham-cong/import-template/${kyId}`, { responseType: 'blob' });
        const url = URL.createObjectURL(new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }));
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    },

    // Export Excel (styled, from backend)
    exportExcel: async (kyId: string, fileName: string): Promise<void> => {
        const res = await api.get(`/cham-cong/export/${kyId}`, { responseType: 'blob' });
        const url = URL.createObjectURL(new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }));
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    },
};

export default chamCongService;
