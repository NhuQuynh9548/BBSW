import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, Plus, Edit2, Trash2, X,
    AlertCircle, Calendar, Clock,
    CheckCircle2, Info, Calculator, Briefcase, Save
} from 'lucide-react';
import { salaryConfigService, SalaryConfig, calculateSalaryRates } from '../../../services/salaryConfigService';

export function CauHinhLuong() {
    const [configs, setConfigs] = useState<SalaryConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingConfig, setEditingConfig] = useState<SalaryConfig | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingConfig, setDeletingConfig] = useState<SalaryConfig | null>(null);


    // Simulation State
    const [simMonth, setSimMonth] = useState(new Date().getMonth() + 1);
    const [simYear, setSimYear] = useState(new Date().getFullYear());

    const [formData, setFormData] = useState<Omit<SalaryConfig, 'id' | 'standardWorkingDays' | 'standardWorkingHours' | 'standardWorkingMinutes'>>({
        code: 'SALARY_STANDARD',
        name: 'Cấu hình lương chuẩn công ty',
        status: 'ACTIVE',
        cycleStartDay: 26,
        cycleEndDay: 27,
        workingDaysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        excludedDaysOfWeek: ['SATURDAY', 'SUNDAY'],
        startTime: '09:00',
        endTime: '18:00',
        breakMinutes: 60,
        companyHolidays: [],
        formulaDay: '[Lương] ÷ [Ngày chuẩn]',
        formulaHour: '[Ngày] ÷ [Giờ/Ngày]',
        formulaMinute: '[Giờ] ÷ 60',
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await salaryConfigService.getAll();
            setConfigs(data);
        } catch (error) {
            console.error('Error fetching salary configs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredConfigs = configs.filter(config =>
        config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setEditingConfig(null);
        setFormData({
            code: '',
            name: '',
            status: 'ACTIVE',
            cycleStartDay: 26,
            cycleEndDay: 27,
            workingDaysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
            excludedDaysOfWeek: ['SATURDAY', 'SUNDAY'],
            startTime: '09:00',
            endTime: '18:00',
            breakMinutes: 60,
            companyHolidays: [],
            formulaDay: '[Lương] ÷ [Ngày chuẩn]',
            formulaHour: '[Ngày] ÷ [Giờ/Ngày]',
            formulaMinute: '[Giờ] ÷ 60',
        });
        setShowModal(true);
    };

    const handleEdit = (config: SalaryConfig) => {
        setEditingConfig(config);

        setFormData({
            code: config.code || '',
            name: config.name || '',
            status: config.status || 'ACTIVE',
            cycleStartDay: config.cycleStartDay || 26,
            cycleEndDay: config.cycleEndDay || 27,
            workingDaysOfWeek: config.workingDaysOfWeek || [],
            excludedDaysOfWeek: config.excludedDaysOfWeek || [],
            startTime: config.startTime || '09:00',
            endTime: config.endTime || '18:00',
            breakMinutes: config.breakMinutes ?? 60,
            companyHolidays: config.companyHolidays || [],
            formulaDay: config.formulaDay || '[Lương] ÷ [Ngày chuẩn]',
            formulaHour: config.formulaHour || '[Ngày] ÷ [Giờ/Ngày]',
            formulaMinute: config.formulaMinute || '[Giờ] ÷ 60',
        });
        setShowModal(true);
    };

    const handleDelete = (config: SalaryConfig) => {
        setDeletingConfig(config);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deletingConfig) {
            try {
                await salaryConfigService.delete(deletingConfig.id);
                await fetchData();
                setShowDeleteConfirm(false);
                setDeletingConfig(null);
            } catch (error) {
                console.error('Error deleting salary config:', error);
                alert('Xóa thất bại');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingConfig) {
                await salaryConfigService.update(editingConfig.id, formData);
            } else {
                await salaryConfigService.create(formData);
            }
            setShowModal(false);
            await fetchData();
        } catch (error) {
            console.error('Error saving salary config:', error);
            alert('Lưu cấu hình thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const toggleDay = (day: string) => {
        setFormData(prev => {
            const currentWorking = prev.workingDaysOfWeek || [];
            const currentExcluded = prev.excludedDaysOfWeek || [];

            const isWorking = currentWorking.includes(day);
            const newWorking = isWorking
                ? currentWorking.filter(d => d !== day)
                : [...currentWorking, day];
            const newExcluded = isWorking
                ? [...currentExcluded, day]
                : currentExcluded.filter(d => d !== day);

            return {
                ...prev,
                workingDaysOfWeek: newWorking,
                excludedDaysOfWeek: newExcluded
            };
        });
    };

    const daysOfWeek = [
        { value: 'MONDAY', label: 'T2' },
        { value: 'TUESDAY', label: 'T3' },
        { value: 'WEDNESDAY', label: 'T4' },
        { value: 'THURSDAY', label: 'T5' },
        { value: 'FRIDAY', label: 'T6' },
        { value: 'SATURDAY', label: 'T7' },
        { value: 'SUNDAY', label: 'CN' },
    ];


    // Performance Optimization: Preview Result
    const previewResult = useMemo(() => {
        return calculateSalaryRates(0, formData as any, { month: simMonth, year: simYear });
    }, [formData, simMonth, simYear]);

    return (
        <div className="p-8">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Cấu Hình Lương</h1>
                <p className="text-gray-600">Quản lý định nghĩa lương, lịch làm việc và công thức quy đổi</p>
            </div>

            {/* Actions Bar */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 flex-1 w-full">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm mã, tên danh mục..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#004aad] hover:bg-[#1557A0] text-white rounded-lg transition-colors whitespace-nowrap shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        Thiết lập quy tắc mới
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mã</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên Cấu Hình</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Chu kỳ tính lương</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lịch làm việc</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng Thái</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredConfigs.map((config) => (
                                <tr key={config.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono font-bold text-[#004aad] uppercase">{config.code}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900">{config.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">
                                            Ngày {config.cycleStartDay} - {config.cycleEndDay} hàng tháng
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            {daysOfWeek.map(d => (
                                                <span key={d.value} className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold ${config.workingDaysOfWeek.includes(d.value) ? 'bg-[#004aad] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    {d.label}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {config.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng sử dụng'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(config)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(config)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredConfigs.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có quy tắc lương nào</p>
                    </div>
                )}
            </div>

            {/* Professional Modal */}
            {showModal && (
                <div className="modal-overlay-container">
                    <div className="modal-content-container max-w-2xl">

                        {/* Modal Header */}
                        <div className="border-b border-gray-200 px-8 py-6 bg-white shrink-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingConfig ? 'Chỉnh Sửa Cấu Hình Lương' : 'Thiết Lập Quy Tắc Lương Mới'}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {editingConfig ? 'Cập nhật lại quy chuẩn tính lương cho hệ thống' : 'Vui lòng thiết lập các quy chuẩn tính lương bên dưới'}
                                    </p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content - Single column, scrollable */}
                        <div className="overflow-y-auto flex-1 px-6 py-4 custom-scrollbar">
                            <form onSubmit={handleSubmit} id="config-form" className="space-y-5">

                                {/* SECTION 1: THÔNG TIN CHUNG */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <div className="w-4 h-4 bg-[#004aad] rounded-full flex items-center justify-center text-white text-[9px] font-bold">1</div>
                                        Thông tin chung
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mã cấu hình</label>
                                            <input
                                                type="text"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent focus:bg-white transition-all font-mono font-bold text-gray-600 text-sm"
                                                placeholder="SALARY_STANDARD"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tên cấu hình</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent focus:bg-white transition-all font-bold text-gray-700 text-sm"
                                                placeholder="Cấu hình lương chuẩn..."
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Trạng thái áp dụng</label>
                                        <div className="flex items-center gap-3">
                                            <div
                                                onClick={() => setFormData({ ...formData, status: formData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                                                className={`w-10 h-5 rounded-full cursor-pointer transition-colors flex items-center justify-center ${formData.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`}
                                            >
                                                <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">{formData.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100" />

                                {/* SECTION 2: CHU KỲ & LỊCH LÀM VIỆC */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <div className="w-4 h-4 bg-[#004aad] rounded-full flex items-center justify-center text-white text-[9px] font-bold">2</div>
                                        Chu kỳ & Lịch làm việc
                                    </h3>

                                    {/* Ngày chu kỳ */}
                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-gray-500 mb-2">Ngày chu kỳ hàng tháng</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                                                <span className="text-xs text-gray-600 font-medium">Bắt đầu (T-1)</span>
                                                <select
                                                    value={formData.cycleStartDay}
                                                    onChange={(e) => setFormData({ ...formData, cycleStartDay: parseInt(e.target.value) })}
                                                    className="bg-transparent border-none font-bold text-gray-700 focus:ring-0 text-sm text-right"
                                                >
                                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                        <option key={day} value={day}>{day}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                                                <span className="text-xs text-gray-600 font-medium">Kết thúc (T)</span>
                                                <select
                                                    value={formData.cycleEndDay}
                                                    onChange={(e) => setFormData({ ...formData, cycleEndDay: parseInt(e.target.value) })}
                                                    className="bg-transparent border-none font-bold text-gray-700 focus:ring-0 text-sm text-right"
                                                >
                                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                        <option key={day} value={day}>{day}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ngày làm việc */}
                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-gray-500 mb-2">Ngày làm việc trong tuần</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {daysOfWeek.map(day => (
                                                <label key={day.value} className="flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-80">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.workingDaysOfWeek.includes(day.value)}
                                                        onChange={() => toggleDay(day.value)}
                                                        className="w-4 h-4 rounded border-gray-300 text-[#004aad] focus:ring-[#004aad] cursor-pointer"
                                                    />
                                                    <span className={`text-xs font-bold ${formData.workingDaysOfWeek.includes(day.value) ? 'text-[#004aad]' : 'text-gray-400'}`}>
                                                        {day.label === 'CN' ? 'CN' : `T${day.label.replace('T', '')}`}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Giờ làm việc */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Giờ làm việc & Nghỉ ngơi</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-xs text-gray-400 mb-1 block">Giờ vào</label>
                                                <input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 font-bold text-gray-700 text-sm focus:ring-2 focus:ring-[#004aad] transition-all" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 mb-1 block">Giờ ra</label>
                                                <input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 font-bold text-gray-700 text-sm focus:ring-2 focus:ring-[#004aad] transition-all" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 mb-1 block">Nghỉ trưa (phút)</label>
                                                <input type="number" value={formData.breakMinutes} onChange={e => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 font-bold text-gray-700 text-sm text-center focus:ring-2 focus:ring-[#004aad] transition-all" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Company Holidays */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Ngày nghỉ riêng (Company Holiday)</label>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="date"
                                                    id="new-holiday"
                                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#004aad] transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const input = document.getElementById('new-holiday') as HTMLInputElement;
                                                        if (input.value && !formData.companyHolidays?.includes(input.value)) {
                                                            setFormData({
                                                                ...formData,
                                                                companyHolidays: [...(formData.companyHolidays || []), input.value]
                                                            });
                                                            input.value = '';
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    Thêm ngày
                                                </button>
                                            </div>
                                            {formData.companyHolidays && formData.companyHolidays.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {formData.companyHolidays.map(h => (
                                                        <span key={h} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-bold border border-blue-100 shadow-sm">
                                                            {new Date(h).toLocaleDateString('vi-VN')}
                                                            <button
                                                                onClick={() => setFormData({
                                                                    ...formData,
                                                                    companyHolidays: formData.companyHolidays?.filter(date => date !== h)
                                                                })}
                                                                className="hover:text-red-500"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100" />

                                {/* SECTION 3: SIMULATION */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <div className="w-4 h-4 bg-[#004aad] rounded-full flex items-center justify-center text-white text-[9px] font-bold">3</div>
                                        MÔ PHỎNG & KIỂM TRA
                                    </h3>
                                    <div className="flex gap-3 items-center mb-3">
                                        <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Tháng giả lập</label>
                                        <select
                                            value={simMonth}
                                            onChange={(e) => setSimMonth(parseInt(e.target.value))}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#004aad] text-sm transition-all"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                <option key={m} value={m}>Tháng {m < 10 ? `0${m}` : m}/{simYear}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Calendar className="w-3.5 h-3.5 text-[#004aad]" />
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Chu kỳ</p>
                                            </div>
                                            <p className="text-xs text-gray-700 font-bold">{previewResult.startDate?.toLocaleDateString('vi-VN')}</p>
                                            <p className="text-[10px] text-gray-400">→ {previewResult.endDate?.toLocaleDateString('vi-VN')}</p>
                                        </div>
                                        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Briefcase className="w-3.5 h-3.5 text-green-600" />
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Ngày chuẩn</p>
                                            </div>
                                            <p className="text-xl font-black text-gray-800">{previewResult.standardWorkingDays}</p>
                                            <p className="text-[10px] text-gray-500">ngày</p>
                                        </div>
                                        <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Clock className="w-3.5 h-3.5 text-orange-500" />
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Giờ công</p>
                                            </div>
                                            <p className="text-xl font-black text-gray-800">{previewResult.standardWorkingHours.toFixed(0)}</p>
                                            <p className="text-[10px] text-gray-500">giờ</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100" />

                                {/* SECTION 4: CÔNG THỨC */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <div className="w-4 h-4 bg-[#004aad] rounded-full flex items-center justify-center text-white text-[9px] font-bold">4</div>
                                        Công thức quy đổi
                                    </h3>
                                    <div className="overflow-hidden border border-gray-200 rounded-xl">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase w-20">Loại</th>
                                                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Công thức</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                <tr>
                                                    <td className="px-4 py-3 font-bold text-gray-800 text-xs">Ngày</td>
                                                    <td className="px-2 py-1.5">
                                                        <input
                                                            type="text"
                                                            value={formData.formulaDay}
                                                            onChange={(e) => setFormData({ ...formData, formulaDay: e.target.value })}
                                                            className="w-full px-3 py-1.5 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-[#004aad] text-xs font-semibold text-gray-600"
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 font-bold text-gray-800 text-xs">Giờ</td>
                                                    <td className="px-2 py-1.5">
                                                        <input
                                                            type="text"
                                                            value={formData.formulaHour}
                                                            onChange={(e) => setFormData({ ...formData, formulaHour: e.target.value })}
                                                            className="w-full px-3 py-1.5 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-[#004aad] text-xs font-semibold text-gray-600"
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 font-bold text-gray-800 text-xs">Phút</td>
                                                    <td className="px-2 py-1.5">
                                                        <input
                                                            type="text"
                                                            value={formData.formulaMinute}
                                                            onChange={(e) => setFormData({ ...formData, formulaMinute: e.target.value })}
                                                            className="w-full px-3 py-1.5 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-[#004aad] text-xs font-semibold text-gray-600"
                                                        />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                </div>

                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-center gap-3 bg-white shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-w-[140px]"
                            >
                                Đóng cửa sổ
                            </button>
                            <button
                                type="submit"
                                form="config-form"
                                className="px-8 py-2.5 bg-[#004aad] text-white rounded-lg hover:bg-[#1557A0] transition-colors font-medium min-w-[140px] shadow-sm flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {editingConfig ? 'Lưu thay đổi' : 'Tạo cấu hình'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && deletingConfig && (
                <div className="modal-overlay-container">
                    <div className="modal-content-container max-w-md">
                        <div className="p-8">
                            <div className="flex flex-col items-center text-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Xác nhận xóa?</h3>
                                    <p className="text-sm text-gray-500 mt-1">Hành động này sẽ gỡ bỏ định nghĩa Master Data. Các phép tính lương liên quan có thể bị ảnh hưởng.</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100">
                                <p className="text-sm text-gray-700 flex justify-between py-1 border-b border-dashed border-slate-200">
                                    <span className="font-semibold text-gray-500">Mã cấu hình:</span>
                                    <span className="font-bold">{deletingConfig.code}</span>
                                </p>
                                <p className="text-sm text-gray-700 flex justify-between py-1 mt-1">
                                    <span className="font-semibold text-gray-500">Tên cấu hình:</span>
                                    <span className="font-bold">{deletingConfig.name}</span>
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">Hủy</button>
                                <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold shadow-lg shadow-red-100">Xác nhận xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
