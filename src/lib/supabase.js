import { createClient } from '@supabase/supabase-js';

// These values come from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For debugging - check if env variables are loaded
console.log('Supabase URL:', supabaseUrl ? '✅ Loaded' : '❌ Missing');
console.log('Supabase Key:', supabaseAnonKey ? '✅ Loaded' : '❌ Missing');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);