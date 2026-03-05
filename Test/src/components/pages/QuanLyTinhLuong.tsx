import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, Download, ChevronLeft, ChevronRight, X, User, Building2, Calendar,
    Users, ShieldCheck, Eye, Banknote, FileText, Edit2, Printer, Save, Calculator, Info, RefreshCw
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { employeeService } from '../../services/employeeService';
import { salaryConfigService, SalaryConfig, calculateSalaryRates } from '../../services/salaryConfigService';
import { businessUnitService } from '../../services/businessUnitService';
import chamCongService, { KyChamCong, TongHopChamCong } from '../../services/chamCongService';
import { salaryRecordService } from '../../services/salaryRecordService';
import * as XLSX from 'xlsx';

// ─────────────────── 2026 CONSTANTS ───────────────────
// Bảo hiểm (NLĐ đóng)
const TRAN_BHXH = 20 * 4_960_000;     // 99.200.000đ – trần BHXH, BHTN
const TRAN_BHYT = 20 * 2_340_000;     // 46.800.000đ – trần BHYT
const TY_LE_BHXH = 0.08;               // 8%
const TY_LE_BHYT = 0.015;              // 1.5%
const TY_LE_BHTN = 0.01;               // 1%

// Giảm trừ gia cảnh 2026
const GIAM_TRU_BAN_THAN = 15_500_000;   // 15.5 triệu/tháng
const GIAM_TRU_NPT = 6_200_000;    // 6.2 triệu/người phụ thuộc/tháng

/**
 * Biểu thuế TNCN lũy tiến 5 bậc – áp dụng từ 2026
 * Bậc 1: Đến 10 triệu     →  5%   (tối đa 500.000đ)
 * Bậc 2: 10 – 30 triệu    → 10%   (tối đa 2.000.000đ)
 * Bậc 3: 30 – 60 triệu    → 20%   (tối đa 6.000.000đ)
 * Bậc 4: 60 – 100 triệu   → 30%   (tối đa 12.000.000đ)
 * Bậc 5: Trên 100 triệu   → 35%
 */
const THUE_BRACKETS = [
    { tu: 0, den: 10_000_000, rate: 0.05, bac: 1, maxThue: 500_000 },
    { tu: 10_000_000, den: 30_000_000, rate: 0.10, bac: 2, maxThue: 2_000_000 },
    { tu: 30_000_000, den: 60_000_000, rate: 0.20, bac: 3, maxThue: 6_000_000 },
    { tu: 60_000_000, den: 100_000_000, rate: 0.30, bac: 4, maxThue: 12_000_000 },
    { tu: 100_000_000, den: Infinity, rate: 0.35, bac: 5, maxThue: Infinity },
];

function tinhBH(luong: number) {
    const bhxh = Math.min(luong, TRAN_BHXH) * TY_LE_BHXH;
    const bhyt = Math.min(luong, TRAN_BHYT) * TY_LE_BHYT;
    const bhtn = Math.min(luong, TRAN_BHXH) * TY_LE_BHTN;
    return { bhxh, bhyt, bhtn, total: bhxh + bhyt + bhtn };
}

function tinhThue(tntt: number): number {
    if (tntt <= 0) return 0;
    let thue = 0;
    for (const b of THUE_BRACKETS) {
        if (tntt <= b.tu) break;
        const phanThuNhap = Math.min(tntt, b.den) - b.tu;
        thue += phanThuNhap * b.rate;
    }
    return Math.max(0, thue);
}

// Loại hợp đồng được toàn bộ quyền bảo hiểm và giảm trừ gia cảnh
// Giá trị thực tế trong DB: 'chinh-thuc' (xem QuanLyNhanSu.tsx)
const CHINH_THUC_TYPES = ['chinh-thuc', 'chinh_thuc', 'permanent', 'chinh thuc'];
function isChinhThuc(contractType?: string): boolean {
    if (!contractType) return false;
    const ct = contractType.toLowerCase().trim();
    return CHINH_THUC_TYPES.some(t => ct === t || ct.includes(t));
}

function tinhLuong(p: { luongCoBan: number; thuong: number; phuCap: number; congThucTe: number; congChuan: number; soNPT: number; contractType?: string }) {
    const ty = p.congChuan > 0 ? Math.min(p.congThucTe / p.congChuan, 1) : 0;
    const luongTheo = p.luongCoBan * ty;
    const tong = luongTheo + p.phuCap + p.thuong;

    if (isChinhThuc(p.contractType)) {
        // ==== NHÂN VIÊN CHÍNH THỨC: BH + GTGC + thuế lũy tiến ====
        const bh = tinhBH(p.luongCoBan);
        const tntt = Math.max(0, tong - bh.total - GIAM_TRU_BAN_THAN - p.soNPT * GIAM_TRU_NPT);
        const thue = tinhThue(tntt);
        return { luongTheo, tong, bh, tntt, thue, thucLanh: Math.max(0, tong - bh.total - thue), loaiThuNhap: 'chinh_thuc' as const };
    } else {
        // ==== THỪN VIỆC / THỰC TẬP / CỘNG TÁC: thuế khấu trừ tại nguồn 10% ====
        const bh = { bhxh: 0, bhyt: 0, bhtn: 0, total: 0 };
        const tntt = tong; // không giảm trừ gì
        const thue = tong * 0.10;
        return { luongTheo, tong, bh, tntt, thue, thucLanh: Math.max(0, tong - thue), loaiThuNhap: 'khau_tru' as const };
    }
}

const fmt = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(v));
const inputCls = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent focus:bg-white transition-all";
const labelCls = "block text-sm font-semibold text-gray-700 mb-2 uppercase";

// ─────────────────── DETAIL MODAL ───────────────────
function ChiTietModal({ employee, tongHop, ky, congChuan, overrides, onClose }: {
    employee: any; tongHop: TongHopChamCong | null; ky: KyChamCong | null; congChuan: number;
    overrides?: { thuong?: number; phuCap?: number; soNPT?: number; luongCoBan?: number; congThucTeEdit?: number };
    onClose: () => void;
}) {
    const [thuong, setThuong] = useState(overrides?.thuong ?? 0);
    const [phuCap, setPhuCap] = useState(overrides?.phuCap ?? 0);
    const [soNPT, setSoNPT] = useState(overrides?.soNPT ?? 0);
    // Respect edited lương & công if user previously saved them
    const luong = overrides?.luongCoBan ?? employee.actualSalary ?? 0;
    const congTT = overrides?.congThucTeEdit ?? tongHop?.congChinhThuc ?? 0;
    const r = useMemo(() => tinhLuong({ luongCoBan: luong, thuong, phuCap, congThucTe: congTT, congChuan, soNPT, contractType: employee.contractType }),
        [luong, thuong, phuCap, congTT, congChuan, soNPT, employee.contractType]);

    return (
        <div className="modal-overlay-container">
            <div className="modal-content-container max-w-2xl">
                <div className="border-b border-gray-200 px-6 py-5 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Chi Tiết Tính Lương</h2>
                        <p className="text-sm text-gray-500 mt-1">{ky?.tenKy ?? '—'} • {employee.fullName}</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
                    {/* Thông tin nhân viên */}
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelCls}>Họ và tên</label><p className="text-sm font-semibold text-gray-800">{employee.fullName}</p></div>
                        <div><label className={labelCls}>Mã nhân viên</label><p className="text-sm font-semibold text-gray-800">{employee.employeeId}</p></div>
                        <div><label className={labelCls}>Đơn vị</label><p className="text-sm font-semibold text-gray-800">{employee.businessUnit}</p></div>
                        <div><label className={labelCls}>Công chuẩn / Thực tế</label><p className="text-sm font-semibold text-gray-800">{congTT} / {congChuan} ngày</p></div>
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Phần 1 – Thông tin lương */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Phần 1 — Thông Tin Lương</h3>
                        <div className="space-y-4">
                            <div><label className={labelCls}>Lương cơ bản</label><p className="text-sm font-bold text-[#004aad]">{fmt(luong)}</p></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Phụ cấp</label>
                                    <input type="number" min={0} value={phuCap} onChange={e => setPhuCap(Number(e.target.value))} className={inputCls} placeholder="0" />
                                </div>
                                <div>
                                    <label className={labelCls}>Thưởng</label>
                                    <input type="number" min={0} value={thuong} onChange={e => setThuong(Number(e.target.value))} className={inputCls} placeholder="0" />
                                </div>
                            </div>
                            {isChinhThuc(employee.contractType) && (
                                <div>
                                    <label className={labelCls}>Số người phụ thuộc <span className="text-gray-400 font-normal normal-case">({fmt(GIAM_TRU_NPT)}/người/tháng)</span></label>
                                    <input type="number" min={0} max={10} value={soNPT} onChange={e => setSoNPT(Math.max(0, parseInt(e.target.value) || 0))} className={inputCls} />
                                </div>
                            )}
                            {isChinhThuc(employee.contractType) ? (
                                <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                                    <p className="text-sm font-semibold text-orange-700">Khấu trừ Bảo hiểm (NLĐ): <span className="font-bold">-{fmt(r.bh.total)}</span></p>
                                    <p className="text-xs text-orange-500 mt-1">BHXH 8%: -{fmt(r.bh.bhxh)} • BHYT 1.5%: -{fmt(r.bh.bhyt)} • BHTN 1%: -{fmt(r.bh.bhtn)}</p>
                                </div>
                            ) : (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm font-semibold text-yellow-700">⚠️ Không có Bảo hiểm — Loại hợp đồng: <span className="font-bold">{employee.contractType ?? 'Không xác định'}</span></p>
                                    <p className="text-xs text-yellow-600 mt-1">Thuế TNCN 10% khấu trừ tại nguồn (không có giảm trừ gia cảnh)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Phần 2 – Kết quả */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Phần 2 — Kết Quả Tính Lương</h3>
                        <div className="space-y-2">
                            {[
                                { label: 'Tổng thu nhập (A)', val: r.tong, cls: 'font-bold text-gray-800', show: true },
                                { label: 'Bảo hiểm NLĐ (BHXH+BHYT+BHTN)', val: -r.bh.total, cls: 'text-red-600 font-semibold', show: isChinhThuc(employee.contractType) },
                                { label: `Giảm trừ gia cảnh (bản thân + ${soNPT} NPT)`, val: -(GIAM_TRU_BAN_THAN + soNPT * GIAM_TRU_NPT), cls: 'text-gray-500 font-semibold', show: isChinhThuc(employee.contractType) },
                                { label: 'Thu nhập tính thuế (TNTT)', val: r.tntt, cls: 'text-gray-700 font-semibold', show: true },
                                { label: isChinhThuc(employee.contractType) ? 'Thuế TNCN (lũy tiến 5 bậc 2026)' : 'Thuế TNCN 10% (khấu trừ tại nguồn)', val: -r.thue, cls: 'text-red-600 font-semibold', show: true },
                            ].filter(row => row.show).map((row, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-600">{row.label}</span>
                                    <span className={`text-sm ${row.cls}`}>{row.val < 0 ? '-' : ''}{fmt(Math.abs(row.val))}</span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between py-3 bg-green-50 px-4 rounded-lg mt-2">
                                <span className="font-bold text-green-800">THỰC LÃNH</span>
                                <span className="text-xl font-bold text-green-700">{fmt(r.thucLanh)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        {isChinhThuc(employee.contractType) ? (
                            <p className="text-xs text-blue-600">Áp dụng mức 2026: GT bản thân {fmt(GIAM_TRU_BAN_THAN)}/tháng, GT NPT {fmt(GIAM_TRU_NPT)}/người/tháng. Bảo hiểm NLĐ: BHXH 8%, BHYT 1.5%, BHTN 1%.</p>
                        ) : (
                            <p className="text-xs text-yellow-700">Loại hợp đồng <strong>{employee.contractType}</strong>: không có bảo hiểm, không có giảm trừ gia cảnh. Thuế TNCN 10% khấu trừ tại nguồn theo Điều 25 Thông tư 111/2013/TT-BTC.</p>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-4 flex justify-center gap-3">
                    <button onClick={onClose} className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-w-[140px]">Đóng</button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────── EDIT MODAL ───────────────────
function ChinhSuaModal({ employee, congChuan, congThucTe, ky, initial, onSave, onClose }: {
    employee: any; congChuan: number; congThucTe: number; ky: KyChamCong | null;
    initial: { thuong: number; phuCap: number; soNPT: number };
    onSave: (v: { thuong: number; phuCap: number; soNPT: number; luongCoBan: number; congThucTeEdit: number }) => void;
    onClose: () => void;
}) {
    const [luongCoBan, setLuongCoBan] = useState(employee.actualSalary || 0);
    const [congThucTeEdit, setCongThucTeEdit] = useState(congThucTe);
    const [thuong, setThuong] = useState(initial.thuong);
    const [phuCap, setPhuCap] = useState(initial.phuCap);
    const [soNPT, setSoNPT] = useState(initial.soNPT);
    const r = useMemo(() => tinhLuong({ luongCoBan, thuong, phuCap, congThucTe: congThucTeEdit, congChuan, soNPT, contractType: employee.contractType }),
        [luongCoBan, thuong, phuCap, congThucTeEdit, congChuan, soNPT, employee.contractType]);

    return (
        <div className="modal-overlay-container">
            <div className="modal-content-container max-w-2xl">
                <div className="border-b border-gray-200 px-6 py-5 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Chỉnh Sửa Tính Lương</h2>
                        <p className="text-sm text-gray-500 mt-1">{ky?.tenKy ?? '—'} • {employee.fullName}</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
                    {/* Thông tin nhân viên – read only */}
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelCls}>Họ và tên</label><p className="text-sm font-semibold text-gray-800">{employee.fullName}</p></div>
                        <div><label className={labelCls}>Mã nhân viên</label><p className="text-sm font-semibold text-gray-800">{employee.employeeId}</p></div>
                        <div><label className={labelCls}>Đơn vị</label><p className="text-sm font-semibold text-gray-800">{employee.businessUnit}</p></div>
                        <div><label className={labelCls}>Công chuẩn kỳ này</label><p className="text-sm font-semibold text-gray-800">{congChuan} ngày</p></div>
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Phần 1 – Chỉnh sửa thông tin lương */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Phần 1 — Thông Tin Lương</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Lương cơ bản (VND)</label>
                                    <input type="number" min={0} value={luongCoBan}
                                        onChange={e => setLuongCoBan(Number(e.target.value))}
                                        className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Công chính thức (ngày)</label>
                                    <input type="number" min={0} max={congChuan} value={congThucTeEdit}
                                        onChange={e => setCongThucTeEdit(Math.min(congChuan, Math.max(0, Number(e.target.value))))}
                                        className={inputCls} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Phụ cấp (VND)</label>
                                    <input type="number" min={0} value={phuCap}
                                        onChange={e => setPhuCap(Number(e.target.value))}
                                        className={inputCls} placeholder="0" />
                                </div>
                                <div>
                                    <label className={labelCls}>Thưởng (VND)</label>
                                    <input type="number" min={0} value={thuong}
                                        onChange={e => setThuong(Number(e.target.value))}
                                        className={inputCls} placeholder="0" />
                                </div>
                            </div>
                            {isChinhThuc(employee.contractType) && (
                                <div>
                                    <label className={labelCls}>Số người phụ thuộc <span className="text-gray-400 font-normal normal-case">({fmt(GIAM_TRU_NPT)}/người/tháng)</span></label>
                                    <input type="number" min={0} max={10} value={soNPT}
                                        onChange={e => setSoNPT(Math.max(0, parseInt(e.target.value) || 0))}
                                        className={inputCls} />
                                </div>
                            )}
                            {isChinhThuc(employee.contractType) ? (
                                <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                                    <p className="text-sm font-semibold text-orange-700">Khấu trừ Bảo hiểm (NLĐ): <span className="font-bold">-{fmt(r.bh.total)}</span></p>
                                    <p className="text-xs text-orange-500 mt-1">BHXH 8%: -{fmt(r.bh.bhxh)} • BHYT 1.5%: -{fmt(r.bh.bhyt)} • BHTN 1%: -{fmt(r.bh.bhtn)}</p>
                                </div>
                            ) : (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm font-semibold text-yellow-700">⚠️ Không có Bảo hiểm — Loại hợp đồng: <span className="font-bold">{employee.contractType ?? 'Không xác định'}</span></p>
                                    <p className="text-xs text-yellow-600 mt-1">Thuế TNCN 10% khấu trừ tại nguồn (không có giảm trừ gia cảnh)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Phần 2 – Kết quả tính lương (live preview) */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Phần 2 — Kết Quả Tính Lương</h3>
                        <div className="space-y-2">
                            {[
                                { label: 'Lương theo công thực tế', val: r.luongTheo, cls: 'font-semibold text-gray-700', sub: `${congThucTeEdit}/${congChuan} ngày × ${fmt(luongCoBan)}`, show: true },
                                { label: 'Phụ cấp', val: phuCap, cls: 'font-semibold text-gray-700', show: true },
                                { label: 'Thưởng', val: thuong, cls: 'font-semibold text-green-700', show: true },
                                { label: 'Tổng thu nhập (A)', val: r.tong, cls: 'font-bold text-gray-800', show: true },
                                { label: 'Bảo hiểm NLĐ (BHXH+BHYT+BHTN)', val: -r.bh.total, cls: 'text-red-600 font-semibold', show: isChinhThuc(employee.contractType) },
                                { label: `Giảm trừ gia cảnh (bản thân + ${soNPT} NPT)`, val: -(GIAM_TRU_BAN_THAN + soNPT * GIAM_TRU_NPT), cls: 'text-gray-500 font-semibold', show: isChinhThuc(employee.contractType) },
                                { label: 'Thu nhập tính thuế (TNTT)', val: r.tntt, cls: 'text-gray-700 font-semibold', show: true },
                                { label: isChinhThuc(employee.contractType) ? 'Thuế TNCN (lũy tiến 5 bậc 2026)' : 'Thuế TNCN 10% (khấu trừ tại nguồn)', val: -r.thue, cls: 'text-red-600 font-semibold', show: true },
                            ].filter(row => row.show).map((row, i) => (
                                <div key={i} className="flex items-start justify-between py-2 border-b border-gray-50">
                                    <div>
                                        <span className="text-sm text-gray-600">{row.label}</span>
                                        {row.sub && <p className="text-xs text-gray-400 mt-0.5">{row.sub}</p>}
                                    </div>
                                    <span className={`text-sm ${row.cls} ml-4 shrink-0`}>{row.val < 0 ? '-' : ''}{fmt(Math.abs(row.val))}</span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between py-3 bg-green-50 px-4 rounded-lg mt-2">
                                <span className="font-bold text-green-800">THỰC LÃNH</span>
                                <span className="text-xl font-bold text-green-700">{fmt(r.thucLanh)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        {isChinhThuc(employee.contractType) ? (
                            <p className="text-xs text-blue-600">Áp dụng mức 2026: GT bản thân {fmt(GIAM_TRU_BAN_THAN)}/tháng, GT NPT {fmt(GIAM_TRU_NPT)}/người/tháng. Bảo hiểm NLĐ: BHXH 8%, BHYT 1.5%, BHTN 1%.</p>
                        ) : (
                            <p className="text-xs text-yellow-700">Loại hợp đồng <strong>{employee.contractType}</strong>: không có bảo hiểm, không có giảm trừ gia cảnh. Thuế TNCN 10% khấu trừ tại nguồn.</p>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-4 flex justify-center gap-3">
                    <button onClick={onClose} className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-w-[140px]">Hủy bỏ</button>
                    <button onClick={() => onSave({ thuong, phuCap, soNPT, luongCoBan, congThucTeEdit })}
                        className="px-8 py-2.5 bg-[#004aad] hover:bg-[#1557A0] text-white rounded-lg transition-colors font-medium min-w-[140px] flex items-center gap-2 justify-center">
                        <Save className="w-4 h-4" /> Xác nhận lưu
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────── MAIN ───────────────────

export function QuanLyTinhLuong() {
    const { selectedBU } = useApp();
    const [employees, setEmployees] = useState<any[]>([]);
    const [businessUnits, setBusinessUnits] = useState<any[]>([]);
    const [activeConfig, setActiveConfig] = useState<SalaryConfig | null>(null);
    const [danhSachKy, setDanhSachKy] = useState<KyChamCong[]>([]);
    const [selectedKy, setSelectedKy] = useState<KyChamCong | null>(null);
    const [tongHopMap, setTongHopMap] = useState<Record<string, TongHopChamCong>>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshDone, setRefreshDone] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBU, setFilterBU] = useState<string>('all');
    const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
    const [editTarget, setEditTarget] = useState<any | null>(null);
    const [rowOverrides, setRowOverrides] = useState<Record<string, { thuong: number; phuCap: number; soNPT: number; luongCoBan?: number; congThucTeEdit?: number }>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 15;

    // Load salary records từ DB khi đổi kỳ lương
    // congThucTeEdit KHÔNG được load từ DB — luôn dùng dữ liệu chấm công thực tế (tongHopMap)
    useEffect(() => {
        if (!selectedKy) { setRowOverrides({}); return; }
        salaryRecordService.getByKy(selectedKy.id).then(records => {
            const map: Record<string, any> = {};
            records.forEach(r => {
                const maNV = r.employee?.employeeId;
                if (!maNV) return;
                map[maNV] = {
                    thuong: r.thuong,
                    phuCap: r.phuCap,
                    soNPT: r.soNPT,
                    luongCoBan: r.luongCoBan ?? undefined,
                    // congThucTeEdit: không restore — chấm công thực tế luôn là nguồn chính
                };
            });
            setRowOverrides(map);
        }).catch(() => setRowOverrides({}));
    }, [selectedKy]);



    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [bus, configs, kyList] = await Promise.all([
                    businessUnitService.getAll(),
                    salaryConfigService.getAll(),
                    chamCongService.getDanhSachKy(),
                ]);
                setBusinessUnits(bus);
                setActiveConfig(configs.find((c: any) => c.status === 'ACTIVE') || configs[0] || null);
                setDanhSachKy(kyList);
                if (kyList.length > 0) setSelectedKy(kyList[0]);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    useEffect(() => { if (selectedBU !== 'all') setFilterBU(selectedBU); }, [selectedBU]);

    const fetchEmployees = useCallback(async () => {
        try {
            const filters: any = {};
            if (filterBU !== 'all') filters.buId = filterBU;
            const data = await employeeService.getAll(filters);
            setEmployees(data.filter((e: any) => e.workStatus !== 'resigned'));
        } catch (e) { console.error(e); }
    }, [filterBU]);

    useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

    // Fetch tổng hợp chấm công — dùng cho auto-polling nền (không cần spinner)
    const fetchTongHop = useCallback(async () => {
        if (!selectedKy) return;
        try {
            const data: TongHopChamCong[] = await chamCongService.getTongHop(selectedKy.id);
            const map: Record<string, TongHopChamCong> = {};
            data.forEach(th => { map[th.employee.employeeId] = th; });
            setTongHopMap(map);
        } catch (e) { console.error(e); }
    }, [selectedKy]);

    // Làm mới toàn bộ: tongHop + nhân viên + overrides DB — dùng cho nút bấm thủ công
    const handleRefresh = useCallback(async () => {
        if (!selectedKy) return;
        setRefreshing(true);
        try {
            // Tải song song 3 nguồn dữ liệu
            const [tongHopData, employeeData, recordData] = await Promise.all([
                chamCongService.getTongHop(selectedKy.id),
                employeeService.getAll(filterBU !== 'all' ? { buId: filterBU } : {}),
                salaryRecordService.getByKy(selectedKy.id),
            ]);

            // Cập nhật tongHopMap
            const map: Record<string, TongHopChamCong> = {};
            tongHopData.forEach((th: TongHopChamCong) => { map[th.employee.employeeId] = th; });
            setTongHopMap(map);

            // Cập nhật danh sách nhân viên (lương cơ bản mới nhất)
            setEmployees(employeeData.filter((e: any) => e.workStatus !== 'resigned'));

            // Cập nhật overrides từ DB
            // Lưu ý: KHÔNG restore congThucTeEdit — luôn dùng dữ liệu chấm công thực từ tongHopMap
            const ovMap: Record<string, any> = {};
            recordData.forEach((r: any) => {
                const maNV = r.employee?.employeeId;
                if (!maNV) return;
                ovMap[maNV] = {
                    thuong: r.thuong,
                    phuCap: r.phuCap,
                    soNPT: r.soNPT,
                    luongCoBan: r.luongCoBan ?? undefined,
                    // congThucTeEdit: KHÔNG set — để dùng live attendance từ chấm công
                };
            });
            setRowOverrides(ovMap);

            setRefreshDone(true);
            setTimeout(() => setRefreshDone(false), 1500);
        } catch (e) {
            console.error('Refresh error:', e);
        } finally {
            setRefreshing(false);
        }
    }, [selectedKy, filterBU]);

    // Load ngay khi đổi kỳ
    useEffect(() => { fetchTongHop(); }, [fetchTongHop]);

    // Auto-refresh mỗi 30 giây để bắt kịp thay đổi từ bảng chấm công
    useEffect(() => {
        if (!selectedKy) return;
        const interval = setInterval(fetchTongHop, 30_000);
        return () => clearInterval(interval);
    }, [fetchTongHop, selectedKy]);

    const configCongChuan = activeConfig ? calculateSalaryRates(0, activeConfig).standardWorkingDays : 0;
    // Prefer congChuan from attendance data (reflects actual holidays in that period)
    const congChuanKy = useMemo(() => {
        const vals = Object.values(tongHopMap).map(th => th.congChuan).filter(v => v > 0);
        if (vals.length === 0) return configCongChuan;
        return vals[0]; // all records in a period share the same congChuan
    }, [tongHopMap, configCongChuan]);
    const congChuan = congChuanKy;

    const payrollRows = useMemo(() => employees
        .filter(e => e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((emp, idx) => {
            const th = tongHopMap[emp.employeeId] ?? null;
            // Dùng tổng công tính lương thay vì chỉ công chính thức,
            // để cộng gộp các ngày phép, lễ, bù, và công thử việc.
            const congThucTeRaw = th?.tongCongTinhLuong ?? 0;
            const empCongChuan = th?.congChuan ?? congChuan;
            const ov = rowOverrides[emp.employeeId] ?? { thuong: 0, phuCap: 0, soNPT: 0 };
            // Apply all overrides explicitly — saved values take full priority
            const luongCoBanCalc = ov.luongCoBan ?? emp.actualSalary ?? 0;
            const congThucTe = ov.congThucTeEdit ?? congThucTeRaw;
            const r = tinhLuong({
                luongCoBan: luongCoBanCalc,
                thuong: ov.thuong ?? 0,
                phuCap: ov.phuCap ?? 0,
                soNPT: ov.soNPT ?? 0,
                congThucTe,
                congChuan: empCongChuan,
                contractType: emp.contractType,
            });
            return { ...emp, stt: idx + 1, tongHop: th, congThucTe, empCongChuan, luongCoBanCalc, r, ov };
        }), [employees, tongHopMap, searchTerm, congChuan, rowOverrides]);

    const totalPages = Math.max(1, Math.ceil(payrollRows.length / PAGE_SIZE));
    const pagedRows = payrollRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const printPayslip = (row: any) => {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Phiếu lương – ${row.fullName}</title>
<style>body{font-family:Arial,sans-serif;padding:32px;max-width:680px;margin:0 auto}h1{text-align:center;color:#004aad;font-size:22px}.info{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin:16px 0}.info label{font-size:10px;text-transform:uppercase;color:#888;font-weight:bold;display:block}.info span{font-size:13px;font-weight:bold}table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#004aad;color:#fff;padding:8px 12px;text-align:left;font-size:11px}td{padding:8px 12px;font-size:12px;border-bottom:1px solid #eee}.r{text-align:right;font-weight:bold}.red{color:#dc2626}.total td{background:#f0f7ff;font-weight:bold;border-top:2px solid #004aad;color:#004aad}.green{color:#16a34a}footer{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:40px;text-align:center;font-size:11px;color:#666}footer div{border-top:1px dashed #ccc;padding-top:8px}</style></head><body>
<h1>PHIẾU LƯƠNG</h1><p style="text-align:center;color:#666;font-size:12px">${selectedKy?.tenKy ?? ''} • In ngày ${new Date().toLocaleDateString('vi-VN')}</p>
<div class="info"><div><label>Họ và tên</label><span>${row.fullName}</span></div><div><label>Mã NV</label><span>${row.employeeId}</span></div><div><label>Đơn vị</label><span>${row.businessUnit || '—'}</span></div><div><label>Công TT/Chuẩn</label><span>${row.congThucTe}/${congChuan} ngày</span></div></div>
<table><thead><tr><th>Khoản mục</th><th class="r">Số tiền (VND)</th></tr></thead><tbody>
<tr><td>Lương cơ bản</td><td class="r">${fmt(row.actualSalary || 0)}</td></tr>
<tr><td>Lương theo công thực tế</td><td class="r">${fmt(row.r.luongTheo)}</td></tr>
<tr><td>Phụ cấp</td><td class="r">${fmt(row.ov?.phuCap || 0)}</td></tr>
<tr><td>Thưởng</td><td class="r">${fmt(row.ov?.thuong || 0)}</td></tr>
<tr><td><strong>Tổng thu nhập (A)</strong></td><td class="r"><strong>${fmt(row.r.tong)}</strong></td></tr>
<tr><td class="red">Bảo hiểm NLĐ (BHXH+BHYT+BHTN)</td><td class="r red">-${fmt(row.r.bh.total)}</td></tr>
<tr><td class="red">Thuế TNCN (5 bậc 2026)</td><td class="r red">-${fmt(row.r.thue)}</td></tr>
</tbody><tfoot><tr class="total"><td>THỰC LÃNH</td><td class="r green">${fmt(row.r.thucLanh)}</td></tr></tfoot></table>
<footer><div>Người lập phiếu<br/><br/>.............................</div><div>Nhân viên xác nhận<br/><br/>.............................</div></footer>
<script>window.onload=()=>window.print();<\/script></body></html>`);
        w.document.close();
    };

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(payrollRows.map(r => ({
            'STT': r.stt, 'Mã NV': r.employeeId, 'Họ và Tên': r.fullName, 'Đơn vị': r.businessUnit,
            'Kỳ lương': selectedKy?.tenKy ?? '', 'Lương cơ bản': r.actualSalary,
            'Công chuẩn': congChuan, 'Công thực tế': r.congThucTe,
            'Phụ cấp': r.ov.phuCap, 'Thưởng': r.ov.thuong,
            'Tổng thu nhập': r.r.tong, 'Bảo hiểm NLĐ': r.r.bh.total,
            'Thuế TNCN': r.r.thue, 'Thực lãnh': r.r.thucLanh,
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tinh Luong');
        XLSX.writeFile(wb, `tinh-luong-${selectedKy?.tenKy ?? 'export'}.xlsx`);
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản Lý Tính Lương</h1>
                <p className="text-gray-600">Tính lương nhân viên theo kỳ chấm công • Thuế & Bảo hiểm 2026</p>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004aad]"></div>
                    <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                </div>
            )}

            {!loading && (
                <>
                    {/* Filter Bar */}
                    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            {/* Kỳ lương */}
                            <div className="relative w-full lg:w-56">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select value={selectedKy?.id ?? ''} onChange={e => { setSelectedKy(danhSachKy.find(k => k.id === e.target.value) ?? null); setCurrentPage(1); }}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent bg-white">
                                    {danhSachKy.length === 0 ? <option>Chưa có kỳ</option> : danhSachKy.map(ky => <option key={ky.id} value={ky.id}>{ky.tenKy}</option>)}
                                </select>
                            </div>
                            {/* Search */}
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input type="text" placeholder="Tìm kiếm theo Mã NV hoặc Họ tên..."
                                    value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent" />
                            </div>
                            {/* BU filter */}
                            <div className="relative w-full lg:w-52">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select value={filterBU} onChange={e => { setFilterBU(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent bg-white">
                                    <option value="all">Tất cả đơn vị</option>
                                    {businessUnits.map(bu => <option key={bu.id} value={bu.id}>{bu.name}</option>)}
                                </select>
                            </div>
                            {/* Export + Refresh */}
                            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                                <Download className="w-4 h-4" /> Xuất Excel
                            </button>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                title="Cập nhật toàn bộ: chấm công + lương + điều chỉnh"
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap font-medium
                                    ${refreshDone
                                        ? 'bg-green-500 text-white'
                                        : refreshing
                                            ? 'bg-[#004aad]/70 text-white cursor-not-allowed'
                                            : 'bg-[#004aad] hover:bg-[#1557A0] text-white'}`}
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                {refreshDone ? 'Đã cập nhật!' : refreshing ? 'Đang cập nhật...' : 'Làm mới'}
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-14">STT</th>
                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nhân Viên</th>
                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Đơn Vị</th>
                                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kỳ Lương</th>
                                        <th className="py-4 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Lương Cơ Bản</th>
                                        <th className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Công TH</th>
                                        <th className="py-4 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Bảo Hiểm</th>
                                        <th className="py-4 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thuế TNCN</th>
                                        <th className="py-4 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thực Nhận</th>
                                        <th className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedRows.length === 0 ? (
                                        <tr><td colSpan={10} className="py-12 text-center">
                                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">Không tìm thấy nhân viên nào</p>
                                        </td></tr>
                                    ) : pagedRows.map(row => (
                                        <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6 text-sm text-gray-500 text-center">{row.stt}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0"><User className="w-4 h-4 text-gray-400" /></div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{row.fullName}</p>
                                                        <p className="text-xs text-blue-600 font-medium flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{row.employeeId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{row.businessUnit}</td>
                                            <td className="py-4 px-6">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{selectedKy?.tenKy ?? '—'}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right text-sm font-semibold text-gray-800">{fmt(row.actualSalary || 0)}</td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${row.tongHop ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{row.congThucTe}/{row.empCongChuan}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right text-sm font-semibold text-orange-600">{fmt(row.r.bh.total)}</td>
                                            <td className="py-4 px-6 text-right text-sm font-semibold text-purple-600">{fmt(row.r.thue)}</td>
                                            <td className="py-4 px-6 text-right text-sm font-bold text-[#004aad]">{fmt(row.r.thucLanh)}</td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button title="Xem chi tiết" onClick={() => setSelectedEmployee(row)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"><Eye className="w-4 h-4" /></button>
                                                    <button title="Chỉnh sửa phụ cấp / thưởng" onClick={() => setEditTarget(row)} className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"><Edit2 className="w-4 h-4" /></button>
                                                    <button title="Xuất phiếu lương" onClick={() => printPayslip(row)} className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"><Printer className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
                                <div className="text-sm text-gray-600">
                                    Hiển thị <span className="font-semibold">{(currentPage - 1) * PAGE_SIZE + 1}</span> - <span className="font-semibold">{Math.min(currentPage * PAGE_SIZE, payrollRows.length)}</span> trong tổng số <span className="font-semibold">{payrollRows.length}</span> nhân viên
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                        <button key={p} onClick={() => setCurrentPage(p)} className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${currentPage === p ? 'bg-[#004aad] text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{p}</button>
                                    ))}
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-5 h-5" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Detail Modal */}
            {selectedEmployee && (() => {
                const ov = rowOverrides[selectedEmployee.employeeId];
                const th = tongHopMap[selectedEmployee.employeeId] ?? null;
                const empCongChuan = th?.congChuan ?? congChuan;
                return (
                    <ChiTietModal
                        employee={selectedEmployee}
                        tongHop={th}
                        ky={selectedKy}
                        congChuan={empCongChuan}
                        overrides={ov}
                        onClose={() => setSelectedEmployee(null)}
                    />
                );
            })()}

            {/* Edit Modal */}
            {editTarget && (
                <ChinhSuaModal
                    employee={editTarget}
                    congChuan={tongHopMap[editTarget.employeeId]?.congChuan ?? congChuan}
                    congThucTe={tongHopMap[editTarget.employeeId]?.congChinhThuc ?? 0}
                    ky={selectedKy}
                    initial={rowOverrides[editTarget.employeeId] ?? { thuong: 0, phuCap: 0, soNPT: 0 }}
                    onSave={async val => {
                        const maNV = editTarget.employeeId; // mã NV (BB001...)
                        const dbId = editTarget.id;        // UUID trong DB

                        // 1. Cập nhật state ngay (UI responsive)
                        setRowOverrides(prev => ({ ...prev, [maNV]: val }));
                        setEditTarget(null);

                        // 2. Lưu vào DB
                        if (selectedKy && dbId) {
                            try {
                                await salaryRecordService.save(selectedKy.id, dbId, {
                                    phuCap: val.phuCap ?? 0,
                                    thuong: val.thuong ?? 0,
                                    soNPT: val.soNPT ?? 0,
                                    luongCoBan: val.luongCoBan ?? null,
                                    congThucTe: val.congThucTeEdit ?? null,
                                });
                            } catch (e) {
                                console.error('Lưu salary record thất bại:', e);
                            }
                        }
                    }}
                    onClose={() => setEditTarget(null)}
                />
            )}
        </div>
    );
}
