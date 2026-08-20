// ==========================================
// SHORASH MENU — Supabase Configuration
// ==========================================

const SUPABASE_URL = 'https://pklzxpivnoqnrzyjryqz.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_CC5l_DeuRDVy32hFOoVWMw_7i45WhmK';

// Create Supabase client
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

console.log('✅ SHORASH Supabase connected');
