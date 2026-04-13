import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getServerUrl } from '../utils/serverUrl';

interface InventoryItem {
  id: string;
  category: 'size' | 'frame' | 'mounting' | 'finish';
  name: string;
  sku: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
}

interface InventoryAvailability {
  [sku: string]: {
    available: boolean;
    quantity: number;
    item?: InventoryItem;
  };
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true); // Start as true while fetching
  const [error, setError] = useState<string | null>(null);

  // Fetch inventory on mount for customer-facing pages
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      // Use public inventory endpoint for customer-facing pages
      // ⚠️ CRITICAL: Reads from KV key 'inventory' - same as admin panel
      const url = `${getServerUrl()}/inventory`;
      console.log('📦 Fetching inventory from:', url);
      
      const response = await fetch(
        url,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        console.warn('Inventory fetch failed with status:', response.status);
        console.warn('Response:', await response.text().catch(() => 'Unable to read response'));
        // Don't throw, just use empty inventory
        setInventory([]);
        setError(null); // Don't show error to user
        return;
      }

      const data = await response.json();
      const inventoryItems = data.inventory || [];
      console.log('📦 Inventory loaded:', inventoryItems.length, 'items');
      if (inventoryItems.length > 0) {
        console.log('  First 3 items:', inventoryItems.slice(0, 3).map((item: any) => `${item.name} (qty: ${item.quantity})`));
      }
      setInventory(inventoryItems);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory (non-critical):', err);
      console.error('Server URL:', getServerUrl());
      console.error('Project ID:', projectId);
      // Don't show error to user - just use empty inventory
      setInventory([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Normalize item names for comparison (handles tabs, spaces, quotes, x vs ×)
  const normalizeItemName = (name: string): string => {
    return name.toLowerCase()
      .replace(/[""\u0022\u201c\u201d]/g, '') // Remove all quote types
      .replace(/[×x]/gi, 'x') // Normalize × and x
      .replace(/[\s\t\r\n]+/g, '') // Remove ALL whitespace including tabs
      .trim();
  };

  const checkAvailability = (items: string[]): InventoryAvailability => {
    const availability: InventoryAvailability = {};

    for (const itemName of items) {
      const inventoryItem = inventory.find(
        (item) => normalizeItemName(item.name) === normalizeItemName(itemName)
      );

      if (!inventoryItem) {
        availability[itemName] = { available: true, quantity: 999 }; // Assume available if not in inventory
      } else {
        availability[itemName] = {
          available: inventoryItem.quantity > 0,
          quantity: inventoryItem.quantity,
          item: inventoryItem,
        };
      }
    }

    return availability;
  };

  const isAvailable = (itemName: string): boolean => {
    const normalizedSearch = normalizeItemName(itemName);
    const inventoryItem = inventory.find(
      (item) => normalizeItemName(item.name) === normalizedSearch
    );

    if (!inventoryItem) {
      console.log(`⚠️ Item "${itemName}" not found in inventory (${inventory.length} items loaded) - assuming available`);
      return true; // Assume available if not in inventory
    }
    const available = inventoryItem.quantity > 0;
    console.log(`${available ? '✅' : '❌'} ${itemName}: ${inventoryItem.quantity} in stock`);
    return available;
  };

  const getQuantity = (itemName: string): number => {
    const normalizedSearch = normalizeItemName(itemName);
    const inventoryItem = inventory.find(
      (item) => normalizeItemName(item.name) === normalizedSearch
    );

    return inventoryItem?.quantity || 999;
  };

  const isLowStock = (itemName: string): boolean => {
    const normalizedSearch = normalizeItemName(itemName);
    const inventoryItem = inventory.find(
      (item) => normalizeItemName(item.name) === normalizedSearch
    );

    if (!inventoryItem) return false;
    return inventoryItem.quantity > 0 && inventoryItem.quantity <= inventoryItem.lowStockThreshold;
  };

  return {
    inventory,
    loading,
    error,
    checkAvailability,
    isAvailable,
    getQuantity,
    isLowStock,
    refetch: fetchInventory,
  };
}