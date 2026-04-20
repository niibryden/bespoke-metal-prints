import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Key, UserPlus, Users, Shield, Trash2, Eye, EyeOff, Database, Tag, Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getServerUrl } from '../../utils/server-config';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'printer' | 'finance' | 'inventory';
  createdAt: string;
}

interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  active: boolean;
  createdAt: string;
}

interface AdminSettingsProps {
  adminInfo: { email: string; role: string; name: string; permissions: any; accessToken: string };
}

export function AdminSettings({ adminInfo }: AdminSettingsProps) {
  // Helper to get auth header with admin access token
  const getAuthHeader = () => `Bearer ${adminInfo?.accessToken || publicAnonKey}`;
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'super_admin' | 'printer' | 'finance' | 'inventory'>('printer');
  const [createMessage, setCreateMessage] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);

  const [cleanupMessage, setCleanupMessage] = useState('');
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  
  const [migrationMessage, setMigrationMessage] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);

  const [ordersModified, setOrdersModified] = useState(0);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Discount codes state
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);
  const [newDiscountCode, setNewDiscountCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [newDiscountValue, setNewDiscountValue] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [isCreatingDiscount, setIsCreatingDiscount] = useState(false);

  const serverUrl = getServerUrl();

  useEffect(() => {
    if (!adminInfo.accessToken) {
      setLoadingUsers(false);
      return;
    }
    
    fetchAdminUsers();
  }, [adminInfo.accessToken]);

  const fetchAdminUsers = async () => {
    // Guard against calling without adminToken
    if (!adminInfo.accessToken) {
      console.log('⚠️ fetchAdminUsers called without adminToken, skipping');
      setLoadingUsers(false);
      return;
    }
    
    try {
      console.log('📧 Frontend: Fetching admin users');
      const response = await fetch(
        `${serverUrl}/admin/users`,
        { 
          headers: {
            'Authorization': getAuthHeader(),
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error('❌ Frontend: Failed to fetch admin users:', data.error);
        throw new Error(data.error || 'Failed to fetch admin users');
      }

      const data = await response.json();
      console.log('✅ Frontend: Received admin users:', data.users?.length || 0);
      setAdminUsers(data.users || []);
    } catch (error) {
      console.error('💥 Frontend: Error fetching admin users:', error);
      // Don't throw - just show empty list
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch(
        `${serverUrl}/admin/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMessage('');
    setCreateError('');

    if (newAdminPassword.length < 6) {
      setCreateError('Password must be at least 6 characters');
      return;
    }

    setIsCreatingAdmin(true);

    try {
      console.log('📝 Creating new admin user:', newAdminEmail);
      const response = await fetch(
        `${serverUrl}/admin/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
          body: JSON.stringify({
            email: newAdminEmail,
            password: newAdminPassword,
            name: newAdminName,
            role: newAdminRole,
          }),
        }
      );

      const data = await response.json();
      console.log('📝 Create admin response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin user');
      }

      setCreateMessage('Admin user created successfully!');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      setNewAdminRole('printer');
      fetchAdminUsers(); // Refresh the list
    } catch (error) {
      console.error('📝 Error creating admin:', error);
      setCreateError(error instanceof Error ? error.message : 'Failed to create admin user');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this admin user?')) {
      return;
    }

    try {
      const response = await fetch(
        `${serverUrl}/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': getAuthHeader(),
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete admin user');
      }

      fetchAdminUsers(); // Refresh the list
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete admin user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDatabaseCleanup = async () => {
    if (!confirm('This will remove large image data from all orders in the database to improve performance. Continue?')) {
      return;
    }

    setIsCleaningUp(true);
    setCleanupMessage('');

    try {
      console.log(' Starting database cleanup...');
      const response = await fetch(
        `${serverUrl}/admin/cleanup-order-images`,
        {
          method: 'POST',
          headers: {
            'Authorization': getAuthHeader(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Cleanup failed');
      }

      setCleanupMessage(
        `✅ Cleanup complete! Cleaned ${data.cleanedOrders} of ${data.totalOrders} orders. ` +
        `Freed ${data.freedMB} MB of database space.`
      );
      console.log('✅ Cleanup results:', data);
    } catch (error) {
      console.error('❌ Cleanup error:', error);
      setCleanupMessage(`❌ Error: ${error instanceof Error ? error.message : 'Cleanup failed'}`);
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleMarketplaceMigration = async () => {
    if (!confirm('This will add imageUrl field to all marketplace photos. This is safe and reversible. Continue?')) {
      return;
    }

    setIsMigrating(true);
    setMigrationMessage('');

    try {
      console.log('🔄 Starting marketplace migration...');
      const response = await fetch(
        `${serverUrl}/marketplace/admin/migrate-image-urls`,
        {
          method: 'POST',
          headers: {
            'Authorization': getAuthHeader(),
            'X-Admin-Email': adminInfo.email,
          },
        }
      );

      console.log('📡 Migration response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📦 Migration response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `Migration failed with status ${response.status}`);
      }

      setMigrationMessage(
        `✅ Migration complete! Updated ${data.updatedCount} of ${data.totalPhotos} photos. ` +
        (data.errorCount > 0 ? `${data.errorCount} errors occurred.` : '')
      );
      console.log('✅ Migration results:', data);
    } catch (error) {
      console.error('❌ Migration error:', error);
      setMigrationMessage(`❌ Migration error: ${error instanceof Error ? error.message : 'Migration failed'}`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl text-gray-900 font-medium">Settings</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage admin accounts and security settings
        </p>
      </div>

      {/* Change Password Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Key className="w-5 h-5 text-[#ff6b35]" />
          </div>
          <h3 className="text-lg text-gray-900 font-medium">
            Change Password
          </h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {passwordMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {passwordError}
            </div>
          )}

          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-6 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Create New Admin Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserPlus className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg text-gray-900 font-medium">
            Create New Admin
          </h3>
        </div>

        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Email Address
            </label>
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Name (Optional)
            </label>
            <input
              type="text"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              placeholder="Admin Name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showNewAdminPassword ? "text" : "password"}
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showNewAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Role
            </label>
            <select
              value={newAdminRole}
              onChange={(e) => setNewAdminRole(e.target.value as any)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              required
            >
              <option value="printer">Printer (Can view & print orders)</option>
              <option value="finance">Finance (Can view orders & export data)</option>
              <option value="inventory">Inventory (Can manage inventory only)</option>
              <option value="super_admin">Super Admin (Full access)</option>
            </select>
          </div>

          {createMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
              {createMessage}
            </div>
          )}

          {createError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {createError}
            </div>
          )}

          <button
            type="submit"
            disabled={isCreatingAdmin}
            className="px-6 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isCreatingAdmin ? 'Creating...' : 'Create Admin User'}
          </button>
        </form>
      </div>

      {/* Admin Users List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg text-gray-900 font-medium">
            Admin Users
          </h3>
        </div>

        {loadingUsers ? (
          <div className="text-center py-8 text-gray-600">
            Loading admin users...
          </div>
        ) : adminUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No admin users found
          </div>
        ) : (
          <div className="space-y-3">
            {adminUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Shield className="w-4 h-4 text-[#ff6b35]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-900 font-medium">
                        {user.name}
                      </p>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'printer' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'finance' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {user.role === 'super_admin' ? 'Super Admin' :
                         user.role === 'printer' ? 'Printer' :
                         user.role === 'finance' ? 'Finance' :
                         'Inventory'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    Created {formatDate(user.createdAt)}
                  </span>
                  <button
                    onClick={() => handleDeleteAdmin(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete admin user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Database Cleanup Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Database className="w-5 h-5 text-[#ff6b35]" />
          </div>
          <h3 className="text-lg text-gray-900 font-medium">
            Database Cleanup
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Cleanup Large Image Data
            </label>
            <p className="text-xs text-gray-600">
              This will remove large image data from all orders in the database to improve performance.
            </p>
          </div>

          {cleanupMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
              {cleanupMessage}
            </div>
          )}

          <button
            onClick={handleDatabaseCleanup}
            disabled={isCleaningUp}
            className="px-6 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isCleaningUp ? 'Cleaning...' : 'Cleanup Database'}
          </button>
        </div>
      </div>

      {/* Marketplace Migration Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Tag className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg text-gray-900 font-medium">
            Marketplace Migration
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Add imageUrl Field
            </label>
            <p className="text-xs text-gray-600">
              This will add imageUrl field to all marketplace photos. This is safe and reversible.
            </p>
          </div>

          {migrationMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
              {migrationMessage}
            </div>
          )}

          <button
            onClick={handleMarketplaceMigration}
            disabled={isMigrating}
            className="px-6 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isMigrating ? 'Migrating...' : 'Migrate Marketplace'}
          </button>
        </div>
      </div>
    </div>
  );
}