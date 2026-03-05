import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { TrendingUp, TrendingDown, DollarSign, Percent, Eye, X, BarChart3, Filter, Calendar, ArrowUpDown } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { dashboardService } from '../../services/dashboardService';
import { transactionService } from '../../services/transactionService';

export function Dashboard() {
  const navigate = useNavigate();
  const { selectedBU, canSelectBU, currentUser, availableBUs } = useApp();

  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [buStats, setBuStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedBUForModal, setSelectedBUForModal] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalCategories, setModalCategories] = useState<any[]>([]);

  const [filterTimeRange, setFilterTimeRange] = useState<string>('year');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Category Detail Modal States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryTransactions, setCategoryTransactions] = useState<any[]>([]);
  const [loadingCategoryData, setLoadingCategoryData] = useState(false);
  const [categorySortField, setCategorySortField] = useState<'date' | 'amount'>('date');
  const [categorySortOrder, setCategorySortOrder] = useState<'asc' | 'desc'>('asc');

  // Helper to format date for API (YYYY-MM-DD)
  const formatDateForApi = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get date range based on filter
  const getDateRange = (): { start: Date; end: Date } => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    switch (filterTimeRange) {
      case 'month': {
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: new Date(currentYear, currentMonth + 1, 0)
        };
      }
      case 'quarter': {
        const quarterMonth = Math.floor(currentMonth / 3) * 3;
        return {
          start: new Date(currentYear, quarterMonth, 1),
          end: new Date(currentYear, quarterMonth + 3, 0)
        };
      }
      case 'year': {
        return {
          start: new Date(currentYear, 0, 1),
          end: new Date(currentYear, 11, 31)
        };
      }
      case 'custom': {
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate),
            end: new Date(customEndDate)
          };
        }
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: new Date(currentYear, currentMonth + 1, 0)
        };
      }
      default:
        return {
          start: new Date(currentYear, 0, 1),
          end: new Date(currentYear, 11, 31)
        };
    }
  };

  const selectedBUName = selectedBU === 'all' ? 'Tất cả' : availableBUs.find(b => b.id === selectedBU)?.name || selectedBU;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const range = getDateRange();
        const dateRangeStr = {
          startDate: formatDateForApi(range.start),
          endDate: formatDateForApi(range.end)
        };
        const buIdParam = selectedBU === 'all' ? undefined : selectedBU;

        // Parallel fetch
        const [statsRes, revenueRes, expenseRes, buStatsRes] = await Promise.all([
          dashboardService.getStats(buIdParam, dateRangeStr),
          dashboardService.getRevenueChart(buIdParam, filterTimeRange, dateRangeStr),
          dashboardService.getExpenseChart(buIdParam, dateRangeStr),
          dashboardService.getBuStats(buIdParam, dateRangeStr)
        ]);

        setStats(statsRes);
        setRevenueData(revenueRes);
        setExpenseData(expenseRes);
        setBuStats(buStatsRes);

      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBU, filterTimeRange, customStartDate, customEndDate]);

  // Handle view Category Detail from chart
  const handleCategoryClick = async (data: any) => {
    // Recharts passes different objects for Pie slice clicks vs Legend matches
    // Slice click: data.payload contains the item
    // Custom button/Legend: data is the item itself
    const item = data.payload || data;
    const categoryId = item.id || item.categoryId;

    if (!categoryId) {
      console.warn("No category ID found in clicked item:", data);
      return;
    }

    setSelectedCategory(item);
    setShowCategoryModal(true);
    setLoadingCategoryData(true);

    try {
      const range = getDateRange();
      const dateRangeStr = {
        dateFrom: formatDateForApi(range.start),
        dateTo: formatDateForApi(range.end)
      };

      const filters: any = {
        ...dateRangeStr,
        categoryId: categoryId,
        type: 'EXPENSE',
        status: 'APPROVED'
      };

      if (selectedBU !== 'all') filters.buId = selectedBU;

      const txns = await transactionService.getAll(filters);
      setCategoryTransactions(txns);
    } catch (e) {
      console.error(e);
      setCategoryTransactions([]);
    } finally {
      setLoadingCategoryData(false);
    }
  };

  // Handle view BU detail
  const handleViewBUDetail = async (bu: any) => {
    setSelectedBUForModal(bu.buName);
    setShowDetailModal(true);

    // Fetch details (categories) for this BU
    try {
      const range = getDateRange();
      const dateRangeStr = {
        startDate: formatDateForApi(range.start),
        endDate: formatDateForApi(range.end)
      };
      const expenseRes = await dashboardService.getExpenseChart(bu.id, dateRangeStr);
      setModalCategories(expenseRes);
    } catch (e) {
      console.error(e);
      setModalCategories([]);
    }
  };


  const selectedBUData = buStats.find(b => b.buName === selectedBUForModal);

  // Format currency
  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0
    }).format(value);
    return `${formatted} ₫`;
  };

  // Format short currency for charts
  const formatShortCurrency = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  // Update KPI Data dynamically based on fetched stats
  const kpiData = [
    {
      title: 'Tổng Doanh thu',
      value: stats && stats.totalIncome !== undefined ? formatCurrency(stats.totalIncome) : '0 ₫',
      unit: '',
      trend: 'up',
      icon: TrendingUp,
      bgColor: 'bg-white',
      textColor: 'text-gray-800',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Tổng Chi phí',
      value: stats && stats.totalExpense !== undefined ? formatCurrency(stats.totalExpense) : '0 ₫',
      unit: '',
      trend: 'up',
      icon: TrendingDown,
      bgColor: 'bg-white',
      textColor: 'text-gray-800',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Tổng Vay',
      value: stats && stats.totalLoan !== undefined ? formatCurrency(stats.totalLoan) : '0 ₫',
      unit: '',
      change: '',
      trend: 'neutral',
      icon: DollarSign,
      bgColor: 'bg-white',
      textColor: 'text-gray-800',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Lợi nhuận',
      value: stats && stats.netProfit !== undefined ? formatCurrency(stats.netProfit) : '0 ₫',
      unit: '',
      trend: stats && stats.netProfit >= 0 ? 'up' : 'down',
      icon: BarChart3,
      bgColor: stats && stats.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50',
      textColor: stats && stats.netProfit >= 0 ? 'text-green-800' : 'text-red-800',
      iconBg: stats && stats.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100',
      iconColor: stats && stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
    }
  ];

  // Centralized Category Color Mapping - Used for all charts
  const CATEGORY_COLORS: { [key: string]: string } = {
    'Dịch vụ thuê ngoài': '#3B82F6',        // Blue
    'Lương, thưởng, phụ cấp': '#F59E0B',    // Amber/Orange
    'Chi phí văn phòng': '#10B981',         // Green
    'Dịch vụ tư vấn, kế toán': '#8B5CF6',   // Purple
    'Công cụ, thiết bị': '#EF4444',         // Red
    'Thuế và lệ phí': '#6366F1',            // Indigo
    'Bảo hiểm xã hội': '#06B6D4',           // Cyan
    'Chi phí khác': '#F97316',              // Orange
    'Chi phí hỗ trợ': '#EC4899',            // Pink
    'Chi phí marketing': '#14B8A6',         // Teal
  };

  // Fallback colors for categories not in the mapping
  const FALLBACK_COLORS = [
    '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444',
    '#6366F1', '#06B6D4', '#F97316', '#EC4899', '#14B8A6',
    '#84CC16', '#F43F5E', '#0EA5E9', '#A855F7', '#22D3EE'
  ];

  // Helper function to get color for a category
  const getCategoryColor = (categoryName: string, index: number): string => {
    return CATEGORY_COLORS[categoryName] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  };


  // Get time range display text
  const getTimeRangeText = () => {
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

    switch (filterTimeRange) {
      case 'month': {
        const currentMonth = new Date().getMonth();
        return `${months[currentMonth]} ${new Date().getFullYear()}`;
      }
      case 'quarter': {
        const currentMonth = new Date().getMonth();
        const quarter = Math.floor(currentMonth / 3) + 1;
        return `Quý ${quarter}/${new Date().getFullYear()}`;
      }
      case 'year': {
        return `Năm ${new Date().getFullYear()}`;
      }
      case 'custom': {
        if (customStartDate && customEndDate) {
          return `${new Date(customStartDate).toLocaleDateString('vi-VN')} - ${new Date(customEndDate).toLocaleDateString('vi-VN')}`;
        }
        return 'Tùy chỉnh';
      }
      default:
        return `Năm ${new Date().getFullYear()}`;
    }
  };

  /* 
   * FIX: Recharts passes `percent` (0-1) to the label function.
   * `entry.percentage` (0-100) might not exist if not explicitly added to data.
   * Using `entry.percent` is safer.
   */
  const renderCustomLabel = (entry: any) => {
    if (!entry.percent || entry.percent <= 0) return '';
    const percentVal = entry.percent * 100;
    return `${percentVal.toFixed(1)}%`;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Tài Chính</h1>
        <p className="text-gray-600">
          Tổng quan hiệu suất tài chính và báo cáo theo Business Unit
          {!canSelectBU && selectedBU !== 'all' && (
            <span className="ml-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              Đang xem: {selectedBU}
            </span>
          )}
        </p>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-700">Bộ lọc:</span>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={filterTimeRange}
              onChange={(e) => setFilterTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004aad] focus:border-transparent"
            >
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm này</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
          </div>

          {/* Custom Date Range Input */}
          {filterTimeRange === 'custom' && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-700">Từ:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004aad] focus:border-transparent bg-white text-sm"
              />
              <span className="text-sm font-medium text-blue-700">Đến:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004aad] focus:border-transparent bg-white text-sm"
              />
            </div>
          )}

          {/* Display current filter */}
          <div className="ml-auto flex items-center gap-2 bg-[#004aad] text-white px-4 py-2 rounded-lg">
            <span className="text-sm font-medium">📅 {getTimeRangeText()}</span>
          </div>
        </div>

        {/* BU Filter Info Removed */}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <div
              key={index}
              className={`${kpi.bgColor} rounded-xl shadow-md p-6 border border-gray-200`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">{kpi.title}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className={`text-2xl font-bold ${kpi.textColor}`}>
                      {kpi.value}
                    </h3>
                  </div>
                </div>
                <div className={`${kpi.iconBg} p-3 rounded-lg`}>
                  <IconComponent className={`w-6 h-6 ${kpi.iconColor}`} />
                </div>
              </div>

              {kpi.change && (
                <div className="flex items-center gap-1">
                  {kpi.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                  <p className="text-xs text-green-600">{kpi.change}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Cash Flow Trend - Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Xu hướng Dòng tiền</h2>
            <p className="text-sm text-gray-600">
              Theo dõi thu chi, vay và lợi nhuận theo {
                filterTimeRange === 'year' ? 'tháng' :
                  filterTimeRange === 'custom' ? (
                    (() => {
                      const range = getDateRange();
                      const diffDays = Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24));
                      if (diffDays <= 45) return 'tuần';
                      if (diffDays <= 180) return 'tháng';
                      return 'quý';
                    })()
                  ) : 'tuần'
              }
            </p>
          </div>

          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  stroke="#9CA3AF"
                />
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  stroke="#9CA3AF"
                  tickFormatter={(value) => formatCurrency(value)}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="thu"
                  name="Tổng Thu"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="chi"
                  name="Tổng Chi"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="vay"
                  name="Tổng Vay"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="loiNhuan"
                  name="Lợi nhuận"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p>Không có dữ liệu trong khoảng thời gian này</p>
              </div>
            </div>
          )}
        </div>

        {/* Expense by Category - Donut Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Cơ cấu Chi phí</h2>
            <p className="text-sm text-gray-600">Phân bổ theo danh mục</p>
          </div>

          {expenseData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={renderCustomLabel}
                    onClick={(data) => handleCategoryClick(data)}
                    style={{ cursor: 'pointer' }}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, index)} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#FFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="mt-4 space-y-2">
                {expenseData.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(category)}
                    className="w-full flex items-center justify-between text-sm p-1.5 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(category.name, index) }}
                      ></div>
                      <span className="text-gray-700 group-hover:text-blue-600 transition-colors">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{formatCurrency(category.value)}</span>
                      <Eye className="w-4 h-4 text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <div className="text-center">
                <DollarSign className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p>Không có dữ liệu chi phí</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BU Performance Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Báo cáo Hiệu suất theo BU</h2>
          <p className="text-sm text-gray-600">Tổng quan tài chính từng đơn vị kinh doanh</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Business Unit
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tổng Thu
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tổng Chi
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Lợi nhuận
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Biên lợi nhuận
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {buStats.map((bu) => (
                <tr key={bu.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#004aad] to-[#155a9e] rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                        {bu.buName.split(' ')[1]?.substring(0, 2).toUpperCase() || 'BU'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{bu.buName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(bu.totalRevenue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-red-600">
                      {formatCurrency(bu.totalExpense)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-semibold ${bu.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {bu.totalProfit > 0 ? '+' : ''}{formatCurrency(bu.totalProfit)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${bu.profitMargin >= 30 ? 'bg-green-100 text-green-700' :
                        bu.profitMargin >= 20 ? 'bg-yellow-100 text-yellow-700' :
                          bu.profitMargin >= 0 ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {bu.profitMargin >= 0 ? '+' : ''}{bu.profitMargin.toFixed(2)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleViewBUDetail(bu)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#004aad] hover:bg-[#155a9e] text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr className="font-bold">
                <td className="px-6 py-4 text-gray-900">TỔNG CỘNG</td>
                <td className="px-6 py-4 text-right text-green-600">
                  {formatCurrency(stats?.totalIncome || 0)}
                </td>
                <td className="px-6 py-4 text-right text-red-600">
                  {formatCurrency(stats?.totalExpense || 0)}
                </td>
                <td className="px-6 py-4 text-right text-blue-600">
                  {formatCurrency(stats?.netProfit || 0)}
                </td>
                <td className="px-6 py-4 text-right text-gray-900">
                  {stats?.totalIncome ? ((stats.netProfit / stats.totalIncome) * 100).toFixed(2) : '0.00'}%
                </td>
                <td className="px-6 py-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* BU Detail Modal */}
      {showDetailModal && selectedBUData && (() => {
        // Prepare chart data from modalCategories using centralized color function
        const chartData = modalCategories
          .filter((item: any) => item.value > 0)
          .map((item: any, index: number) => ({
            name: item.name.split(' - ')[0],
            value: item.value,
            fullName: item.name,
            color: getCategoryColor(item.name, index)
          }));

        // Custom label for pie chart
        const renderCustomLabel = (entry: any) => {
          const percent = ((entry.value / selectedBUData.totalExpense) * 100).toFixed(1);
          return `${percent}%`;
        };

        // Calculate profit (can be negative)
        const profit = selectedBUData.totalRevenue - selectedBUData.totalExpense;

        return (
          <div className="modal-overlay-container">
            <div className="modal-content-container max-w-6xl">
              {/* Header */}
              <div className="border-b border-gray-200 px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Chi Tiết Giao Dịch - {selectedBUData.bu}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Kỳ: {getTimeRangeText()}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Tổng Thu */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-green-700 uppercase">Tổng Thu</span>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-green-700">
                      {formatCurrency(selectedBUData.totalRevenue)}
                    </div>
                  </div>

                  {/* Tổng Chi */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-red-700 uppercase">Tổng Chi</span>
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-3xl font-bold text-red-700">
                      {formatCurrency(selectedBUData.totalExpense)}
                    </div>
                  </div>
                </div>

                {/* Main Content: Table + Chart */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left: Category List */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-bold text-gray-800 uppercase text-sm">Tổng Thu</h3>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-700">Doanh thu thuần</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(selectedBUData.totalRevenue)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 border-t border-b border-gray-200">
                      <h3 className="font-bold text-gray-800 uppercase text-sm">Chi</h3>
                    </div>
                    <div className="p-4">
                      {modalCategories.map((item: any, index: number) => {
                        const color = getCategoryColor(item.name, index);
                        return (
                          <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                            <div className="flex items-start gap-2 flex-1">
                              <div
                                className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-sm text-gray-700">
                                {formatCurrency(item.value)} {item.name}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Totals */}
                      <div className="mt-4 pt-4 border-t-2 border-gray-300 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800">TỔNG CHI</span>
                          <span className="font-bold text-red-600 text-lg">
                            {formatCurrency(selectedBUData.totalExpense)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800">LỢI NHUẬN</span>
                          <span className={`font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(profit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pie Chart */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="font-bold text-gray-800 mb-4 text-center">Phân Bổ Chi Phí Theo Danh Mục</h3>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={renderCustomLabel}
                            outerRadius={120}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry: any) => {
                              const payload = entry.payload;
                              return (
                                <span style={{ color: payload.color }}>
                                  {payload.fullName}
                                </span>
                              );
                            }}
                            iconType="circle"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[400px] text-gray-400">
                        <div className="text-center">
                          <TrendingDown className="w-16 h-16 mx-auto mb-2 opacity-50" />
                          <p>Chưa có dữ liệu chi phí</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4 flex justify-center">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-w-[140px]"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {showCategoryModal && createPortal(
        <div className="modal-overlay-container">
          <div className="modal-content-container max-w-2xl">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-5 relative">
              <div className="text-center">
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-wide">
                  {selectedCategory?.name}
                </h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">
                  {selectedBUName} • {(() => {
                    const range = getDateRange();
                    return `${range.start.toLocaleDateString('vi-VN')} - ${range.end.toLocaleDateString('vi-VN')}`;
                  })()}
                </p>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-6">
              {loadingCategoryData ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-gray-100 border-t-[#004aad] rounded-full animate-spin"></div>
                  <p className="text-gray-400 font-medium">Đang tải dữ liệu...</p>
                </div>
              ) : categoryTransactions.length > 0 ? (() => {
                // Sort transactions based on current sort settings
                const sortedTransactions = [...categoryTransactions].sort((a, b) => {
                  if (categorySortField === 'date') {
                    const dateA = new Date(a.transactionDate).getTime();
                    const dateB = new Date(b.transactionDate).getTime();
                    return categorySortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                  } else {
                    return categorySortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
                  }
                });

                const handleSort = (field: 'date' | 'amount') => {
                  if (categorySortField === field) {
                    setCategorySortOrder(categorySortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setCategorySortField(field);
                    setCategorySortOrder('asc');
                  }
                };

                const SortIcon = ({ field }: { field: 'date' | 'amount' }) => {
                  if (categorySortField !== field) {
                    return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
                  }
                  return categorySortOrder === 'asc' ?
                    <TrendingUp className="w-3.5 h-3.5 text-[#004aad]" /> :
                    <TrendingDown className="w-3.5 h-3.5 text-[#004aad]" />;
                };

                return (
                  <div className="overflow-hidden border border-gray-100 rounded-xl bg-white shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            className="px-4 py-3 text-left font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            onClick={() => handleSort('date')}
                          >
                            <div className="flex items-center gap-1.5">
                              Ngày
                              <SortIcon field="date" />
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">Mã giao dịch</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-700">BU</th>
                          <th
                            className="px-4 py-3 text-right font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            onClick={() => handleSort('amount')}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              Số tiền
                              <SortIcon field="amount" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {sortedTransactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                              {new Date(txn.transactionDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  setShowCategoryModal(false);
                                  navigate(`/quan-ly-thu-chi?highlight=${txn.id}&t=${Date.now()}`);
                                }}
                                className="font-mono text-[11px] font-bold text-[#004aad] bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all cursor-pointer text-left"
                                title="Xem chi tiết phiếu"
                              >
                                {txn.transactionCode}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {txn.businessUnit?.name || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-red-600 tabular-nums">
                              {formatCurrency(txn.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t-2 border-gray-100">
                        <tr className="font-bold text-gray-900">
                          <td colSpan={3} className="px-4 py-4 text-right text-xs uppercase tracking-wider">Tổng cộng:</td>
                          <td className="px-4 py-4 text-right text-red-600 text-base">
                            {formatCurrency(categoryTransactions.reduce((sum, t) => sum + t.amount, 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })() : (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                  <BarChart3 className="w-12 h-12 text-gray-300" />
                  <p className="text-gray-500 font-medium">Không tìm thấy giao dịch nào.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-center gap-3 bg-white">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-w-[140px]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
