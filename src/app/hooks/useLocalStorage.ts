import { useState, useEffect, useCallback } from 'react';

/**
 * Enhanced LocalStorage Hook for 2026 Privacy Standards
 * Features: Type-safe generics, automatic JSON serialization, and cross-tab syncing.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  
  // Initial state fetcher
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`[Vault] Error reading key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Persistence wrapper
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch a custom event so other components using the same key update
        window.dispatchEvent(new Event('local-storage-update'));
      }
    } catch (error) {
      console.error(`[Vault] Error writing key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`[Vault] Error removing key "${key}":`, error);
    }
  };

  // Listen for changes in other tabs or through dispatch
  useEffect(() => {
    const handleUpdate = () => setStoredValue(readValue());
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('local-storage-update', handleUpdate);
    
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('local-storage-update', handleUpdate);
    };
  }, [readValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Storage Metrics Hook
 * Calculates total KB used by the application
 */
export function useStorageSize() {
  const [size, setSize] = useState<number>(0);

  const calculateSize = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    let totalSize = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && (key.startsWith('footprint_') || key.startsWith('audit_'))) {
        const value = window.localStorage.getItem(key) || '';
        // Approximate byte size (UTF-16 uses 2 bytes per char)
        totalSize += (key.length + value.length) * 2;
      }
    }
    setSize(totalSize / 1024);
  }, []);

  useEffect(() => {
    calculateSize();
    window.addEventListener('local-storage-update', calculateSize);
    return () => window.removeEventListener('local-storage-update', calculateSize);
  }, [calculateSize]);

  return size;
}

/**
 * Purge Logic Hook
 */
export function useClearAuditData() {
  const clearAll = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    
    const allKeys = Object.keys(window.localStorage);
    const auditKeys = allKeys.filter(key => 
      key.startsWith('footprint_') || 
      key.startsWith('audit_') ||
      key.startsWith('privacy_')
    );
    
    auditKeys.forEach(key => window.localStorage.removeItem(key));
    window.dispatchEvent(new Event('local-storage-update'));
    
    return auditKeys.length;
  }, []);

  return clearAll;
}