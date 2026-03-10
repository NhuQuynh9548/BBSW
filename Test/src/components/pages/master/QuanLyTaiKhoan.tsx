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
    Eye,
    Building2,
    RotateCcw,
    Users,
    Save
} from 'lucide-react';
import { paymentMethodService } from '../../../services/paymentMethodService';
import { businessUnitService } from '../../../services/businessUnitService';
import { ChiTietTaiKhoan } from './ChiTietTaiKhoan';
import { useApp } from '../../../contexts/AppContext';

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
    openingBalance?: number;
    logo?: string;
}

export function QuanLyTaiKhoan() {
    const { selectedBU, canSelectBU, currentUser } = useApp();

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterBU, setFilterBU] = useState<string>('all');

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
        openingBalance: 0,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
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
                openingBalance: Number(m.openingBalance || 0),
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
            setError('Không thể tải danh sách tài khoản. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Sync filterBU with selectedBU from global context
    useEffect(() => {
        setFilterBU(selectedBU === 'all' ? 'Tất cả BU' : (availableBUs.find(b => b.id === selectedBU)?.name || 'Tất cả BU'));
    }, [selectedBU, availableBUs]);

    const filteredAccounts = accounts.filter(account => {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesSearch =
            account.name.toLowerCase().includes(searchLower) ||
            account.code.toLowerCase().includes(searchLower) ||
            account.accountInfo.toLowerCase().includes(searchLower) ||
            account.owner.toLowerCase().includes(searchLower);

        const matchesStatus = filterStatus === 'all' || account.status === filterStatus;
        const matchesType = filterType === 'all' || account.type === filterType;

        const effectiveFilterBU = selectedBU !== 'all' ? (availableBUs.find(b => b.id === selectedBU)?.name || 'Tất cả BU') : filterBU;
        const matchesBU = effectiveFilterBU === 'Tất cả BU' || account.buName === effectiveFilterBU || account.buName === 'Tất cả BU';

        return matchesSearch && matchesStatus && matchesType && matchesBU;
    });

    const stats = {
        bank: accounts.filter(a => a.type === 'Ngân hàng').reduce((sum, a) => sum + (a.balance || 0), 0),
        cash: accounts.filter(a => a.type === 'Tiền mặt').reduce((sum, a) => sum + (a.balance || 0), 0),
        wallet: accounts.filter(a => a.type === 'Ví điện tử').reduce((sum, a) => sum + (a.balance || 0), 0),
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);

    const handleClearFilter = () => {
        setSearchTerm('');
        setDebouncedSearch('');
        setFilterBU('Tất cả BU');
        setFilterType('all');
        setFilterStatus('all');
        setCurrentPage(1);
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
            openingBalance: 0,
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
            openingBalance: account.openingBalance || 0,
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
            case 'Ngân hàng': return <Landmark className="w-6 h-6 text-gray-400" />;
            case 'Tiền mặt': return <Vault className="w-6 h-6 text-gray-400" />;
            case 'Ví điện tử': return <Wallet className="w-6 h-6 text-gray-400" />;
            case 'Thẻ tín dụng': return <Edit2 className="w-6 h-6 text-gray-400" />;
            default: return <Landmark className="w-6 h-6 text-gray-400" />;
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản Lý Tài Khoản</h1>
                <p className="text-gray-600">
                    Quản lý danh mục tài khoản tiền mặt, ngân hàng, và ví điện tử của hệ thống BLUEBOLT
                    {!canSelectBU && currentUser.buName && (
                        <span className="ml-2 text-sm font-semibold text-[#F7931E]">
                            (Chỉ xem {currentUser.buName})
                        </span>
                    )}
                    {canSelectBU && selectedBU !== 'all' && (
                        <span className="ml-2 text-sm font-semibold text-[#004aad]">
                            (Đang xem: {selectedBU})
                        </span>
                    )}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Ngân hàng */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                    const bankAccount = accounts.find(a => a.type === 'Ngân hàng');
                    if (bankAccount) setSelectedAccountForDetail(bankAccount);
                }}>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex-shrink-0">
                        <Landmark className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Tài khoản Ngân hàng</h3>
                        <p className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.bank)}</p>
                        <p className="text-[#004aad] text-xs font-semibold mt-1">
                            Xem chi tiết &rarr;
                        </p>
                    </div>
                </div>

                {/* Tiền mặt */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                    const cashAccount = accounts.find(a => a.type === 'Tiền mặt');
                    if (cashAccount) setSelectedAccountForDetail(cashAccount);
                }}>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex-shrink-0">
                        <Vault className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Tài khoản Tiền mặt</h3>
                        <p className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.cash)}</p>
                        <p className="text-[#004aad] text-xs font-semibold mt-1">
                            Xem chi tiết &rarr;
                        </p>
                    </div>
                </div>

                {/* Ví điện tử */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                    const walletAccount = accounts.find(a => a.type === 'Ví điện tử');
                    if (walletAccount) setSelectedAccountForDetail(walletAccount);
                }}>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex-shrink-0">
                        <Wallet className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Ví điện tử</h3>
                        <p className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.wallet)}</p>
                        <p className="text-[#004aad] text-xs font-semibold mt-1">
                            Xem chi tiết &rarr;
                        </p>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004aad]"></div>
                    <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Filter Bar */}
                    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm: mã, tên, số tài khoản, thông tin..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent text-sm"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Filter Dropdowns */}
                            <div className="flex flex-wrap gap-4">
                                {canSelectBU && (
                                    <select
                                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent bg-white text-sm"
                                        value={filterBU}
                                        onChange={e => setFilterBU(e.target.value)}
                                    >
                                        <option value="Tất cả BU">Tất cả đơn vị</option>
                                        {availableBUs.map(bu => (
                                            <option key={bu.id} value={bu.name}>{bu.name}</option>
                                        ))}
                                    </select>
                                )}

                                <select
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent bg-white text-sm"
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="active">Hoạt động</option>
                                    <option value="locked">Đã khóa</option>
                                </select>

                                <select
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent bg-white text-sm"
                                    value={filterType}
                                    onChange={e => setFilterType(e.target.value)}
                                >
                                    <option value="all">Tất cả loại</option>
                                    <option value="Ngân hàng">Ngân hàng</option>
                                    <option value="Tiền mặt">Tiền mặt</option>
                                    <option value="Ví điện tử">Ví điện tử</option>
                                    <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                                </select>

                                <button
                                    onClick={handleClearFilter}
                                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    title="Xóa bộ lọc"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={handleAdd}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#004aad] hover:bg-[#1557A0] text-white rounded-lg transition-colors shadow-md"
                                >
                                    <Plus className="w-5 h-5" />
                                    Thêm Tài Khoản
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#f9fafb] border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider text-center w-24">Hành động</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider">Mã</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider">Tên tài khoản</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider">Loại</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider whitespace-nowrap">Số tài khoản / TT</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider">Đơn vị quản lý (BU)</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#667085] uppercase tracking-wider">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginatedAccounts.map((account) => (
                                        <tr key={account.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedAccountForDetail(account)}
                                                        className="p-1.5 text-gray-600 hover:bg-gray-100 hover:text-[#004aad] rounded-md transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(account)}
                                                        className="p-1.5 text-gray-600 hover:bg-gray-100 hover:text-[#004aad] rounded-md transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(account)}
                                                        className="p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 flex items-center justify-center grayscale hover:grayscale-0 transition-all opacity-80 shrink-0">
                                                        {getTypeIcon(account.type)}
                                                    </div>
                                                    <span className="text-[#004aad] font-bold text-sm cursor-pointer hover:underline" onClick={() => setSelectedAccountForDetail(account)}>
                                                        {account.code}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 text-sm whitespace-nowrap">{account.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">{account.owner}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">{account.type}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 text-sm font-medium">{account.accountInfo}</td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">{account.buName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${account.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {account.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                                                    {account.status !== 'active' && <Lock className="w-3 h-3" />}
                                                    {account.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {paginatedAccounts.length === 0 && (
                            <div className="text-center py-12">
                                <Landmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Không tìm thấy tài khoản nào phù hợp.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between text-sm text-gray-500 bg-white rounded-b-xl">
                                <div>
                                    Hiển thị <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(endIndex, filteredAccounts.length)}</span> trong tổng số <span className="font-semibold">{filteredAccounts.length}</span> tài khoản
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1 rounded-md transition-colors font-medium ${currentPage === page
                                                ? 'bg-[#004aad] text-white'
                                                : 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Add/Edit Modal (Matching QuanLyThuChi/QuanLyNhanSu layout) */}
            {showModal && (
                <div className="modal-overlay-container">
                    <div className="modal-content-container max-w-3xl">
                        {/* Modal Header */}
                        <div className="border-b border-gray-200 px-6 py-5 flex items-start justify-between bg-white shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingAccount ? 'Chỉnh Sửa Thông Tin Tài Khoản' : 'Thêm Tài Khoản Mới'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Vui lòng điền đầy đủ thông tin bên dưới (* là bắt buộc)
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 px-6 py-6 bg-gray-50">
                            <form onSubmit={handleSubmit} id="account-form">
                                <div className="space-y-6">
                                    {/* SECTION 1: CƠ BẢN */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                            <span className="w-1 h-4 bg-primary rounded-full"></span>
                                            Thông tin cơ bản
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                                                    <span className="text-red-500">*</span> Mã tài khoản
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all placeholder:text-sm"
                                                    value={formData.code}
                                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                                    placeholder="VD: B001"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                                                    <span className="text-red-500">*</span> Loại tài khoản
                                                </label>
                                                <select
                                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all"
                                                    value={formData.type}
                                                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                                    required
                                                >
                                                    <option value="Ngân hàng">Ngân hàng</option>
                                                    <option value="Tiền mặt">Tiền mặt</option>
                                                    <option value="Ví điện tử">Ví điện tử</option>
                                                    <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                                                <span className="text-red-500">*</span> Tên tài khoản
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all placeholder:text-sm"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Ví dụ: Techcombank Vốn KD"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* SECTION 2: CHI TIẾT */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                            <span className="w-1 h-4 bg-primary rounded-full"></span>
                                            Thông tin chi tiết
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                                                    <span className="text-red-500">*</span> Chủ tài khoản / Người quản lý
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all placeholder:text-sm"
                                                    value={formData.owner}
                                                    onChange={e => setFormData({ ...formData, owner: e.target.value })}
                                                    placeholder="VD: Công ty ABC"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                                                    <span className="text-red-500">*</span> Số tài khoản / TT liên hệ
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all placeholder:text-sm"
                                                    value={formData.accountInfo}
                                                    onChange={e => setFormData({ ...formData, accountInfo: e.target.value })}
                                                    placeholder="VD: 1902... / techcombank@..."
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1 col-span-2 mt-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                                                    Số dư ban đầu (VNĐ)
                                                </label>
                                                <input
                                                    type="number"
                                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all placeholder:text-sm text-right"
                                                    placeholder="0"
                                                    value={formData.openingBalance || ''}
                                                    onChange={e => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
                                                />
                                                <p className="text-xs text-gray-500 italic">Ghi chú: Số dư hiện tại sẽ được tự động tính từ số dư ban đầu trừ tổng các giao dịch.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 3: TÌNH TRẠNG */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                            <span className="w-1 h-4 bg-primary rounded-full"></span>
                                            Tổ chức & Trạng thái
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                                                    <span className="text-red-500">*</span> Đơn vị quản lý (BU)
                                                </label>
                                                <select
                                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all text-sm"
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
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                                                    <span className="text-red-500">*</span> Trạng thái
                                                </label>
                                                <select
                                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] outline-none transition-all text-sm"
                                                    value={formData.status}
                                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                                    required
                                                >
                                                    <option value="active">Đang hoạt động</option>
                                                    <option value="locked">Đã khóa</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-white shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                form="account-form"
                                className="px-6 py-2.5 bg-[#004aad] hover:bg-[#1557A0] text-white rounded-lg transition-colors font-semibold text-sm shadow-md"
                            >
                                <div className="flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    {editingAccount ? 'Cập nhật' : 'Xác nhận tạo mới'}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal (Matching QuanLyNhanSu layout) */}
            {showDeleteConfirm && deletingAccount && (
                <div className="modal-overlay-container">
                    <div className="modal-content-container max-w-md">
                        <div className="p-8">
                            <div className="flex flex-col items-center text-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Xác nhận xóa tài khoản</h3>
                                    <p className="text-sm text-gray-500 mt-1">Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100">
                                <p className="text-sm text-gray-700 flex justify-between py-1 border-b border-dashed border-slate-200">
                                    <span className="font-semibold text-gray-500">Mã TK:</span>
                                    <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[60%] text-right" title={deletingAccount.code}>{deletingAccount.code}</span>
                                </p>
                                <p className="text-sm text-gray-700 flex justify-between py-1 border-b border-dashed border-slate-200 mt-1">
                                    <span className="font-semibold text-gray-500">Tên:</span>
                                    <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[60%] text-right" title={deletingAccount.name}>{deletingAccount.name}</span>
                                </p>
                                <p className="text-sm text-gray-700 flex justify-between py-1 mt-1">
                                    <span className="font-semibold text-gray-500">Đơn vị:</span>
                                    <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[60%] text-right" title={deletingAccount.buName}>{deletingAccount.buName}</span>
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
                                >
                                    Hủy bỏ
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
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold text-sm shadow-lg shadow-red-100"
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
                <div className="modal-overlay-container">
                    <div className="modal-content-container max-w-4xl">
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
                </div>
            )}
        </div>
    );
}
