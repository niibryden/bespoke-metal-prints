import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, Type, Contrast, Focus, Moon, Sun, Keyboard, ZoomIn, ZoomOut } from 'lucide-react';

interface AccessibilitySettingsProps {
  onClose: () => void;
}

export function AccessibilitySettings({ onClose }: AccessibilitySettingsProps) {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'x-large'>('normal');
  const [contrast, setContrast] = useState<'normal' | 'high' | 'extra-high'>('normal');
  const [focusIndicators, setFocusIndicators] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [textSpacing, setTextSpacing] = useState<'normal' | 'increased'>('normal');
  const [colorScheme, setColorScheme] = useState<'auto' | 'light' | 'dark'>('auto');

  // Load saved preferences
  useEffect(() => {
    const savedFontSize = localStorage.getItem('a11y-fontSize') as any;
    const savedContrast = localStorage.getItem('a11y-contrast') as any;
    const savedFocusIndicators = localStorage.getItem('a11y-focusIndicators');
    const savedReducedMotion = localStorage.getItem('a11y-reducedMotion');
    const savedTextSpacing = localStorage.getItem('a11y-textSpacing') as any;
    const savedColorScheme = localStorage.getItem('a11y-colorScheme') as any;

    if (savedFontSize) setFontSize(savedFontSize);
    if (savedContrast) setContrast(savedContrast);
    if (savedFocusIndicators !== null) setFocusIndicators(savedFocusIndicators === 'true');
    if (savedReducedMotion !== null) setReducedMotion(savedReducedMotion === 'true');
    if (savedTextSpacing) setTextSpacing(savedTextSpacing);
    if (savedColorScheme) setColorScheme(savedColorScheme);
  }, []);

  // Apply settings
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.setAttribute('data-font-size', fontSize);
    localStorage.setItem('a11y-fontSize', fontSize);
    
    // Contrast
    root.setAttribute('data-contrast', contrast);
    localStorage.setItem('a11y-contrast', contrast);
    
    // Focus indicators
    root.setAttribute('data-focus-indicators', focusIndicators ? 'true' : 'false');
    localStorage.setItem('a11y-focusIndicators', focusIndicators.toString());
    
    // Reduced motion
    root.setAttribute('data-reduced-motion', reducedMotion ? 'true' : 'false');
    localStorage.setItem('a11y-reducedMotion', reducedMotion.toString());
    
    // Text spacing
    root.setAttribute('data-text-spacing', textSpacing);
    localStorage.setItem('a11y-textSpacing', textSpacing);
    
    // Color scheme
    root.setAttribute('data-color-scheme', colorScheme);
    localStorage.setItem('a11y-colorScheme', colorScheme);
  }, [fontSize, contrast, focusIndicators, reducedMotion, textSpacing, colorScheme]);

  const resetToDefaults = () => {
    setFontSize('normal');
    setContrast('normal');
    setFocusIndicators(true);
    setReducedMotion(false);
    setTextSpacing('normal');
    setColorScheme('auto');
    
    localStorage.removeItem('a11y-fontSize');
    localStorage.removeItem('a11y-contrast');
    localStorage.removeItem('a11y-focusIndicators');
    localStorage.removeItem('a11y-reducedMotion');
    localStorage.removeItem('a11y-textSpacing');
    localStorage.removeItem('a11y-colorScheme');
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/95 z-[9999] overflow-y-auto [data-theme='light']_&:bg-white/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="container mx-auto px-4 py-8 max-w-3xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white text-2xl [data-theme='light']_&:text-black flex items-center gap-3">
            <Eye className="w-7 h-7 text-[#ff6b35]" />
            Accessibility Settings
          </h1>
          <button
            onClick={onClose}
            className="text-white hover:text-[#ff6b35] transition-colors [data-theme='light']_&:text-black"
            aria-label="Close accessibility settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Font Size */}
          <motion.div
            className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] [data-theme='light']_&:bg-gray-100 [data-theme='light']_&:border-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Type className="w-5 h-5 text-[#ff6b35]" />
              <h2 className="text-white text-xl [data-theme='light']_&:text-black">Text Size</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4 [data-theme='light']_&:text-gray-600">
              Adjust the size of text throughout the site for easier reading
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  fontSize === 'normal'
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white [data-theme=\'light\']_&:text-black'
                    : 'border-[#2a2a2a] text-gray-400 hover:border-[#ff6b35]/50 [data-theme=\'light\']_&:border-gray-300 [data-theme=\'light\']_&:text-gray-600'
                }`}
                aria-pressed={fontSize === 'normal'}
              >
                <div className="text-base">A</div>
                <div className="text-xs mt-1">Normal</div>
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  fontSize === 'large'
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white [data-theme=\'light\']_&:text-black'
                    : 'border-[#2a2a2a] text-gray-400 hover:border-[#ff6b35]/50 [data-theme=\'light\']_&:border-gray-300 [data-theme=\'light\']_&:text-gray-600'
                }`}
                aria-pressed={fontSize === 'large'}
              >
                <div className="text-lg">A</div>
                <div className="text-xs mt-1">Large</div>
              </button>
              <button
                onClick={() => setFontSize('x-large')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  fontSize === 'x-large'
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white [data-theme=\'light\']_&:text-black'
                    : 'border-[#2a2a2a] text-gray-400 hover:border-[#ff6b35]/50 [data-theme=\'light\']_&:border-gray-300 [data-theme=\'light\']_&:text-gray-600'
                }`}
                aria-pressed={fontSize === 'x-large'}
              >
                <div className="text-xl">A</div>
                <div className="text-xs mt-1">X-Large</div>
              </button>
            </div>
          </motion.div>

          {/* Contrast */}
          <motion.div
            className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] [data-theme='light']_&:bg-gray-100 [data-theme='light']_&:border-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Contrast className="w-5 h-5 text-[#ff6b35]" />
              <h2 className="text-white text-xl [data-theme='light']_&:text-black">Contrast</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4 [data-theme='light']_&:text-gray-600">
              Increase contrast between text and background colors
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setContrast('normal')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  contrast === 'normal'
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white [data-theme=\'light\']_&:text-black'
                    : 'border-[#2a2a2a] text-gray-400 hover:border-[#ff6b35]/50 [data-theme=\'light\']_&:border-gray-300 [data-theme=\'light\']_&:text-gray-600'
                }`}
                aria-pressed={contrast === 'normal'}
              >
                Normal
              </button>
              <button
                onClick={() => setContrast('high')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  contrast === 'high'
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white [data-theme=\'light\']_&:text-black'
                    : 'border-[#2a2a2a] text-gray-400 hover:border-[#ff6b35]/50 [data-theme=\'light\']_&:border-gray-300 [data-theme=\'light\']_&:text-gray-600'
                }`}
                aria-pressed={contrast === 'high'}
              >
                High
              </button>
              <button
                onClick={() => setContrast('extra-high')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  contrast === 'extra-high'
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white [data-theme=\'light\']_&:text-black'
                    : 'border-[#2a2a2a] text-gray-400 hover:border-[#ff6b35]/50 [data-theme=\'light\']_&:border-gray-300 [data-theme=\'light\']_&:text-gray-600'
                }`}
                aria-pressed={contrast === 'extra-high'}
              >
                Extra High
              </button>
            </div>
          </motion.div>

          {/* Color Scheme */}
          <motion.div
            className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] [data-theme='light']_&:bg-gray-100 [data-theme='light']_&:border-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              {colorScheme === 'dark' ? (
                <Moon className="w-5 h-5 text-[#ff6b35]" />
              ) : (
                <Sun className="w-5 h-5 text-[#ff6b35]" />
              )}
              <h2 className="text-white text-xl [data-theme='light']_&:text-black">Color Scheme</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4 [data-theme='light']_&:text-gray-600">
              Choose your preferred color scheme
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setColorScheme('auto')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  colorScheme === 'auto'
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white [data-theme=\'light\']_&:text-black'
                    : 'border-[#2a2a2a] text-gray-400 hover:border-[#ff6b35]/50 [data-theme=\'light\']_&:border-gray-300 [data-theme=\'light\']_&:text-gray-600'
                }`}
                aria-pressed={colorScheme === 'auto'}
              >
                Auto
              </button>
              <button
                onClick={() => setColorScheme('light')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  colorScheme === 'light'
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white [data-theme=\'light\']_&:text-black'
                    : 'border-[#2a2a2a] text-gray-400 hover:border-[#ff6b35]/50 [data-theme=\'light\']_&:border-gray-300 [data-theme=\'light\']_&:text-gray-600'
                }`}
                aria-pressed={colorScheme === 'light'}
              >
                <Sun className="w-4 h-4 mx-auto mb-1" />
                Light
              </button>
              <button
                onClick={() => setColorScheme('dark')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  colorScheme === 'dark'
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white [data-theme=\'light\']_&:text-black'
                    : 'border-[#2a2a2a] text-gray-400 hover:border-[#ff6b35]/50 [data-theme=\'light\']_&:border-gray-300 [data-theme=\'light\']_&:text-gray-600'
                }`}
                aria-pressed={colorScheme === 'dark'}
              >
                <Moon className="w-4 h-4 mx-auto mb-1" />
                Dark
              </button>
            </div>
          </motion.div>

          {/* Text Spacing */}
          <motion.div
            className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] [data-theme='light']_&:bg-gray-100 [data-theme='light']_&:border-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <ZoomIn className="w-5 h-5 text-[#ff6b35]" />
              <h2 className="text-white text-xl [data-theme='light']_&:text-black">Text Spacing</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4 [data-theme='light']_&:text-gray-600">
              Increase spacing between letters, words, and lines
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTextSpacing('normal')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  textSpacing === 'normal'
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white [data-theme=\'light\']_&:text-black'
                    : 'border-[#2a2a2a] text-gray-400 hover:border-[#ff6b35]/50 [data-theme=\'light\']_&:border-gray-300 [data-theme=\'light\']_&:text-gray-600'
                }`}
                aria-pressed={textSpacing === 'normal'}
              >
                Normal Spacing
              </button>
              <button
                onClick={() => setTextSpacing('increased')}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  textSpacing === 'increased'
                    ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white [data-theme=\'light\']_&:text-black'
                    : 'border-[#2a2a2a] text-gray-400 hover:border-[#ff6b35]/50 [data-theme=\'light\']_&:border-gray-300 [data-theme=\'light\']_&:text-gray-600'
                }`}
                aria-pressed={textSpacing === 'increased'}
              >
                Increased Spacing
              </button>
            </div>
          </motion.div>

          {/* Toggle Options */}
          <motion.div
            className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] [data-theme='light']_&:bg-gray-100 [data-theme='light']_&:border-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="space-y-4">
              {/* Focus Indicators */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Focus className="w-5 h-5 text-[#ff6b35]" />
                  <div>
                    <h3 className="text-white [data-theme='light']_&:text-black">Enhanced Focus Indicators</h3>
                    <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">
                      Show prominent outlines when navigating with keyboard
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={focusIndicators}
                    onChange={(e) => setFocusIndicators(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#ff6b35]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff6b35]"></div>
                </label>
              </div>

              <div className="border-t border-[#2a2a2a] [data-theme='light']_&:border-gray-300"></div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Keyboard className="w-5 h-5 text-[#ff6b35]" />
                  <div>
                    <h3 className="text-white [data-theme='light']_&:text-black">Reduce Motion</h3>
                    <p className="text-gray-400 text-sm [data-theme='light']_&:text-gray-600">
                      Minimize animations and transitions
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#ff6b35]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff6b35]"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Reset Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={resetToDefaults}
              className="w-full px-6 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all [data-theme='light']_&:bg-gray-300 [data-theme='light']_&:text-black"
            >
              Reset to Defaults
            </button>
          </motion.div>

          {/* Info Box */}
          <motion.div
            className="bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-lg p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-gray-400 text-sm text-center [data-theme='light']_&:text-gray-600">
              <strong className="text-[#ff6b35]">Tip:</strong> Your accessibility preferences are saved automatically and will persist across all your sessions.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
