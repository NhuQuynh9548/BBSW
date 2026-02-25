import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, Ban, Users, X, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, FileText, Phone, Mail, Building2, Trash2, AlertCircle } from 'lucide-react';
import { useDraggableColumns, DraggableColumnHeader, ColumnConfig } from '../hooks/useDraggableColumns';
import { partnerService } from '../../services/partnerService';
import { paymentMethodService } from '../../services/paymentMethodService';
import { useApp } from '../../contexts/AppContext';
import { PartnerFormModal } from '../modals/PartnerFormModal';

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
  signDate: string; // ISO string or DD/MM/YYYY
  expiryDate: string;
  value: number;
  fileName: string;
}

interface PaymentMethod {
  id: string;
  name: string;
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
  paymentMethod?: PaymentMethod;
  businessUnitIds?: string[];
  businessUnits?: { id: string, name: string }[];
  paymentTerm: number;
  contracts: Contract[];
  balance: number;
}

type SortField = 'partnerId' | 'partnerName' | 'taxCode';
type SortOrder = 'asc' | 'desc' | null;
type ModalMode = 'create' | 'view' | 'edit' | null;

export function QuanLyDoiTac() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, availableBUs, selectedBU } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivatingPartner, setDeactivatingPartner] = useState<Partner | null>(null);

  // Modal states
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
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

  // Sorting
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Draggable columns
  const columnsConfig: ColumnConfig[] = [
    { id: 'partnerId', label: 'Mã Đối Tác', field: 'partnerId', visible: true, align: 'left' },
    { id: 'partnerName', label: 'Tên Đối Tác', field: 'partnerName', visible: true, align: 'left' },
    { id: 'businessUnit', label: 'BU', field: 'businessUnit', visible: true, align: 'left' },
    { id: 'partnerType', label: 'Loại', field: 'partnerType', visible: true, align: 'center' },
    { id: 'taxCode', label: 'Mã Số Thuế', field: 'taxCode', visible: true, align: 'left' },
    { id: 'phone', label: 'Số ĐT', field: 'phone', visible: true, align: 'left' },
    { id: 'contactPerson', label: 'Người Liên Hệ', field: 'contactPerson', visible: true, align: 'left' },
    { id: 'status', label: 'Trạng Thái', field: 'status', visible: true, align: 'center' },
    { id: 'actions', label: 'Hành Động', visible: true, align: 'center' },
  ];

  const { columns, moveColumn } = useDraggableColumns({
    defaultColumns: columnsConfig,
    storageKey: 'quan-ly-doi-tac-columns',
    userId: 'user_001'
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Update partnerId when type changes (only in Create mode)
  useEffect(() => {
    if (modalMode === 'create' && formData.partnerType) {
      const type = formData.partnerType;
      const filtered = partners.filter(p => p.partnerType === type);
      const prefix = type === 'CUSTOMER' ? 'KH' : type === 'SUPPLIER' ? 'NCC' : 'DT';
      const newId = `${prefix}${String(filtered.length + 1).padStart(3, '0')}`;

      setFormData(prev => ({ ...prev, partnerId: newId }));
    }
  }, [formData.partnerType, modalMode, partners]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [partnersData, paymentMethodsData] = await Promise.all([
        partnerService.getAll(),
        paymentMethodService.getAll()
      ]);
      setPartners(partnersData);
      setPaymentMethods(paymentMethodsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredPartners = partners.filter(partner => {
    const matchesSearch =
      (partner.partnerId || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (partner.partnerName || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (partner.taxCode || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (partner.phone || '').toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesType = filterType === 'all' || partner.partnerType === filterType || (filterType === 'both' && partner.partnerType === 'BOTH');

    // Filter by BU from global header
    const matchesBU = selectedBU === 'all' ||
      (partner.businessUnits && partner.businessUnits.some(bu => bu.id === selectedBU));

    return matchesSearch && matchesType && matchesBU;
  });

  // Sorting logic
  const sortedPartners = [...filteredPartners].sort((a, b) => {
    if (!sortField || !sortOrder) return 0;
    let comparison = 0;
    // Safe access
    const valA = ((a as any)[sortField] || '').toString().toLowerCase();
    const valB = ((b as any)[sortField] || '').toString().toLowerCase();

    if (valA < valB) comparison = -1;
    if (valA > valB) comparison = 1;

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedPartners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPartners = sortedPartners.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else if (sortOrder === 'desc') { setSortField(null); setSortOrder(null); }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    if (sortOrder === 'asc') return <ArrowUp className="w-4 h-4 text-[#004aad]" />;
    return <ArrowDown className="w-4 h-4 text-[#004aad]" />;
  };

  const handleClearFilter = () => {
    setSearchTerm('');
    setFilterType('all');
    setCurrentPage(1);
  };

  // CRUD Operations
  const handleCreate = () => {
    const defaultType = 'CUSTOMER';
    const filtered = partners.filter(p => p.partnerType === defaultType);
    const initialId = `KH${String(filtered.length + 1).padStart(3, '0')}`;

    setModalMode('create');
    setSelectedPartner(null);
    setActiveTab('info');
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
  };

  const handleView = (partner: Partner) => {
    setModalMode('view');
    setSelectedPartner(partner);
    setActiveTab('info');
    setFormData({
      ...partner,
      businessUnitIds: partner.businessUnits?.map(bu => bu.id) || []
    });
  };

  const handleEdit = (partner: Partner) => {
    setModalMode('edit');
    setSelectedPartner(partner);
    setActiveTab('info');
    setFormData({
      ...partner,
      businessUnitIds: partner.businessUnits?.map(bu => bu.id) || []
    });
  };

  const handleDeactivate = (partner: Partner) => {
    setDeactivatingPartner(partner);
    setShowDeactivateConfirm(true);
  };

  const confirmDeactivate = async () => {
    if (deactivatingPartner) {
      try {
        await partnerService.deactivate(deactivatingPartner.id);
        await fetchData();
        setShowDeactivateConfirm(false);
        setDeactivatingPartner(null);
      } catch (err) {
        console.error('Deactivate failed', err);
        alert('Có lỗi xảy ra khi ngừng hợp tác.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate tax code
    if (formData.taxCode && (formData.taxCode.length < 10 || formData.taxCode.length > 13)) {
      alert('Mã số thuế phải có từ 10-13 chữ số');
      return;
    }

    // Check duplicate tax code (client-side check for immediate feedback)
    const isDuplicateTaxCode = partners.some(p =>
      p.taxCode === formData.taxCode && p.id !== selectedPartner?.id
    );
    if (isDuplicateTaxCode) {
      alert('Mã số thuế đã tồn tại trong hệ thống');
      return;
    }

    try {
      const { businessUnits, businessUnit, paymentMethod, ...restOfFormData } = formData as any;
      const payload = {
        ...restOfFormData,
        // Clean up unwanted fields if necessary, or just send partial
        bankAccounts: formData.bankAccounts?.map(({ id, ...rest }) => rest),
        contracts: formData.contracts?.map(({ id, ...rest }) => rest),
        paymentMethodId: formData.paymentMethodId || undefined,
        businessUnitIds: formData.businessUnitIds || [],
      };

      if (modalMode === 'create') {
        await partnerService.create(payload);
      } else if (modalMode === 'edit' && selectedPartner) {
        await partnerService.update(selectedPartner.id, payload);
      }

      await fetchData();
      setModalMode(null);
      setSelectedPartner(null);
    } catch (err: any) {
      console.error('Submit failed', err);
      alert('Có lỗi xảy ra khi lưu đối tác. ' + (err.response?.data?.error || err.message));
    }
  };

  const getPartnerTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'CUSTOMER': 'Khách hàng',
      'SUPPLIER': 'Nhà cung cấp',
      'BOTH': 'KH & NCC'
    };
    return labels[type] || type;
  };

  const getPartnerTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'CUSTOMER': 'bg-blue-100 text-blue-700',
      'SUPPLIER': 'bg-green-100 text-green-700',
      'BOTH': 'bg-purple-100 text-purple-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'ACTIVE'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    // Display status in Vietnamese
    const labels: Record<string, string> = {
      'ACTIVE': 'Hoạt động',
      'INACTIVE': 'Ngừng hoạt động'
    };
    return labels[status] || status;
  };

  const canDeactivate = (partner: Partner) => {
    if (partner.balance !== 0) return { canDeactivate: false, reason: 'Đối tác còn dư nợ' };
    const activeContracts = partner.contracts?.filter(c => {
      // Simple date check
      try {
        // Assume expiryDate is ISO or DD/MM/YYYY. If backend gives ISO, new Date work.
        const expiry = new Date(c.expiryDate);
        return expiry > new Date();
      } catch {
        return false;
      }
    }) || [];
    if (activeContracts.length > 0) return { canDeactivate: false, reason: 'Đối tác còn hợp đồng hiệu lực' };
    return { canDeactivate: true, reason: '' };
  };

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
      newBankAccounts[index] = { ...newBankAccounts[index], [field]: value };
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
    newContracts[index] = { ...newContracts[index], [field]: value };
    setFormData({ ...formData, contracts: newContracts });
  };

  const isReadOnly = modalMode === 'view';

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">QUẢN LÝ ĐỐI TÁC</h1>
          <p className="text-gray-600">Quản lý thông tin khách hàng và nhà cung cấp</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-[#004aad] hover:bg-[#1557A0] text-white rounded-lg transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          Thêm Đối tác
        </button>
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo Mã đối tác, Tên, MST, hoặc SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent bg-white"
                >
                  <option value="all">Tất cả loại đối tác</option>
                  <option value="CUSTOMER">Khách hàng</option>
                  <option value="SUPPLIER">Nhà cung cấp</option>
                  <option value="BOTH">Cả hai</option>
                </select>

                <button
                  onClick={handleClearFilter}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {columns.filter(c => c.visible).map((column, index) => (
                      <DraggableColumnHeader
                        key={column.id}
                        column={column}
                        index={index}
                        moveColumn={moveColumn}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedPartners.map((partner) => {
                    const deactivateCheck = canDeactivate(partner);
                    return (
                      <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                        {columns.filter(c => c.visible).map(column => {
                          if (column.id === 'partnerId') return <td key={column.id} className="px-6 py-4 font-bold text-gray-900">{partner.partnerId}</td>;
                          if (column.id === 'partnerName') return <td key={column.id} className="px-6 py-4 font-medium text-gray-900">{partner.partnerName}</td>;
                          if (column.id === 'businessUnit') return <td key={column.id} className="px-6 py-4 text-sm text-gray-600">
                            {partner.businessUnits && partner.businessUnits.length > 0
                              ? partner.businessUnits.map(bu => bu.name).join(', ')
                              : '-'}
                          </td>;
                          if (column.id === 'partnerType') return <td key={column.id} className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPartnerTypeBadgeColor(partner.partnerType)}`}>{getPartnerTypeLabel(partner.partnerType)}</span></td>;
                          if (column.id === 'taxCode') return <td key={column.id} className="px-6 py-4 text-sm text-gray-600">{partner.taxCode}</td>;
                          if (column.id === 'phone') return <td key={column.id} className="px-6 py-4 text-sm text-gray-600">{partner.phone}</td>;
                          if (column.id === 'contactPerson') return <td key={column.id} className="px-6 py-4 text-sm text-gray-600">{partner.contactPerson}</td>;
                          if (column.id === 'status') return <td key={column.id} className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(partner.status)}`}>{getStatusLabel(partner.status)}</span></td>;
                          if (column.id === 'actions') return (
                            <td key={column.id} className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleView(partner)}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Xem chi tiết"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(partner)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Chỉnh sửa"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeactivate(partner)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={deactivateCheck.canDeactivate ? 'Ngừng hợp tác' : deactivateCheck.reason}
                                  disabled={!deactivateCheck.canDeactivate || partner.status === 'INACTIVE'}
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          );
                          return <td key={column.id} className="px-6 py-4">-</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {paginatedPartners.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Không tìm thấy đối tác nào</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Hiển thị <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(endIndex, sortedPartners.length)}</span> trong tổng số <span className="font-semibold">{sortedPartners.length}</span> đối tác
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                        ? 'bg-[#004aad] text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create/View/Edit Modal */}
      {modalMode && (
        <PartnerFormModal
          mode={modalMode}
          selectedPartner={selectedPartner}
          allPartners={partners}
          onClose={() => setModalMode(null)}
          onSuccess={async (newPartner) => {
            await fetchData();
            setModalMode(null);
            setSelectedPartner(null);
          }}
        />
      )}

      {/* Deactivate Confirm Modal */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 bg-black/40 z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Xác nhận ngừng hợp tác</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Bạn có chắc chắn muốn ngừng hợp tác với đối tác <b>{deactivatingPartner?.partnerName}</b>?
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeactivateConfirm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmDeactivate}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold shadow-lg shadow-red-100"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}
