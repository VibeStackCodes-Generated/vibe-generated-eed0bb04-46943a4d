/**
 * @fileoverview Complete guide for using the localStorage persistence system
 *
 * This file documents the persistence architecture and provides examples for:
 * - localStorage versioning and schema management
 * - Flow and pipeline CRUD operations
 * - Export/import functionality
 * - React hooks integration
 * - Error handling and recovery
 *
 * ## Architecture Overview
 *
 * The persistence system has three layers:
 *
 * 1. **Storage Layer** (localStorage.ts)
 *    - VersionedStorage: Base class for versioned persistence
 *    - FlowStorage: Specialized storage for flows
 *    - PipelineStorage: Specialized storage for pipelines
 *    - JSON schema versioning for data migrations
 *
 * 2. **Hook Layer** (useLocalStorage.ts)
 *    - useLocalStorage: Generic hook for any data type
 *    - useVersionedLocalStorage: Hook with version tracking
 *    - useMultipleLocalStorage: Hook for managing multiple keys
 *
 * 3. **Domain Layer** (useFlowPersistence.ts)
 *    - useFlowPersistence: High-level API for flows
 *    - usePipelinePersistence: High-level API for pipelines
 *    - useFlowAndPipelinePersistence: Combined API
 *
 * ## Data Model
 *
 * ### Flow
 * ```typescript
 * interface Flow {
 *   id: string                           // Unique identifier
 *   name: string                         // Display name
 *   description?: string                 // Optional description
 *   nodes: FlowNode[]                    // Orchestration nodes
 *   edges: FlowEdge[]                    // Connections between nodes
 *   createdAt: number                    // Unix timestamp
 *   updatedAt: number                    // Unix timestamp
 *   metadata?: Record<string, unknown>   // Custom data
 * }
 * ```
 *
 * ### Pipeline
 * ```typescript
 * interface Pipeline {
 *   id: string                           // Unique identifier
 *   name: string                         // Display name
 *   description?: string                 // Optional description
 *   flowId: string                       // Reference to flow
 *   schedule?: string                    // Cron expression
 *   enabled: boolean                     // Is pipeline active
 *   createdAt: number                    // Unix timestamp
 *   updatedAt: number                    // Unix timestamp
 *   lastRunAt?: number                   // Last execution time
 *   metadata?: Record<string, unknown>   // Custom data
 * }
 * ```
 *
 * ## Usage Examples
 *
 * ### Example 1: Basic Flow Creation
 * ```typescript
 * import { useFlowPersistence } from '@/hooks'
 *
 * function MyComponent() {
 *   const { saveFlow, flows } = useFlowPersistence()
 *
 *   const handleCreateFlow = () => {
 *     const flow: Flow = {
 *       id: `flow-${Date.now()}`,
 *       name: 'My First Flow',
 *       nodes: [],
 *       edges: [],
 *       createdAt: Date.now(),
 *       updatedAt: Date.now(),
 *     }
 *     saveFlow(flow)
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleCreateFlow}>Create Flow</button>
 *       <p>Total flows: {flows.length}</p>
 *     </div>
 *   )
 * }
 * ```
 *
 * ### Example 2: Flow Editor with Nodes and Edges
 * ```typescript
 * function FlowEditor({ flowId }: { flowId: string }) {
 *   const { getFlow, addNode, updateNode, removeNode, addEdge, removeEdge } = useFlowPersistence()
 *
 *   const flow = getFlow(flowId)
 *
 *   const handleAddNode = (nodeData: FlowNode) => {
 *     addNode(flowId, nodeData)
 *   }
 *
 *   const handleMoveNode = (nodeId: string, x: number, y: number) => {
 *     updateNode(flowId, nodeId, { position: { x, y } })
 *   }
 *
 *   const handleDeleteNode = (nodeId: string) => {
 *     removeNode(flowId, nodeId)
 *   }
 *
 *   // ... render UI
 * }
 * ```
 *
 * ### Example 3: Pipeline Management
 * ```typescript
 * function PipelineManager() {
 *   const {
 *     pipelines,
 *     savePipeline,
 *     updatePipeline,
 *     enablePipeline,
 *     disablePipeline,
 *     recordPipelineRun,
 *   } = usePipelinePersistence()
 *
 *   const handleSchedulePipeline = (flowId: string, schedule: string) => {
 *     const pipeline: Pipeline = {
 *       id: `pipeline-${Date.now()}`,
 *       name: `Scheduled for ${schedule}`,
 *       flowId,
 *       schedule,
 *       enabled: true,
 *       createdAt: Date.now(),
 *       updatedAt: Date.now(),
 *     }
 *     savePipeline(pipeline)
 *   }
 *
 *   const handleTogglePipeline = (pipelineId: string, enabled: boolean) => {
 *     if (enabled) {
 *       enablePipeline(pipelineId)
 *     } else {
 *       disablePipeline(pipelineId)
 *     }
 *   }
 *
 *   // ... render UI
 * }
 * ```
 *
 * ### Example 4: Export and Backup
 * ```typescript
 * function BackupManager() {
 *   const { exportFlowWithPipelines } = useFlowAndPipelinePersistence()
 *
 *   const handleBackup = (flowId: string) => {
 *     const exported = exportFlowWithPipelines(flowId)
 *     if (exported) {
 *       // Send to server, download, etc.
 *       console.log(exported)
 *     }
 *   }
 *
 *   // ... render UI
 * }
 * ```
 *
 * ### Example 5: Using Generic useLocalStorage Hook
 * ```typescript
 * function UserPreferences() {
 *   const [preferences, setPreferences, { isLoading, error }] = useLocalStorage(
 *     'app:preferences',
 *     { theme: 'light', sidebarCollapsed: false }
 *   )
 *
 *   const toggleTheme = () => {
 *     setPreferences(prev => ({
 *       ...prev,
 *       theme: prev.theme === 'light' ? 'dark' : 'light'
 *     }))
 *   }
 *
 *   // ... render UI
 * }
 * ```
 *
 * ### Example 6: Versioned Storage with Migration
 * ```typescript
 * function MyComponent() {
 *   const [data, setData, { dataVersion }] = useVersionedLocalStorage(
 *     'app:config',
 *     { version1Only: 'value' },
 *     2,
 *     (oldData, fromVersion, toVersion) => {
 *       if (fromVersion === 1 && toVersion === 2) {
 *         // Migrate from v1 to v2
 *         return {
 *           ...oldData,
 *           newField: 'default',
 *         }
 *       }
 *       return null
 *     }
 *   )
 *
 *   // ... use data
 * }
 * ```
 *
 * ## Schema Versioning and Migration
 *
 * Each stored item includes a version number. When loading data, the system checks the version:
 *
 * - If versions match: Data is returned as-is
 * - If versions differ: Migration function is called
 * - If no migration is available: Data is discarded (safe default)
 *
 * To support version migrations:
 *
 * ```typescript
 * class CustomStorage extends VersionedStorage<MyType> {
 *   protected migrateData(versionedData: VersionedData<MyType>): MyType | null {
 *     if (versionedData.version === 1 && this.currentVersion === 2) {
 *       // Add migration logic
 *       return { ...versionedData.data, newField: 'default' }
 *     }
 *     return null
 *   }
 * }
 * ```
 *
 * ## Error Handling
 *
 * All hooks include error handling for:
 * - localStorage quota exceeded (rare)
 * - JSON parsing errors
 * - Corrupted data
 * - Permission issues
 *
 * Errors are logged to console and returned via the error state:
 *
 * ```typescript
 * const [data, setData, { error }] = useLocalStorage('key', {})
 *
 * if (error) {
 *   console.error('Storage error:', error.message)
 * }
 * ```
 *
 * ## Best Practices
 *
 * 1. **Use unique keys**: Prefix keys with your app namespace (e.g., 'vibestack:flows')
 * 2. **Handle loading states**: Check isLoading before rendering
 * 3. **Graceful degradation**: Provide fallbacks when storage is unavailable
 * 4. **Regular backups**: Export critical flows periodically
 * 5. **Clear sensitive data**: Remove auth tokens from exported data
 * 6. **Version your schemas**: Always include version info for future migrations
 * 7. **Test migrations**: Ensure migration functions work correctly
 * 8. **Monitor quota**: Be aware of localStorage size limits (~5-10MB)
 *
 * ## Performance Considerations
 *
 * - localStorage reads/writes are synchronous (blocking)
 * - Keep individual items under 1MB
 * - Consider IndexedDB for larger datasets
 * - Use React.memo to prevent unnecessary re-renders
 * - Batch updates when possible
 *
 * ## Browser Support
 *
 * localStorage is supported in all modern browsers:
 * - Chrome 4+
 * - Firefox 3.5+
 * - Safari 4+
 * - IE 8+
 * - Edge (all versions)
 *
 * For older browsers, implement a fallback using sessionStorage or memory.
 *
 * ## Debugging
 *
 * To view stored data in browser DevTools:
 * 1. Open Developer Tools (F12)
 * 2. Go to Application → Local Storage
 * 3. Look for keys starting with 'vibestack:'
 * 4. Click to expand and view the JSON data
 *
 * To clear all data:
 * ```javascript
 * Object.keys(localStorage)
 *   .filter(k => k.startsWith('vibestack:'))
 *   .forEach(k => localStorage.removeItem(k))
 * ```
 *
 * ## Integration with Backend
 *
 * The persistence system is designed to work alongside a backend:
 *
 * 1. **Local-first development**: Use localStorage during development
 * 2. **Sync on save**: Call API when user saves a flow
 * 3. **Sync on load**: Load from server and update localStorage
 * 4. **Conflict resolution**: Handle concurrent updates (last-write-wins or merge)
 * 5. **Offline support**: localStorage acts as offline cache
 *
 * Example:
 * ```typescript
 * async function saveFlowWithSync(flow: Flow) {
 *   // Save locally immediately (optimistic update)
 *   saveFlow(flow)
 *
 *   try {
 *     // Sync to server
 *     const response = await fetch('/api/flows', {
 *       method: 'POST',
 *       body: JSON.stringify(flow),
 *     })
 *     const serverFlow = await response.json()
 *     // Update with server version (includes timestamps, etc.)
 *     saveFlow(serverFlow)
 *   } catch (error) {
 *     // Server is down, but data is already saved locally
 *     console.error('Failed to sync flow to server')
 *   }
 * }
 * ```
 */

// This file is purely documentation. No code exports.
export {}
