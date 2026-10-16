import { HighlightState } from './engine';

export type LinkedListType = 
  | 'singly' 
  | 'doubly' 
  | 'circularSingly' 
  | 'circularDoubly';

export interface MemoryNode {
  id: string;
  value: number;
  address: string; // e.g. "0x4F10"
  nextAddress: string | null; // e.g. "0x4F28" or null
  prevAddress?: string | null; // for doubly linked list
  state: HighlightState;
  isHead?: boolean;
  isTail?: boolean;
  x?: number;
  y?: number;
}

export type MemoryOperation = 'idle' | 'insert' | 'delete' | 'reverse' | 'search';

export type LinkedListOpType = 
  | 'insertHead' 
  | 'insertTail' 
  | 'insertIndex' 
  | 'deleteHead' 
  | 'deleteTail' 
  | 'deleteIndex' 
  | 'deleteValue' 
  | 'reverse' 
  | 'search';

export interface LinkedListOperation {
  type: LinkedListOpType;
  value?: number;
  index?: number;
}

export interface LinkedListSnapshot {
  listType: LinkedListType;
  nodes: MemoryNode[];
  headAddress: string | null;
  tailAddress?: string | null;
  activePointers: {
    prev?: string | null;
    curr?: string | null;
    next?: string | null;
    target?: string | null;
  };
  highlightedEdge?: {
    fromAddress: string;
    toAddress: string | null;
    isSevered?: boolean;
    isNew?: boolean;
    isPrevEdge?: boolean;
    isCircularFeedback?: boolean;
  };
}
