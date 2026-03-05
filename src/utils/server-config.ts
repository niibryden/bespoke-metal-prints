// Server configuration
// The Edge Function is auto-deployed as "make-server-3e3a9cd7" by Figma Make
// All routes are prefixed with /make-server-3e3a9cd7/

import { projectId } from './supabase/info';

export const getServerUrl = () => {
  // Return the base URL for the make-server function
  // Routes will include the /make-server-3e3a9cd7 prefix
  return `https://${projectId}.supabase.co/functions/v1/make-server-3e3a9cd7`;
};