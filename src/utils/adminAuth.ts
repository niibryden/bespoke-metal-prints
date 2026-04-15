import { getServerUrl } from './serverUrl';

export interface AdminSession {
  email: string;
  role: string;
  name: string;
  permissions: any;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * Automatically refresh the admin token before it expires
 * Returns the updated admin info with new tokens, or null if refresh failed
 */
export async function refreshAdminToken(
  currentAdminInfo: AdminSession
): Promise<AdminSession | null> {
  try {
    if (!currentAdminInfo.refreshToken) {
      console.error('❌ No refresh token available, cannot refresh session');
      return null;
    }

    console.log('🔄 Refreshing admin token...');
    const serverUrl = getServerUrl();
    
    const response = await fetch(`${serverUrl}/admin/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: currentAdminInfo.refreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Token refresh failed:', errorData);
      
      // If server says to force logout, return null
      if (errorData.forceLogout) {
        console.error('🚨 Server requested force logout');
        return null;
      }
      
      return null;
    }

    const data = await response.json();
    
    if (!data.access_token) {
      console.error('❌ No access token in refresh response');
      return null;
    }

    console.log('✅ Token refreshed successfully');
    console.log('🎫 New token expires at:', new Date(data.expires_at * 1000).toLocaleString());

    // Return updated admin info with new tokens
    const updatedAdminInfo: AdminSession = {
      ...currentAdminInfo,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || currentAdminInfo.refreshToken,
      expiresAt: data.expires_at ? data.expires_at * 1000 : undefined, // Convert to milliseconds
    };

    return updatedAdminInfo;
  } catch (error) {
    console.error('💥 Token refresh exception:', error);
    return null;
  }
}

/**
 * Check if token needs refresh (expires in less than 5 minutes)
 */
export function shouldRefreshToken(adminInfo: AdminSession): boolean {
  if (!adminInfo.expiresAt) {
    // If no expiration time, assume we should refresh after 50 minutes
    return false;
  }

  const now = Date.now();
  const expiresAt = adminInfo.expiresAt;
  const timeUntilExpiry = expiresAt - now;
  
  // Refresh if token expires in less than 5 minutes (300,000 ms)
  const shouldRefresh = timeUntilExpiry < 5 * 60 * 1000;
  
  if (shouldRefresh) {
    console.log('⏰ Token expires soon:', new Date(expiresAt).toLocaleString());
    console.log('⏰ Time until expiry:', Math.floor(timeUntilExpiry / 1000 / 60), 'minutes');
  }
  
  return shouldRefresh;
}

/**
 * Check if token is already expired
 */
export function isTokenExpired(adminInfo: AdminSession): boolean {
  if (!adminInfo.expiresAt) {
    return false;
  }

  const now = Date.now();
  const expired = now >= adminInfo.expiresAt;
  
  return expired;
}

/**
 * Save admin session to localStorage
 */
export function saveAdminSession(adminInfo: AdminSession): void {
  const expiresAt = adminInfo.expiresAt || (Date.now() + 60 * 60 * 1000);
  localStorage.setItem('admin-session', JSON.stringify({ adminInfo, expiresAt }));
  console.log('💾 Admin session saved to localStorage');
}

/**
 * Clear admin session from localStorage
 */
export function clearAdminSession(): void {
  localStorage.removeItem('admin-session');
  console.log('🗑️ Admin session cleared from localStorage');
}