/**
 * Custom React hooks for localStorage integration
 * Provides reactive state management with automatic persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Generic useLocalStorage hook
 * Automatically syncs state with localStorage and handles errors
 *
 * @template T - The type of data to store
 * @param key - The localStorage key
 * @param initialValue - Default value if nothing is stored
 * @returns [value, setValue, { remove, isLoading, error }]
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State for the stored value
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Use a ref to track if component is mounted (avoid state updates on unmounted components)
  const isMountedRef = useRef(true)

  // Read from localStorage on mount
  useEffect(() => {
    try {
      setIsLoading(true)
      setError(null)

      const item = window.localStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item) as T
        if (isMountedRef.current) {
          setStoredValue(parsed)
        }
      } else if (isMountedRef.current) {
        setStoredValue(initialValue)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error reading localStorage')
      if (isMountedRef.current) {
        setError(error)
        console.error(`Error reading localStorage key "${key}":`, error)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [key, initialValue])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Write to localStorage when state changes
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setError(null)

        const valueToStore = value instanceof Function ? value(storedValue) : value

        if (isMountedRef.current) {
          setStoredValue(valueToStore)
        }

        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error writing to localStorage')
        if (isMountedRef.current) {
          setError(error)
        }
        console.error(`Error writing to localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // Remove from localStorage
  const remove = useCallback(() => {
    try {
      setError(null)
      window.localStorage.removeItem(key)
      if (isMountedRef.current) {
        setStoredValue(initialValue)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error removing from localStorage')
      if (isMountedRef.current) {
        setError(error)
      }
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, { remove, isLoading, error }] as const
}

/**
 * Hook for storing and retrieving JSON with versioning
 * Useful for persisting complex data structures with migration support
 *
 * @template T - The type of data to store
 * @param key - The localStorage key
 * @param initialValue - Default value if nothing is stored
 * @param version - Current schema version
 * @param migrate - Optional migration function for upgrading data from older versions
 */
export function useVersionedLocalStorage<T>(
  key: string,
  initialValue: T,
  version: number = 1,
  migrate?: (data: unknown, fromVersion: number, toVersion: number) => T | null
) {
  interface StoredData {
    version: number
    data: T
    timestamp: number
  }

  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [dataVersion, setDataVersion] = useState<number>(version)

  const isMountedRef = useRef(true)

  // Read from localStorage on mount
  useEffect(() => {
    try {
      setIsLoading(true)
      setError(null)

      const item = window.localStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item) as StoredData
        const storedVersion = parsed.version || 1

        if (storedVersion === version) {
          // Data is at current version
          if (isMountedRef.current) {
            setStoredValue(parsed.data)
            setDataVersion(storedVersion)
          }
        } else if (migrate) {
          // Attempt migration
          const migratedData = migrate(parsed.data, storedVersion, version)
          if (migratedData && isMountedRef.current) {
            setStoredValue(migratedData)
            setDataVersion(version)
          } else if (isMountedRef.current) {
            console.warn(`Migration failed for key "${key}". Using initial value.`)
            setStoredValue(initialValue)
            setDataVersion(version)
          }
        } else {
          // No migration function provided, discard old data
          if (isMountedRef.current) {
            console.warn(
              `Data version mismatch for key "${key}" (stored: ${storedVersion}, current: ${version}). No migration provided. Using initial value.`
            )
            setStoredValue(initialValue)
            setDataVersion(version)
          }
        }
      } else if (isMountedRef.current) {
        setStoredValue(initialValue)
        setDataVersion(version)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error reading localStorage')
      if (isMountedRef.current) {
        setError(error)
        console.error(`Error reading localStorage key "${key}":`, error)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [key, initialValue, version, migrate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Write to localStorage with version
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setError(null)

        const valueToStore = value instanceof Function ? value(storedValue) : value

        const versionedData: StoredData = {
          version,
          data: valueToStore,
          timestamp: Date.now(),
        }

        if (isMountedRef.current) {
          setStoredValue(valueToStore)
        }

        window.localStorage.setItem(key, JSON.stringify(versionedData))
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error writing to localStorage')
        if (isMountedRef.current) {
          setError(error)
        }
        console.error(`Error writing to localStorage key "${key}":`, error)
      }
    },
    [key, storedValue, version]
  )

  // Remove from localStorage
  const remove = useCallback(() => {
    try {
      setError(null)
      window.localStorage.removeItem(key)
      if (isMountedRef.current) {
        setStoredValue(initialValue)
        setDataVersion(version)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error removing from localStorage')
      if (isMountedRef.current) {
        setError(error)
      }
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue, version])

  return [storedValue, setValue, { remove, isLoading, error, dataVersion }] as const
}

/**
 * Hook for syncing multiple localStorage items at once
 * Useful for managing related data that should be saved together
 *
 * @param storageMap - Object mapping keys to their initial values
 * @returns Object with the same shape as storageMap, plus control methods
 */
export function useMultipleLocalStorage<T extends Record<string, unknown>>(storageMap: T) {
  const [values, setValues] = useState<T>(storageMap)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const isMountedRef = useRef(true)

  // Read all values from localStorage on mount
  useEffect(() => {
    try {
      setIsLoading(true)
      setError(null)

      const loadedValues: Partial<T> = {}
      let anyValueLoaded = false

      for (const [key, initialValue] of Object.entries(storageMap)) {
        const item = window.localStorage.getItem(key)
        if (item) {
          loadedValues[key as keyof T] = JSON.parse(item)
          anyValueLoaded = true
        } else {
          loadedValues[key as keyof T] = initialValue as T[keyof T]
        }
      }

      if (isMountedRef.current) {
        setValues(loadedValues as T)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error reading localStorage')
      if (isMountedRef.current) {
        setError(error)
        console.error('Error reading from localStorage:', error)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [storageMap])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Update a single value
  const setStorageValue = useCallback(
    (key: keyof T, value: unknown) => {
      try {
        setError(null)

        if (isMountedRef.current) {
          setValues((prev) => ({
            ...prev,
            [key]: value,
          }))
        }

        window.localStorage.setItem(String(key), JSON.stringify(value))
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error writing to localStorage')
        if (isMountedRef.current) {
          setError(error)
        }
        console.error(`Error writing to localStorage key "${key}":`, error)
      }
    },
    []
  )

  // Clear all stored values
  const clearAll = useCallback(() => {
    try {
      setError(null)

      for (const key of Object.keys(storageMap)) {
        window.localStorage.removeItem(key)
      }

      if (isMountedRef.current) {
        setValues(storageMap)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error clearing localStorage')
      if (isMountedRef.current) {
        setError(error)
      }
      console.error('Error clearing localStorage:', error)
    }
  }, [storageMap])

  return { ...values, setStorageValue, clearAll, isLoading, error }
}
