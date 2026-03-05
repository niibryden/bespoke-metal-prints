import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, MapPin, CreditCard, Trash2, Plus, Loader2, Edit2, RotateCcw, LogOut } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/config';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ReturnToHomeButton } from './ReturnToHomeButton';

interface AccountPageProps {
  onClose: () => void;
  onSignOut: () => void;
  onReorder?: (orderDetails: any) => void;
}

interface Order {
  orderId: string;
  date: string;
  total: number;
  status: string;
  items: {
    size: string;
    mountType: string;
    frame: string;
    finish?: string;
    quantity: number;
  };
  imageUrl?: string;
  image?: string; // Print-ready cropped image for reorder
}

interface SavedAddress {
  id: string;
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

interface SavedPaymentMethod {
  id: string;
  cardType: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault?: boolean;
}

export function AccountPage({ onClose, onSignOut, onReorder }: AccountPageProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'payment'>('orders');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const supabase = useMemo(() => getSupabaseClient(), []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    // Save current overflow state
    const originalOverflow = document.body.style.overflow;
    // Disable scrolling
    document.body.style.overflow = 'hidden';
    
    // Restore on cleanup
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      setUser(session.user);

      // Load addresses
      const addressResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7/customer/${session.user.id}/address`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (addressResponse.ok) {
        const addressData = await addressResponse.json();
        setAddresses(addressData || []);
      } else {
        console.error('Failed to load addresses:', await addressResponse.text());
      }

      // Load orders
      const ordersResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7/customer/${session.user.id}/orders`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        
        // Transform orders to match the expected format
        const transformedOrders = ordersData.map((order: any) => ({
          orderId: order.id,
          date: order.createdAt,
          total: order.amount || 0,
          status: order.status,
          items: order.orderDetails || {},
          imageUrl: order.orderDetails?.imageUrl,
          image: order.orderDetails?.image,
        }));
        
        // Sort by date descending (most recent first)
        transformedOrders.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setOrders(transformedOrders);
        console.log(`✅ Loaded ${transformedOrders.length} orders`);
      } else {
        console.error('Failed to load orders:', await ordersResponse.text());
      }

      // Payment methods are managed by Stripe and not stored separately
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7/customer/${user.id}/address/${addressId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          },
        }
      );

      if (response.ok) {
        setAddresses(addresses.filter(a => a.id !== addressId));
      }
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (!user) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7/customer/${user.id}/payment/${methodId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          },
        }
      );

      if (response.ok) {
        setPaymentMethods(paymentMethods.filter(p => p.id !== methodId));
      }
    } catch (err) {
      console.error('Error deleting payment method:', err);
    }
  };

  const handleSaveAddress = async (address: Omit<SavedAddress, 'id'>) => {
    if (!user) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const method = editingAddress ? 'PUT' : 'POST';
      const url = editingAddress 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7/customer/${user.id}/address/${editingAddress.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7/customer/${user.id}/address`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(address),
      });

      if (response.ok) {
        const savedAddress = await response.json();
        if (editingAddress) {
          setAddresses(addresses.map(a => a.id === editingAddress.id ? savedAddress : a));
        } else {
          setAddresses([...addresses, savedAddress]);
        }
        setShowAddAddress(false);
        setEditingAddress(null);
      }
    } catch (err) {
      console.error('Error saving address:', err);
    }
  };

  const tabs = [
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[9999] flex items-start justify-center overflow-y-auto dark:bg-black/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="w-full py-8 px-4">
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-6xl mx-auto border border-gray-300 dark:bg-[#1a1a1a] dark:border-[#ff6b35]/20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white border-b border-gray-300 p-6 flex items-center justify-between rounded-t-2xl dark:bg-[#1a1a1a] dark:border-[#ff6b35]/20">
            <div>
              <h2 className="text-2xl text-black dark:text-white">My Account</h2>
              {user && <p className="text-gray-600 text-sm mt-1 dark:text-gray-400">{user.email}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onSignOut}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-[#2a2a2a]"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-300 px-6 dark:border-[#2a2a2a]">
            <div className="flex gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 flex items-center gap-2 transition-all relative ${
                      activeTab === tab.id
                        ? 'text-[#ff6b35]'
                        : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff6b35]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Return to Home Button */}
            <div className="mb-6">
              <ReturnToHomeButton onClick={onClose} />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#ff6b35] animate-spin" />
              </div>
            ) : (
              <>
                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    {/* Info Banner */}
                    <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-lg p-4 mb-6">
                      <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">
                        <strong className="text-[#ff6b35]">✓ Multi-Device Sync:</strong> Your order history automatically syncs across all your devices when you're signed in. Orders placed on mobile will appear here on desktop, and vice versa.
                      </p>
                    </div>
                    
                    {orders.length === 0 ? (
                      <div className="text-center py-20 text-gray-400 [data-theme='light']_&:text-gray-600">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No orders yet</p>
                        <p className="text-sm mt-2">Orders placed while signed in will appear here</p>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <motion.div
                          key={order.orderId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[#0a0a0a] rounded-xl p-6 border border-[#2a2a2a] [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
                        >
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Image Thumbnail */}
                            {(order.image || order.imageUrl) ? (
                              <div className="flex-shrink-0">
                                <ImageWithFallback
                                  src={order.image || order.imageUrl}
                                  alt="Order Image"
                                  className="w-full lg:w-32 h-32 object-cover rounded-lg border-2 border-[#ff6b35]/30"
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 w-full lg:w-32 h-32 bg-gray-800 dark:bg-gray-800 [data-theme='light']_&:bg-gray-200 rounded-lg border-2 border-[#ff6b35]/30 flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-600 opacity-50" />
                              </div>
                            )}
                            
                            {/* Order Details */}
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                  <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">Order ID</p>
                                  <p className="text-[#ff6b35] font-mono">{order.orderId}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">Date</p>
                                  <p className="text-white [data-theme='light']_&:text-black">{new Date(order.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">Status</p>
                                  <p className="text-green-400 capitalize [data-theme='light']_&:text-green-600">{order.status}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">Total</p>
                                  <p className="text-white text-xl [data-theme='light']_&:text-black">${order.total.toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="border-t border-[#2a2a2a] pt-4 [data-theme='light']_&:border-gray-300">
                                <p className="text-gray-400 text-sm mb-2 [data-theme='light']_&:text-gray-600">Order Details</p>
                                <div className="text-white text-sm [data-theme='light']_&:text-black">
                                  <p>Size: {order.items.size}</p>
                                  <p>Mount: {order.items.mountType}</p>
                                  <p>Frame: {order.items.frame}</p>
                                  <p>Finish: {order.items.finish || 'N/A'}</p>
                                  <p>Quantity: {order.items.quantity}</p>
                                </div>
                                {onReorder && (
                                  <button
                                    onClick={() => onReorder(order)}
                                    className="mt-4 px-4 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all flex items-center gap-2"
                                  >
                                    <RotateCcw className="w-5 h-5" />
                                    Reorder
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white text-xl [data-theme='light']_&:text-black">Saved Addresses</h3>
                      <button
                        onClick={() => setShowAddAddress(true)}
                        className="px-4 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add Address
                      </button>
                    </div>

                    {addresses.length === 0 && !showAddAddress ? (
                      <div className="text-center py-20 text-gray-400 [data-theme='light']_&:text-gray-600">
                        <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No saved addresses</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                          <motion.div
                            key={address.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#0a0a0a] rounded-xl p-6 border border-[#2a2a2a] relative [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
                          >
                            {address.isDefault && (
                              <div className="absolute top-4 right-4 px-2 py-1 bg-[#ff6b35] text-black text-xs rounded">
                                Default
                              </div>
                            )}
                            <div className="text-white mb-4 [data-theme='light']_&:text-black">
                              <p className="font-semibold">{address.name}</p>
                              <p className="text-gray-400 text-sm mt-2 [data-theme='light']_&:text-gray-600">{address.street1}</p>
                              {address.street2 && <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">{address.street2}</p>}
                              <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">
                                {address.city}, {address.state} {address.zip}
                              </p>
                              <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">{address.country}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingAddress(address);
                                  setShowAddAddress(true);
                                }}
                                className="flex-1 px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-all flex items-center justify-center gap-2 [data-theme='light']_&:bg-gray-200 [data-theme='light']_&:text-black [data-theme='light']_&:hover:bg-gray-300"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Add/Edit Address Form */}
                    <AnimatePresence>
                      {showAddAddress && (
                        <AddressForm
                          address={editingAddress}
                          onSave={handleSaveAddress}
                          onCancel={() => {
                            setShowAddAddress(false);
                            setEditingAddress(null);
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Payment Methods Tab */}
                {activeTab === 'payment' && (
                  <div className="space-y-4">
                    <h3 className="text-white text-xl mb-4 [data-theme='light']_&:text-black">Saved Payment Methods</h3>
                    {paymentMethods.length === 0 ? (
                      <div className="text-center py-20 text-gray-400 [data-theme='light']_&:text-gray-600">
                        <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No saved payment methods</p>
                        <p className="text-sm mt-2">Payment methods are saved during checkout</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {paymentMethods.map((method) => (
                          <motion.div
                            key={method.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#0a0a0a] rounded-xl p-6 border border-[#2a2a2a] relative [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
                          >
                            {method.isDefault && (
                              <div className="absolute top-4 right-4 px-2 py-1 bg-[#ff6b35] text-black text-xs rounded">
                                Default
                              </div>
                            )}
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-8 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] rounded flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="text-white capitalize [data-theme='light']_&:text-black">{method.cardType}</p>
                                <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">•••• {method.last4}</p>
                              </div>
                            </div>
                            <p className="text-gray-400 text-sm mb-4 [data-theme='light']_&:text-gray-600">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                            <button
                              onClick={() => handleDeletePaymentMethod(method.id)}
                              className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Address Form Component
function AddressForm({ 
  address, 
  onSave, 
  onCancel 
}: { 
  address: SavedAddress | null; 
  onSave: (address: Omit<SavedAddress, 'id'>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: address?.name || '',
    street1: address?.street1 || '',
    street2: address?.street2 || '',
    city: address?.city || '',
    state: address?.state || '',
    zip: address?.zip || '',
    country: address?.country || 'US',
    isDefault: address?.isDefault || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-[#0a0a0a] rounded-xl p-6 border border-[#ff6b35]/20 mt-4 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
    >
      <h4 className="text-white mb-4 [data-theme='light']_&:text-black">
        {address ? 'Edit Address' : 'Add New Address'}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-3 bg-[#1a1a1a] text-white rounded-lg border border-[#2a2a2a] focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black [data-theme='light']_&:border-gray-300"
        />
        <input
          type="text"
          placeholder="Street Address"
          value={formData.street1}
          onChange={(e) => setFormData({ ...formData, street1: e.target.value })}
          required
          className="w-full px-4 py-3 bg-[#1a1a1a] text-white rounded-lg border border-[#2a2a2a] focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black [data-theme='light']_&:border-gray-300"
        />
        <input
          type="text"
          placeholder="Apartment, suite, etc. (optional)"
          value={formData.street2}
          onChange={(e) => setFormData({ ...formData, street2: e.target.value })}
          className="w-full px-4 py-3 bg-[#1a1a1a] text-white rounded-lg border border-[#2a2a2a] focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black [data-theme='light']_&:border-gray-300"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
            className="px-4 py-3 bg-[#1a1a1a] text-white rounded-lg border border-[#2a2a2a] focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black [data-theme='light']_&:border-gray-300"
          />
          <input
            type="text"
            placeholder="State"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
            className="px-4 py-3 bg-[#1a1a1a] text-white rounded-lg border border-[#2a2a2a] focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black [data-theme='light']_&:border-gray-300"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="ZIP Code"
            value={formData.zip}
            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
            required
            className="px-4 py-3 bg-[#1a1a1a] text-white rounded-lg border border-[#2a2a2a] focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black [data-theme='light']_&:border-gray-300"
          />
          <select
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="px-4 py-3 bg-[#1a1a1a] text-white rounded-lg border border-[#2a2a2a] focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:text-black [data-theme='light']_&:border-gray-300"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-gray-400 cursor-pointer [data-theme='light']_&:text-gray-600">
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            className="w-4 h-4 accent-[#ff6b35]"
          />
          Set as default address
        </label>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all"
          >
            Save Address
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-all [data-theme='light']_&:bg-gray-200 [data-theme='light']_&:text-black [data-theme='light']_&:hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}