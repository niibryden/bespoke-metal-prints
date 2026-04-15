import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

let supabaseClient: any = null;

/**
 * Get or create Supabase client singleton
 * Safe to call multiple times - returns the same instance
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  try {
    if (!projectId || !publicAnonKey) {
      console.warn('Supabase credentials not available, using mock client');
      // Return a mock client that won't make network requests
      return createMockSupabaseClient();
    }

    const supabaseUrl = `https://${projectId}.supabase.co`;
    supabaseClient = createClient(supabaseUrl, publicAnonKey);
    return supabaseClient;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return createMockSupabaseClient();
  }
}

/**
 * Create a mock Supabase client for preview/development
 * Returns promises that resolve to empty data
 */
function createMockSupabaseClient() {
  return {
    auth: {
      getSession: async () => ({
        data: { session: null },
        error: null,
      }),
      getUser: async () => ({
        data: { user: null },
        error: null,
      }),
      signInWithPassword: async () => ({
        data: { session: null, user: null },
        error: { message: 'Mock client - no authentication available' },
      }),
      signOut: async () => ({
        error: null,
      }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          limit: () => ({ data: [], error: null }),
        }),
        limit: async () => ({ data: [], error: null }),
        order: () => ({
          limit: async () => ({ data: [], error: null }),
        }),
      }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
}
