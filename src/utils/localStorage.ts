/**
 * localStorage utilities for persisting flows and pipelines with versioning support
 * Provides JSON schema versioning to handle data migrations across app versions
 */

/**
 * Schema versioning constants
 */
export const STORAGE_SCHEMA_VERSION = 1

/**
 * Storage keys for different data types
 */
export enum StorageKey {
  FLOWS = 'vibestack:flows',
  PIPELINES = 'vibestack:pipelines',
  APP_STATE = 'vibestack:app-state',
}

/**
 * Base interface for versioned storage data
 */
export interface VersionedData<T> {
  version: number
  data: T
  timestamp: number
}

/**
 * Flow data structure
 */
export interface Flow {
  id: string
  name: string
  description?: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  createdAt: number
  updatedAt: number
  metadata?: Record<string, unknown>
}

/**
 * Flow node in the orchestration graph
 */
export interface FlowNode {
  id: string
  type: string
  label: string
  position: { x: number; y: number }
  data?: Record<string, unknown>
  config?: Record<string, unknown>
}

/**
 * Edge connecting two nodes in a flow
 */
export interface FlowEdge {
  id: string
  source: string
  target: string
  label?: string
  data?: Record<string, unknown>
}

/**
 * Pipeline execution configuration
 */
export interface Pipeline {
  id: string
  name: string
  description?: string
  flowId: string
  schedule?: string
  enabled: boolean
  createdAt: number
  updatedAt: number
  lastRunAt?: number
  metadata?: Record<string, unknown>
}

/**
 * Generic storage class with versioning support
 */
export class VersionedStorage<T> {
  private key: string
  private currentVersion: number

  constructor(key: string, version: number = STORAGE_SCHEMA_VERSION) {
    this.key = key
    this.currentVersion = version
  }

  /**
   * Save data to localStorage with versioning
   */
  save(data: T): void {
    try {
      const versionedData: VersionedData<T> = {
        version: this.currentVersion,
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(this.key, JSON.stringify(versionedData))
    } catch (error) {
      console.error(`Failed to save to localStorage key "${this.key}":`, error)
      this.handleStorageError(error)
    }
  }

  /**
   * Load data from localStorage with version checking
   */
  load(): T | null {
    try {
      const stored = localStorage.getItem(this.key)
      if (!stored) {
        return null
      }

      const parsed = JSON.parse(stored) as VersionedData<T>

      // Validate version
      if (!this.isValidVersion(parsed.version)) {
        console.warn(
          `Data version ${parsed.version} is outdated for key "${this.key}". Attempting migration...`
        )
        return this.migrateData(parsed)
      }

      return parsed.data
    } catch (error) {
      console.error(`Failed to load from localStorage key "${this.key}":`, error)
      return null
    }
  }

  /**
   * Get metadata about stored data (version, timestamp)
   */
  getMetadata(): { version: number; timestamp: number } | null {
    try {
      const stored = localStorage.getItem(this.key)
      if (!stored) {
        return null
      }

      const parsed = JSON.parse(stored) as VersionedData<T>
      return {
        version: parsed.version,
        timestamp: parsed.timestamp,
      }
    } catch (error) {
      console.error(`Failed to get metadata for key "${this.key}":`, error)
      return null
    }
  }

  /**
   * Delete data from localStorage
   */
  delete(): void {
    try {
      localStorage.removeItem(this.key)
    } catch (error) {
      console.error(`Failed to delete from localStorage key "${this.key}":`, error)
    }
  }

  /**
   * Check if stored version is compatible
   */
  private isValidVersion(storedVersion: number): boolean {
    return storedVersion === this.currentVersion
  }

  /**
   * Migrate data from older versions to current version
   * Override this method for custom migration logic
   */
  protected migrateData(versionedData: VersionedData<T>): T | null {
    // Default migration: return null to discard old data
    // Subclasses should override this method for proper migrations
    console.warn(
      `No migration strategy defined for version ${versionedData.version} -> ${this.currentVersion}`
    )
    return null
  }

  /**
   * Handle storage quota errors and other storage issues
   */
  private handleStorageError(error: unknown): void {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        console.error(
          'localStorage quota exceeded. Consider clearing old data or implementing compression.'
        )
      }
    }
  }
}

/**
 * Flow storage with custom versioning
 */
export class FlowStorage extends VersionedStorage<Flow[]> {
  constructor(key: string = StorageKey.FLOWS, version: number = STORAGE_SCHEMA_VERSION) {
    super(key, version)
  }

  /**
   * Save a single flow
   */
  saveFlow(flow: Flow): void {
    const flows = this.load() || []
    const index = flows.findIndex((f) => f.id === flow.id)

    if (index >= 0) {
      flows[index] = { ...flow, updatedAt: Date.now() }
    } else {
      flows.push({ ...flow, createdAt: Date.now(), updatedAt: Date.now() })
    }

    this.save(flows)
  }

  /**
   * Get a single flow by ID
   */
  getFlow(id: string): Flow | null {
    const flows = this.load() || []
    return flows.find((f) => f.id === id) || null
  }

  /**
   * Delete a single flow by ID
   */
  deleteFlow(id: string): void {
    const flows = this.load() || []
    const filtered = flows.filter((f) => f.id !== id)
    this.save(filtered)
  }

  /**
   * Migrate flows from version 1 to version 2 (if needed)
   */
  protected migrateData(versionedData: VersionedData<Flow[]>): Flow[] | null {
    if (versionedData.version === 1 && this.currentVersion === 2) {
      // Example migration: add new fields with defaults
      return versionedData.data.map((flow) => ({
        ...flow,
        // Add any new required fields here with defaults
      }))
    }

    return null
  }
}

/**
 * Pipeline storage with custom versioning
 */
export class PipelineStorage extends VersionedStorage<Pipeline[]> {
  constructor(key: string = StorageKey.PIPELINES, version: number = STORAGE_SCHEMA_VERSION) {
    super(key, version)
  }

  /**
   * Save a single pipeline
   */
  savePipeline(pipeline: Pipeline): void {
    const pipelines = this.load() || []
    const index = pipelines.findIndex((p) => p.id === pipeline.id)

    if (index >= 0) {
      pipelines[index] = { ...pipeline, updatedAt: Date.now() }
    } else {
      pipelines.push({ ...pipeline, createdAt: Date.now(), updatedAt: Date.now() })
    }

    this.save(pipelines)
  }

  /**
   * Get a single pipeline by ID
   */
  getPipeline(id: string): Pipeline | null {
    const pipelines = this.load() || []
    return pipelines.find((p) => p.id === id) || null
  }

  /**
   * Get pipelines by flow ID
   */
  getPipelinesByFlow(flowId: string): Pipeline[] {
    const pipelines = this.load() || []
    return pipelines.filter((p) => p.flowId === flowId)
  }

  /**
   * Delete a single pipeline by ID
   */
  deletePipeline(id: string): void {
    const pipelines = this.load() || []
    const filtered = pipelines.filter((p) => p.id !== id)
    this.save(filtered)
  }

  /**
   * Migrate pipelines from older versions
   */
  protected migrateData(versionedData: VersionedData<Pipeline[]>): Pipeline[] | null {
    if (versionedData.version === 1 && this.currentVersion === 2) {
      // Example migration: add new fields with defaults
      return versionedData.data.map((pipeline) => ({
        ...pipeline,
        // Add any new required fields here with defaults
      }))
    }

    return null
  }
}

/**
 * Export singleton instances for convenience
 */
export const flowStorage = new FlowStorage()
export const pipelineStorage = new PipelineStorage()
