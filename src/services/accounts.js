import { Platform } from 'react-native';
import { setupURLPolyfill } from 'react-native-url-polyfill';
import { createClient, processLock } from '@supabase/supabase-js';
import { ACCOUNT_CONFIG } from '../config/account';
import { sessionStorage } from './sessionStorage';

// Use the package entry point: Snack may fail to resolve the /auto subpath.
// Web browsers already provide URL and URLSearchParams.
if (Platform.OS !== 'web') setupURLPolyfill();

export const accountsConfigured = /^https:\/\/[^/]+\/?$/.test(ACCOUNT_CONFIG.url) && Boolean(ACCOUNT_CONFIG.publicKey.trim());
export const accounts = accountsConfigured ? createClient(ACCOUNT_CONFIG.url, ACCOUNT_CONFIG.publicKey, {
  auth: { storage: sessionStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false, lock: processLock },
}) : null;
