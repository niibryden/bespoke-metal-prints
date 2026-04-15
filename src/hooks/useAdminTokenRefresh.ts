import { useEffect, useRef } from 'react';
import { 
  AdminSession, 
  refreshAdminToken, 
  shouldRefreshToken, 
  isTokenExpired,
  saveAdminSession,
  clearAdminSession 
} from '../utils/adminAuth';

interface UseAdminTokenRefreshOptions {
  adminInfo: AdminSession | null;
  onTokenRefreshed: (newAdminInfo: AdminSession) => void;
  onTokenExpired: () => void;
}

/**
 * Hook to automatically refresh admin token before it expires
 * Checks every minute and refreshes when token is within 5 minutes of expiring
 */
export function useAdminTokenRefresh({
  adminInfo,
  onTokenRefreshed,
  onTokenExpired,
}: UseAdminTokenRefreshOptions) {
  const isRefreshing = useRef(false);
  const refreshIntervalRef = useRef<number | null>(null);
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    if (!adminInfo) {
      // Clear any existing interval if logged out
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      hasLoggedOut.current = false;
      return;
    }

    console.log('🔐 Setting up automatic token refresh');
    console.log('🕐 Current adminInfo.expiresAt:', adminInfo.expiresAt);
    if (adminInfo.expiresAt) {
      console.log('🕐 Token expires at:', new Date(adminInfo.expiresAt).toLocaleString());
      console.log('🕐 Current time:', new Date().toLocaleString());
      console.log('🕐 Time until expiry:', Math.floor((adminInfo.expiresAt - Date.now()) / 1000 / 60), 'minutes');
    }

    // Immediate check on mount - handle expired tokens gracefully
    if (isTokenExpired(adminInfo)) {
      console.warn('⚠️ Token already expired on mount, clearing session silently');
      clearAdminSession();
      hasLoggedOut.current = true;
      onTokenExpired();
      return;
    }

    // Check if no refresh token available (old session)
    if (!adminInfo.refreshToken) {
      console.warn('⚠️ No refresh token available in session (old session detected)');
      console.warn('⚠️ Please log out and log back in to get a fresh session with auto-refresh capabilities');
      // Don't force logout immediately, but warn the user
      // The token will eventually expire and then we'll force logout
    }

    // Function to check and refresh token
    const checkAndRefreshToken = async () => {
      if (!adminInfo || isRefreshing.current || hasLoggedOut.current) {
        return;
      }

      // Check if token is already expired
      if (isTokenExpired(adminInfo)) {
        console.warn('⚠️ Token expired, logging out silently');
        clearAdminSession();
        hasLoggedOut.current = true;
        onTokenExpired();
        return;
      }

      // Check if token needs refresh (within 5 minutes of expiry)
      if (shouldRefreshToken(adminInfo)) {
        // If no refresh token, can't refresh - just log warning
        if (!adminInfo.refreshToken) {
          console.warn('⚠️ Token needs refresh but no refresh token available');
          console.warn('⚠️ Session will expire soon. Please log out and log back in.');
          return;
        }

        console.log('🔄 Token needs refresh, refreshing now...');
        isRefreshing.current = true;

        try {
          const newAdminInfo = await refreshAdminToken(adminInfo);

          if (newAdminInfo) {
            console.log('✅ Token refresh successful');
            // Save updated session to localStorage
            saveAdminSession(newAdminInfo);
            // Update parent component state
            onTokenRefreshed(newAdminInfo);
          } else {
            console.warn('⚠️ Token refresh failed, logging out');
            clearAdminSession();
            hasLoggedOut.current = true;
            onTokenExpired();
          }
        } catch (error) {
          console.error('💥 Token refresh error:', error);
          clearAdminSession();
          hasLoggedOut.current = true;
          onTokenExpired();
        } finally {
          isRefreshing.current = false;
        }
      }
    };

    // Check immediately on mount
    checkAndRefreshToken();

    // Check every minute (60000ms)
    refreshIntervalRef.current = window.setInterval(() => {
      checkAndRefreshToken();
    }, 60 * 1000);

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [adminInfo, onTokenRefreshed, onTokenExpired]);

  // Also check when user returns to the tab (visibility change)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && adminInfo && !isRefreshing.current && !hasLoggedOut.current) {
        console.log('👁️ Tab became visible, checking token status');
        
        if (isTokenExpired(adminInfo)) {
          console.warn('⚠️ Token expired while tab was hidden, logging out');
          clearAdminSession();
          hasLoggedOut.current = true;
          onTokenExpired();
          return;
        }

        if (shouldRefreshToken(adminInfo)) {
          // If no refresh token, can't refresh
          if (!adminInfo.refreshToken) {
            console.warn('⚠️ Token needs refresh but no refresh token available');
            return;
          }

          console.log('🔄 Tab became visible and token needs refresh');
          isRefreshing.current = true;

          try {
            const newAdminInfo = await refreshAdminToken(adminInfo);

            if (newAdminInfo) {
              console.log('✅ Token refreshed on tab focus');
              saveAdminSession(newAdminInfo);
              onTokenRefreshed(newAdminInfo);
            } else {
              console.warn('⚠️ Token refresh failed on tab focus, logging out');
              clearAdminSession();
              hasLoggedOut.current = true;
              onTokenExpired();
            }
          } catch (error) {
            console.error('💥 Token refresh error on tab focus:', error);
            clearAdminSession();
            hasLoggedOut.current = true;
            onTokenExpired();
          } finally {
            isRefreshing.current = false;
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [adminInfo, onTokenRefreshed, onTokenExpired]);
}