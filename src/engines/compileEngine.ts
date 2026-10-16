import { ActiveModuleId, StepFrame } from '../types/engine';
import { parseIntegerList } from '../utils/inputValidator';
import { generateQuickSortFrames } from './sorting/quickSort';
import { generateMergeSortFrames } from './sorting/mergeSort';
import { generateHeapSortFrames } from './sorting/heapSort';
import { generateBubbleSortFrames } from './sorting/bubbleSort';
import { generateInsertionSortFrames } from './sorting/insertionSort';
import { generateSelectionSortFrames } from './sorting/selectionSort';
import { generateBinarySearchFrames } from './searching/binarySearch';
import { generateLinearSearchFrames } from './searching/linearSearch';
import {
  generateCircularQueueFrames,
  generateDequeFrames,
  generateLinearQueueFrames,
  generatePriorityQueueFrames,
  generateStackFrames,
} from './stacksQueues/stackQueueOperations';
import { generateLinkedListFrames } from './linkedList/linkedListVariants';
import { generateAVLFrames } from './trees/avlRotations';
import { generateBSTFrames } from './trees/bstOperations';
import { generateMWayTreeFrames } from './trees/mWayTree';
import { generateBTreeFrames } from './trees/bTree';
import { generateBPlusTreeFrames } from './trees/bPlusTree';
import { createInitialGrid, generatePathfindingFrames } from './graphs/pathfindingGrid';
import { generateNetworkGraphFrames, generatePrimMSTFrames } from './graphs/networkGraph';

export function getDefaultInputForModule(module: ActiveModuleId): string {
  switch (module) {
    case 'sorting':
      return '64, 34, 25, 12, 22, 11, 90';
    case 'stacksQueues':
      return '15, 28, 42, 67, 89';
    case 'linkedList':
      return '15, 28, 42, 67, 89';
    case 'trees':
      return '30, 20, 10, 25, 40, 50';
    case 'graphs':
      return 'grid-16x36';
  }
}

export function compileEngineFrames(
  module: ActiveModuleId,
  algo: string,
  rawInput: string,
  targetValue: number = 42,
  operation?: any
): StepFrame<any>[] {
  // Graphs module handling
  if (module === 'graphs') {
    if (algo === 'networkPrim') {
      return generatePrimMSTFrames(operation);
    }
    if (algo === 'networkDijkstra' || algo === 'networkBfs') {
      return generateNetworkGraphFrames(operation);
    }

    const grid = createInitialGrid();
    const start = { row: 7, col: 5 };
    const target = { row: 7, col: 30 };
    const algoType =
      algo === 'aStarGrid'
        ? 'aStar'
        : algo === 'bfsGrid'
        ? 'bfs'
        : algo === 'dfsGrid'
        ? 'dfs'
        : 'dijkstra';
    return generatePathfindingFrames(grid, algoType, start, target);
  }

  // Parse integer input with fallback
  let valResult = parseIntegerList(rawInput);
  if (!valResult.isValid) {
    valResult = parseIntegerList(getDefaultInputForModule(module));
  }
  const nums = valResult.isValid ? valResult.values : [64, 34, 25, 12, 22, 11, 90];

  // 1. Sorting & Search
  if (module === 'sorting') {
    if (operation) {
      if (operation.type === 'insert' && operation.value !== undefined) {
        if (nums.length < 16) nums.push(operation.value);
      } else if (operation.type === 'delete') {
        if (nums.length > 2) nums.pop();
      }
    }
    switch (algo) {
      case 'quick':
        return generateQuickSortFrames(nums);
      case 'merge':
        return generateMergeSortFrames(nums);
      case 'heap':
        return generateHeapSortFrames(nums);
      case 'bubble':
        return generateBubbleSortFrames(nums);
      case 'insertion':
        return generateInsertionSortFrames(nums);
      case 'selection':
        return generateSelectionSortFrames(nums);
      case 'linearSearch':
        return generateLinearSearchFrames(nums, targetValue);
      case 'binarySearch':
        return generateBinarySearchFrames(nums, targetValue);
      default:
        return generateQuickSortFrames(nums);
    }
  }

  // 2. Stacks & Queues
  if (module === 'stacksQueues') {
    switch (algo) {
      case 'stack':
        return generateStackFrames(nums, operation);
      case 'linearQueue':
        return generateLinearQueueFrames(nums, operation);
      case 'circularQueue':
        return generateCircularQueueFrames(nums, operation);
      case 'priorityQueue':
        return generatePriorityQueueFrames(nums, operation);
      case 'deque':
        return generateDequeFrames(nums, operation);
      default:
        return generateStackFrames(nums, operation);
    }
  }

  // 3. Linked Lists
  if (module === 'linkedList') {
    switch (algo) {
      case 'singly':
      case 'singlyLinkedList':
        return generateLinkedListFrames('singly', nums, operation);
      case 'doubly':
        return generateLinkedListFrames('doubly', nums, operation);
      case 'circularSingly':
        return generateLinkedListFrames('circularSingly', nums, operation);
      case 'circularDoubly':
        return generateLinkedListFrames('circularDoubly', nums, operation);
      default:
        return generateLinkedListFrames('singly', nums, operation);
    }
  }

  // 4. Trees
  if (module === 'trees') {
    const order = operation?.order ?? 3;
    switch (algo) {
      case 'bst':
        return generateBSTFrames(nums, operation);
      case 'avl':
        return generateAVLFrames(nums, operation);
      case 'mway':
      case 'mWay':
        return generateMWayTreeFrames(nums, order, operation);
      case 'btree':
      case 'bTree':
        return generateBTreeFrames(nums, order, operation);
      case 'bplus':
      case 'bPlusTree':
        return generateBPlusTreeFrames(nums, order, operation);
      default:
        return generateBSTFrames(nums, operation);
    }
  }

  return generateQuickSortFrames(nums);
}
