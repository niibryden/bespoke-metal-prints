import React from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/config';
import { getServerUrl } from '../utils/serverUrl';

interface DiagnosticPageProps {
  onClose: () => void;
}

export function DiagnosticPage({ onClose }: DiagnosticPageProps) {
  const serverUrl = getServerUrl();
  
  const testPing = async () => {
    try {
      console.log('🔍 Testing ping to:', `${serverUrl}/ping`);
      const response = await fetch(`${serverUrl}/ping`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      const data = await response.json();
      console.log('✅ Ping response:', data);
      alert(`✅ Server responded!\n\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('❌ Ping failed:', error);
      alert(`❌ Ping failed!\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🔍 Diagnostic Tool
        </h1>
        
        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-gray-50 dark:bg-[#1a1a1a] p-6 rounded-lg border-2 border-gray-200 dark:border-[#2a2a2a]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Project Configuration
            </h2>
            <div className="space-y-2 font-mono text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Project ID:</span>{' '}
                <span className="text-[#ff6b35]">{projectId}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Has Anon Key:</span>{' '}
                <span className="text-[#ff6b35]">{publicAnonKey ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
          
          {/* Server URL */}
          <div className="bg-gray-50 dark:bg-[#1a1a1a] p-6 rounded-lg border-2 border-gray-200 dark:border-[#2a2a2a]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Server URL from getServerUrl()
            </h2>
            <div className="space-y-4">
              <div className="bg-white dark:bg-black p-4 rounded border border-gray-300 dark:border-[#2a2a2a]">
                <code className="text-sm text-[#ff6b35] break-all">
                  {serverUrl}
                </code>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Expected structure:</strong>
                </p>
                <code className="text-xs text-gray-600 dark:text-gray-400 break-all block bg-white dark:bg-black p-3 rounded border">
                  https://shspfbpqdctargcjhnke.supabase.co/functions/v1/make-server/make-server-3e3a9cd7
                </code>
              </div>
              
              {serverUrl === 'https://shspfbpqdctargcjhnke.supabase.co/functions/v1/make-server/make-server-3e3a9cd7' ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400" />
                  <span className="font-medium">✅ URL is correct!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400" />
                  <span className="font-medium">❌ URL is INCORRECT - browser cache issue!</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Test Endpoints */}
          <div className="bg-gray-50 dark:bg-[#1a1a1a] p-6 rounded-lg border-2 border-gray-200 dark:border-[#2a2a2a]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Test Server Connection
            </h2>
            <button
              onClick={testPing}
              className="w-full py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8555] transition-colors font-medium"
            >
              Test Ping Endpoint
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              This will try to ping: <code className="text-[#ff6b35]">{serverUrl}/ping</code>
            </p>
          </div>
          
          {/* Cache Clear Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border-2 border-yellow-500">
            <h2 className="text-xl font-bold text-yellow-700 dark:text-yellow-400 mb-4">
              ⚠️ If URL is Incorrect
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your browser has cached the old version of the app. You need to perform a <strong>hard refresh</strong>:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Windows/Linux:</strong> Press <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">Ctrl + Shift + R</code> or <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">Ctrl + F5</code></li>
              <li><strong>Mac:</strong> Press <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">Cmd + Shift + R</code></li>
              <li><strong>Alternative:</strong> Open DevTools (F12), right-click the refresh button, select "Empty Cache and Hard Reload"</li>
            </ul>
          </div>
          
          {/* Deployment Status */}
          <div className="bg-gray-50 dark:bg-[#1a1a1a] p-6 rounded-lg border-2 border-gray-200 dark:border-[#2a2a2a]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Deployment Checklist
            </h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#ff6b35] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong>Check if Edge Function is deployed:</strong>
                  <br />
                  <code className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">
                    supabase functions list
                  </code>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#ff6b35] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong>Deploy the Edge Function:</strong>
                  <br />
                  <code className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">
                    supabase functions deploy make-server
                  </code>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#ff6b35] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong>Wait 30 seconds for deployment to complete</strong>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#ff6b35] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <strong>Hard refresh this page and test again</strong>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}