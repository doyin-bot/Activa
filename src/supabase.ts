import { createClient } from '@supabase/supabase-js';

type ViteEnv = Record<string, string | undefined>;
const env = ((import.meta as ImportMeta & { env?: ViteEnv }).env ?? {}) as ViteEnv;
const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

export const backendConfigured = Boolean(url && anonKey);
export const supabase = backendConfigured ? createClient(url!, anonKey!) : null;
