import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// These values should be fetched from environment variables in a production setup
const supabaseUrl = 'https://example.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);