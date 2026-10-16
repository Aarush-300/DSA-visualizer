import { HighlightState } from './engine';

export type RotationType = 'LL' | 'RR' | 'LR' | 'RL' | 'none';

export type TraversalOrder = 'inorder' | 'preorder' | 'postorder' | 'levelorder';

export type TreeOpType = 'insert' | 'delete' | 'search';

export interface TreeOperation {
  type: TreeOpType;
  key: number;
}

export interface TreeNodeData {
  id: string;
  value: number;
  height: number;
  balanceFactor: number; // height(left) - height(right)
  state: HighlightState;
  leftId: string | null;
  rightId: string | null;
  parentId: string | null;
  x: number;
  y: number;
}

export interface TreeEdgeData {
  id: string;
  fromId: string;
  toId: string;
  state: HighlightState;
}

export interface MultiKeyNodeData {
  id: string;
  keys: number[];
  childrenIds: string[];
  parentId: string | null;
  isLeaf: boolean;
  nextLeafId?: string | null; // B+ Tree leaf chain
  nodeType?: 'internal' | 'leaf'; // B+ Tree
  state: HighlightState;
  x: number;
  y: number;
}

export interface TreeSnapshot {
  treeFamily?: 'binary' | 'mway' | 'btree' | 'bplus';
  orderM?: number; // Order M (e.g. 3 or 4)
  nodes: Record<string, TreeNodeData>;
  multiKeyNodes?: Record<string, MultiKeyNodeData>;
  rootId: string | null;
  activeRotation?: {
    type: RotationType;
    pivotValue: number;
    childValue: number;
    description: string;
  } | null;
  traversalSequence: number[];
  activePointerValue?: number | null;
}
