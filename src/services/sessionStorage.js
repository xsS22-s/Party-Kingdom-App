import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Session JSON can exceed the native per-value size limit. Write a new
// generation of small encrypted chunks, then atomically switch its pointer.
const CHUNK_SIZE = 900;
const safeKey = (key) => `pk.auth.${key.replace(/[^\w.-]/g, '_')}`;
async function removeChunks(key, manifest) {
  if (!manifest) return;
  await Promise.all(Array.from({ length: manifest.count }, (_, i) =>
    SecureStore.deleteItemAsync(`${key}.${manifest.generation}.${i}`)));
}
export const sessionStorage = {
  async getItem(rawKey) {
    if (Platform.OS === 'web') return sessionStorageWeb()?.getItem(rawKey) ?? null;
    const key = safeKey(rawKey);
    const raw = await SecureStore.getItemAsync(key);
    if (!raw) return null;
    const manifest = JSON.parse(raw);
    const chunks = await Promise.all(Array.from({ length: manifest.count }, (_, i) =>
      SecureStore.getItemAsync(`${key}.${manifest.generation}.${i}`)));
    if (chunks.some((value) => value === null)) throw new Error('Unable to restore the saved session.');
    const value = chunks.join('');
    return manifest.encoding === 'uri' ? decodeURIComponent(value) : value;
  },
  async setItem(rawKey, value) {
    if (Platform.OS === 'web') { sessionStorageWeb()?.setItem(rawKey, value); return; }
    const key = safeKey(rawKey);
    const old = await SecureStore.getItemAsync(key);
    // ASCII encoding keeps each chunk under native byte limits even for emoji.
    const encoded = encodeURIComponent(value);
    const manifest = { encoding: 'uri', generation: `${Date.now()}-${Math.random().toString(36).slice(2)}`, count: Math.ceil(encoded.length / CHUNK_SIZE) };
    try {
      for (let i = 0; i < manifest.count; i++) {
        await SecureStore.setItemAsync(`${key}.${manifest.generation}.${i}`, encoded.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
      }
      await SecureStore.setItemAsync(key, JSON.stringify(manifest));
    } catch (error) {
      await removeChunks(key, manifest).catch(() => {});
      throw error;
    }
    if (old) await removeChunks(key, JSON.parse(old)).catch(() => {});
  },
  async removeItem(rawKey) {
    if (Platform.OS === 'web') { sessionStorageWeb()?.removeItem(rawKey); return; }
    const key = safeKey(rawKey);
    const old = await SecureStore.getItemAsync(key);
    await SecureStore.deleteItemAsync(key);
    if (old) await removeChunks(key, JSON.parse(old));
  },
};
function sessionStorageWeb() {
  return typeof window === 'undefined' ? undefined : window.sessionStorage;
}
