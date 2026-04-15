import { projectId } from './supabase/info';

/**
 * Server URL utility
 * Returns the base URL for backend API calls
 */
export function getServerUrl(): string {
  // Server-side rendering guard
  if (typeof window === 'undefined') {
    return '';
  }
  
  // Use the projectId from info module
  if (projectId && projectId !== 'your-project-id') {
    return `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;
  }
  
  // Fallback: check environment variables
  try {
    const envProjectId = import.meta.env?.VITE_SUPABASE_PROJECT_ID || 
                         (window as any).__SUPABASE_PROJECT_ID__;
    
    if (envProjectId && envProjectId !== 'your-project-id') {
      return `https://${envProjectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;
    }
  } catch (err) {
    console.log('Could not determine Supabase project ID from environment');
  }
  
  // Default: return empty string (will trigger mock data fallback in components)
  console.warn('⚠️ No valid project ID found - server calls will use mock data');
  return '';
}
