import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Copy, FileWarning } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/config';

interface CorsInfo {
  bucketName: string;
  region: string;
  bucketUrl: string;
  corsConfiguration: any[];
  instructions: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    step6: string;
  };
  awsConsoleUrl: string;
}

export function S3CorsHelper() {
  const [corsInfo, setCorsInfo] = useState<CorsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCorsInfo();
  }, []);

  const fetchCorsInfo = async () => {
    try {
      console.log('Fetching S3 CORS info...');
      const adminEmail = localStorage.getItem('adminEmail');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7/admin/s3-cors-info`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Email': adminEmail || '',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCorsInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch CORS info:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (corsInfo) {
      navigator.clipboard.writeText(JSON.stringify(corsInfo.corsConfiguration, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
        <p className="text-gray-400">Loading S3 configuration...</p>
      </div>
    );
  }

  if (!corsInfo) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
        <FileWarning className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-red-400 font-medium mb-1">S3 Bucket CORS Configuration Required</h3>
          <p className="text-red-300/80 text-sm">
            Your S3 bucket needs CORS configuration to allow uploads and image access from your website.
            Follow the steps below to fix this issue.
          </p>
        </div>
      </div>

      {/* Bucket Info */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
        <h3 className="text-white font-medium mb-4">Bucket Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Bucket Name:</span>
            <code className="text-[#ff6b35] bg-[#0a0a0a] px-3 py-1 rounded">{corsInfo.bucketName}</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Region:</span>
            <code className="text-[#ff6b35] bg-[#0a0a0a] px-3 py-1 rounded">{corsInfo.region}</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Bucket URL:</span>
            <code className="text-[#ff6b35] bg-[#0a0a0a] px-3 py-1 rounded text-xs">{corsInfo.bucketUrl}</code>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
        <h3 className="text-white font-medium mb-4">Setup Instructions</h3>
        <div className="space-y-3">
          {Object.entries(corsInfo.instructions).map(([key, value], index) => (
            <div key={key} className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ff6b35] text-white text-sm flex items-center justify-center">
                {index + 1}
              </div>
              <p className="text-gray-300 text-sm pt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <a
          href={corsInfo.awsConsoleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-colors"
        >
          Open AWS S3 Console
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* CORS Configuration */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">CORS Configuration (Copy & Paste)</h3>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] text-white rounded-md hover:bg-[#3a3a3a] transition-colors text-sm"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
        
        <pre className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 overflow-x-auto text-xs text-gray-300 font-mono">
{JSON.stringify(corsInfo.corsConfiguration, null, 2)}
        </pre>
      </div>

      {/* Additional Help */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-blue-300 mb-2">
            <strong>Important Notes:</strong>
          </p>
          <ul className="text-blue-300/80 space-y-1 list-disc list-inside">
            <li>This configuration allows access from any origin (*) for development purposes</li>
            <li>For production, replace "*" with your specific domain</li>
            <li>After saving, it may take a few minutes for changes to propagate</li>
            <li>Test the upload functionality after configuring CORS</li>
          </ul>
        </div>
      </div>
    </div>
  );
}