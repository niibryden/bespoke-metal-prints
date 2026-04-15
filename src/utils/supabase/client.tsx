import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

let supabaseClient: any = null;
let isInitializing = false;

/**
 * Get or create Supabase client singleton
 * Safe to call multiple times - returns the same instance
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    console.log('⏳ Supabase client is already initializing, waiting...');
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (supabaseClient) {
          clearInterval(checkInterval);
          resolve(supabaseClient);
        }
      }, 50);
    });
  }

  isInitializing = true;

  try {
    if (!projectId || !publicAnonKey) {
      console.warn('Supabase credentials not available, using mock client');
      isInitializing = false;
      // Return a mock client that won't make network requests
      return createMockSupabaseClient();
    }

    const supabaseUrl = `https://${projectId}.supabase.co`;
    supabaseClient = createClient(supabaseUrl, publicAnonKey, {
      auth: {
        // Use local storage for persistence (default)
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // Auto refresh token
        autoRefreshToken: true,
        // Persist session
        persistSession: true,
        // Detect session from URL
        detectSessionInUrl: true,
        // Flow type for authentication
        flowType: 'pkce',
        // Increase lock timeout and retry settings to prevent errors
        lock: {
          acquireTimeout: 15000, // 15 seconds - higher to handle React Strict Mode
          retryInterval: 50, // Check every 50ms for faster acquisition
        },
        // Debounce storage events to prevent multiple simultaneous operations
        storageKey: 'sb-auth-token',
        debug: false, // Disable debug logs in production
      },
      global: {
        headers: {
          'X-Client-Info': 'bespoke-metal-prints',
        },
      },
    });
    
    isInitializing = false;
    console.log('✅ Supabase client initialized successfully');
    return supabaseClient;
  } catch (error) {
    isInitializing = false;
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