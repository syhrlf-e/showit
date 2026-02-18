import { type StateStorage } from "zustand/middleware";

/**
 * Get appropriate storage based on authentication status
 * - Guest (not logged in): sessionStorage (temporary, clears on browser close)
 * - Logged in: localStorage (persistent)
 */
export function getAuthAwareStorage(): StateStorage {
  // Check if we're in browser environment
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  // Check auth status via localStorage (next-auth stores session token there)
  // If next-auth session exists, user is logged in
  const hasAuthSession = () => {
    try {
      const keys = Object.keys(localStorage);
      return keys.some(
        (key) =>
          key.startsWith("next-auth") ||
          key.includes("session-token") ||
          key.includes("__Secure-next-auth"),
      );
    } catch {
      return false;
    }
  };

  const isLoggedIn = hasAuthSession();

  // Return appropriate storage
  const storage = isLoggedIn ? localStorage : sessionStorage;

  return {
    getItem: (name) => storage.getItem(name),
    setItem: (name, value) => storage.setItem(name, value),
    removeItem: (name) => storage.removeItem(name),
  };
}

/**
 * Clear all ERD storage on logout
 */
export function clearERDStorage() {
  if (typeof window === "undefined") return;

  const storageKey = "erd-storage-mysql";
  localStorage.removeItem(storageKey);
  sessionStorage.removeItem(storageKey);
}
