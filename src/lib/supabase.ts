import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation with better error messages
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is missing from environment variables');
  throw new Error('Missing VITE_SUPABASE_URL environment variable. Please check your .env file.');
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is missing from environment variables');
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid VITE_SUPABASE_URL format:', supabaseUrl);
  throw new Error('Invalid VITE_SUPABASE_URL format. Please check your .env file.');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 10 chars):', supabaseAnonKey.substring(0, 10) + '...');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  },
  // Enhanced retry configuration
  retryAttempts: 3,
  retryInterval: 1000
});

// Enhanced health check function with better error reporting and timeout
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Checking Supabase connection...');
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      // First, try a simple ping to the Supabase API
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Supabase API returned ${response.status}: ${response.statusText}`);
      }

      console.log('Supabase API is reachable');

      // Then check auth session (don't fail on auth errors for logged-out users)
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) {
          console.warn('Auth session warning (may be normal for logged-out users):', authError.message);
        }
        
        // Only check projects if we have a session
        if (session) {
          console.log('Checking database access...');
          const { error: dbError } = await supabase.from('projects').select('count').limit(1);
          if (dbError) {
            console.error('Database access error:', dbError);
            throw dbError;
          }
          console.log('Database access confirmed');
        }
      } catch (authError) {
        console.warn('Auth/DB check failed, but API is reachable:', authError);
        // Don't fail the connection check just because of auth issues
      }
      
      console.log('Supabase connection check passed');
      return true;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.warn('Supabase connection check failed:', error);
    
    // Don't spam error handlers for network issues
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.warn('Network connectivity issue detected');
    } else if (error.name === 'AbortError') {
      console.warn('Connection check timed out');
    } else {
      console.error('Unexpected connection error:', error);
    }
    
    return false;
  }
};

// Add connection status listener with better logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
  
  if (event === 'SIGNED_OUT') {
    // Clear any cached data
    localStorage.removeItem('supabase.auth.token');
    console.log('Cleared auth token from localStorage');
  }
});

// Test connection on module load (but don't block)
checkSupabaseConnection().then(success => {
  if (success) {
    console.log('✅ Supabase connection established');
  } else {
    console.warn('⚠️ Supabase connection check failed - will retry automatically');
  }
}).catch(error => {
  console.warn('⚠️ Initial Supabase connection test failed:', error.message);
});