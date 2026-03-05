import { motion, AnimatePresence } from 'motion/react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = [
    { keys: ['Cmd/Ctrl', 'Z'], action: 'Undo last change' },
    { keys: ['Cmd/Ctrl', 'Shift', 'Z'], action: 'Redo change' },
    { keys: ['+', '='], action: 'Zoom in' },
    { keys: ['-'], action: 'Zoom out' },
    { keys: ['R'], action: 'Rotate right' },
    { keys: ['L'], action: 'Rotate left' },
    { keys: ['F'], action: 'Fit image to canvas' },
    { keys: ['C'], action: 'Center crop box' },
    { keys: ['?'], action: 'Show this help' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#1a1a1a] border border-[#ff6b35]/30 rounded-2xl shadow-2xl max-w-lg w-full p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Keyboard className="w-6 h-6 text-[#ff6b35]" />
                <h3 className="text-2xl text-white">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a]"
                >
                  <span className="text-gray-300 text-sm">{shortcut.action}</span>
                  <div className="flex items-center gap-2">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center gap-1">
                        <kbd className="px-2 py-1 text-xs text-white bg-[#2a2a2a] border border-[#3a3a3a] rounded shadow-sm">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-gray-500 text-xs">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
              <p className="text-sm text-gray-500 text-center">
                Press <kbd className="px-2 py-0.5 text-xs bg-[#2a2a2a] border border-[#3a3a3a] rounded">?</kbd> anytime to see these shortcuts
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}