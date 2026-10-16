import { HighlightState } from './engine';

export type GridCellType = 
  | 'empty' 
  | 'wall' 
  | 'start' 
  | 'target' 
  | 'weight' 
  | 'visited' 
  | 'path';

export interface GridCell {
  row: number;
  col: number;
  type: GridCellType;
  distance: number;
  weight?: number;
  fScore?: number;
  gScore?: number;
  hScore?: number;
  previousCell?: { row: number; col: number } | null;
}

export type HeuristicType = 'manhattan' | 'euclidean';

export type GraphMode = 'grid' | 'network';

export type NetworkOpType = 'insertVertex' | 'deleteVertex' | 'insertEdge' | 'deleteEdge' | 'mst';

export interface NetworkOperation {
  type: NetworkOpType;
  vertexId?: string;
  label?: string;
  x?: number;
  y?: number;
  source?: string;
  target?: string;
  weight?: number;
  edgeId?: string;
}

export interface NetworkVertex {
  id: string;
  label: string;
  x: number;
  y: number;
  state: HighlightState;
  distance?: number;
  predecessor?: string | null;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  state: HighlightState;
  directed?: boolean;
}

export interface GraphSnapshot {
  mode: GraphMode;
  grid?: GridCell[][];
  vertices?: NetworkVertex[];
  edges?: NetworkEdge[];
  startCoord?: { row: number; col: number };
  targetCoord?: { row: number; col: number };
  activeCell?: { row: number; col: number } | null;
  activeVertexId?: string | null;
  activeEdgeId?: string | null;
  mstEdges?: string[];
  frontierCount?: number;
}

