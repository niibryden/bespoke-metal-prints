import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getServerUrl } from '../../utils/serverUrl';

import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Image, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Calendar, 
  RefreshCw, 
  ShoppingBag, 
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StatsData {
  totalOrders: number;
  stockPhotos: number;
  revenue: number;
  lowStockItems: number;
  error?: string;
  cached?: boolean;
  cacheAge?: number;
  // Extended stats
  recentOrders?: any[];
  ordersByStatus?: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    refunded: number;
    partially_refunded: number;
  };
  revenueByPeriod?: Array<{ date: string; revenue: number; orders: number }>;
  topProducts?: Array<{ name: string; count: number; revenue: number }>;
  averageOrderValue?: number;
  conversionRate?: number;
  returningCustomers?: number;
  totalCustomers?: number;
}

interface AdminOverviewProps {
  onNavigate?: (tab: 'photos' | 'inventory' | 'orders') => void;
  adminInfo: { email: string; role: string; name: string; permissions: any; accessToken: string };
}

type TimePeriod = 'day' | 'week' | 'month' | 'year' | 'all';

export function AdminOverview({ onNavigate, adminInfo }: AdminOverviewProps) {
  const [stats, setStats] = useState<StatsData>({
    totalOrders: 0,
    stockPhotos: 0,
    revenue: 0,
    lowStockItems: 0,
    ordersByStatus: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
      partially_refunded: 0,
    },
    revenueByPeriod: [],
    topProducts: [],
    averageOrderValue: 0,
    conversionRate: 0,
    returningCustomers: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchStats(selectedPeriod);
  }, []);
  
  // Watch for period changes and refetch stats
  useEffect(() => {
    fetchStats(selectedPeriod);
  }, [selectedPeriod]);
  
  const fetchStats = async (period: string) => {
    setLoading(true);
    try {
      const serverUrl = getServerUrl();
      
      // ========== FETCH FROM ORDERS ENDPOINT (SAME AS ORDERS TAB) ==========
      // Orders tab is the source of truth - we calculate stats from the same data
      // Fetch MORE orders to ensure we have enough data for filtering
      const ordersUrl = `${serverUrl}/admin/orders?limit=100&offset=0&t=${Date.now()}`;
      
      console.log('📊 ===== OVERVIEW TAB: FETCHING FROM ORDERS ENDPOINT =====');
      console.log('📊 URL:', ordersUrl);
      console.log('📊 Period filter:', period);
      console.log('📊 This is the SAME endpoint the Orders tab uses');
      console.log('📊 Auth Token:', adminInfo.accessToken ? 'Present' : 'MISSING');
      console.log('📊 Token length:', adminInfo.accessToken?.length || 0);
      console.log('📊 Token preview:', adminInfo.accessToken ? adminInfo.accessToken.substring(0, 30) + '...' : 'NO TOKEN');
      console.log('📊 ProjectId:', projectId);
      
      const ordersResponse = await fetch(ordersUrl, {
        headers: {
          'Authorization': `Bearer ${adminInfo.accessToken}`,
        },
      }).catch((networkError) => {
        console.error('📊 ❌ NETWORK ERROR (fetch failed):', networkError);
        throw new Error(`Network error: ${networkError.message}`);
      });

      if (!ordersResponse.ok) {
        const errorText = await ordersResponse.text();
        console.error('📊 Orders fetch failed:', ordersResponse.status, ordersResponse.statusText);
        console.error('📊 Error response:', errorText);
        
        // If we get a 401 with bad JWT, the session is invalid - force logout
        if (ordersResponse.status === 401) {
          try {
            const errorData = JSON.parse(errorText);
            // Check for forceLogout flag from server
            if (errorData.forceLogout || errorData.code === 401 || errorData.message?.includes('JWT') || errorData.message?.includes('Invalid')) {
              console.error('🚨 Invalid session detected - clearing and forcing logout');
              localStorage.removeItem('admin-session');
              alert('Your admin session has expired or is invalid. The page will reload. Please log in again.');
              window.location.reload();
              return;
            }
          } catch (e) {
            // Error parsing JSON, continue with normal error handling
          }
        }
        
        throw new Error(`Failed to fetch orders: ${ordersResponse.status} ${errorText}`);
      }

      const ordersData = await ordersResponse.json();
      const allOrders = ordersData.orders || [];
      
      console.log('📊 ========== ORDERS DATA (SOURCE OF TRUTH) ==========');
      console.log('📊 Total orders loaded:', allOrders.length);
      console.log('📊 Sample orders:', allOrders.slice(0, 3).map((o: any) => ({
        id: o.orderId,
        status: o.status,
        amount: o.amount,
        email: o.customerEmail,
        date: o.createdAt
      })));
      
      // ========== FILTER 1: DATE FILTER (December 2025 onwards) ==========
      const dec2025Start = new Date('2025-12-01T00:00:00Z');
      const ordersFromDec2025 = allOrders.filter((order: any) => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate >= dec2025Start;
      });
      
      console.log('📊 ========== DATE FILTER ==========');
      console.log('📊 Cutoff date:', dec2025Start.toISOString());
      console.log('📊 Orders before filtering:', allOrders.length);
      console.log('📊 Orders from Dec 2025 onwards:', ordersFromDec2025.length);
      console.log('📊 Excluded (before Dec 2025):', allOrders.length - ordersFromDec2025.length);
      
      // ========== FILTER 2: PERIOD FILTER (Based on selected time period) ==========
      const now = new Date();
      let periodStart: Date;
      
      switch (period) {
        case 'day':
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          break;
        case 'week':
          periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
          break;
        case 'year':
          periodStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
          break;
        case 'all':
        default:
          periodStart = dec2025Start; // Use Dec 2025 as the earliest for "all time"
          break;
      }
      
      const ordersInPeriod = ordersFromDec2025.filter((order: any) => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate >= periodStart;
      });
      
      console.log('📊 ========== PERIOD FILTER ==========');
      console.log('📊 Selected period:', period);
      console.log('📊 Period start:', periodStart.toISOString());
      console.log('📊 Orders in period:', ordersInPeriod.length);
      console.log('📊 Excluded (outside period):', ordersFromDec2025.length - ordersInPeriod.length);
      
      // ========== FILTER 3: STATUS FILTER (Exclude incomplete/cancelled) ==========
      // Only count REAL orders that actually came through
      // Exclude: pending (incomplete), cancelled
      const validStatuses = ['processing', 'paid', 'shipped', 'delivered', 'refunded', 'partially_refunded'];
      const validOrders = ordersInPeriod.filter((order: any) => 
        validStatuses.includes(order.status) && order.paymentIntentId
      );
      
      // Count how many of each status (for logging)
      const statusCounts: any = {};
      ordersInPeriod.forEach((order: any) => {
        const status = order.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      console.log(`📊 ========== STATUS FILTER ==========`);
      console.log(`📊 Orders in period: ${ordersInPeriod.length}`);
      console.log(`📊 Status breakdown:`, statusCounts);
      console.log(`📊 Valid statuses (completed orders):`, validStatuses);
      console.log(`📊 After excluding incomplete/cancelled: ${validOrders.length}`);
      
      // Calculate order status breakdown from ALL valid orders (not just paid)
      const ordersByStatus: any = {
        processing: 0,
        paid: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        refunded: 0,
        partially_refunded: 0,
      };
      
      validOrders.forEach((order: any) => {
        const status = order.status || 'paid';
        if (ordersByStatus[status] !== undefined) {
          ordersByStatus[status]++;
        }
      });
      
      // Calculate revenue from paid, shipped, and delivered orders only
      const paidStatuses = ['paid', 'shipped', 'delivered'];
      const revenue = validOrders.reduce((sum: number, order: any) => {
        // Only count revenue from paid/shipped/delivered orders
        if (paidStatuses.includes(order.status)) {
          return sum + (order.amount || 0);
        }
        return sum;
      }, 0);
      
      // Get unique customers from ALL valid orders (including cancelled/refunded)
      const uniqueCustomers = new Set(
        validOrders.map((o: any) => o.customerEmail).filter(Boolean)
      );
      
      // Calculate returning customers from ALL valid orders
      const customerOrderCounts = new Map<string, number>();
      validOrders.forEach((order: any) => {
        if (order.customerEmail) {
          customerOrderCounts.set(
            order.customerEmail,
            (customerOrderCounts.get(order.customerEmail) || 0) + 1
          );
        }
      });
      const returningCustomers = Array.from(customerOrderCounts.values()).filter(count => count > 1).length;
      
      // Total order count = ALL valid orders (matches Orders tab count)
      const totalOrders = validOrders.length;
      
      // Calculate average order value from PAID orders only
      const paidOrderCount = paidStatuses.reduce((count, status) => count + (ordersByStatus[status] || 0), 0);
      const averageOrderValue = paidOrderCount > 0 ? revenue / paidOrderCount : 0;
      
      // Fetch stock photos count
      let stockPhotos = 0;
      try {
        const stockUrl = `${serverUrl}/admin/stock-photos-count?_t=${Date.now()}`;
        const stockResponse = await fetch(stockUrl, {
          headers: { 'Authorization': `Bearer ${adminInfo.accessToken}` },
        });
        if (stockResponse.ok) {
          const stockData = await stockResponse.json();
          stockPhotos = stockData.count || 0;
        }
      } catch (error) {
        console.warn('Could not fetch stock photos count:', error);
      }
      
      console.log('📊 ========== CALCULATED STATS ==========');
      console.log('📊 Total Valid Orders:', totalOrders);
      console.log('📊 Revenue (from paid/shipped/delivered orders):', `$${revenue.toFixed(2)}`);
      console.log('📊 Customers:', uniqueCustomers.size, `(${returningCustomers} returning)`);
      console.log('📊 Average Order Value:', `$${averageOrderValue.toFixed(2)}`);
      console.log('📊 Order Status Breakdown:', ordersByStatus);
      console.log('📊 Stock Photos:', stockPhotos);
      console.log('📊 =====================================');
      
      setStats({
        totalOrders: totalOrders || 0,
        stockPhotos: stockPhotos || 0,
        revenue: revenue || 0,
        lowStockItems: 0,
        error: null,
        cached: false,
        cacheAge: null,
        recentOrders: [],
        ordersByStatus: ordersByStatus || {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          refunded: 0,
          partially_refunded: 0,
        },
        revenueByPeriod: [],
        topProducts: [],
        averageOrderValue: averageOrderValue || 0,
        conversionRate: 0,
        returningCustomers: returningCustomers || 0,
        totalCustomers: uniqueCustomers.size || 0,
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({
        totalOrders: 0,
        stockPhotos: 0,
        revenue: 0,
        lowStockItems: 0,
        error: 'Failed to fetch stats',
        ordersByStatus: {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          refunded: 0,
          partially_refunded: 0,
        },
        revenueByPeriod: [],
        topProducts: [],
        averageOrderValue: 0,
        conversionRate: 0,
        returningCustomers: 0,
        totalCustomers: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats(selectedPeriod);
  };

  const periods: { value: TimePeriod; label: string }[] = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All Time' },
  ];

  // Generate mock data for revenue trend if not available
  function generateMockRevenueData(period: TimePeriod) {
    const data = [];
    const days = period === 'day' ? 24 : period === 'week' ? 7 : period === 'month' ? 30 : period === 'year' ? 12 : 30;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      if (period === 'year') {
        date.setMonth(date.getMonth() - i);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: Math.random() * 5000 + 2000,
          orders: Math.floor(Math.random() * 20 + 5),
        });
      } else if (period === 'day') {
        date.setHours(date.getHours() - i);
        data.push({
          date: date.toLocaleTimeString('en-US', { hour: 'numeric' }),
          revenue: Math.random() * 500 + 100,
          orders: Math.floor(Math.random() * 5 + 1),
        });
      } else {
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: Math.random() * 2000 + 500,
          orders: Math.floor(Math.random() * 10 + 2),
        });
      }
    }
    return data;
  }

  // Calculate trends (mock for now - would compare to previous period in production)
  const calculateTrend = (current: number) => {
    const trend = Math.random() * 30 - 10; // Mock trend between -10% and +20%
    return {
      value: trend,
      isPositive: trend > 0,
    };
  };

  const revenueTrend = calculateTrend(stats.revenue);
  const ordersTrend = calculateTrend(stats.totalOrders);
  const customerTrend = calculateTrend(stats.totalCustomers);

  // Prepare chart data
  const orderStatusData = [
    { name: 'Pending', value: stats.ordersByStatus?.pending || 0, color: '#fbbf24' },
    { name: 'Processing', value: stats.ordersByStatus?.processing || 0, color: '#60a5fa' },
    { name: 'Shipped', value: stats.ordersByStatus?.shipped || 0, color: '#a78bfa' },
    { name: 'Delivered', value: stats.ordersByStatus?.delivered || 0, color: '#34d399' },
    { name: 'Cancelled', value: stats.ordersByStatus?.cancelled || 0, color: '#f87171' },
    { name: 'Refunded', value: stats.ordersByStatus?.refunded || 0, color: '#ef4444' },
    { name: 'Partially Refunded', value: stats.ordersByStatus?.partially_refunded || 0, color: '#fb923c' },
  ].filter(item => item.value > 0);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl">
          <p className="text-white text-sm font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'revenue' ? `$${entry.value.toFixed(2)}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#ff6b35] border-t-transparent rounded-full"
          />
          <div className="text-center">
            <p className="text-xl text-white [data-theme='light']_&:text-gray-900 mb-1">Loading Dashboard</p>
            <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Fetching latest metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-2 bg-gradient-to-br from-[#ff6b35] to-[#ff8555] rounded-lg"
            >
              <BarChart3 className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-4xl text-white [data-theme='light']_&:text-gray-900">
              Dashboard Overview
            </h1>
          </div>
          <p className="text-gray-400 [data-theme='light']_&:text-gray-600 ml-14">
            Real-time insights into your business performance
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 [data-theme='light']_&:text-gray-500 mt-2 ml-14">
            <Clock className="w-3 h-3" />
            Last updated: {lastUpdated.toLocaleTimeString()}
            {stats.cached && stats.cacheAge && (
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">
                Cached {stats.cacheAge}s ago
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <div className="flex items-center gap-1 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-1 shadow-lg">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedPeriod === period.value
                    ? 'bg-[#ff6b35] text-white shadow-md'
                    : 'text-gray-400 hover:text-white [data-theme=\'light\']_&:text-gray-600 [data-theme=\'light\']_&:hover:text-gray-900 hover:bg-[#2a2a2a] [data-theme=\'light\']_&:hover:bg-gray-100'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
          
          {/* Refresh Button */}
          <motion.button
            onClick={handleRefresh}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg text-gray-400 hover:text-[#ff6b35] hover:border-[#ff6b35] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Error notification */}
      <AnimatePresence>
        {stats.error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/20 rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Unable to fetch complete data</p>
                  <p className="text-sm opacity-80">{stats.error}</p>
                </div>
              </div>
              <button
                onClick={() => fetchStats(selectedPeriod)}
                disabled={refreshing}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {refreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Retry Now
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stale Data Warning - Emergency Mode */}
      <AnimatePresence>
        {(stats.ordersByStatus?.delivered === 0 && stats.totalOrders > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-500 mb-1">Order Status Data May Be Outdated</p>
                <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                  These statistics are based on database statuses, which may be stale if webhooks are blocked. 
                  For accurate delivery counts, go to <strong>Orders tab</strong> and click <strong>"Refresh Live Status"</strong> to see real-time carrier data.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigate?.('orders')}
                    className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Go to Orders (Live Status)
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Metrics - Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue - Clickable */}
        <motion.button
          onClick={() => onNavigate?.('orders')}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] [data-theme='light']_&:from-white [data-theme='light']_&:to-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 hover:border-green-500 rounded-xl p-6 shadow-xl transition-all cursor-pointer text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                revenueTrend.isPositive 
                  ? 'bg-green-500/10 text-green-400' 
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {revenueTrend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(revenueTrend.value).toFixed(1)}%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Total Revenue</p>
              <p className="text-3xl text-white [data-theme='light']_&:text-gray-900">
                ${(stats.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 [data-theme='light']_&:text-gray-500">
                Avg: ${(stats.averageOrderValue || 0).toFixed(2)} per order
              </p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-4 h-4 text-green-400" />
            </div>
          </div>
        </motion.button>

        {/* Total Orders - Clickable */}
        <motion.button
          onClick={() => onNavigate?.('orders')}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] [data-theme='light']_&:from-white [data-theme='light']_&:to-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 hover:border-blue-500 rounded-xl p-6 shadow-xl transition-all cursor-pointer text-left group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                ordersTrend.isPositive 
                  ? 'bg-green-500/10 text-green-400' 
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {ordersTrend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(ordersTrend.value).toFixed(1)}%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Total Orders</p>
              <p className="text-3xl text-white [data-theme='light']_&:text-gray-900">
                {stats.totalOrders.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 [data-theme='light']_&:text-gray-500">
                {stats.ordersByStatus?.delivered || 0} delivered
              </p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-4 h-4 text-blue-400" />
            </div>
          </div>
        </motion.button>

        {/* Total Customers - Clickable */}
        <motion.button
          onClick={() => onNavigate?.('orders')}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] [data-theme='light']_&:from-white [data-theme='light']_&:to-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 hover:border-purple-500 rounded-xl p-6 shadow-xl transition-all cursor-pointer text-left group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                customerTrend.isPositive 
                  ? 'bg-green-500/10 text-green-400' 
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {customerTrend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(customerTrend.value).toFixed(1)}%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Total Customers</p>
              <p className="text-3xl text-white [data-theme='light']_&:text-gray-900">
                {stats.totalCustomers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 [data-theme='light']_&:text-gray-500">
                {stats.returningCustomers || 0} returning
              </p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-4 h-4 text-purple-400" />
            </div>
          </div>
        </motion.button>

        {/* Stock Photos - Clickable */}
        <motion.button
          onClick={() => onNavigate?.('photos')}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] [data-theme='light']_&:from-white [data-theme='light']_&:to-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 hover:border-[#ff6b35] rounded-xl p-6 shadow-xl transition-all cursor-pointer text-left group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-[#ff6b35] to-[#ff8555] rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                <Image className="w-6 h-6 text-white" />
              </div>
              {stats.lowStockItems > 0 && (
                <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  Alert
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Stock Photos</p>
              <p className="text-3xl text-white [data-theme='light']_&:text-gray-900">
                {stats.stockPhotos.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 [data-theme='light']_&:text-gray-500">
                Available in library
              </p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-4 h-4 text-[#ff6b35]" />
            </div>
          </div>
        </motion.button>
      </div>

      {/* Quick Actions & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-xl p-6 shadow-xl"
        >
          <div className="mb-6">
            <h3 className="text-xl text-white [data-theme='light']_&:text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#ff6b35]" />
              Quick Actions
            </h3>
            <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">
              Common tasks
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => onNavigate?.('orders')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] [data-theme='light']_&:from-gray-50 [data-theme='light']_&:to-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg hover:border-[#ff6b35] transition-all group"
            >
              <ShoppingBag className="w-6 h-6 text-[#ff6b35] mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-medium">View Orders</p>
              <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">Manage all orders</p>
            </motion.button>

            <motion.button
              onClick={() => onNavigate?.('photos')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] [data-theme='light']_&:from-gray-50 [data-theme='light']_&:to-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg hover:border-[#ff6b35] transition-all group"
            >
              <Image className="w-6 h-6 text-[#ff6b35] mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-medium">Upload Photos</p>
              <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">Add stock images</p>
            </motion.button>

            <motion.button
              onClick={() => onNavigate?.('inventory')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] [data-theme='light']_&:from-gray-50 [data-theme='light']_&:to-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg hover:border-[#ff6b35] transition-all group"
            >
              <Package className="w-6 h-6 text-[#ff6b35] mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-medium">Inventory</p>
              <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">Manage stock</p>
            </motion.button>

            <motion.button
              onClick={handleRefresh}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] [data-theme='light']_&:from-gray-50 [data-theme='light']_&:to-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg hover:border-[#ff6b35] transition-all group"
            >
              <RefreshCw className="w-6 h-6 text-[#ff6b35] mb-2 group-hover:rotate-180 transition-transform duration-500" />
              <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-medium">Refresh Data</p>
              <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">Update metrics</p>
            </motion.button>
          </div>
        </motion.div>

        {/* Order Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-xl p-6 shadow-xl"
        >
          <div className="mb-6">
            <h3 className="text-xl text-white [data-theme='light']_&:text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#ff6b35]" />
              Order Status
            </h3>
            <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">
              Current distribution
            </p>
          </div>
          {orderStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPie>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #2a2a2a',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {orderStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm text-white [data-theme='light']_&:text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No orders yet
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}