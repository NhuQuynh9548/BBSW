import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, DollarSign, Download, Filter,
    ChevronLeft, ChevronRight, Calculator,
    User, Building2, Calendar, LayoutGrid,
    ArrowUpRight, Users, Briefcase, FileText,
    ExternalLink, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { employeeService } from '../../services/employeeService';
import { salaryConfigService, SalaryConfig, calculateSalaryRates } from '../../services/salaryConfigService';
import { businessUnitService } from '../../services/businessUnitService';
import { ChiTietLuongNhanVien } from './ChiTietLuongNhanVien';
import * as XLSX from 'xlsx';

export function BangLuong() {
    const { selectedBU, canSelectBU } = useApp();

    // States
    const [employees, setEmployees] = useState<any[]>([]);
    const [businessUnits, setBusinessUnits] = useState<any[]>([]);
    const [activeConfig, setActiveConfig] = useState<SalaryConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBU, setFilterBU] = useState<string>('all');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // UI States
    const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [bus, configs] = await Promise.all([
                    businessUnitService.getAll(),
                    salaryConfigService.getAll()
                ]);
                setBusinessUnits(bus);
                const active = configs.find(c => c.status === 'ACTIVE') || configs[0];
                setActiveConfig(active);
            } catch (err) {
                console.error('Error fetching initial data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Sync filterBU with global context
    useEffect(() => {
        if (selectedBU !== 'all') {
            setFilterBU(selectedBU);
        }
    }, [selectedBU]);

    // Fetch Employees based on filters
    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const filters: any = {
                status: 'working' // Only show active employees in payroll
            };
            if (filterBU !== 'all') filters.buId = filterBU;

            const data = await employeeService.getAll(filters);
            setEmployees(data);
        } catch (err) {
            console.error('Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    }, [filterBU]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // Format Currency
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(val));
    };

    // Calculate Payroll Data
    const payrollData = useMemo(() => {
        if (!activeConfig) return [];

        return employees.map((emp, index) => {
            const rates = calculateSalaryRates(emp.actualSalary || 0, activeConfig);
            return {
                ...emp,
                stt: index + 1,
                rates
            };
        }).filter(emp => {
            const searchLower = searchTerm.toLowerCase();
            return emp.fullName.toLowerCase().includes(searchLower) ||
                emp.employeeId.toLowerCase().includes(searchLower);
        });
    }, [employees, activeConfig, searchTerm]);

    // Summaries
    const totals = useMemo(() => {
        return payrollData.reduce((acc, curr) => ({
            count: acc.count + 1,
            totalSalary: acc.totalSalary + (curr.actualSalary || 0),
        }), { count: 0, totalSalary: 0 });
    }, [payrollData]);

    // Export Excel
    const handleExport = () => {
        const exportData = payrollData.map(item => ({
            'STT': item.stt,
            'Mã NV': item.employeeId,
            'Họ và Tên': item.fullName,
            'Đơn vị': item.businessUnit,
            'Cấp bậc': item.level,
            'Lương cơ bản': item.actualSalary,
            'Ngày chuẩn': item.rates.standardWorkingDays,
            'Lương/Ngày': item.rates.salaryPerDay,
            'Lương/Giờ': item.rates.salaryPerHour
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bang Luong");
        XLSX.writeFile(wb, `Bang_Luong_Thang_${selectedMonth}_${selectedYear}.xlsx`);
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-[#004aad] rounded-xl shadow-lg shadow-blue-100">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        Bảng Lương Nhân Viên
                    </h1>
                    <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        Detailed Payroll Management • {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm active:scale-95"
                    >
                        <Download className="w-4 h-4 text-blue-600" />
                        XUẤT EXCEL
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#004aad] text-white rounded-xl hover:bg-[#1557A0] transition-all font-bold text-sm shadow-lg shadow-blue-100 active:scale-95">
                        <Calculator className="w-4 h-4" />
                        CHỐT LƯƠNG
                    </button>
                </div>
            </div>

            {/* KPI Cards Area */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Tổng nhân sự', value: totals.count, sub: 'Nhân viên chính thức', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Tổng quỹ lương', value: formatCurrency(totals.totalSalary), sub: 'Dự toán chi trả', icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Công chuẩn tháng', value: activeConfig?.cycleStartDay ? `${calculateSalaryRates(0, activeConfig).standardWorkingDays} ngày` : 'N/A', sub: `Tháng ${selectedMonth}/${selectedYear}`, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Cấu hình áp dụng', value: activeConfig?.code || 'N/A', sub: activeConfig?.name || 'Chưa chọn', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 ${kpi.bg} rounded-xl`}>
                                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Data</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 mb-1">{kpi.value}</h3>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                            {kpi.label} • <span className="opacity-60 font-medium">{kpi.sub}</span>
                        </p>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Tìm theo Mã NV hoặc Họ tên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#004aad] text-sm font-semibold text-gray-700"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 px-4 rounded-xl border border-transparent focus-within:border-[#004aad] transition-all">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="bg-transparent border-none py-3 text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>Tháng {m < 10 ? `0${m}` : m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 px-4 rounded-xl border border-transparent focus-within:border-[#004aad] transition-all">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterBU}
                            onChange={(e) => setFilterBU(e.target.value)}
                            className="bg-transparent border-none py-3 text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer min-w-[140px]"
                        >
                            <option value="all">Tất cả đơn vị</option>
                            {businessUnits.map(bu => (
                                <option key={bu.id} value={bu.id}>{bu.name}</option>
                            ))}
                        </select>
                    </div>

                    <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 border border-transparent">
                        <Filter className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 border border-transparent">
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Table Area */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-100">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-16">STT</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Thông tin nhân viên</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Đơn vị / Cấp bậc</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Lương thực nhận</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Công chuẩn</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Lương / Ngày</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-blue-100 border-t-[#004aad] rounded-full animate-spin" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Đang tính toán dữ liệu...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : payrollData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                                        Không tìm thấy dữ liệu nhân sự phù hợp
                                    </td>
                                </tr>
                            ) : (
                                payrollData.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold text-gray-400 group-hover:text-[#004aad] transition-colors">{item.stt}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-gray-200 shadow-sm">
                                                    <User className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-800 group-hover:text-[#004aad] transition-colors">{item.fullName}</p>
                                                    <p className="text-[10px] font-bold text-blue-400 flex items-center gap-1 uppercase">
                                                        <ShieldCheck className="w-3 h-3" /> ID: {item.employeeId}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase">
                                                    <Briefcase className="w-3 h-3 text-gray-300" /> {item.businessUnit}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{item.level}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-black text-[#004aad] tracking-tight">
                                                {formatCurrency(item.actualSalary)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[11px] font-bold border border-green-100 shadow-sm">
                                                {item.rates.standardWorkingDays} ngày
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-xs font-bold text-gray-600">
                                                {formatCurrency(item.rates.salaryPerDay)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedEmployee(item);
                                                    setShowDetailModal(true);
                                                }}
                                                className="p-2 hover:bg-blue-50 rounded-xl transition-all text-[#004aad] group/btn shadow-sm border border-transparent hover:border-blue-100 active:scale-90"
                                            >
                                                <ArrowUpRight className="w-5 h-5 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer / Pagination */}
                <div className="px-6 py-5 bg-white border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Hiển thị {payrollData.length} nhân sự • Trang 01/01
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 disabled:opacity-30" disabled>
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 bg-[#004aad] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100">1</button>
                        <button className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 disabled:opacity-30" disabled>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal Integration */}
            {showDetailModal && selectedEmployee && activeConfig && (
                <ChiTietLuongNhanVien
                    employee={selectedEmployee}
                    config={activeConfig}
                    onUpdate={(empId, newSalary) => {
                        // Update local state immediately for instant UI feedback
                        setEmployees(prev => prev.map(emp =>
                            emp.id === empId ? { ...emp, actualSalary: newSalary } : emp
                        ));
                        // Also sync with server to ensure all derived data is fresh
                        fetchEmployees();
                    }}
                    onClose={() => setShowDetailModal(false)}
                />
            )}
        </div>
    );
}

// Internal Wallet Helper (missing from imports but used in UI logic)
function Wallet({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="20" height="14" x="2" y="6" rx="2" /><path d="M12 10h.01" /><path d="M17 10h.01" /><path d="M12 14h.01" /><path d="M17 14h.01" /><path d="M22 10v4" />
        </svg>
    );
}
