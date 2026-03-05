import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Settings, Eye, ShoppingCart, Check, X, Image as ImageIcon, ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize2, FlipHorizontal2, FlipVertical2, RefreshCw, Move, AlertTriangle, Info, ChevronLeft, ChevronRight, Undo2, Redo2, HelpCircle, DollarSign, Maximize, Minimize, Keyboard } from 'lucide-react';
import { CheckoutPage } from './CheckoutPage';
import { useInventory } from '../hooks/useInventory';
import { getSupabaseClient } from '../utils/supabase/client';
import { AuthModal } from './AuthModal';
import { projectId, publicAnonKey } from '../utils/supabase/config';
import { getServerUrl } from '../utils/serverUrl';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { PriceBreakdownModal } from './PriceBreakdownModal';
import { RemoveImageConfirmModal } from './RemoveImageConfirmModal';
import { useCart } from '../contexts/CartContext';
import { createThumbnail } from '../utils/image-thumbnail';
import { Toast } from './Toast';
import { SuccessConfetti } from './SuccessConfetti';
import { MiniCartPreview } from './MiniCartPreview';
import { loadImageAsDataUrl } from '../utils/imageProxy';

interface InventorySize {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface Configuration {
  image: string | null;
  size: string;
  finish: string;
  mountType: string;
  frame: string;
  rushOrder: boolean;
}

interface ConfiguratorSectionProps {
  initialConfig?: Partial<Configuration>;
  initialStep?: number;
  stockImageUrl?: string | null;
  onStockImageProcessed?: () => void;
}

const steps = [
  { id: 1, name: 'Upload', icon: Upload, description: 'Choose your image' },
  { id: 2, name: 'Customize', icon: Settings, description: 'Select options' },
  { id: 3, name: 'Proof', icon: Eye, description: 'Review your print' },
  { id: 4, name: 'Checkout', icon: ShoppingCart, description: 'Complete order' },
];

export function ConfiguratorSection({ initialConfig, initialStep, stockImageUrl, onStockImageProcessed }: ConfiguratorSectionProps = {}) {
  const [config, setConfig] = useState<Configuration>({
    image: initialConfig?.image || null,
    size: initialConfig?.size || '8" × 12"',
    finish: initialConfig?.finish || 'Gloss',
    mountType: initialConfig?.mountType || 'Stick Tape',
    frame: initialConfig?.frame || 'None',
    rushOrder: initialConfig?.rushOrder || false,
  });
  
  // Ref to always have current config in event listeners
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);
  
  const [currentStep, setCurrentStep] = useState(initialStep || 1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]); // Track completed steps
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageTransform, setImageTransform] = useState({
    scale: 1,
    x: 0,
    y: 0,
    rotation: 0,
    flipX: false,
    flipY: false,
  });
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const orientationRef = useRef(orientation);
  useEffect(() => {
    orientationRef.current = orientation;
  }, [orientation]);
  
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Crop selection state - stored as percentages (0-100) so it scales automatically
  const [cropBoxPercent, setCropBoxPercent] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [isResizingCrop, setIsResizingCrop] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null>(null);
  const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0, cropWidth: 0, cropHeight: 0 });
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isGeneratingCrop, setIsGeneratingCrop] = useState(false);
  
  // New state for enhanced UX
  const [imageQuality, setImageQuality] = useState<'excellent' | 'good' | 'fair' | 'poor' | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [fitMode, setFitMode] = useState<'fit' | 'fill' | 'custom'>('fit');
  const [transformHistory, setTransformHistory] = useState<typeof imageTransform[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [originalImageDimensions, setOriginalImageDimensions] = useState<{ width: number; height: number } | null>(null);
  
  // Additional state
  const [isDragging, setIsDragging] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; action?: { label: string; onClick: () => void } } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // New UX enhancement states
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  // Mobile detection - disable crop box on mobile and tablets
  const [isMobile, setIsMobile] = useState(() => {
    // Initialize with correct value immediately
    // Disable crop box on mobile and tablets (under 1280px)
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1280;
    }
    return false;
  });
  
  // Cart functionality
  const { addItem } = useCart();
  
  useEffect(() => {
    const checkMobile = () => {
      // Disable crop box on mobile phones and tablets (anything under 1280px / xl breakpoint)
      // This ensures tablets (typically 768-1024px) also get the simplified mobile experience
      const isMobileView = window.innerWidth < 1280; 
      setIsMobile(isMobileView);
      console.log(`📱 Mobile detection: ${isMobileView ? 'MOBILE/TABLET' : 'DESKTOP'} (width: ${window.innerWidth}px)`);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const supabase = useMemo(() => getSupabaseClient(), []);
  
  // Handle reorder - update config when initialConfig changes
  useEffect(() => {
    if (initialConfig && initialConfig.image) {
      console.log('🔧 ConfiguratorSection: Reorder initiated with config:', initialConfig);
      console.log('📸 Image data length:', initialConfig.image?.length);
      console.log('📏 Size:', initialConfig.size);
      console.log('✨ Finish:', initialConfig.finish);
      console.log('🔨 Mount:', initialConfig.mountType);
      console.log('🖼️ Frame:', initialConfig.frame);
      
      setConfig({
        image: initialConfig.image,
        size: initialConfig.size || '8" × 12"',
        finish: initialConfig.finish || 'Gloss',
        mountType: initialConfig.mountType || 'Stick Tape',
        frame: initialConfig.frame || 'None',
        rushOrder: initialConfig.rushOrder || false,
      });
      if (initialStep) {
        console.log('⏭️ Setting step to:', initialStep);
        setCurrentStep(initialStep);
        // If starting at proof step with image, mark previous steps as completed
        if (initialStep === 3) {
          setCompletedSteps([1, 2]);
        }
      }
      
      // Scroll to configurator with improved timing
      setTimeout(() => {
        const element = document.getElementById('configurator');
        if (element) {
          console.log('📍 Scrolling to configurator');
          // Scroll with offset to account for navigation
          const yOffset = -80; // Navigation height
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
          console.warn('⚠️ Configurator element not found for scroll');
        }
      }, 500);
    }
  }, [initialConfig, initialStep]);
  
  // Use inventory hook
  const { isAvailable, getQuantity, isLowStock, loading: inventoryLoading, inventory } = useInventory();
  
  // Fetch available sizes from inventory
  const [availableSizes, setAvailableSizes] = useState<InventorySize[]>([]);
  const [loadingSizes, setLoadingSizes] = useState(true);

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const response = await fetch(
          `${getServerUrl()}/inventory`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const sizes = data.inventory?.filter((item: any) => item.category === 'size') || [];
          
          // If no sizes found, use fallback instead of throwing error
          if (sizes.length === 0) {
            setAvailableSizes([
              { id: '1', name: '5" x 7"', sku: 'SIZE-5X7', quantity: 200, price: 25.00 },
              { id: '1b', name: '7" x 5"', sku: 'SIZE-7X5', quantity: 200, price: 25.00 },
              { id: '2', name: '12" x 8"', sku: 'SIZE-12X8', quantity: 150, price: 49.99 },
              { id: '2b', name: '8" x 12"', sku: 'SIZE-8X12', quantity: 150, price: 49.99 },
              { id: '3', name: '17" x 11"', sku: 'SIZE-17X11', quantity: 120, price: 69.99 },
              { id: '3b', name: '11" x 17"', sku: 'SIZE-11X17', quantity: 120, price: 69.99 },
              { id: '4', name: '24" x 16"', sku: 'SIZE-24X16', quantity: 100, price: 109.99 },
              { id: '4b', name: '16" x 24"', sku: 'SIZE-16X24', quantity: 100, price: 109.99 },
              { id: '5', name: '30" x 20"', sku: 'SIZE-30X20', quantity: 80, price: 149.99 },
              { id: '5b', name: '20" x 30"', sku: 'SIZE-20X30', quantity: 80, price: 149.99 },
              { id: '6', name: '36" x 24"', sku: 'SIZE-36X24', quantity: 60, price: 199.99 },
              { id: '6b', name: '24" x 36"', sku: 'SIZE-24X36', quantity: 60, price: 199.99 },
              { id: '7', name: '40" x 30"', sku: 'SIZE-40X30', quantity: 40, price: 269.99 },
              { id: '7b', name: '30" x 40"', sku: 'SIZE-30X40', quantity: 40, price: 269.99 },
            ]);
            setConfig(prev => ({ ...prev, size: '8" × 12"' }));
            return;
          }
          
          // Sort sizes from smallest to biggest by area (width * height)
          const sortedSizes = sizes.sort((a: InventorySize, b: InventorySize) => {
            const getArea = (name: string) => {
              const match = name.match(/(\d+\.?\d*)\s*"\s*x\s*(\d+\.?\d*)/i);
              if (match) {
                return parseFloat(match[1]) * parseFloat(match[2]);
              }
              return 0;
            };
            return getArea(a.name) - getArea(b.name);
          });
          
          setAvailableSizes(sortedSizes);
          console.log('Available sizes:', sortedSizes.map(s => s.name).join(', '));
          console.log('Current orientation for default size selection:', orientation);
          
          // NEW: Find 8x12 size using dimension matching (works with any quote style and whitespace)
          const default8x12 = sortedSizes.find((size: InventorySize) => {
            // More flexible regex that handles tabs, spaces, and various quote styles
            const match = size.name.match(/(\d+\.?\d*)\s*["\u0022\u201d]?\s*[x×]\s*(\d+\.?\d*)/i);
            if (!match || size.quantity <= 0) return false;
            const w = parseFloat(match[1]);
            const h = parseFloat(match[2]);
            return (w === 8 && h === 12) || (w === 12 && h === 8);
          });
          
          if (default8x12) {
            const formattedName = default8x12.name.replace(/\s*x\s*/i, ' × ');
            console.log(`✅ Found and selecting 8x12: ${formattedName}`);
            setConfig(prev => ({ ...prev, size: formattedName }));
          }
          
          /* OLD BROKEN LOGIC - REMOVED
          // Set default size to smallest available in stock (excluding 5" x 7")
          let defaultSize = sortedSizes.find((size: InventorySize) => {
            const area = size.name.match(/(\d+\.?\d*)\s*["\u0022]\s*x\s*(\d+\.?\d*)/i);
            const sqIn = area ? parseFloat(area[1]) * parseFloat(area[2]) : 0;
            return size.name === '8" x 12"' && size.quantity > 0;
          }) || sortedSizes.find((size: InventorySize) => {
            // Fallback: smallest available in stock (excluding 5" x 7")
            const area = size.name.match(/(\\d+\\.?\\d*)\\s*[\"\\u0022]\\s*x\\s*(\\d+\\.?\\d*)/i);
            const sqIn = area ? parseFloat(area[1]) * parseFloat(area[2]) : 0;
            return size.quantity > 0 && sqIn > 35;
          });
          
          // If string match failed, try dimension-based matching for 8x12
          if (!defaultSize) {
            console.log('String match failed, trying dimension-based 8x12 match...');
            defaultSize = sortedSizes.find((size: InventorySize) => {
              const match = size.name.match(/(\d+\.?\d*)\s*["\u0022]\s*x\s*(\d+\.?\d*)/i);
              if (!match || size.quantity <= 0) return false;
              const w = parseFloat(match[1]);
              const h = parseFloat(match[2]);
              return (w === 8 && h === 12) || (w === 12 && h === 8);
            });
          }
          
          if (defaultSize) {
            const formattedName = defaultSize.name.replace(' x ', ' × ');
            console.log(`✅ Selected default size: ${formattedName}`);
            setConfig(prev => ({ ...prev, size: formattedName }));
          } else {
            console.log('⚠️ No suitable default size found');
          }
          END OF OLD BROKEN LOGIC */
        }
      } catch (error) {
        console.log('Using fallback sizes (network error):', error.message || error);
        // Fallback to default sizes
        setAvailableSizes([
          { id: '1', name: '5" x 7"', sku: 'SIZE-5X7', quantity: 200, price: 25.00 },
          { id: '1b', name: '7" x 5"', sku: 'SIZE-7X5', quantity: 200, price: 25.00 },
          { id: '2', name: '12" x 8"', sku: 'SIZE-12X8', quantity: 150, price: 49.99 },
          { id: '2b', name: '8" x 12"', sku: 'SIZE-8X12', quantity: 150, price: 49.99 },
          { id: '3', name: '17" x 11"', sku: 'SIZE-17X11', quantity: 120, price: 69.99 },
          { id: '3b', name: '11" x 17"', sku: 'SIZE-11X17', quantity: 120, price: 69.99 },
          { id: '4', name: '24" x 16"', sku: 'SIZE-24X16', quantity: 100, price: 109.99 },
          { id: '4b', name: '16" x 24"', sku: 'SIZE-16X24', quantity: 100, price: 109.99 },
          { id: '5', name: '30" x 20"', sku: 'SIZE-30X20', quantity: 80, price: 149.99 },
          { id: '5b', name: '20" x 30"', sku: 'SIZE-20X30', quantity: 80, price: 149.99 },
          { id: '6', name: '36" x 24"', sku: 'SIZE-36X24', quantity: 60, price: 199.99 },
          { id: '6b', name: '24" x 36"', sku: 'SIZE-24X36', quantity: 60, price: 199.99 },
          { id: '7', name: '40" x 30"', sku: 'SIZE-40X30', quantity: 40, price: 269.99 },
          { id: '7b', name: '30" x 40"', sku: 'SIZE-30X40', quantity: 40, price: 269.99 },
        ]);
        
        // Set default to 12" × 8" from fallback (smallest excluding 5" x 7")
        setConfig(prev => ({ ...prev, size: '8" × 12"' }));
      } finally {
        setLoadingSizes(false);
      }
    };
    
    fetchSizes();
  }, []);

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Handle checkout click - require authentication and generate print-ready image
  const handleCheckoutClick = async () => {
    // Check if all items are in stock BEFORE proceeding
    if (!allItemsInStock()) {
      setToast({
        message: 'Some selected items are out of stock. Please update your selection.',
        type: 'error'
      });
      return;
    }
    
    if (!user) {
      setShowAuthModal(true);
    } else {
      // Validate that we have a valid price before proceeding
      if (!basePrice || basePrice <= 0) {
        console.error('❌ Invalid basePrice:', basePrice, 'config:', config, 'inventory loaded:', inventory.length);
        setToast({
          message: 'Unable to calculate price. Please refresh and try again.',
          type: 'error'
        });
        return;
      }
      
      console.log('✅ Proceeding to checkout with basePrice:', basePrice);
      
      // Generate high-resolution print-ready image before checkout
      console.log('🖨️ Generating high-resolution print-ready image for checkout...');
      setIsGeneratingCrop(true);
      
      try {
        const printReadyUrl = await generatePrintReadyImage();
        if (printReadyUrl) {
          setCroppedImageUrl(printReadyUrl);
          console.log('✅ High-res print-ready image generated, size:', Math.round(printReadyUrl.length / 1024), 'KB');
        }
      } catch (error) {
        console.error('❌ Failed to generate print-ready image:', error);
        // Continue anyway with existing image
      } finally {
        setIsGeneratingCrop(false);
      }
      
      setShowCheckout(true);
    }
  };

  // Handle add to cart - generate print-ready image and add to cart
  const handleAddToCart = async () => {
    console.log('🛒 Adding item to cart...');
    
    // Check if all items are in stock BEFORE processing
    if (!allItemsInStock()) {
      setToast({
        message: 'Some selected items are out of stock. Please update your selection.',
        type: 'error'
      });
      return;
    }
    
    setIsGeneratingCrop(true);
    
    try {
      // Generate high-resolution print-ready image
      const printReadyUrl = await generatePrintReadyImage();
      const imageToUse = printReadyUrl || croppedImageUrl || config.image;
      
      if (!imageToUse) {
        setToast({
          message: 'Please upload an image first',
          type: 'error'
        });
        setIsGeneratingCrop(false);
        return;
      }
      
      // Create a very small thumbnail for cart display (to avoid localStorage quota issues)
      // Use 100x100 at 0.5 quality to minimize storage
      console.log('📸 Creating thumbnail for cart...');
      const thumbnail = await createThumbnail(imageToUse, 100, 100, 0.5);
      console.log('✅ Thumbnail created:', {
        originalSize: `${(imageToUse.length / 1024).toFixed(2)} KB`,
        thumbnailSize: `${(thumbnail.length / 1024).toFixed(2)} KB`,
        reduction: `${(((imageToUse.length - thumbnail.length) / imageToUse.length) * 100).toFixed(1)}%`,
      });
      
      // Add item to cart with thumbnail only (don't store full image)
      addItem({
        image: thumbnail, // Use thumbnail as the image to avoid quota issues
        size: config.size,
        finish: config.finish,
        mountType: config.mountType,
        frame: config.frame,
        rushOrder: config.rushOrder,
        price: basePrice,
        thumbnail: thumbnail,
      });
      
      console.log('✅ Item added to cart successfully');
      
      // Show confetti animation
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      
      // Show success toast with action to view cart
      setToast({
        message: `${config.size} metal print added to cart! 🎉`,
        type: 'success',
        action: {
          label: 'View Cart',
          onClick: () => {
            // Trigger cart modal open via the floating cart button
            const cartButton = document.querySelector('[aria-label="Open cart"]') as HTMLButtonElement;
            if (cartButton) cartButton.click();
          }
        }
      });
      
      // Reset configurator for a new print
      setConfig({
        image: null,
        size: '12" × 8"',
        finish: 'Gloss',
        mountType: 'Stick Tape',
        frame: 'None',
        rushOrder: false,
      });
      setCurrentStep(1);
      setCompletedSteps([]);
      
    } catch (error) {
      console.error('❌ Failed to add item to cart:', error);
      setToast({
        message: 'Failed to add item to cart. Please try again.',
        type: 'error'
      });
    } finally {
      setIsGeneratingCrop(false);
    }
  };

  const [customSize, setCustomSize] = useState({
    width: '',
    height: '',
  });

  const [isCustomSize, setIsCustomSize] = useState(false);

  // Listen for reorder events
  useEffect(() => {
    const handleReorder = (event: CustomEvent) => {
      const { image, size, mountType, frame, finish } = event.detail;
      console.log('✅ ConfiguratorSection: Reorder event received');
      console.log('   - Has image:', !!image);
      console.log('   - Size:', size);
      console.log('   - Mount:', mountType);
      console.log('   - Frame:', frame);
      console.log('   - Finish:', finish);
      
      // Update config with all order details
      setConfig(prev => ({
        ...prev,
        size: size || prev.size,
        mountType: mountType || prev.mountType,
        frame: frame || prev.frame,
        finish: finish || prev.finish,
        image: null, // Will be set after loading
      }));
      
      // If image URL is provided, load it into the configurator
      if (image) {
        console.log('ConfiguratorSection: Loading reorder image...');
        
        const img = new Image();
        img.onload = () => {
          console.log('✅ ConfiguratorSection: Reorder image loaded successfully');
          console.log('   - Dimensions:', img.width, 'x', img.height);
          const detectedOrientation = img.width > img.height ? 'landscape' : 'portrait';
          
          // Set the image in config
          setConfig(prev => ({
            ...prev,
            image: image,
          }));
          
          // Initialize crop box for the size
          const aspectRatio = getSizeAspectRatio(size || '12" × 8"');
          const proportionalCropBox = calculateProportionalCropBox(aspectRatio);
          setCropBoxPercent(proportionalCropBox);
          
          // Reset transform
          setImageTransform({
            scale: 1,
            x: 0,
            y: 0,
            rotation: 0,
            flipX: false,
            flipY: false,
          });
          
          // Move to step 2 (editing) since image is already loaded
          setCurrentStep(2);
          setCompletedSteps([1]);
        };
        
        img.onerror = (error) => {
          console.error('❌ ConfiguratorSection: Failed to load reorder image');
          console.error('   - Error:', error);
          console.error('   - Image URL (first 100 chars):', image.substring(0, 100));
          // Go to step 1 so user can upload a new image
          setCurrentStep(1);
          setCompletedSteps([]);
          
          // Show alert to user
          setTimeout(() => {
            alert('Unable to load the original image from this order. Please upload a new image to continue.');
          }, 500);
        };
        
        img.src = image;
      } else {
        // No image provided, go to step 1 to upload
        console.log('⚠️ ConfiguratorSection: No image provided for reorder, user needs to upload');
        setCurrentStep(1);
        setCompletedSteps([]);
        
        // Scroll to configurator after a short delay
        setTimeout(() => {
          const element = document.getElementById('configurator');
          if (element) {
            const yOffset = -80;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 300);
      }
    };

    console.log('✅ ConfiguratorSection: Ready - Event listener registered for reorder');
    window.addEventListener('reorder', handleReorder as any);
    return () => {
      console.log('ConfiguratorSection: Cleanup - Removing reorder listener');
      window.removeEventListener('reorder', handleReorder as any);
    };
  }, []);

  // Listen for stock image selection events
  useEffect(() => {
    const handleStockImageSelected = (event: any) => {
      try {
        console.log('✅ ConfiguratorSection: Stock image selected event received');
        console.log('Event detail:', event.detail);
        
        if (!event.detail) {
          console.error('ConfiguratorSection: Event detail is undefined');
          return;
        }
        
        const { imageUrl } = event.detail;
        console.log('ConfiguratorSection: Image URL from event:', imageUrl);
        console.log('ConfiguratorSection: Current config size:', configRef.current.size);
        console.log('ConfiguratorSection: Current orientation:', orientationRef.current);
        if (imageUrl) {
          console.log('ConfiguratorSection: Starting to load image from URL:', imageUrl);
        
        // Set image and navigate to step 2 (Customize) immediately for instant feedback
        setConfig(prev => ({ ...prev, image: imageUrl }));
        setCompletedSteps([1]); // Mark step 1 as completed
        setCurrentStep(2);
        console.log('🚀 ConfiguratorSection: Immediately moved to step 2 (Customize) with image');
        
        // Scroll to configurator for seamless experience
        setTimeout(() => {
          const element = document.getElementById('configurator');
          if (element) {
            console.log('✅ ConfiguratorSection: Auto-scrolling to configurator');
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 200);
        
        // Load the image in background to get dimensions and initialize properly
        const img = new Image();
        // Try without crossOrigin first to avoid CORS issues with some sources
        img.onload = () => {
          console.log('ConfiguratorSection: Image loaded successfully, dimensions:', img.width, 'x', img.height);
          const detectedOrientation = img.width > img.height ? 'landscape' : 'portrait';
          setOrientation(detectedOrientation);
          setOriginalImageDimensions({ width: img.width, height: img.height });
          
          // Detect image quality using current size from configRef
          const quality = detectImageQuality(img, configRef.current.size);
          setImageQuality(quality);
          
          // Initialize history with default transform
          const initialTransform = {
            scale: 1,
            x: 0,
            y: 0,
            rotation: 0,
            flipX: false,
            flipY: false,
          };
          setImageTransform(initialTransform);
          setTransformHistory([initialTransform]);
          setHistoryIndex(0);
          
          // Initialize crop box with proper proportions based on current size
          // Use detectedOrientation directly since state hasn't updated yet
          const sizeAspectRatio = getSizeAspectRatioWithOrientation(configRef.current.size, detectedOrientation);
          console.log('ConfiguratorSection: Calculated aspect ratio:', sizeAspectRatio, 'for size:', configRef.current.size, 'and orientation:', detectedOrientation);
          const calculatedCropBox = calculateProportionalCropBox(sizeAspectRatio);
          setCropBoxPercent(calculatedCropBox);
          
          console.log('✅ ConfiguratorSection: Image dimensions and metadata loaded');
        };
        img.onerror = (error) => {
          console.error('ConfiguratorSection: Failed to load stock image for metadata:', error);
          console.error('ConfiguratorSection: Image URL that failed:', imageUrl);
          console.log('⚠️ ConfiguratorSection: Continuing with image set, metadata will be missing');
        };
        img.src = imageUrl;
      }
      } catch (error) {
        console.error('❌ ConfiguratorSection: Error handling stock-image-selected event:', error);
      }
    };

    console.log('✅ ConfiguratorSection: Ready - Event listener registered for stock-image-selected');
    window.addEventListener('stock-image-selected', handleStockImageSelected as any);
    return () => {
      console.log('ConfiguratorSection: Cleanup - Removing event listener');
      window.removeEventListener('stock-image-selected', handleStockImageSelected as any);
    };
  }, []); // Empty deps - handler uses configRef and orientationRef for current values

  // NEW: Handle stock image URL from props (more reliable than events)
  useEffect(() => {
    if (!stockImageUrl) return;
    
    console.log('✅ ConfiguratorSection: Stock image URL received via props:', stockImageUrl.substring(0, 80));
    
    // NO CONVERSION NEEDED - S3 images are now public-read with CORS headers
    // Directly use the URL for instant loading!
    const processStockImage = async () => {
      try {
        console.log('⚡ Loading stock image via proxy with CORS support');
        console.log('📷 Original S3 URL:', stockImageUrl.substring(0, 100) + '...');
        
        // Use proxy endpoint which returns image with proper CORS headers
        const serverUrl = getServerUrl();
        const proxyUrl = `${serverUrl}/proxy-image?url=${encodeURIComponent(stockImageUrl)}`;
        console.log('🔗 Full Proxy URL:', proxyUrl);
        
        // Fetch image with authentication and convert to blob URL
        console.log('🔍 Fetching image via proxy with authentication...');
        const imageResponse = await fetch(proxyUrl, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        console.log('🔍 Proxy response status:', imageResponse.status);
        console.log('🔍 Proxy response ok:', imageResponse.ok);
        
        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          console.error('❌ Proxy returned error:', errorText);
          throw new Error(`Proxy endpoint returned ${imageResponse.status}: ${errorText.substring(0, 200)}`);
        }
        
        // Check content type
        const contentType = imageResponse.headers.get('content-type');
        console.log('📄 Response content-type:', contentType);
        
        if (!contentType || !contentType.startsWith('image/')) {
          const responseText = await imageResponse.text();
          console.error('❌ Proxy did not return an image. Response:', responseText.substring(0, 500));
          throw new Error(`Proxy endpoint did not return an image (content-type: ${contentType})`);
        }
        
        // Convert response to blob and create Object URL
        const imageBlob = await imageResponse.blob();
        const blobUrl = URL.createObjectURL(imageBlob);
        console.log('✅ Created blob URL from fetched image');
        
        // Load the image from blob URL (no auth needed since it's local)
        const img = new Image();
        // No need for crossOrigin since blob URL is same-origin
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log('✅ Image loaded successfully from blob URL');
            resolve(null);
          };
          img.onerror = (error) => {
            console.error('❌ Image load error details:', {
              error: error,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              complete: img.complete,
              src: img.src
            });
            URL.revokeObjectURL(blobUrl); // Clean up on error
            reject(error);
          };
          console.log('📥 Setting img.src to blob URL...');
          img.src = blobUrl;
        });
        
        console.log('✅ Stock image verified and ready:', img.width, 'x', img.height);
        
        // Detect orientation from loaded image
        const detectedOrientation = img.width > img.height ? 'landscape' : 'portrait';
        setOrientation(detectedOrientation);
        setOriginalImageDimensions({ width: img.width, height: img.height });
        
        // Detect image quality using current size from configRef
        const quality = detectImageQuality(img, configRef.current.size);
        setImageQuality(quality);
        
        // Initialize history with default transform
        const initialTransform = {
          scale: 1,
          x: 0,
          y: 0,
          rotation: 0,
          flipX: false,
          flipY: false,
        };
        setImageTransform(initialTransform);
        setTransformHistory([initialTransform]);
        setHistoryIndex(0);
        
        // Initialize crop box with proper proportions
        const sizeAspectRatio = getSizeAspectRatioWithOrientation(configRef.current.size, detectedOrientation);
        const calculatedCropBox = calculateProportionalCropBox(sizeAspectRatio);
        setCropBoxPercent(calculatedCropBox);
        
        // Use blob URL - it's same-origin so no CORS issues for canvas export
        setConfig(prev => ({ ...prev, image: blobUrl }));
        setCompletedSteps([1]); // Mark step 1 as completed
        setCurrentStep(2);
        console.log('🚀 ConfiguratorSection: Moved to step 2 (Customize) with stock image fully initialized');
        
        // Scroll to configurator with multiple attempts for reliability
        setTimeout(() => {
          const scrollIntoView = (attempt = 1) => {
            const element = document.getElementById('configurator');
            if (element) {
              console.log(`📍 ConfiguratorSection: Scrolling to self (attempt ${attempt})`);
              const yOffset = -80;
              const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            } else if (attempt < 3) {
              setTimeout(() => scrollIntoView(attempt + 1), 200);
            }
          };
          scrollIntoView();
        }, 200);
        
        // Notify parent that processing is complete - ONLY AFTER EVERYTHING IS DONE
        if (onStockImageProcessed) {
          onStockImageProcessed();
        }
      } catch (error) {
        console.error('❌ Failed to load stock image:', error);
        console.error('   Stock image URL:', stockImageUrl);
        console.warn('⚠️  If you see CORS errors, configure your S3 bucket with CORS policy:');
        console.warn('   {');
        console.warn('     "AllowedOrigins": ["*"],');
        console.warn('     "AllowedMethods": ["GET"],');
        console.warn('     "AllowedHeaders": ["*"]');
        console.warn('   }');
        setToast({
          message: 'Failed to load stock photo. Please check S3 CORS configuration or try another photo.',
          type: 'error'
        });
        
        // Don't clear the stockImageUrl - let user try again or go back
      }
    };
    
    processStockImage();
  }, [stockImageUrl, onStockImageProcessed]);

  // Helper function to parse size and get aspect ratio with specific orientation
  const getSizeAspectRatioWithOrientation = (size: string, targetOrientation: 'portrait' | 'landscape'): number => {
    // Parse dimensions from size (e.g., "8\" × 10\"" or "8" x 10"")
    const dimensions = size.match(/(\d+\.?\d*)\s*["\"]\s*[×x]\s*(\d+\.?\d*)/);
    if (dimensions) {
      let width = parseFloat(dimensions[1]);
      let height = parseFloat(dimensions[2]);
      
      // Swap dimensions based on canvas orientation
      if (targetOrientation === 'portrait' && width > height) {
        [width, height] = [height, width];
      } else if (targetOrientation === 'landscape' && height > width) {
        [width, height] = [height, width];
      }
      
      return width / height;
    }
    // Default to square if parsing fails
    return 1;
  };
  
  // Helper function to parse size and get aspect ratio
  const getSizeAspectRatio = (size: string): number => {
    // Parse dimensions from size (e.g., "8\" × 10\"" or "8" x 10"")
    const dimensions = size.match(/(\d+\.?\d*)\s*["\"]\s*[×x]\s*(\d+\.?\d*)/);
    if (dimensions) {
      let width = parseFloat(dimensions[1]);
      let height = parseFloat(dimensions[2]);
      
      // Swap dimensions based on canvas orientation (use current orientation state)
      const currentOrientation = orientationRef.current;
      if (currentOrientation === 'portrait' && width > height) {
        [width, height] = [height, width];
      } else if (currentOrientation === 'landscape' && height > width) {
        [width, height] = [height, width];
      }
      
      return width / height;
    }
    // Default to square if parsing fails
    return 1;
  };

  // Helper function to calculate proportional crop box
  const calculateProportionalCropBox = (aspectRatio: number) => {
    // Start with a larger box (60% base size) for better visibility
    const baseSize = 60;
    let width = baseSize;
    let height = baseSize;

    if (aspectRatio > 1) {
      // Landscape: width > height
      height = width / aspectRatio;
    } else if (aspectRatio < 1) {
      // Portrait: height > width
      width = height * aspectRatio;
    }
    // If aspectRatio === 1, it's square (60x60)

    // Center the crop box
    const x = (100 - width) / 2;
    const y = (100 - height) / 2;

    return { x, y, width, height };
  };

  // Initialize crop box percentage when image first loads
  useEffect(() => {
    if (config.image) {
      // Reset to proportional crop box based on selected size
      const aspectRatio = getSizeAspectRatio(config.size);
      const initialCropBox = calculateProportionalCropBox(aspectRatio);
      setCropBoxPercent(initialCropBox);
    }
  }, [config.image]);

  // Update crop box when size changes to maintain proportionality
  useEffect(() => {
    if (config.image && config.size) {
      const aspectRatio = getSizeAspectRatio(config.size);
      const newCropBox = calculateProportionalCropBox(aspectRatio);
      setCropBoxPercent(newCropBox);
    }
  }, [config.size]);

  // Update crop box when orientation changes to maintain proportionality
  useEffect(() => {
    if (config.image && config.size) {
      const aspectRatio = getSizeAspectRatio(config.size);
      const newCropBox = calculateProportionalCropBox(aspectRatio);
      setCropBoxPercent(newCropBox);
    }
  }, [orientation]);

  // Handle document-level mouse events for crop box dragging/resizing
  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (isMobile || (!isDraggingCrop && !isResizingCrop)) return;
      
      // Find the canvas element to get its dimensions
      const canvas = document.querySelector('[data-crop-canvas]') as HTMLElement;
      if (!canvas) return;
      
      const canvasRect = canvas.getBoundingClientRect();
      const deltaX = e.clientX - cropDragStart.x;
      const deltaY = e.clientY - cropDragStart.y;
      
      // Convert pixel deltas to percentage deltas
      const deltaPercentX = (deltaX / canvasRect.width) * 100;
      const deltaPercentY = (deltaY / canvasRect.height) * 100;

      if (isDraggingCrop) {
        // Move the crop box - work in percentages
        const newX = Math.max(0, Math.min(100 - cropBoxPercent.width, cropDragStart.cropX + deltaPercentX));
        const newY = Math.max(0, Math.min(100 - cropBoxPercent.height, cropDragStart.cropY + deltaPercentY));
        
        setCropBoxPercent({
          ...cropBoxPercent,
          x: newX,
          y: newY,
        });
      } else if (isResizingCrop && resizeHandle) {
        // Resize the crop box based on handle - work in percentages, maintain aspect ratio
        const aspectRatio = getSizeAspectRatio(config.size);
        let newX = cropDragStart.cropX;
        let newY = cropDragStart.cropY;
        let newWidth = cropDragStart.cropWidth;
        let newHeight = cropDragStart.cropHeight;

        // Determine which dimension to use as the primary driver
        // Corner handles: use the diagonal direction
        // Edge handles: use that edge's direction
        if (resizeHandle.includes('e') || resizeHandle.includes('w')) {
          // Horizontal resize
          if (resizeHandle.includes('w')) {
            const tempX = Math.max(0, cropDragStart.cropX + deltaPercentX);
            const tempWidth = cropDragStart.cropWidth - (tempX - cropDragStart.cropX);
            if (tempWidth >= 10) {
              newWidth = tempWidth;
              newHeight = newWidth / aspectRatio;
              // Adjust position to keep centered when resizing from left
              newX = tempX;
              // Keep vertical center
              newY = cropDragStart.cropY + (cropDragStart.cropHeight - newHeight) / 2;
            }
          } else if (resizeHandle.includes('e')) {
            const tempWidth = Math.max(10, Math.min(100 - cropDragStart.cropX, cropDragStart.cropWidth + deltaPercentX));
            newWidth = tempWidth;
            newHeight = newWidth / aspectRatio;
            // Keep vertical center
            newY = cropDragStart.cropY + (cropDragStart.cropHeight - newHeight) / 2;
          }
        } else if (resizeHandle.includes('n') || resizeHandle.includes('s')) {
          // Vertical resize
          if (resizeHandle.includes('n')) {
            const tempY = Math.max(0, cropDragStart.cropY + deltaPercentY);
            const tempHeight = cropDragStart.cropHeight - (tempY - cropDragStart.cropY);
            if (tempHeight >= 10) {
              newHeight = tempHeight;
              newWidth = newHeight * aspectRatio;
              // Adjust position to keep centered when resizing from top
              newY = tempY;
              // Keep horizontal center
              newX = cropDragStart.cropX + (cropDragStart.cropWidth - newWidth) / 2;
            }
          } else if (resizeHandle.includes('s')) {
            const tempHeight = Math.max(10, Math.min(100 - cropDragStart.cropY, cropDragStart.cropHeight + deltaPercentY));
            newHeight = tempHeight;
            newWidth = newHeight * aspectRatio;
            // Keep horizontal center
            newX = cropDragStart.cropX + (cropDragStart.cropWidth - newWidth) / 2;
          }
        }

        // Ensure the crop box stays within bounds
        if (newX < 0) {
          newX = 0;
          newWidth = cropDragStart.cropX + cropDragStart.cropWidth;
          newHeight = newWidth / aspectRatio;
          newY = cropDragStart.cropY + (cropDragStart.cropHeight - newHeight) / 2;
        }
        if (newY < 0) {
          newY = 0;
          newHeight = cropDragStart.cropY + cropDragStart.cropHeight;
          newWidth = newHeight * aspectRatio;
          newX = cropDragStart.cropX + (cropDragStart.cropWidth - newWidth) / 2;
        }
        if (newX + newWidth > 100) {
          newWidth = 100 - newX;
          newHeight = newWidth / aspectRatio;
          newY = cropDragStart.cropY + (cropDragStart.cropHeight - newHeight) / 2;
        }
        if (newY + newHeight > 100) {
          newHeight = 100 - newY;
          newWidth = newHeight * aspectRatio;
          newX = cropDragStart.cropX + (cropDragStart.cropWidth - newWidth) / 2;
        }

        // Ensure minimum size (10% of canvas)
        if (newWidth >= 10 && newHeight >= 10) {
          setCropBoxPercent({
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          });
        }
      }
    };

    const handleDocumentMouseUp = () => {
      setIsDraggingCrop(false);
      setIsResizingCrop(false);
      setResizeHandle(null);
    };

    if (isDraggingCrop || isResizingCrop) {
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [isDraggingCrop, isResizingCrop, cropDragStart, cropBoxPercent, resizeHandle]);

  // Handle document-level mouse and touch events for image dragging
  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (!isDraggingImage) return;
      
      // Update image position as user drags
      setImageTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    };

    const handleDocumentTouchMove = (e: TouchEvent) => {
      if (!isDraggingImage) return;
      
      const touch = e.touches[0];
      // Update image position as user drags
      setImageTransform(prev => ({
        ...prev,
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      }));
    };

    const handleDocumentMouseUp = () => {
      if (isDraggingImage) {
        setIsDraggingImage(false);
      }
    };

    const handleDocumentTouchEnd = () => {
      if (isDraggingImage) {
        setIsDraggingImage(false);
      }
    };

    if (isDraggingImage) {
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
      document.addEventListener('touchmove', handleDocumentTouchMove);
      document.addEventListener('touchend', handleDocumentTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
      document.removeEventListener('touchmove', handleDocumentTouchMove);
      document.removeEventListener('touchend', handleDocumentTouchEnd);
    };
  }, [isDraggingImage, dragStart, imageTransform]);

  // Pricing based on configuration
  const calculatePrice = () => {
    // Safety check for config
    if (!config || !config.size) {
      console.error('❌ calculatePrice called with invalid config:', config);
      return 49.99; // Return default price for 12x8
    }
    
    // Trim and clean the size string to handle any whitespace issues
    const cleanSize = config.size.trim();
    
    // Parse dimensions from config.size (e.g., "8" × 10"")
    const dimensions = cleanSize.match(/(\d+\.?\d*)\s*[""]\s*×\s*(\d+\.?\d*)/);
    
    if (!dimensions) {
      console.error('❌ Failed to parse dimensions from size:', config.size);
      return 49.99; // Default to 12x8 price
    }
    
    const width = parseFloat(dimensions[1]);
    const height = parseFloat(dimensions[2]);
    const squareInches = width * height;
    
    // Sample size reference (5x7 = 35 sq in)
    const sampleSqIn = 35; // 5 x 7
    const samplePrice = 25;
    
    // Special pricing for sample size (5"x7" or 7"x5")
    if (config.size === '5" × 7"' || config.size === '7" × 5"') {
      return samplePrice; // Fixed price for sample, no options allowed
    }
    
    // Any custom size smaller than or equal to sample size
    if (squareInches <= sampleSqIn) {
      return samplePrice;
    }
    
    // Get size prices from inventory dynamically
    const getSizePriceFromInventory = (sizeName: string): number | null => {
      // Normalize the size name by removing quotes and converting × to x
      const normalize = (str: string) => {
        return str.toLowerCase()
          .replace(/[""\u0022\u201c\u201d]/g, '') // Remove all types of quotes
          .replace(/[×x]/gi, 'x') // Convert × to x (case insensitive)
          .replace(/[\s\t\r\n]+/g, '') // Remove ALL whitespace including tabs
          .trim();
      };
      
      const normalizedTarget = normalize(sizeName);
      
      const sizeItem = inventory.find(
        (item) => item.category === 'size' && normalize(item.name) === normalizedTarget
      );
      
      if (sizeItem) {
        console.log(`✅ Found price for ${sizeName}: $${sizeItem.price}`);
      }
      
      return sizeItem ? sizeItem.price : null;
    };
    
    // Build price lookup table from inventory
    const sizePrices: { [key: number]: number } = {};
    
    // Map all inventory sizes to their square inches
    const sizeMapping = [
      { name: '5" x 7"', sqIn: 35 },
      { name: '7" x 5"', sqIn: 35 },  // Portrait
      { name: '8" x 12"', sqIn: 96 },  // Portrait - CRITICAL FIX!
      { name: '12" x 8"', sqIn: 96 },
      { name: '11" x 17"', sqIn: 187 },  // Portrait
      { name: '17" x 11"', sqIn: 187 },
      { name: '16" x 24"', sqIn: 384 },  // Portrait
      { name: '24" x 16"', sqIn: 384 },
      { name: '20" x 30"', sqIn: 600 },  // Portrait
      { name: '30" x 20"', sqIn: 600 },
      { name: '24" x 36"', sqIn: 864 },  // Portrait
      { name: '36" x 24"', sqIn: 864 },
      { name: '30" x 40"', sqIn: 1200 },  // Portrait
      { name: '40" x 30"', sqIn: 1200 },
    ];
    
    // Populate from inventory if available
    sizeMapping.forEach(({ name, sqIn }) => {
      const price = getSizePriceFromInventory(name);
      if (price !== null) {
        sizePrices[sqIn] = price;
      }
    });
    
    // Fallback to hardcoded prices only if inventory is empty
    if (Object.keys(sizePrices).length === 0) {
      sizePrices[35] = 25.00;     // 5x7
      sizePrices[96] = 49.99;     // 12x8
      sizePrices[187] = 69.99;    // 17x11
      sizePrices[384] = 109.99;   // 24x16
      sizePrices[600] = 149.99;   // 30x20
      sizePrices[864] = 199.99;   // 36x24
      sizePrices[1200] = 269.99;  // 40x30
    }
    
    // Check for exact match first
    let price = sizePrices[squareInches];
    
    // If no exact match, use interpolation between nearest sizes
    if (!price) {
      const sizeKeys = Object.keys(sizePrices).map(Number).sort((a, b) => a - b);
      
      // Safety check: ensure we have size data
      if (sizeKeys.length === 0) {
        console.error('❌ No size prices available, using default');
        return 49.99;
      }
      
      // Find the two closest sizes
      let lowerSize = sizeKeys[0];
      let upperSize = sizeKeys[sizeKeys.length - 1];
      
      for (let i = 0; i < sizeKeys.length - 1; i++) {
        if (squareInches >= sizeKeys[i] && squareInches <= sizeKeys[i + 1]) {
          lowerSize = sizeKeys[i];
          upperSize = sizeKeys[i + 1];
          break;
        }
      }
      
      // Safety check for division by zero
      if (upperSize === lowerSize) {
        price = sizePrices[lowerSize];
      } else {
        // Linear interpolation/extrapolation
        const pricePerSqIn = (sizePrices[upperSize] - sizePrices[lowerSize]) / (upperSize - lowerSize);
        price = sizePrices[lowerSize] + (squareInches - lowerSize) * pricePerSqIn;
      }
      
      // Ensure price doesn't go below sample price and is valid
      if (!price || isNaN(price) || price < samplePrice) {
        price = samplePrice;
      }
    }
    
    // Finish pricing - Both Gloss and Matte are included at no extra cost
    // No additional charge for finish
    
    // Get prices from inventory
    const getMountPrice = (mountName: string): number => {
      const mountItem = inventory.find(
        (item) => item.category === 'mounting' && item.name.toLowerCase().trim() === mountName.toLowerCase().trim()
      );
      // Fallback to hardcoded if not in inventory
      if (mountItem) return mountItem.price;
      if (mountName.toLowerCase().includes('float')) return 39.99;
      if (mountName.toLowerCase().includes('magnet') || mountName.toLowerCase().includes('3d')) return 49.99;
      return 0; // Stick Tape is free
    };
    
    const getFramePrice = (frameName: string): number => {
      const frameItem = inventory.find(
        (item) => item.category === 'frame' && item.name.toLowerCase().trim() === frameName.toLowerCase().trim()
      );
      // Fallback to hardcoded if not in inventory
      if (frameItem) return frameItem.price;
      if (frameName.toLowerCase().includes('black')) return 89.99;
      if (frameName.toLowerCase().includes('gold')) return 129.99;
      if (frameName.toLowerCase().includes('wood') || frameName.toLowerCase().includes('natural')) return 109.99;
      return 0; // None is free
    };
    
    // Safety check: ensure we have a valid base price before adding options
    if (!price || isNaN(price) || price <= 0) {
      console.error('❌ Invalid base price before options:', price, 'for size:', cleanSize);
      price = 49.99; // Default to 12x8 price
    }
    
    // Mount pricing - get from inventory
    price += getMountPrice(config.mountType);
    
    // Frame pricing - get from inventory
    price += getFramePrice(config.frame);
    
    // Rush order pricing
    if (config.rushOrder) {
      price += 89;
    }
    
    // Final safety check for NaN or invalid values
    if (!price || isNaN(price) || price < 0) {
      console.error('❌ Invalid price calculated:', price, 'for config:', config);
      console.error('   Debug info - cleanSize:', cleanSize, 'squareInches:', squareInches);
      return 49.99; // Default to 12x8 price
    }
    
    return price;
  };

  let basePrice = calculatePrice();
  
  // Ensure we always have a valid price
  if (!basePrice || isNaN(basePrice) || basePrice < 0) {
    console.error('❌ basePrice is invalid after calculation:', basePrice, 'using default 49.99');
    basePrice = 49.99;
  }
  
  // Check if size is sample size or smaller (disable mount and frame options)
  // Parse dimensions and check if <= 35 sq inches
  const getSizeInSquareInches = (sizeString: string) => {
    const dimensions = sizeString.match(/(\d+\.?\d*)\s*[""]\s*×\s*(\d+\.?\d*)/);
    if (dimensions) {
      const width = parseFloat(dimensions[1]);
      const height = parseFloat(dimensions[2]);
      return width * height;
    }
    return 0;
  };
  
  const isSampleSize = getSizeInSquareInches(config.size) <= 35;

  // Auto-switch out-of-stock selections to available alternatives
  useEffect(() => {
    if (!inventoryLoading && inventory.length > 0) {
      let needsUpdate = false;
      const updates: Partial<Configuration> = {};
      
      // Check and fix finish
      if (!isAvailable(config.finish)) {
        const availableFinish = ['Gloss', 'Matte'].find(f => isAvailable(f));
        if (availableFinish) {
          updates.finish = availableFinish;
          needsUpdate = true;
          console.log(`Auto-switching finish from ${config.finish} to ${availableFinish}`);
        }
      }
      
      // Check and fix mount type (only if not sample size)
      if (!isSampleSize && !isAvailable(config.mountType)) {
        const availableMount = ['Stick Tape', 'Float Mount', '3D Magnet'].find(m => isAvailable(m));
        if (availableMount) {
          updates.mountType = availableMount;
          needsUpdate = true;
          console.log(`Auto-switching mount type from ${config.mountType} to ${availableMount}`);
        }
      }
      
      // Check and fix frame (only if not "None" and not sample size)
      if (!isSampleSize && config.frame !== 'None' && !isAvailable(config.frame)) {
        const availableFrame = ['None', 'Black', 'Gold', 'Natural Wood'].find(f => isAvailable(f) || f === 'None');
        if (availableFrame) {
          updates.frame = availableFrame;
          needsUpdate = true;
          console.log(`Auto-switching frame from ${config.frame} to ${availableFrame}`);
        }
      }
      
      if (needsUpdate) {
        setConfig(prev => ({ ...prev, ...updates }));
      }
    }
  }, [inventoryLoading, inventory, config.finish, config.mountType, config.frame, isSampleSize]);

  // File upload handlers
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        
        // Detect image orientation and quality
        const img = new Image();
        img.onload = () => {
          const detectedOrientation = img.width > img.height ? 'landscape' : 'portrait';
          setOrientation(detectedOrientation);
          setOriginalImageDimensions({ width: img.width, height: img.height });
          
          // Detect image quality
          const quality = detectImageQuality(img, config.size);
          setImageQuality(quality);
          
          // Initialize history with default transform
          const initialTransform = {
            scale: 1,
            x: 0,
            y: 0,
            rotation: 0,
            flipX: false,
            flipY: false,
          };
          setTransformHistory([initialTransform]);
          setHistoryIndex(0);
        };
        img.src = imageUrl;
        
        setConfig({ ...config, image: imageUrl });
        setPreviewImage(imageUrl); // Set preview image so it shows in canvas
        setCompletedSteps([1]); // Mark step 1 as completed
        setCurrentStep(2); // Move to customize step
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setShowRemoveConfirm(true);
  };
  
  const confirmRemoveImage = () => {
    setConfig({ ...config, image: null });
    setShowRemoveConfirm(false);
    setCurrentStep(1);
    setCompletedSteps([]);
    setImageTransform({ scale: 1, x: 0, y: 0, rotation: 0, flipX: false, flipY: false });
    setTransformHistory([]);
    setHistoryIndex(-1);
  };

  // Image transformation handlers
  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (!config.image) return;
    e.preventDefault();
    setIsDraggingImage(true);
    setDragStart({ x: e.clientX - imageTransform.x, y: e.clientY - imageTransform.y });
  };

  const handleImageTouchStart = (e: React.TouchEvent) => {
    if (!config.image) return;
    e.preventDefault();
    const touch = e.touches[0];
    setIsDraggingImage(true);
    setDragStart({ x: touch.clientX - imageTransform.x, y: touch.clientY - imageTransform.y });
  };

  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingImage) return;
    setImageTransform({
      ...imageTransform,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleImageMouseUp = () => {
    setIsDraggingImage(false);
  };

  const fitToPage = () => {
    // Calculate scale to fit entire image within canvas
    if (config.image) {
      const img = new Image();
      img.src = config.image;
      img.onload = () => {
        // Parse dimensions from config.size (e.g., "16" × 20"")
        const dimensions = config.size.match(/(\d+\.?\d*)\s*[""]\s*×\s*(\d+\.?\d*)/);
        const width = dimensions ? parseFloat(dimensions[1]) : 16;
        const height = dimensions ? parseFloat(dimensions[2]) : 20;
        const canvasAspectRatio = width / height;
        const imageAspectRatio = img.width / img.height;
        
        // Calculate scale to contain entire image
        let scale = 1;
        if (imageAspectRatio > canvasAspectRatio) {
          // Image is wider - fit to width
          scale = 1;
        } else {
          // Image is taller - fit to height
          scale = canvasAspectRatio / imageAspectRatio;
        }
        
        setImageTransform({
          ...imageTransform,
          scale: scale,
          x: 0,
          y: 0,
          rotation: 0,
        });
      };
    } else {
      setImageTransform({
        ...imageTransform,
        scale: 1,
        x: 0,
        y: 0,
        rotation: 0,
      });
    }
  };

  const zoomIn = () => {
    const newTransform = {
      ...imageTransform,
      scale: Math.min(imageTransform.scale + 0.1, 3),
    };
    setImageTransform(newTransform);
    addToHistory(newTransform);
  };

  const zoomOut = () => {
    const newTransform = {
      ...imageTransform,
      scale: Math.max(imageTransform.scale - 0.1, 0.5),
    };
    setImageTransform(newTransform);
    addToHistory(newTransform);
  };

  const rotateLeft = () => {
    const newTransform = {
      ...imageTransform,
      rotation: imageTransform.rotation - 90,
    };
    setImageTransform(newTransform);
    addToHistory(newTransform);
  };

  const rotateRight = () => {
    const newTransform = {
      ...imageTransform,
      rotation: imageTransform.rotation + 90,
    };
    setImageTransform(newTransform);
    addToHistory(newTransform);
  };

  const flipHorizontal = () => {
    const newTransform = {
      ...imageTransform,
      flipX: !imageTransform.flipX,
    };
    setImageTransform(newTransform);
    addToHistory(newTransform);
  };

  const flipVertical = () => {
    const newTransform = {
      ...imageTransform,
      flipY: !imageTransform.flipY,
    };
    setImageTransform(newTransform);
    addToHistory(newTransform);
  };

  const resetTransform = () => {
    const newTransform = {
      scale: 1,
      x: 0,
      y: 0,
      rotation: 0,
      flipX: false,
      flipY: false,
    };
    setImageTransform(newTransform);
    addToHistory(newTransform);
  };
  
  // Undo/Redo functionality
  const addToHistory = (transform: typeof imageTransform) => {
    const newHistory = transformHistory.slice(0, historyIndex + 1);
    newHistory.push(transform);
    setTransformHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setImageTransform(transformHistory[newIndex]);
    }
  };
  
  const redo = () => {
    if (historyIndex < transformHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setImageTransform(transformHistory[newIndex]);
    }
  };
  
  // Quick preset actions
  const fillCanvas = () => {
    if (config.image) {
      const newTransform = {
        ...imageTransform,
        scale: 1.5,
        x: 0,
        y: 0,
      };
      setImageTransform(newTransform);
      addToHistory(newTransform);
      setFitMode('fill');
    }
  };
  
  const centerImage = () => {
    // Center the crop box while maintaining its current size
    const newCropBox = {
      ...cropBoxPercent,
      x: (100 - cropBoxPercent.width) / 2,
      y: (100 - cropBoxPercent.height) / 2,
    };
    setCropBoxPercent(newCropBox);
    console.log('📍 Centered crop box:', newCropBox);
  };
  
  // Image quality detection
  const detectImageQuality = (img: HTMLImageElement, targetSize: string) => {
    const dimensions = targetSize.match(/(\d+\.?\d*)\s*[""]\s*×\s*(\d+\.?\d*)/);
    if (!dimensions) return 'good';
    
    const width = parseFloat(dimensions[1]);
    const height = parseFloat(dimensions[2]);
    
    // Compare the shorter side to shorter side for accurate quality assessment
    const targetPixels = Math.min(width, height) * 300; // 300 DPI standard
    const imagePixels = Math.min(img.width, img.height);
    
    const ratio = imagePixels / targetPixels;
    
    if (ratio >= 1) return 'excellent';
    if (ratio >= 0.75) return 'good';
    if (ratio >= 0.5) return 'fair';
    return 'poor';
  };
  
  // Update image quality when size changes
  useEffect(() => {
    if (config.image && originalImageDimensions) {
      const img = new Image();
      img.onload = () => {
        const quality = detectImageQuality(img, config.size);
        setImageQuality(quality);
      };
      img.src = config.image;
    }
  }, [config.size, config.image, originalImageDimensions]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only work when not in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Cmd/Ctrl + Shift + Z for redo
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // + or = for zoom in
      else if ((e.key === '+' || e.key === '=') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        zoomIn();
      }
      // - for zoom out
      else if (e.key === '-' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        zoomOut();
      }
      // R for rotate right
      else if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        rotateRight();
      }
      // L for rotate left
      else if (e.key === 'l' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        rotateLeft();
      }
      // F for fit
      else if (e.key === 'f' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        fitToPage();
      }
      // C for center
      else if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        centerImage();
      }
      // ? for help
      else if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageTransform, historyIndex, transformHistory]);
  
  // Check if all selected items are in stock
  const allItemsInStock = () => {
    // Check size
    if (!isAvailable(config.size)) {
      return false;
    }
    
    // Check finish
    if (!isAvailable(config.finish)) {
      return false;
    }
    
    // Check mount type (only if not sample size)
    if (!isSampleSize && !isAvailable(config.mountType)) {
      return false;
    }
    
    // Check frame (only if not "None" and not sample size)
    if (!isSampleSize && config.frame !== 'None' && !isAvailable(config.frame)) {
      return false;
    }
    
    return true;
  };

  // Step navigation helpers
  const goToNextStep = () => {
    if (currentStep < 4) {
      // Validate stock availability before proceeding from step 2
      if (currentStep === 2 && !allItemsInStock()) {
        setToast({
          message: 'Some selected items are out of stock. Please update your selection before continuing.',
          type: 'error'
        });
        return;
      }
      
      if (currentStep === 2) {
        // Generate high-resolution print-ready image before moving to proof step
        setIsGeneratingCrop(true);
        generatePrintReadyImage().then((url) => {
          if (url) {
            setCroppedImageUrl(url);
          }
          setIsGeneratingCrop(false);
          setCompletedSteps([...completedSteps, currentStep]);
          setCurrentStep(currentStep + 1);
        });
      } else {
        setCompletedSteps([...completedSteps, currentStep]);
        setCurrentStep(currentStep + 1);
      }
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetConfigurator = () => {
    // Reset all configuration to defaults
    setConfig({
      image: null,
      size: '12" × 8"',
      finish: 'Gloss',
      mountType: 'Stick Tape',
      frame: 'None',
      rushOrder: false,
    });
    setOrientation('portrait');
    setOriginalImageDimensions(null);
    setImageQuality(null);
    setImageTransform({
      scale: 1,
      x: 0,
      y: 0,
      rotation: 0,
      flipX: false,
      flipY: false,
    });
    setTransformHistory([{
      scale: 1,
      x: 0,
      y: 0,
      rotation: 0,
      flipX: false,
      flipY: false,
    }]);
    setHistoryIndex(0);
    setCropBoxPercent({
      x: 10,
      y: 10,
      width: 80,
      height: 80,
    });
    setCroppedImageUrl(null);
    setCompletedSteps([]);
    setCurrentStep(1);
    console.log('Configurator reset to step 1');
  };

  // Crop selection handlers - working with percentages
  const handleCropMouseDown = (e: React.MouseEvent, handle?: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w') => {
    if (isMobile) return; // Disable crop box on mobile
    e.stopPropagation();
    
    if (handle) {
      setIsResizingCrop(true);
      setResizeHandle(handle);
    } else {
      setIsDraggingCrop(true);
    }
    
    // Store starting mouse position and current crop percentages
    setCropDragStart({
      x: e.clientX,
      y: e.clientY,
      cropX: cropBoxPercent.x,
      cropY: cropBoxPercent.y,
      cropWidth: cropBoxPercent.width,
      cropHeight: cropBoxPercent.height,
    });
  };

  // Generate cropped image for preview - optimized for speed
  const generateCroppedImage = async () => {
    if (!config.image) return;

    return new Promise<string>((resolve) => {
      const img = new Image();
      
      // Only set crossOrigin for external URLs, not for blob URLs or data URLs
      if (!config.image.startsWith('blob:') && !config.image.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      
      img.onload = () => {
        // Use requestAnimationFrame to avoid blocking the UI
        requestAnimationFrame(() => {
          // Calculate canvas dimensions from print size
          const dimensions = config.size.match(/(\d+\.?\d*)\s*["\"]?\s*[×x]\s*(\d+\.?\d*)/);
          let canvasWidth = 400; // default
          let canvasHeight = 500; // default
          
          if (dimensions) {
            let w = parseFloat(dimensions[1]);
            let h = parseFloat(dimensions[2]);
            
            // Adjust for orientation
            if (orientation === 'portrait' && w > h) {
              [w, h] = [h, w];
            } else if (orientation === 'landscape' && h > w) {
              [w, h] = [h, w];
            }
            
            // Scale to reasonable preview size
            const scale = Math.min(500 / Math.max(w, h), 1) * 50;
            canvasWidth = w * scale;
            canvasHeight = h * scale;
          }
          
          // Fallback: try to get from DOM if available
          const canvasElement = document.querySelector('[data-crop-canvas]') as HTMLElement;
          let width = canvasWidth;
          let height = canvasHeight;
          
          if (canvasElement) {
            const canvasRect = canvasElement.getBoundingClientRect();
            width = canvasRect.width;
            height = canvasRect.height;
          }
          
          // PERFORMANCE: Limit canvas size to max 500px for preview
          const MAX_SIZE = 500;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            const scale = Math.min(MAX_SIZE / width, MAX_SIZE / height);
            width = Math.floor(width * scale);
            height = Math.floor(height * scale);
          }
          
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext('2d', { alpha: false, willReadFrequently: false });
          if (!tempCtx) {
            console.error('Failed to get 2D context for temp canvas');
            resolve(config.image || '');
            return;
          }

          // Calculate scale ratio (if we have DOM element, use it, otherwise ratio is 1)
          const originalWidth = canvasElement ? canvasElement.getBoundingClientRect().width : width;
          const scaleRatio = width / originalWidth;
          tempCtx.save();
          tempCtx.translate(width / 2, height / 2);
          tempCtx.rotate((imageTransform.rotation * Math.PI) / 180);
          tempCtx.scale(
            imageTransform.scale * (imageTransform.flipX ? -1 : 1),
            imageTransform.scale * (imageTransform.flipY ? -1 : 1)
          );
          tempCtx.translate(imageTransform.x * scaleRatio, imageTransform.y * scaleRatio);
          
          const imgAspect = img.width / img.height;
          const canvasAspect = width / height;
          let drawWidth, drawHeight;
          
          if (imgAspect > canvasAspect) {
            drawWidth = width;
            drawHeight = width / imgAspect;
          } else {
            drawHeight = height;
            drawWidth = height * imgAspect;
          }
          
          tempCtx.imageSmoothingQuality = 'low';
          tempCtx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
          tempCtx.restore();

          if (isMobile) {
            // Use PNG for lossless quality - important for print-ready files
            resolve(tempCanvas.toDataURL('image/png'));
            return;
          }

          const finalCanvas = document.createElement('canvas');
          const cropX = Math.floor((cropBoxPercent.x / 100) * width);
          const cropY = Math.floor((cropBoxPercent.y / 100) * height);
          const cropW = Math.floor((cropBoxPercent.width / 100) * width);
          const cropH = Math.floor((cropBoxPercent.height / 100) * height);
          
          finalCanvas.width = cropW;
          finalCanvas.height = cropH;
          const finalCtx = finalCanvas.getContext('2d', { alpha: false, willReadFrequently: false });
          if (!finalCtx) {
            console.error('Failed to get 2D context for final canvas');
            resolve(tempCanvas.toDataURL('image/png'));
            return;
          }

          finalCtx.imageSmoothingQuality = 'low';
          finalCtx.drawImage(tempCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

          // Use PNG format for maximum quality (lossless compression)
          // This is critical for print-ready files where quality is paramount
          resolve(finalCanvas.toDataURL('image/png'));
        });
      };
      
      img.onerror = (e) => {
        console.error('Failed to load image for crop generation:', {
          src: config.image?.substring(0, 100),
          error: e,
          isBlob: config.image?.startsWith('blob:'),
          isData: config.image?.startsWith('data:'),
        });
        // Return original image as fallback
        resolve(config.image || '');
      };
      
      img.src = config.image;
    });
  };

  // Generate HIGH-RESOLUTION print-ready image - optimized for quality, not speed
  const generatePrintReadyImage = async () => {
    if (!config.image) return null;

    return new Promise<string>((resolve) => {
      const img = new Image();
      
      // Only set crossOrigin for external URLs
      if (!config.image.startsWith('blob:') && !config.image.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      
      img.onload = () => {
        requestAnimationFrame(() => {
          console.log('🖨️ Generating high-resolution print-ready image...');
          console.log('Source image size:', img.width, 'x', img.height);
          
          // Calculate PRINT dimensions at 300 DPI
          const DPI = 300;
          const dimensions = config.size.match(/(\d+\.?\d*)\s*[""]?\s*[×x]\s*(\d+\.?\d*)/);
          
          if (!dimensions) {
            console.error('Could not parse size dimensions');
            resolve(config.image || '');
            return;
          }
          
          let widthInches = parseFloat(dimensions[1]);
          let heightInches = parseFloat(dimensions[2]);
          
          // Adjust for orientation
          if (orientation === 'portrait' && widthInches > heightInches) {
            [widthInches, heightInches] = [heightInches, widthInches];
          } else if (orientation === 'landscape' && heightInches > widthInches) {
            [widthInches, heightInches] = [heightInches, widthInches];
          }
          
          // Calculate pixel dimensions at 300 DPI
          const printWidth = Math.round(widthInches * DPI);
          const printHeight = Math.round(heightInches * DPI);
          
          console.log(`Print size: ${widthInches}" x ${heightInches}" = ${printWidth}px x ${printHeight}px @ ${DPI} DPI`);
          
          // Calculate editor canvas dimensions (same as in Step 2)
          const cropAspectRatio = widthInches / heightInches;
          const maxSize = 400;
          let editorWidth, editorHeight;
          
          if (cropAspectRatio > 1) {
            editorWidth = maxSize;
            editorHeight = maxSize / cropAspectRatio;
          } else {
            editorHeight = maxSize;
            editorWidth = maxSize * cropAspectRatio;
          }
          
          // Calculate scale factor from editor to print
          const scaleFactor = printWidth / editorWidth;
          console.log(`Scale factor: ${scaleFactor.toFixed(2)}x (editor: ${editorWidth}x${editorHeight} -> print: ${printWidth}x${printHeight})`);
          
          // Create full-size canvas for transformations
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = printWidth;
          tempCanvas.height = printHeight;
          const tempCtx = tempCanvas.getContext('2d', { alpha: false, willReadFrequently: false });
          
          if (!tempCtx) {
            console.error('Failed to get 2D context');
            resolve(config.image || '');
            return;
          }

          // Fill with white background
          tempCtx.fillStyle = '#ffffff';
          tempCtx.fillRect(0, 0, printWidth, printHeight);

          // Calculate image dimensions with object-COVER behavior (fill canvas, crop excess)
          const imgAspect = img.width / img.height;
          const editorAspect = editorWidth / editorHeight;
          let editorImgWidth, editorImgHeight;
          
          // object-COVER logic: fill entire container, may crop image
          if (imgAspect > editorAspect) {
            // Image is wider - fit to height, crop width
            editorImgHeight = editorHeight;
            editorImgWidth = editorHeight * imgAspect;
          } else {
            // Image is taller - fit to width, crop height
            editorImgWidth = editorWidth;
            editorImgHeight = editorWidth / imgAspect;
          }
          
          // Scale image dimensions to print resolution
          const printImgWidth = editorImgWidth * scaleFactor;
          const printImgHeight = editorImgHeight * scaleFactor;
          
          // Apply transformations at full resolution
          tempCtx.save();
          tempCtx.translate(printWidth / 2, printHeight / 2);
          tempCtx.rotate((imageTransform.rotation * Math.PI) / 180);
          tempCtx.scale(
            imageTransform.scale * (imageTransform.flipX ? -1 : 1),
            imageTransform.scale * (imageTransform.flipY ? -1 : 1)
          );
          // Scale the translation values from editor to print
          tempCtx.translate(imageTransform.x * scaleFactor, imageTransform.y * scaleFactor);
          
          // USE HIGH QUALITY for print
          tempCtx.imageSmoothingEnabled = true;
          tempCtx.imageSmoothingQuality = 'high';
          tempCtx.drawImage(img, -printImgWidth / 2, -printImgHeight / 2, printImgWidth, printImgHeight);
          tempCtx.restore();

          // Return full canvas (no cropping)
          console.log('✅ Print-ready image generated:', tempCanvas.width, 'x', tempCanvas.height, 'pixels');
          console.log(`   Equivalent to ${(tempCanvas.width / DPI).toFixed(2)}\" x ${(tempCanvas.height / DPI).toFixed(2)}\" @ ${DPI} DPI`);
          
          // Use PNG for lossless quality
          resolve(tempCanvas.toDataURL('image/png'));
        });
      };
      
      img.onerror = (e) => {
        console.error('Failed to load image for print generation:', e);
        resolve(config.image || '');
      };
      
      img.src = config.image;
    });
  };

  // Calculate best-fit size based on image quality
  const calculateBestFitSize = () => {
    // Only suggest sizes when quality is poor or fair
    if (imageQuality === 'good' || imageQuality === 'excellent') {
      return null;
    }
    
    // Don't suggest anything if we don't have original image dimensions
    if (!originalImageDimensions) {
      return null;
    }
    
    // Parse current size
    const currentDimensions = config.size.match(/(\d+\.?\d*)\s*[""]?\s*[×x]\s*(\d+\.?\d*)/);
    if (!currentDimensions) return null;
    
    let currentWidth = parseFloat(currentDimensions[1]);
    let currentHeight = parseFloat(currentDimensions[2]);
    
    // Adjust for orientation
    if (orientation === 'portrait' && currentWidth > currentHeight) {
      [currentWidth, currentHeight] = [currentHeight, currentWidth];
    } else if (orientation === 'landscape' && currentHeight > currentWidth) {
      [currentWidth, currentHeight] = [currentHeight, currentWidth];
    }
    
    // Find smaller available sizes with the same orientation
    const currentIsLandscape = currentWidth > currentHeight;
    const currentArea = currentWidth * currentHeight;
    
    // Get all available sizes that are smaller
    const smallerSizes = availableSizes
      .map(size => {
        const dims = size.name.match(/(\d+\.?\d*)\s*[""]?\s*[×x]\s*(\d+\.?\d*)/);
        if (!dims) return null;
        
        let w = parseFloat(dims[1]);
        let h = parseFloat(dims[2]);
        
        // Determine size orientation
        const sizeIsLandscape = w > h;
        
        // Only consider sizes with same orientation
        if (sizeIsLandscape !== currentIsLandscape) return null;
        
        const area = w * h;
        
        // Only include sizes that are smaller than current
        if (area >= currentArea) return null;
        
        return {
          name: size.name,
          width: w,
          height: h,
          area: area
        };
      })
      .filter(s => s !== null)
      .sort((a, b) => b!.area - a!.area); // Sort by area descending (largest first)
    
    // If no smaller sizes available, don't show suggestion
    if (smallerSizes.length === 0) return null;
    
    // Return the largest smaller size (closest to current size)
    const suggested = smallerSizes[0]!;
    
    return {
      size: suggested.name,
      width: suggested.width,
      height: suggested.height,
      orientation: currentIsLandscape ? 'landscape' : 'portrait',
      isCustom: false
    };
  };

  // Helper to render option with stock status
  const renderOptionWithStock = (value: string) => {
    const available = isAvailable(value);
    const quantity = getQuantity(value);
    const lowStock = isLowStock(value);

    if (!available) {
      return `${value} - OUT OF STOCK`;
    } else if (lowStock) {
      return `${value} - Low Stock (${quantity} left)`;
    }
    return value;
  };

  // Check if option is disabled due to stock
  const isOptionDisabled = (value: string) => {
    return !isAvailable(value);
  };

  return (
    <section id="configurator" className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a] overflow-visible">
      <div className="container mx-auto px-4 sm:px-6 overflow-visible">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-black dark:text-white">Start Your Print</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-400">
            Four simple steps to create your perfect metal print
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-12 md:mb-16">
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {steps.map((step, index) => {
              // Check if step can be accessed
              const canAccess = step.id === 1 || completedSteps.includes(step.id - 1);
              const isCompleted = completedSteps.includes(step.id);
              
              return (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <motion.div
                  className={`flex flex-col items-center min-w-[80px] md:min-w-[120px] ${canAccess ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  onClick={() => canAccess && setCurrentStep(step.id)}
                  whileHover={canAccess ? { scale: 1.05 } : {}}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                        : currentStep === step.id
                        ? 'bg-[#ff6b35] text-black shadow-lg shadow-[#ff6b35]/50 [data-theme=\'light\']_&:text-white'
                        : canAccess
                        ? 'bg-[#2a2a2a] text-gray-500 [data-theme=\'light\']_&:bg-[#e5e5e5]'
                        : 'bg-[#1a1a1a] text-gray-700'
                    }`}
                    animate={{
                      scale: currentStep === step.id ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: currentStep === step.id ? Infinity : 0,
                      repeatDelay: 1,
                    }}
                  >
                    {isCompleted ? <Check className="w-6 h-6 md:w-8 md:h-8" /> : <step.icon className="w-6 h-6 md:w-8 md:h-8" />}
                  </motion.div>
                  <p
                    className={`mt-3 text-xs md:text-sm transition-colors text-center ${
                      isCompleted
                        ? 'text-green-500'
                        : currentStep === step.id
                        ? 'text-[#ff6b35]'
                        : canAccess
                        ? 'text-gray-500 [data-theme=\'light\']_&:text-gray-400'
                        : 'text-gray-700'
                    }`}
                  >
                    {step.name}
                  </p>
                </motion.div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 md:mx-4 bg-[#2a2a2a] rounded relative overflow-hidden min-w-[30px] md:min-w-[60px] [data-theme='light']_&:bg-[#e5e5e5]">
                    <motion.div
                      className={`absolute inset-y-0 left-0 ${isCompleted ? 'bg-green-500' : 'bg-[#ff6b35]'}`}
                      initial={{ width: 0 }}
                      animate={{
                        width: isCompleted || currentStep > step.id ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            );
            })}
          </div>
        </div>

        {/* Configurator Frame */}
        <motion.div
          className="max-w-5xl mx-auto bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl shadow-xl shadow-[#ff6b35]/10 p-6 md:p-12 border border-[#ff6b35]/20 min-h-[600px]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-16"
              >
                <Upload className="w-16 h-16 mx-auto mb-6 text-[#ff6b35]" />
                <h3 className="text-3xl mb-4 text-white">Upload Your Image</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Choose a high-resolution image for the best results. We accept JPG, PNG, and TIFF formats.
                </p>
                <div
                  className={`border-2 border-dashed border-[#ff6b35]/50 rounded-xl p-12 hover:border-[#ff6b35] transition-colors cursor-pointer ${
                    isDragging ? 'border-[#ff6b35] bg-[#ff6b35]/10' : ''
                  }`}
                  onClick={handleUploadClick}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <p className="text-gray-500">Click to browse or drag and drop</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileInputChange}
                    accept="image/*"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="customize"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="py-8"
              >
                <Settings className="w-16 h-16 mx-auto mb-6 text-[#ff6b35]" />
                <h3 className="text-3xl mb-8 text-center text-white">Customize Your Print</h3>
                
                {/* Two Column Layout: Options + Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Configuration Options */}
                  <div className="space-y-6">
                    <div>
                      <label className="block mb-3 text-gray-300">Canvas Orientation</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setOrientation('landscape')}
                        className={`py-2 px-3 border-2 rounded-lg transition-colors flex items-center gap-2 text-xs ${
                          orientation === 'landscape' 
                            ? 'border-[#ff6b35] bg-[#ff6b35] text-black' 
                            : 'border-[#2a2a2a] text-gray-300 hover:border-[#ff6b35]'
                        }`}
                      >
                        <div className="w-6 h-4 border border-current rounded" />
                        <span>Landscape</span>
                      </button>
                      <button 
                        onClick={() => setOrientation('portrait')}
                        className={`py-2 px-3 border-2 rounded-lg transition-colors flex items-center gap-2 text-xs ${
                          orientation === 'portrait' 
                            ? 'border-[#ff6b35] bg-[#ff6b35] text-black' 
                            : 'border-[#2a2a2a] text-gray-300 hover:border-[#ff6b35]'
                        }`}
                      >
                        <div className="w-4 h-6 border border-current rounded" />
                        <span>Portrait</span>
                      </button>
                    </div>
                    </div>

                    <div>
                      <label className="block mb-3 text-gray-300">Size</label>
                      {!isAvailable(config.size) && (
                        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-sm text-red-500 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>This size is currently out of stock. Please select a different size.</span>
                        </div>
                      )}
                      {(() => {
                        const anySizeOutOfStock = availableSizes.some(size => size.quantity === 0);
                        return anySizeOutOfStock && (
                          <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/50 rounded-lg text-sm text-amber-500 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>Custom sizes are temporarily unavailable. Please select from available standard sizes.</span>
                          </div>
                        );
                      })()}
                      <select 
                      value={isCustomSize ? 'Custom Size' : config.size}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'Custom Size') {
                          // Check if ANY size is out of stock - prevent custom sizes if so
                          const anySizeOutOfStock = availableSizes.some(size => size.quantity === 0);
                          if (anySizeOutOfStock) {
                            // Don't allow switching to custom size if any size is out of stock
                            return;
                          }
                          setIsCustomSize(true);
                        } else {
                          setIsCustomSize(false);
                          // Clean and trim the size value
                          const cleanedValue = value.trim();
                          // Check if new size is sample size or smaller
                          const newSizeSquareInches = getSizeInSquareInches(cleanedValue);
                          if (newSizeSquareInches <= 35) {
                            // Reset mount and frame for sample sizes
                            setConfig({ ...config, size: cleanedValue, mountType: 'Stick Tape', frame: 'None' });
                          } else {
                            setConfig({ ...config, size: cleanedValue });
                          }
                        }
                      }}
                      className="w-full py-3 px-4 border-2 border-[#2a2a2a] bg-[#0a0a0a] text-gray-300 rounded-lg focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300 [data-theme='light']_&:text-black"
                    >
                      {availableSizes.map((size) => {
                        const displayName = size.name.trim().replace(' x ', ' × ');
                        const outOfStock = size.quantity === 0;
                        return (
                          <option 
                            key={size.id} 
                            value={displayName}
                            disabled={outOfStock}
                          >
                            {outOfStock ? `${displayName} - OUT OF STOCK` : displayName}
                          </option>
                        );
                      })}
                      {(() => {
                        // Check if ANY size is out of stock - if so, disable custom sizes too
                        const anySizeOutOfStock = availableSizes.some(size => size.quantity === 0);
                        return (
                          <option disabled={anySizeOutOfStock}>
                            {anySizeOutOfStock ? 'Custom Size - OUT OF STOCK' : 'Custom Size'}
                          </option>
                        );
                      })()}
                    </select>
                    
                    {/* Custom Size Inputs */}
                    <AnimatePresence>
                      {isCustomSize && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 space-y-3"
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block mb-2 text-sm text-gray-400">Width (inches)</label>
                              <input
                                type="number"
                                placeholder="e.g., 18"
                                value={customSize.width}
                                onChange={(e) => {
                                  setCustomSize({ ...customSize, width: e.target.value });
                                  if (e.target.value && customSize.height) {
                                    setConfig({ ...config, size: `${e.target.value}" × ${customSize.height}"` });
                                  }
                                }}
                                className="w-full py-2 px-3 border-2 border-[#ff6b35]/30 bg-[#0a0a0a] text-white rounded-lg focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300 [data-theme='light']_&:text-black"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block mb-2 text-sm text-gray-400">Height (inches)</label>
                              <input
                                type="number"
                                placeholder="e.g., 24"
                                value={customSize.height}
                                onChange={(e) => {
                                  setCustomSize({ ...customSize, height: e.target.value });
                                  if (customSize.width && e.target.value) {
                                    setConfig({ ...config, size: `${customSize.width}" × ${e.target.value}"` });
                                  }
                                }}
                                className="w-full py-2 px-3 border-2 border-[#ff6b35]/30 bg-[#0a0a0a] text-white rounded-lg focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300 [data-theme='light']_&:text-black"
                                min="1"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Maximum size: 48" × 96"
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <label className="text-gray-300">Finish</label>
                        <div className="relative group">
                          <Info className="w-4 h-4 text-gray-500 cursor-help" />
                          <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <p><strong>Gloss:</strong> Vibrant colors, reflective surface</p>
                            <p className="mt-1"><strong>Matte:</strong> Subtle, non-reflective finish</p>
                          </div>
                        </div>
                      </div>
                      {!isAvailable(config.finish) && (
                        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-sm text-red-500 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>This finish is currently out of stock. Please select a different finish.</span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => isAvailable('Gloss') && setConfig({ ...config, finish: 'Gloss' })}
                          disabled={!isAvailable('Gloss')}
                          className={`py-3 px-4 border-2 rounded-lg transition-colors relative ${
                            config.finish === 'Gloss' 
                              ? 'border-[#ff6b35] bg-[#ff6b35] text-black' 
                              : !isAvailable('Gloss')
                              ? 'border-[#2a2a2a] text-gray-600 cursor-not-allowed opacity-40'
                              : 'border-[#2a2a2a] text-gray-300 hover:border-[#ff6b35]'
                          }`}
                        >
                          Gloss
                          {!isAvailable('Gloss') && (
                            <span className="block text-xs mt-1 text-red-500">Out of Stock</span>
                          )}
                          {isAvailable('Gloss') && isLowStock('Gloss') && (
                            <span className="block text-xs mt-1 text-yellow-500">Low Stock</span>
                          )}
                        </button>
                        <button 
                          onClick={() => isAvailable('Matte') && setConfig({ ...config, finish: 'Matte' })}
                          disabled={!isAvailable('Matte')}
                          className={`py-3 px-4 border-2 rounded-lg transition-colors relative ${
                            config.finish === 'Matte' 
                              ? 'border-[#ff6b35] bg-[#ff6b35] text-black' 
                              : !isAvailable('Matte')
                              ? 'border-[#2a2a2a] text-gray-600 cursor-not-allowed opacity-40'
                              : 'border-[#2a2a2a] text-gray-300 hover:border-[#ff6b35]'
                          }`}
                        >
                          Matte
                          {!isAvailable('Matte') && (
                            <span className="block text-xs mt-1 text-red-500">Out of Stock</span>
                          )}
                          {isAvailable('Matte') && isLowStock('Matte') && (
                            <span className="block text-xs mt-1 text-yellow-500">Low Stock</span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-3 text-gray-300">Mount Type</label>
                    {isSampleSize && (
                      <p className="text-xs text-white mb-2 [data-theme='dark']_&:text-yellow-500">Sample size does not include mount options</p>
                    )}
                    {!isAvailable(config.mountType) && !isSampleSize && (
                      <div className="mb-3 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-sm text-red-500 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>This mount type is currently out of stock. Please select a different mount type.</span>
                      </div>
                    )}
                    <select 
                      value={config.mountType}
                      onChange={(e) => setConfig({ ...config, mountType: e.target.value })}
                      disabled={isSampleSize}
                      className={`w-full py-3 px-4 border-2 border-[#2a2a2a] bg-[#0a0a0a] text-gray-300 rounded-lg focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300 [data-theme='light']_&:text-black ${isSampleSize ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="Stick Tape" disabled={!isAvailable('Stick Tape')}>
                        Stick Tape (Free){!isAvailable('Stick Tape') ? ' - OUT OF STOCK' : isLowStock('Stick Tape') ? ' - Low Stock' : ''}
                      </option>
                      <option value="Float Mount" disabled={!isAvailable('Float Mount')}>
                        Float Mount{!isAvailable('Float Mount') ? ' - OUT OF STOCK' : isLowStock('Float Mount') ? ' - Low Stock' : ''}
                      </option>
                      <option value="3D Magnet" disabled={!isAvailable('3D Magnet')}>
                        3D Magnet{!isAvailable('3D Magnet') ? ' - OUT OF STOCK' : isLowStock('3D Magnet') ? ' - Low Stock' : ''}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-3 text-gray-300">Frame</label>
                    {isSampleSize && (
                      <p className="text-xs text-white mb-2 [data-theme='dark']_&:text-yellow-500">Sample size does not include frame options</p>
                    )}
                    {!isAvailable(config.frame) && config.frame !== 'None' && !isSampleSize && (
                      <div className="mb-3 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-sm text-red-500 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>This frame is currently out of stock. Please select a different frame.</span>
                      </div>
                    )}
                    <select 
                      value={config.frame}
                      onChange={(e) => setConfig({ ...config, frame: e.target.value })}
                      disabled={isSampleSize}
                      className={`w-full py-3 px-4 border-2 border-[#2a2a2a] bg-[#0a0a0a] text-gray-300 rounded-lg focus:border-[#ff6b35] outline-none [data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-300 [data-theme='light']_&:text-black ${isSampleSize ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="None">None</option>
                      <option value="Black" disabled={!isAvailable('Black')}>
                        Black{!isAvailable('Black') ? ' - OUT OF STOCK' : isLowStock('Black') ? ' - Low Stock' : ''}
                      </option>
                      <option value="Gold" disabled={!isAvailable('Gold')}>
                        Gold{!isAvailable('Gold') ? ' - OUT OF STOCK' : isLowStock('Gold') ? ' - Low Stock' : ''}
                      </option>
                      <option value="Natural Wood" disabled={!isAvailable('Natural Wood')}>
                        Natural Wood{!isAvailable('Natural Wood') ? ' - OUT OF STOCK' : isLowStock('Natural Wood') ? ' - Low Stock' : ''}
                      </option>
                    </select>
                  </div>
                  
                  {/* Rush Order Option - Spans full width on desktop */}
                  <div className="md:col-span-2">
                    <label className="block mb-3 text-gray-300">Production Speed</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button 
                        onClick={() => setConfig({ ...config, rushOrder: false })}
                        className={`py-4 px-4 border-2 rounded-lg transition-colors text-left ${
                          !config.rushOrder 
                            ? 'border-[#ff6b35] bg-[#ff6b35] text-black' 
                            : 'border-[#2a2a2a] text-gray-300 hover:border-[#ff6b35]'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">Standard Production</span>
                          <span className="text-xs mt-1 opacity-80">Ships in 5-7 business days</span>
                        </div>
                      </button>
                      <button 
                        onClick={() => setConfig({ ...config, rushOrder: true })}
                        className={`py-4 px-4 border-2 rounded-lg transition-colors text-left ${
                          config.rushOrder 
                            ? 'border-[#ff6b35] bg-[#ff6b35] text-black' 
                            : 'border-[#2a2a2a] text-gray-300 hover:border-[#ff6b35]'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">Rush Order <span className="text-xs">+$89</span></span>
                          <span className="text-xs mt-1 opacity-80">Ships next business day with overnight delivery</span>
                        </div>
                      </button>
                    </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Preview */}
                  <div className="space-y-4">
                    {config.image ? (
                      <>
                        {/* Hide crop instructions on mobile */}
                        {!isMobile && (
                          <div className="text-center">
                            <h4 className="text-white mb-2">Crop Your Image</h4>
                            <p className="text-gray-400 text-sm">Drag the image and use controls to adjust the crop area</p>
                          </div>
                        )}
                        
                        {/* Mobile-specific instructions */}
                        {isMobile && (
                          <div className="text-center">
                            <h4 className="text-white mb-2">Preview Your Print</h4>
                            <p className="text-gray-400 text-sm">Full image will be printed automatically</p>
                          </div>
                        )}

                        {/* Enhanced Image Edit Controls */}
                        <div className="space-y-3">
                          {/* Image Quality Warning */}
                          {imageQuality && imageQuality !== 'excellent' && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex items-start gap-2 p-3 rounded-lg border ${
                                imageQuality === 'poor' 
                                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                                  : imageQuality === 'fair'
                                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                              }`}
                            >
                              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-semibold mb-1">
                                  {imageQuality === 'poor' 
                                    ? 'Low Image Quality' 
                                    : imageQuality === 'fair'
                                    ? 'Moderate Image Quality'
                                    : 'Good Image Quality'}
                                </p>
                                <p className="text-xs opacity-80">
                                  {imageQuality === 'poor'
                                    ? 'Your image may appear pixelated at this size. Consider a smaller size or higher resolution image.'
                                    : imageQuality === 'fair'
                                    ? 'Your image quality is acceptable but may not be optimal. Consider a smaller size for best results.'
                                    : 'Your image quality is good for this size.'}
                                </p>
                              </div>
                            </motion.div>
                          )}
                          
                          {/* Quick Actions Row */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={undo}
                                disabled={historyIndex <= 0}
                                className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Undo (Cmd/Ctrl+Z)"
                              >
                                <Undo2 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={redo}
                                disabled={historyIndex >= transformHistory.length - 1}
                                className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Redo (Cmd/Ctrl+Shift+Z)"
                              >
                                <Redo2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowKeyboardShortcuts(true)}
                              className="p-2 bg-[#2a2a2a] text-gray-400 rounded-lg hover:bg-[#3a3a3a] hover:text-white transition-colors"
                              title="Keyboard Shortcuts (?)"
                            >
                              <Keyboard className="w-4 h-4" />
                            </motion.button>
                          </div>
                          
                          {/* Quick Presets */}
                          <div className="flex gap-2 mb-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={fitToPage}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#ff6b35] hover:text-black transition-colors text-sm"
                              title="Fit image to canvas (F)"
                            >
                              <Maximize className="w-4 h-4" />
                              <span>Fit</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={fillCanvas}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#ff6b35] hover:text-black transition-colors text-sm"
                              title="Fill canvas with image"
                            >
                              <Minimize className="w-4 h-4" />
                              <span>Fill</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={centerImage}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#ff6b35] hover:text-black transition-colors text-sm"
                              title="Center crop box (C)"
                            >
                              <Move className="w-4 h-4" />
                              <span>Center</span>
                            </motion.button>
                          </div>
                          
                          {/* Main Editing Tools */}
                          <div className="flex flex-wrap justify-center gap-2 p-4 bg-[#0a0a0a] rounded-xl border border-[#ff6b35]/20">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={zoomIn}
                              className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors"
                              title="Zoom In (+)"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={zoomOut}
                              className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors"
                              title="Zoom Out (-)"
                            >
                              <ZoomOut className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={rotateLeft}
                              className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors"
                              title="Rotate Left (L)"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={rotateRight}
                              className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors"
                              title="Rotate Right (R)"
                            >
                              <RotateCw className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={flipHorizontal}
                              className={`p-2 rounded-lg transition-colors ${
                                imageTransform.flipX ? 'bg-[#ff6b35] text-black' : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
                              }`}
                              title="Flip Horizontal"
                            >
                              <FlipHorizontal2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={flipVertical}
                              className={`p-2 rounded-lg transition-colors ${
                                imageTransform.flipY ? 'bg-[#ff6b35] text-black' : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
                              }`}
                              title="Flip Vertical"
                            >
                              <FlipVertical2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={resetTransform}
                              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                              title="Reset All"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>Reset</span>
                            </motion.button>
                          </div>
                        </div>

                        {/* Drag to Reposition Info Banner */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm"
                        >
                          <Move className="w-4 h-4 flex-shrink-0" />
                          <p>
                            <span className="font-semibold">Drag the image</span> to reposition within the canvas when zoomed
                          </p>
                        </motion.div>

                        {/* Interactive Preview Canvas */}
                        <div 
                          className="relative bg-[#0a0a0a] rounded-2xl p-8 flex items-center justify-center border border-[#ff6b35]/20 min-h-[400px]"
                        >
                          {(() => {
                            const dimensions = config.size.match(/(\d+\.?\d*)\s*["\"]\s*×\s*(\d+\.?\d*)/);
                            let width = dimensions ? parseFloat(dimensions[1]) : 12;
                            let height = dimensions ? parseFloat(dimensions[2]) : 8;
                            
                            if (orientation === 'portrait' && width > height) {
                              [width, height] = [height, width];
                            } else if (orientation === 'landscape' && height > width) {
                              [width, height] = [height, width];
                            }
                            
                            const cropAspectRatio = width / height;
                            const maxSize = 400;
                            let cropWidth, cropHeight;
                            
                            if (cropAspectRatio > 1) {
                              cropWidth = maxSize;
                              cropHeight = maxSize / cropAspectRatio;
                            } else {
                              cropHeight = maxSize;
                              cropWidth = maxSize * cropAspectRatio;
                            }
                            
                            // Note: Frame is not displayed in Step 2 (Customize) because it should only 
                            // show around the final cropped area in Step 3 (Preview), not the full canvas
                            
                            const getMountEffect = () => {
                              switch(config.mountType) {
                                case 'Float Mount':
                                  return 'shadow-2xl shadow-black/50';
                                case '3D Magnet':
                                  return 'shadow-2xl shadow-black/70';
                                default:
                                  return '';
                              }
                            };
                            
                            // Convert crop box percentages to pixels
                            const cropBox = {
                              x: (cropBoxPercent.x / 100) * cropWidth,
                              y: (cropBoxPercent.y / 100) * cropHeight,
                              width: (cropBoxPercent.width / 100) * cropWidth,
                              height: (cropBoxPercent.height / 100) * cropHeight,
                            };
                            
                            return (
                              <div
                                className={`relative bg-[#1a1a1a] rounded-lg overflow-hidden ${getMountEffect()}`}
                                data-crop-canvas
                                style={{
                                  width: `${cropWidth}px`,
                                  height: `${cropHeight}px`,
                                }}
                              >
                                <div
                                  className="w-full h-full overflow-hidden"
                                  style={{
                                    cursor: isDraggingImage ? 'grabbing' : 'grab',
                                    touchAction: 'none',
                                  }}
                                >
                                  <img 
                                    src={config.image} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover select-none"
                                    draggable={false}
                                    onMouseDown={handleImageMouseDown}
                                    onTouchStart={handleImageTouchStart}
                                    style={{
                                      filter: config.finish === 'Matte' ? 'contrast(0.95)' : 'contrast(1.05) saturate(1.1)',
                                      transform: `translate(${imageTransform.x}px, ${imageTransform.y}px) scale(${imageTransform.scale}) rotate(${imageTransform.rotation}deg) scaleX(${imageTransform.flipX ? -1 : 1}) scaleY(${imageTransform.flipY ? -1 : 1})`,
                                      transformOrigin: 'center center',
                                      transition: isDraggingImage ? 'none' : 'transform 0.2s ease-out',
                                      touchAction: 'none',
                                    }}
                                  />
                                </div>
                                
                                {config.finish === 'Gloss' && (
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Transform Info */}
                        <div className="text-center space-y-2">
                          <div className="text-xs text-gray-500">
                            💡 Drag to reposition • Use zoom and rotation controls {isMobile ? 'above' : 'below'}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 border-2 border-dashed border-[#ff6b35]/30 rounded-xl">
                        <ImageIcon className="w-16 h-16 mb-4 text-gray-600" />
                        <p className="text-gray-500">Upload an image in Step 1 to preview</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Step Navigation Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#ff6b35]/20">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToPreviousStep}
                    className="flex items-center gap-2 px-6 py-3 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Back</span>
                  </motion.button>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowPriceBreakdown(true)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-[#ff6b35] transition-colors"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">View Price Breakdown</span>
                    </button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={goToNextStep}
                      disabled={!config.image || isGeneratingCrop || !allItemsInStock()}
                      className="flex items-center gap-2 px-8 py-3 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!allItemsInStock() ? 'Some items are out of stock' : ''}
                    >
                      <span>{isGeneratingCrop ? 'Generating Preview...' : !allItemsInStock() ? 'Items Out of Stock' : 'Continue to Proof'}</span>
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
key="proof" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center py-8" >

Review Your Proof
This is how your final print will look. Ready to proceed to checkout?

            {/* Visual Proof Preview */}
            <div className="max-w-4xl mx-auto">
              {(() => {
                // Parse dimensions from config.size
                const dimensions = config.size.match(/(\d+\.?\d*)\s*[""]\s*×\s*(\d+\.?\d*)/);
                let width = dimensions ? parseFloat(dimensions[1]) : 12;
                let height = dimensions ? parseFloat(dimensions[2]) : 8;
                
                // Apply orientation
                if (orientation === 'portrait' && width > height) {
                  [width, height] = [height, width];
                } else if (orientation === 'landscape' && height > width) {
                  [width, height] = [height, width];
                }
                
                const cropAspectRatio = width / height;
                
                // Fixed canvas size for consistent display
                const canvasWidth = 600;
                const canvasHeight = 600;
                
                // Calculate crop box size to fit within canvas
                let cropWidth, cropHeight;
                if (cropAspectRatio > 1) {
                  // Landscape
                  cropWidth = canvasWidth * 0.6; // 60% of canvas
                  cropHeight = cropWidth / cropAspectRatio;
                } else {
                  // Portrait
                  cropHeight = canvasHeight * 0.6;
                  cropWidth = cropHeight * cropAspectRatio;
                }
                
                // Frame styling
                const getFrameStyle = () => {
                  switch(config.frame) {
                    case 'Black':
                      return 'border-[20px] border-black shadow-2xl';
                    case 'Gold':
                      return 'border-[20px] border-[#d4af37] shadow-2xl shadow-[#d4af37]/30';
                    case 'Natural Wood':
                      return 'border-[20px] border-[#8b6f47] shadow-2xl';
                    default:
                      return 'border-2 border-[#ff6b35]/20';
                  }
                };
                
                // Mount styling
                const getMountEffect = () => {
                  switch(config.mountType) {
                    case 'Float Mount':
                      return 'shadow-2xl shadow-black/50';
                    case '3D Magnet':
                      return 'shadow-2xl shadow-black/70';
                    default:
                      return '';
                  }
                };
                
                // Finish effect
                const getFinishEffect = () => {
                  return config.finish === 'Gloss' 
                    ? 'after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/20 after:to-transparent after:pointer-events-none' 
                    : '';
                };
                
                // Calculate best-fit size suggestion
                const bestFit = calculateBestFitSize();
                const showSuggestion = bestFit && bestFit.size !== config.size;
                
                // Calculate suggested size dimensions for ghost preview
                let suggestedWidth = 0, suggestedHeight = 0;
                if (showSuggestion) {
                  const suggestedDimensions = bestFit.size.match(/(\d+\.?\d*)\s*["\"]?\s*[x×]\s*(\d+\.?\d*)/i);
                  if (suggestedDimensions) {
                    suggestedWidth = parseFloat(suggestedDimensions[1]);
                    suggestedHeight = parseFloat(suggestedDimensions[2]);
                    
                    // Apply suggested orientation
                    if (bestFit.orientation === 'portrait' && suggestedWidth > suggestedHeight) {
                      [suggestedWidth, suggestedHeight] = [suggestedHeight, suggestedWidth];
                    } else if (bestFit.orientation === 'landscape' && suggestedHeight > suggestedWidth) {
                      [suggestedWidth, suggestedHeight] = [suggestedHeight, suggestedWidth];
                    }
                  }
                }
                
                // Calculate suggested crop dimensions
                let suggestedCropWidth = 0, suggestedCropHeight = 0;
                if (showSuggestion && suggestedWidth && suggestedHeight) {
                  const suggestedAspectRatio = suggestedWidth / suggestedHeight;
                  if (suggestedAspectRatio > 1) {
                    suggestedCropWidth = canvasWidth * 0.7; // Slightly larger than current
                    suggestedCropHeight = suggestedCropWidth / suggestedAspectRatio;
                  } else {
                    suggestedCropHeight = canvasHeight * 0.7;
                    suggestedCropWidth = suggestedCropHeight * suggestedAspectRatio;
                  }
                }
                
                return (
                  <div className="flex flex-col items-center gap-4">
                    {/* Dimensions Display */}
                    <div className="text-gray-400 text-sm mb-2">
                      <span className="text-[#ff6b35]">{config.size}</span> • {config.finish} Finish • {config.mountType} • Frame: {config.frame}
                    </div>
                    
                    {/* Best Fit Suggestion */}
                    {showSuggestion && (() => {
                      const anySizeOutOfStock = availableSizes.some(size => size.quantity === 0);
                      return (
                        <div className="bg-[#1a1a1a] border border-[#ff6b35]/30 rounded-lg px-4 py-3 text-sm">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <span className="text-gray-400">💡 Suggested custom size for perfect fit: </span>
                              <span className="text-[#ff6b35] font-medium">{bestFit.size}</span>
                              <span className="text-gray-500"> ({bestFit.orientation})</span>
                            </div>
                            <button
                              onClick={() => {
                                // Check if ANY size is out of stock - prevent custom sizes if so
                                if (anySizeOutOfStock) {
                                  // Don't allow switching to custom size if any size is out of stock
                                  return;
                                }
                                // Set as custom size
                                setIsCustomSize(true);
                                setCustomSize({
                                  width: bestFit.width.toString(),
                                  height: bestFit.height.toString()
                                });
                                setConfig(prev => ({
                                  ...prev,
                                  size: bestFit.size
                                }));
                              }}
                              disabled={anySizeOutOfStock}
                              className="px-4 py-1.5 bg-[#ff6b35] text-black rounded-md hover:bg-[#ff8c42] transition-all text-xs font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#ff6b35]"
                            >
                              Use This Size
                            </button>
                          </div>
                          {anySizeOutOfStock && (
                            <div className="mt-2 text-xs text-amber-500">
                              Custom sizes unavailable due to material shortage
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    
                    {/* Print Preview */}
                    <div 
                      className="relative bg-[#0a0a0a] rounded-2xl p-12 inline-flex items-center justify-center"
                      style={{
                        // Add extra space for float mount effect
                        padding: config.mountType === 'Float Mount' ? '80px' : '60px'
                      }}
                    >
                      {/* Ghost preview of suggested size */}
                      {showSuggestion && suggestedCropWidth > 0 && (
                        <div
                          className="absolute bg-[#ff6b35]/10 rounded-lg border-2 border-dashed border-[#ff6b35]/30"
                          style={{
                            width: `${suggestedCropWidth}px`,
                            height: `${suggestedCropHeight}px`,
                            pointerEvents: 'none',
                          }}
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-[#ff6b35]/70 whitespace-nowrap">
                            Suggested: {bestFit.size}
                          </div>
                        </div>
                      )}
                      <div
                        className={`relative bg-[#1a1a1a] rounded-lg overflow-hidden ${getFrameStyle()} ${getMountEffect()} ${getFinishEffect()}`}
                        style={{
                          width: `${cropWidth}px`,
                          height: `${cropHeight}px`,
                          transform: config.mountType === 'Float Mount' ? 'translateZ(20px)' : 'none',
                        }}
                      >
                        {croppedImageUrl ? (
                          <>
                            <div className="w-full h-full overflow-hidden">
                              <img 
                                src={croppedImageUrl} 
                                alt="Final Preview" 
                                className="w-full h-full object-cover"
                                style={{
                                  filter: config.finish === 'Matte' ? 'contrast(0.95)' : 'contrast(1.05) saturate(1.1)',
                                }}
                              />
                            </div>
                            {/* Gloss effect overlay */}
                            {config.finish === 'Gloss' && (
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                            )}
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                            <ImageIcon className="w-16 h-16 mb-4 text-gray-600" />
                            <p className="text-gray-600">No image uploaded yet</p>
                            <p className="text-gray-700 text-sm mt-2">Go back to Upload step</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Float Mount Shadow Effect */}
                      {config.mountType === 'Float Mount' && (
                        <div 
                          className="absolute bg-black/30 blur-xl rounded-lg -z-10"
                          style={{
                            width: `${cropWidth}px`,
                            height: `${cropHeight}px`,
                            bottom: '40px',
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Configuration Summary */}
                    <div className="mt-6 p-6 bg-[#0a0a0a] rounded-xl border border-[#ff6b35]/20 max-w-md">
                      <h4 className="text-white mb-4">Print Specifications</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-gray-400">Dimensions:</div>
                        <div className="text-white">{config.size}</div>
                        
                        <div className="text-gray-400">Finish:</div>
                        <div className="text-white">{config.finish}</div>
                        
                        <div className="text-gray-400">Mount:</div>
                        <div className="text-white">{config.mountType}</div>
                        
                        <div className="text-gray-400">Frame:</div>
                        <div className="text-white">{config.frame}</div>
                        
                        <div className="text-gray-400">Aspect Ratio:</div>
                        <div className="text-white">{cropAspectRatio.toFixed(2)}:1</div>

                        <div className="text-gray-400">Zoom:</div>
                        <div className="text-white">{(imageTransform.scale * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            {/* Step Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-8 pt-6 border-t border-[#ff6b35]/30 gap-4">
              <div className="flex gap-3 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goToPreviousStep}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl border border-gray-600/50"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="font-medium">Back to Customize</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetConfigurator}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 rounded-xl hover:from-gray-700 hover:to-gray-800 hover:text-white transition-all shadow-lg hover:shadow-xl border border-gray-700/50"
                  title="Start a new print from scratch"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span className="font-medium">Start New Print</span>
                </motion.button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:flex-1 sm:justify-end">
                <motion.button
                  whileHover={!isGeneratingCrop && !allItemsInStock() ? {} : { scale: 1.02, y: -2, boxShadow: '0 12px 24px rgba(255, 107, 53, 0.25)' }}
                  whileTap={!isGeneratingCrop && !allItemsInStock() ? {} : { scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={!allItemsInStock() || isGeneratingCrop}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#ff6b35] border-2 border-[#ff6b35] rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold"
                  title="Add to cart and continue shopping"
                >
                  {isGeneratingCrop ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={!isGeneratingCrop && !allItemsInStock() ? {} : { scale: 1.02, y: -2, boxShadow: '0 20px 40px rgba(255, 107, 53, 0.4)' }}
                  whileTap={!isGeneratingCrop && !allItemsInStock() ? {} : { scale: 0.98 }}
                  onClick={handleCheckoutClick}
                  disabled={!allItemsInStock() || isGeneratingCrop}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white rounded-xl hover:from-[#ff8555] hover:to-[#ffa066] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#ff6b35]/30 font-semibold text-lg"
                >
                  {isGeneratingCrop ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span>Preparing...</span>
                    </>
                  ) : (
                    <>
                      <span>Checkout Now</span>
                      <ChevronRight className="w-6 h-6" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center py-16"
          >
            <ShoppingCart className="w-16 h-16 mx-auto mb-6 text-[#ff6b35]" />
            <h3 className="text-3xl mb-4 text-white">Complete Your Order</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Review your order details and proceed to secure checkout.
            </p>
            <div className="bg-[#0a0a0a] rounded-xl p-8 max-w-md mx-auto mb-8 border border-[#ff6b35]/20">
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white">{config.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Finish:</span>
                  <span className="text-white">{config.finish}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mount:</span>
                  <span className="text-white">{config.mountType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Frame:</span>
                  <span className="text-white">{config.frame}</span>
                </div>
                <div className="border-t border-[#ff6b35]/30 pt-3 mt-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-white">Product Total:</span>
                    <span className="text-[#ff6b35]">${basePrice.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-400 text-right">+ Shipping calculated at checkout</p>
                </div>
              </div>
            </div>
            {!allItemsInStock() && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">Items Out of Stock</span>
                </div>
                <p className="text-sm">Some items in your configuration are out of stock. Please go back and update your selection.</p>
              </div>
            )}
            <div className="flex gap-4 justify-center flex-wrap">
              <button 
                onClick={handleAddToCart}
                disabled={!allItemsInStock() || isGeneratingCrop}
                className="px-8 py-4 bg-white text-[#ff6b35] border-2 border-[#ff6b35] rounded-full hover:bg-[#ff6b35] hover:text-white transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 font-medium"
                title="Add to cart and continue shopping"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
              <button 
                onClick={handleCheckoutClick}
                disabled={!allItemsInStock() || isGeneratingCrop}
                className="px-12 py-4 bg-[#ff6b35] text-black rounded-full hover:bg-[#ff8c42] transition-all hover:scale-105 shadow-lg shadow-[#ff6b35]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 font-medium"
                title={!allItemsInStock() ? 'Some items are out of stock' : ''}
              >
                {isGeneratingCrop ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Preparing...</span>
                  </>
                ) : !allItemsInStock() ? (
                  'Items Out of Stock'
                ) : (
                  'Buy Now'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </div>

  {/* Checkout Modal */}
  <AnimatePresence>
    {showCheckout && (
      <CheckoutPage
        orderDetails={{
          ...config,
          image: croppedImageUrl || config.image, // Use cropped image if available
        }}
        basePrice={basePrice || 49.99}
        onClose={() => setShowCheckout(false)}
        onComplete={() => {
          // Don't close checkout immediately - OrderConfirmation needs to stay visible
          // The timer will trigger the reset after 7 seconds
          
          // Wait 7 seconds before closing and resetting to give user time to see confirmation
          setTimeout(() => {
            // Close checkout modal
            setShowCheckout(false);
            
            // Reset configurator after successful checkout
            setConfig({
              finish: 'Matte',
              size: '12" × 8"',
              mountType: 'Stick Tape',
              frame: 'None',
              image: null,
              rushOrder: false,
            });
            setCurrentStep(1);
            setCompletedSteps([]); // Reset completed steps
            setImageTransform({
              scale: 1,
              x: 0,
              y: 0,
              rotation: 0,
              flipX: false,
              flipY: false,
            });
            setCroppedImageUrl(null);
            // Reset crop box with proportional aspect ratio
            const aspectRatio = getSizeAspectRatio('12" × 8"');
            const proportionalCropBox = calculateProportionalCropBox(aspectRatio);
            setCropBoxPercent(proportionalCropBox);
          }, 7000); // Give 7 seconds to see the confirmation before reset
        }}
      />
    )}
  </AnimatePresence>

  {/* Authentication Modal */}
  <AnimatePresence>
    {showAuthModal && (
      <AuthModal
        onClose={() => setShowAuthModal(false)}
      />
    )}
  </AnimatePresence>

  {/* UX Enhancement Modals */}
  <KeyboardShortcutsModal
    isOpen={showKeyboardShortcuts}
    onClose={() => setShowKeyboardShortcuts(false)}
  />

  <PriceBreakdownModal
    isOpen={showPriceBreakdown}
    onClose={() => setShowPriceBreakdown(false)}
    config={config}
    totalPrice={basePrice}
    inventory={inventory}
  />

  <RemoveImageConfirmModal
    isOpen={showRemoveConfirm}
    onClose={() => setShowRemoveConfirm(false)}
    onConfirm={confirmRemoveImage}
  />

  {/* Toast Notifications */}
  <AnimatePresence>
    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        action={toast.action}
        onClose={() => setToast(null)}
      />
    )}
  </AnimatePresence>

  {/* Success Confetti */}
  <AnimatePresence>
    {showConfetti && <SuccessConfetti />}
  </AnimatePresence>
</section>
); }