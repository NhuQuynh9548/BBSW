import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Edit2,
    Lock,
    Unlock,
    X,
    Briefcase,
    TrendingUp,
    TrendingDown,
    ArrowRightLeft,
    DollarSign,
    Landmark,
    Vault,
    Wallet,
    Calculator,
    History as HistoryIcon,
    CreditCard,
    CheckCircle,
    XCircle,
    Calendar,
    User as UserIcon
} from 'lucide-react';
import { transactionService } from '../../../services/transactionService';

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
    bankName?: string;
    branch?: string;
    openingBalance?: number;
    createdAt?: string;
    createdBy?: string;
    description?: string;
}

interface ChiTietTaiKhoanProps {
    account: Account;
    onClose: () => void;
    onEdit: (account: Account) => void;
    onToggleStatus: (account: Account) => void;
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'Ngân hàng': return <Landmark className="w-5 h-5" />;
        case 'Tiền mặt': return <Vault className="w-5 h-5" />;
        case 'Ví điện tử': return <Wallet className="w-5 h-5" />;
        case 'Thẻ tín dụng': return <CreditCard className="w-5 h-5" />;
        default: return <Landmark className="w-5 h-5" />;
    }
};

const getTypeColor = (type: string) => {
    switch (type) {
        case 'Ngân hàng': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'Tiền mặt': return 'bg-green-50 text-green-600 border-green-100';
        case 'Ví điện tử': return 'bg-purple-50 text-purple-600 border-purple-100';
        case 'Thẻ tín dụng': return 'bg-orange-50 text-orange-600 border-orange-100';
        default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
};

const getTransactionTypeIcon = (type: string) => {
    switch (type) {
        case 'INCOME': return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
        case 'EXPENSE': return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
        case 'TRANSFER': return <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />;
        case 'LOAN': return <DollarSign className="w-3.5 h-3.5 text-blue-400" />;
        default: return <DollarSign className="w-3.5 h-3.5 text-gray-400" />;
    }
};

const getTransactionTypeLabel = (type: string) => {
    switch (type) {
        case 'INCOME': return 'THU';
        case 'EXPENSE': return 'CHI';
        case 'TRANSFER': return 'DI CHUYỂN';
        case 'LOAN': return 'VAY';
        default: return type;
    }
};

// Trả về số tiền có dấu theo loại giao dịch:
// THU → dương (+), CHI → âm (-), VAY → null (không tính)
const getSignedAmount = (txn: any): number | null => {
    const type = txn.transactionType;
    const amount = Math.abs(txn.amount || 0);
    if (type === 'INCOME') return amount;
    if (type === 'EXPENSE') return -amount;
    return null; // VAY / LOAN không tính vào
};

const getObjectName = (txn: any) => {
    if (txn.partner) return txn.partner.name;
    if (txn.employee) return (txn.employee.fullName || txn.employee.name) || 'N/A';
    return 'N/A';
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    } catch (e) {
        return dateStr;
    }
};

export function ChiTietTaiKhoan({ account: initialAccount, onClose, onEdit, onToggleStatus }: ChiTietTaiKhoanProps) {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [account, setAccount] = useState<Account>(initialAccount);
    const [showAllTransactions, setShowAllTransactions] = useState(false);

    useEffect(() => {
        const enrichedAccount = {
            ...initialAccount,
            bankName: initialAccount.bankName || (initialAccount.type === 'Ngân hàng' ? 'Techcombank' : 'N/A'),
            branch: initialAccount.branch || (initialAccount.type === 'Ngân hàng' ? 'Chi nhánh Hà Nội' : 'N/A'),
            openingBalance: initialAccount.openingBalance ?? 0,
            createdAt: initialAccount.createdAt || '2023-01-15',
            createdBy: initialAccount.createdBy || 'Admin',
            description: initialAccount.description || 'Tài khoản dùng cho hoạt động kinh doanh chính của công ty.'
        };
        setAccount(enrichedAccount);
    }, [initialAccount]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const data = await transactionService.getAll();
                const filtered = data.filter((t: any) => t.paymentMethodId === account.id);

                if (filtered.length === 0) {
                    setTransactions([
                        {
                            id: 'T1',
                            transactionDate: '2023-11-20',
                            transactionCode: 'T20231120001',
                            transactionType: 'EXPENSE',
                            description: 'Thanh toán tiền điện tháng 10',
                            businessUnit: { name: 'Tất cả BU' },
                            partner: { name: 'Điện lực EVN' },
                            amount: -3500000,
                        },
                        {
                            id: 'T2',
                            transactionDate: '2023-11-19',
                            transactionCode: 'T20231119005',
                            transactionType: 'INCOME',
                            description: 'Nhận tiền tạm ứng từ khách hàng XYZ',
                            businessUnit: { name: 'Tất cả BU' },
                            partner: { name: 'Khách hàng XYZ' },
                            amount: 15000000,
                        },
                        {
                            id: 'T3',
                            transactionDate: '2023-11-18',
                            transactionCode: 'T20231118002',
                            transactionType: 'TRANSFER',
                            description: 'Chuyển sang TK Vietcombank',
                            businessUnit: { name: 'Tất cả BU' },
                            amount: -50000000,
                        }
                    ]);
                } else {
                    setTransactions(filtered);
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [account.id]);

    const isActive = account.status === 'active';
    // Chỉ hiển thị và tính toán trên giao dịch PAID (đồng bộ với QuanLyThuChi)
    const paidTransactions = transactions.filter(t =>
        t.paymentStatus === 'PAID' &&
        t.approvalStatus !== 'CANCELLED' &&
        t.approvalStatus !== 'REJECTED'
    );
    const displayedTransactions = showAllTransactions ? paidTransactions : paidTransactions.slice(0, 5);
    // CHI âm, THU dương, VAY không tính
    const totalTransactions = paidTransactions.reduce((sum, t) => {
        const signed = getSignedAmount(t);
        return signed !== null ? sum + signed : sum;
    }, 0);
    const computedBalance = (account.openingBalance || 0) + totalTransactions;

    return (
        <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">

            {/* ── HEADER ─────────────────────────────────── */}
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between">
                    {/* Left: Title */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Xem Chi Tiết Tài Khoản</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Thông tin chi tiết và lịch sử giao dịch.</p>
                    </div>
                    {/* Right: Actions + Close */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onEdit(account)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#004aad] hover:bg-[#1557A0] text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                            Sửa thông tin
                        </button>
                        <button
                            onClick={() => onToggleStatus(account)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${isActive
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                        >
                            {isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            {isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── BODY ──────────────────────────────────── */}
            <div className="overflow-y-auto flex-1 px-6 py-6 space-y-5 bg-gray-50">

                {/* Info Cards Row */}
                <div className="grid grid-cols-2 gap-4">

                    {/* LEFT: Basic Info */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Landmark className="w-4 h-4 text-[#004aad]" />
                            <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest">Thông tin cơ bản</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Mã tài khoản</p>
                                    <p className="text-base font-semibold text-gray-800">{account.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Loại tài khoản</p>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                                        {getTypeIcon(account.type)}
                                        {account.type}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Tên tài khoản</p>
                                <p className="text-base font-bold text-[#004aad]">{account.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Chủ tài khoản</p>
                                    <p className="text-base font-semibold text-gray-800">{account.owner}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Số tài khoản</p>
                                    <p className="text-base font-semibold text-gray-800 font-mono">{account.accountInfo}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Đơn vị quản lý</p>
                                <div className="flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                    <p className="text-base font-semibold text-gray-800">{account.buName}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Financial Info */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calculator className="w-4 h-4 text-[#004aad]" />
                            <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest">Thông tin tài chính</h3>
                        </div>
                        <div className="space-y-4">
                            {/* Balance */}
                            <div>
                                <p className="text-sm text-gray-400 mb-1.5">Số dư hiện tại</p>
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-baseline justify-between">
                                    <span className="text-3xl font-black text-[#004aad] tracking-tight">{formatCurrency(computedBalance)}</span>
                                    <span className="text-base text-blue-400 ml-2">VND</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">
                                    = Số dư ban đầu ({formatCurrency(account.openingBalance || 0)}) + Tổng thu/chi ({totalTransactions >= 0 ? '+' : ''}{formatCurrency(totalTransactions)}) — VAY không tính
                                </p>
                            </div>
                            {/* Status + Opening Balance */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Trạng thái</p>
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${isActive
                                        ? 'bg-green-50 border-green-100 text-green-700'
                                        : 'bg-red-50 border-red-100 text-red-700'
                                        }`}>
                                        {isActive
                                            ? <CheckCircle className="w-4 h-4" />
                                            : <XCircle className="w-4 h-4" />
                                        }
                                        {isActive ? 'Hoạt động' : 'Đã khóa'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Số dư ban đầu</p>
                                    <p className="text-base font-semibold text-gray-800">
                                        {formatCurrency(account.openingBalance || 0)} <span className="text-sm text-gray-400">VND</span>
                                    </p>
                                </div>
                            </div>
                            {/* Created info */}
                            <div className="pt-3 border-t border-gray-100">
                                <p className="text-sm text-gray-400 mb-1.5">Thông tin tạo</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-base font-semibold text-gray-800">{account.createdBy}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{account.createdAt}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HistoryIcon className="w-4 h-4 text-[#004aad]" />
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Lịch sử giao dịch</h3>
                        </div>
                        {paidTransactions.length > 5 && (
                            <button
                                onClick={() => setShowAllTransactions(!showAllTransactions)}
                                className="text-xs font-bold text-[#004aad] hover:underline bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                            >
                                {showAllTransactions ? 'Thu gọn' : `Xem tất cả (${paidTransactions.length})`}
                            </button>
                        )}
                    </div>
                    <div className="overflow-auto max-h-72">
                        <table className="w-full text-left min-w-[620px]">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-5 py-3 text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Ngày</th>
                                    <th className="px-5 py-3 text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Mã GD</th>
                                    <th className="px-5 py-3 text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Loại GD</th>
                                    <th className="px-5 py-3 text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Đối tượng</th>
                                    <th className="px-5 py-3 text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">BU</th>
                                    <th className="px-5 py-3 text-sm font-bold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Số tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-base text-gray-400">Đang tải dữ liệu...</td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-base text-gray-400">Chưa có dữ liệu giao dịch</td>
                                    </tr>
                                ) : (
                                    displayedTransactions.map((txn) => (
                                        <tr key={txn.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-5 py-3.5 text-base text-gray-600 whitespace-nowrap">{formatDate(txn.transactionDate)}</td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <button
                                                    onClick={() => navigate(`/quan-ly-thu-chi?highlight=${txn.id}&t=${Date.now()}`)}
                                                    className="text-sm font-bold text-[#004aad] bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors font-mono"
                                                >
                                                    {txn.transactionCode}
                                                </button>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    {getTransactionTypeIcon(txn.transactionType)}
                                                    <span className={`text-sm font-bold uppercase ${txn.transactionType === 'INCOME' ? 'text-green-600' :
                                                        txn.transactionType === 'EXPENSE' ? 'text-red-500' : 'text-blue-600'
                                                        }`}>
                                                        {getTransactionTypeLabel(txn.transactionType)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-base font-medium text-gray-700 whitespace-nowrap max-w-[160px] truncate">{getObjectName(txn)}</td>
                                            <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{txn.businessUnit?.name || 'N/A'}</td>
                                            <td className={`px-5 py-3.5 text-base font-bold text-right whitespace-nowrap ${getSignedAmount(txn) === null ? 'text-blue-500'
                                                : getSignedAmount(txn)! > 0 ? 'text-green-600'
                                                    : 'text-red-500'
                                                }`}>
                                                {getSignedAmount(txn) === null
                                                    ? formatCurrency(Math.abs(txn.amount || 0))
                                                    : getSignedAmount(txn)! > 0
                                                        ? `+${formatCurrency(getSignedAmount(txn)!)}`
                                                        : `-${formatCurrency(Math.abs(getSignedAmount(txn)!))}`
                                                }
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {!loading && transactions.length > 0 && (
                                <tfoot>
                                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                                        <td colSpan={5} className="px-5 py-3 text-sm font-bold text-gray-600 uppercase tracking-wider">Tổng cộng</td>
                                        <td className={`px-5 py-3 text-base font-black text-right whitespace-nowrap ${totalTransactions >= 0 ? 'text-green-600' : 'text-red-500'
                                            }`}>
                                            {totalTransactions >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalTransactions))}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>

            {/* ── FOOTER ─────────────────────────────────── */}
            <div className="border-t border-gray-100 px-6 py-4 flex justify-center bg-white">
                <button
                    onClick={onClose}
                    className="px-10 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm shadow-sm"
                >
                    Đóng cửa sổ
                </button>
            </div>
        </div>
    );
}
