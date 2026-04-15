/**
 * Auth Manager - Centralized authentication state management
 * 
 * This utility prevents Supabase auth lock errors by:
 * 1. Managing a single global auth subscription
 * 2. Debouncing rapid auth state changes
 * 3. Preventing multiple simultaneous auth operations
 */

import { getSupabaseClient } from './client';

let globalAuthSubscription: any = null;
let authOperationInProgress = false;
let authOperationQueue: Array<() => Promise<any>> = [];
let lastAuthOperation = 0;
const AUTH_DEBOUNCE_MS = 100; // Minimum time between auth operations

/**
 * Initialize the global auth subscription (call once at app startup)
 */
export async function initializeAuthSubscription(callback?: (user: any, event: string) => void) {
  if (globalAuthSubscription) {
    console.warn('⚠️ Auth subscription already initialized');
    return globalAuthSubscription;
  }

  const supabase = getSupabaseClient();
  
  // Get initial session
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (callback) {
      callback(session?.user ?? null, 'INITIAL_SESSION');
    }
  } catch (error) {
    console.error('Error getting initial session:', error);
  }

  // Set up single global auth listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Global auth state changed:', event);
    if (callback) {
      callback(session?.user ?? null, event);
    }
  });

  globalAuthSubscription = subscription;
  console.log('✅ Global auth subscription initialized');
  return subscription;
}

/**
 * Clean up the global auth subscription
 */
export function cleanupAuthSubscription(subscription?: any) {
  const subToClean = subscription || globalAuthSubscription;
  if (subToClean) {
    console.log('🔓 Cleaning up global auth subscription');
    subToClean.unsubscribe();
    if (subToClean === globalAuthSubscription) {
      globalAuthSubscription = null;
    }
  }
}

/**
 * Execute an auth operation with debouncing and queue management
 * This prevents lock conflicts from rapid auth operations
 */
export async function executeAuthOperation<T>(
  operation: () => Promise<T>,
  operationName: string = 'auth operation'
): Promise<T> {
  const now = Date.now();
  const timeSinceLastOp = now - lastAuthOperation;

  // If an operation is in progress, queue this one
  if (authOperationInProgress) {
    console.log(`⏳ Queueing ${operationName}, operation in progress`);
    return new Promise((resolve, reject) => {
      authOperationQueue.push(async () => {
        try {
          const result = await executeAuthOperation(operation, operationName);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Debounce rapid operations
  if (timeSinceLastOp < AUTH_DEBOUNCE_MS) {
    const waitTime = AUTH_DEBOUNCE_MS - timeSinceLastOp;
    console.log(`⏱️ Debouncing ${operationName}, waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  // Execute the operation
  authOperationInProgress = true;
  lastAuthOperation = Date.now();

  try {
    console.log(`🔐 Executing ${operationName}`);
    const result = await operation();
    return result;
  } catch (error) {
    console.error(`❌ Error during ${operationName}:`, error);
    throw error;
  } finally {
    authOperationInProgress = false;

    // Process next queued operation
    if (authOperationQueue.length > 0) {
      const nextOp = authOperationQueue.shift();
      if (nextOp) {
        setTimeout(() => nextOp(), AUTH_DEBOUNCE_MS);
      }
    }
  }
}

/**
 * Safe sign in with password (with debouncing and queue management)
 */
export async function safeSignIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  return executeAuthOperation(
    () => supabase.auth.signInWithPassword({ email, password }),
    'signIn'
  );
}

/**
 * Safe sign out (with debouncing and queue management)
 */
export async function safeSignOut() {
  const supabase = getSupabaseClient();
  return executeAuthOperation(
    () => supabase.auth.signOut(),
    'signOut'
  );
}

/**
 * Safe get session (with debouncing and queue management)
 */
export async function safeGetSession() {
  const supabase = getSupabaseClient();
  return executeAuthOperation(
    () => supabase.auth.getSession(),
    'getSession'
  );
}

/**
 * Check if auth lock errors are occurring
 */
export function getAuthStatus() {
  return {
    hasSubscription: !!globalAuthSubscription,
    operationInProgress: authOperationInProgress,
    queuedOperations: authOperationQueue.length,
    lastOperation: lastAuthOperation,
  };
}
