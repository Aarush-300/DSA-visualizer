import { HighlightState } from './engine';

export type StackQueueType = 
  | 'stack' 
  | 'linearQueue' 
  | 'circularQueue' 
  | 'priorityQueue' 
  | 'deque';

export interface StackQueueItem {
  id: string;
  value: number;
  priority?: number; // for priority queue (1-99)
  state: HighlightState;
  index: number;
  isGhost?: boolean; // for vacated slots in linear queue
}

export interface HeapNodeItem {
  id: string;
  value: number;
  priority: number;
  index: number;
  state: HighlightState;
  x: number;
  y: number;
  leftChildIndex?: number;
  rightChildIndex?: number;
}

export interface StackQueueSnapshot {
  structureType: StackQueueType;
  items: StackQueueItem[];
  capacity: number;
  topIndex?: number | null;
  frontIndex?: number | null;
  rearIndex?: number | null;
  heapNodes?: HeapNodeItem[]; // for priority queue binary heap view
  telemetry: {
    size: number;
    capacity: number;
    topAddress?: string;
    frontAddress?: string;
    rearAddress?: string;
    formula?: string;
  };
}

export type StackQueueOpType = 
  | 'push' 
  | 'pop' 
  | 'peek' 
  | 'enqueue' 
  | 'dequeue' 
  | 'extract' 
  | 'delete' 
  | 'insertFront' 
  | 'insertRear' 
  | 'deleteFront' 
  | 'deleteRear';

export interface StackQueueOperation {
  type: StackQueueOpType;
  value?: number;
  priority?: number;
  index?: number;
}
