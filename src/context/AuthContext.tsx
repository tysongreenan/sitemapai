import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AppErrorHandler } from '../lib/errorHandling';
import { toast } from 'react-toastify';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  loading: boolean;
  initialized: boolean; // New flag to track if auth has been initialized
};

// Create context with a default value to prevent undefined errors
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signOut: async () => {},
  loading: true,
  initialized: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Function to get and set session with proper error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return; // Prevent state updates if component unmounted
        
        if (error) {
          console.error('Auth session error:', error);
          
          // Check for invalid refresh token errors
          const isInvalidRefreshToken = 
            error.message?.includes('Invalid Refresh Token: Refresh Token Not Found') ||
            error.message?.includes('refresh_token_not_found') ||
            error.message?.includes('Refresh Token Not Found') ||
            (error as any)?.code === 'refresh_token_not_found';
          
          if (isInvalidRefreshToken) {
            console.warn('Invalid refresh token detected, clearing local auth data');
            
            // Clear all local auth data
            localStorage.removeItem('supabase.auth.token');
            await supabase.auth.signOut({ scope: 'local' });
            
            setSession(null);
            setUser(null);
          } else {
            AppErrorHandler.handle(error, { context: 'AuthContext initial getSession' });
            setSession(null);
            setUser(null);
          }
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('✅ User session restored:', session.user.email);
          }
        }
      } catch (error) {
        if (!mounted) return;
        console.error('Auth initialization error:', error);
        
        // Check if the caught error is also a refresh token error
        const errorMessage = (error as any)?.message || '';
        const isInvalidRefreshToken = 
          errorMessage.includes('Invalid Refresh Token: Refresh Token Not Found') ||
          errorMessage.includes('refresh_token_not_found') ||
          errorMessage.includes('Refresh Token Not Found');
        
        if (isInvalidRefreshToken) {
          console.warn('Invalid refresh token in catch block, clearing local auth data');
          
          // Clear all local auth data
          localStorage.removeItem('supabase.auth.token');
          await supabase.auth.signOut({ scope: 'local' });
          
          setSession(null);
          setUser(null);
        } else {
          AppErrorHandler.handle(error, { context: 'AuthContext getSession catch' });
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes with improved error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state change:', event, session?.user?.email || 'no user');
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setInitialized(true);

        // Handle auth events with user feedback
        switch (event) {
          case 'SIGNED_IN':
            // Only show welcome message for confirmed users
            if (session?.user?.email_confirmed_at) {
              toast.success(`Welcome back, ${session?.user?.email?.split('@')[0] || 'there'}!`);
            }
            break;
          case 'SIGNED_OUT':
            toast.info('Successfully signed out');
            break;
          case 'USER_UPDATED':
            toast.success('Profile updated successfully');
            break;
          case 'PASSWORD_RECOVERY':
            toast.info('Check your email for password reset instructions');
            break;
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token refreshed successfully');
            break;
        }
      }
    );

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Only attempt to sign out if there's an active user session
      if (user) {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          // Enhanced check for session_not_found errors
          const isSessionNotFound = 
            error.message?.includes('Session from session_id claim in JWT does not exist') || 
            error.message?.includes('session_not_found') ||
            error.message?.includes('Auth session missing') ||
            (error as any)?.code === 'session_not_found' ||
            (error as any)?.status === 403;
          
          if (isSessionNotFound) {
            // This is expected when the session is already invalid on the server
            console.warn('Session already expired on server, proceeding with local cleanup');
            
            // Always clear local state and cached data
            setSession(null);
            setUser(null);
            localStorage.removeItem('supabase.auth.token');
            setLoading(false);
            
            // Return early to prevent error from being re-thrown
            return;
          } else {
            // This is a different error that should be handled normally
            throw error;
          }
        }
      } else {
        // If no user is logged in, just clear local state
        console.log('No active session to sign out from');
      }
      
      // Always clear local state and cached data regardless of server response
      setSession(null);
      setUser(null);
      localStorage.removeItem('supabase.auth.token');
      
    } catch (error) {
      // Only handle non-session-not-found errors as critical
      AppErrorHandler.handle(error, { context: 'AuthContext signOut' });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    signOut,
    loading,
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}