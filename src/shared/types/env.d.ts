/// <reference types="astro/client" />

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../db/database.types';
import type { IRequestContext, IUser } from './types';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user: IUser
      requestContext: IRequestContext;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly OPENROUTER_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
