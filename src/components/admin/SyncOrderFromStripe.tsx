import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/config';

interface SyncOrderFromStripeProps {
  orderId: string;
  paymentIntentId: string;
  onSuccess: () => void;
}

export function SyncOrderFromStripe({ orderId, paymentIntentId, onSuccess }: SyncOrderFromStripeProps) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);

    try {
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;

      console.log('🔄 Syncing order from Stripe:', { orderId, paymentIntentId });

      const response = await fetch(`${serverUrl}/admin/sync-order-from-stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          orderId,
          paymentIntentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Server error response:', { status: response.status, data });
        throw new Error(data.details || data.error || 'Failed to sync order');
      }

      setResult({
        success: true,
        message: data.message || 'Order synced successfully!',
      });

      console.log('✅ Order synced:', data);
      
      // Wait a moment then trigger refresh
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error: any) {
      console.error('❌ Sync error:', error);
      setResult({
        success: false,
        message: error.message || 'Failed to sync order',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-400 mb-2">
            🔄 Order Status Mismatch Detected
          </p>
          <p className="text-xs text-blue-400 [data-theme='light']_&:text-blue-600 mb-3">
            This order shows as <strong>pending</strong> in the database, but payment may have succeeded in Stripe. 
            This happens when the webhook doesn't fire or the payment callback fails.
          </p>
          <p className="text-xs text-blue-400 [data-theme='light']_&:text-blue-600 mb-3">
            Click below to check Stripe and sync the real payment status:
          </p>
        </div>
      </div>

      {result && (
        <div className={`mb-3 p-3 rounded-lg border ${
          result.success 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <p className={`text-xs ${
              result.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.message}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={handleSync}
        disabled={syncing || result?.success}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
      >
        {syncing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Syncing from Stripe...
          </>
        ) : result?.success ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Synced Successfully
          </>
        ) : (
          <>
            <RefreshCw className="w-5 h-5" />
            Sync Order Status from Stripe
          </>
        )}
      </button>

      <div className="mt-3 p-2 bg-gray-500/10 border border-gray-500/20 rounded text-xs text-gray-400">
        <strong>How this works:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Fetches payment status directly from Stripe API</li>
          <li>Updates order status to match Stripe (paid/refunded/failed)</li>
          <li>Safe to run multiple times (idempotent)</li>
          <li>Won't upload image (that's done during checkout)</li>
        </ul>
      </div>
    </div>
  );
}