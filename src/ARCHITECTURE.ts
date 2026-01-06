/**
 * @fileoverview Architecture Diagram of the Persistence System
 *
 * This file documents the layered architecture of the localStorage persistence system.
 *
 * ============================================================================
 * SYSTEM ARCHITECTURE LAYERS
 * ============================================================================
 *
 * LAYER 1: REACT COMPONENTS
 * ────────────────────────────────────────────────────────────────────────
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │          React Components & Views                       │
 *   │  ┌──────────────────────────────────────────────────┐   │
 *   │  │ MyFlowEditor.tsx                                 │   │
 *   │  │ - Renders flow list, nodes, edges                │   │
 *   │  │ - Calls hook methods on user interaction        │   │
 *   │  └──────────────────────────────────────────────────┘   │
 *   │                         △                                 │
 *   │                         │ Props/Callbacks                │
 *   └─────────────────────────┼─────────────────────────────────┘
 *                             │
 *                             ▼
 *
 * LAYER 2: REACT HOOKS
 * ────────────────────────────────────────────────────────────────────────
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │          React Hooks (src/hooks/)                       │
 *   │                                                         │
 *   │  ┌───────────────────────────────────────────────┐     │
 *   │  │ useFlowPersistence()                          │     │
 *   │  │ - flows, saveFlow, getFlow, updateFlow        │     │
 *   │  │ - addNode, updateNode, removeNode             │     │
 *   │  │ - addEdge, removeEdge                          │     │
 *   │  │ - deleteFlow, exportFlow, importFlow           │     │
 *   │  │ - isLoading, error states                      │     │
 *   │  └───────────────────────────────────────────────┘     │
 *   │                                                         │
 *   │  ┌───────────────────────────────────────────────┐     │
 *   │  │ usePipelinePersistence()                      │     │
 *   │  │ - pipelines, savePipeline, getPipeline        │     │
 *   │  │ - getPipelinesByFlow, updatePipeline          │     │
 *   │  │ - deletePipeline, enable/disable              │     │
 *   │  │ - recordPipelineRun                            │     │
 *   │  └───────────────────────────────────────────────┘     │
 *   │                                                         │
 *   │  ┌───────────────────────────────────────────────┐     │
 *   │  │ useLocalStorage<T>()                          │     │
 *   │  │ - Generic hook for any data type              │     │
 *   │  │ - [value, setValue, {remove, error}]          │     │
 *   │  └───────────────────────────────────────────────┘     │
 *   │                                                         │
 *   │  ┌───────────────────────────────────────────────┐     │
 *   │  │ useVersionedLocalStorage<T>()                 │     │
 *   │  │ - With schema versioning & migration          │     │
 *   │  │ - [value, setValue, {dataVersion, error}]     │     │
 *   │  └───────────────────────────────────────────────┘     │
 *   │                                                         │
 *   └────────────────┬──────────────────────────────────────┘
 *                    │
 *                    │ Calls storage methods
 *                    │ Manages React state
 *                    │
 *                    ▼
 *
 * LAYER 3: STORAGE CLASSES
 * ────────────────────────────────────────────────────────────────────────
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │      Storage Classes (src/utils/localStorage.ts)        │
 *   │                                                         │
 *   │  ┌───────────────────────────────────────────────┐     │
 *   │  │ VersionedStorage<T> (Base Class)              │     │
 *   │  │ - save(data: T): void                          │     │
 *   │  │ - load(): T | null                             │     │
 *   │  │ - getMetadata(): {version, timestamp}          │     │
 *   │  │ - delete(): void                               │     │
 *   │  │ - migrateData(old): new | null (override)      │     │
 *   │  └───────────────────────────────────────────────┘     │
 *   │                      △                                  │
 *   │                      │ Extends                          │
 *   │        ┌─────────────┴──────────────┐                   │
 *   │        │                            │                   │
 *   │  ┌─────▼──────┐           ┌────────▼──────┐            │
 *   │  │ FlowStorage│           │PipelineStorage│            │
 *   │  ├─────────────┤           ├───────────────┤            │
 *   │  │saveFlow()   │           │savePipeline() │            │
 *   │  │getFlow()    │           │getPipeline()  │            │
 *   │  │deleteFlow() │           │deletePipeline │            │
 *   │  └─────────────┘           └───────────────┘            │
 *   │                                                         │
 *   └────────────────┬──────────────────────────────────────┘
 *                    │
 *                    │ Serializes/deserializes JSON
 *                    │ Handles versioning & migrations
 *                    │
 *                    ▼
 *
 * LAYER 4: PERSISTENCE
 * ────────────────────────────────────────────────────────────────────────
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │         Browser localStorage API                        │
 *   │                                                         │
 *   │  localStorage.setItem('vibestack:flows', JSON.string)  │
 *   │  localStorage.getItem('vibestack:flows')               │
 *   │  localStorage.removeItem('vibestack:flows')            │
 *   │                                                         │
 *   │  Keys stored:                                           │
 *   │  - 'vibestack:flows' → Flow[] with version              │
 *   │  - 'vibestack:pipelines' → Pipeline[] with version     │
 *   │  - 'app:*' → Any custom data                           │
 *   │                                                         │
 *   └──────────────────────────────────────────────────────────┘
 *                          △
 *                          │
 *                          ▼
 *   ┌──────────────────────────────────────────────────────────┐
 *   │         Browser Persistent Storage                       │
 *   │  (Survives browser refresh, restart, etc.)              │
 *   └──────────────────────────────────────────────────────────┘
 *
 *
 * ============================================================================
 * DATA FLOW DIAGRAM
 * ============================================================================
 *
 * CREATE FLOW:
 * ──────────
 *
 *   User Action (Click "Create")
 *        │
 *        ▼
 *   Component calls: saveFlow(flow)
 *        │
 *        ▼
 *   Hook updates React state
 *        │
 *        ▼
 *   Hook calls: flowStorage.saveFlow(flow)
 *        │
 *        ▼
 *   Storage class calls: save([...flows, newFlow])
 *        │
 *        ▼
 *   Add version & timestamp:
 *   {
 *     version: 1,
 *     timestamp: 1234567890,
 *     data: [Flow, Flow, ...]
 *   }
 *        │
 *        ▼
 *   JSON stringify
 *        │
 *        ▼
 *   localStorage.setItem('vibestack:flows', json)
 *        │
 *        ▼
 *   Data persisted to disk ✓
 *
 *
 * LOAD FLOWS:
 * ───────────
 *
 *   App loads / Component mounts
 *        │
 *        ▼
 *   useFlowPersistence() hook runs
 *        │
 *        ▼
 *   Hook calls: flowStorage.load()
 *        │
 *        ▼
 *   Storage class calls: localStorage.getItem('vibestack:flows')
 *        │
 *        ▼
 *   Parse JSON string
 *        │
 *        ▼
 *   Check version:
 *     Version 1 → Return data as-is ✓
 *     Version 2 → Try migration ✓
 *     Version 3 → No migration → Return null (safe default) ✓
 *        │
 *        ▼
 *   Update React state with flows
 *        │
 *        ▼
 *   Component renders with loaded flows ✓
 *
 *
 * ============================================================================
 * STATE MANAGEMENT FLOW
 * ============================================================================
 *
 *   Component State:
 *   ┌─────────────────────┐
 *   │ const { flows } =    │
 *   │ useFlowPersistence()│
 *   └─────────┬───────────┘
 *             │
 *             │ Comes from hook's useState
 *             │
 *             ▼
 *   ┌─────────────────────────────┐
 *   │ const [flows, setFlows] =   │
 *   │   useState([])              │
 *   └─────────┬───────────────────┘
 *             │
 *             │ Loaded on mount from storage
 *             │
 *             ▼
 *   ┌─────────────────────────────┐
 *   │ flowStorage.load()          │
 *   │ → localStorage.getItem()    │
 *   │ → Parse & validate version  │
 *   │ → Return Flow[] or null     │
 *   └─────────────────────────────┘
 *
 *   When user updates:
 *   ┌─────────────────────────────┐
 *   │ saveFlow(updatedFlow)       │
 *   │   ↓                          │
 *   │ setFlows(newArray)          │ (React state update)
 *   │   ↓                          │
 *   │ flowStorage.saveFlow()      │ (Persist to localStorage)
 *   │   ↓                          │
 *   │ localStorage.setItem()      │ (Write to disk)
 *   │   ↓                          │
 *   │ Component re-renders ✓      │
 *   └─────────────────────────────┘
 *
 *
 * ============================================================================
 * TYPE SYSTEM
 * ============================================================================
 *
 * Flow (Base Unit)
 *   ├── id: string
 *   ├── name: string
 *   ├── description?: string
 *   ├── nodes: FlowNode[]         // What does the flow do
 *   │   └── FlowNode
 *   │       ├── id, type, label
 *   │       ├── position (x, y)   // Visual layout
 *   │       ├── data?: {}         // Node-specific config
 *   │       └── config?: {}       // Runtime config
 *   ├── edges: FlowEdge[]         // How nodes connect
 *   │   └── FlowEdge
 *   │       ├── id, source, target
 *   │       ├── label?
 *   │       └── data?: {}
 *   ├── createdAt: number
 *   ├── updatedAt: number
 *   └── metadata?: {}             // Custom data
 *
 * Pipeline (Execution Schedule)
 *   ├── id: string
 *   ├── name: string
 *   ├── flowId: string            // Which flow to run
 *   ├── schedule?: string         // Cron expression
 *   ├── enabled: boolean          // Is it active
 *   ├── createdAt: number
 *   ├── updatedAt: number
 *   ├── lastRunAt?: number        // Execution tracking
 *   └── metadata?: {}
 *
 * VersionedData<T> (Wrapper)
 *   ├── version: number           // Schema version
 *   ├── data: T                   // Actual payload
 *   └── timestamp: number         // When saved
 *
 *
 * ============================================================================
 * ERROR HANDLING FLOW
 * ============================================================================
 *
 *   Try to load data
 *        │
 *        ├─→ JSON parsing fails → Log error → Return null
 *        │
 *        ├─→ Version mismatch → Try migration
 *        │        │
 *        │        ├─→ Migration succeeds → Return migrated data
 *        │        └─→ Migration fails → Log warning → Return null
 *        │
 *        ├─→ localStorage quota exceeded → Log error → Return null
 *        │
 *        └─→ Success → Return data ✓
 *
 *   Component always handles:
 *   if (isLoading) → Show spinner
 *   if (error) → Show error message
 *   else → Render normal UI
 *
 *
 * ============================================================================
 * FEATURE MATRIX
 * ============================================================================
 *
 * Feature                  | useLocalStorage | useVersionedLS | useFlowPersist
 * ─────────────────────────┼─────────────────┼────────────────┼──────────────
 * Basic save/load          | ✓               | ✓              | ✓
 * Schema versioning        | ✗               | ✓              | ✓
 * Data migration           | ✗               | ✓              | ✓
 * Flow-specific APIs       | ✗               | ✗              | ✓
 * Pipeline-specific APIs   | ✗               | ✗              | ✓ (partial)
 * Node/Edge management     | ✗               | ✗              | ✓
 * Export/Import            | ✗               | ✗              | ✓
 * Multiple keys at once    | ✗               | ✗              | ✗
 * Error handling           | ✓               | ✓              | ✓
 * Loading states           | ✓               | ✓              | ✓
 *
 */

export {}
