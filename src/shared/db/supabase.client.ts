import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

console.log('Supabase URL:', supabaseUrl);

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
