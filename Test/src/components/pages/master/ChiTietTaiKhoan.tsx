import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Edit2,
    Lock,
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
    History as HistoryIcon
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
        case 'Ngân hàng': return <Landmark className="w-6 h-6 text-[#004aad]" />;
        case 'Tiền mặt': return <Vault className="w-6 h-6 text-[#004aad]" />;
        case 'Ví điện tử': return <Wallet className="w-6 h-6 text-[#004aad]" />;
        case 'Thẻ tín dụng': return <Edit2 className="w-6 h-6 text-[#004aad]" />;
        default: return <Landmark className="w-6 h-6 text-[#004aad]" />;
    }
};

const getTransactionTypeIcon = (type: string) => {
    switch (type) {
        case 'INCOME': return <TrendingUp className="w-3 h-3 text-green-500" />;
        case 'EXPENSE': return <TrendingDown className="w-3 h-3 text-red-500" />;
        case 'TRANSFER': return <ArrowRightLeft className="w-3 h-3 text-blue-500" />;
        default: return <DollarSign className="w-3 h-3 text-gray-400" />;
    }
};

const getTransactionTypeLabel = (type: string) => {
    switch (type) {
        case 'INCOME': return 'THU';
        case 'EXPENSE': return 'CHI';
        case 'TRANSFER': return 'DI CHUYỂN';
        default: return type;
    }
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

    const handleViewAllTransactions = () => {
        setShowAllTransactions(!showAllTransactions);
    };

    useEffect(() => {
        const enrichedAccount = {
            ...initialAccount,
            bankName: initialAccount.bankName || (initialAccount.type === 'Ngân hàng' ? 'Techcombank' : 'N/A'),
            branch: initialAccount.branch || (initialAccount.type === 'Ngân hàng' ? 'Chi nhánh Hà Nội' : 'N/A'),
            openingBalance: initialAccount.openingBalance || 100000000,
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
                // Store all related transactions, let the UI handle slicing
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


    return (
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Xem Chi Tiết Tài Khoản
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Thông tin chi tiết và lịch sử giao dịch.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 px-6 py-6 custom-scrollbar">

                {/* Action Bar */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => onEdit(account)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-xs shadow-sm"
                    >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                        SỬA THÔNG TIN
                    </button>
                    <button
                        onClick={() => onToggleStatus(account)}
                        className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-xs shadow-sm ${account.status === 'active' ? 'text-red-600' : 'text-green-600'
                            }`}
                    >
                        <Lock className="w-4 h-4" />
                        {account.status === 'active' ? 'KHÓA TÀI KHOẢN' : 'MỞ KHÓA TÀI KHOẢN'}
                    </button>
                    <div className="ml-auto" />
                </div>

                <div className="space-y-8">
                    {/* Information Sections */}
                    <div className="grid grid-cols-2 gap-0 border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white mb-6">
                        {/* Section 1: Basic Info */}
                        <div className="p-6 space-y-5 border-r border-gray-100">
                            <h3 className="text-[12px] font-bold text-[#004aad] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Landmark className="w-4 h-4" /> Thông tin cơ bản
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-tight">Mã tài khoản</label>
                                    <p className="text-[14px] font-bold text-gray-900">{account.code}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-tight">Loại tài khoản</label>
                                    <p className="text-[14px] font-bold text-gray-900">{account.type}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-tight">Tên tài khoản</label>
                                <p className="text-[15px] font-bold text-[#004aad] uppercase tracking-tight">{account.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-tight">Chủ tài khoản</label>
                                    <p className="text-[14px] font-bold text-gray-900">{account.owner}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-tight">Số tài khoản / Thông tin</label>
                                    <p className="text-[14px] font-bold text-gray-900 tracking-wider font-mono">{account.accountInfo}</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Financial Info */}
                        <div className="p-6 space-y-5 bg-gray-50/30">
                            <h3 className="text-[12px] font-bold text-[#004aad] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Calculator className="w-4 h-4" /> Thông tin tài chính
                            </h3>
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-tight">Số dư hiện tại</label>
                                <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex justify-between items-baseline group hover:border-[#004aad] transition-colors">
                                    <span className="text-[28px] font-bold text-[#004aad] tracking-tighter">{formatCurrency(account.balance || 0)}</span>
                                    <span className="text-[12px] font-bold text-gray-400 italic ml-2">VND</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6 pt-1">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-tight">Trạng thái</label>
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold border uppercase tracking-wider shadow-sm ${account.status === 'active'
                                        ? 'bg-green-50 border-green-100 text-green-700'
                                        : 'bg-red-50 border-red-100 text-red-700'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${account.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        {account.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-500 mb-1.5 uppercase tracking-tight">Số dư ban đầu</label>
                                    <p className="text-[14px] font-bold text-gray-900">{formatCurrency(account.openingBalance || 0)} <span className="text-[10px] text-gray-400 italic">VND</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Management Info */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center divide-x divide-gray-100">
                        <div className="flex-1 px-2 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 shrink-0">
                                <Briefcase className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-tight mb-0.5">Đơn vị quản lý</label>
                                <p className="text-[14px] font-bold text-gray-900 uppercase tracking-tight">{account.buName}</p>
                            </div>
                        </div>
                        <div className="flex-1 px-6">
                            <label className="block text-sm font-semibold text-gray-500 uppercase tracking-tight mb-1.5">Thông tin tạo</label>
                            <div className="flex items-center gap-2">
                                <span className="text-[14px] font-bold text-gray-900">{account.createdBy}</span>
                                <span className="text-[12px] text-gray-400 font-medium tracking-tight bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{account.createdAt}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Transaction History */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[12px] font-bold text-[#004aad] uppercase tracking-widest flex items-center gap-2">
                                <HistoryIcon className="w-4 h-4" /> Lịch sử giao dịch gần đây
                            </h3>
                            <button
                                onClick={handleViewAllTransactions}
                                className="text-[9px] font-bold text-[#004aad] hover:underline uppercase tracking-widest bg-[#004aad]/5 px-2 py-1 rounded"
                            >
                                {showAllTransactions ? 'THU GỌN' : 'XEM TẤT CẢ GIAO DỊCH'}
                            </button>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Ngày</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Mã GD</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Loại</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Đối tượng</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">BU</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Số tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-xs font-bold text-gray-400 uppercase italic">
                                                Chưa có dữ liệu giao dịch
                                            </td>
                                        </tr>
                                    ) : (
                                        (showAllTransactions ? transactions : transactions.slice(0, 5)).map((txn) => (
                                            <tr key={txn.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-4 py-3.5 text-xs font-bold text-gray-600">{formatDate(txn.transactionDate)}</td>
                                                <td className="px-4 py-3.5 text-xs font-black text-blue-600 uppercase tracking-tighter">{txn.transactionCode}</td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        {getTransactionTypeIcon(txn.transactionType)}
                                                        <span className={`text-[10px] font-black uppercase tracking-tight ${txn.transactionType === 'INCOME' ? 'text-green-600' :
                                                            txn.transactionType === 'EXPENSE' ? 'text-red-500' : 'text-blue-600'
                                                            }`}>
                                                            {getTransactionTypeLabel(txn.transactionType)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-xs font-bold text-gray-700 truncate">{getObjectName(txn)}</td>
                                                <td className="px-4 py-3.5 text-[10px] font-black text-gray-500 uppercase truncate">{txn.businessUnit?.name || 'N/A'}</td>
                                                <td className={`px-4 py-3.5 text-xs font-black text-right ${txn.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {txn.amount > 0 ? '+' : ''}{formatCurrency(txn.amount)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-5 flex justify-center bg-gray-50/30">
                <button
                    onClick={onClose}
                    className="px-16 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-100 transition-colors font-black text-xs uppercase tracking-widest shadow-sm"
                >
                    Đóng cửa sổ
                </button>
            </div>
        </div>
    );
}
