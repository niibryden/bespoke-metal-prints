/**
 * Utility for making authenticated admin API calls with automatic JWT error handling
 */

export interface AdminApiOptions extends RequestInit {
  accessToken: string;
  onBadJWT?: () => void;
}

/**
 * Make an authenticated admin API call with automatic bad JWT detection
 */
export async function adminFetch(url: string, options: AdminApiOptions): Promise<Response> {
  const { accessToken, onBadJWT, ...fetchOptions } = options;
  
  // Validate token format before making the request
  if (!accessToken || !accessToken.startsWith('eyJ') || accessToken.length < 100) {
    console.error('❌ Invalid JWT token format detected before request');
    console.error('❌ Token:', accessToken?.substring(0, 30));
    
    if (onBadJWT) {
      console.log('🔄 Triggering automatic logout...');
      onBadJWT();
    }
    
    throw new Error('Invalid authentication token. Please log in again.');
  }
  
  // Add Authorization header
  const headers = new Headers(fetchOptions.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });
  
  // Check for bad JWT response
  if (response.status === 401 || response.status === 403) {
    try {
      const errorData = await response.clone().json();
      
      // Check for bad JWT indicators
      if (
        errorData.code === 'bad_jwt' ||
        errorData.forceLogout ||
        errorData.error?.includes('bad_jwt') ||
        errorData.error?.includes('missing sub claim') ||
        errorData.message?.includes('Invalid JWT')
      ) {
        console.error('🚨 Bad JWT detected in response:', errorData);
        
        if (onBadJWT) {
          console.log('🔄 Triggering automatic logout...');
          onBadJWT();
        }
        
        throw new Error('Your session has expired. Please log in again.');
      }
    } catch (jsonError) {
      // If we can't parse the error, just return the response
      console.error('Failed to parse error response:', jsonError);
    }
  }
  
  return response;
}

/**
 * Create an admin API client with automatic bad JWT handling
 */
export function createAdminApiClient(accessToken: string, onLogout: () => void) {
  return {
    fetch: (url: string, options: RequestInit = {}) => 
      adminFetch(url, { ...options, accessToken, onBadJWT: onLogout }),
    
    get: (url: string, options: RequestInit = {}) =>
      adminFetch(url, { ...options, method: 'GET', accessToken, onBadJWT: onLogout }),
    
    post: (url: string, body?: any, options: RequestInit = {}) =>
      adminFetch(url, {
        ...options,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        body: body ? JSON.stringify(body) : undefined,
        accessToken,
        onBadJWT: onLogout,
      }),
    
    put: (url: string, body?: any, options: RequestInit = {}) =>
      adminFetch(url, {
        ...options,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        body: body ? JSON.stringify(body) : undefined,
        accessToken,
        onBadJWT: onLogout,
      }),
    
    delete: (url: string, options: RequestInit = {}) =>
      adminFetch(url, { ...options, method: 'DELETE', accessToken, onBadJWT: onLogout }),
  };
}
