import React, { useState, useEffect } from 'react';
import { X, FileText, Phone, Mail, Building2, Trash2, Plus, AlertCircle } from 'lucide-react';
import { partnerService } from '../../services/partnerService';
import { paymentMethodService } from '../../services/paymentMethodService';
import { useApp } from '../../contexts/AppContext';

interface BankAccount {
    id?: string;
    accountNumber: string;
    bankName: string;
    branch: string;
    swiftCode: string;
    isDefault: boolean;
}

interface Contract {
    id?: string;
    contractNumber: string;
    signDate: string;
    expiryDate: string;
    value: number;
    fileName: string;
}

interface Partner {
    id: string;
    partnerId: string;
    partnerName: string;
    partnerType: 'CUSTOMER' | 'SUPPLIER' | 'BOTH';
    taxCode: string;
    phone: string;
    contactPerson: string;
    status: 'ACTIVE' | 'INACTIVE';
    address: string;
    email: string;
    representativeName: string;
    representativeTitle: string;
    representativePhone: string;
    bankAccounts: BankAccount[];
    paymentMethodId: string | null;
    paymentMethod?: { id: string; name: string };
    businessUnitIds?: string[];
    businessUnits?: { id: string, name: string }[];
    paymentTerm: number;
    contracts: Contract[];
    balance: number;
}

type ModalMode = 'create' | 'view' | 'edit';

interface PartnerFormModalProps {
    mode: ModalMode | null;
    selectedPartner?: Partner | null;
    allPartners?: Partner[]; // Optional, used for ID generation
    onClose: () => void;
    onSuccess: (newPartner?: any) => void;
}

export function PartnerFormModal({ mode, selectedPartner, allPartners = [], onClose, onSuccess }: PartnerFormModalProps) {
    const { currentUser, availableBUs } = useApp();
    const [loading, setLoading] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'info' | 'contracts'>('info');

    // Form data
    const [formData, setFormData] = useState<Partial<Partner>>({
        partnerId: '',
        partnerName: '',
        partnerType: 'CUSTOMER',
        taxCode: '',
        phone: '',
        contactPerson: '',
        status: 'ACTIVE',
        address: '',
        email: '',
        representativeName: '',
        representativeTitle: '',
        representativePhone: '',
        bankAccounts: [],
        paymentMethodId: '',
        businessUnitIds: [],
        paymentTerm: 30,
        contracts: [],
        balance: 0,
    });

    // Fetch initial data
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const pms = await paymentMethodService.getAll();
                setPaymentMethods(pms);
                // Set default PM if creating
                if (mode === 'create' && pms.length > 0 && !formData.paymentMethodId) {
                    setFormData(prev => ({ ...prev, paymentMethodId: pms[0].id }));
                }
            } catch (err) {
                console.error('Error fetching payment methods:', err);
            }
        };
        fetchPaymentMethods();
    }, [mode]);

    // Handle initial state and selectedPartner changes
    useEffect(() => {
        if (selectedPartner && (mode === 'edit' || mode === 'view')) {
            setFormData({
                ...selectedPartner,
                businessUnitIds: selectedPartner.businessUnits?.map(bu => bu.id) || selectedPartner.businessUnitIds || []
            });
        } else if (mode === 'create') {
            // Re-initialize for creation
            const type = formData.partnerType || 'CUSTOMER';
            const filtered = allPartners.filter(p => p.partnerType === type);
            const prefix = type === 'CUSTOMER' ? 'KH' : type === 'SUPPLIER' ? 'NCC' : 'DT';
            const initialId = `${prefix}${String(filtered.length + 1).padStart(3, '0')}`;

            setFormData({
                partnerId: initialId,
                partnerName: '',
                partnerType: 'CUSTOMER',
                taxCode: '',
                phone: '',
                contactPerson: '',
                status: 'ACTIVE',
                address: '',
                email: '',
                representativeName: '',
                representativeTitle: '',
                representativePhone: '',
                bankAccounts: [],
                paymentMethodId: paymentMethods.length > 0 ? paymentMethods[0].id : '',
                businessUnitIds: currentUser.role === 'Trưởng BU' ? (currentUser.buId ? [currentUser.buId] : []) : [],
                paymentTerm: 30,
                contracts: [],
                balance: 0,
            });
        }
    }, [selectedPartner, mode]);

    // Update partnerId when type changes (only in Create mode)
    useEffect(() => {
        if (mode === 'create' && formData.partnerType) {
            const type = formData.partnerType;
            const filtered = allPartners.filter(p => p.partnerType === type);
            const prefix = type === 'CUSTOMER' ? 'KH' : type === 'SUPPLIER' ? 'NCC' : 'DT';
            const newId = `${prefix}${String(filtered.length + 1).padStart(3, '0')}`;

            setFormData(prev => ({ ...prev, partnerId: newId }));
        }
    }, [formData.partnerType, mode, allPartners]);

    const addBankAccount = () => {
        setFormData({
            ...formData,
            bankAccounts: [
                ...(formData.bankAccounts || []),
                { accountNumber: '', bankName: '', branch: '', swiftCode: '', isDefault: false }
            ]
        });
    };

    const removeBankAccount = (index: number) => {
        const newBankAccounts = formData.bankAccounts?.filter((_, i) => i !== index) || [];
        setFormData({ ...formData, bankAccounts: newBankAccounts });
    };

    const updateBankAccount = (index: number, field: keyof BankAccount, value: string | boolean) => {
        const newBankAccounts = [...(formData.bankAccounts || [])];
        if (field === 'isDefault' && value === true) {
            newBankAccounts.forEach((acc, i) => {
                acc.isDefault = i === index;
            });
        } else {
            newBankAccounts[index] = { ...newBankAccounts[index], [field]: value } as any;
        }
        setFormData({ ...formData, bankAccounts: newBankAccounts });
    };

    const addContract = () => {
        setFormData({
            ...formData,
            contracts: [
                ...(formData.contracts || []),
                { contractNumber: '', signDate: new Date().toISOString().split('T')[0], expiryDate: '', value: 0, fileName: '' }
            ]
        });
    };

    const removeContract = (index: number) => {
        const newContracts = formData.contracts?.filter((_, i) => i !== index) || [];
        setFormData({ ...formData, contracts: newContracts });
    };

    const updateContract = (index: number, field: keyof Contract, value: string | number) => {
        const newContracts = [...(formData.contracts || [])];
        newContracts[index] = { ...newContracts[index], [field]: value } as any;
        setFormData({ ...formData, contracts: newContracts });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate tax code
        if (formData.taxCode && (formData.taxCode.length < 10 || formData.taxCode.length > 13)) {
            alert('Mã số thuế phải có từ 10-13 chữ số');
            return;
        }

        try {
            setLoading(true);
            const { businessUnits, businessUnit, paymentMethod, ...restOfFormData } = formData as any;
            const payload = {
                ...restOfFormData,
                bankAccounts: formData.bankAccounts?.map(({ id, ...rest }: any) => rest),
                contracts: formData.contracts?.map(({ id, ...rest }: any) => rest),
                paymentMethodId: formData.paymentMethodId || undefined,
                businessUnitIds: formData.businessUnitIds || [],
            };

            let savedPartner;
            if (mode === 'create') {
                savedPartner = await partnerService.create(payload);
            } else if (mode === 'edit' && selectedPartner) {
                savedPartner = await partnerService.update(selectedPartner.id, payload);
            }

            onSuccess(savedPartner);
        } catch (err: any) {
            console.error('Submit failed', err);
            alert('Có lỗi xảy ra khi lưu đối tác. ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const isReadOnly = mode === 'view';

    return (
        <div className="modal-overlay-container">
            <div className="modal-content-container max-w-6xl">
                <div className="border-b border-gray-200 px-6 py-5 bg-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {mode === 'create' && 'Thêm Đối Tác Mới'}
                                {mode === 'view' && 'Xem Thông Tin Đối Tác'}
                                {mode === 'edit' && 'Chỉnh Sửa Thông Tin Đối Tác'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {mode === 'view' ? 'Thông tin chi tiết đối tác (360° View)' : 'Vui lòng điền đầy đủ thông tin bên dưới'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'info'
                                ? 'bg-[#004aad]/10 text-[#004aad] shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            Thông tin chung
                        </button>
                        <button
                            onClick={() => setActiveTab('contracts')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'contracts'
                                ? 'bg-[#004aad]/10 text-[#004aad] shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            Hợp đồng & Lịch sử
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-6 scrollbar-thin scrollbar-thumb-gray-300">
                    <form onSubmit={handleSubmit} id="partner-form">
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                {/* Cơ bản */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 pb-2 border-b border-gray-200">
                                        Thông tin cơ bản
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mã Đối Tác (Auto)</label>
                                            <input
                                                type="text"
                                                value={formData.partnerId}
                                                disabled
                                                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2"><span className="text-red-500">*</span> Tên Đối Tác</label>
                                            <input
                                                type="text"
                                                value={formData.partnerName}
                                                onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                                                placeholder="Công ty TNHH ABC"
                                                disabled={isReadOnly}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent focus:bg-white transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2"><span className="text-red-500">*</span> Loại Đối Tác</label>
                                            <select
                                                value={formData.partnerType}
                                                onChange={(e) => setFormData({ ...formData, partnerType: e.target.value as any })}
                                                disabled={isReadOnly}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent focus:bg-white transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                                required
                                            >
                                                <option value="CUSTOMER">Khách hàng</option>
                                                <option value="SUPPLIER">Nhà cung cấp</option>
                                                <option value="BOTH">Cả hai (KH & NCC)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-500" />
                                                <span className="text-red-500">*</span> Mã Số Thuế (10-13 số)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.taxCode}
                                                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value.replace(/\D/g, '') })}
                                                placeholder="0123456789"
                                                maxLength={13}
                                                disabled={isReadOnly}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent focus:bg-white transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                <span className="text-red-500">*</span> Số Điện Thoại
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="0281234567"
                                                disabled={isReadOnly}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent focus:bg-white transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                <span className="text-red-500">*</span> Email Nhận Hóa Đơn
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="invoice@company.com"
                                                disabled={isReadOnly}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent focus:bg-white transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-gray-500" />
                                                <span className="text-red-500">*</span> BU Phụ Trách
                                            </label>
                                            <div className={`grid grid-cols-2 gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 ${isReadOnly ? 'opacity-75' : ''}`}>
                                                {availableBUs.filter(bu => bu.id !== 'all').map(bu => (
                                                    <label key={bu.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.businessUnitIds?.includes(bu.id) || false}
                                                            onChange={(e) => {
                                                                const currentIds = formData.businessUnitIds || [];
                                                                if (e.target.checked) {
                                                                    setFormData({ ...formData, businessUnitIds: [...currentIds, bu.id] });
                                                                } else {
                                                                    setFormData({ ...formData, businessUnitIds: currentIds.filter(id => id !== bu.id) });
                                                                }
                                                            }}
                                                            disabled={isReadOnly || (currentUser.role === 'Trưởng BU' && bu.id === currentUser.buId)}
                                                            className="w-4 h-4 text-[#004aad] rounded focus:ring-[#004aad]"
                                                        />
                                                        <span className="text-sm text-gray-700">{bu.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {(!formData.businessUnitIds || formData.businessUnitIds.length === 0) && (
                                                <p className="text-xs text-red-500 mt-1">Vui lòng chọn ít nhất một BU</p>
                                            )}
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-gray-500" />
                                                <span className="text-red-500">*</span> Địa Chỉ
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                                                disabled={isReadOnly}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent focus:bg-white transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Liên hệ */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 pb-2 border-b border-gray-200">
                                        Thông tin liên hệ
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Người Liên Hệ Chính</label>
                                            <input
                                                type="text"
                                                value={formData.contactPerson}
                                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                                placeholder="Nguyễn Văn A"
                                                disabled={isReadOnly}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Người Đại Diện Pháp Luật</label>
                                            <input
                                                type="text"
                                                value={formData.representativeName}
                                                onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                                                placeholder="Trần Văn B"
                                                disabled={isReadOnly}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Chức Vụ</label>
                                            <input
                                                type="text"
                                                value={formData.representativeTitle}
                                                onChange={(e) => setFormData({ ...formData, representativeTitle: e.target.value })}
                                                placeholder="Giám đốc"
                                                disabled={isReadOnly}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">SĐT Người Đại Diện</label>
                                            <input
                                                type="text"
                                                value={formData.representativePhone}
                                                onChange={(e) => setFormData({ ...formData, representativePhone: e.target.value })}
                                                placeholder="0909..."
                                                disabled={isReadOnly}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Thanh toán */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 pb-2 border-b border-gray-200">
                                        Thông tin thanh toán
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phương Thức Thanh Toán</label>
                                            <select
                                                value={formData.paymentMethodId || ''}
                                                onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
                                                disabled={isReadOnly}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                                            >
                                                <option value="">Chọn phương thức</option>
                                                {paymentMethods.map(pm => (
                                                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Thời Hạn Thanh Toán (Ngày)</label>
                                            <input
                                                type="number"
                                                value={formData.paymentTerm}
                                                onChange={(e) => setFormData({ ...formData, paymentTerm: parseInt(e.target.value) || 0 })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tài Khoản Ngân Hàng</label>
                                        {formData.bankAccounts?.map((acc, index) => (
                                            <div key={index} className="flex gap-2 items-start mb-2 p-3 bg-gray-50 rounded border border-gray-200">
                                                <div className="grid grid-cols-2 gap-2 flex-1">
                                                    <input
                                                        placeholder="Tên Ngân Hàng"
                                                        value={acc.bankName}
                                                        onChange={e => updateBankAccount(index, 'bankName', e.target.value)}
                                                        className="p-2 border rounded text-sm disabled:bg-gray-100"
                                                        disabled={isReadOnly}
                                                    />
                                                    <input
                                                        placeholder="Số Tài Khoản"
                                                        value={acc.accountNumber}
                                                        onChange={e => updateBankAccount(index, 'accountNumber', e.target.value)}
                                                        className="p-2 border rounded text-sm disabled:bg-gray-100"
                                                        disabled={isReadOnly}
                                                    />
                                                    <input
                                                        placeholder="Chi Nhánh"
                                                        value={acc.branch}
                                                        onChange={e => updateBankAccount(index, 'branch', e.target.value)}
                                                        className="p-2 border rounded text-sm disabled:bg-gray-100"
                                                        disabled={isReadOnly}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            placeholder="SWIFT Code"
                                                            value={acc.swiftCode}
                                                            onChange={e => updateBankAccount(index, 'swiftCode', e.target.value)}
                                                            className="p-2 border rounded text-sm flex-1 disabled:bg-gray-100"
                                                            disabled={isReadOnly}
                                                        />
                                                        <label className="flex items-center gap-1 text-xs">
                                                            <input
                                                                type="checkbox"
                                                                checked={acc.isDefault}
                                                                onChange={e => updateBankAccount(index, 'isDefault', e.target.checked)}
                                                                disabled={isReadOnly}
                                                            /> Mặc định
                                                        </label>
                                                    </div>
                                                </div>
                                                {!isReadOnly && (
                                                    <button type="button" onClick={() => removeBankAccount(index)} className="text-red-500 p-2">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {!isReadOnly && (
                                            <button type="button" onClick={addBankAccount} className="text-[#004aad] text-sm font-semibold flex items-center gap-1 mt-2">
                                                <Plus className="w-4 h-4" /> Thêm tài khoản
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contracts' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase">Danh sách hợp đồng</h3>
                                    {!isReadOnly && (
                                        <button type="button" onClick={addContract} className="px-4 py-2 bg-[#004aad] text-white rounded-lg text-sm flex items-center gap-2">
                                            <Plus className="w-4 h-4" /> Thêm hợp đồng
                                        </button>
                                    )}
                                </div>

                                {formData.contracts?.length === 0 && <p className="text-gray-500 text-center py-4">Chưa có hợp đồng nào.</p>}

                                {formData.contracts?.map((contract, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative mb-4">
                                        {!isReadOnly && (
                                            <button type="button" onClick={() => removeContract(index)} className="absolute top-2 right-2 text-red-500 p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">Số Hợp Đồng</label>
                                                <input
                                                    value={contract.contractNumber}
                                                    onChange={e => updateContract(index, 'contractNumber', e.target.value)}
                                                    className="w-full mt-1 p-2 border rounded text-sm disabled:bg-gray-100"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">Ngày Ký</label>
                                                <input
                                                    type="date"
                                                    value={contract.signDate ? new Date(contract.signDate).toISOString().split('T')[0] : ''}
                                                    onChange={e => updateContract(index, 'signDate', e.target.value)}
                                                    className="w-full mt-1 p-2 border rounded text-sm disabled:bg-gray-100"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">Ngày Hết Hạn</label>
                                                <input
                                                    type="date"
                                                    value={contract.expiryDate ? new Date(contract.expiryDate).toISOString().split('T')[0] : ''}
                                                    onChange={e => updateContract(index, 'expiryDate', e.target.value)}
                                                    className="w-full mt-1 p-2 border rounded text-sm disabled:bg-gray-100"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">Giá Trị</label>
                                                <input
                                                    type="number"
                                                    value={contract.value}
                                                    onChange={e => updateContract(index, 'value', parseInt(e.target.value) || 0)}
                                                    className="w-full mt-1 p-2 border rounded text-sm disabled:bg-gray-100"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </form>
                </div>

                <div className="border-t border-gray-200 px-6 py-4 flex justify-center gap-3 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-w-[140px]"
                    >
                        {mode === 'view' ? 'Đóng' : 'Hủy bỏ'}
                    </button>
                    {!isReadOnly && (
                        <button
                            type="submit"
                            form="partner-form"
                            disabled={loading}
                            className="px-8 py-2.5 bg-[#004aad] text-white rounded-lg hover:bg-[#1557A0] transition-colors font-medium min-w-[140px] shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <FileText className="w-4 h-4" />
                            {loading ? 'Đang xử lý...' : (mode === 'create' ? 'Tạo đối tác' : 'Lưu thay đổi')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
