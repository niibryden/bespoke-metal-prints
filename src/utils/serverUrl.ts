import { projectId } from './supabase/info';

/**
 * Get the base URL for the Supabase Edge Function server
 * The deployed function is named "make-server-3e3a9cd7" (auto-deployed by Figma Make)
 * Routes should be appended to this base URL (e.g., /make-server-3e3a9cd7/stock-photos)
 */
export function getServerUrl(): string {
  if (!projectId) {
    console.error('❌ projectId is not defined! Check /utils/supabase/info');
    throw new Error('Supabase projectId is not configured');
  }
  return `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;
}