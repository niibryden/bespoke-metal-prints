import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';

/**
 * Centralized auth state hook
 * Manages a single auth listener to prevent lock conflicts
 * Call this hook once at the app level and pass down the user state
 */
let globalAuthState: any = null;
let globalAuthSubscription: any = null;
let listeners: Array<(user: any) => void> = [];

export function useAuth() {
  const [user, setUser] = useState<any>(globalAuthState);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    // Add this component's setState to the listeners
    listeners.push(setUser);

    // Only create subscription if it doesn't exist
    if (!globalAuthSubscription) {
      console.log('🔐 Initializing global auth subscription');
      
      // Get initial session
      const initAuth = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const newUser = session?.user ?? null;
          globalAuthState = newUser;
          
          // Notify all listeners
          listeners.forEach(listener => listener(newUser));
          setIsLoading(false);
        } catch (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
        }
      };
      initAuth();

      // Set up auth state change listener (only once globally)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔄 Auth state changed:', event);
        const newUser = session?.user ?? null;
        globalAuthState = newUser;
        
        // Notify all listeners
        listeners.forEach(listener => listener(newUser));
      });
      
      globalAuthSubscription = subscription;
    } else {
      // Subscription already exists, just set loading to false
      setIsLoading(false);
    }

    // Cleanup: remove this listener when component unmounts
    return () => {
      listeners = listeners.filter(listener => listener !== setUser);
      
      // Only unsubscribe when NO components are using auth anymore
      if (listeners.length === 0 && globalAuthSubscription) {
        console.log('🔓 Cleaning up global auth subscription');
        globalAuthSubscription.unsubscribe();
        globalAuthSubscription = null;
      }
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, isLoading, signOut, supabase };
}
