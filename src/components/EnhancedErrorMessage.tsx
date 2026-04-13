import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw, HelpCircle, Wifi, Image, Server, X } from 'lucide-react';
import { useState } from 'react';

type ErrorType = 'network' | 'upload' | 'server' | 'validation' | 'generic';

interface EnhancedErrorMessageProps {
  type: ErrorType;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  suggestions?: string[];
  technicalDetails?: string;
  className?: string;
}

export function EnhancedErrorMessage({
  type,
  message,
  onRetry,
  onDismiss,
  suggestions,
  technicalDetails,
  className = '',
}: EnhancedErrorMessageProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: Wifi,
          color: 'orange',
          title: 'Connection Issue',
          defaultSuggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Disable VPN if you\'re using one',
          ],
        };
      case 'upload':
        return {
          icon: Image,
          color: 'red',
          title: 'Upload Failed',
          defaultSuggestions: [
            'Use a smaller image (under 10MB)',
            'Try a different file format (JPG, PNG)',
            'Check if your browser allows file uploads',
          ],
        };
      case 'server':
        return {
          icon: Server,
          color: 'purple',
          title: 'Server Error',
          defaultSuggestions: [
            'Wait a moment and try again',
            'Our team has been notified',
            'If issue persists, contact support',
          ],
        };
      case 'validation':
        return {
          icon: AlertTriangle,
          color: 'yellow',
          title: 'Invalid Input',
          defaultSuggestions: [
            'Check all required fields are filled',
            'Ensure email format is correct',
            'Verify phone number format',
          ],
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'gray',
          title: 'Something Went Wrong',
          defaultSuggestions: [
            'Try again in a moment',
            'Refresh the page',
            'Contact support if issue persists',
          ],
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;
  const suggestionsList = suggestions || config.defaultSuggestions;

  const colorClasses = {
    red: {
      bg: 'bg-red-50 dark:bg-red-900/10',
      border: 'border-red-200 dark:border-red-800',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      text: 'text-red-800 dark:text-red-300',
      button: 'bg-red-600 hover:bg-red-700 text-white',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/10',
      border: 'border-orange-200 dark:border-orange-800',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      text: 'text-orange-800 dark:text-orange-300',
      button: 'bg-orange-600 hover:bg-orange-700 text-white',
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/10',
      border: 'border-yellow-200 dark:border-yellow-800',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      text: 'text-yellow-800 dark:text-yellow-300',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/10',
      border: 'border-purple-200 dark:border-purple-800',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      text: 'text-purple-800 dark:text-purple-300',
      button: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
    gray: {
      bg: 'bg-gray-50 dark:bg-gray-900/10',
      border: 'border-gray-200 dark:border-gray-800',
      iconBg: 'bg-gray-100 dark:bg-gray-900/30',
      iconColor: 'text-gray-600 dark:text-gray-400',
      text: 'text-gray-800 dark:text-gray-300',
      button: 'bg-gray-600 hover:bg-gray-700 text-white',
    },
  };

  const colors = colorClasses[config.color as keyof typeof colorClasses];

  return (
    <motion.div
      className={`rounded-xl border-2 ${colors.bg} ${colors.border} p-5 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-lg ${colors.iconBg} flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${colors.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={`font-semibold text-lg ${colors.text}`}>
              {config.title}
            </h4>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${colors.iconColor}`}
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Error Message */}
          <p className={`mb-4 ${colors.text}`}>
            {message}
          </p>

          {/* Suggestions */}
          {suggestionsList.length > 0 && (
            <div className="mb-4">
              <p className={`text-sm font-medium mb-2 ${colors.text}`}>
                💡 Try these solutions:
              </p>
              <ul className="space-y-1.5">
                {suggestionsList.map((suggestion, index) => (
                  <li key={index} className={`flex items-start gap-2 text-sm ${colors.text}`}>
                    <span className="mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${colors.button}`}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}

            {technicalDetails && (
              <button
                onClick={() => setShowTechnical(!showTechnical)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 border-2 ${colors.border} ${colors.text} hover:bg-black/5 dark:hover:bg-white/5`}
              >
                <HelpCircle className="w-4 h-4" />
                {showTechnical ? 'Hide' : 'Show'} Technical Details
              </button>
            )}

            <a
              href="mailto:support@bespokemetalprints.com"
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 border-2 ${colors.border} ${colors.text} hover:bg-black/5 dark:hover:bg-white/5`}
            >
              Contact Support
            </a>
          </div>

          {/* Technical Details */}
          {showTechnical && technicalDetails && (
            <motion.div
              className={`mt-4 p-4 rounded-lg border ${colors.border} bg-black/5 dark:bg-white/5`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                Technical Details:
              </p>
              <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                {technicalDetails}
              </code>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Simplified inline error (for form fields)
interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <motion.div
      className={`flex items-center gap-2 text-sm text-red-600 dark:text-red-400 ${className}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
    >
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}
