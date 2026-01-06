/**
 * Custom React hooks for managing flow and pipeline persistence
 * Provides high-level API for working with flows and pipelines stored in localStorage
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Flow,
  FlowNode,
  FlowEdge,
  Pipeline,
  flowStorage,
  pipelineStorage,
  STORAGE_SCHEMA_VERSION,
} from '@/utils/localStorage'

/**
 * Hook for managing flows with localStorage persistence
 * Provides CRUD operations and automatic syncing
 */
export function useFlowPersistence() {
  const [flows, setFlows] = useState<Flow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const isMountedRef = useRef(true)

  // Load flows on mount
  useEffect(() => {
    try {
      setIsLoading(true)
      setError(null)

      const loadedFlows = flowStorage.load()
      if (isMountedRef.current) {
        setFlows(loadedFlows || [])
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load flows')
      if (isMountedRef.current) {
        setError(error)
      }
      console.error('Error loading flows from localStorage:', error)
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  /**
   * Create or update a flow
   */
  const saveFlow = useCallback(
    (flow: Flow): void => {
      try {
        setError(null)

        const now = Date.now()
        const flowToSave: Flow = {
          ...flow,
          createdAt: flow.createdAt || now,
          updatedAt: now,
        }

        flowStorage.saveFlow(flowToSave)

        if (isMountedRef.current) {
          setFlows((prevFlows) => {
            const index = prevFlows.findIndex((f) => f.id === flowToSave.id)
            if (index >= 0) {
              const newFlows = [...prevFlows]
              newFlows[index] = flowToSave
              return newFlows
            }
            return [...prevFlows, flowToSave]
          })
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to save flow')
        if (isMountedRef.current) {
          setError(error)
        }
        console.error('Error saving flow:', error)
      }
    },
    []
  )

  /**
   * Get a flow by ID
   */
  const getFlow = useCallback((id: string): Flow | null => {
    return flowStorage.getFlow(id)
  }, [])

  /**
   * Update specific flow properties
   */
  const updateFlow = useCallback(
    (id: string, updates: Partial<Omit<Flow, 'id' | 'createdAt'>>): void => {
      try {
        const flow = flowStorage.getFlow(id)
        if (!flow) {
          throw new Error(`Flow with ID "${id}" not found`)
        }

        const updatedFlow: Flow = {
          ...flow,
          ...updates,
          id: flow.id,
          createdAt: flow.createdAt,
          updatedAt: Date.now(),
        }

        saveFlow(updatedFlow)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update flow')
        if (isMountedRef.current) {
          setError(error)
        }
        console.error('Error updating flow:', error)
      }
    },
    [saveFlow]
  )

  /**
   * Add a node to a flow
   */
  const addNode = useCallback(
    (flowId: string, node: FlowNode): void => {
      try {
        const flow = flowStorage.getFlow(flowId)
        if (!flow) {
          throw new Error(`Flow with ID "${flowId}" not found`)
        }

        const nodeExists = flow.nodes.some((n) => n.id === node.id)
        if (nodeExists) {
          throw new Error(`Node with ID "${node.id}" already exists in flow`)
        }

        const updatedFlow: Flow = {
          ...flow,
          nodes: [...flow.nodes, node],
          updatedAt: Date.now(),
        }

        saveFlow(updatedFlow)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to add node')
        if (isMountedRef.current) {
          setError(error)
        }
        console.error('Error adding node:', error)
      }
    },
    [saveFlow]
  )

  /**
   * Update a node in a flow
   */
  const updateNode = useCallback(
    (flowId: string, nodeId: string, updates: Partial<FlowNode>): void => {
      try {
        const flow = flowStorage.getFlow(flowId)
        if (!flow) {
          throw new Error(`Flow with ID "${flowId}" not found`)
        }

        const updatedFlow: Flow = {
          ...flow,
          nodes: flow.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates, id: n.id } : n)),
          updatedAt: Date.now(),
        }

        saveFlow(updatedFlow)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update node')
        if (isMountedRef.current) {
          setError(error)
        }
        console.error('Error updating node:', error)
      }
    },
    [saveFlow]
  )

  /**
   * Remove a node from a flow
   */
  const removeNode = useCallback(
    (flowId: string, nodeId: string): void => {
      try {
        const flow = flowStorage.getFlow(flowId)
        if (!flow) {
          throw new Error(`Flow with ID "${flowId}" not found`)
        }

        const updatedFlow: Flow = {
          ...flow,
          nodes: flow.nodes.filter((n) => n.id !== nodeId),
          edges: flow.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
          updatedAt: Date.now(),
        }

        saveFlow(updatedFlow)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to remove node')
        if (isMountedRef.current) {
          setError(error)
        }
        console.error('Error removing node:', error)
      }
    },
    [saveFlow]
  )

  /**
   * Add an edge to a flow
   */
  const addEdge = useCallback(
    (flowId: string, edge: FlowEdge): void => {
      try {
        const flow = flowStorage.getFlow(flowId)
        if (!flow) {
          throw new Error(`Flow with ID "${flowId}" not found`)
        }

        const edgeExists = flow.edges.some((e) => e.id === edge.id)
        if (edgeExists) {
          throw new Error(`Edge with ID "${edge.id}" already exists in flow`)
        }

        const updatedFlow: Flow = {
          ...flow,
          edges: [...flow.edges, edge],
          updatedAt: Date.now(),
        }

        saveFlow(updatedFlow)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to add edge')
        if (isMountedRef.current) {
          setError(error)
        }
        console.error('Error adding edge:', error)
      }
    },
    [saveFlow]
  )

  /**
   * Remove an edge from a flow
   */
  const removeEdge = useCallback(
    (flowId: string, edgeId: string): void => {
      try {
        const flow = flowStorage.getFlow(flowId)
        if (!flow) {
          throw new Error(`Flow with ID "${flowId}" not found`)
        }

        const updatedFlow: Flow = {
          ...flow,
          edges: flow.edges.filter((e) => e.id !== edgeId),
          updatedAt: Date.now(),
        }

        saveFlow(updatedFlow)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to remove edge')
        if (isMountedRef.current) {
          setError(error)
        }
        console.error('Error removing edge:', error)
      }
    },
    [saveFlow]
  )

  /**
   * Delete a flow
   */
  const deleteFlow = useCallback(
    (id: string): void => {
      try {
        setError(null)

        flowStorage.deleteFlow(id)

        if (isMountedRef.current) {
          setFlows((prevFlows) => prevFlows.filter((f) => f.id !== id))
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete flow')
        if (isMountedRef.current) {
          setError(error)
        }
        console.error('Error deleting flow:', error)
      }
    },
    []
  )

  /**
   * Export a flow as JSON
   */
  const exportFlow = useCallback((id: string): string | null => {
    try {
      const flow = flowStorage.getFlow(id)
      if (!flow) {
        return null
      }
      return JSON.stringify(flow, null, 2)
    } catch (err) {
      console.error('Error exporting flow:', err)
      return null
    }
  }, [])

  /**
   * Import a flow from JSON
   */
  const importFlow = useCallback(
    (jsonString: string): Flow | null => {
      try {
        const imported = JSON.parse(jsonString) as Flow
        if (!imported.id || !imported.name) {
          throw new Error('Invalid flow: missing required fields (id, name)')
        }
        saveFlow(imported)
        return imported
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to import flow')
        if (isMountedRef.current) {
          setError(error)
        }
        console.error('Error importing flow:', error)
        return null
      }
    },
    [saveFlow]
  )

  return {
    flows,
    isLoading,
    error,
    saveFlow,
    getFlow,
    updateFlow,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    deleteFlow,
    exportFlow,
    importFlow,
  }
}

/**
 * Hook for managing pipelines with localStorage persistence
 */
export function usePipelinePersistence() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const isMountedRef = useRef(true)

  // Load pipelines on mount
  useEffect(() => {
    try {
      setIsLoading(true)
      setError(null)

      const loadedPipelines = pipelineStorage.load()
      if (isMountedRef.current) {
        setPipelines(loadedPipelines || [])
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load pipelines')
      if (isMountedRef.current) {
        setError(error)
      }
      console.error('Error loading pipelines from localStorage:', error)
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  /**
   * Create or update a pipeline
   */
  const savePipeline = useCallback((pipeline: Pipeline): void => {
    try {
      setError(null)

      const now = Date.now()
      const pipelineToSave: Pipeline = {
        ...pipeline,
        createdAt: pipeline.createdAt || now,
        updatedAt: now,
      }

      pipelineStorage.savePipeline(pipelineToSave)

      if (isMountedRef.current) {
        setPipelines((prevPipelines) => {
          const index = prevPipelines.findIndex((p) => p.id === pipelineToSave.id)
          if (index >= 0) {
            const newPipelines = [...prevPipelines]
            newPipelines[index] = pipelineToSave
            return newPipelines
          }
          return [...prevPipelines, pipelineToSave]
        })
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save pipeline')
      if (isMountedRef.current) {
        setError(error)
      }
      console.error('Error saving pipeline:', error)
    }
  }, [])

  /**
   * Get a pipeline by ID
   */
  const getPipeline = useCallback((id: string): Pipeline | null => {
    return pipelineStorage.getPipeline(id)
  }, [])

  /**
   * Get pipelines for a specific flow
   */
  const getPipelinesByFlow = useCallback((flowId: string): Pipeline[] => {
    return pipelineStorage.getPipelinesByFlow(flowId)
  }, [])

  /**
   * Update a pipeline
   */
  const updatePipeline = useCallback(
    (id: string, updates: Partial<Omit<Pipeline, 'id' | 'createdAt'>>): void => {
      try {
        const pipeline = pipelineStorage.getPipeline(id)
        if (!pipeline) {
          throw new Error(`Pipeline with ID "${id}" not found`)
        }

        const updatedPipeline: Pipeline = {
          ...pipeline,
          ...updates,
          id: pipeline.id,
          createdAt: pipeline.createdAt,
          updatedAt: Date.now(),
        }

        savePipeline(updatedPipeline)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update pipeline')
        if (isMountedRef.current) {
          setError(error)
        }
        console.error('Error updating pipeline:', error)
      }
    },
    [savePipeline]
  )

  /**
   * Delete a pipeline
   */
  const deletePipeline = useCallback((id: string): void => {
    try {
      setError(null)

      pipelineStorage.deletePipeline(id)

      if (isMountedRef.current) {
        setPipelines((prevPipelines) => prevPipelines.filter((p) => p.id !== id))
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete pipeline')
      if (isMountedRef.current) {
        setError(error)
      }
      console.error('Error deleting pipeline:', error)
    }
  }, [])

  /**
   * Enable a pipeline
   */
  const enablePipeline = useCallback(
    (id: string): void => {
      updatePipeline(id, { enabled: true })
    },
    [updatePipeline]
  )

  /**
   * Disable a pipeline
   */
  const disablePipeline = useCallback(
    (id: string): void => {
      updatePipeline(id, { enabled: false })
    },
    [updatePipeline]
  )

  /**
   * Update last run time for a pipeline
   */
  const recordPipelineRun = useCallback(
    (id: string): void => {
      updatePipeline(id, { lastRunAt: Date.now() })
    },
    [updatePipeline]
  )

  return {
    pipelines,
    isLoading,
    error,
    savePipeline,
    getPipeline,
    getPipelinesByFlow,
    updatePipeline,
    deletePipeline,
    enablePipeline,
    disablePipeline,
    recordPipelineRun,
  }
}

/**
 * Hook for syncing flows and pipelines together
 * Useful when flows and pipelines need to be managed as a cohesive unit
 */
export function useFlowAndPipelinePersistence() {
  const flows = useFlowPersistence()
  const pipelines = usePipelinePersistence()

  /**
   * Delete a flow and all associated pipelines
   */
  const deleteFlowWithPipelines = useCallback(
    (flowId: string): void => {
      const associatedPipelines = pipelines.getPipelinesByFlow(flowId)
      associatedPipelines.forEach((p) => {
        pipelines.deletePipeline(p.id)
      })
      flows.deleteFlow(flowId)
    },
    [flows, pipelines]
  )

  /**
   * Export flow with all its pipelines
   */
  const exportFlowWithPipelines = useCallback(
    (flowId: string): string | null => {
      try {
        const flow = flows.getFlow(flowId)
        if (!flow) {
          return null
        }

        const associatedPipelines = pipelines.getPipelinesByFlow(flowId)
        const data = {
          schemaVersion: STORAGE_SCHEMA_VERSION,
          flow,
          pipelines: associatedPipelines,
          exportedAt: new Date().toISOString(),
        }

        return JSON.stringify(data, null, 2)
      } catch (err) {
        console.error('Error exporting flow with pipelines:', err)
        return null
      }
    },
    [flows, pipelines]
  )

  /**
   * Import flow with all its pipelines
   */
  const importFlowWithPipelines = useCallback(
    (jsonString: string): { flow: Flow; pipelines: Pipeline[] } | null => {
      try {
        const data = JSON.parse(jsonString) as {
          schemaVersion: number
          flow: Flow
          pipelines: Pipeline[]
        }

        if (data.schemaVersion !== STORAGE_SCHEMA_VERSION) {
          console.warn(
            `Schema version mismatch. Expected ${STORAGE_SCHEMA_VERSION}, got ${data.schemaVersion}`
          )
        }

        flows.saveFlow(data.flow)
        data.pipelines.forEach((p) => {
          pipelines.savePipeline(p)
        })

        return {
          flow: data.flow,
          pipelines: data.pipelines,
        }
      } catch (err) {
        console.error('Error importing flow with pipelines:', err)
        return null
      }
    },
    [flows, pipelines]
  )

  return {
    flows: flows.flows,
    pipelines: pipelines.pipelines,
    isLoading: flows.isLoading || pipelines.isLoading,
    error: flows.error || pipelines.error,
    ...flows,
    ...pipelines,
    deleteFlowWithPipelines,
    exportFlowWithPipelines,
    importFlowWithPipelines,
  }
}
