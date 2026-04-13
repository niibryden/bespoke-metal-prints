import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  image: string;
  size: string;
  finish: string;
  mountType: string;
  frame: string;
  rushOrder: boolean;
  price: number;
  thumbnail?: string;
  addedAt: number;
  marketplacePhotoId?: string; // Track marketplace photos for royalty payments
  quantity?: number; // Track quantity for multi-item orders
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bespoke-cart');
      if (saved) {
        try {
          const parsedItems = JSON.parse(saved);
          console.log(`📦 Loaded ${parsedItems.length} items from cart (${(saved.length / 1024).toFixed(2)} KB)`);
          return parsedItems;
        } catch (e) {
          console.error('❌ Failed to parse cart from localStorage:', e);
          // Clear corrupted data
          localStorage.removeItem('bespoke-cart');
        }
      }
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Create a lightweight version of cart items for storage
        // Remove duplicate thumbnail field to save space
        const lightweightItems = items.map(item => {
          const { thumbnail, ...rest } = item;
          return rest; // Only save image (which should already be a thumbnail)
        });
        
        const cartData = JSON.stringify(lightweightItems);
        const cartSizeKB = (cartData.length / 1024).toFixed(2);
        
        localStorage.setItem('bespoke-cart', cartData);
        console.log(`💾 Cart saved to localStorage: ${items.length} items (${cartSizeKB} KB)`);
      } catch (e: any) {
        if (e.name === 'QuotaExceededError') {
          console.error('⚠️ localStorage quota exceeded. Clearing old cart data...');
          // Clear cart from localStorage if quota exceeded
          localStorage.removeItem('bespoke-cart');
          // Try again with empty cart
          try {
            localStorage.setItem('bespoke-cart', JSON.stringify([]));
            console.log('✅ Cart cleared and reset due to quota exceeded');
          } catch (e2) {
            console.error('❌ Failed to save cart even after clearing:', e2);
          }
        } else {
          console.error('❌ Failed to save cart to localStorage:', e);
        }
      }
    }
  }, [items]);

  const addItem = (item: Omit<CartItem, 'id' | 'addedAt'>) => {
    const newItem: CartItem = {
      ...item,
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      addedAt: Date.now(),
    };
    
    setItems((prev) => {
      const updatedItems = [...prev, newItem];
      
      // Warn if cart is getting large (>20 items)
      if (updatedItems.length > 20) {
        console.warn(`⚠️ Cart has ${updatedItems.length} items. Consider checking out to avoid storage issues.`);
      }
      
      return updatedItems;
    });
    
    console.log('✅ Item added to cart:', {
      id: newItem.id,
      size: newItem.size,
      price: newItem.price,
      hasImage: !!newItem.image,
      hasThumbnail: !!newItem.thumbnail,
      imageSize: newItem.image ? `${(newItem.image.length / 1024).toFixed(2)} KB` : 'N/A',
      thumbnailSize: newItem.thumbnail ? `${(newItem.thumbnail.length / 1024).toFixed(2)} KB` : 'N/A',
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    console.log('Item removed from cart:', id);
  };

  const updateItem = (id: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    console.log('Item updated in cart:', id, updates);
  };

  const clearCart = () => {
    setItems([]);
    console.log('Cart cleared');
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const getItemCount = () => {
    return items.length;
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateItem,
    clearCart,
    getTotalPrice,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}