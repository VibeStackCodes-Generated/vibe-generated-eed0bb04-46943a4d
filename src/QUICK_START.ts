/**
 * QUICK START GUIDE - Persistence System
 *
 * This is the fastest way to get started with the localStorage persistence system.
 * For more details, see PERSISTENCE_README.ts and persistence-guide.ts
 *
 * ============================================================================
 * MOST COMMON USE CASES
 * ============================================================================
 */

/**
 * USE CASE 1: Save and load flows in your component
 *
 * import { useFlowPersistence } from '@/hooks'
 *
 * function MyFlowEditor() {
 *   const { flows, saveFlow, deleteFlow, isLoading, error } = useFlowPersistence()
 *
 *   const handleCreate = () => {
 *     saveFlow({
 *       id: `flow-${Date.now()}`,
 *       name: 'My First Flow',
 *       nodes: [],
 *       edges: [],
 *       createdAt: Date.now(),
 *       updatedAt: Date.now(),
 *     })
 *   }
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <div>
 *       <button onClick={handleCreate}>Create Flow</button>
 *       <ul>
 *         {flows.map(flow => (
 *           <li key={flow.id}>
 *             {flow.name}
 *             <button onClick={() => deleteFlow(flow.id)}>Delete</button>
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   )
 * }
 */

/**
 * USE CASE 2: Edit flow nodes and edges
 *
 * import { useFlowPersistence } from '@/hooks'
 *
 * function FlowCanvas({ flowId }: { flowId: string }) {
 *   const { addNode, updateNode, removeNode, addEdge, removeEdge } = useFlowPersistence()
 *
 *   const handleAddNode = (nodeData) => {
 *     addNode(flowId, nodeData)
 *   }
 *
 *   const handleMoveNode = (nodeId, x, y) => {
 *     updateNode(flowId, nodeId, { position: { x, y } })
 *   }
 *
 *   const handleDeleteNode = (nodeId) => {
 *     removeNode(flowId, nodeId)
 *   }
 *
 *   const handleConnectNodes = (sourceId, targetId) => {
 *     addEdge(flowId, {
 *       id: `edge-${Date.now()}`,
 *       source: sourceId,
 *       target: targetId,
 *     })
 *   }
 *
 *   // ... render your canvas
 * }
 */

/**
 * USE CASE 3: Manage pipelines (scheduled flow execution)
 *
 * import { usePipelinePersistence } from '@/hooks'
 *
 * function PipelineManager() {
 *   const {
 *     pipelines,
 *     savePipeline,
 *     getPipelinesByFlow,
 *     enablePipeline,
 *     disablePipeline,
 *   } = usePipelinePersistence()
 *
 *   const handleSchedule = (flowId) => {
 *     savePipeline({
 *       id: `pipeline-${Date.now()}`,
 *       name: 'Daily Run',
 *       flowId,
 *       schedule: '0 0 * * *',  // Midnight every day
 *       enabled: true,
 *       createdAt: Date.now(),
 *       updatedAt: Date.now(),
 *     })
 *   }
 *
 *   const handleToggle = (pipelineId, shouldEnable) => {
 *     if (shouldEnable) {
 *       enablePipeline(pipelineId)
 *     } else {
 *       disablePipeline(pipelineId)
 *     }
 *   }
 *
 *   // ... render your UI
 * }
 */

/**
 * USE CASE 4: Save user preferences or app settings
 *
 * import { useLocalStorage } from '@/hooks'
 *
 * function UserSettings() {
 *   const [preferences, setPreferences, { isLoading, error }] = useLocalStorage(
 *     'app:user-preferences',
 *     {
 *       theme: 'light',
 *       sidebarCollapsed: false,
 *       language: 'en',
 *     }
 *   )
 *
 *   const handleThemeChange = (theme) => {
 *     setPreferences(prev => ({ ...prev, theme }))
 *   }
 *
 *   // ... render your settings UI
 * }
 */

/**
 * USE CASE 5: Export and backup flows
 *
 * import { useFlowAndPipelinePersistence } from '@/hooks'
 *
 * function BackupManager() {
 *   const { exportFlowWithPipelines, importFlowWithPipelines } = useFlowAndPipelinePersistence()
 *
 *   const handleExport = (flowId) => {
 *     const json = exportFlowWithPipelines(flowId)
 *     if (json) {
 *       // Download file
 *       const element = document.createElement('a')
 *       element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(json)}`)
 *       element.setAttribute('download', `flow-${flowId}.json`)
 *       element.click()
 *     }
 *   }
 *
 *   const handleImport = (jsonString) => {
 *     const result = importFlowWithPipelines(jsonString)
 *     if (result) {
 *       console.log('Imported flow:', result.flow.name)
 *     }
 *   }
 *
 *   // ... render your backup UI
 * }
 */

/**
 * ============================================================================
 * KEY APIS AT A GLANCE
 * ============================================================================
 *
 * FLOWS:
 *   useFlowPersistence()
 *   - flows, saveFlow, getFlow, updateFlow, deleteFlow
 *   - addNode, updateNode, removeNode
 *   - addEdge, removeEdge
 *   - exportFlow, importFlow
 *   - isLoading, error
 *
 * PIPELINES:
 *   usePipelinePersistence()
 *   - pipelines, savePipeline, getPipeline, updatePipeline, deletePipeline
 *   - getPipelinesByFlow
 *   - enablePipeline, disablePipeline
 *   - recordPipelineRun
 *   - isLoading, error
 *
 * COMBINED:
 *   useFlowAndPipelinePersistence()
 *   - All of the above plus:
 *   - deleteFlowWithPipelines
 *   - exportFlowWithPipelines
 *   - importFlowWithPipelines
 *
 * GENERIC STORAGE:
 *   useLocalStorage<T>(key, initialValue)
 *   - For any JSON-serializable data
 *
 *   useVersionedLocalStorage<T>(key, initialValue, version, migrate?)
 *   - With schema version support and migrations
 *
 * ============================================================================
 * IMPORTANT: ALWAYS HANDLE LOADING AND ERROR STATES
 * ============================================================================
 *
 * const { flows, isLoading, error } = useFlowPersistence()
 *
 * if (isLoading) return <Spinner />
 * if (error) return <ErrorMessage error={error} />
 *
 * ============================================================================
 * DATA IS AUTOMATICALLY SAVED TO BROWSER LOCALSTORAGE
 * ============================================================================
 *
 * View it in your browser:
 *   1. Open Developer Tools (F12)
 *   2. Go to Application tab
 *   3. Click LocalStorage on the left
 *   4. Look for keys starting with 'vibestack:'
 *
 * ============================================================================
 * TIMESTAMPS ARE AUTOMATICALLY MANAGED
 * ============================================================================
 *
 * When you create a flow:
 *   - createdAt is automatically set to Date.now()
 *   - updatedAt is automatically set to Date.now()
 *
 * When you update a flow:
 *   - updatedAt is automatically updated to Date.now()
 *   - createdAt remains unchanged
 *
 * ============================================================================
 * NO EXTERNAL DEPENDENCIES REQUIRED
 * ============================================================================
 *
 * This system uses only:
 * - React (built-in hooks)
 * - Browser localStorage API
 * - TypeScript (for type safety)
 *
 * No additional npm packages needed!
 *
 * ============================================================================
 * FOR MORE INFORMATION
 * ============================================================================
 *
 * - PERSISTENCE_README.ts      - Quick reference guide
 * - persistence-guide.ts       - Comprehensive documentation
 * - IMPLEMENTATION_SUMMARY.ts  - Complete architecture overview
 * - flow-persistence-example.tsx - Interactive example component
 *
 * ============================================================================
 */

export {}
