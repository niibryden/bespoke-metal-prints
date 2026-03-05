import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const authApp = new Hono();

// Singleton Supabase admin client
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );
  }
  return supabaseAdmin;
}

// Sign up new customer
authApp.post('/make-server-3e3a9cd7/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = getSupabaseAdmin();

    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      return c.json({ error: 'User with this email already exists' }, 400);
    }

    // Create user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      email_confirm: true,
    });

    if (error) {
      console.error('Sign up error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Auto sign-in
    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: sessionData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return c.json({ 
        success: true, 
        user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata.name },
        message: 'Account created. Please sign in.'
      });
    }

    return c.json({ 
      success: true, 
      access_token: sessionData.session?.access_token,
      user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata.name }
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return c.json({ error: 'Internal server error during sign up' }, 500);
  }
});

// Create admin user (one-time setup)
authApp.post('/make-server-3e3a9cd7/create-admin', async (c) => {
  try {
    const supabase = getSupabaseAdmin();

    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAdmin = existingUsers?.users?.find(
      user => user.email === 'admin@bespokemetalprints.com'
    );

    if (existingAdmin) {
      await supabase.auth.admin.updateUserById(existingAdmin.id, {
        user_metadata: { ...existingAdmin.user_metadata, name: 'Admin', role: 'admin' }
      });
      return c.json({ message: 'Admin user already exists', success: true });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@bespokemetalprints.com',
      password: 'admin123',
      user_metadata: { name: 'Admin', role: 'admin' },
      email_confirm: true,
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      message: 'Admin user created successfully',
      user: { id: data.user.id, email: data.user.email }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return c.json({ error: 'Internal server error during admin creation' }, 500);
  }
});

// Get current user info
authApp.get('/make-server-3e3a9cd7/me', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    // Determine permissions based on role
    const role = user.user_metadata.role || 'admin';
    const permissions = {
      canViewOrders: true,
      canManageInventory: true,
      canExportData: true,
      canManageSettings: true,
      canManagePhotos: true,
      canManageUsers: role === 'super_admin',
    };

    return c.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata.name,
      role: role,
      permissions: permissions,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Change password
authApp.post('/make-server-3e3a9cd7/change-password', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Current password and new password are required' }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ error: 'New password must be at least 6 characters' }, 400);
    }

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    
    if (userError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return c.json({ error: 'Current password is incorrect' }, 400);
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      return c.json({ error: updateError.message }, 400);
    }

    return c.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return c.json({ error: 'Failed to change password' }, 500);
  }
});

export default authApp;