import { UserProfileInfo } from '../types/workspace';

const PROFILE_STORAGE_KEY = 'synaptix_user_profile_v1';
const SESSION_STORAGE_KEY = 'synaptix_auth_session_email';
const DB_NAME = 'synaptix_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'user_avatars';

export const DEFAULT_USER_PROFILE: UserProfileInfo = {
  name: 'Alex Vance',
  displayName: 'Alex Vance',
  email: 'alex.vance@enterprise.com',
  role: 'Enterprise Administrator',
  organization: 'SYNAPTIX COMMAND',
  jobTitle: 'Enterprise Systems Lead',
  department: 'Intelligence & Operations',
  phone: '+1 (555) 234-8901',
  bio: 'Enterprise security and cross-workspace intelligence orchestration lead for Synaptix Command.',
};

/**
 * Open or upgrade the client-side IndexedDB database for media & avatar binary storage.
 * IndexedDB provides generous quota (>50MB) and does not congest localStorage.
 */
function openAvatarDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in current environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Persist an avatar image in IndexedDB indexed by user email.
 */
export async function saveAvatarToStorage(userEmail: string, dataUrl: string | null): Promise<void> {
  try {
    const db = await openAvatarDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      if (!dataUrl) {
        // Remove photo record
        const req = store.delete(userEmail.toLowerCase());
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } else {
        // Save photo record
        const req = store.put({ id: userEmail.toLowerCase(), dataUrl, updatedAt: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      }

      tx.oncomplete = () => db.close();
    });
  } catch (err) {
    console.warn('IndexedDB unavailable, falling back to profile record cache:', err);
  }
}

/**
 * Retrieve the saved avatar image from IndexedDB.
 */
export async function loadAvatarFromStorage(userEmail: string): Promise<string | null> {
  try {
    const db = await openAvatarDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(userEmail.toLowerCase());

      req.onsuccess = () => {
        const result = req.result;
        resolve(result && result.dataUrl ? result.dataUrl : null);
      };

      req.onerror = () => {
        resolve(null);
      };

      tx.oncomplete = () => db.close();
    });
  } catch {
    return null;
  }
}

/**
 * Load metadata user profile from localStorage.
 */
export function loadUserProfile(userEmail?: string): UserProfileInfo {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const emailKey = userEmail ? `${PROFILE_STORAGE_KEY}_${userEmail.toLowerCase()}` : PROFILE_STORAGE_KEY;
    const raw = localStorage.getItem(emailKey) || localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      if (userEmail) {
        const computedName = userEmail.split('@')[0].replace('.', ' ');
        return {
          ...DEFAULT_USER_PROFILE,
          name: computedName,
          displayName: computedName,
          email: userEmail,
        };
      }
      return DEFAULT_USER_PROFILE;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USER_PROFILE, ...parsed };
  } catch (e) {
    console.warn('Failed to parse user profile from localStorage:', e);
    return DEFAULT_USER_PROFILE;
  }
}

/**
 * Save user profile metadata to localStorage.
 */
export function saveUserProfile(profile: UserProfileInfo): void {
  if (typeof window === 'undefined') return;
  try {
    const emailKey = `${PROFILE_STORAGE_KEY}_${profile.email.toLowerCase()}`;
    // Exclude oversized base64 strings from localStorage to avoid quota issues
    const { avatarUrl, ...metadata } = profile;
    const serialized = JSON.stringify({ ...metadata, hasCustomAvatar: !!avatarUrl });
    localStorage.setItem(emailKey, serialized);
    localStorage.setItem(PROFILE_STORAGE_KEY, serialized);
  } catch (e) {
    console.error('Failed to save user profile to localStorage:', e);
  }
}

/**
 * Load the active authenticated session email from localStorage/sessionStorage.
 */
export function loadSessionEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_STORAGE_KEY) || null;
}

/**
 * Save the active authenticated session email.
 */
export function saveSessionEmail(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_STORAGE_KEY, email);
}

/**
 * Clear the active authenticated session email on logout.
 */
export function clearSessionEmail(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

