import { useState } from 'react';
import { Folder, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StockPhotoUpload } from './StockPhotoUpload';
import { StockPhotoManage } from './StockPhotoManage';

type Tab = 'browse' | 'upload';

export function PhotoManagement({ adminInfo }: { adminInfo?: { email: string; role: string; name: string; permissions: any; accessToken: string } }) {
  const [activeTab, setActiveTab] = useState<Tab>('browse');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-white [data-theme='light']_&:text-gray-900 mb-1">Photo Management</h2>
          <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
            Upload and manage your stock photo collections
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
            activeTab === 'browse'
              ? 'bg-[#ff6b35] text-white shadow-md'
              : 'text-gray-400 hover:text-white [data-theme=\'light\']_&:text-gray-600 [data-theme=\'light\']_&:hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Folder className="w-5 h-5" />
            Browse & Manage
          </div>
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
            activeTab === 'upload'
              ? 'bg-[#ff6b35] text-white shadow-md'
              : 'text-gray-400 hover:text-white [data-theme=\'light\']_&:text-gray-600 [data-theme=\'light\']_&:hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Photos
          </div>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <StockPhotoManage adminInfo={adminInfo} />
          </motion.div>
        )}
        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <StockPhotoUpload adminInfo={adminInfo} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}