import React from 'react';
import { ArrowLeft, Code2, Settings, Zap, MessageCircle, Palette, Move } from 'lucide-react';
import { ReturnToHomeButton } from './ReturnToHomeButton';

export function SupportSyncIntegrationPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-[#2a2a2a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <ReturnToHomeButton onClick={() => window.history.back()} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">SupportSync Widget Integration</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Complete documentation of how the live chat widget was embedded into Bespoke Metal Prints
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Overview */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <MessageCircle className="w-6 h-6 text-orange-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What is SupportSync?</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
            <p className="text-gray-700 mb-4 dark:text-gray-300">
              SupportSync is a custom chatbot widget embedded directly into your Bespoke Metal Prints website. 
              It provides real-time customer support through an iframe-based chat interface that loads from a 
              separate Figma Site.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 dark:text-white">Widget Features:</h3>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Draggable floating button</li>
                  <li>• Orange branded (#fa8500)</li>
                  <li>• Persistent position storage</li>
                  <li>• Unread message badges</li>
                  <li>• Smooth animations</li>
                  <li>• Mobile responsive</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 dark:text-white">Technical Details:</h3>
                <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Iframe-based architecture</li>
                  <li>• Pure vanilla JavaScript</li>
                  <li>• Zero dependencies</li>
                  <li>• LocalStorage for state</li>
                  <li>• Bottom-right positioning</li>
                  <li>• Global API access</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Step-by-Step Implementation */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Code2 className="w-6 h-6 text-orange-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Step-by-Step Implementation</h2>
          </div>

          {/* Step 1 */}
          <div className="mb-8">
            <div className="flex items-start mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-1 dark:text-white">Add Widget Configuration</h3>
            </div>
            <div className="ml-11 bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <p className="text-gray-700 mb-3 dark:text-gray-300">
                Created a configuration object in <code className="bg-gray-200 px-2 py-1 rounded text-sm">/App.tsx</code> with:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`const config = {
  userId: '9438bfe4-f4a0-4ffb-b802-c67d7bd384fe',
  primaryColor: '#fa8500',
  position: 'bottom-right',
  baseUrl: 'https://heart-habit-01858648.figma.site',
};`}
              </pre>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>userId:</strong> Unique identifier for the widget instance
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>primaryColor:</strong> Brand orange color (#fa8500)
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>position:</strong> Bottom-right corner placement
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>baseUrl:</strong> URL of the Figma Site hosting the chat interface
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-8">
            <div className="flex items-start mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-1 dark:text-white">Create Floating Launcher Button</h3>
            </div>
            <div className="ml-11 bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <p className="text-gray-700 mb-3 dark:text-gray-300">
                Created a draggable button that appears in the bottom-right corner:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <strong>Visual:</strong> Orange circle with chat icon</li>
                <li>• <strong>Behavior:</strong> Click to open/close chat window</li>
                <li>• <strong>Draggable:</strong> Click and drag to reposition</li>
                <li>• <strong>State:</strong> Position saved to localStorage</li>
                <li>• <strong>Badge:</strong> Displays unread message count</li>
              </ul>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-900">
                  💡 <strong>Tip:</strong> The launcher button is draggable! Users can move it to their preferred position, 
                  and it will stay there even after page refresh.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-8">
            <div className="flex items-start mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-1 dark:text-white">Build Chat Window Container</h3>
            </div>
            <div className="ml-11 bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <p className="text-gray-700 mb-3 dark:text-gray-300">
                Created a fixed-position container to hold the chat iframe:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`container.style.cssText = \`
  position: fixed;
  right: 20px;
  bottom: 90px;
  width: 380px;
  height: 600px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 120px);
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  z-index: 2147483646;
  display: none;
  opacity: 0;
\`;`}
              </pre>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Positioning:</strong> Fixed bottom-right, positioned above launcher
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Sizing:</strong> 380x600px with responsive max-width/height
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Styling:</strong> White background, rounded corners, shadow
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Z-index:</strong> Very high (2147483646) to stay on top
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="mb-8">
            <div className="flex items-start mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-1 dark:text-white">Embed Chat Iframe</h3>
            </div>
            <div className="ml-11 bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <p className="text-gray-700 mb-3 dark:text-gray-300">
                Created an iframe that loads the SupportSync chat interface:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`const frame = document.createElement('iframe');
frame.id = 'supportsync-iframe';
frame.src = \`\${config.baseUrl}/?widget-embed=true&userId=\${config.userId}\`;
frame.style.cssText = \`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 16px;
\`;
container.appendChild(frame);`}
              </pre>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Source:</strong> Figma Site with query parameters
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Parameters:</strong> widget-embed=true & userId for tracking
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Styling:</strong> Borderless, rounded, 100% container size
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="mb-8">
            <div className="flex items-start mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                5
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-1 dark:text-white">Implement Open/Close Toggle</h3>
            </div>
            <div className="ml-11 bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <p className="text-gray-700 mb-3 dark:text-gray-300">
                Created smooth animation logic for showing/hiding the chat window:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`function toggleWidget() {
  if (isOpen) {
    // Close animation
    chatWindow.style.opacity = '0';
    chatWindow.style.transform = 'scale(0.95) translateY(10px)';
    setTimeout(() => {
      chatWindow.style.display = 'none';
      isOpen = false;
    }, 200);
  } else {
    // Open animation
    isOpen = true;
    chatWindow.style.display = 'block';
    setTimeout(() => {
      chatWindow.style.opacity = '1';
      chatWindow.style.transform = 'scale(1) translateY(0)';
    }, 10);
  }
}`}
              </pre>
              <p className="text-sm text-gray-600 mt-3 dark:text-gray-400">
                Uses CSS transitions for smooth fade-in/fade-out with scale animation
              </p>
            </div>
          </div>

          {/* Step 6 */}
          <div className="mb-8">
            <div className="flex items-start mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                6
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-1 dark:text-white">Add Drag-and-Drop Functionality</h3>
            </div>
            <div className="ml-11 bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <p className="text-gray-700 mb-3 dark:text-gray-300">
                Implemented mouse event handlers for dragging the launcher button:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <strong>mousedown:</strong> Start dragging, capture initial position</li>
                <li>• <strong>mousemove:</strong> Update button position during drag</li>
                <li>• <strong>mouseup:</strong> End dragging, save position to localStorage</li>
                <li>• <strong>click detection:</strong> Distinguish between click and drag</li>
              </ul>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mt-3">
{`// Save position to localStorage
localStorage.setItem('supportsync-position', 
  JSON.stringify({ right: position.right, bottom: position.bottom })
);

// Load saved position on init
const savedPosition = localStorage.getItem('supportsync-position');
if (savedPosition) {
  position = JSON.parse(savedPosition);
}`}
              </pre>
            </div>
          </div>

          {/* Step 7 */}
          <div className="mb-8">
            <div className="flex items-start mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                7
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-1 dark:text-white">Expose Global API</h3>
            </div>
            <div className="ml-11 bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <p className="text-gray-700 mb-3 dark:text-gray-300">
                Created a global JavaScript API for programmatic control:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`window.SupportSyncWidget = {
  open: () => { if (!isOpen) toggleWidget(); },
  close: () => { if (isOpen) toggleWidget(); },
  toggle: toggleWidget,
  isOpen: () => isOpen,
};`}
              </pre>
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-900">
                  ✅ <strong>Usage:</strong> You can control the widget from browser console:<br />
                  <code className="bg-green-100 px-2 py-1 rounded text-xs">window.SupportSyncWidget.open()</code><br />
                  <code className="bg-green-100 px-2 py-1 rounded text-xs">window.SupportSyncWidget.close()</code>
                </p>
              </div>
            </div>
          </div>

          {/* Step 8 */}
          <div className="mb-8">
            <div className="flex items-start mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                8
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-1 dark:text-white">Wrap in React useEffect Hook</h3>
            </div>
            <div className="ml-11 bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <p className="text-gray-700 mb-3 dark:text-gray-300">
                Wrapped the widget initialization in a React useEffect hook in <code className="bg-gray-200 px-2 py-1 rounded text-sm">/App.tsx</code>:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`useEffect(() => {
  // Check if already loaded
  if (window.SupportSyncWidget || 
      document.getElementById('supportsync-launcher')) {
    console.log('⚠️ SupportSync widget already loaded');
    return;
  }

  console.log('🤖 Loading SupportSync widget...');
  
  // Widget initialization code...
  
  // Cleanup function
  return () => {
    const launcher = document.getElementById('supportsync-launcher');
    const chatWindow = document.getElementById('supportsync-chat-window');
    if (launcher) launcher.remove();
    if (chatWindow) chatWindow.remove();
    delete window.SupportSyncWidget;
  };
}, []);`}
              </pre>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Deduplication:</strong> Checks for existing widget to prevent duplicates
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Cleanup:</strong> Removes widget elements on component unmount
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Empty deps:</strong> Runs only once on initial mount
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* File Location */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 text-orange-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">File Location & Code</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
            <p className="text-gray-700 mb-4 dark:text-gray-300">
              The entire widget implementation is located in:
            </p>
            <div className="bg-white border border-gray-300 rounded p-4 mb-4">
              <code className="text-orange-600 font-mono">/App.tsx</code>
              <p className="text-sm text-gray-600 mt-2">Lines 261-519 (approximately)</p>
            </div>
            <p className="text-gray-700 mb-3 dark:text-gray-300">The code structure:</p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• <strong>Lines 261-267:</strong> useEffect hook initialization</li>
              <li>• <strong>Lines 273-278:</strong> Configuration object</li>
              <li>• <strong>Lines 280-290:</strong> State variables and localStorage</li>
              <li>• <strong>Lines 299-400:</strong> Launcher button creation & drag logic</li>
              <li>• <strong>Lines 409-444:</strong> Chat window & iframe creation</li>
              <li>• <strong>Lines 447-466:</strong> Toggle animation logic</li>
              <li>• <strong>Lines 498-503:</strong> Global API exposure</li>
              <li>• <strong>Lines 512-518:</strong> Cleanup function</li>
            </ul>
          </div>
        </section>

        {/* Customization Guide */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Palette className="w-6 h-6 text-orange-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customization Options</h2>
          </div>
          <div className="space-y-4">
            {/* Color */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <h3 className="font-semibold text-gray-900 mb-2 dark:text-white">Change Primary Color</h3>
              <p className="text-gray-700 text-sm mb-2 dark:text-gray-300">
                Update the <code className="bg-gray-200 px-2 py-1 rounded">primaryColor</code> in the config object:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
{`primaryColor: '#fa8500',  // Orange (current)
primaryColor: '#3b82f6',  // Blue
primaryColor: '#10b981',  // Green`}
              </pre>
            </div>

            {/* Position */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <h3 className="font-semibold text-gray-900 mb-2 dark:text-white">Change Default Position</h3>
              <p className="text-gray-700 text-sm mb-2 dark:text-gray-300">
                Update the <code className="bg-gray-200 px-2 py-1 rounded">position</code> object:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
{`let position = { right: 20, bottom: 20 };  // Bottom-right
let position = { right: 20, bottom: 100 }; // Higher up
let position = { right: 100, bottom: 20 }; // More left`}
              </pre>
            </div>

            {/* Size */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <h3 className="font-semibold text-gray-900 mb-2 dark:text-white">Change Window Size</h3>
              <p className="text-gray-700 text-sm mb-2 dark:text-gray-300">
                Update the dimensions in <code className="bg-gray-200 px-2 py-1 rounded">createChatWindow()</code>:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
{`width: 380px;   // Chat window width
height: 600px;  // Chat window height`}
              </pre>
            </div>

            {/* Base URL */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <h3 className="font-semibold text-gray-900 mb-2 dark:text-white">Change Chat Interface URL</h3>
              <p className="text-gray-700 text-sm mb-2 dark:text-gray-300">
                Update the <code className="bg-gray-200 px-2 py-1 rounded">baseUrl</code> in config:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
{`baseUrl: 'https://heart-habit-01858648.figma.site',
// Change to your own chat interface URL`}
              </pre>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 text-orange-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How It Works</h2>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-lg p-6 border border-orange-200 dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#3a3a3a] dark:border-[#5a5a5a]">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mr-3 mt-1">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Page Load</h4>
                  <p className="text-gray-700 text-sm dark:text-gray-300">
                    When the site loads, React's useEffect hook executes the widget initialization code
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mr-3 mt-1">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Widget Creation</h4>
                  <p className="text-gray-700 text-sm dark:text-gray-300">
                    Creates launcher button and chat window container, appends them to document.body
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mr-3 mt-1">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Position Restoration</h4>
                  <p className="text-gray-700 text-sm dark:text-gray-300">
                    Checks localStorage for saved position, applies if found (otherwise uses default)
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mr-3 mt-1">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">User Clicks Launcher</h4>
                  <p className="text-gray-700 text-sm dark:text-gray-300">
                    toggleWidget() function animates the chat window open/closed
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mr-3 mt-1">
                  5
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Iframe Loads</h4>
                  <p className="text-gray-700 text-sm dark:text-gray-300">
                    Chat interface loads from Figma Site with userId parameter for tracking
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mr-3 mt-1">
                  6
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">User Drags Launcher</h4>
                  <p className="text-gray-700 text-sm dark:text-gray-300">
                    Mouse events update position in real-time, saves to localStorage on mouseup
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mr-3 mt-1">
                  7
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Cleanup on Unmount</h4>
                  <p className="text-gray-700 text-sm dark:text-gray-300">
                    When App component unmounts, removes DOM elements and clears global API
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Code2 className="w-6 h-6 text-orange-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Technical Architecture</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 dark:text-white">Frontend (Bespoke Metal Prints)</h3>
                <ul className="space-y-2 text-gray-700 text-sm dark:text-gray-300">
                  <li>• React app with useEffect hook</li>
                  <li>• Vanilla JavaScript widget code</li>
                  <li>• DOM manipulation for UI</li>
                  <li>• localStorage for persistence</li>
                  <li>• CSS-in-JS styling</li>
                  <li>• Global window API</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 dark:text-white">Backend (SupportSync Chat)</h3>
                <ul className="space-y-2 text-gray-700 text-sm dark:text-gray-300">
                  <li>• Hosted on Figma Site</li>
                  <li>• Loaded via iframe</li>
                  <li>• Receives userId via URL params</li>
                  <li>• Handles chat conversations</li>
                  <li>• Manages message history</li>
                  <li>• Isolated security context</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white border border-gray-300 rounded dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <h3 className="font-semibold text-gray-900 mb-2 dark:text-white">Communication Flow</h3>
              <pre className="text-sm text-gray-700 dark:text-gray-300">
{`Main Site (bespokemetalprints.com)
    │
    ├── Widget Script (App.tsx)
    │   ├── Creates Launcher Button
    │   ├── Creates Chat Window Container
    │   └── Creates Iframe
    │
    └── Iframe loads: heart-habit-01858648.figma.site
        └── Chat Interface
            ├── Message UI
            ├── Conversation History
            └── User Identification (userId)`}
              </pre>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 text-orange-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Troubleshooting</h2>
          </div>
          <div className="space-y-3">
            <details className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <summary className="font-semibold text-gray-900 cursor-pointer dark:text-white">
                Widget not appearing on page
              </summary>
              <div className="mt-3 text-gray-700 text-sm space-y-2 dark:text-gray-300">
                <p>Check browser console for errors. Common issues:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Script blocked by ad blocker</li>
                  <li>Z-index conflict with other elements</li>
                  <li>useEffect not running (check React DevTools)</li>
                </ul>
                <p className="font-semibold mt-3">Solution:</p>
                <code className="block bg-gray-900 text-gray-100 p-2 rounded">
                  console.log(window.SupportSyncWidget); // Should not be undefined
                </code>
              </div>
            </details>

            <details className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <summary className="font-semibold text-gray-900 cursor-pointer dark:text-white">
                Chat window is blank/not loading
              </summary>
              <div className="mt-3 text-gray-700 text-sm space-y-2 dark:text-gray-300">
                <p>The iframe may not be loading the Figma Site. Check:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Verify baseUrl is correct and accessible</li>
                  <li>Check for CORS errors in console</li>
                  <li>Ensure Figma Site is published (not draft)</li>
                </ul>
                <p className="font-semibold mt-3">Test the URL directly:</p>
                <code className="block bg-gray-900 text-gray-100 p-2 rounded">
                  https://heart-habit-01858648.figma.site/?widget-embed=true&userId=test
                </code>
              </div>
            </details>

            <details className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <summary className="font-semibold text-gray-900 cursor-pointer dark:text-white">
                Launcher button position resets on refresh
              </summary>
              <div className="mt-3 text-gray-700 text-sm space-y-2 dark:text-gray-300">
                <p>localStorage may not be saving properly. Check:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Browser localStorage is enabled (not in incognito)</li>
                  <li>No browser extension blocking localStorage</li>
                  <li>Check Application tab in DevTools → localStorage</li>
                </ul>
                <p className="font-semibold mt-3">Verify saved position:</p>
                <code className="block bg-gray-900 text-gray-100 p-2 rounded">
                  localStorage.getItem('supportsync-position')
                </code>
              </div>
            </details>

            <details className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <summary className="font-semibold text-gray-900 cursor-pointer dark:text-white">
                Multiple widget instances appearing
              </summary>
              <div className="mt-3 text-gray-700 text-sm space-y-2 dark:text-gray-300">
                <p>Widget may be initializing multiple times:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Check deduplication logic is working</li>
                  <li>Verify useEffect dependencies array is empty</li>
                  <li>Make sure cleanup function is running</li>
                </ul>
                <p className="font-semibold mt-3">Force cleanup:</p>
                <code className="block bg-gray-900 text-gray-100 p-2 rounded">
                  document.querySelectorAll('[id^="supportsync"]').forEach(el =&gt; el.remove())
                </code>
              </div>
            </details>

            <details className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#3a3a3a]">
              <summary className="font-semibold text-gray-900 cursor-pointer dark:text-white">
                Widget covering important content
              </summary>
              <div className="mt-3 text-gray-700 text-sm space-y-2 dark:text-gray-300">
                <p>Adjust the default position or window size:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Change <code className="bg-gray-200 px-1 rounded">position.right</code> / <code className="bg-gray-200 px-1 rounded">position.bottom</code></li>
                  <li>Reduce chat window width/height</li>
                  <li>Add mobile-specific positioning</li>
                </ul>
                <p className="font-semibold mt-3">Or inform users:</p>
                <p className="italic">The chat widget is draggable - click and drag to move it!</p>
              </div>
            </details>
          </div>
        </section>

        {/* Key Takeaways */}
        <section>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Key Takeaways</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">✅</div>
                <p>The widget is <strong>pure vanilla JavaScript</strong> wrapped in a React useEffect hook for lifecycle management</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">✅</div>
                <p>It uses an <strong>iframe architecture</strong> to load the chat interface from a separate Figma Site</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">✅</div>
                <p>Position is <strong>persistent via localStorage</strong>, providing a personalized experience</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">✅</div>
                <p>The launcher is <strong>draggable</strong>, allowing users to move it wherever they prefer</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">✅</div>
                <p>Exposes a <strong>global API</strong> for programmatic control from other scripts</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">✅</div>
                <p>Includes proper <strong>cleanup logic</strong> to prevent memory leaks and duplicate instances</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">✅</div>
                <p>All styling is <strong>inline CSS-in-JS</strong>, avoiding external dependencies and conflicts</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}