"use client";

import { useCallback, useSyncExternalStore } from "react";

const CHANGE_EVENT = "local-storage-change";

/**
 * Reads and writes one string in localStorage and keeps every component
 * that uses the same key in sync. Built on useSyncExternalStore, which is
 * React's recommended way to subscribe to browser storage.
 *
 * @param key           The localStorage key.
 * @param defaultValue  The value when nothing is saved yet (in the browser).
 * @param serverValue   The value used while the server renders and while the page hydrates.
 */
export function useLocalStorage(key: string, defaultValue: string, serverValue = defaultValue) {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("storage", onChange);
    window.addEventListener(CHANGE_EVENT, onChange);

    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(CHANGE_EVENT, onChange);
    };
  }, []);

  const getSnapshot = () => {
    try {
      return window.localStorage.getItem(key) ?? defaultValue;
    } catch {
      return defaultValue; // Storage can be blocked (for example private mode).
    }
  };

  const getServerSnapshot = () => serverValue;

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (nextValue: string) => {
      try {
        window.localStorage.setItem(key, nextValue);
      } catch {
        // Ignore: the app still works, the value just will not persist.
      }
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [key],
  );

  return [value, setValue] as const;
}
