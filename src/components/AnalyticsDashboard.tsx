import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Eye, Camera, Image, Download, Calendar, BarChart3 } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { getServerUrl } from '../utils/serverUrl';

interface AnalyticsData {
  revenue: {
    today: number;
    yesterday: number;
    this_week: number;
    last_week: number;
    this_month: number;
    last_month: number;
    all_time: number;
  };
  orders: {
    today: number;
    this_week: number;
    this_month: number;
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  customers: {
    total: number;
    new_this_month: number;
    returning_rate: number;
  };
  photographers: {
    total: number;
    active: number;
    pending_approval: number;
    total_photos: number;
    approved_photos: number;
  };
  top_products: Array<{
    size: string;
    sales: number;
    revenue: number;
  }>;
  recent_sales: Array<{
    id: string;
    date: string;
    customer: string;
    amount: number;
    status: string;
  }>;
}

interface ChartData {
  labels: string[];
  revenue: number[];
  orders: number[];
}

export function AnalyticsDashboard({ isPhotographer = false }: { isPhotographer?: boolean }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const supabase = getSupabaseClient();

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const serverUrl = getServerUrl();
      
      // If no server URL or not authenticated, use mock data
      if (!serverUrl || !session) {
        console.log('Using mock analytics data (no server or not authenticated)');
        loadMockData();
        setLoading(false);
        return;
      }

      const endpoint = isPhotographer 
        ? '/photographer/analytics' 
        : '/admin/analytics';

      const response = await fetch(`${serverUrl}/make-server-3e3a9cd7${endpoint}?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
      setChartData(data.chart_data);
      
    } catch (err) {
      console.error('Error loading analytics:', err);
      // Use mock data as fallback
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockAnalytics = {
      revenue: {
        today: 1247.89,
        yesterday: 892.45,
        this_week: 5234.67,
        last_week: 4891.23,
        this_month: 18392.45,
        last_month: 16782.34,
        all_time: 125483.92,
      },
      orders: {
        today: 12,
        this_week: 48,
        this_month: 187,
        total: 1245,
        pending: 8,
        completed: 1205,
        cancelled: 32,
      },
      customers: {
        total: 842,
        new_this_month: 67,
        returning_rate: 42,
      },
      photographers: {
        total: 34,
        active: 28,
        pending_approval: 3,
        total_photos: 1247,
        approved_photos: 1189,
      },
      top_products: [
        { size: '12" × 8"', sales: 234, revenue: 11696.66 },
        { size: '16" × 24"', sales: 189, revenue: 20789.11 },
        { size: '24" × 16"', sales: 156, revenue: 17156.44 },
      ],
      recent_sales: [
        { id: '1', date: new Date().toISOString(), customer: 'John D.', amount: 89.99, status: 'completed' },
        { id: '2', date: new Date().toISOString(), customer: 'Sarah M.', amount: 149.99, status: 'pending' },
      ],
    };

    const mockChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      revenue: [842, 1247, 934, 1456, 1123, 1892, 1678],
      orders: [8, 12, 9, 14, 11, 18, 16],
    };

    setAnalytics(mockAnalytics);
    setChartData(mockChartData);
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const exportData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please log in to export data');
        return;
      }

      const serverUrl = getServerUrl();
      if (!serverUrl) {
        setError('Backend not available. Please try again later.');
        return;
      }

      const endpoint = isPhotographer 
        ? '/photographer/export-analytics' 
        : '/admin/export-analytics';

      const response = await fetch(`${serverUrl}/make-server-3e3a9cd7${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to export data');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No analytics data available</p>
      </div>
    );
  }

  const revenueChange = calculateChange(analytics.revenue.this_month, analytics.revenue.last_month);
  const ordersChange = calculateChange(analytics.orders.this_month, analytics.orders.this_week);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900">
            {isPhotographer ? 'Your Analytics' : 'Analytics Dashboard'}
          </h1>
          <p className="text-gray-400 mt-1 [data-theme='light']_&:text-gray-600">
            Track your performance and insights
          </p>
        </div>

        <div className="flex gap-3">
          {/* Timeframe Selector */}
          <div className="flex bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-4 py-2 text-sm transition-colors ${
                timeframe === 'week'
                  ? 'bg-[#ff6b35] text-white'
                  : 'text-gray-400 hover:text-white [data-theme=\'light\']_&:text-gray-600 [data-theme=\'light\']_&:hover:text-gray-900'
              }`}
              aria-label="View week analytics"
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-4 py-2 text-sm transition-colors ${
                timeframe === 'month'
                  ? 'bg-[#ff6b35] text-white'
                  : 'text-gray-400 hover:text-white [data-theme=\'light\']_&:text-gray-600 [data-theme=\'light\']_&:hover:text-gray-900'
              }`}
              aria-label="View month analytics"
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('year')}
              className={`px-4 py-2 text-sm transition-colors ${
                timeframe === 'year'
                  ? 'bg-[#ff6b35] text-white'
                  : 'text-gray-400 hover:text-white [data-theme=\'light\']_&:text-gray-600 [data-theme=\'light\']_&:hover:text-gray-900'
              }`}
              aria-label="View year analytics"
            >
              Year
            </button>
          </div>

          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg border border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors [data-theme='light']_&:bg-white [data-theme='light']_&:text-gray-900 [data-theme='light']_&:border-gray-300"
            aria-label="Export analytics data"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            {revenueChange >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <p className="text-gray-400 text-sm mb-1 [data-theme='light']_&:text-gray-600">Revenue (This Month)</p>
          <p className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900">
            ${analytics.revenue.this_month.toFixed(2)}
          </p>
          <p className={`text-sm mt-2 ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% from last month
          </p>
        </motion.div>

        {/* Orders */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#ff6b35]/20 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[#ff6b35]" />
            </div>
            {ordersChange >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <p className="text-gray-400 text-sm mb-1 [data-theme='light']_&:text-gray-600">Orders (This Month)</p>
          <p className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900">
            {analytics.orders.this_month}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {analytics.orders.pending} pending • {analytics.orders.completed} completed
          </p>
        </motion.div>

        {/* Customers or Photos */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              {isPhotographer ? (
                <Camera className="w-6 h-6 text-blue-500" />
              ) : (
                <Users className="w-6 h-6 text-blue-500" />
              )}
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1 [data-theme='light']_&:text-gray-600">
            {isPhotographer ? 'Total Photos' : 'Total Customers'}
          </p>
          <p className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900">
            {isPhotographer ? analytics.photographers.total_photos : analytics.customers.total}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {isPhotographer 
              ? `${analytics.photographers.approved_photos} approved`
              : `${analytics.customers.new_this_month} new this month`
            }
          </p>
        </motion.div>

        {/* Photographers or Views */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              {isPhotographer ? (
                <Eye className="w-6 h-6 text-purple-500" />
              ) : (
                <Camera className="w-6 h-6 text-purple-500" />
              )}
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1 [data-theme='light']_&:text-gray-600">
            {isPhotographer ? 'Photo Views' : 'Photographers'}
          </p>
          <p className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900">
            {isPhotographer ? '2,847' : analytics.photographers.total}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {isPhotographer 
              ? '+342 this week'
              : `${analytics.photographers.pending_approval} pending approval`
            }
          </p>
        </motion.div>
      </div>

      {/* Chart */}
      {chartData && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white [data-theme='light']_&:text-gray-900">
              Revenue & Orders Trend
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          {/* Simple bar chart */}
          <div className="space-y-4">
            {chartData.labels.map((label, index) => {
              const maxRevenue = Math.max(...chartData.revenue);
              const maxOrders = Math.max(...chartData.orders);
              const revenuePercent = (chartData.revenue[index] / maxRevenue) * 100;
              const ordersPercent = (chartData.orders[index] / maxOrders) * 100;
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                      {label}
                    </span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-500">
                        ${chartData.revenue[index].toFixed(0)}
                      </span>
                      <span className="text-blue-500">
                        {chartData.orders[index]} orders
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden [data-theme='light']_&:bg-gray-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${revenuePercent}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full bg-green-500"
                      />
                    </div>
                    <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden [data-theme='light']_&:bg-gray-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ordersPercent}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Products / Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        {!isPhotographer && analytics.top_products && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300">
            <h3 className="text-xl font-semibold text-white mb-4 [data-theme='light']_&:text-gray-900">
              Top Products
            </h3>
            <div className="space-y-3">
              {analytics.top_products.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg [data-theme='light']_&:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#ff6b35]/20 rounded-full flex items-center justify-center text-[#ff6b35] font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium [data-theme='light']_&:text-gray-900">
                        {product.size}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.sales} sales
                      </p>
                    </div>
                  </div>
                  <p className="text-green-500 font-semibold">
                    ${product.revenue.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sales */}
        {analytics.recent_sales && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300">
            <h3 className="text-xl font-semibold text-white mb-4 [data-theme='light']_&:text-gray-900">
              Recent Sales
            </h3>
            <div className="space-y-3">
              {analytics.recent_sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg [data-theme='light']_&:bg-gray-50">
                  <div>
                    <p className="text-white font-medium [data-theme='light']_&:text-gray-900">
                      {sale.customer}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(sale.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold [data-theme='light']_&:text-gray-900">
                      ${sale.amount.toFixed(2)}
                    </p>
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full
                      ${sale.status === 'completed' ? 'bg-green-500/20 text-green-500' : ''}
                      ${sale.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : ''}
                    `}>
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}