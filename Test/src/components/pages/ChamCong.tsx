import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    CalendarCheck, Upload, Download, Calculator, Save, Lock,
    Search, ChevronDown, X, AlertCircle, CheckCircle, User, Plus,
    Users, Clock
} from 'lucide-react';
import chamCongService, {
    KyChamCong, MaChamCong, TongHopChamCong, ChiTietNgay, ImportResult
} from '../../services/chamCongService';
import * as XLSX from 'xlsx';

// ===== HELPERS =====
const TRANG_THAI_MAP: Record<string, { label: string; color: string }> = {
    nhap: { label: 'Đang nhập', color: 'bg-yellow-100 text-yellow-700 border border-yellow-300' },
    da_tinh: { label: 'Đã tính', color: 'bg-blue-100 text-blue-700 border border-blue-300' },
    da_khoa: { label: 'Đã khóa', color: 'bg-gray-100 text-gray-600 border border-gray-300' },
};

function formatDate(iso: string) {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

// ===== MODAL TẠO KỲ =====
function TaoKyModal({ onClose, onSave }: { onClose: () => void; onSave: (ky: KyChamCong) => void }) {
    const [form, setForm] = useState({ tenKy: '', ngayBatDau: '', ngayKetThuc: '', loaiTruChuNhat: true, loaiTruNgayLe: true });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!form.tenKy || !form.ngayBatDau || !form.ngayKetThuc) {
            setError('Vui lòng điền đầy đủ thông tin'); return;
        }
        setLoading(true);
        try {
            const ky = await chamCongService.taoKy(form);
            onSave(ky);
        } catch { setError('Lỗi khi tạo kỳ'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-800">Tạo kỳ chấm công mới</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                {error && <div className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</div>}
                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Tên kỳ</label>
                        <input className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="VD: Lương tháng 3/2026"
                            value={form.tenKy} onChange={e => setForm(f => ({ ...f, tenKy: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                            <input type="date" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={form.ngayBatDau} onChange={e => setForm(f => ({ ...f, ngayBatDau: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Ngày kết thúc</label>
                            <input type="date" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={form.ngayKetThuc} onChange={e => setForm(f => ({ ...f, ngayKetThuc: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={form.loaiTruChuNhat}
                                onChange={e => setForm(f => ({ ...f, loaiTruChuNhat: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 rounded" />
                            Loại trừ T7 & Chủ nhật
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={form.loaiTruNgayLe}
                                onChange={e => setForm(f => ({ ...f, loaiTruNgayLe: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 rounded" />
                            Loại trừ ngày lễ
                        </label>
                    </div>
                </div>
                <div className="flex gap-2 mt-5">
                    <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-50">Hủy</button>
                    <button onClick={handleSave} disabled={loading}
                        className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                        {loading ? 'Đang tạo...' : 'Tạo kỳ'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ===== MODAL IMPORT EXCEL =====
function ImportModal({ kyId, onClose, onSuccess }: { kyId: string; onClose: () => void; onSuccess: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [ghiDe, setGhiDe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) setFile(f);
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const res = await chamCongService.importExcel(kyId, file, ghiDe);
            setResult(res);
            if (res.soDongThanhCong > 0) onSuccess();
        } catch (err: any) {
            const serverMsg = err?.response?.data?.error || 'Lỗi server khi import';
            const debugInfo = err?.response?.data?.debug;
            setResult({
                soDongThanhCong: 0, soDongLoi: 0,
                danhSachLoiChiTiet: [{
                    dong: 0, maNV: '', lyDo: serverMsg + (debugInfo ? ` | Header: ${JSON.stringify(debugInfo.headerRow?.slice(0, 5))}` : '')
                }]
            } as any);
        }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-800">Import Excel chấm công</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>

                {!result ? (
                    <>
                        <div
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4
                ${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                        >
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            {file ? (
                                <p className="text-sm font-medium text-blue-600">{file.name}</p>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-500">Kéo thả hoặc click để chọn file</p>
                                    <p className="text-xs text-gray-400 mt-1">Hỗ trợ .xlsx, .xls</p>
                                </>
                            )}
                            <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden"
                                onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
                        </div>

                        <div className="bg-blue-50 rounded-xl p-3 mb-4 text-xs text-blue-700 space-y-1">
                            <p className="font-semibold">📋 Cấu trúc file Excel:</p>
                            <p>• Hàng 1: Header (Mã NV, Họ tên, 1, 2, 3, ... [số ngày trong tháng])</p>
                            <p>• Cột ngày: header là số nguyên (1-31)</p>
                            <p>• Giá trị ô: mã công viết hoa (X, P, KL, NB...)</p>
                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-4">
                            <input type="checkbox" checked={ghiDe} onChange={e => setGhiDe(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                            <span>Ghi đè dữ liệu cũ (xóa toàn bộ chi tiết hiện tại trước khi import)</span>
                        </label>

                        <div className="flex gap-2">
                            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50">Hủy</button>
                            <button onClick={handleImport} disabled={!file || loading}
                                className="flex-1 bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2">
                                <Upload className="w-4 h-4" />
                                {loading ? 'Đang import...' : 'Import'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex gap-3 mb-4">
                            <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                                <p className="text-2xl font-bold text-green-700">{result.soDongThanhCong}</p>
                                <p className="text-xs text-green-600">Dòng thành công</p>
                            </div>
                            <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                                <p className="text-2xl font-bold text-red-700">{result.soDongLoi}</p>
                                <p className="text-xs text-red-600">Dòng lỗi</p>
                            </div>
                        </div>
                        {result.debug && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 text-xs text-blue-700 space-y-1">
                                <p className="font-semibold">📋 Parser đã nhận diện:</p>
                                <p>• Cột Mã NV: <span className="font-mono font-bold">"{result.debug.maNVHeader}"</span></p>
                                <p>• Số cột ngày tìm thấy: <span className="font-bold">{result.debug.soNgay}</span></p>
                                {result.debug.soNgay === 0 && (
                                    <p className="text-red-600 font-semibold">⚠️ Không tìm thấy cột ngày — header phải là số nguyên (26, 27, 28...)</p>
                                )}
                            </div>
                        )}
                        {result.danhSachLoiChiTiet.length > 0 && (
                            <div className="bg-red-50 rounded-xl p-3 max-h-48 overflow-y-auto mb-4">
                                <p className="text-xs font-semibold text-red-700 mb-2">Chi tiết lỗi:</p>
                                {result.danhSachLoiChiTiet.map((e, i) => (
                                    <div key={i} className="text-xs text-red-600 py-1 border-b border-red-100 last:border-0">
                                        <span className="font-medium">Dòng {e.dong} / NV {e.maNV}:</span> {e.lyDo}
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={onClose} className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700">Đóng</button>
                    </>
                )}
            </div>
        </div>
    );
}

// ===== DRAWER CHI TIẾT NHÂN VIÊN =====
function ChiTietNVDrawer({
    kyId, kyLocked, employee, dsMa, onClose, onUpdate
}: {
    kyId: string; kyLocked: boolean;
    employee: TongHopChamCong;
    dsMa: MaChamCong[];
    onClose: () => void;
    onUpdate: (tongHop: Partial<TongHopChamCong>) => void;
}) {
    const [chiTiet, setChiTiet] = useState<ChiTietNgay[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        chamCongService.getChiTiet(kyId, employee.employeeId)
            .then(({ days, tongHop }) => {
                setChiTiet(days);
                // Immediately push fresh TongHop to parent table (fixes stale data after DB delete)
                onUpdate(tongHop);
            })
            .finally(() => setLoading(false));
    }, [kyId, employee.employeeId]);


    const handleChangeMa = useCallback(async (ngay: string, maChamCongId: string | null) => {
        if (kyLocked) return;
        setSaving(ngay);
        try {
            const res = await chamCongService.capNhatChiTiet({ kyId, employeeId: employee.employeeId, ngay, maChamCongId });
            // Update local state
            setChiTiet(prev => prev.map(d => {
                if (d.ngay !== ngay) return d;
                const mcc = dsMa.find(m => m.id === maChamCongId);
                return { ...d, maChamCongId, maChamCong: mcc?.ma || null, giaTriCong: mcc?.giaTriCong ?? 0 };
            }));
            // Update summary in parent
            if (res.tongHop) onUpdate(res.tongHop);
        } catch { }
        finally { setSaving(null); }
    }, [kyId, employee.employeeId, kyLocked, dsMa, onUpdate]);

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/30" onClick={onClose} />
            <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div>
                        <p className="font-bold text-lg">{employee.employee.fullName}</p>
                        <p className="text-blue-200 text-sm">{employee.employee.employeeId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
                </div>

                {/* Tổng hợp mini */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3">
                    {[
                        { label: 'Công chuẩn', value: employee.congChuan },
                        { label: 'Chính thức', value: employee.congChinhThuc },
                        { label: 'Thử việc', value: employee.congThuViec },
                        { label: 'Tổng tính lương', value: employee.tongCongTinhLuong, highlight: true },
                    ].map(({ label, value, highlight }) => (
                        <div key={label} className={`rounded-xl px-3 py-2 text-center min-w-[80px] ${highlight ? 'bg-blue-100 border border-blue-200' : 'bg-white border border-gray-200'}`}>
                            <p className={`text-lg font-bold ${highlight ? 'text-blue-700' : 'text-gray-800'}`}>{value}</p>
                            <p className="text-xs text-gray-500">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Bảng ngày */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-gray-400">Đang tải...</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 z-10 bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">Ngày</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600 w-10">Thứ</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Mã công</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-600 w-20">Giá trị</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chiTiet.map(day => (
                                    <tr
                                        key={day.ngay}
                                        className={`border-b transition-colors
                      ${day.isNgayLe ? 'bg-yellow-50' : ''}
                      ${!day.isNgayLe && day.isChuNhat && !(day as any).isThu7 ? 'bg-gray-50' : ''}
                      ${!day.isNgayLe && (day as any).isThu7 ? 'bg-orange-50' : ''}
                      ${!day.isNgayLe && !day.isChuNhat ? 'hover:bg-blue-50/30' : ''}
                    `}
                                    >
                                        <td className="px-4 py-2 font-medium text-gray-700">
                                            {new Date(day.ngay).getDate()}
                                            {day.isNgayLe && <span className="ml-1 text-xs text-yellow-600">🎌</span>}
                                        </td>
                                        <td className={`px-4 py-2 font-medium ${(day as any).isThu7 ? 'text-orange-500' : day.isChuNhat ? 'text-red-500' : 'text-gray-500'
                                            }`}>
                                            {day.thu}
                                        </td>
                                        <td className="px-4 py-2">
                                            {kyLocked ? (
                                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${day.maChamCong ? 'bg-blue-100 text-blue-700' : 'text-gray-300'}`}>
                                                    {day.maChamCong || '—'}
                                                </span>
                                            ) : (
                                                <select
                                                    value={day.maChamCongId || ''}
                                                    onChange={e => handleChangeMa(day.ngay, e.target.value || null)}
                                                    disabled={saving === day.ngay}
                                                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white disabled:opacity-60"
                                                >
                                                    <option value="">— Không —</option>
                                                    {dsMa.map(m => (
                                                        <option key={m.id} value={m.id}>{m.ma} – {m.ten}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-center font-semibold text-gray-700">
                                            {saving === day.ngay ? (
                                                <span className="text-blue-400 text-xs">...</span>
                                            ) : (
                                                day.giaTriCong > 0 ? day.giaTriCong : <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

// ===== MAIN COMPONENT =====
export function ChamCong() {
    const [danhSachKy, setDanhSachKy] = useState<KyChamCong[]>([]);
    const [selectedKy, setSelectedKy] = useState<KyChamCong | null>(null);
    const [dsMa, setDsMa] = useState<MaChamCong[]>([]);
    const [tongHop, setTongHop] = useState<TongHopChamCong[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortDesc, setSortDesc] = useState(true);
    const [selectedNV, setSelectedNV] = useState<TongHopChamCong | null>(null);
    const [showTaoKy, setShowTaoKy] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    // Load kỳ và mã
    useEffect(() => {
        chamCongService.getDanhSachKy().then(data => {
            setDanhSachKy(data);
            if (data.length > 0) setSelectedKy(data[0]);
        });
        chamCongService.getMaChamCong().then(setDsMa);
    }, []);

    // Load tổng hợp khi đổi kỳ hoặc search. Sync NV mới trước khi nạp.
    useEffect(() => {
        if (!selectedKy) return;
        setLoading(true);
        const load = async () => {
            // Bước 1: Sync NV mới vào kỳ (chỉ khi không có search filter)
            if (!debouncedSearch) {
                await chamCongService.syncNhanVien(selectedKy.id).catch(() => { });
            }
            // Bước 2: Tải danh sách sau khi đã sync
            const data = await chamCongService.getTongHop(selectedKy.id, debouncedSearch || undefined);
            setTongHop(data);
        };
        load().finally(() => setLoading(false));
    }, [selectedKy, debouncedSearch]);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const handleTinhCong = async () => {
        if (!selectedKy) return;
        setActionLoading('tinh-cong');
        try {
            const res = await chamCongService.tinhCong(selectedKy.id);
            setSelectedKy(prev => prev ? { ...prev, congChuan: res.congChuan } : prev);
            setDanhSachKy(prev => prev.map(k => k.id === selectedKy.id ? { ...k, congChuan: res.congChuan } : k));
            showToast('success', `Công chuẩn: ${res.congChuan} ngày`);
        } catch { showToast('error', 'Lỗi khi tính công'); }
        finally { setActionLoading(null); }
    };

    const handleTinhLuong = async () => {
        if (!selectedKy) return;
        setActionLoading('tinh-luong');
        try {
            // resetTongHop = reset về 0 trước + tính lại dựa trên chi tiết hiện có
            await chamCongService.resetTongHop(selectedKy.id);
            const data = await chamCongService.getTongHop(selectedKy.id);
            setTongHop(data);
            // Cập nhật selectedNV nếu drawer đang mở (tránh snapshot cũ)
            if (selectedNV) {
                const fresh = data.find(th => th.employeeId === selectedNV.employeeId);
                if (fresh) setSelectedNV(fresh);
            }
            showToast('success', 'Đã tính lại tổng hợp (kể cả NV đã xóa dữ liệu)');
        } catch { showToast('error', 'Lỗi khi tính lương'); }
        finally { setActionLoading(null); }
    };

    const handleKhoa = async () => {
        if (!selectedKy || !confirm('Khóa kỳ này? Sau khi khóa không thể chỉnh sửa.')) return;
        setActionLoading('khoa');
        try {
            const updated = await chamCongService.khoaKy(selectedKy.id);
            setSelectedKy(updated);
            setDanhSachKy(prev => prev.map(k => k.id === updated.id ? updated : k));
            showToast('success', 'Đã khóa kỳ chấm công');
        } catch { showToast('error', 'Lỗi khi khóa kỳ'); }
        finally { setActionLoading(null); }
    };

    const handleExport = () => {
        if (!selectedKy || tongHop.length === 0) return;
        const data = tongHop.map(th => ({
            'Mã NV': th.employee.employeeId,
            'Họ tên': th.employee.fullName,
            'Công chuẩn': th.congChuan,
            'Chính thức': th.congChinhThuc,
            'Thử việc': th.congThuViec,
            'Phép năm': th.phepNam,
            'Không lương': th.khongLuong,
            'Nghỉ lễ': th.nghiLe,
            'Nghỉ bù': th.nghiBu,
            'Vắng': th.vang,
            'Tổng công tính lương': th.tongCongTinhLuong,
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tổng hợp');
        XLSX.writeFile(wb, `cham-cong-${selectedKy.tenKy}.xlsx`);
    };

    const isLocked = selectedKy?.trangThai === 'da_khoa';

    const filteredSorted = useMemo(() => {
        let list = [...tongHop];
        if (sortDesc) list.sort((a, b) => b.tongCongTinhLuong - a.tongCongTinhLuong);
        else list.sort((a, b) => a.tongCongTinhLuong - b.tongCongTinhLuong);
        return list;
    }, [tongHop, sortDesc]);

    const updateNVTongHop = useCallback((employeeId: string, data: Partial<TongHopChamCong>) => {
        setTongHop(prev => prev.map(th => th.employeeId === employeeId ? { ...th, ...data } : th));
        if (selectedNV?.employeeId === employeeId) setSelectedNV(prev => prev ? { ...prev, ...data } : prev);
    }, [selectedNV]);

    const trangThaiInfo = selectedKy ? (TRANG_THAI_MAP[selectedKy.trangThai] || TRANG_THAI_MAP.nhap) : null;

    // KPI stats
    const totalPresent = tongHop.filter(t => t.tongCongTinhLuong > 0).length;
    const totalAbsent = tongHop.filter(t => t.vang > 0).length;
    const avgCong = tongHop.length > 0 ? (tongHop.reduce((s, t) => s + t.tongCongTinhLuong, 0) / tongHop.length).toFixed(1) : 0;

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* PAGE HEADER */}
            <div className="mb-4">
                <div className="flex items-center gap-3 mb-0.5">
                    <CalendarCheck className="w-6 h-6 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-800 uppercase">Chấm Công</h1>
                    {trangThaiInfo && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${trangThaiInfo.color}`}>
                            {trangThaiInfo.label}
                        </span>
                    )}
                </div>
                <p className="text-gray-500 text-sm ml-9">Quản lý chấm công và tính lương nhân viên theo kỳ</p>
            </div>

            {/* TOOLBAR: Kỳ selector + Action Buttons */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Left: Kỳ selector */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            {danhSachKy.length > 0 ? (
                                <div className="relative">
                                    <select
                                        value={selectedKy?.id || ''}
                                        onChange={e => {
                                            const ky = danhSachKy.find(k => k.id === e.target.value);
                                            setSelectedKy(ky || null);
                                        }}
                                        className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
                                    >
                                        {danhSachKy.map(ky => (
                                            <option key={ky.id} value={ky.id}>{ky.tenKy}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400">Chưa có kỳ nào</span>
                            )}

                            {selectedKy && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="text-gray-400">📅</span>
                                    <span>{formatDate(selectedKy.ngayBatDau)} → {formatDate(selectedKy.ngayKetThuc)}</span>
                                    {selectedKy.congChuan !== null && selectedKy.congChuan !== undefined && (
                                        <span className="ml-1 text-blue-600 font-semibold">({selectedKy.congChuan} công chuẩn)</span>
                                    )}
                                </div>
                            )}


                        </div>
                    </div>

                    {/* Right: Action buttons — match system button style */}
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setShowImport(true)} disabled={!selectedKy || isLocked}
                            className="flex items-center gap-1.5 border border-gray-300 text-gray-700 bg-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm">
                            <Upload className="w-4 h-4" /> Import Excel
                        </button>
                        <button onClick={handleExport} disabled={!selectedKy || tongHop.length === 0}
                            className="flex items-center gap-1.5 border border-gray-300 text-gray-700 bg-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm">
                            <Download className="w-4 h-4" /> Xuất Excel
                        </button>
                        <button onClick={handleTinhCong} disabled={!selectedKy || isLocked || actionLoading === 'tinh-cong'}
                            className="flex items-center gap-1.5 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-sm">
                            <Calculator className="w-4 h-4" />
                            {actionLoading === 'tinh-cong' ? 'Đang tính...' : 'Tính công'}
                        </button>

                        <button disabled={!selectedKy || isLocked}
                            className="flex items-center gap-1.5 bg-green-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-40 transition-colors shadow-sm">
                            <Save className="w-4 h-4" /> Lưu
                        </button>
                        <button onClick={handleKhoa} disabled={!selectedKy || isLocked || actionLoading === 'khoa'}
                            className="flex items-center gap-1.5 bg-red-50 border border-red-300 text-red-700 rounded-lg px-3 py-2 text-sm font-medium hover:bg-red-100 disabled:opacity-40 transition-colors shadow-sm">
                            <Lock className="w-4 h-4" />
                            {actionLoading === 'khoa' ? 'Đang khóa...' : 'Khóa dữ liệu'}
                        </button>
                    </div>
                </div>
            </div>


            {/* BẢNG TỔNG HỢP */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                {/* Table Header Toolbar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <h2 className="font-semibold text-gray-800">Bảng tổng hợp nhân viên</h2>
                        {!loading && (
                            <span className="text-sm text-gray-400 font-normal">({filteredSorted.length} NV)</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg bg-white px-3 focus-within:ring-2 focus-within:ring-blue-400 w-80">
                            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Tìm tên / mã NV..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="flex-1 py-2 text-sm bg-transparent outline-none border-none"
                            />
                        </div>
                        {search && (
                            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => setShowTaoKy(true)}
                            style={{ backgroundColor: '#004aad' }}
                            className="flex items-center gap-1.5 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors shadow-sm hover:opacity-90"
                        >
                            <Plus className="w-4 h-4" /> Tạo kỳ mới
                        </button>
                    </div>

                </div>

                {/* Table */}
                {!selectedKy ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <CalendarCheck className="w-12 h-12 text-gray-200 mb-3" />
                        <p className="text-gray-400 font-medium">Chưa có kỳ chấm công nào</p>
                        <button onClick={() => setShowTaoKy(true)} className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                            + Tạo kỳ mới
                        </button>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                        <Clock className="w-5 h-5 animate-spin" />
                        <span>Đang tải dữ liệu...</span>
                    </div>
                ) : filteredSorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <User className="w-12 h-12 text-gray-200 mb-3" />
                        <p className="text-gray-400">Không có nhân viên nào</p>
                    </div>
                ) : (
                    <div className="overflow-auto max-h-[calc(100vh-440px)]">
                        <table className="w-full text-sm min-w-[900px]">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    {[
                                        ['Mã NV', 'w-24 text-left'],
                                        ['Họ tên', 'min-w-[160px] text-left'],
                                        ['C. chuẩn', 'w-24 text-center'],
                                        ['Chính thức', 'w-24 text-center'],
                                        ['Thử việc', 'w-24 text-center'],
                                        ['Phép năm', 'w-24 text-center'],
                                        ['K. lương', 'w-24 text-center'],
                                        ['Nghỉ lễ', 'w-20 text-center'],
                                        ['Nghỉ bù', 'w-20 text-center'],
                                        ['Vắng', 'w-20 text-center'],
                                    ].map(([label, cls]) => (
                                        <th key={label} className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${cls}`}>
                                            {label}
                                        </th>
                                    ))}
                                    <th
                                        className="px-4 py-3 text-center text-xs font-medium text-blue-600 uppercase tracking-wider cursor-pointer hover:bg-blue-50 select-none w-28 transition-colors"
                                        onClick={() => setSortDesc(v => !v)}
                                    >
                                        Tổng TL {sortDesc ? '↓' : '↑'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredSorted.map(th => (
                                    <tr
                                        key={th.id}
                                        onClick={() => setSelectedNV(th)}
                                        className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-4 py-2.5 font-mono text-xs text-gray-500 font-medium">{th.employee.employeeId}</td>
                                        <td className="px-4 py-2.5 font-medium text-gray-800">{th.employee.fullName}</td>
                                        <td className="px-4 py-2.5 text-center text-gray-600">{th.congChuan}</td>
                                        <td className="px-4 py-2.5 text-center font-medium text-green-700">{th.congChinhThuc || <span className="text-gray-300">—</span>}</td>
                                        <td className="px-4 py-2.5 text-center text-yellow-600">{th.congThuViec || <span className="text-gray-300">—</span>}</td>
                                        <td className="px-4 py-2.5 text-center text-blue-600">{th.phepNam || <span className="text-gray-300">—</span>}</td>
                                        <td className="px-4 py-2.5 text-center text-orange-600">{th.khongLuong || <span className="text-gray-300">—</span>}</td>
                                        <td className="px-4 py-2.5 text-center text-purple-600">{th.nghiLe || <span className="text-gray-300">—</span>}</td>
                                        <td className="px-4 py-2.5 text-center text-teal-600">{th.nghiBu || <span className="text-gray-300">—</span>}</td>
                                        <td className="px-4 py-2.5 text-center text-red-500">{th.vang || <span className="text-gray-300">—</span>}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${th.tongCongTinhLuong > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {th.tongCongTinhLuong}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {showTaoKy && (
                <TaoKyModal
                    onClose={() => setShowTaoKy(false)}
                    onSave={ky => {
                        setDanhSachKy(prev => [ky, ...prev]);
                        setSelectedKy(ky);
                        setShowTaoKy(false);
                        showToast('success', 'Đã tạo kỳ chấm công mới');
                    }}
                />
            )}

            {showImport && selectedKy && (
                <ImportModal
                    kyId={selectedKy.id}
                    onClose={() => setShowImport(false)}
                    onSuccess={async () => {
                        const fresh = await chamCongService.getTongHop(selectedKy.id);
                        setTongHop(fresh);
                        // Sync drawer summary if an employee is open
                        if (selectedNV) {
                            const updated = fresh.find(th => th.employeeId === selectedNV.employeeId);
                            if (updated) setSelectedNV(updated);
                        }
                    }}
                />
            )}

            {selectedNV && selectedKy && (
                <ChiTietNVDrawer
                    kyId={selectedKy.id}
                    kyLocked={isLocked}
                    employee={selectedNV}
                    dsMa={dsMa}
                    onClose={() => setSelectedNV(null)}
                    onUpdate={data => updateNVTongHop(selectedNV.employeeId, data)}
                />
            )}
        </div>
    );
}

