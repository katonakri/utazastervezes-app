/* Supabase browser client configuration.
 * The publishable key is safe to expose in browser code.
 * Keep the client on a dedicated global property so this file is safe
 * even if the page/deployment loads the script more than once.
 */
(() => {
  const SUPABASE_URL = 'https://bjecakxqxvpwgnedcrjo.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ziz1dDv3htJLtFSAV8yc0A_MPrdQAp2';

  if (window.__utazastervezesSupabaseClient) {
    window.supabase = window.__utazastervezesSupabaseClient;
    return;
  }

  const client = window.supabase.createClient(
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

  window.__utazastervezesSupabaseClient = client;
  window.supabase = client;
})();
