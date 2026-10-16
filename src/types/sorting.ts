import { HighlightState } from './engine';

export type SortingAlgorithmId = 
  | 'bubble' 
  | 'merge' 
  | 'quick' 
  | 'heap' 
  | 'insertion'
  | 'selection'
  | 'linearSearch'
  | 'binarySearch';

export interface ArrayBarItem {
  id: string; // Persistent unique ID for Framer Motion layoutId
  value: number;
  state: HighlightState;
  index: number;
}

export interface PartitionRange {
  start: number;
  end: number;
}

export interface SortingSnapshot {
  bars: ArrayBarItem[];
  activeRange?: PartitionRange;
  heapTreeSize?: number;
}

export interface SearchingSnapshot {
  bars: ArrayBarItem[];
  target: number;
  foundIndex: number | null;
  low: number;
  high: number;
  mid: number | null;
}

