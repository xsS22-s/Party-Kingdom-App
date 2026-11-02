import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';
import { ACCOUNT_CONFIG } from '../config/account';
import { sessionStorage } from './sessionStorage';

export const accountsConfigured = /^https:\/\/[^/]+\/?$/.test(ACCOUNT_CONFIG.url) && Boolean(ACCOUNT_CONFIG.publicKey.trim());
export const accounts = accountsConfigured ? createClient(ACCOUNT_CONFIG.url, ACCOUNT_CONFIG.publicKey, {
  auth: { storage: sessionStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false, lock: processLock },
}) : null;
