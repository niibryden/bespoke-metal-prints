import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Package, AlertTriangle, Save, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getServerUrl } from '../../utils/serverUrl';

interface InventoryItem {
  id: string;
  category: 'size' | 'frame' | 'mounting' | 'finish';
  name: string;
  sku: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
}

export function InventoryManagement({ adminInfo }: { adminInfo?: { email: string; role: string; name: string; permissions: any; accessToken: string } }) {
  // Helper to get auth header with admin access token
  const getAuthHeader = () => `Bearer ${adminInfo?.accessToken || publicAnonKey}`;
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const autoSaveTimerRef = useRef<number | null>(null);

  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    category: 'size',
    name: '',
    sku: '',
    quantity: 0,
    price: 0,
    lowStockThreshold: 10,
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  // Auto-save when inventory changes (debounced)
  useEffect(() => {
    if (hasUnsavedChanges && inventory.length > 0) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // Set new timer for auto-save after 2 seconds of inactivity
      autoSaveTimerRef.current = window.setTimeout(() => {
        console.log('💾 Auto-saving inventory changes...');
        autoSaveInventory();
      }, 2000);
    }
    
    // Cleanup timer on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [inventory, hasUnsavedChanges]);

  const autoSaveInventory = async () => {
    try {
      const response = await fetch(
        `${getServerUrl()}/admin/inventory`,
        {
          method: 'PUT',
          headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inventory }),
        }
      );

      if (response.ok) {
        console.log('✅ Inventory auto-saved successfully');
        setHasUnsavedChanges(false);
        setAutoSaveMessage('✅ Auto-saved');
        setTimeout(() => setAutoSaveMessage(''), 2000);
      }
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch(
        `${getServerUrl()}/admin/inventory`,
        {
          headers: {
            'Authorization': getAuthHeader(),
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch inventory');

      const data = await response.json();
      const fetchedInventory = data.inventory || [];
      
      // If inventory is empty, initialize with default items and save
      if (fetchedInventory.length === 0) {
        console.log('Inventory is empty, initializing with default items...');
        await initializeDefaultInventory();
      } else {
        setInventory(fetchedInventory);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      // Load default inventory items and initialize
      await initializeDefaultInventory();
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultInventory = async () => {
    const defaultInventory: InventoryItem[] = [
      // Sizes - Sample and Standard Sizes
      { id: '0', category: 'size', name: '5" x 7"', sku: 'SIZE-5X7', quantity: 100, price: 25.00, lowStockThreshold: 20 },
      { id: '1', category: 'size', name: '12" x 8"', sku: 'SIZE-12X8', quantity: 150, price: 49.99, lowStockThreshold: 25 },
      { id: '2', category: 'size', name: '17" x 11"', sku: 'SIZE-17X11', quantity: 120, price: 69.99, lowStockThreshold: 20 },
      { id: '3', category: 'size', name: '24" x 16"', sku: 'SIZE-24X16', quantity: 100, price: 109.99, lowStockThreshold: 15 },
      { id: '4', category: 'size', name: '30" x 20"', sku: 'SIZE-30X20', quantity: 80, price: 149.99, lowStockThreshold: 15 },
      { id: '5', category: 'size', name: '36" x 24"', sku: 'SIZE-36X24', quantity: 60, price: 199.99, lowStockThreshold: 10 },
      { id: '6', category: 'size', name: '40" x 30"', sku: 'SIZE-40X30', quantity: 40, price: 269.99, lowStockThreshold: 10 },
      
      // Frames
      { id: '7', category: 'frame', name: 'None', sku: 'FRAME-NONE', quantity: 999, price: 0, lowStockThreshold: 0 },
      { id: '8', category: 'frame', name: 'Black', sku: 'FRAME-BLACK', quantity: 75, price: 89.99, lowStockThreshold: 15 },
      { id: '9', category: 'frame', name: 'Gold', sku: 'FRAME-GOLD', quantity: 50, price: 129.99, lowStockThreshold: 10 },
      { id: '10', category: 'frame', name: 'Natural Wood', sku: 'FRAME-NATURAL-WOOD', quantity: 60, price: 109.99, lowStockThreshold: 15 },
      
      // Mounting
      { id: '11', category: 'mounting', name: 'Stick Tape', sku: 'MOUNT-STICK-TAPE', quantity: 300, price: 0, lowStockThreshold: 50 },
      { id: '12', category: 'mounting', name: 'Float Mount', sku: 'MOUNT-FLOAT', quantity: 200, price: 39.99, lowStockThreshold: 20 },
      { id: '13', category: 'mounting', name: '3D Magnet', sku: 'MOUNT-3D-MAGNET', quantity: 150, price: 49.99, lowStockThreshold: 25 },
      
      // Finish
      { id: '14', category: 'finish', name: 'Matte', sku: 'FINISH-MATTE', quantity: 999, price: 0, lowStockThreshold: 0 },
      { id: '15', category: 'finish', name: 'Gloss', sku: 'FINISH-GLOSS', quantity: 999, price: 0, lowStockThreshold: 0 },
    ];
    
    try {
      // Step 1: Delete ALL existing inventory items
      console.log('🗑️ Step 1: Deleting all existing inventory...');
      const deleteResponse = await fetch(
        `${getServerUrl()}/admin/inventory/all`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': getAuthHeader(),
          },
        }
      );

      if (!deleteResponse.ok) {
        console.error('❌ Failed to delete existing inventory');
        alert('Failed to delete existing inventory. Please try again.');
        return;
      }

      const deleteResult = await deleteResponse.json();
      console.log(`✅ Deleted ${deleteResult.deletedCount} items`);

      // Step 2: Save new default inventory
      console.log('💾 Step 2: Saving new default inventory...');
      const saveResponse = await fetch(
        `${getServerUrl()}/admin/inventory`,
        {
          method: 'PUT',
          headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            inventory: defaultInventory,
          }),
        }
      );

      if (!saveResponse.ok) {
        console.error('❌ Failed to save new inventory');
        alert('Failed to save new inventory. Please try again.');
        return;
      }

      console.log('✅ Default inventory saved successfully');
      
      // Step 3: Update local state
      setInventory(defaultInventory);
      setAutoSaveMessage('✅ Inventory reset successfully!');
      setTimeout(() => setAutoSaveMessage(''), 3000);
      
    } catch (error) {
      console.error('❌ Error resetting inventory:', error);
      alert('Error resetting inventory. Please check console.');
    }
  };

  const saveInventory = async () => {
    setSaving(true);
    setHasUnsavedChanges(false);
    try {
      const response = await fetch(
        `${getServerUrl()}/admin/inventory`,
        {
          method: 'PUT',
          headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inventory }),
        }
      );

      if (!response.ok) throw new Error('Failed to save inventory');

      // Show success message
      setAutoSaveMessage('✅ Saved successfully!');
      setTimeout(() => setAutoSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save inventory:', error);
      alert('Failed to save inventory. Please try again.');
      setHasUnsavedChanges(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDoneEditing = async (id: string) => {
    setEditingId(null);
    // Force a save when done editing
    console.log('💾 Saving on "Done" click...');
    await saveInventory();
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    const updatedInventory = inventory.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    setInventory(updatedInventory);
    setHasUnsavedChanges(true);
    
    // Save immediately to ensure persistence
    console.log('💾 Saving after update...');
    await saveInventoryToBackend(updatedInventory);
  };

  const deleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const itemToDelete = inventory.find(item => item.id === id);
      const updatedInventory = inventory.filter(item => item.id !== id);
      setInventory(updatedInventory);
      
      // Delete from backend using replaceAll to ensure it's removed from database
      console.log('🗑️ Deleting item from database:', itemToDelete?.sku);
      
      try {
        const response = await fetch(
          `${getServerUrl()}/admin/inventory`,
          {
            method: 'PUT',
            headers: {
              'Authorization': getAuthHeader(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              inventory: updatedInventory,
              replaceAll: true // Replace all to ensure deleted item is removed
            }),
          }
        );

        if (response.ok) {
          console.log('✅ Item deleted successfully');
          setAutoSaveMessage('✅ Item deleted');
          setTimeout(() => setAutoSaveMessage(''), 2000);
        } else {
          console.error('❌ Failed to delete item');
          alert('Failed to delete item. Please try again.');
          // Revert the deletion
          setInventory(inventory);
        }
      } catch (error) {
        console.error('❌ Error deleting item:', error);
        alert('Error deleting item. Please check console.');
        // Revert the deletion
        setInventory(inventory);
      }
    }
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.sku) {
      alert('Please fill in all required fields');
      return;
    }

    const item: InventoryItem = {
      id: Date.now().toString(),
      category: newItem.category as 'size' | 'frame' | 'mounting' | 'finish',
      name: newItem.name,
      sku: newItem.sku,
      quantity: newItem.quantity || 0,
      price: newItem.price || 0,
      lowStockThreshold: newItem.lowStockThreshold || 10,
    };

    const updatedInventory = [...inventory, item];
    setInventory(updatedInventory);
    setNewItem({
      category: 'size',
      name: '',
      sku: '',
      quantity: 0,
      price: 0,
      lowStockThreshold: 10,
    });
    setShowAddForm(false);
    setHasUnsavedChanges(true);
    
    // Save immediately to ensure persistence
    console.log('💾 Saving after add...');
    await saveInventoryToBackend(updatedInventory);
  };

  // Helper function to save inventory directly to backend
  const saveInventoryToBackend = async (inventoryData: InventoryItem[]) => {
    console.log('📤 Sending inventory to backend:', inventoryData.length, 'items');
    try {
      const response = await fetch(
        `${getServerUrl()}/admin/inventory`,
        {
          method: 'PUT',
          headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inventory: inventoryData }),
        }
      );

      const responseData = await response.json();
      console.log('📥 Backend response:', responseData);

      if (response.ok) {
        console.log('✅ Inventory saved to backend successfully');
        setHasUnsavedChanges(false);
        setAutoSaveMessage('✅ Auto-saved');
        setTimeout(() => setAutoSaveMessage(''), 2000);
      } else {
        console.error('❌ Failed to save inventory - bad response:', response.status, responseData);
        alert(`Failed to save inventory: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error saving inventory:', error);
      alert('Failed to save inventory. Check console for details.');
    }
  };

  const filteredInventory = selectedCategory === 'all' 
    ? inventory 
    : inventory.filter(item => item.category === selectedCategory);

  const lowStockItems = inventory.filter(item => item.quantity <= item.lowStockThreshold);

  const categories = [
    { value: 'all', label: 'All Items' },
    { value: 'size', label: 'Sizes' },
    { value: 'frame', label: 'Frames' },
    { value: 'mounting', label: 'Mounting' },
    { value: 'finish', label: 'Finishes' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl text-white [data-theme='light']_&:text-gray-900">Inventory Management</h2>
          {autoSaveMessage && (
            <span className="text-sm text-green-500 animate-pulse">{autoSaveMessage}</span>
          )}
          {hasUnsavedChanges && !autoSaveMessage && (
            <span className="text-sm text-yellow-500">Unsaved changes...</span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              if (confirm('Reset inventory to default? This will delete all current items.')) {
                await initializeDefaultInventory();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
          >
            Reset to Default
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 text-white [data-theme='light']_&:text-gray-700 rounded-lg hover:border-[#ff6b35] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
          <button
            onClick={saveInventory}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-yellow-500 mb-1">Low Stock Alert</div>
            <div className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
              {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} running low on stock
            </div>
          </div>
        </div>
      )}

      {/* Add item form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6"
        >
          <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-4">Add New Item</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-4 py-2 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35]"
              >
                <option value="size">Size</option>
                <option value="frame">Frame</option>
                <option value="mounting">Mounting</option>
                <option value="finish">Finish</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">Name *</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35]"
                placeholder="e.g., 12&quot; x 16&quot;"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">SKU *</label>
              <input
                type="text"
                value={newItem.sku}
                onChange={(e) => setNewItem(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full px-4 py-2 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35]"
                placeholder="e.g., SIZE-12X16"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">Quantity</label>
              <input
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">Low Stock Threshold</label>
              <input
                type="number"
                value={newItem.lowStockThreshold}
                onChange={(e) => setNewItem(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded-lg text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addItem}
              className="px-4 py-2 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42]"
            >
              Add Item
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-[#2a2a2a] [data-theme='light']_&:bg-gray-100 text-white [data-theme='light']_&:text-gray-700 rounded-lg hover:bg-[#3a3a3a]"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Category filter */}
      <div className="flex gap-2">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedCategory === cat.value
                ? 'bg-[#ff6b35] text-black'
                : 'bg-[#1a1a1a] text-white border border-[#2a2a2a] hover:border-[#ff6b35] [data-theme=\'light\']_&:bg-white [data-theme=\'light\']_&:text-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Inventory table */}
      <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border-b border-[#2a2a2a] [data-theme='light']_&:border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-400 [data-theme='light']_&:text-gray-600 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 [data-theme='light']_&:text-gray-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 [data-theme='light']_&:text-gray-600 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 [data-theme='light']_&:text-gray-600 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 [data-theme='light']_&:text-gray-600 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 [data-theme='light']_&:text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs text-gray-400 [data-theme='light']_&:text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a] [data-theme='light']_&:divide-gray-200">
              {filteredInventory.map(item => (
                <tr key={item.id} className="hover:bg-[#0a0a0a] [data-theme='light']_&:hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 text-xs bg-[#0a0a0a] [data-theme='light']_&:bg-gray-100 border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded text-white [data-theme='light']_&:text-gray-700 capitalize">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white [data-theme='light']_&:text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-gray-400 [data-theme='light']_&:text-gray-600 text-sm">{item.sku}</td>
                  <td className="px-6 py-4">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                        className="w-24 px-2 py-1 bg-[#0a0a0a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35]"
                      />
                    ) : (
                      <span className="text-white [data-theme='light']_&:text-gray-900">{item.quantity}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                        className="w-24 px-2 py-1 bg-[#0a0a0a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-300 rounded text-white [data-theme='light']_&:text-gray-900 focus:outline-none focus:border-[#ff6b35]"
                      />
                    ) : (
                      <span className="text-white [data-theme='light']_&:text-gray-900">${item.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.quantity === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/50 rounded text-xs text-red-500">
                        <AlertTriangle className="w-3 h-3" />
                        Out of Stock
                      </span>
                    ) : item.quantity <= item.lowStockThreshold ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/50 rounded text-xs text-yellow-500">
                        <AlertTriangle className="w-3 h-3" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/50 rounded text-xs text-green-500">
                        <Package className="w-3 h-3" />
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === item.id ? (
                        <button
                          onClick={() => handleDoneEditing(item.id)}
                          className="text-green-500 hover:text-green-400"
                        >
                          Done
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingId(item.id)}
                          className="text-[#ff6b35] hover:text-[#ff8c42]"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}