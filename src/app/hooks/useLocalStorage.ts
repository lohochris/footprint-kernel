import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Stable LocalStorage Hook - Fixes infinite re-render loops
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
) {
  // Use a ref to store the initialValue to prevent re-triggering if it's an object/array
  const initialValueRef = useRef(initialValue);

  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValueRef.current;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValueRef.current;
    } catch (error) {
      console.warn(`[Vault] Error reading key "${key}":`, error);
      return initialValueRef.current;
    }
  }, [key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Persistence wrapper - FIXED: No longer depends on 'storedValue'
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          window.dispatchEvent(new Event('local-storage-update'));
        }
        return valueToStore;
      });
    } catch (error) {
      console.error(`[Vault] Error writing key "${key}":`, error);
    }
  }, [key]);

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValueRef.current);
        window.dispatchEvent(new Event('local-storage-update'));
      }
    } catch (error) {
      console.error(`[Vault] Error removing key "${key}":`, error);
    }
  }, [key]);

  useEffect(() => {
    const handleUpdate = () => {
      setStoredValue(readValue());
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('local-storage-update', handleUpdate);
    
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('local-storage-update', handleUpdate);
    };
  }, [readValue]);

  return [storedValue, setValue, removeValue] as const;
}

/**
 * Storage Metrics Hook
 */
export function useStorageSize() {
  const [size, setSize] = useState<number>(0);

  const calculateSize = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    let totalSize = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && (key.includes('footprint_') || key.includes('audit_'))) {
        const value = window.localStorage.getItem(key) || '';
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
 * Purge Hook
 */
export function useClearAuditData() {
  return useCallback(() => {
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
}