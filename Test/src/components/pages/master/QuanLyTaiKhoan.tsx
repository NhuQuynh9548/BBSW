import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Landmark,
    Wallet,
    Vault,
    X,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Filter,
    CheckCircle2,
    Lock,
    ChevronDown,
    Eye
} from 'lucide-react';
import { paymentMethodService } from '../../../services/paymentMethodService';
import { businessUnitService } from '../../../services/businessUnitService';
import { ChiTietTaiKhoan } from './ChiTietTaiKhoan';

interface Account {
    id: string;
    code: string;
    name: string;
    type: string;
    owner: string;
    accountInfo: string;
    buName: string;
    status: 'active' | 'locked';
    balance?: number;
    logo?: string;
}

export function QuanLyTaiKhoan() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [showModal, setShowModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
    const [selectedAccountForDetail, setSelectedAccountForDetail] = useState<Account | null>(null);
    const [availableBUs, setAvailableBUs] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: 'Ngân hàng' as any,
        owner: '',
        accountInfo: '',
        buName: 'Tất cả BU',
        status: 'active' as 'active' | 'locked',
        balance: 0,
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            // For now, mapping payment methods to the new Account structure
            const [methodsData, busData] = await Promise.all([
                paymentMethodService.getAll(),
                businessUnitService.getAll()
            ]);

            setAvailableBUs(busData);

            // Mocking some data if the service returns empty or doesn't have all fields
            // In a real scenario, we'd update the backend to support these fields
            const mappedAccounts: Account[] = methodsData.map((m: any) => ({
                id: m.id,
                code: m.code || 'N/A',
                name: m.name,
                type: (m.type as any) || 'Ngân hàng',
                owner: m.owner || 'Công ty ABC',
                accountInfo: m.accountInfo || 'N/A',
                buName: m.buName || 'Tất cả BU',
                status: m.status === 'active' ? 'active' : 'locked',
                balance: m.balance || 0,
                logo: m.logo // Optional
            }));

            // If no data, add the ones from the screenshot as examples
            if (mappedAccounts.length === 0) {
                setAccounts([
                    {
                        id: '1',
                        code: 'B001',
                        name: 'Techcombank Vốn KD',
                        type: 'Ngân hàng',
                        owner: 'Công ty ABC',
                        accountInfo: '1234567890',
                        buName: 'Tất cả BU',
                        status: 'active',
                    },
                    {
                        id: '2',
                        code: 'C001',
                        name: 'Két sắt công ty',
                        type: 'Tiền mặt',
                        owner: 'Thủ quỹ',
                        accountInfo: 'N/A',
                        buName: 'Trụ sở chính',
                        status: 'active',
                    },
                    {
                        id: '3',
                        code: 'W001',
                        name: 'Ví Momo Marketing',
                        type: 'Ví điện tử',
                        owner: 'Phòng Marketing',
                        accountInfo: '0987654321',
                        buName: 'Phòng Marketing',
                        status: 'active',
                    },
                    {
                        id: '4',
                        code: 'B002',
                        name: 'Vietcombank Thanh Toán',
                        type: 'Ngân hàng',
                        owner: 'Công ty ABC',
                        accountInfo: '9876543210',
                        buName: 'Tất cả BU',
                        status: 'locked',
                        balance: 500000,
                    },
                ]);
            } else {
                setAccounts(mappedAccounts);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredAccounts = accounts.filter(account => {
        const matchesSearch =
            account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.accountInfo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || account.status === filterStatus;
        const matchesType = filterType === 'all' || account.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const stats = {
        bank: accounts.filter(a => a.type === 'Ngân hàng').reduce((sum, a) => sum + (a.balance || 0), 0),
        cash: accounts.filter(a => a.type === 'Tiền mặt').reduce((sum, a) => sum + (a.balance || 0), 0),
        wallet: accounts.filter(a => a.type === 'Ví điện tử').reduce((sum, a) => sum + (a.balance || 0), 0),
    };

    const handleAdd = () => {
        setEditingAccount(null);
        setFormData({
            code: '',
            name: '',
            type: 'Ngân hàng',
            owner: '',
            accountInfo: '',
            buName: 'Tất cả BU',
            status: 'active',
            balance: 0,
        });
        setShowModal(true);
    };

    const handleEdit = (account: Account) => {
        setEditingAccount(account);
        setFormData({
            code: account.code,
            name: account.name,
            type: account.type,
            owner: account.owner,
            accountInfo: account.accountInfo,
            buName: account.buName,
            status: account.status,
            balance: account.balance || 0,
        });
        setShowModal(true);
    };

    const handleDelete = (account: Account) => {
        setDeletingAccount(account);
        setShowDeleteConfirm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            // If the ID is a mock ID (1, 2, 3, 4), we should create instead of update
            const isMockId = ['1', '2', '3', '4'].includes(editingAccount?.id || '');

            if (editingAccount && !isMockId) {
                await paymentMethodService.update(editingAccount.id, payload);
            } else {
                await paymentMethodService.create(payload);
            }
            setShowModal(false);
            await fetchData();
        } catch (error: any) {
            console.error('Save error:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Lỗi không xác định';
            alert(`Lưu dữ liệu thất bại: ${errorMsg}`);
        }
    };

    const handleToggleStatus = async (account: Account) => {
        try {
            const newStatus = account.status === 'active' ? 'locked' : 'active';
            await paymentMethodService.update(account.id, { status: newStatus });

            // Update local state for immediate feedback
            setAccounts(prev => prev.map(a => a.id === account.id ? { ...a, status: newStatus } : a));
            if (selectedAccountForDetail?.id === account.id) {
                setSelectedAccountForDetail({ ...selectedAccountForDetail, status: newStatus });
            }

            await fetchData();
        } catch (error: any) {
            console.error('Toggle status error:', error);
            alert('Không thể thay đổi trạng thái tài khoản');
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Ngân hàng': return <Landmark className="w-8 h-8 text-gray-400" />;
            case 'Tiền mặt': return <Vault className="w-8 h-8 text-gray-400" />;
            case 'Ví điện tử': return <Wallet className="w-8 h-8 text-gray-400" />;
            case 'Thẻ tín dụng': return <Edit2 className="w-8 h-8 text-gray-400" />;
            default: return <Landmark className="w-8 h-8 text-gray-400" />;
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Tài khoản</h1>
                <p className="text-gray-600">Quản lý danh mục tài khoản tiền mặt, ngân hàng, và ví điện tử của hệ thống BLUEBOLT</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Ngân hàng */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-[#f0f4f8] p-3.5 rounded-xl border border-gray-50">
                        <Landmark className="w-9 h-9 text-[#475467]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#101828] text-lg">Tài khoản Ngân hàng</h3>
                        <p className="text-[#667085] text-sm">Số dư hiện tại: <span className="text-[#004aad] font-bold">{stats.bank.toLocaleString()} đ</span></p>
                        <button
                            onClick={() => {
                                const bankAccount = accounts.find(a => a.type === 'Ngân hàng');
                                if (bankAccount) setSelectedAccountForDetail(bankAccount);
                            }}
                            className="text-[#004aad] text-xs font-semibold mt-1 hover:underline"
                        >
                            Xem chi tiết
                        </button>
                    </div>
                </div>

                {/* Tiền mặt */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-[#f0f4f8] p-3.5 rounded-xl border border-gray-50">
                        <Vault className="w-9 h-9 text-[#475467]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#101828] text-lg">Tài khoản Tiền mặt</h3>
                        <p className="text-[#667085] text-sm">Số dư hiện tại: <span className="text-[#004aad] font-bold">{stats.cash.toLocaleString()} đ</span></p>
                        <button
                            onClick={() => {
                                const cashAccount = accounts.find(a => a.type === 'Tiền mặt');
                                if (cashAccount) setSelectedAccountForDetail(cashAccount);
                            }}
                            className="text-[#004aad] text-xs font-semibold mt-1 hover:underline"
                        >
                            Xem chi tiết
                        </button>
                    </div>
                </div>

                {/* Ví điện tử */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-[#f0f4f8] p-3.5 rounded-xl border border-gray-50">
                        <Wallet className="w-9 h-9 text-[#475467]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#101828] text-lg">Ví điện tử</h3>
                        <p className="text-[#667085] text-sm">Số dư hiện tại: <span className="text-[#004aad] font-bold">{stats.wallet.toLocaleString()} đ</span></p>
                        <button
                            onClick={() => {
                                const walletAccount = accounts.find(a => a.type === 'Ví điện tử');
                                if (walletAccount) setSelectedAccountForDetail(walletAccount);
                            }}
                            className="text-[#004aad] text-xs font-semibold mt-1 hover:underline"
                        >
                            Xem chi tiết
                        </button>
                    </div>
                </div>
            </div>

            {/* Actions Bar Container */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex flex-1 gap-4 w-full">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm mã, tên tài khoản... [cite: 1]"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent text-sm"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <select
                                className="appearance-none bg-white px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] text-gray-700 text-sm outline-none cursor-pointer min-w-[180px]"
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Hoạt động</option>
                                <option value="locked">Đã khóa</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                className="appearance-none bg-white px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] text-gray-700 text-sm outline-none cursor-pointer min-w-[150px]"
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                            >
                                <option value="all">Tất cả loại</option>
                                <option value="Ngân hàng">Ngân hàng</option>
                                <option value="Tiền mặt">Tiền mặt</option>
                                <option value="Ví điện tử">Ví điện tử</option>
                                <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="bg-[#002d5b] text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#001d3d] transition-colors whitespace-nowrap text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm Tài khoản Mới
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#f9fafb] border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider">Mã</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider text-center">Biểu tượng</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider">Tên tài khoản</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider">Loại</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider">Chủ tài khoản</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider whitespace-nowrap">Số tài khoản / Thông tin</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider">Đơn vị quản lý (BU)</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAccounts.map((account) => (
                                <tr key={account.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-[#004aad] text-sm whitespace-nowrap font-medium">[cite: {account.code}]</span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-center items-center">
                                        <div className="w-10 h-10 flex items-center justify-center grayscale hover:grayscale-0 transition-all opacity-80">
                                            {getTypeIcon(account.type)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 text-sm">{account.name}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm font-medium">{account.type}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm font-medium">{account.owner}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm font-medium">{account.accountInfo}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm font-medium">{account.buName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-sm text-[11px] font-bold inline-flex flex-col items-center leading-tight ${account.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-50 text-red-600'
                                            }`}>
                                            <span>Hoạt</span>
                                            <span>động</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setSelectedAccountForDetail(account)}
                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(account)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(account)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
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

                {/* Pagination placeholder */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <div>Hiển thị {filteredAccounts.length} kết quả</div>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-gray-200 rounded-md bg-gray-50 cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="px-3 py-1 bg-[#004aad] text-white rounded-md">1</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-5 border-b border-gray-200">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {editingAccount ? 'Chỉnh Sửa Tài Khoản' : 'Tạo Mới Tài Khoản'}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Vui lòng điền đầy đủ thông tin bên dưới.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 px-6 py-6">
                            <form onSubmit={handleSubmit} id="account-form" className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">Mã tài khoản</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all"
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                                            placeholder="Ví dụ: B001"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">Loại tài khoản</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            placeholder="Ví dụ: Ngân hàng, Thẻ tín dụng,..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">Tên tài khoản</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ví dụ: Techcombank Vốn KD"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">Chủ tài khoản</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all"
                                            value={formData.owner}
                                            onChange={e => setFormData({ ...formData, owner: e.target.value })}
                                            placeholder="Ví dụ: Công ty ABC"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">Số tài khoản / Thông tin</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all"
                                            value={formData.accountInfo}
                                            onChange={e => setFormData({ ...formData, accountInfo: e.target.value })}
                                            placeholder="Ví dụ: 1234567890"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">Số dư hiện tại</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all"
                                        placeholder="0"
                                        value={formData.balance}
                                        onChange={e => setFormData({ ...formData, balance: Number(e.target.value) })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">Đơn vị quản lý (BU)</label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all"
                                            value={formData.buName}
                                            onChange={e => setFormData({ ...formData, buName: e.target.value })}
                                        >
                                            <option value="Tất cả BU">Tất cả BU</option>
                                            {availableBUs.map(bu => (
                                                <option key={bu.id} value={bu.name}>{bu.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">Trạng thái</label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                            required
                                        >
                                            <option value="active">Đang hoạt động</option>
                                            <option value="locked">Đã khóa</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="border-t border-gray-200 px-6 py-4 flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-w-[140px]"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                form="account-form"
                                className="px-8 py-2.5 bg-[#004aad] hover:bg-[#1557A0] text-white rounded-lg transition-colors font-medium min-w-[140px]"
                            >
                                {editingAccount ? 'Xác nhận cập nhật' : 'Xác nhận tạo mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {showDeleteConfirm && deletingAccount && (
                <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4 text-left">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-bold text-gray-800">Xác nhận xóa</h3>
                                    <p className="text-sm text-gray-600">Bạn có chắc chắn muốn xóa tài khoản này?</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm text-gray-700 mb-1">
                                    <span className="font-semibold">Mã:</span> {deletingAccount.code}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-semibold">Tên:</span> {deletingAccount.name}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await paymentMethodService.delete(deletingAccount.id);
                                            await fetchData();
                                            setShowDeleteConfirm(false);
                                        } catch (error) {
                                            console.error('Delete error:', error);
                                            alert('Xóa thất bại. Vui lòng thử lại.');
                                        }
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                                >
                                    Xác nhận xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Detail View Modal */}
            {selectedAccountForDetail && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 md:p-8 backdrop-blur-md animate-in fade-in duration-300">
                    <ChiTietTaiKhoan
                        account={selectedAccountForDetail}
                        onClose={() => setSelectedAccountForDetail(null)}
                        onEdit={(account) => {
                            setSelectedAccountForDetail(null);
                            handleEdit(account);
                        }}
                        onToggleStatus={handleToggleStatus}
                    />
                </div>
            )}
        </div>
    );
}
