// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AppErrorHandler } from '../lib/errorHandling';
import { toast } from 'react-toastify';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  loading: boolean; // Indicates if the initial session check is still ongoing
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Initialize as true to indicate check is pending

  useEffect(() => {
    // Function to get and set session, ensuring loading state is handled
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession(); //
        if (error) {
          AppErrorHandler.handle(error, { context: 'AuthContext initial getSession' }); //
          setSession(null);
          setUser(null);
        } else {
          setSession(session); //
          setUser(session?.user ?? null); //
        }
      } finally {
        setLoading(false); // Always set loading to false after the initial check, even if there's an error
      }
    };

    getInitialSession(); // Call the async function immediately

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange( //
      async (event, session) => {
        setSession(session); //
        setUser(session?.user ?? null); //
        // Do NOT set setLoading(false) here, as getInitialSession already handles the initial load.
        // This listener is for subsequent changes after initial load.

        // Handle auth events
        switch (event) {
          case 'SIGNED_IN':
            toast.success('Successfully signed in!'); //
            break;
          case 'SIGNED_OUT':
            toast.info('Successfully signed out'); //
            break;
          case 'USER_UPDATED':
            toast.success('Profile updated successfully'); //
            break;
          case 'PASSWORD_RECOVERY':
            toast.info('Check your email for password reset instructions'); //
            break;
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe(); //
    };
  }, []); // Empty dependency array means this runs once on mount

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut(); //
      if (error) throw error;
    } catch (error) {
      AppErrorHandler.handle(error, { context: 'AuthContext signOut' }); //
    }
  };

  const value = {
    session,
    user,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext); //
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider'); //
  }
  return context;
}