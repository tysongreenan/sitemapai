import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { AppErrorHandler } from './errorHandling';

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

// Enhanced health check function with better error reporting
export const checkSupabaseConnection = async () => {
  try {
    console.log('Checking Supabase connection...');
    
    // First, try a simple ping to the Supabase API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase API returned ${response.status}: ${response.statusText}`);
    }

    console.log('Supabase API is reachable');

    // Then check auth session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.warn('Auth session error:', authError);
      // Don't throw here as this might be expected for logged-out users
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
    
    console.log('Supabase connection check passed');
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    
    // Provide more specific error messages
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      AppErrorHandler.handle(new Error(
        'Unable to connect to Supabase. Please check:\n' +
        '1. Your internet connection\n' +
        '2. Supabase project status (not paused)\n' +
        '3. Environment variables in .env file\n' +
        '4. Firewall/proxy settings'
      ), { context: 'checkSupabaseConnection', originalError: error });
    } else {
      AppErrorHandler.handle(error, { context: 'checkSupabaseConnection' });
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

// Test connection on module load
checkSupabaseConnection().then(success => {
  if (success) {
    console.log('✅ Supabase connection established');
  } else {
    console.error('❌ Supabase connection failed');
  }
});