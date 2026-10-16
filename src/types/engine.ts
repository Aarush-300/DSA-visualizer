export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'completed';

export type ActiveModuleId = 'sorting' | 'stacksQueues' | 'linkedList' | 'trees' | 'graphs';

export type AlgorithmId =
  // 01 Sorting & Search
  | 'quick'
  | 'merge'
  | 'heap'
  | 'bubble'
  | 'insertion'
  | 'selection'
  | 'binarySearch'
  | 'linearSearch'
  // 02 Stacks & Queues
  | 'stack'
  | 'linearQueue'
  | 'circularQueue'
  | 'priorityQueue'
  | 'deque'
  // 03 Linked Lists
  | 'singlyLinkedList'
  | 'doublyLinkedList'
  | 'circularSinglyLinkedList'
  | 'circularDoublyLinkedList'
  | 'singly'
  | 'doubly'
  | 'circularSingly'
  | 'circularDoubly'
  // 04 Trees
  | 'bst'
  | 'avl'
  | 'mWay'
  | 'bTree'
  | 'bPlusTree'
  | 'mway'
  | 'btree'
  | 'bplus'
  // 05 Graphs
  | 'dijkstraGrid'
  | 'aStarGrid'
  | 'bfsGrid'
  | 'networkPrim'
  | 'networkDijkstra'
  | 'networkBfs';

export type CodeLanguage = 'c' | 'cpp' | 'java' | 'python' | 'pseudo' | 'algorithm';

export interface TelemetryMetrics {
  comparisons: number;
  swaps: number;
  memoryOps: number;
  recursionDepth: number;
  auxiliaryMemory?: string;
}

export type HighlightState = 
  | 'idle' 
  | 'compare' 
  | 'comparing'
  | 'swap' 
  | 'active'
  | 'inspecting'
  | 'visited' 
  | 'pivot' 
  | 'sorted';

export interface StepFrame<TState = unknown> {
  frameIndex: number;
  snapshot: TState;
  pointers: Record<string, number | string | null>;
  codeLine: {
    cpp: number;
    python: number;
    pseudo: number;
    c?: number;
    java?: number;
    algorithm?: number;
  };
  narration: string;
  metrics: TelemetryMetrics;
  callStack: string[];
  operation?: string;
  activeIds?: (string | number)[];
  mutateIds?: (string | number)[];
  pivotIds?: (string | number)[];
  sortedIds?: (string | number)[];
  secondaryQueue?: string[];
}
