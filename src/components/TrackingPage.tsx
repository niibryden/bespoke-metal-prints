import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Package, MapPin, Truck, CheckCircle, Search, Loader2, ExternalLink, Calendar, Info, X, Weight, User, FileText } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TrackingPageProps {
  onClose: () => void;
  initialTrackingNumber?: string;
  initialOrderId?: string | null;
}

interface TrackingDetail {
  status: string;
  message: string;
  datetime: string;
  location: string;
  tracking_location?: {
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
}

interface TrackingData {
  tracking_code: string;
  status: string;
  carrier: string;
  est_delivery_date: string;
  tracking_details: TrackingDetail[];
  public_url?: string;
  weight?: number;
  signed_by?: string;
  tracking_location?: {
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  carrier_detail?: {
    code?: string;
    description?: string;
    service?: string;
    container_type?: string;
    destination_location?: string;
    origin_location?: string;
  };
  shipment_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function TrackingPage({ onClose, initialTrackingNumber = '', initialOrderId = null }: TrackingPageProps) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [liveTrackingStatus, setLiveTrackingStatus] = useState<string | null>(null);
  const [emailOrders, setEmailOrders] = useState<any[]>([]);
  const [showEmailResults, setShowEmailResults] = useState(false);

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;

  // Auto-load tracking if order ID is provided
  useEffect(() => {
    if (initialOrderId) {
      loadOrderTracking(initialOrderId);
    } else if (initialTrackingNumber) {
      trackPackage();
    }
  }, [initialOrderId, initialTrackingNumber]);

  // Fetch live tracking data from EasyPost when we have a tracking number
  useEffect(() => {
    if (orderInfo?.trackingNumber && !trackingData) {
      fetchLiveTracking(orderInfo.trackingNumber);
    }
  }, [orderInfo]);

  const fetchLiveTracking = async (trackingNum: string) => {
    try {
      console.log(`📦 Fetching live tracking data for: ${trackingNum}`);
      const response = await fetch(`${serverUrl}/tracking/${trackingNum}/live`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      console.log(`📡 Live tracking response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Live tracking not available:', errorData);
        console.warn('Using database status instead');
        return;
      }

      const data = await response.json();
      console.log('📡 Live tracking response:', data);
      
      if (data.success && data.tracking) {
        console.log(`✅ Live tracking status: ${data.tracking.status}`);
        setLiveTrackingStatus(data.tracking.status);
        // Optionally, you could set the full tracking data here if you want detailed tracking info
        // setTrackingData(data.tracking);
      }
    } catch (error) {
      console.error('Error fetching live tracking:', error);
      // Silently fail - we'll just show the database status
    }
  };

  const loadOrderTracking = async (orderId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`📦 Loading tracking for order: ${orderId}`);
      const response = await fetch(`${serverUrl}/order/${orderId}/tracking`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Order not found');
      }

      const data = await response.json();
      setOrderInfo(data);

      // If we have a tracking number, display the order info
      if (data.trackingNumber) {
        setTrackingNumber(data.trackingNumber);
        // Show basic order information without fetching from EasyPost
        // The order data already contains trackingNumber, trackingCarrier, trackingUrl, etc.
        setError(null);
      } else {
        // Order hasn't shipped yet, show message
        setError(data.message || 'Your order is being prepared and will ship soon!');
      }
    } catch (err: any) {
      console.error('Error loading order tracking:', err);
      setError(err.message || 'Failed to load order information');
    } finally {
      setLoading(false);
    }
  };

  const trackPackageByNumber = async (number: string) => {
    try {
      const response = await fetch(`${serverUrl}/tracking/${number}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Provide more helpful error messages
        if (response.status === 404) {
          const errorMessage = errorData.details 
            ? errorData.details
            : 'This tracking number or order ID was not found in our system. Please check:\n\nn• Order IDs start with "ord_"\n• Tracking numbers are sent via email after your order ships\n• Make sure there are no typos or extra spaces';
          throw new Error(errorMessage);
        }
        
        const errorMessage = errorData.details 
          ? `${errorData.error}. ${errorData.details}` 
          : (errorData.error || 'Failed to fetch tracking information');
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // The tracking endpoint now returns order info (same format as /order/:id/tracking)
      setOrderInfo(data);
      setTrackingNumber(data.trackingNumber || number);
    } catch (err: any) {
      throw err;
    }
  };

  const trackByEmail = async (email: string) => {
    try {
      console.log(`📧 Tracking orders by email: ${email}`);
      const response = await fetch(`${serverUrl}/tracking/by-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'No orders found for this email');
      }

      const data = await response.json();
      setEmailOrders(data.orders);
      setShowEmailResults(true);
      setError(null);
    } catch (err: any) {
      throw err;
    }
  };

  const trackPackage = async () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number, order ID, or email address');
      return;
    }

    setLoading(true);
    setError(null);
    setShowEmailResults(false);
    setEmailOrders([]);

    try {
      // Check if input looks like an email
      if (trackingNumber.includes('@')) {
        await trackByEmail(trackingNumber);
      } else if (trackingNumber.startsWith('ord_')) {
        // Order ID
        await loadOrderTracking(trackingNumber);
      } else {
        // Tracking number
        await trackPackageByNumber(trackingNumber);
      }
    } catch (err: any) {
      console.error('Error fetching tracking:', err);
      setError(err.message || 'Failed to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      trackPackage();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'out_for_delivery':
        return <Truck className="w-8 h-8 text-[#ff6b35]" />;
      case 'in_transit':
        return <Package className="w-8 h-8 text-blue-500" />;
      case 'pre_transit':
        return <MapPin className="w-8 h-8 text-gray-500" />;
      default:
        return <Package className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'out_for_delivery':
        return 'bg-[#ff6b35]/10 text-[#ff6b35] border-[#ff6b35]/30';
      case 'in_transit':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'pre_transit':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-white dark:bg-[#0a0a0a] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-200 dark:border-[#ff6b35]/20 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-full transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </motion.button>
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-[#ff6b35]" />
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  Track Your Order
                </h1>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-full transition-colors"
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        {/* Search Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-gradient-to-br from-[#ff6b35]/10 to-[#ff6b35]/5 dark:from-[#ff6b35]/5 dark:to-[#ff6b35]/10 rounded-2xl p-6 sm:p-8 border border-[#ff6b35]/20">
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-5 h-5 text-[#ff6b35] mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Enter your order ID, tracking number, or email address to track your order
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  💡 Guest orders: Use your email address to view all your orders
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Enter order ID, tracking number, or email..."
                  className={`w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1a1a1a] border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all ${
                    inputFocused 
                      ? 'border-[#ff6b35] ring-4 ring-[#ff6b35]/10' 
                      : 'border-gray-300 dark:border-[#2a2a2a]'
                  } hover:border-[#ff6b35]/50`}
                />
              </div>
              <motion.button
                onClick={trackPackage}
                disabled={loading || !trackingNumber.trim()}
                className="px-8 py-4 bg-[#ff6b35] text-white font-medium rounded-xl hover:bg-[#ff8555] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ff6b35]/20 flex items-center justify-center gap-2 whitespace-nowrap"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Track Package
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <Info className="w-5 h-5" />
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email-based order results */}
        <AnimatePresence>
          {showEmailResults && emailOrders.length > 0 && (
            <motion.div
              className="mb-8 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="w-6 h-6 text-[#ff6b35]" />
                Your Orders ({emailOrders.length})
              </h2>
              
              <div className="grid gap-4">
                {emailOrders.map((order) => (
                  <motion.div
                    key={order.orderId}
                    className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden hover:shadow-lg transition-shadow"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
                          <p className="font-mono text-gray-900 dark:text-white">{order.orderId}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                          order.status === 'shipped' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                          'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400'
                        }`}>
                          {order.status === 'delivered' ? 'Delivered' : 
                           order.status === 'shipped' ? 'Shipped' : 
                           'Processing'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
                          <p className="text-gray-900 dark:text-white">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                          <p className="text-gray-900 dark:text-white">${order.amount.toFixed(2)}</p>
                        </div>
                        {order.orderDetails && (
                          <>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Size</p>
                              <p className="text-gray-900 dark:text-white">{order.orderDetails.size}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Finish</p>
                              <p className="text-gray-900 dark:text-white">{order.orderDetails.finish}</p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {order.trackingNumber && (
                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-[#2a2a2a]">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-[#ff6b35]" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {order.trackingCarrier || 'USPS'}: {order.trackingNumber}
                            </span>
                          </div>
                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-[#ff6b35] hover:text-[#ff8555] transition-colors"
                            >
                              Track
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tracking Results */}
        <AnimatePresence mode="wait">
          {/* Show order info when loaded by order ID */}
          {orderInfo && orderInfo.trackingNumber && !trackingData && !showEmailResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Order Summary Card */}
              <motion.div
                className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden shadow-xl"
              >
                <div className="bg-gradient-to-r from-[#ff6b35]/10 to-[#ff6b35]/5 dark:from-[#ff6b35]/5 dark:to-[#ff6b35]/10 p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl shadow-lg">
                      {liveTrackingStatus ? getStatusIcon(liveTrackingStatus) : <Truck className="w-8 h-8 text-[#ff6b35]" />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Order Status</p>
                      <h2 className="text-2xl font-semibold text-[#ff6b35]">
                        {liveTrackingStatus ? formatStatus(liveTrackingStatus) : 
                         orderInfo.status === 'shipped' ? 'Shipped' : 
                         orderInfo.status === 'delivered' ? 'Delivered' : 
                         'In Transit'}
                      </h2>
                      {liveTrackingStatus && liveTrackingStatus !== orderInfo.status && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          📡 Live status from carrier
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-[#ff6b35] mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
                        <p className="font-mono text-gray-900 dark:text-white">{orderInfo.orderId}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-[#ff6b35] mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</p>
                        <p className="font-mono text-gray-900 dark:text-white">{orderInfo.trackingNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-[#ff6b35] mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Carrier</p>
                        <p className="font-medium text-gray-900 dark:text-white">{orderInfo.trackingCarrier || 'USPS'}</p>
                      </div>
                    </div>
                    {orderInfo.shippedAt && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-[#ff6b35] mt-1" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Shipped On</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(orderInfo.shippedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {orderInfo.trackingUrl && (
                    <div className="mt-4">
                      <a
                        href={orderInfo.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-white rounded-xl hover:bg-[#ff8555] transition-all shadow-lg shadow-[#ff6b35]/20"
                      >
                        Track on {orderInfo.trackingCarrier || 'Carrier'} Website
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {orderInfo.shippingAddress && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#ff6b35]" />
                      Shipping Address
                    </h3>
                    <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4 border border-gray-200 dark:border-[#2a2a2a]">
                      <p className="font-medium text-gray-900 dark:text-white">{orderInfo.shippingAddress.name}</p>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{orderInfo.shippingAddress.line1}</p>
                      {orderInfo.shippingAddress.line2 && (
                        <p className="text-gray-600 dark:text-gray-400">{orderInfo.shippingAddress.line2}</p>
                      )}
                      <p className="text-gray-600 dark:text-gray-400">
                        {orderInfo.shippingAddress.city}, {orderInfo.shippingAddress.state} {orderInfo.shippingAddress.postal_code}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">{orderInfo.shippingAddress.country}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {trackingData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <motion.div
                className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden shadow-xl"
                whileHover={{ boxShadow: '0 25px 50px rgba(255, 107, 53, 0.1)' }}
              >
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-[#ff6b35]/10 to-[#ff6b35]/5 dark:from-[#ff6b35]/5 dark:to-[#ff6b35]/10 p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl shadow-lg">
                        {getStatusIcon(trackingData.status)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Status</p>
                        <h2 className={`text-2xl font-semibold ${getStatusColor(trackingData.status).split(' ')[1]}`}>
                          {formatStatus(trackingData.status)}
                        </h2>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(trackingData.status)}`}>
                        {trackingData.carrier}
                      </span>
                      {trackingData.public_url && (
                        <a
                          href={trackingData.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#ff6b35] text-white rounded-full hover:bg-[#ff8555] transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-[#ff6b35]/20"
                        >
                          View on {trackingData.carrier}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-[#ff6b35] mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</p>
                        <p className="font-mono text-gray-900 dark:text-white">{trackingData.tracking_code}</p>
                      </div>
                    </div>
                    {trackingData.est_delivery_date && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-[#ff6b35] mt-1" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(trackingData.est_delivery_date)}
                          </p>
                        </div>
                      </div>
                    )}
                    {trackingData.weight && (
                      <div className="flex items-start gap-3">
                        <Weight className="w-5 h-5 text-[#ff6b35] mt-1" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {trackingData.weight} oz
                          </p>
                        </div>
                      </div>
                    )}
                    {trackingData.signed_by && (
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-[#ff6b35] mt-1" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Signed By</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {trackingData.signed_by}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Current Location Card */}
              {trackingData.tracking_location && (
                <motion.div
                  className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] p-6 shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-[#ff6b35]" />
                    Current Location
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#ff6b35]/10 rounded-xl">
                      <MapPin className="w-6 h-6 text-[#ff6b35]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {[
                          trackingData.tracking_location.city,
                          trackingData.tracking_location.state,
                          trackingData.tracking_location.country
                        ].filter(Boolean).join(', ')}
                      </p>
                      {trackingData.tracking_location.zip && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {trackingData.tracking_location.zip}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Carrier Details Card */}
              {trackingData.carrier_detail && (trackingData.carrier_detail.service || trackingData.carrier_detail.description || trackingData.carrier_detail.container_type || trackingData.carrier_detail.origin_location || trackingData.carrier_detail.destination_location) && (
                <motion.div
                  className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] p-6 shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.17 }}
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-[#ff6b35]" />
                    Shipment Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {trackingData.carrier_detail.service && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Service Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {trackingData.carrier_detail.service}
                        </p>
                      </div>
                    )}
                    {trackingData.carrier_detail.container_type && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Container Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {trackingData.carrier_detail.container_type}
                        </p>
                      </div>
                    )}
                    {trackingData.carrier_detail.origin_location && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Origin</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {trackingData.carrier_detail.origin_location}
                        </p>
                      </div>
                    )}
                    {trackingData.carrier_detail.destination_location && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Destination</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {trackingData.carrier_detail.destination_location}
                        </p>
                      </div>
                    )}
                    {trackingData.carrier_detail.description && (
                      <div className="sm:col-span-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {trackingData.carrier_detail.description}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tracking Timeline */}
              {trackingData.tracking_details && trackingData.tracking_details.length > 0 && (
                <motion.div
                  className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] p-6 shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-[#ff6b35]" />
                    Tracking History
                  </h3>
                  
                  <div className="space-y-4">
                    {trackingData.tracking_details.map((detail, index) => {
                      const { date, time } = formatDateTime(detail.datetime);
                      const isFirst = index === 0;
                      
                      return (
                        <motion.div
                          key={index}
                          className="relative pl-8 pb-6 last:pb-0"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          {/* Timeline line */}
                          {index < trackingData.tracking_details.length - 1 && (
                            <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-gradient-to-b from-[#ff6b35]/50 to-gray-200 dark:to-[#2a2a2a]" />
                          )}
                          
                          {/* Timeline dot */}
                          <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 ${
                            isFirst 
                              ? 'bg-[#ff6b35] border-[#ff6b35] shadow-lg shadow-[#ff6b35]/50' 
                              : 'bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-[#2a2a2a]'
                          }`}>
                            {isFirst && (
                              <motion.div
                                className="absolute inset-0 rounded-full bg-[#ff6b35]"
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            )}
                          </div>
                          
                          <div className={`${isFirst ? 'bg-[#ff6b35]/5 dark:bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-xl p-4' : ''}`}>
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div className="flex-1">
                                <p className={`font-medium mb-1 ${isFirst ? 'text-[#ff6b35]' : 'text-gray-900 dark:text-white'}`}>
                                  {detail.message}
                                </p>
                                {detail.location && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {detail.location}
                                  </p>
                                )}
                                {detail.tracking_location && (detail.tracking_location.city || detail.tracking_location.state) && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {[
                                      detail.tracking_location.city,
                                      detail.tracking_location.state,
                                      detail.tracking_location.zip,
                                      detail.tracking_location.country
                                    ].filter(Boolean).join(', ')}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{date}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!trackingData && !orderInfo && !loading && !error && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-[#ff6b35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-[#ff6b35]" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Ready to track your order?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your order ID or tracking number above to see your package's journey
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}