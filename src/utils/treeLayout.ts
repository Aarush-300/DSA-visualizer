import { TreeNodeData } from '../types/trees';

export interface LayoutOptions {
  nodeRadius?: number;
  levelHeight?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  minNodeSpacing?: number;
}

/**
 * Calculates deterministic (x, y) coordinates for binary trees using
 * inorder indexing to guarantee zero node overlap regardless of skew.
 */
export function layoutBinaryTree(
  nodes: Record<string, TreeNodeData>,
  rootId: string | null,
  options: LayoutOptions = {}
): Record<string, { x: number; y: number }> {
  const result: Record<string, { x: number; y: number }> = {};
  if (!rootId || !nodes[rootId]) return result;

  const levelHeight = options.levelHeight ?? 75;
  const canvasWidth = options.canvasWidth ?? 800;
  const minNodeSpacing = options.minNodeSpacing ?? 48;

  // Compute depth and count nodes in tree
  let inorderIndex = 0;
  const inorderIndices: Record<string, number> = {};
  const depths: Record<string, number> = {};

  function traverseInorder(nodeId: string | null, depth: number) {
    if (!nodeId || !nodes[nodeId]) return;
    const node = nodes[nodeId];

    traverseInorder(node.leftId, depth + 1);

    inorderIndices[nodeId] = inorderIndex;
    depths[nodeId] = depth;
    inorderIndex++;

    traverseInorder(node.rightId, depth + 1);
  }

  traverseInorder(rootId, 0);

  const totalNodes = inorderIndex;
  const requiredWidth = Math.max(canvasWidth - 100, (totalNodes + 1) * minNodeSpacing);
  const startX = (canvasWidth - requiredWidth) / 2 + minNodeSpacing;
  const stepX = totalNodes > 1 ? (requiredWidth - minNodeSpacing * 2) / (totalNodes - 1) : 0;
  const startY = 60;

  for (const nodeId of Object.keys(inorderIndices)) {
    const idx = inorderIndices[nodeId];
    const depth = depths[nodeId];
    result[nodeId] = {
      x: totalNodes === 1 ? canvasWidth / 2 : startX + idx * stepX,
      y: startY + depth * levelHeight,
    };
  }

  return result;
}

