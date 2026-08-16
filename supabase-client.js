/* Supabase browser client configuration.
 * The publishable key is intentionally safe to expose in browser code.
 * Access is controlled by Supabase RLS policies.
 */
const SUPABASE_URL = 'https://bjecakxqxvpwgnedcrjo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ziz1dDv3htJLtFSAV8yc0A_MPrdQAp2';

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);
