/**
 * @fileoverview Quick Reference Guide for localStorage Persistence System
 *
 * QUICK START
 * ===========
 *
 * 1. Import hooks in your component:
 *    import { useFlowPersistence } from '@/hooks'
 *
 * 2. Use in your component:
 *    const { flows, saveFlow, deleteFlow } = useFlowPersistence()
 *
 * 3. That's it! Data automatically persists to localStorage
 *
 *
 * AVAILABLE APIs
 * ==============
 *
 * Flow Management:
 *   - useFlowPersistence()        - High-level flow API
 *   - useFlowAndPipelinePersistence() - Combined API for flows + pipelines
 *
 * Pipeline Management:
 *   - usePipelinePersistence()    - High-level pipeline API
 *
 * Generic Storage:
 *   - useLocalStorage()           - Generic hook for any data type
 *   - useVersionedLocalStorage()  - With version tracking
 *   - useMultipleLocalStorage()   - For managing multiple keys
 *
 * Low-level Classes:
 *   - VersionedStorage            - Base class for versioned storage
 *   - FlowStorage                 - Specialized flow storage
 *   - PipelineStorage             - Specialized pipeline storage
 *
 *
 * FLOW API EXAMPLES
 * =================
 *
 * Create a flow:
 *   const newFlow = {
 *     id: `flow-${Date.now()}`,
 *     name: 'My Flow',
 *     nodes: [],
 *     edges: [],
 *     createdAt: Date.now(),
 *     updatedAt: Date.now(),
 *   }
 *   saveFlow(newFlow)
 *
 * Get a flow:
 *   const flow = getFlow('flow-123')
 *
 * Get all flows:
 *   const allFlows = flows  // from hook state
 *
 * Update a flow:
 *   updateFlow('flow-123', { name: 'Updated Name' })
 *
 * Delete a flow:
 *   deleteFlow('flow-123')
 *
 * Add a node:
 *   addNode('flow-123', {
 *     id: 'node-1',
 *     type: 'action',
 *     label: 'My Node',
 *     position: { x: 0, y: 0 },
 *   })
 *
 * Update a node:
 *   updateNode('flow-123', 'node-1', {
 *     position: { x: 100, y: 100 },
 *   })
 *
 * Remove a node:
 *   removeNode('flow-123', 'node-1')
 *
 * Add an edge:
 *   addEdge('flow-123', {
 *     id: 'edge-1',
 *     source: 'node-1',
 *     target: 'node-2',
 *   })
 *
 * Remove an edge:
 *   removeEdge('flow-123', 'edge-1')
 *
 * Export a flow:
 *   const json = exportFlow('flow-123')
 *
 * Import a flow:
 *   const flow = importFlow(jsonString)
 *
 *
 * PIPELINE API EXAMPLES
 * =====================
 *
 * Create a pipeline:
 *   const pipeline = {
 *     id: `pipeline-${Date.now()}`,
 *     name: 'Daily Run',
 *     flowId: 'flow-123',
 *     schedule: '0 0 * * *',
 *     enabled: true,
 *     createdAt: Date.now(),
 *     updatedAt: Date.now(),
 *   }
 *   savePipeline(pipeline)
 *
 * Get a pipeline:
 *   const pipeline = getPipeline('pipeline-123')
 *
 * Get all pipelines for a flow:
 *   const pipelines = getPipelinesByFlow('flow-123')
 *
 * Update a pipeline:
 *   updatePipeline('pipeline-123', { schedule: '0 12 * * *' })
 *
 * Enable/Disable:
 *   enablePipeline('pipeline-123')
 *   disablePipeline('pipeline-123')
 *
 * Record a pipeline run:
 *   recordPipelineRun('pipeline-123')
 *
 * Delete a pipeline:
 *   deletePipeline('pipeline-123')
 *
 *
 * GENERIC STORAGE EXAMPLES
 * ========================
 *
 * Store any data type:
 *   const [count, setCount] = useLocalStorage('app:count', 0)
 *   setCount(count + 1)
 *
 * With version tracking:
 *   const [config, setConfig, { dataVersion }] = useVersionedLocalStorage(
 *     'app:config',
 *     { theme: 'light' },
 *     1,
 *     (oldData, oldV, newV) => { /* migration logic */ }
 *   )
 *
 * Multiple keys at once:
 *   const { theme, sidebarCollapsed, setStorageValue } = useMultipleLocalStorage({
 *     theme: 'light',
 *     sidebarCollapsed: false,
 *   })
 *   setStorageValue('theme', 'dark')
 *
 *
 * KEY FEATURES
 * ============
 *
 * ✓ Automatic persistence to browser localStorage
 * ✓ JSON schema versioning for migrations
 * ✓ Type-safe TypeScript interfaces
 * ✓ Error handling and recovery
 * ✓ Loading states for async operations
 * ✓ Export/import functionality
 * ✓ Batch operations on flows and pipelines
 * ✓ React hooks for component integration
 * ✓ Low-level classes for advanced usage
 * ✓ Comprehensive error handling
 *
 *
 * DATA LOCATIONS
 * ==============
 *
 * localStorage keys follow this pattern:
 *   'vibestack:flows'         - All flows
 *   'vibestack:pipelines'     - All pipelines
 *   'vibestack:app-state'     - General app state
 *   'app:*'                   - Custom app data
 *
 * View in browser DevTools:
 *   1. Press F12
 *   2. Go to Application tab
 *   3. Click Local Storage
 *   4. Look for 'vibestack:' keys
 *
 *
 * BEST PRACTICES
 * ==============
 *
 * 1. Always handle loading and error states:
 *    if (isLoading) return <Spinner />
 *    if (error) return <Error message={error.message} />
 *
 * 2. Use unique flow/pipeline IDs:
 *    id: `flow-${Date.now()}-${Math.random()}`
 *
 * 3. Always set timestamps:
 *    createdAt: Date.now()
 *    updatedAt: Date.now()
 *
 * 4. Regularly backup important flows:
 *    const exported = exportFlowWithPipelines(flowId)
 *    // Save exported to server or download
 *
 * 5. Check localStorage quota:
 *    try { saveFlow(flow) }
 *    catch (e) { /* handle quota exceeded */ }
 *
 * 6. Keep sensitive data out of localStorage:
 *    // Don't store tokens, passwords, etc.
 *
 * 7. Version your data schema:
 *    // Always include version info for future migrations
 *
 *
 * TESTING
 * =======
 *
 * Run the included tests:
 *   import { runAllTests } from '@/utils/__tests__/localStorage.test'
 *   runAllTests()  // Call in browser console
 *
 * Check stored data:
 *   localStorage.getItem('vibestack:flows')
 *   localStorage.getItem('vibestack:pipelines')
 *
 * Clear all data:
 *   Object.keys(localStorage)
 *     .filter(k => k.startsWith('vibestack:'))
 *     .forEach(k => localStorage.removeItem(k))
 *
 *
 * TROUBLESHOOTING
 * ===============
 *
 * Data not saving?
 *   - Check browser console for errors
 *   - Verify localStorage is not disabled
 *   - Check DevTools → Application → LocalStorage
 *
 * Version mismatch warnings?
 *   - You may have old data from a previous version
 *   - Provide a migration function in useVersionedLocalStorage
 *
 * Data disappeared?
 *   - Browser storage might have been cleared
 *   - Check if user ran "Clear Browsing Data"
 *   - Consider backing up important data to server
 *
 * Performance issues?
 *   - Keep items under 1MB
 *   - Use fewer, larger items instead of many small ones
 *   - Consider IndexedDB for very large datasets
 *
 *
 * INTEGRATION WITH BACKEND
 * =========================
 *
 * Typical flow:
 *   1. User creates flow locally (auto-saved to localStorage)
 *   2. User saves (calls backend API)
 *   3. Backend returns updated flow with server timestamps
 *   4. Update localStorage with server version
 *
 * Example:
 *   const handleSave = async (flow: Flow) => {
 *     saveFlow(flow)  // Local save (optimistic)
 *     try {
 *       const response = await api.saveFlow(flow)
 *       saveFlow(response)  // Update with server data
 *     } catch (error) {
 *       // Local version still saved, sync later
 *     }
 *   }
 *
 *
 * EXPORT/IMPORT FOR BACKUP
 * =========================
 *
 * Export flow with pipelines:
 *   const json = exportFlowWithPipelines('flow-123')
 *   // Download or send to server
 *
 * Import flow with pipelines:
 *   const { flow, pipelines } = importFlowWithPipelines(json)
 *   // Flow and pipelines are now loaded and persisted
 *
 *
 * REACT COMPONENT PATTERN
 * =======================
 *
 * Here's a complete example component:
 *
 *   function MyFlowEditor() {
 *     const {
 *       flows,
 *       isLoading,
 *       error,
 *       saveFlow,
 *       updateFlow,
 *       addNode,
 *       deleteFlow,
 *     } = useFlowPersistence()
 *
 *     const [selectedId, setSelectedId] = useState<string | null>(null)
 *     const selected = flows.find(f => f.id === selectedId)
 *
 *     if (isLoading) return <div>Loading...</div>
 *     if (error) return <div>Error: {error.message}</div>
 *
 *     return (
 *       <div>
 *         <div>
 *           {flows.map(f => (
 *             <div
 *               key={f.id}
 *               onClick={() => setSelectedId(f.id)}
 *               className={selectedId === f.id ? 'selected' : ''}
 *             >
 *               {f.name}
 *             </div>
 *           ))}
 *         </div>
 *
 *         {selected && (
 *           <div>
 *             <h2>{selected.name}</h2>
 *             <button onClick={() => deleteFlow(selected.id)}>
 *               Delete
 *             </button>
 *           </div>
 *         )}
 *       </div>
 *     )
 *   }
 *
 *
 * MORE INFORMATION
 * ================
 *
 * See these files for more details:
 *   - src/utils/localStorage.ts          - Core storage classes
 *   - src/hooks/useLocalStorage.ts       - Generic hooks
 *   - src/hooks/useFlowPersistence.ts    - Domain-specific hooks
 *   - src/utils/persistence-guide.ts     - Comprehensive guide
 *   - src/components/flow-persistence-example.tsx - Example component
 */

export {}
