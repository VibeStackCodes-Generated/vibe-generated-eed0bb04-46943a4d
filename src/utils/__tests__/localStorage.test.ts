/**
 * @fileoverview Unit tests for localStorage persistence utilities
 * Run these tests to verify the persistence layer works correctly
 *
 * Note: These tests are designed to be run in a browser environment with localStorage available.
 * In a Node.js environment, you would need to use a localStorage polyfill.
 *
 * Test examples:
 * - VersionedStorage: save, load, versioning, migration
 * - FlowStorage: CRUD operations for flows
 * - PipelineStorage: CRUD operations for pipelines
 * - Error handling and edge cases
 */

import { VersionedStorage, FlowStorage, PipelineStorage, type Flow, type Pipeline } from '../localStorage'

/**
 * Helper function to clear all test data
 */
function clearTestData(): void {
  const keysToRemove = Object.keys(localStorage).filter((key) => key.startsWith('test:'))
  keysToRemove.forEach((key) => localStorage.removeItem(key))
}

/**
 * Test: VersionedStorage basic save and load
 */
export function testVersionedStorageSaveLoad(): void {
  clearTestData()

  const storage = new VersionedStorage<{ name: string; age: number }>('test:user', 1)
  const testData = { name: 'John', age: 30 }

  // Save
  storage.save(testData)
  console.log('✓ Saved test data')

  // Load
  const loaded = storage.load()
  console.assert(loaded?.name === 'John', 'Failed to load correct name')
  console.assert(loaded?.age === 30, 'Failed to load correct age')
  console.log('✓ Loaded test data correctly')

  // Metadata
  const metadata = storage.getMetadata()
  console.assert(metadata?.version === 1, 'Version should be 1')
  console.assert(metadata?.timestamp !== undefined, 'Should have timestamp')
  console.log('✓ Metadata is correct')

  // Delete
  storage.delete()
  const afterDelete = storage.load()
  console.assert(afterDelete === null, 'Data should be null after delete')
  console.log('✓ Delete works correctly')

  clearTestData()
}

/**
 * Test: FlowStorage CRUD operations
 */
export function testFlowStorageCRUD(): void {
  clearTestData()

  const storage = new FlowStorage('test:flows', 1)

  // Create
  const flow: Flow = {
    id: 'flow-1',
    name: 'Test Flow',
    description: 'A test flow',
    nodes: [
      {
        id: 'node-1',
        type: 'trigger',
        label: 'Start',
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  storage.saveFlow(flow)
  console.log('✓ Saved flow')

  // Read
  const loaded = storage.getFlow('flow-1')
  console.assert(loaded?.id === 'flow-1', 'Should load correct flow ID')
  console.assert(loaded?.name === 'Test Flow', 'Should load correct flow name')
  console.log('✓ Loaded flow correctly')

  // Update (save with same ID)
  const updated: Flow = {
    ...flow,
    name: 'Updated Test Flow',
    nodes: [
      ...flow.nodes,
      {
        id: 'node-2',
        type: 'action',
        label: 'Process',
        position: { x: 100, y: 100 },
      },
    ],
  }
  storage.saveFlow(updated)

  const loadedUpdate = storage.getFlow('flow-1')
  console.assert(loadedUpdate?.name === 'Updated Test Flow', 'Should update flow name')
  console.assert(loadedUpdate?.nodes.length === 2, 'Should have 2 nodes after update')
  console.log('✓ Updated flow correctly')

  // List all
  const allFlows = storage.load()
  console.assert(allFlows?.length === 1, 'Should have 1 flow')
  console.log('✓ Listed all flows')

  // Delete
  storage.deleteFlow('flow-1')
  const afterDelete = storage.load()
  console.assert(afterDelete?.length === 0, 'Should have no flows after delete')
  console.log('✓ Deleted flow correctly')

  clearTestData()
}

/**
 * Test: PipelineStorage CRUD operations
 */
export function testPipelineStorageCRUD(): void {
  clearTestData()

  const storage = new PipelineStorage('test:pipelines', 1)

  // Create
  const pipeline: Pipeline = {
    id: 'pipeline-1',
    name: 'Test Pipeline',
    description: 'A test pipeline',
    flowId: 'flow-1',
    schedule: '0 0 * * *',
    enabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  storage.savePipeline(pipeline)
  console.log('✓ Saved pipeline')

  // Read
  const loaded = storage.getPipeline('pipeline-1')
  console.assert(loaded?.id === 'pipeline-1', 'Should load correct pipeline ID')
  console.assert(loaded?.enabled === true, 'Should be enabled')
  console.log('✓ Loaded pipeline correctly')

  // Query by flow
  const byFlow = storage.getPipelinesByFlow('flow-1')
  console.assert(byFlow.length === 1, 'Should find 1 pipeline for flow')
  console.assert(byFlow[0].id === 'pipeline-1', 'Should find correct pipeline')
  console.log('✓ Queried pipelines by flow')

  // Update
  const updated: Pipeline = {
    ...pipeline,
    enabled: false,
  }
  storage.savePipeline(updated)

  const loadedUpdate = storage.getPipeline('pipeline-1')
  console.assert(loadedUpdate?.enabled === false, 'Should disable pipeline')
  console.log('✓ Updated pipeline correctly')

  // Delete
  storage.deletePipeline('pipeline-1')
  const afterDelete = storage.getPipeline('pipeline-1')
  console.assert(afterDelete === null, 'Should not find deleted pipeline')
  console.log('✓ Deleted pipeline correctly')

  clearTestData()
}

/**
 * Test: Multiple flows and pipelines
 */
export function testMultipleFlowsAndPipelines(): void {
  clearTestData()

  const flowStorage = new FlowStorage('test:flows-multi', 1)
  const pipelineStorage = new PipelineStorage('test:pipelines-multi', 1)

  // Create multiple flows
  const flow1: Flow = {
    id: 'flow-1',
    name: 'Flow 1',
    nodes: [],
    edges: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const flow2: Flow = {
    id: 'flow-2',
    name: 'Flow 2',
    nodes: [],
    edges: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  flowStorage.saveFlow(flow1)
  flowStorage.saveFlow(flow2)
  console.log('✓ Saved 2 flows')

  // Create pipelines for both flows
  const pipeline1: Pipeline = {
    id: 'pipeline-1',
    name: 'Pipeline for Flow 1',
    flowId: 'flow-1',
    enabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const pipeline2: Pipeline = {
    id: 'pipeline-2',
    name: 'Pipeline for Flow 2',
    flowId: 'flow-2',
    enabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const pipeline3: Pipeline = {
    id: 'pipeline-3',
    name: 'Another for Flow 1',
    flowId: 'flow-1',
    enabled: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  pipelineStorage.savePipeline(pipeline1)
  pipelineStorage.savePipeline(pipeline2)
  pipelineStorage.savePipeline(pipeline3)
  console.log('✓ Saved 3 pipelines')

  // Query
  const allFlows = flowStorage.load()
  console.assert(allFlows?.length === 2, 'Should have 2 flows')

  const pipelinesFlow1 = pipelineStorage.getPipelinesByFlow('flow-1')
  console.assert(pipelinesFlow1.length === 2, 'Flow 1 should have 2 pipelines')

  const pipelinesFlow2 = pipelineStorage.getPipelinesByFlow('flow-2')
  console.assert(pipelinesFlow2.length === 1, 'Flow 2 should have 1 pipeline')
  console.log('✓ Queried multiple flows and pipelines correctly')

  clearTestData()
}

/**
 * Test: Error handling
 */
export function testErrorHandling(): void {
  clearTestData()

  const storage = new VersionedStorage<{ value: string }>('test:error', 1)

  // Simulate corrupted data
  localStorage.setItem('test:error', 'not valid json')
  const loaded = storage.load()
  console.assert(loaded === null, 'Should return null for corrupted data')
  console.log('✓ Handled corrupted data gracefully')

  // Valid JSON but invalid structure
  localStorage.setItem('test:error', JSON.stringify({ random: 'data' }))
  const loaded2 = storage.load()
  console.assert(loaded2 === null, 'Should return null for invalid structure')
  console.log('✓ Handled invalid structure gracefully')

  clearTestData()
}

/**
 * Test: Timestamp updates
 */
export function testTimestampUpdates(): void {
  clearTestData()

  const storage = new FlowStorage('test:timestamps', 1)

  const flow: Flow = {
    id: 'flow-1',
    name: 'Flow',
    nodes: [],
    edges: [],
    createdAt: 0,
    updatedAt: 0,
  }

  const before = Date.now()
  storage.saveFlow(flow)
  const after = Date.now()

  const loaded = storage.getFlow('flow-1')
  console.assert(loaded !== null, 'Should load flow')
  console.assert(loaded!.createdAt >= before, 'createdAt should be set')
  console.assert(loaded!.updatedAt >= before, 'updatedAt should be set')
  console.log('✓ Timestamps are correctly managed')

  clearTestData()
}

/**
 * Run all tests
 * Usage: Call in browser console after importing the test functions
 */
export function runAllTests(): void {
  console.log('Starting localStorage persistence tests...\n')

  try {
    testVersionedStorageSaveLoad()
    console.log()

    testFlowStorageCRUD()
    console.log()

    testPipelineStorageCRUD()
    console.log()

    testMultipleFlowsAndPipelines()
    console.log()

    testErrorHandling()
    console.log()

    testTimestampUpdates()
    console.log()

    console.log('✅ All tests passed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}
