/**
 * Example component demonstrating flow and pipeline persistence
 * This serves as documentation and reference for using the persistence helpers
 */

import { useCallback, useState } from 'react'
import { useFlowAndPipelinePersistence, useLocalStorage } from '@/hooks'
import type { Flow, FlowNode, FlowEdge, Pipeline } from '@/utils'

/**
 * Example component showing how to use the persistence hooks
 * Feel free to integrate these patterns into your actual flow editor components
 */
export function FlowPersistenceExample() {
  const {
    flows,
    pipelines,
    isLoading,
    error,
    saveFlow,
    getPipeline,
    deletePipeline,
    exportFlowWithPipelines,
    importFlowWithPipelines,
  } = useFlowAndPipelinePersistence()

  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null)
  const [importedData, setImportedData] = useLocalStorage<{ flowId: string } | null>('app:last-imported', null)

  /**
   * Example: Create a new flow
   */
  const createExampleFlow = useCallback(() => {
    const flowId = `flow-${Date.now()}`

    const nodes: FlowNode[] = [
      {
        id: 'node-1',
        type: 'trigger',
        label: 'Start',
        position: { x: 0, y: 0 },
        data: { description: 'Flow trigger event' },
      },
      {
        id: 'node-2',
        type: 'action',
        label: 'Process',
        position: { x: 100, y: 100 },
        data: { description: 'Process data' },
      },
      {
        id: 'node-3',
        type: 'end',
        label: 'Complete',
        position: { x: 200, y: 0 },
        data: { description: 'Flow completion' },
      },
    ]

    const edges: FlowEdge[] = [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        label: 'on success',
      },
      {
        id: 'edge-2',
        source: 'node-2',
        target: 'node-3',
        label: 'completed',
      },
    ]

    const newFlow: Flow = {
      id: flowId,
      name: `Example Flow ${new Date().toLocaleTimeString()}`,
      description: 'Example flow for demonstration',
      nodes,
      edges,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        version: '1.0',
        tags: ['example', 'demo'],
      },
    }

    saveFlow(newFlow)
    setSelectedFlowId(flowId)
  }, [saveFlow])

  /**
   * Example: Export flow with pipelines
   */
  const handleExport = useCallback(() => {
    if (!selectedFlowId) return

    const exported = exportFlowWithPipelines(selectedFlowId)
    if (exported) {
      const element = document.createElement('a')
      element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(exported)}`)
      element.setAttribute('download', `flow-${selectedFlowId}.json`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }, [selectedFlowId, exportFlowWithPipelines])

  /**
   * Example: Import flow with pipelines
   */
  const handleImport = useCallback((jsonString: string) => {
    const result = importFlowWithPipelines(jsonString)
    if (result) {
      setSelectedFlowId(result.flow.id)
      setImportedData([1], { flowId: result.flow.id })
    }
  }, [importFlowWithPipelines, setImportedData])

  if (isLoading) {
    return <div className="p-4 text-center">Loading flows and pipelines...</div>
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
        <p className="text-red-800 font-semibold">Error</p>
        <p className="text-red-700">{error.message}</p>
      </div>
    )
  }

  const selectedFlow = selectedFlowId ? flows.find((f) => f.id === selectedFlowId) : null
  const selectedPipelines = selectedFlowId ? pipelines.filter((p) => p.flowId === selectedFlowId) : []

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Flow Persistence Example</h2>
        <p className="text-sm text-gray-600 mb-4">
          This example demonstrates how to use the localStorage persistence hooks for flows and
          pipelines. The data persists across browser sessions.
        </p>
      </div>

      {/* Flows List */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Flows ({flows.length})</h3>

        <button
          onClick={createExampleFlow}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create Example Flow
        </button>

        {flows.length === 0 ? (
          <p className="text-gray-500">No flows yet. Create one to get started.</p>
        ) : (
          <ul className="space-y-2">
            {flows.map((flow) => (
              <li
                key={flow.id}
                onClick={() => setSelectedFlowId(flow.id)}
                className={`p-3 rounded border cursor-pointer transition ${
                  selectedFlowId === flow.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{flow.name}</div>
                <div className="text-xs text-gray-500">
                  {flow.nodes.length} nodes • {flow.edges.length} edges
                </div>
                {flow.description && <div className="text-sm text-gray-600">{flow.description}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected Flow Details */}
      {selectedFlow && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-3">Flow Details: {selectedFlow.name}</h3>

          <div className="space-y-2 text-sm mb-4">
            <div>
              <span className="text-gray-600">ID:</span> <code className="bg-white p-1">{selectedFlow.id}</code>
            </div>
            <div>
              <span className="text-gray-600">Nodes:</span> {selectedFlow.nodes.length}
            </div>
            <div>
              <span className="text-gray-600">Edges:</span> {selectedFlow.edges.length}
            </div>
            <div>
              <span className="text-gray-600">Created:</span>{' '}
              {new Date(selectedFlow.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="text-gray-600">Updated:</span>{' '}
              {new Date(selectedFlow.updatedAt).toLocaleString()}
            </div>
          </div>

          {/* Flow Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Export as JSON
            </button>
            <button
              onClick={() => deletePipeline(selectedFlow.id)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Delete
            </button>
          </div>

          {/* Pipelines for this Flow */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Associated Pipelines ({selectedPipelines.length})</h4>
            {selectedPipelines.length === 0 ? (
              <p className="text-gray-500 text-sm">No pipelines for this flow yet.</p>
            ) : (
              <ul className="space-y-2">
                {selectedPipelines.map((pipeline) => (
                  <li key={pipeline.id} className="p-2 bg-white rounded border border-gray-200 text-sm">
                    <div className="font-medium">{pipeline.name}</div>
                    <div className="text-xs text-gray-500">
                      Status: {pipeline.enabled ? '✓ Enabled' : '✗ Disabled'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">How This Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ All flows and pipelines are saved to localStorage automatically</li>
          <li>✓ Data persists across browser sessions</li>
          <li>✓ Schema versioning ensures compatibility with future app updates</li>
          <li>✓ Use export/import to backup and restore configurations</li>
          <li>✓ Open the browser's Developer Tools (F12) and check Application → LocalStorage to see the data</li>
        </ul>
      </div>

      {/* Last Imported Info */}
      {importedData && (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
          <p className="text-sm text-green-800">
            ✓ Last imported flow: <code>{importedData.flowId}</code>
          </p>
        </div>
      )}
    </div>
  )
}

export default FlowPersistenceExample
