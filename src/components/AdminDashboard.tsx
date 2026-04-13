import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AdminMarketplaceApprovals } from './AdminMarketplaceApprovals';
import { AdminOverview } from './admin/AdminOverview';
import { PhotoManagement } from './admin/PhotoManagement';
import { InventoryManagement } from './admin/InventoryManagement';
import { OrderManagement } from './admin/OrderManagement';
import { DataCleanup } from './admin/DataCleanup';
import { ExportData } from './admin/ExportData';
import { AdminSettings } from './admin/AdminSettings';
import { S3FolderManager } from './admin/S3FolderManager';
import { ImageLibrary } from './admin/ImageLibrary';
import { DiscountManagement } from './admin/DiscountManagement';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Image, 
  Settings, 
  LogOut, 
  Download,
  Database,
  FolderOpen,
  Images,
  Tag,
  Camera
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  adminInfo: { email: string; role: string; name: string; permissions: any; accessToken: string };
}

type ActiveTab = 'overview' | 'photos' | 'inventory' | 'orders' | 'settings' | 'export' | 'cleanup' | 's3-folders' | 'image-library' | 'discounts' | 'marketplace';

export function AdminDashboard({ onLogout, adminInfo }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return localStorage.getItem('christmas-banner-dismissed') === 'true';
  });
  
  useEffect(() => {
    const handleBannerDismissed = () => setBannerDismissed(true);
    window.addEventListener('banner-dismissed', handleBannerDismissed);
    return () => window.removeEventListener('banner-dismissed', handleBannerDismissed);
  }, []);
  
  // Handle automatic logout on bad JWT
  const handleBadJWT = () => {
    console.log('🚨 Bad JWT detected, forcing logout...');
    alert('Your session has expired or is invalid. Please log in again.');
    onLogout();
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard, permission: 'canViewOrders' },
    { id: 'orders' as const, label: 'Orders', icon: ShoppingBag, permission: 'canViewOrders' },
    { id: 'photos' as const, label: 'Stock Photos', icon: Image, permission: 'canViewOrders' },
    { id: 'inventory' as const, label: 'Inventory', icon: Package, permission: 'canManageInventory' },
    { id: 'discounts' as const, label: 'Discounts', icon: Tag, permission: 'canManageInventory' },
    { id: 'settings' as const, label: 'Settings', icon: Settings, permission: 'canViewOrders' },
    { id: 'marketplace' as const, label: 'Marketplace Approvals', icon: Camera, permission: 'canManageInventory' },
  ].filter(tab => !tab.permission || adminInfo.permissions?.[tab.permission]);

  console.log('✅ AdminDashboard - tabs after filter:', tabs);
  console.log('✅ AdminDashboard - adminInfo.permissions:', adminInfo.permissions);
  
  return (
    <div className={`min-h-screen bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 ${bannerDismissed ? 'pt-[80px]' : 'pt-[132px]'} transition-all duration-300`}>
      {/* Header */}
      <div className={`bg-[#1a1a1a] [data-theme='light']_&:bg-white border-b border-[#2a2a2a] [data-theme='light']_&:border-gray-200 fixed ${bannerDismissed ? 'top-0' : 'top-[52px]'} left-0 right-0 z-40 transition-all duration-300 shadow-lg`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#ff6b35] rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-white [data-theme='light']_&:text-gray-900 font-medium">Admin Dashboard</h1>
                <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                  Welcome back, {adminInfo.name} • {adminInfo.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-6 py-3 bg-[#2a2a2a] [data-theme='light']_&:bg-gray-100 text-white [data-theme='light']_&:text-gray-700 rounded-lg hover:bg-[#ff6b35] hover:text-white transition-all shadow-md hover:shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-4 shadow-lg lg:sticky lg:top-24">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                        activeTab === tab.id
                          ? 'bg-[#ff6b35] text-white shadow-md'
                          : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a] [data-theme=\'light\']_&:text-gray-700 [data-theme=\'light\']_&:hover:bg-gray-100 [data-theme=\'light\']_&:hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </motion.button>
                  );
                })}
              </nav>
              
              {/* Sidebar footer info */}
              <div className="mt-6 pt-6 border-t border-[#2a2a2a] [data-theme='light']_&:border-gray-200">
                <div className="text-xs text-gray-500 [data-theme='light']_&:text-gray-500">
                  <div className="flex items-center justify-between mb-2">
                    <span>Active Tab:</span>
                    <span className="text-[#ff6b35] capitalize">{activeTab.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Role:</span>
                    <span className="text-white [data-theme='light']_&:text-gray-900 capitalize">
                      {adminInfo.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">{/* min-w-0 prevents flex overflow */}
            {activeTab === 'overview' && <AdminOverview onNavigate={setActiveTab} adminInfo={adminInfo} />}
            {activeTab === 'photos' && <PhotoManagement adminInfo={adminInfo} />}
            {activeTab === 'inventory' && <InventoryManagement adminInfo={adminInfo} />}
            {activeTab === 'orders' && <OrderManagement adminInfo={adminInfo} />}
            {activeTab === 'cleanup' && <DataCleanup adminInfo={adminInfo} />}
            {activeTab === 'export' && <ExportData adminInfo={adminInfo} />}
            {activeTab === 'settings' && <AdminSettings adminInfo={adminInfo} />}
            {activeTab === 's3-folders' && <S3FolderManager adminInfo={adminInfo} />}
            {activeTab === 'image-library' && <ImageLibrary adminInfo={adminInfo} />}
            {activeTab === 'discounts' && <DiscountManagement adminInfo={adminInfo} />}
            {activeTab === 'marketplace' && <AdminMarketplaceApprovals adminEmail={adminInfo.email} />}
          </div>
        </div>
      </div>
    </div>
  );
}