import { motion } from 'motion/react';
import { ZoomIn, ZoomOut, RotateCw, Move, Maximize2, FlipHorizontal2, FlipVertical2, Undo2, Redo2 } from 'lucide-react';

interface MobileConfiguratorControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onReset: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isDraggingEnabled: boolean;
  onToggleDrag: () => void;
}

export function MobileConfiguratorControls({
  onZoomIn,
  onZoomOut,
  onRotate,
  onFlipH,
  onFlipV,
  onReset,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  isDraggingEnabled,
  onToggleDrag,
}: MobileConfiguratorControlsProps) {
  
  const controls = [
    {
      icon: Move,
      label: 'Pan',
      action: onToggleDrag,
      active: isDraggingEnabled,
      ariaLabel: isDraggingEnabled ? 'Disable pan mode' : 'Enable pan mode',
      color: isDraggingEnabled ? 'bg-[#ff6b35] text-white' : 'bg-[#1a1a1a] text-white',
    },
    {
      icon: ZoomIn,
      label: 'Zoom In',
      action: onZoomIn,
      ariaLabel: 'Zoom in on image',
      color: 'bg-[#1a1a1a] text-white',
    },
    {
      icon: ZoomOut,
      label: 'Zoom Out',
      action: onZoomOut,
      ariaLabel: 'Zoom out on image',
      color: 'bg-[#1a1a1a] text-white',
    },
    {
      icon: RotateCw,
      label: 'Rotate',
      action: onRotate,
      ariaLabel: 'Rotate image 90 degrees clockwise',
      color: 'bg-[#1a1a1a] text-white',
    },
    {
      icon: FlipHorizontal2,
      label: 'Flip H',
      action: onFlipH,
      ariaLabel: 'Flip image horizontally',
      color: 'bg-[#1a1a1a] text-white',
    },
    {
      icon: FlipVertical2,
      label: 'Flip V',
      action: onFlipV,
      ariaLabel: 'Flip image vertically',
      color: 'bg-[#1a1a1a] text-white',
    },
    {
      icon: Maximize2,
      label: 'Reset',
      action: onReset,
      ariaLabel: 'Reset image to original state',
      color: 'bg-[#2a2a2a] text-gray-300',
    },
  ];

  return (
    <div className="lg:hidden"> {/* Only show on mobile/tablet */}
      {/* Primary Controls - Grid Layout */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {controls.map((control, index) => (
          <motion.button
            key={index}
            onClick={control.action}
            whileTap={{ scale: 0.95 }}
            className={`
              ${control.color}
              flex flex-col items-center justify-center
              py-3 px-2 rounded-xl
              transition-all
              hover:shadow-lg
              active:shadow-sm
              border border-[#2a2a2a]
              min-h-[72px]
              touch-manipulation
              [data-theme='light']_&:bg-white
              [data-theme='light']_&:text-gray-900
              [data-theme='light']_&:border-gray-300
              ${control.active ? 'shadow-lg shadow-[#ff6b35]/30' : ''}
            `}
            aria-label={control.ariaLabel}
            aria-pressed={control.active}
          >
            <control.icon className="w-6 h-6 mb-1" aria-hidden="true" />
            <span className="text-[10px] font-medium">{control.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Undo/Redo Controls */}
      {(onUndo || onRedo) && (
        <div className="grid grid-cols-2 gap-2">
          {onUndo && (
            <motion.button
              onClick={onUndo}
              disabled={!canUndo}
              whileTap={{ scale: canUndo ? 0.95 : 1 }}
              className={`
                flex items-center justify-center gap-2
                py-3 px-4 rounded-xl
                transition-all
                border border-[#2a2a2a]
                min-h-[56px]
                touch-manipulation
                ${canUndo 
                  ? 'bg-[#1a1a1a] text-white hover:shadow-lg [data-theme=\'light\']_&:bg-white [data-theme=\'light\']_&:text-gray-900' 
                  : 'bg-[#0a0a0a] text-gray-600 cursor-not-allowed opacity-50'
                }
              `}
              aria-label="Undo last action"
              aria-disabled={!canUndo}
            >
              <Undo2 className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm font-medium">Undo</span>
            </motion.button>
          )}
          
          {onRedo && (
            <motion.button
              onClick={onRedo}
              disabled={!canRedo}
              whileTap={{ scale: canRedo ? 0.95 : 1 }}
              className={`
                flex items-center justify-center gap-2
                py-3 px-4 rounded-xl
                transition-all
                border border-[#2a2a2a]
                min-h-[56px]
                touch-manipulation
                ${canRedo 
                  ? 'bg-[#1a1a1a] text-white hover:shadow-lg [data-theme=\'light\']_&:bg-white [data-theme=\'light\']_&:text-gray-900' 
                  : 'bg-[#0a0a0a] text-gray-600 cursor-not-allowed opacity-50'
                }
              `}
              aria-label="Redo last action"
              aria-disabled={!canRedo}
            >
              <Redo2 className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm font-medium">Redo</span>
            </motion.button>
          )}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center mt-3 [data-theme='light']_&:text-gray-600">
        Tap and drag on the image to reposition
      </p>
    </div>
  );
}
