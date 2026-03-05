import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, Search, Eye, Truck, CheckCircle, Clock, XCircle, ExternalLink, Printer, Ban, DollarSign, Loader2, Download, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/config';
import { getServerUrl } from '../../utils/serverUrl';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { SyncOrderFromStripe } from './SyncOrderFromStripe';

interface Order {
  id: string;
  customerEmail: string;
  amount: number;
  status: string;
  paymentStatus?: string;
  trackingNumber?: string;
  trackingCarrier?: string;
  trackingUrl?: string;
  createdAt: string;
  shippedAt?: string;
  refundedAmount?: number;
  refundedAt?: string;
  refundReason?: string;
  labelVoided?: boolean;
  shippingRefundAmount?: number;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  orderDetails: {
    size?: string;
    finish?: string;
    mounting?: string;
    imageUrl?: string;
    image?: string; // Print-ready cropped image
  };
  basePrice?: number;
  discount?: {
    code: string;
    discountAmount: number;
    type: 'percentage' | 'fixed';
    value: number;
  };
  shippingRate?: {
    service: string;
    rate: string;
  };
  // Live tracking data
  liveStatus?: string;
  liveStatusTimestamp?: string;
  liveStatusLoading?: boolean;
}

export function OrderManagement({ adminInfo }: { adminInfo?: { email: string; role: string; name: string; permissions: any; accessToken: string } }) {
  // Helper to get auth header with admin access token
  const getAuthHeader = () => `Bearer ${adminInfo?.accessToken || publicAnonKey}`;
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [generatingLabel, setGeneratingLabel] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('requested_by_customer');
  const [processingRefund, setProcessingRefund] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState<string | null>(null);
  const [downloadingLabel, setDownloadingLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStaleData, setIsStaleData] = useState(false);
  const [voidingLabel, setVoidingLabel] = useState(false);
  const [syncingTracking, setSyncingTracking] = useState(false);
  const [refreshingLiveStatus, setRefreshingLiveStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch more orders to ensure recent orders appear
      const timestamp = Date.now();
      const response = await fetch(
        `${getServerUrl()}/admin/orders?limit=100&offset=0&t=${timestamp}`,
        {
          headers: {
            'Authorization': getAuthHeader(),
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      
      // Check if data has an error
      if (data.error) {
        setError(data.error);
        console.warn('⚠️ Orders API returned error:', data.error, data.details);
      }
      
      // Check if we're using stale cached data
      if (data.stale) {
        setIsStaleData(true);
        console.warn('⚠️ Using stale cached data');
      } else {
        setIsStaleData(false);
      }
      
      console.log('📦 Orders received from API:', {
        count: data.orders?.length || 0,
        orders: data.orders,
        cached: data.cached,
        stale: data.stale
      });
      
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const emergencyDebugOrders = async () => {
    setLoading(true);
    setEmergencyDebugData(null);
    try {
      const response = await fetch(
        `${getServerUrl()}/emergency-find-orders`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch debug data');
      }

      const data = await response.json();
      console.log('🚨 EMERGENCY DEBUG DATA:', data);
      setEmergencyDebugData(data);
      
      // Also update orders with the recent orders from debug data
      if (data.recentOrders && data.recentOrders.length > 0) {
        setOrders(data.recentOrders);
        setError(null);
        alert(`Found ${data.totalOrders} total orders in database!\n\nShowing ${data.recentOrders.length} most recent orders.`);
      } else {
        alert(`No orders found in database. Total count: ${data.totalOrders}`);
      }
    } catch (error) {
      console.error('Error in emergency debug:', error);
      alert(`Emergency debug failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const emergencyRecoverOrder = async () => {
    if (!recoveryPaymentIntentId.trim()) {
      alert('Please enter a payment intent ID');
      return;
    }
    
    setRecoveringOrder(true);
    try {
      console.log('🚨 EMERGENCY: Recovering order from payment intent:', recoveryPaymentIntentId);
      
      const response = await fetch(
        `${getServerUrl()}/emergency-recover-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
          body: JSON.stringify({ paymentIntentId: recoveryPaymentIntentId.trim() }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to recover order');
      }

      const data = await response.json();
      console.log('✅ Order recovery result:', data);
      
      if (data.alreadyExists) {
        alert(`Order already exists!\n\nOrder ID: ${data.order.id}\nCustomer: ${data.order.customerEmail}\nAmount: $${data.order.amount}\n\nThe order is already in the database.`);
      } else {
        alert(`✅ Order recovered successfully!\n\nOrder ID: ${data.order.id}\nCustomer: ${data.order.customerEmail}\nAmount: $${data.order.amount}\nCreated: ${new Date(data.order.createdAt).toLocaleString()}\n\n${data.warning || 'Order has been added to the database!'}`);
      }
      
      // Refresh orders list
      await fetchOrders();
      
      // Close modal and reset form
      setShowRecoveryModal(false);
      setRecoveryPaymentIntentId('');
      
    } catch (error: any) {
      console.error('Error recovering order:', error);
      alert(`Failed to recover order:\n\n${error.message}`);
    } finally {
      setRecoveringOrder(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'shipped':
        return 'text-green-500 bg-green-500/10';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'cancelled':
      case 'failed':
      case 'refunded':
      case 'partially_refunded':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
      case 'failed':
      case 'refunded':
      case 'partially_refunded':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        (order.id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (order.customerEmail?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (order.trackingNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      // Show all order statuses including pending
      const validStatuses = ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'partially_refunded'];
      const isValidStatus = validStatuses.includes(order.status);

      return matchesSearch && matchesStatus && isValidStatus;
    })
    .sort((a, b) => {
      // Sort by createdAt descending (most recent first)
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadPrintImage = async (order: Order) => {
    console.log('🖨️ Downloading print-ready image');
    console.log('Order ID:', order.id);
    console.log('Print Size:', order.orderDetails?.size);
    
    setDownloadingImage(order.id);
    
    try {
      const response = await fetch(
        `${getServerUrl()}/admin/download/print-ready/${order.id}`,
        {
          headers: {
            'Authorization': getAuthHeader(),
            'X-Admin-Email': adminInfo?.email || '',
          },
        }
      );
      
      if (!response.ok) {
        console.warn('Server download failed, using direct download');
        if (order.orderDetails?.image) {
          const link = document.createElement('a');
          link.href = order.orderDetails.image;
          link.download = `PRINT_READY_${order.id}_${order.orderDetails.size?.replace(/[\\"\\\s×x]/g, '_') || 'custom'}.png`;
          link.click();
        }
        setDownloadingImage(null);
        return;
      }
      
      const printSize = response.headers.get('X-Print-Size') || order.orderDetails?.size;
      const printInstructions = response.headers.get('X-Print-Instructions');
      const fileFormat = response.headers.get('X-File-Format') || 'PNG';
      
      console.log('Print Instructions:', printInstructions);
      console.log('Print Size:', printSize);
      console.log('File Format:', fileFormat);
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileExt = fileFormat.toLowerCase();
      link.download = `PRINT_READY_${order.id}_${printSize?.replace(/[\\"\\\s×x]/g, '_') || 'custom'}.${fileExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      alert(`✅ Print-ready file downloaded!\n\nPrint Instructions:\n${printInstructions || 'Print at actual size with no scaling.'}`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download print-ready file. Please try again.');
    } finally {
      setDownloadingImage(null);
    }
  };

  const handleGenerateLabel = async (order: Order) => {
    setGeneratingLabel(order.id);
    try {
      // Verify admin info is available
      if (!adminInfo?.email) {
        throw new Error('Admin information not available. Please log in again.');
      }
      
      console.log('🏷️ Generating label for order:', order.id);
      console.log('Order details:', {
        id: order.id,
        status: order.status,
        hasShipmentId: !!order.shipmentId,
        hasTrackingNumber: !!order.trackingNumber,
        shippingAddress: order.shippingAddress,
      });
      
      // Log the URL we're calling
      const url = `${getServerUrl()}/admin/generate-label/${order.id}`;
      console.log('📡 Calling endpoint:', url);
      console.log('📡 Admin email:', adminInfo.email);
      console.log('📡 Project ID:', projectId);
      
      // Create an AbortController with a 90 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('⏱️ Request timeout after 90 seconds');
      }, 90000); // 90 seconds
      
      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
            'X-Admin-Email': adminInfo.email,
          },
          signal: controller.signal,
        }
      ).catch(fetchError => {
        clearTimeout(timeoutId);
        console.error('🚫 Fetch error:', fetchError);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout - the shipping label generation is taking too long. Please try again or contact support.');
        }
        
        if (fetchError.message === 'Failed to fetch') {
          throw new Error(`Network error - unable to connect to the server at ${url}. Please check your internet connection and ensure the server is running. Try refreshing the page and logging in again.`);
        }
        
        throw new Error(`Network error when calling ${url}: ${fetchError.message}`);
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          console.error('Failed to parse error response:', errorText);
          throw new Error(`Server error (${response.status}): ${errorText.substring(0, 200)}`);
        }
        throw new Error(errorData.error || `Failed to generate shipping label (${response.status})`);
      }

      const responseText = await response.text();
      console.log('📦 Response received, length:', responseText.length);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Label generated successfully:', {
          hasLabel: !!data.label,
          trackingNumber: data.label?.trackingNumber,
          mockMode: data.mockMode,
        });
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', responseText.substring(0, 500));
        throw new Error('Invalid response from server');
      }
      
      // Update the order in the local state with tracking info from the returned order object
      setOrders(orders.map(o => 
        o.id === order.id 
          ? data.order || o
          : o
      ));

      // Download label locally via proxy to avoid CORS issues
      if (data.label?.url) {
        setDownloadingLabel(order.id);
        try {
          console.log('📥 Downloading label via proxy...');
          console.log('📄 Label URL:', data.label.url);
          
          // Use our server proxy to fetch the label (avoids CORS issues)
          const proxyUrl = `${getServerUrl()}/admin/proxy-label`;
          const labelResponse = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': getAuthHeader(),
              'X-Admin-Email': adminInfo.email,
            },
            body: JSON.stringify({ labelUrl: data.label.url }),
          });
          
          if (!labelResponse.ok) {
            // Try to get detailed error message from response
            let errorMessage = `Failed to download label: ${labelResponse.status} ${labelResponse.statusText}`;
            try {
              const errorData = await labelResponse.json();
              if (errorData.error) {
                errorMessage = `Failed to download label: ${errorData.error}`;
              }
            } catch (e) {
              // If JSON parsing fails, use the status text
            }
            throw new Error(errorMessage);
          }
          
          // Get the content type from the response to handle both PDFs and images
          const contentType = labelResponse.headers.get('content-type') || 'application/pdf';
          console.log('📄 Label content type:', contentType);
          
          const labelArrayBuffer = await labelResponse.arrayBuffer();
          console.log('📄 Label file size:', labelArrayBuffer.byteLength, 'bytes');
          
          if (labelArrayBuffer.byteLength === 0) {
            throw new Error('Label file is empty (0 bytes)');
          }
          
          // Determine file extension and type based on content type
          let fileExtension = 'pdf';
          let blobType = 'application/pdf';
          
          if (contentType.includes('png')) {
            fileExtension = 'png';
            blobType = 'image/png';
          } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
            fileExtension = 'jpg';
            blobType = 'image/jpeg';
          }
          
          const labelBlob = new Blob([labelArrayBuffer], { type: blobType });
          console.log('📄 Label blob created, type:', blobType, 'size:', labelBlob.size, 'bytes');
          
          const labelUrl = URL.createObjectURL(labelBlob);
          const link = document.createElement('a');
          link.href = labelUrl;
          link.download = `SHIPPING_LABEL_order_${order.id.split('_')[1]}_${data.label.trackingNumber || 'label'}.${fileExtension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Increased timeout to ensure download completes before revoking URL
          setTimeout(() => URL.revokeObjectURL(labelUrl), 3000);
          
          console.log('✅ Label downloaded successfully');
        } catch (downloadError: any) {
          console.error('❌ Failed to download label:', downloadError);
          alert(`Warning: Label generated but download failed: ${downloadError.message}. You can download it later from the order details.`);
        } finally {
          setDownloadingLabel(null);
        }
      }

      alert(`Shipping label generated successfully!${data.mockMode ? ' (Mock Mode)' : ''}`);
    } catch (error: any) {
      console.error('Error generating shipping label:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setGeneratingLabel(null);
    }
  };

  const handleRefund = async () => {
    if (!selectedOrder) return;
    setProcessingRefund(true);
    try {
      const response = await fetch(
        `${getServerUrl()}/admin/cancel-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
          body: JSON.stringify({ 
            orderId: selectedOrder.id, 
            refundAmount: refundAmount ? parseFloat(refundAmount) : undefined, 
            reason: refundReason 
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process refund');
      }

      const data = await response.json();
      
      // Update the order in the local state with refund info
      setOrders(orders.map(o => 
        o.id === selectedOrder.id 
          ? {
              ...o,
              status: 'refunded',
              refundedAmount: data.refundedAmount,
              refundedAt: new Date().toISOString(),
              refundReason: data.refundReason,
              labelVoided: data.labelVoided,
              shippingRefundAmount: data.shippingRefundAmount,
            }
          : o
      ));

      // Show success message with shipping label info
      const message = data.labelVoided 
        ? `Refund processed successfully!\n\nPayment refund: $${data.refundedAmount.toFixed(2)}\nShipping label: Voided${data.shippingRefundAmount > 0 ? ` ($${data.shippingRefundAmount.toFixed(2)} refund pending)` : ''}`
        : 'Refund processed successfully!';
      
      alert(message);
      setShowRefundModal(false);
    } catch (error: any) {
      console.error('Error processing refund:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessingRefund(false);
    }
  };

  const handleVoidLabel = async (order: Order) => {
    if (!order.id) return;
    
    const confirmVoid = confirm(
      `Are you sure you want to void the shipping label for this order?\n\n` +
      `Order: ${order.id}\n` +
      `Tracking: ${order.trackingNumber || 'N/A'}\n\n` +
      `This will refund the shipping cost from EasyPost.`
    );
    
    if (!confirmVoid) return;
    
    setVoidingLabel(true);
    try {
      const response = await fetch(
        `${getServerUrl()}/admin/void-shipping-label`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
          body: JSON.stringify({ orderId: order.id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to void label');
      }

      const data = await response.json();
      
      // Update the order in state
      setOrders(orders.map(o => 
        o.id === order.id 
          ? {
              ...o,
              labelVoided: true,
              shippingRefundAmount: data.refundAmount,
            }
          : o
      ));

      alert(`Label voided successfully!\n\nRefund status: ${data.refundStatus}\nRefund amount: $${data.refundAmount.toFixed(2)}`);
      
      // Close modal if open
      setSelectedOrder(null);
    } catch (error: any) {
      console.error('Error voiding label:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setVoidingLabel(false);
    }
  };

  const handleSyncTracking = async () => {
    if (!confirm('Sync all order statuses with EasyPost tracking data? This will update orders based on their current delivery status.')) {
      return;
    }

    setSyncingTracking(true);
    try {
      const response = await fetch(
        `${getServerUrl()}/admin/sync-tracking-statuses`,
        {
          method: 'POST',
          headers: {
            'Authorization': getAuthHeader(),
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to sync tracking statuses');
      }

      const data = await response.json();
      
      alert(`✅ Tracking sync complete!\n\nProcessed: ${data.stats.ordersProcessed}\nUpdated: ${data.stats.ordersUpdated}\nSkipped: ${data.stats.ordersSkipped}${data.stats.errors ? `\nErrors: ${data.stats.errors.length}` : ''}`);
      
      // Refresh orders to show updated statuses
      await fetchOrders();
    } catch (error) {
      console.error('Sync tracking error:', error);
      alert(`Failed to sync tracking statuses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncingTracking(false);
    }
  };

  const handleRefreshLiveStatus = async () => {
    setRefreshingLiveStatus(true);
    try {
      // Get orders with tracking numbers
      const ordersWithTracking = orders.filter(order => order.trackingNumber && !order.labelVoided);
      
      if (ordersWithTracking.length === 0) {
        alert('No orders with active tracking numbers found.');
        return;
      }

      console.log(`🔄 Fetching live status for ${ordersWithTracking.length} orders...`);

      // Fetch live status for each order
      const updatedOrders = [...orders];
      let successCount = 0;
      let errorCount = 0;

      for (const order of ordersWithTracking) {
        try {
          // Mark as loading
          const orderIndex = updatedOrders.findIndex(o => o.id === order.id);
          if (orderIndex >= 0) {
            updatedOrders[orderIndex] = { ...updatedOrders[orderIndex], liveStatusLoading: true };
            setOrders([...updatedOrders]);
          }

          // Call the new admin endpoint that syncs order status from tracking
          const response = await fetch(
            `${getServerUrl()}/admin/orders/${order.id}/sync-tracking`,
            {
              method: 'POST',
              headers: {
                'Authorization': getAuthHeader(),
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            
            if (orderIndex >= 0 && data.success) {
              // Update the order with the synced data from the backend
              updatedOrders[orderIndex] = {
                ...data.order,
                liveStatusLoading: false,
              };
              setOrders([...updatedOrders]);
              successCount++;
            }
          } else {
            throw new Error('Failed to sync order status');
          }
        } catch (error) {
          console.error(`Failed to sync order status for ${order.id}:`, error);
          const orderIndex = updatedOrders.findIndex(o => o.id === order.id);
          if (orderIndex >= 0) {
            updatedOrders[orderIndex] = { ...updatedOrders[orderIndex], liveStatusLoading: false };
            setOrders([...updatedOrders]);
          }
          errorCount++;
        }
      }

      console.log(`✅ Live status refresh complete: ${successCount} success, ${errorCount} errors`);
      
      if (successCount > 0) {
        alert(`✅ Refreshed live tracking status for ${successCount} orders${errorCount > 0 ? `\n\n⚠️ ${errorCount} orders failed to update` : ''}`);
      } else {
        alert(`⚠️ Failed to refresh tracking status for all orders. Please try again.`);
      }
    } catch (error) {
      console.error('Refresh live status error:', error);
      alert(`Failed to refresh live status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRefreshingLiveStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-[#ff6b35] border-t-transparent rounded-full"
          />
          <p className="text-gray-400 [data-theme='light']_&:text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl text-white [data-theme='light']_&:text-gray-900 mb-1">Order Management</h2>
          <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} 
            {statusFilter !== 'all' && ` (${statusFilter})`}
            {orders.length !== filteredOrders.length && ` of ${orders.length} total`}
          </p>
        </div>
        
        {/* Quick stats and Force Refresh */}
        <div className="flex gap-4 items-center">
          <button
            onClick={async () => {
              if (!confirm('Sync all pending orders with Stripe?\n\nThis will check each pending order in Stripe and update their status if payment succeeded.')) {
                return;
              }
              
              setLoading(true);
              try {
                console.log('🔄 Syncing pending orders with Stripe...');
                const response = await fetch(`${getServerUrl()}/admin/sync-pending-orders`, {
                  method: 'POST',
                  headers: {
                    'Authorization': getAuthHeader(),
                  },
                });
                
                if (response.ok) {
                  const data = await response.json();
                  console.log('✅ Sync complete:', data);
                  
                  const msg = `✅ Sync Complete!\n\n` +
                    `Pending Orders Found: ${data.totalPending}\n` +
                    `Updated to Paid: ${data.updated}\n` +
                    `Failed: ${data.failed}`;
                  
                  alert(msg);
                  
                  // Refresh orders list
                  await fetchOrders();
                }
              } catch (error) {
                console.error('Sync failed:', error);
                alert(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💳 Sync Pending
          </button>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                console.log('🔨 Rebuilding order index...');
                const response = await fetch(`${getServerUrl()}/admin/rebuild-index`, {
                  method: 'POST',
                  headers: {
                    'Authorization': getAuthHeader(),
                  },
                });
                
                if (response.ok) {
                  const data = await response.json();
                  console.log(`✅ Index rebuilt with ${data.orderCount} orders`);
                  console.log('Recent orders:', data.recentOrders);
                }
                
                // Now fetch orders with fresh index
                await fetchOrders();
              } catch (error) {
                console.error('Failed to rebuild index:', error);
                // Still try to fetch orders even if rebuild fails
                await fetchOrders();
              }
            }}
            disabled={loading}
            className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff8c42] text-white rounded-lg transition-all flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                🔄 Force Refresh
              </>
            )}
          </button>
          <button
            onClick={handleRefreshLiveStatus}
            disabled={refreshingLiveStatus}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Fetch current tracking status from EasyPost for all orders"
          >
            {refreshingLiveStatus ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Refresh Live Status
              </>
            )}
          </button>
          <button
            onClick={handleSyncTracking}
            disabled={syncingTracking}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sync all order statuses with current EasyPost tracking data"
          >
            {syncingTracking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Truck className="w-4 h-4" />
                Sync Tracking
              </>
            )}
          </button>
          <div className="px-4 py-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg">
            <div className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">Pending</div>
            <div className="text-lg text-white [data-theme='light']_&:text-gray-900">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </div>
          <div className="px-4 py-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg">
            <div className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">Processing</div>
            <div className="text-lg text-white [data-theme='light']_&:text-gray-900">
              {orders.filter(o => o.status === 'processing').length}
            </div>
          </div>
          <div className="px-4 py-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg">
            <div className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">Paid</div>
            <div className="text-lg text-white [data-theme='light']_&:text-gray-900">
              {orders.filter(o => o.status === 'paid').length}
            </div>
          </div>
          <div className="px-4 py-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg">
            <div className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">Shipped</div>
            <div className="text-lg text-white [data-theme='light']_&:text-gray-900">
              {orders.filter(o => o.status === 'shipped').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, email, or tracking number..."
              className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
            <option value="partially_refunded">Partially Refunded</option>
          </select>
        </div>
      </div>

      {/* Live Status Info Banner */}
      {orders.some(o => o.liveStatus) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-blue-500 font-medium mb-1">Live Tracking Status Active</h4>
            <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
              Orders are showing real-time carrier status from EasyPost. Orders with a yellow ring indicate a mismatch between database and carrier status.
            </p>
          </div>
        </motion.div>
      )}

      {/* Error/Warning Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3"
        >
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-red-500 font-medium mb-1">Error Loading Orders</h4>
            <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-all text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      )}
      
      {isStaleData && !error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3"
        >
          <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-yellow-500 font-medium mb-1">Showing Cached Data</h4>
            <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
              Unable to fetch fresh data. Showing previously cached orders. Click refresh to try again.
            </p>
            <button
              onClick={fetchOrders}
              className="mt-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-lg transition-all text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        </motion.div>
      )}

      {/* Orders list */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Orders will appear here when customers make purchases'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <motion.div
              key={order.id || `order-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6 hover:border-[#ff6b35] transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Order header */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="text-sm capitalize">{order.status}</span>
                      <span className="text-xs opacity-70">(DB)</span>
                    </div>
                    {order.liveStatusLoading && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Fetching live status...</span>
                      </div>
                    )}
                    {!order.liveStatusLoading && order.liveStatus && order.liveStatus.toLowerCase() !== order.status.toLowerCase() && (
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(order.liveStatus)} ring-2 ring-yellow-500`}>
                        {getStatusIcon(order.liveStatus)}
                        <span className="text-sm capitalize">{order.liveStatus}</span>
                        <span className="text-xs opacity-70">✓ Live</span>
                      </div>
                    )}
                    {!order.liveStatusLoading && order.liveStatus && order.liveStatus.toLowerCase() === order.status.toLowerCase() && (
                      <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-xs">✓ In Sync</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Order details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-1">
                        Order ID
                      </p>
                      <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-mono">
                        {order.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-1">
                        Customer
                      </p>
                      <p className="text-sm text-white [data-theme='light']_&:text-gray-900">
                        {order.customerEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-1">
                        Amount
                      </p>
                      <p className="text-sm text-white [data-theme='light']_&:text-gray-900">
                        ${order.amount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>

                  {/* Shipping info */}
                  {order.shippingAddress && (
                    <div>
                      <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-1">
                        Shipping Address
                      </p>
                      <p className="text-sm text-white [data-theme='light']_&:text-gray-900">
                        {order.shippingAddress.name}, {order.shippingAddress.line1}
                        {order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`}
                        <br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}
                      </p>
                    </div>
                  )}

                  {/* Tracking info */}
                  {order.trackingNumber && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[#2a2a2a] [data-theme='light']_&:border-gray-200">
                      <Truck className="w-4 h-4 text-[#ff6b35]" />
                      <span className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                        Tracking:
                      </span>
                      <span className="text-sm text-white [data-theme='light']_&:text-gray-900 font-mono">
                        {order.trackingNumber}
                      </span>
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ff6b35] hover:text-[#ff8c42] ml-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="px-4 py-2 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 text-white [data-theme='light']_&:text-gray-700 rounded-lg hover:bg-[#ff6b35] hover:text-black transition-all flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Details
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Order details modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-[#2a2a2a] [data-theme='light']_&:border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl text-white [data-theme='light']_&:text-gray-900">
                  Order Details
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white [data-theme='light']_&:hover:text-gray-900"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order info */}
              <div>
                <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                  Order ID
                </p>
                <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-mono">
                  {selectedOrder.id}
                </p>
              </div>

              {/* Customer info */}
              <div>
                <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                  Customer Email
                </p>
                <p className="text-sm text-white [data-theme='light']_&:text-gray-900">
                  {selectedOrder.customerEmail}
                </p>
              </div>

              {/* Download Print-Ready Image - Prominent Button */}
              {(selectedOrder.orderDetails?.image || selectedOrder.orderDetails?.imageUrl || selectedOrder.orderDetails?.imageStoredSeparately) && (
                <div className="p-4 bg-[#ff6b35]/10 border-2 border-[#ff6b35] rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-white [data-theme='light']_&:text-gray-900 mb-1">
                        🖨️ Print-Ready Image Available
                      </p>
                      <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">
                        Download the customer's edited image for printing
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const imageData = selectedOrder.orderDetails.image || selectedOrder.orderDetails.imageUrl;
                      console.log('🖨️ Downloading print-ready image');
                      console.log('Order ID:', selectedOrder.id);
                      console.log('Print Size:', selectedOrder.orderDetails.size);
                      console.log('Image data available:', !!imageData);
                      
                      setDownloadingImage(selectedOrder.id);
                      
                      try {
                        // Try server endpoint first
                        const response = await fetch(
                          `${getServerUrl()}/admin/download/print-ready/${selectedOrder.id}`,
                          {
                            headers: {
                              'Authorization': getAuthHeader(),
                              'X-Admin-Email': adminInfo?.email || '',
                            },
                          }
                        );
                        
                        if (!response.ok) {
                          console.warn('Server download failed, using direct download');
                          // Direct download fallback
                          const link = document.createElement('a');
                          link.href = imageData;
                          link.download = `PRINT_READY_${selectedOrder.id}_${selectedOrder.orderDetails.size?.replace(/[\\"\\s×x]/g, '_') || 'custom'}.png`;
                          link.click();
                          setDownloadingImage(null);
                          return;
                        }
                        
                        const printSize = response.headers.get('X-Print-Size') || selectedOrder.orderDetails.size;
                        const printInstructions = response.headers.get('X-Print-Instructions');
                        const fileFormat = response.headers.get('X-File-Format') || 'PNG';
                        
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        const fileExt = fileFormat.toLowerCase();
                        link.download = `PRINT_READY_${selectedOrder.id}_${printSize?.replace(/[\\"\\s×x]/g, '_') || 'custom'}.${fileExt}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        setTimeout(() => URL.revokeObjectURL(url), 100);
                        
                        alert(`✅ Print-ready file downloaded!\\n\\nPrint Instructions:\\n${printInstructions || 'Print at actual size with no scaling.'}`);
                      } catch (error) {
                        console.error('Download error:', error);
                        alert('Failed to download print-ready file. Please try again.');
                      } finally {
                        setDownloadingImage(null);
                      }
                    }}
                    disabled={downloadingImage === selectedOrder.id}
                    className="w-full px-6 py-4 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-all flex items-center justify-center gap-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingImage === selectedOrder.id ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Preparing Print File...
                      </>
                    ) : (
                      <>
                        <Download className="w-6 h-6" />
                        Download Print-Ready Image ({selectedOrder.orderDetails.size || 'Custom Size'})
                      </>
                    )}
                  </button>
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-400 [data-theme='light']_&:text-blue-600">
                      <strong>📐 Print Specifications:</strong><br/>
                      • Size: {selectedOrder.orderDetails.size || 'Custom Size'}<br/>
                      • Finish: {selectedOrder.orderDetails.finish || 'Not specified'}<br/>
                      • Resolution: 300 DPI recommended<br/>
                      • Format: PNG (lossless, high quality)<br/>
                      • Scale: Print at actual size (no scaling)
                    </p>
                  </div>
                </div>
              )}

              {/* Debug: Show if no image found */}
              {!selectedOrder.orderDetails?.image && !selectedOrder.orderDetails?.imageUrl && !selectedOrder.orderDetails?.imageStoredSeparately && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm font-medium text-yellow-500 mb-2">
                    ⚠️ No Print-Ready Image Found
                  </p>
                  
                  {/* Show different message for pending vs paid orders */}
                  {selectedOrder.status === 'pending' ? (
                    <div>
                      <p className="text-xs text-yellow-400 [data-theme='light']_&:text-yellow-600 mb-3">
                        This is a <strong>pending order</strong> where the customer did not complete payment. Print-ready images are only uploaded after successful payment.
                      </p>
                      <p className="text-xs text-yellow-400 [data-theme='light']_&:text-yellow-600 mb-3">
                        <strong>What this means:</strong>
                      </p>
                      <ul className="text-xs text-yellow-400 [data-theme='light']_&:text-yellow-600 list-disc list-inside space-y-1">
                        <li>Payment was never completed (abandoned cart or test order)</li>
                        <li>No image was uploaded (saves S3 storage)</li>
                        <li>You can safely delete this order using the button below</li>
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-yellow-400 [data-theme='light']_&:text-yellow-600 mb-3">
                        This <strong>paid order</strong> does not have a print-ready image stored. This might happen if:
                      </p>
                      <ul className="text-xs text-yellow-400 [data-theme='light']_&:text-yellow-600 list-disc list-inside space-y-1">
                        <li>The order was created before image storage was implemented</li>
                        <li>The image upload failed after payment (network error)</li>
                        <li>The image data was too large and was truncated</li>
                      </ul>
                      <button
                        onClick={() => {
                          console.log('📊 Order Debug Information:');
                          console.log('Order ID:', selectedOrder.id);
                          console.log('Full Order Data:', selectedOrder);
                          console.log('Order Details:', selectedOrder.orderDetails);
                          console.log('Has image field:', 'image' in (selectedOrder.orderDetails || {}));
                          console.log('Has imageUrl field:', 'imageUrl' in (selectedOrder.orderDetails || {}));
                          alert('Debug info logged to console. Press F12 to view.');
                        }}
                        className="mt-3 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded text-xs text-yellow-300 transition-all"
                      >
                        🐛 Log Debug Info to Console
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Product details */}
              {selectedOrder.orderDetails && (
                <div>
                  <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                    Product Details
                  </p>
                  <div className="space-y-3 text-sm text-white [data-theme='light']_&:text-gray-900">
                    {selectedOrder.orderDetails.size && (
                      <p>Size: {selectedOrder.orderDetails.size}</p>
                    )}
                    {selectedOrder.orderDetails.finish && (
                      <p>Finish: {selectedOrder.orderDetails.finish}</p>
                    )}
                    {selectedOrder.orderDetails.mounting && (
                      <p>Mounting: {selectedOrder.orderDetails.mounting}</p>
                    )}
                    
                    {/* Print-Ready Image */}
                    {selectedOrder.orderDetails.image && (
                      <div className="mt-4 pt-4 border-t border-[#2a2a2a] [data-theme='light']_&:border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                            Print-Ready Image (Cropped & Edited)
                          </p>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded border border-yellow-500/30">
                            TEST MODE
                          </span>
                        </div>
                        <div className="relative group">
                          <img
                            src={selectedOrder.orderDetails.image}
                            alt="Print-Ready"
                            className="w-full max-w-sm rounded-lg border border-[#ff6b35]/30"
                          />
                          <a
                            href={selectedOrder.orderDetails.image}
                            download={`PRINT-${selectedOrder.id}-${selectedOrder.orderDetails.size?.replace(/["\\s×x]/g, '-') || 'custom'}.jpg`}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                          >
                            <div className="px-6 py-3 bg-[#ff6b35] text-black rounded-lg flex items-center gap-2">
                              <Printer className="w-5 h-5" />
                              Download Print File
                            </div>
                          </a>
                        </div>
                        <button
                          onClick={async () => {
                            console.log('🖨️ TEST MODE: Downloading print-ready image');
                            console.log('Order ID:', selectedOrder.id);
                            console.log('Print Size:', selectedOrder.orderDetails.size);
                            
                            setDownloadingImage(selectedOrder.id);
                            
                            try {
                              const response = await fetch(
                                `${getServerUrl()}/admin/download/print-ready/${selectedOrder.id}`,
                                {
                                  headers: {
                                    'Authorization': getAuthHeader(),
                                    'X-Admin-Email': adminInfo?.email || '',
                                  },
                                }
                              );
                              
                              if (!response.ok) {
                                console.warn('Server download failed, using direct download');
                                const link = document.createElement('a');
                                link.href = selectedOrder.orderDetails.image!;
                                // Use PNG extension for direct download (our images are now saved as PNG)
                                link.download = `PRINT_READY_${selectedOrder.id}_${selectedOrder.orderDetails.size?.replace(/[\\"\\s×x]/g, '_') || 'custom'}.png`;
                                link.click();
                                setDownloadingImage(null);
                                return;
                              }
                              
                              const printSize = response.headers.get('X-Print-Size') || selectedOrder.orderDetails.size;
                              const printInstructions = response.headers.get('X-Print-Instructions');
                              const fileFormat = response.headers.get('X-File-Format') || 'PNG';
                              
                              console.log('Print Instructions:', printInstructions);
                              console.log('Print Size:', printSize);
                              console.log('File Format:', fileFormat);
                              
                              const blob = await response.blob();
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              // Use the format from the server response (PNG for best quality)
                              const fileExt = fileFormat.toLowerCase();
                              link.download = `PRINT_READY_${selectedOrder.id}_${printSize?.replace(/[\\"\\s×x]/g, '_') || 'custom'}.${fileExt}`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              
                              setTimeout(() => URL.revokeObjectURL(url), 100);
                              
                              alert(`✅ Print-ready file downloaded!\n\nPrint Instructions:\n${printInstructions || 'Print at actual size with no scaling.'}`);
                            } catch (error) {
                              console.error('Download error:', error);
                              alert('Failed to download print-ready file. Please try again.');
                            } finally {
                              setDownloadingImage(null);
                            }
                          }}
                          disabled={downloadingImage === selectedOrder.id}
                          className="mt-3 w-full px-4 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {downloadingImage === selectedOrder.id ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Preparing Print File...
                            </>
                          ) : (
                            <>
                              <Printer className="w-5 h-5" />
                              Download Print-Ready File ({selectedOrder.orderDetails.size || 'Custom Size'})
                            </>
                          )}
                        </button>
                        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <p className="text-xs text-blue-400 [data-theme='light']_&:text-blue-600">
                            <strong>📐 Print Specifications:</strong><br/>
                            • Size: {selectedOrder.orderDetails.size || 'Custom Size'}<br/>
                            • Resolution: 300 DPI recommended<br/>
                            • Color Space: sRGB<br/>
                            • Scale: Print at actual size (no scaling)<br/>
                            • Customer edits: Applied ✓<br/>
                            • Format: PNG (lossless, high quality)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shipping address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                    Shipping Address
                  </p>
                  <div className="text-sm text-white [data-theme='light']_&:text-gray-900">
                    <p>{selectedOrder.shippingAddress.name}</p>
                    <p>{selectedOrder.shippingAddress.line1}</p>
                    {selectedOrder.shippingAddress.line2 && (
                      <p>{selectedOrder.shippingAddress.line2}</p>
                    )}
                    <p>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                      {selectedOrder.shippingAddress.postal_code}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                    Created
                  </p>
                  <p className="text-sm text-white [data-theme='light']_&:text-gray-900">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                {selectedOrder.shippedAt && (
                  <div>
                    <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                      Shipped
                    </p>
                    <p className="text-sm text-white [data-theme='light']_&:text-gray-900">
                      {formatDate(selectedOrder.shippedAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                  Pricing Breakdown
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white [data-theme='light']_&:text-gray-900">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.basePrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  {selectedOrder.discount && (
                    <div className="flex justify-between text-green-500">
                      <span>Discount ({selectedOrder.discount.code}):</span>
                      <span>
                        -${selectedOrder.discount.discountAmount?.toFixed(2) || '0.00'}
                        {selectedOrder.discount.type === 'percentage' && ` (${selectedOrder.discount.value}%)`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-white [data-theme='light']_&:text-gray-900">
                    <span>Shipping ({selectedOrder.shippingRate?.service || 'Standard'}):</span>
                    <span>${parseFloat(selectedOrder.shippingRate?.rate || '0').toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#ff6b35] text-xl border-t border-[#ff6b35]/20 pt-2 mt-2">
                    <span>Total:</span>
                    <span>${selectedOrder.amount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Refund Information */}
              {selectedOrder.refundedAmount && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                    Refund Information
                  </p>
                  <div className="space-y-2 text-sm text-white [data-theme='light']_&:text-gray-900">
                    <div className="flex justify-between">
                      <span>Refunded Amount:</span>
                      <span className="text-red-400">${selectedOrder.refundedAmount?.toFixed(2)}</span>
                    </div>
                    {selectedOrder.refundedAt && (
                      <div className="flex justify-between">
                        <span>Refunded At:</span>
                        <span>{formatDate(selectedOrder.refundedAt)}</span>
                      </div>
                    )}
                    {selectedOrder.refundReason && (
                      <div>
                        <span className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">Reason:</span>
                        <p className="mt-1">{selectedOrder.refundReason}</p>
                      </div>
                    )}
                    {(selectedOrder as any).labelVoided && (
                      <div className="flex justify-between items-center pt-2 border-t border-red-500/20">
                        <span>Shipping Label:</span>
                        <span className="text-green-400">Voided ✓</span>
                      </div>
                    )}
                    {(selectedOrder as any).shippingRefundAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Shipping Refund:</span>
                        <span className="text-green-400">${(selectedOrder as any).shippingRefundAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sync from Stripe for Pending Orders */}
              {selectedOrder.status === 'pending' && selectedOrder.paymentIntentId && (
                <SyncOrderFromStripe
                  orderId={selectedOrder.id}
                  paymentIntentId={selectedOrder.paymentIntentId}
                  onSuccess={() => {
                    // Refresh the order details
                    fetchOrders();
                    // Close and reopen to show updated data
                    const currentOrderId = selectedOrder.id;
                    setSelectedOrder(null);
                    setTimeout(() => {
                      fetchOrders().then(() => {
                        // Find and reopen the same order
                        const order = orders.find(o => o.id === currentOrderId);
                        if (order) setSelectedOrder(order);
                      });
                    }, 500);
                  }}
                />
              )}

              {/* Delete Button for Pending Orders */}
              {selectedOrder.status === 'pending' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-sm text-red-400 mb-3">
                    ⚠️ This is a pending order (payment not completed). You can safely delete it.
                  </p>
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete pending order ${selectedOrder.orderNumber}?\n\nThis action cannot be undone. The payment was never completed, so this is safe to remove.`)) {
                        return;
                      }

                      try {
                        setLoading(true);
                        const response = await fetch(`${getServerUrl()}/admin/orders/${selectedOrder.id}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': getAuthHeader(),
                          },
                        });

                        if (!response.ok) {
                          const error = await response.json();
                          throw new Error(error.error || 'Failed to delete order');
                        }

                        alert('✅ Pending order deleted successfully!');
                        
                        // Close modal and refresh list
                        setSelectedOrder(null);
                        await fetchOrders();
                      } catch (error: any) {
                        console.error('Delete order error:', error);
                        alert(`Failed to delete order: ${error.message}`);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Pending Order
                  </button>
                </div>
              )}

              {/* Action Buttons for PAID orders */}
              {(selectedOrder.status === 'paid' || selectedOrder.status === 'shipped' || selectedOrder.status === 'processing') && !selectedOrder.refundedAmount && (
                <div className="space-y-3 pt-4 border-t border-[#2a2a2a] [data-theme='light']_&:border-gray-200">
                  {/* Download Print-Ready Image */}
                  {selectedOrder.orderDetails?.image && (
                    <button
                      onClick={() => handleDownloadPrintImage(selectedOrder)}
                      disabled={downloadingImage === selectedOrder.id}
                      className="w-full px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                    >
                      {downloadingImage === selectedOrder.id ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Download Print-Ready Image
                        </>
                      )}
                    </button>
                  )}

                  {/* Generate Shipping Label */}
                  {!selectedOrder.trackingNumber && (
                    <button
                      onClick={() => handleGenerateLabel(selectedOrder)}
                      disabled={generatingLabel === selectedOrder.id}
                      className="w-full px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                    >
                      {generatingLabel === selectedOrder.id ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating Label...
                        </>
                      ) : (
                        <>
                          <Printer className="w-5 h-5" />
                          Generate Shipping Label
                        </>
                      )}
                    </button>
                  )}

                  {/* Void Shipping Label Button */}
                  {selectedOrder.trackingNumber && !(selectedOrder as any).labelVoided && (
                    <button
                      onClick={() => handleVoidLabel(selectedOrder)}
                      disabled={voidingLabel}
                      className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                    >
                      {voidingLabel ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Voiding Label...
                        </>
                      ) : (
                        <>
                          <Ban className="w-5 h-5" />
                          Void Shipping Label
                        </>
                      )}
                    </button>
                  )}

                  {/* Refund Button */}
                  <button
                    onClick={() => setShowRefundModal(true)}
                    className="w-full px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <DollarSign className="w-5 h-5" />
                    Refund Order
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-[#2a2a2a] [data-theme='light']_&:border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl text-white [data-theme='light']_&:text-gray-900">
                  Refund Order
                </h3>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="text-gray-400 hover:text-white [data-theme='light']_&:hover:text-gray-900"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order info */}
              <div>
                <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                  Order ID
                </p>
                <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-mono">
                  {selectedOrder.id}
                </p>
              </div>

              {/* Customer info */}
              <div>
                <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                  Customer Email
                </p>
                <p className="text-sm text-white [data-theme='light']_&:text-gray-900">
                  {selectedOrder.customerEmail}
                </p>
              </div>

              {/* Amount */}
              <div>
                <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                  Total Amount
                </p>
                <p className="text-2xl text-[#ff6b35]">
                  ${selectedOrder.amount?.toFixed(2) || '0.00'}
                </p>
              </div>

              {/* Refund Amount */}
              <div>
                <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                  Refund Amount
                </p>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Enter refund amount..."
                  className="w-full pl-4 pr-4 py-2 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35]"
                />
              </div>

              {/* Refund Reason */}
              <div>
                <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                  Refund Reason
                </p>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35]"
                >
                  <option value="">Select a reason...</option>
                  <option value="requested_by_customer">Customer Requested</option>
                  <option value="duplicate">Duplicate Order</option>
                  <option value="fraudulent">Fraudulent Order</option>
                </select>
              </div>

              {/* Refund Button */}
              <button
                onClick={handleRefund}
                disabled={processingRefund}
                className="w-full px-6 py-3 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                {processingRefund ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Processing Refund...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5" />
                    Refund Order
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}