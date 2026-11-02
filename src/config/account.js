// Public client configuration only. See ACCOUNT_SETUP.md.
// NEVER put a service_role key, sb_secret key, database password, or email
// provider secret here. A publishable key / legacy anon key is safe only
// with the row-level-security policies in supabase/setup.sql applied.
export const ACCOUNT_CONFIG = {
  url: '', // https://YOUR_PROJECT.supabase.co
  publicKey: '', // sb_publishable_... or legacy anon key
};
