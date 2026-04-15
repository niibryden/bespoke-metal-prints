import { useState, useEffect } from 'react';
import { Loader, UserX, UserCheck, Shield, Camera, User, Search, Filter, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getServerUrl } from '../../utils/serverUrl';

interface Photographer {
  id: string;
  displayName: string;
  email: string;
  createdAt: string;
  joinedDate?: string;
  bio?: string;
  portfolio?: string;
  totalPhotos?: number;
  totalSales?: number;
  totalEarnings?: number;
  status: 'active' | 'suspended';
}

interface Customer {
  email: string;
  name?: string;
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  status: 'active' | 'suspended';
}

export function UserManagement({ adminInfo }: { adminInfo?: { email: string; role: string; name: string; permissions: any; accessToken: string } }) {
  const getAuthHeader = () => `Bearer ${adminInfo?.accessToken}`;
  
  const [activeTab, setActiveTab] = useState<'photographers' | 'customers'>('photographers');
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  const serverUrl = getServerUrl();

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (activeTab === 'photographers') {
        await fetchPhotographers();
      } else {
        await fetchCustomers();
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotographers = async () => {
    try {
      const response = await fetch(`${serverUrl}/marketplace/admin/photographers`, {
        headers: {
          'Authorization': getAuthHeader(),
          'X-Admin-Email': adminInfo?.email || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPhotographers(data.photographers || []);
      } else {
        console.error('Failed to fetch photographers:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch photographers:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${serverUrl}/admin/customers`, {
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      } else {
        console.error('Failed to fetch customers:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const toggleUserStatus = async (userId: string, userType: 'photographer' | 'customer', currentStatus: 'active' | 'suspended') => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'suspend' : 'reactivate';
    
    if (!confirm(`Are you sure you want to ${action} this ${userType}?`)) {
      return;
    }

    setProcessingUserId(userId);

    try {
      const endpoint = userType === 'photographer' 
        ? `${serverUrl}/marketplace/admin/photographers/${userId}/status`
        : `${serverUrl}/admin/customers/${userId}/status`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
          'X-Admin-Email': adminInfo?.email || '',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        if (userType === 'photographer') {
          setPhotographers(prev => prev.map(p => 
            p.id === userId ? { ...p, status: newStatus } : p
          ));
        } else {
          setCustomers(prev => prev.map(c => 
            c.email === userId ? { ...c, status: newStatus } : c
          ));
        }
        
        const message = newStatus === 'suspended' 
          ? `${userType} account suspended successfully. They can no longer access the platform.`
          : `${userType} account reactivated successfully.`;
        alert(message);
      } else {
        const error = await response.json();
        alert(`Failed to update status: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Failed to toggle ${userType} status:`, error);
      alert(`Failed to update status. Please try again.`);
    } finally {
      setProcessingUserId(null);
    }
  };

  const filteredPhotographers = photographers.filter(p => {
    const matchesSearch = p.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-[#ff6b35] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-white [data-theme='light']_&:text-gray-900">User Management</h2>
        <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">
          Manage photographer and customer accounts, revoke access when needed
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#2a2a2a] [data-theme='light']_&:border-gray-200">
        <button
          onClick={() => {
            setActiveTab('photographers');
            setSearchTerm('');
            setStatusFilter('all');
          }}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
            activeTab === 'photographers'
              ? 'border-[#ff6b35] text-[#ff6b35]'
              : 'border-transparent text-gray-400 [data-theme=\'light\']_&:text-gray-600 hover:text-white [data-theme=\'light\']_&:hover:text-gray-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          Photographers ({photographers.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('customers');
            setSearchTerm('');
            setStatusFilter('all');
          }}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
            activeTab === 'customers'
              ? 'border-[#ff6b35] text-[#ff6b35]'
              : 'border-transparent text-gray-400 [data-theme=\'light\']_&:text-gray-600 hover:text-white [data-theme=\'light\']_&:hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4" />
          Customers ({customers.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg text-white [data-theme='light']_&:text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* User List */}
      {activeTab === 'photographers' ? (
        <div className="space-y-4">
          {filteredPhotographers.length === 0 ? (
            <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-12 text-center">
              <Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-2">
                No photographers found
              </h3>
              <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
                {searchTerm ? 'Try adjusting your search filters' : 'No photographers have signed up yet'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPhotographers.map((photographer) => (
                <motion.div
                  key={photographer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-[#ff6b35]/10 flex items-center justify-center flex-shrink-0">
                        <Camera className="w-6 h-6 text-[#ff6b35]" />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 font-medium">
                            {photographer.displayName}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            photographer.status === 'active'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {photographer.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-3">
                          {photographer.email}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">Photos</p>
                            <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-medium">
                              {photographer.totalPhotos || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">Sales</p>
                            <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-medium">
                              {photographer.totalSales || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">Earnings</p>
                            <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-medium">
                              ${(photographer.totalEarnings || 0).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">Joined</p>
                            <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-medium">
                              {new Date(photographer.joinedDate || photographer.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => toggleUserStatus(photographer.id, 'photographer', photographer.status)}
                      disabled={processingUserId === photographer.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        photographer.status === 'active'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                          : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
                      }`}
                    >
                      {processingUserId === photographer.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : photographer.status === 'active' ? (
                        <>
                          <UserX className="w-4 h-4" />
                          Suspend Access
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Restore Access
                        </>
                      )}
                    </button>
                  </div>

                  {photographer.status === 'suspended' && (
                    <div className="mt-4 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-500">
                        This photographer cannot log in or upload new photos until access is restored.
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCustomers.length === 0 ? (
            <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-12 text-center">
              <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-2">
                No customers found
              </h3>
              <p className="text-gray-400 [data-theme='light']_&:text-gray-600">
                {searchTerm ? 'Try adjusting your search filters' : 'No customers have signed up yet'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCustomers.map((customer) => (
                <motion.div
                  key={customer.email}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-[#ff6b35]/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-[#ff6b35]" />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 font-medium">
                            {customer.name || 'Customer'}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            customer.status === 'active'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {customer.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-3">
                          {customer.email}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">Orders</p>
                            <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-medium">
                              {customer.totalOrders || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">Total Spent</p>
                            <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-medium">
                              ${(customer.totalSpent || 0).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">Last Order</p>
                            <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-medium">
                              {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 [data-theme='light']_&:text-gray-600">Joined</p>
                            <p className="text-sm text-white [data-theme='light']_&:text-gray-900 font-medium">
                              {new Date(customer.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => toggleUserStatus(customer.email, 'customer', customer.status)}
                      disabled={processingUserId === customer.email}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        customer.status === 'active'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                          : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
                      }`}
                    >
                      {processingUserId === customer.email ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : customer.status === 'active' ? (
                        <>
                          <UserX className="w-4 h-4" />
                          Suspend Access
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Restore Access
                        </>
                      )}
                    </button>
                  </div>

                  {customer.status === 'suspended' && (
                    <div className="mt-4 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-500">
                        This customer cannot log in or place new orders until access is restored.
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}