import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Declare global type for the Supabase singleton
declare global {
  interface Window {
    __supabaseClient?: SupabaseClient;
  }
}

/**
 * Get a singleton Supabase client instance
 * This prevents "Multiple GoTrueClient instances" warnings
 * Uses global window object to ensure true singleton across HMR reloads
 * v2 - Using unified info.tsx imports
 */
export function getSupabaseClient(): SupabaseClient {
  // Check if client exists in global scope (survives HMR)
  if (typeof window !== 'undefined' && window.__supabaseClient) {
    return window.__supabaseClient;
  }

  // Create new client if none exists
  const client = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Increase lock timeout to prevent warnings in React Strict Mode
        storageKey: 'sb-auth-token',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'pkce',
        debug: false,
      }
    }
  );

  // Store in global scope to survive HMR
  if (typeof window !== 'undefined') {
    window.__supabaseClient = client;
  }

  return client;
}