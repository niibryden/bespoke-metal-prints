import { useState } from 'react';
import { motion } from 'motion/react';
import { Download, FileText, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { getServerUrl } from '../../utils/serverUrl';

export function ExportData({ adminInfo }: { adminInfo: { email: string; accessToken: string } }) {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const serverUrl = getServerUrl();

  const exportData = async (type: 'orders' | 'customers' | 'revenue') => {
    setExporting(true);
    setExportType(type);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${serverUrl}/admin/export/${type}`,
        {
          headers: {
            'Authorization': `Bearer ${adminInfo.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export data');
      }

      // Get the CSV blob
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(`Successfully exported ${type} data`);
    } catch (err: any) {
      console.error('Export error:', err);
      setError(err.message || 'Failed to export data');
    } finally {
      setExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-medium text-gray-900">Export Data</h2>
            <p className="text-sm text-gray-600">
              Download your business data as CSV spreadsheets
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">CSV Format</p>
              <p>
                All exports are in CSV format which can be opened in Excel, Google Sheets, or any
                spreadsheet application. Data includes all orders from December 2025 onwards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Export */}
      <motion.div
        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Orders Export</h3>
              <p className="text-sm text-gray-600">
                Download all orders with details including status, customer info, items, and tracking
              </p>
            </div>
          </div>
          <button
            onClick={() => exportData('orders')}
            disabled={exporting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 whitespace-nowrap"
          >
            {exporting && exportType === 'orders' ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export CSV
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Customers Export */}
      <motion.div
        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Customers Export</h3>
              <p className="text-sm text-gray-600">
                Download customer list with emails, order counts, and total spending
              </p>
            </div>
          </div>
          <button
            onClick={() => exportData('customers')}
            disabled={exporting}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 whitespace-nowrap"
          >
            {exporting && exportType === 'customers' ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export CSV
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Revenue Export */}
      <motion.div
        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Export</h3>
              <p className="text-sm text-gray-600">
                Download revenue summary by date, status, and payment information
              </p>
            </div>
          </div>
          <button
            onClick={() => exportData('revenue')}
            disabled={exporting}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 whitespace-nowrap"
          >
            {exporting && exportType === 'revenue' ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export CSV
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Success Message */}
      {success && (
        <motion.div
          className="bg-green-50 border border-green-200 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-900 mb-1">Export Successful</h4>
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900 mb-1">Export Failed</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
