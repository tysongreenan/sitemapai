import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { AppErrorHandler } from './errorHandling';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

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
  // Add retry configuration
  retryAttempts: 3,
  retryInterval: 1000
});

// Add a health check function to verify connection
export const checkSupabaseConnection = async () => {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;
    
    // Only check projects if we have a session
    if (session) {
      const { error: dbError } = await supabase.from('projects').select('count').limit(1);
      if (dbError) throw dbError;
    }
    
    return true;
  } catch (error) {
    AppErrorHandler.handle(error, { context: 'checkSupabaseConnection' });
    return false;
  }
};

// Add connection status listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear any cached data
    localStorage.removeItem('supabase.auth.token');
  }
});