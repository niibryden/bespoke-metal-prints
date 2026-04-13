import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Calendar, Clock } from 'lucide-react';
import { publicAnonKey } from '../../utils/supabase/info';
import { getServerUrl } from '../../utils/server-config';

interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  active: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface DiscountManagementProps {
  adminInfo: { email: string; role: string; name: string; permissions: any; accessToken: string };
}

export function DiscountManagement({ adminInfo }: DiscountManagementProps) {
  // Helper to get auth header with admin access token
  const getAuthHeader = () => `Bearer ${adminInfo?.accessToken || publicAnonKey}`;
  
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);
  const [newDiscountCode, setNewDiscountCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [newDiscountValue, setNewDiscountValue] = useState('');
  const [newDiscountExpiresAt, setNewDiscountExpiresAt] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [isCreatingDiscount, setIsCreatingDiscount] = useState(false);

  const serverUrl = getServerUrl();

  useEffect(() => {
    if (!adminInfo.accessToken) {
      setLoadingDiscounts(false);
      return;
    }
    
    fetchDiscountCodes();
  }, [adminInfo.accessToken]);

  const fetchDiscountCodes = async () => {
    if (!adminInfo.accessToken) {
      console.log('⚠️ fetchDiscountCodes called without adminToken, skipping');
      setLoadingDiscounts(false);
      return;
    }
    
    try {
      console.log('💳 Fetching discount codes...');
      const response = await fetch(
        `${serverUrl}/admin/discount-codes`,
        { 
          headers: {
            'Authorization': getAuthHeader(),
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error('❌ Failed to fetch discount codes:', data.error);
        throw new Error(data.error || 'Failed to fetch discount codes');
      }

      const data = await response.json();
      console.log('✅ Received discount codes:', data.discountCodes?.length || 0);
      setDiscountCodes(data.discountCodes || []);
    } catch (error) {
      console.error('💥 Error fetching discount codes:', error);
      // Don't throw - just show empty list
    } finally {
      setLoadingDiscounts(false);
    }
  };

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDiscountMessage('');
    setDiscountError('');

    const value = parseFloat(newDiscountValue);
    if (isNaN(value) || value <= 0) {
      setDiscountError('Please enter a valid discount value');
      return;
    }

    if (newDiscountType === 'percentage' && value > 100) {
      setDiscountError('Percentage discount cannot exceed 100%');
      return;
    }

    setIsCreatingDiscount(true);

    try {
      console.log('💳 Creating discount code:', newDiscountCode.toUpperCase());
      const response = await fetch(
        `${serverUrl}/admin/discount-codes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
          body: JSON.stringify({
            code: newDiscountCode.toUpperCase().trim(),
            type: newDiscountType,
            value: value,
            expiresAt: newDiscountExpiresAt,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create discount code');
      }

      setDiscountMessage('Discount code created successfully!');
      setNewDiscountCode('');
      setNewDiscountValue('');
      setNewDiscountExpiresAt('');
      fetchDiscountCodes(); // Refresh the list
    } catch (error) {
      console.error('💳 Error creating discount:', error);
      setDiscountError(error instanceof Error ? error.message : 'Failed to create discount code');
    } finally {
      setIsCreatingDiscount(false);
    }
  };

  const handleToggleDiscount = async (code: string, currentActive: boolean) => {
    try {
      const response = await fetch(
        `${serverUrl}/admin/discount-codes/${code}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
          body: JSON.stringify({
            active: !currentActive,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to toggle discount code');
      }

      fetchDiscountCodes(); // Refresh the list
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to toggle discount code');
    }
  };

  const handleDeleteDiscount = async (code: string) => {
    if (!confirm(`Are you sure you want to delete the discount code "${code}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${serverUrl}/admin/discount-codes/${code}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': getAuthHeader(),
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete discount code');
      }

      fetchDiscountCodes(); // Refresh the list
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete discount code');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl text-gray-900 font-medium">Discount Codes</h2>
        <p className="text-sm text-gray-600 mt-1">
          Create and manage discount codes for customers
        </p>
      </div>

      {/* Create New Discount */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Plus className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg text-gray-900 font-medium">
            Create Discount Code
          </h3>
        </div>

        <form onSubmit={handleCreateDiscount} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Discount Code
              </label>
              <input
                type="text"
                value={newDiscountCode}
                onChange={(e) => setNewDiscountCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent uppercase"
                placeholder="SUMMER25"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Discount Type
              </label>
              <select
                value={newDiscountType}
                onChange={(e) => setNewDiscountType(e.target.value as 'percentage' | 'fixed')}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                required
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Value
              </label>
              <input
                type="number"
                value={newDiscountValue}
                onChange={(e) => setNewDiscountValue(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                placeholder={newDiscountType === 'percentage' ? '10' : '5.00'}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Expires At (Optional)
              </label>
              <input
                type="date"
                value={newDiscountExpiresAt}
                onChange={(e) => setNewDiscountExpiresAt(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              />
            </div>
          </div>

          {discountMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
              {discountMessage}
            </div>
          )}

          {discountError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {discountError}
            </div>
          )}

          <button
            type="submit"
            disabled={isCreatingDiscount}
            className="px-6 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isCreatingDiscount ? 'Creating...' : 'Create Discount Code'}
          </button>
        </form>
      </div>

      {/* Discount Codes List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Tag className="w-5 h-5 text-[#ff6b35]" />
          </div>
          <h3 className="text-lg text-gray-900 font-medium">
            Active Discount Codes
          </h3>
        </div>

        {loadingDiscounts ? (
          <div className="text-center py-8 text-gray-600">
            Loading discount codes...
          </div>
        ) : discountCodes.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No discount codes found. Create one above to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {discountCodes.map((discount, index) => (
              <motion.div
                key={discount.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  discount.active 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    discount.active ? 'bg-green-100' : 'bg-gray-300'
                  }`}>
                    <Tag className={`w-4 h-4 ${
                      discount.active ? 'text-green-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-gray-900 font-bold">
                        {discount.code}
                      </p>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        discount.active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {discount.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {discount.type === 'percentage' 
                        ? `${discount.value}% off` 
                        : `$${discount.value.toFixed(2)} off`}
                      {' '}• Created {formatDate(discount.createdAt)}
                      {discount.expiresAt && ` • Expires ${formatDate(discount.expiresAt)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleDiscount(discount.code, discount.active)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={discount.active ? 'Deactivate' : 'Activate'}
                  >
                    {discount.active ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteDiscount(discount.code)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete discount code"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 How Discount Codes Work</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Percentage:</strong> Discount applied to subtotal (e.g., 10% off)</li>
          <li>• <strong>Fixed Amount:</strong> Dollar amount deducted from subtotal (e.g., $5 off)</li>
          <li>• Customers enter the code at checkout to apply the discount</li>
          <li>• Toggle codes on/off without deleting them</li>
          <li>• Currently active: WELCOME10 (10% off)</li>
        </ul>
      </div>
    </div>
  );
}