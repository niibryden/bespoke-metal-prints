import { memo, useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Calendar, DollarSign, Truck, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface Order {
  id: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  trackingNumber?: string;
  items?: any;
}

interface VirtualOrderListProps {
  onViewOrder: (order: Order) => void;
  adminEmail: string;
}

const ITEM_HEIGHT = 120; // Height of each order row in pixels
const BUFFER_SIZE = 5; // Number of items to render above/below viewport
const PAGE_SIZE = 20; // Number of orders to fetch per page

// Memoized order row component to prevent unnecessary re-renders
const OrderRow = memo(({ order, onViewOrder }: { order: Order; onViewOrder: (order: Order) => void }) => {
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="p-4 flex items-center gap-4">
        {/* Order Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-orange-600" />
        </div>

        {/* Order Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 truncate">
              {order.customerEmail}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(order.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              ${order.totalAmount?.toFixed(2) || '0.00'}
            </span>
            {order.trackingNumber && (
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                {order.trackingNumber}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewOrder(order)}
            className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Order ID:</span>
                  <span className="ml-2 font-mono text-gray-900">{order.id}</span>
                </div>
                {order.items && (
                  <div>
                    <span className="text-gray-600">Items:</span>
                    <span className="ml-2 text-gray-900">{order.items.quantity || 1}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if order ID changes (prevents unnecessary re-renders)
  return prevProps.order.id === nextProps.order.id;
});

OrderRow.displayName = 'OrderRow';

export const VirtualOrderList = memo(({ onViewOrder, adminEmail }: VirtualOrderListProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // Fetch orders
  const fetchOrders = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-3e3a9cd7/admin/orders?limit=${PAGE_SIZE}&offset=${pageNum * PAGE_SIZE}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Email': adminEmail,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      
      if (pageNum === 0) {
        setOrders(data.orders || []);
      } else {
        setOrders(prev => [...prev, ...(data.orders || [])]);
      }
      
      setHasMore(data.hasMore || false);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [adminEmail]);

  // Initial load
  useEffect(() => {
    fetchOrders(0);
  }, [fetchOrders]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);

    // Load more when scrolled near bottom
    if (
      !loading &&
      hasMore &&
      target.scrollHeight - target.scrollTop - target.clientHeight < 200
    ) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOrders(nextPage);
    }
  }, [loading, hasMore, page, fetchOrders]);

  // Update container height on mount
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, []);

  // Calculate visible range (virtual scrolling)
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
  const endIndex = Math.min(
    orders.length,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
  );
  const visibleOrders = orders.slice(startIndex, endIndex);
  const totalHeight = orders.length * ITEM_HEIGHT;
  const offsetY = startIndex * ITEM_HEIGHT;

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => fetchOrders(0)}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-y-auto"
        style={{ height: '600px' }}
      >
        {/* Virtual scrolling container */}
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleOrders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onViewOrder={onViewOrder}
              />
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center h-96">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600">Orders will appear here once customers place them.</p>
          </div>
        )}
      </div>

      {/* Footer with order count */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
          </span>
          {hasMore && (
            <span className="text-orange-600">Scroll to load more...</span>
          )}
        </div>
      </div>
    </div>
  );
});

VirtualOrderList.displayName = 'VirtualOrderList';