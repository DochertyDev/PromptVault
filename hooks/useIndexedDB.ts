import { useState, useEffect } from 'react';

const DB_NAME = 'PromptVaultDB';
const STORE_NAME = 'promptvault_store';
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

function useIndexedDB<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Read from IndexedDB on mount
  useEffect(() => {
    const loadFromDB = async () => {
      try {
        const db = await openDatabase();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          if (request.result !== undefined) {
            setStoredValue(request.result);
          } else {
            // Fall back to localStorage if IndexedDB is empty
            try {
              const item = window.localStorage.getItem(key);
              if (item) {
                const parsed = JSON.parse(item);
                setStoredValue(parsed);
              }
            } catch (error) {
              console.warn(`Error reading from localStorage key "${key}":`, error);
            }
          }
          setIsLoaded(true);
        };

        request.onerror = () => {
          console.warn(`Error reading from IndexedDB key "${key}":`, request.error);
          setIsLoaded(true);
        };
      } catch (error) {
        console.warn(`Failed to open IndexedDB:`, error);
        setIsLoaded(true);
      }
    };

    loadFromDB();
  }, [key]);

  // Write to both IndexedDB and localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      // Save to IndexedDB
      openDatabase()
        .then((db) => {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          store.put(valueToStore, key);
        })
        .catch((error) => {
          console.warn(`Error writing to IndexedDB key "${key}":`, error);
          // Fall back to localStorage if IndexedDB fails
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (storageError) {
            console.warn(`Error writing to localStorage key "${key}":`, storageError);
          }
        });

      // Also save to localStorage as backup
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error writing to localStorage key "${key}":`, error);
      }
    } catch (error) {
      console.warn(`Error in setValue for key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export default useIndexedDB;
