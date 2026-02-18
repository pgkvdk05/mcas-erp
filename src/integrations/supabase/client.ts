import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is not defined in environment variables.');
} else {
  console.log('Supabase URL:', supabaseUrl ? 'Loaded' : 'Not Loaded');
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'Loaded' : 'Not Loaded');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);