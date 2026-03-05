import React, { useState, useEffect, useCallback } from 'react';
import {
    User, ShieldCheck,
    Edit3, Calculator,
    History, X, Briefcase, CheckCircle2,
    Banknote, Building2, Award, FileText, Save, RotateCcw, Plus
} from 'lucide-react';
import { SalaryConfig, calculateSalaryRates } from '../../services/salaryConfigService';
import { employeeService } from '../../services/employeeService';
import { toast } from 'sonner';

interface SalaryHistoryItem {
    id: string;
    salary: number;
    effectiveFrom: string;
    effectiveTo: string | null;
    description: string;
}

interface Employee {
    id: string;
    employeeId: string;
    fullName: string;
    email: string;
    phone: string;
    businessUnit: string;
    specialization: string;
    level: string;
    joinDate: string;
    workStatus: 'working' | 'probation' | 'resigned';
    actualSalary: number;
    contractStartDate: string;
}

interface ChiTietLuongNhanVienProps {
    employee: Employee;
    config: SalaryConfig;
    onClose: () => void;
    onUpdate?: (employeeId: string, newSalary: number) => void;
}

const HISTORY_KEY = (employeeId: string) => `salary_history_${employeeId}`;

function loadLocalHistory(employeeId: string): SalaryHistoryItem[] {
    try {
        const raw = localStorage.getItem(HISTORY_KEY(employeeId));
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveLocalHistory(employeeId: string, history: SalaryHistoryItem[]) {
    localStorage.setItem(HISTORY_KEY(employeeId), JSON.stringify(history));
}

export function ChiTietLuongNhanVien({ employee, config, onClose, onUpdate }: ChiTietLuongNhanVienProps) {
    const [isAdjusting, setIsAdjusting] = useState(false);
    const [tempSalary, setTempSalary] = useState(employee.actualSalary || 0);
    const [adjustDescription, setAdjustDescription] = useState('');
    const [activeSalary, setActiveSalary] = useState(employee.actualSalary || 0);
    const [isSaving, setIsSaving] = useState(false);
    const [salaryHistory, setSalaryHistory] = useState<SalaryHistoryItem[]>([]);

    // Sync state with props when employee ID or actualSalary changes
    useEffect(() => {
        // Only sync if NOT currently in manual adjustment mode
        if (!isAdjusting) {
            setActiveSalary(employee.actualSalary || 0);
            setTempSalary(employee.actualSalary || 0);
        }
    }, [employee.id, employee.actualSalary, isAdjusting]);

    const loadHistoryData = useCallback(() => {
        const stored = loadLocalHistory(employee.id);
        if (stored.length === 0 && (employee.actualSalary || activeSalary)) {
            const initial: SalaryHistoryItem = {
                id: 'initial',
                salary: employee.actualSalary || activeSalary,
                effectiveFrom: employee.joinDate || new Date().toISOString(),
                effectiveTo: null,
                description: 'Lương ban đầu'
            };
            setSalaryHistory([initial]);
        } else {
            setSalaryHistory(stored);
        }
    }, [employee.id, employee.actualSalary, employee.joinDate, activeSalary]);

    useEffect(() => {
        loadHistoryData();
    }, [loadHistoryData]);

    const formatCurrency = (val: number | undefined | null) => {
        const amount = val || 0;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(amount));
    };

    // Format for input display: just the number with dots (e.g. 20.000.000)
    const formatInputDisplay = (val: number) => {
        if (!val) return '';
        return new Intl.NumberFormat('vi-VN').format(val);
    };

    // Parse formatted string back to number
    const parseFormattedInput = (str: string): number => {
        // Remove all dots (thousand separators) and parse
        const cleaned = str.replace(/\./g, '').replace(/[^0-9]/g, '');
        return parseInt(cleaned) || 0;
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'Nay';
        try { return new Date(dateStr).toLocaleDateString('vi-VN'); }
        catch { return dateStr; }
    };

    const rates = calculateSalaryRates(activeSalary, config);
    const monthYear = new Date().toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
    const currentMonthLabel = monthYear.toLowerCase().includes('tháng') ? monthYear : `Tháng ${monthYear}`;

    const handleSaveAdjustment = async () => {
        if (!tempSalary || tempSalary <= 0) {
            toast.error('Vui lòng nhập mức lương hợp lệ.');
            return;
        }

        const oldSalary = activeSalary;
        try {
            setIsSaving(true);
            const payload = { actualSalary: tempSalary, actual_salary: tempSalary };
            const response = await employeeService.update(employee.id, payload);
            if (response) {
                toast.success('Cập nhật lương thành công!');
                setActiveSalary(tempSalary);
                const now = new Date().toISOString();
                const existingHistory = loadLocalHistory(employee.id);
                const updatedHistory = existingHistory.map((h) =>
                    h.effectiveTo === null ? { ...h, effectiveTo: now } : h
                );
                const newRecord: SalaryHistoryItem = {
                    id: `sh_${Date.now()}`,
                    salary: tempSalary,
                    effectiveFrom: now,
                    effectiveTo: null,
                    description: adjustDescription.trim() || 'Điều chỉnh lương'
                };
                if (updatedHistory.length === 0 && oldSalary > 0) {
                    updatedHistory.push({
                        id: 'initial',
                        salary: oldSalary,
                        effectiveFrom: employee.joinDate || now,
                        effectiveTo: now,
                        description: 'Lương ban đầu'
                    });
                }
                const finalHistory = [newRecord, ...updatedHistory];
                saveLocalHistory(employee.id, finalHistory);
                setSalaryHistory(finalHistory);
                setIsAdjusting(false);
                setAdjustDescription('');
                if (onUpdate) onUpdate(employee.id, tempSalary);
            }
        } catch (err: any) {
            toast.error('Không thể lưu lương. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };


    const handleExport = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const content = `
            <html><head><title>Phieu Luong - ${employee.fullName}</title>
            <style>body{font-family:sans-serif;padding:30px;color:#333;}.header{border-bottom:2px solid #004aad;margin-bottom:15px;}.title{font-size:20px;font-weight:bold;}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:20px;}.label{color:#666;font-size:11px;text-transform:uppercase;font-weight:bold;}.value{font-size:14px;font-weight:bold;}.salary-box{background:#f8fafc;border:1px solid #e2e8f0;padding:15px;border-radius:6px;margin-bottom:15px;}.calculation-table{width:100%;border-collapse:collapse;}.calculation-table th,.calculation-table td{text-align:left;padding:10px;border-bottom:1px solid #edf2f7;font-size:13px;}</style>
            </head><body>
            <div class="header"><div class="title">PHIẾU DỰ TOÁN LƯƠNG</div><div style="font-size:11px;color:#666;">${currentMonthLabel}</div></div>
            <div class="info-grid"><div><div class="label">Nhân viên</div><div class="value">${employee.fullName}</div></div><div><div class="label">Mã ID</div><div class="value">${employee.employeeId}</div></div></div>
            <div class="salary-box"><div class="label">Thực nhận / Tháng</div><div class="value" style="font-size:20px;color:#004aad">${formatCurrency(activeSalary)}</div></div>
            <table class="calculation-table"><tr><th>Hạng mục</th><th>Giá trị</th></tr><tr><td>Ngày công chuẩn</td><td>${rates.standardWorkingDays}</td></tr><tr><td>Lương ngày</td><td>${formatCurrency(rates.salaryPerDay)}</td></tr><tr><td>Lương giờ</td><td>${formatCurrency(rates.salaryPerHour)}</td></tr></table>
            <script>window.print();</script></body></html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
    };

    return (
        <div className="modal-overlay-container">
            <div className="modal-content-container max-w-2xl">

                {/* Modal Header - Harmonized with Personnel Management */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-start justify-between bg-white shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Chi Tiết Lương Nhân Viên</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Chi tiết bảng lương và dự toán thu nhập
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600" aria-label="Close">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body - Scrollable Area */}
                <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3 bg-slate-50/20 custom-scrollbar">

                    {/* PROFILE & POLICY */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg bg-[#004aad]/5 flex items-center justify-center border border-[#004aad]/10 shrink-0">
                                <User className="w-7 h-7 text-[#004aad]/30" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[15px] font-bold text-gray-800 leading-snug truncate tracking-tight">{employee.fullName}</h3>
                                <div className="text-[11px] font-semibold text-[#004aad] uppercase tracking-[0.05em] flex items-center gap-1 mt-0.5">
                                    <ShieldCheck className="w-3 h-3 text-[#004aad]/60" /> {employee.employeeId}
                                </div>
                                <div className="mt-2.5">
                                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${employee.workStatus === 'working' ? 'bg-green-50 text-green-700 border border-green-100' :
                                        employee.workStatus === 'probation' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                                            'bg-gray-50 text-gray-700 border border-gray-100'
                                        }`}>
                                        {employee.workStatus === 'working' ? 'Đang làm việc' : employee.workStatus === 'probation' ? 'Thử việc' : 'Nghỉ việc'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm flex flex-col justify-center">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[12px]">
                                    <span className="text-gray-400 font-medium tracking-wide">Cấu hình:</span>
                                    <span className="font-bold text-gray-700">{config.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px]">
                                    <span className="text-gray-400 font-medium tracking-wide">Chu kỳ chốt:</span>
                                    <span className="font-bold text-[#004aad] tracking-tight">{config.cycleStartDay} - {config.cycleEndDay}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CALCULATION */}
                    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
                        <div className="px-4 py-2.5 border-b border-gray-50 flex justify-between items-center">
                            <h4 className="font-bold text-gray-700 text-[11px] uppercase flex items-center gap-2">
                                <Calculator className="w-3.5 h-3.5 text-[#004aad]" /> Dự toán lương
                            </h4>
                            <div className="flex gap-2">
                                <button onClick={handleExport} className="p-1 text-gray-400 hover:text-blue-600 transition-colors tooltip" title="Xuất phiếu">
                                    <FileText className="w-4.5 h-4.5" />
                                </button>
                                <button onClick={() => { setTempSalary(activeSalary); setAdjustDescription(''); setIsAdjusting(!isAdjusting); }}
                                    className="px-3 py-1 text-[10px] font-bold text-white bg-[#004aad] rounded flex items-center gap-1 hover:bg-[#1557A0]">
                                    <Edit3 className="w-3 h-3" /> ĐIỀU CHỈNH
                                </button>
                            </div>
                        </div>

                        {isAdjusting && (
                            <div className="px-5 py-4 bg-blue-50/40 border-b border-gray-100 space-y-3">
                                <div className="flex gap-3 items-end">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-[#004aad] uppercase mb-1">Mức lương mới (VND)</p>
                                        <input
                                            type="text"
                                            value={formatInputDisplay(tempSalary)}
                                            onChange={(e) => setTempSalary(parseFormattedInput(e.target.value))}
                                            placeholder="Nhập mức lương (VD: 20.000.000)"
                                            className="w-full h-10 px-3 bg-white border border-blue-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-[#004aad] outline-none" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsAdjusting(false)} className="h-10 px-4 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-lg">HỦY</button>
                                        <button onClick={handleSaveAdjustment} disabled={isSaving} className="h-10 px-5 text-xs font-bold text-white bg-[#004aad] rounded-lg flex items-center gap-2">
                                            {isSaving ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} LƯU
                                        </button>
                                    </div>
                                </div>
                                <input type="text" value={adjustDescription} onChange={(e) => setAdjustDescription(e.target.value)}
                                    placeholder="Lý do điều chỉnh (không bắt buộc)..." className="w-full h-9 px-3 bg-white border border-blue-100 rounded-lg text-[12px] focus:border-[#004aad] outline-none" />
                            </div>
                        )}

                        <div className="grid grid-cols-2 lg:grid-cols-5 divide-x divide-gray-50 bg-white border-t border-gray-50">
                            {[
                                { label: 'Thực nhận', value: formatCurrency(activeSalary), sub: currentMonthLabel, hl: true },
                                { label: 'Công chuẩn', value: `${rates.standardWorkingDays} ngày`, sub: 'Hệ chốt' },
                                { label: 'Lương ngày', value: formatCurrency(rates.salaryPerDay), sub: 'Chu kỳ T' },
                                { label: 'Lương giờ', value: formatCurrency(rates.salaryPerHour), sub: '08h/ngày' },
                                { label: 'Lương phút', value: formatCurrency(rates.salaryPerMinute), sub: '60p/giờ' },
                            ].map((item, i) => (
                                <div key={i} className={`py-2 px-2 text-center ${item.hl ? 'bg-blue-50/30' : ''}`}>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">{item.label}</p>
                                    <p className={`text-[13px] font-bold ${item.hl ? 'text-[#004aad]' : 'text-gray-700'}`}>{item.value}</p>
                                    <p className="text-[9px] text-gray-300 italic mt-0">{item.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* HISTORY */}
                    <div className="bg-white rounded-lg border border-gray-100 p-4">
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                            <History className="w-3.5 h-3.5" /> Lịch sử biến động
                        </h4>

                        <div className="relative pl-6 space-y-3 border-l-2 border-slate-50">
                            {salaryHistory.map((item) => {
                                const isActive = !item.effectiveTo;
                                return (
                                    <div key={item.id} className="relative flex items-center py-1">
                                        <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${isActive ? 'bg-[#004aad]' : 'bg-slate-200'}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        </div>
                                        <div className={`ml-2 p-3 border rounded-xl flex-1 flex justify-between items-center transition-all ${isActive ? 'border-blue-100 bg-white shadow-sm' : 'border-slate-50 bg-slate-50/30 opacity-70'}`}>
                                            <div>
                                                <div className="flex items-center gap-2 font-bold text-[14px] text-gray-800">
                                                    <Banknote className={`w-3.5 h-3.5 ${isActive ? 'text-green-500' : 'text-gray-400'}`} /> {formatCurrency(item.salary)}
                                                </div>
                                                {item.description && <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{item.description}</p>}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{formatDate(item.effectiveFrom)}</p>
                                                {isActive && <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-50 text-[#004aad] text-[9px] font-bold uppercase">Hiện tại</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer - Final Screenshot Match */}
                <div className="px-5 py-5 border-t border-gray-100 flex justify-center bg-white shrink-0">
                    <button
                        onClick={onClose}
                        className="px-14 py-2 bg-white border border-gray-200 text-blue-600 rounded-lg font-medium text-[15px] hover:bg-gray-50"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
