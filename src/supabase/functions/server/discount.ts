import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const discountApp = new Hono();

// Get all discount codes (admin only)
discountApp.get('/make-server-3e3a9cd7/admin/discount-codes', async (c) => {
  try {
    console.log('💳 Fetching all discount codes...');
    
    // Get all discount codes from KV store using Supabase client directly
    // because getByPrefix only returns values, not keys
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );
    
    const { data, error } = await supabase
      .from('kv_store_3e3a9cd7')
      .select('key, value')
      .like('key', 'discount:%');
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Transform the data
    const discountCodes = (data || []).map((item: any) => ({
      code: item.key.replace('discount:', ''),
      ...item.value,
    }));
    
    console.log(`✅ Found ${discountCodes.length} discount codes`);
    
    return c.json({
      success: true,
      discountCodes,
    });
  } catch (error) {
    console.error('❌ Error fetching discount codes:', error);
    return c.json({ error: error.message || 'Failed to fetch discount codes' }, 500);
  }
});

// Create new discount code (admin only)
discountApp.post('/make-server-3e3a9cd7/admin/discount-codes', async (c) => {
  try {
    const { code, type, value, expiresAt } = await c.req.json();
    
    if (!code || !type || value === undefined) {
      return c.json({ error: 'Missing required fields: code, type, value' }, 400);
    }
    
    const upperCode = code.toUpperCase().trim();
    
    // Validate code format (alphanumeric only)
    if (!/^[A-Z0-9]+$/.test(upperCode)) {
      return c.json({ error: 'Discount code must be alphanumeric' }, 400);
    }
    
    // Validate type
    if (type !== 'percentage' && type !== 'fixed') {
      return c.json({ error: 'Type must be either "percentage" or "fixed"' }, 400);
    }
    
    // Validate value
    if (typeof value !== 'number' || value <= 0) {
      return c.json({ error: 'Value must be a positive number' }, 400);
    }
    
    if (type === 'percentage' && value > 100) {
      return c.json({ error: 'Percentage cannot exceed 100' }, 400);
    }
    
    // Check if code already exists
    const existing = await kv.get(`discount:${upperCode}`);
    if (existing) {
      return c.json({ error: 'Discount code already exists' }, 409);
    }
    
    // Create discount
    const discount = {
      type,
      value,
      active: true,
      createdAt: new Date().toISOString(),
      ...(expiresAt && { expiresAt }),
    };
    
    await kv.set(`discount:${upperCode}`, discount);
    
    console.log(`✅ Created discount code: ${upperCode} (${type}: ${value})${expiresAt ? ` expires: ${expiresAt}` : ''}`);
    
    return c.json({
      success: true,
      message: 'Discount code created successfully',
      discount: {
        code: upperCode,
        ...discount,
      },
    });
  } catch (error) {
    console.error('❌ Error creating discount code:', error);
    return c.json({ error: error.message || 'Failed to create discount code' }, 500);
  }
});

// Update discount code (toggle active status)
discountApp.patch('/make-server-3e3a9cd7/admin/discount-codes/:code', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase();
    const { active } = await c.req.json();
    
    if (typeof active !== 'boolean') {
      return c.json({ error: 'Active must be a boolean' }, 400);
    }
    
    // Get existing discount
    const existing = await kv.get(`discount:${code}`);
    if (!existing) {
      return c.json({ error: 'Discount code not found' }, 404);
    }
    
    // Update active status
    const updated = {
      ...existing,
      active,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`discount:${code}`, updated);
    
    console.log(`✅ Updated discount code: ${code} (active: ${active})`);
    
    return c.json({
      success: true,
      message: 'Discount code updated successfully',
    });
  } catch (error) {
    console.error('❌ Error updating discount code:', error);
    return c.json({ error: error.message || 'Failed to update discount code' }, 500);
  }
});

// Delete discount code
discountApp.delete('/make-server-3e3a9cd7/admin/discount-codes/:code', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase();
    
    // Check if exists
    const existing = await kv.get(`discount:${code}`);
    if (!existing) {
      return c.json({ error: 'Discount code not found' }, 404);
    }
    
    await kv.del(`discount:${code}`);
    
    console.log(`✅ Deleted discount code: ${code}`);
    
    return c.json({
      success: true,
      message: 'Discount code deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting discount code:', error);
    return c.json({ error: error.message || 'Failed to delete discount code' }, 500);
  }
});

export default discountApp;