import { useState, useEffect, useRef } from 'react';

const DB_NAME = 'PromptVaultDB';
const STORE_NAME = 'promptvault_store';
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
  });
}

async function readDatabase<T>(key: string): Promise<T | undefined> {
  const db = await openDatabase();
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(key);
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error || request.error);
      transaction.onerror = () => reject(transaction.error || request.error);
    });
  } finally {
    db.close();
  }
}

async function writeDatabase<T>(key: string, value: T): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const request = transaction.objectStore(STORE_NAME).put(value, key);
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error || request.error);
      transaction.onerror = () => reject(transaction.error || request.error);
    });
  } finally {
    db.close();
  }
}

function readBackup<T>(key: string, initialValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item === null ? initialValue : JSON.parse(item);
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
}

function useIndexedDB<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [state, setState] = useState({ key, value: initialValue, loaded: false });
  const current = useRef(state);
  const writes = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    current.current = { key, value: initialValue, loaded: false };
    setState(current.current);

    const load = async () => {
      let value: T;
      try {
        const stored = await readDatabase<T>(key);
        value = stored !== undefined ? stored : readBackup(key, initialValue);
      } catch (error) {
        console.warn('Failed to read IndexedDB:', error);
        value = readBackup(key, initialValue);
      }
      if (cancelled) return;
      current.current = { key, value, loaded: true };
      setState(current.current);
    };
    void load();
    return () => { cancelled = true; };
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    // The app hides editing controls during hydration; also guard direct callers.
    if (!current.current.loaded || current.current.key !== key) return;
    try {
      const valueToStore = value instanceof Function ? value(current.current.value) : value;
      current.current = { key, value: valueToStore, loaded: true };
      setState(current.current);
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error writing localStorage key "${key}":`, error);
      }
      // Serialize writes so an older connection cannot commit after a newer update.
      writes.current = writes.current
        .then(() => writeDatabase(key, valueToStore))
        .catch(error => { console.warn(`Error writing IndexedDB key "${key}":`, error); });
    } catch (error) {
      console.warn(`Error setting storage key "${key}":`, error);
    }
  };

  return [state.value, setValue, state.key === key && state.loaded];
}

export default useIndexedDB;
