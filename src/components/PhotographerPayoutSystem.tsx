import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Download, AlertCircle, Calendar, CreditCard, FileText } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getServerUrl } from '../utils/serverUrl';

interface PayoutRequest {
  id: string;
  photographer_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requested_at: string;
  processed_at?: string;
  payment_method: string;
  payment_details: string;
  notes?: string;
}

interface EarningsSummary {
  total_earnings: number;
  pending_earnings: number;
  paid_out: number;
  available_balance: number;
  sales_count: number;
  this_month: number;
  last_month: number;
}

export function PhotographerPayoutSystem() {
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabase = getSupabaseClient();

  useEffect(() => {
    loadEarningsData();
  }, []);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('Not authenticated, using mock earnings data');
        loadMockEarningsData();
        setLoading(false);
        return;
      }

      const serverUrl = getServerUrl();
      
      // If no server URL, use mock data
      if (!serverUrl) {
        console.log('No server URL configured, using mock earnings data');
        loadMockEarningsData();
        setLoading(false);
        return;
      }

      // Fetch earnings summary from backend
      const response = await fetch(`${serverUrl}/make-server-3e3a9cd7/photographer/earnings`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load earnings data');
      }

      const data = await response.json();
      setEarnings(data.summary);
      setPayoutRequests(data.payout_requests || []);
      
    } catch (err) {
      console.error('Error loading earnings:', err);
      loadMockEarningsData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockEarningsData = () => {
    // Use mock data as fallback
    setEarnings({
      total_earnings: 487.50,
      pending_earnings: 125.00,
      paid_out: 362.50,
      available_balance: 125.00,
      sales_count: 24,
      this_month: 125.00,
      last_month: 98.75,
    });
    setPayoutRequests([
      {
        id: 'demo-1',
        photographer_id: 'demo',
        amount: 100,
        status: 'paid',
        requested_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        processed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: 'paypal',
        payment_details: 'demo@example.com',
        notes: 'Payment completed',
      },
    ]);
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!earnings || amount > earnings.available_balance) {
      setError(`Amount cannot exceed available balance ($${earnings?.available_balance.toFixed(2)})`);
      return;
    }

    if (amount < 50) {
      setError('Minimum payout amount is $50');
      return;
    }

    if (!paymentDetails.trim()) {
      setError('Please provide payment details');
      return;
    }

    try {
      setRequesting(true);
      setError('');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please log in to request payout');
        return;
      }

      const serverUrl = getServerUrl();
      if (!serverUrl) {
        setError('Backend not available. Please try again later.');
        return;
      }

      const response = await fetch(`${serverUrl}/make-server-3e3a9cd7/photographer/request-payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount,
          payment_method: paymentMethod,
          payment_details: paymentDetails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to request payout');
      }

      setSuccess('Payout request submitted successfully! We will process it within 3-5 business days.');
      setShowRequestForm(false);
      setRequestAmount('');
      setPaymentDetails('');
      
      // Reload data
      await loadEarningsData();
      
    } catch (err: any) {
      console.error('Error requesting payout:', err);
      setError(err.message || 'Failed to request payout');
    } finally {
      setRequesting(false);
    }
  };

  const downloadStatement = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please log in to download statement');
        return;
      }

      const serverUrl = getServerUrl();
      if (!serverUrl) {
        setError('Backend not available. Please try again later.');
        return;
      }

      const response = await fetch(`${serverUrl}/make-server-3e3a9cd7/photographer/earnings-statement`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to download statement');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `earnings-statement-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Error downloading statement:', err);
      setError('Failed to download statement');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900">
            Earnings & Payouts
          </h1>
          <p className="text-gray-400 mt-1 [data-theme='light']_&:text-gray-600">
            Manage your photographer earnings and request payouts
          </p>
        </div>
        
        <button
          onClick={downloadStatement}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg border border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors [data-theme='light']_&:bg-white [data-theme='light']_&:text-gray-900 [data-theme='light']_&:border-gray-300"
          aria-label="Download earnings statement"
        >
          <Download className="w-4 h-4" />
          <span>Statement</span>
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-500 text-sm">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-500 text-sm">{success}</p>
        </motion.div>
      )}

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-gray-400 text-sm mb-1 [data-theme='light']_&:text-gray-600">Available Balance</p>
          <p className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900">
            ${earnings?.available_balance.toFixed(2) || '0.00'}
          </p>
        </motion.div>

        {/* Total Earnings */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#ff6b35]/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#ff6b35]" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1 [data-theme='light']_&:text-gray-600">Total Earnings</p>
          <p className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900">
            ${earnings?.total_earnings.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {earnings?.sales_count || 0} sales
          </p>
        </motion.div>

        {/* Pending */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1 [data-theme='light']_&:text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900">
            ${earnings?.pending_earnings.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Processing sales
          </p>
        </motion.div>

        {/* Paid Out */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1 [data-theme='light']_&:text-gray-600">Paid Out</p>
          <p className="text-3xl font-bold text-white [data-theme='light']_&:text-gray-900">
            ${earnings?.paid_out.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            All time
          </p>
        </motion.div>
      </div>

      {/* Request Payout Button */}
      {!showRequestForm && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowRequestForm(true)}
          disabled={!earnings || earnings.available_balance < 50}
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white rounded-xl hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          Request Payout
          {earnings && earnings.available_balance < 50 && (
            <span className="text-xs opacity-80">(Min. $50)</span>
          )}
        </motion.button>
      )}

      {/* Payout Request Form */}
      {showRequestForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300"
        >
          <h3 className="text-xl font-semibold text-white mb-4 [data-theme='light']_&:text-gray-900">
            Request Payout
          </h3>
          
          <form onSubmit={handleRequestPayout} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2 [data-theme='light']_&:text-gray-700">
                Amount (Min. $50, Max. ${earnings?.available_balance.toFixed(2)})
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="50"
                max={earnings?.available_balance}
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b35] [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-300 [data-theme='light']_&:text-gray-900"
                placeholder="Enter amount"
                required
                aria-label="Payout amount"
              />
            </div>

            <div>
              <label htmlFor="payment-method" className="block text-sm font-medium text-gray-300 mb-2 [data-theme='light']_&:text-gray-700">
                Payment Method
              </label>
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b35] [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-300 [data-theme='light']_&:text-gray-900"
                aria-label="Payment method"
              >
                <option value="paypal">PayPal</option>
                <option value="venmo">Venmo</option>
                <option value="bank_transfer">Bank Transfer (ACH)</option>
                <option value="check">Check (Mail)</option>
              </select>
            </div>

            <div>
              <label htmlFor="payment-details" className="block text-sm font-medium text-gray-300 mb-2 [data-theme='light']_&:text-gray-700">
                Payment Details
              </label>
              <input
                id="payment-details"
                type="text"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b35] [data-theme='light']_&:bg-gray-50 [data-theme='light']_&:border-gray-300 [data-theme='light']_&:text-gray-900"
                placeholder={
                  paymentMethod === 'paypal' ? 'PayPal email' :
                  paymentMethod === 'venmo' ? 'Venmo username' :
                  paymentMethod === 'bank_transfer' ? 'Account & routing number' :
                  'Mailing address'
                }
                required
                aria-label="Payment details"
              />
              <p className="text-xs text-gray-500 mt-1">
                {paymentMethod === 'paypal' && 'Enter the email associated with your PayPal account'}
                {paymentMethod === 'venmo' && 'Enter your Venmo username (without @)'}
                {paymentMethod === 'bank_transfer' && 'Enter your account and routing numbers (will be encrypted)'}
                {paymentMethod === 'check' && 'Enter your complete mailing address'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={requesting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requesting ? 'Requesting...' : 'Submit Request'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowRequestForm(false);
                  setError('');
                }}
                className="px-6 py-3 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors [data-theme='light']_&:bg-gray-200 [data-theme='light']_&:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Payout History */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300">
        <div className="p-6 border-b border-[#2a2a2a] [data-theme='light']_&:border-gray-300">
          <h3 className="text-xl font-semibold text-white [data-theme='light']_&:text-gray-900">
            Payout History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider [data-theme='light']_&:text-gray-600">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider [data-theme='light']_&:text-gray-600">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider [data-theme='light']_&:text-gray-600">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider [data-theme='light']_&:text-gray-600">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider [data-theme='light']_&:text-gray-600">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a] [data-theme='light']_&:divide-gray-200">
              {payoutRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No payout requests yet</p>
                    <p className="text-sm mt-1">Request your first payout when you reach $50</p>
                  </td>
                </tr>
              ) : (
                payoutRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 [data-theme='light']_&:text-gray-900">
                      {new Date(request.requested_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white [data-theme='light']_&:text-gray-900">
                      ${request.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                      {request.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-semibold
                        ${request.status === 'paid' ? 'bg-green-500/20 text-green-500' : ''}
                        ${request.status === 'approved' ? 'bg-blue-500/20 text-blue-500' : ''}
                        ${request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : ''}
                        ${request.status === 'rejected' ? 'bg-red-500/20 text-red-500' : ''}
                      `}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate [data-theme='light']_&:text-gray-600">
                      {request.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-500">
            <p className="font-semibold mb-1">Payment Information</p>
            <ul className="list-disc list-inside space-y-1 text-blue-400">
              <li>Minimum payout amount: $50</li>
              <li>Processing time: 3-5 business days</li>
              <li>Earnings are available 14 days after sale (chargeback protection)</li>
              <li>For tax purposes, download your earnings statement monthly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}