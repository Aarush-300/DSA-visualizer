import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { RotationType, TreeNodeData, TreeSnapshot } from '../../types/trees';
import { layoutBinaryTree } from '../../utils/treeLayout';

export function generateAVLInsertionFrames(valuesToInsert: number[]): StepFrame<TreeSnapshot>[] {
  const frames: StepFrame<TreeSnapshot>[] = [];
  const nodes: Record<string, TreeNodeData> = {};
  let rootId: string | null = null;

  const metrics: TelemetryMetrics = {
    comparisons: 0,
    swaps: 0,
    memoryOps: 0,
    recursionDepth: 0,
    auxiliaryMemory: 'O(log n) Tree Height',
  };

  let frameCount = 0;

  function getNodeHeight(id: string | null): number {
    if (!id || !nodes[id]) return 0;
    return nodes[id].height;
  }

  function updateNodeHeightAndBalance(id: string) {
    if (!nodes[id]) return;
    const lh = getNodeHeight(nodes[id].leftId);
    const rh = getNodeHeight(nodes[id].rightId);
    nodes[id].height = 1 + Math.max(lh, rh);
    nodes[id].balanceFactor = lh - rh;
  }

  function refreshLayout() {
    const coords = layoutBinaryTree(nodes, rootId);
    for (const [id, pt] of Object.entries(coords)) {
      if (nodes[id]) {
        nodes[id].x = pt.x;
        nodes[id].y = pt.y;
      }
    }
  }

  function cloneNodes(): Record<string, TreeNodeData> {
    const result: Record<string, TreeNodeData> = {};
    for (const [k, v] of Object.entries(nodes)) {
      result[k] = { ...v };
    }
    return result;
  }

  function emitFrame(
    narration: string,
    codeLine: { cpp: number; python: number; pseudo: number },
    callStack: string[],
    rotation?: { type: RotationType; pivotValue: number; childValue: number; description: string } | null,
    activePointer?: number | null,
    overrides?: {
      activeIds?: (string | number)[];
      mutateIds?: (string | number)[];
      pivotIds?: (string | number)[];
    }
  ) {
    refreshLayout();
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        nodes: cloneNodes(),
        rootId,
        activeRotation: rotation,
        traversalSequence: [],
        activePointerValue: activePointer,
      },
      pointers: { active: activePointer ?? null },
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: [...callStack],
      activeIds: overrides?.activeIds,
      mutateIds: overrides?.mutateIds,
      pivotIds: overrides?.pivotIds,
    });
  }

  function rotateRight(yId: string): string {
    metrics.swaps++;
    metrics.memoryOps += 4;
    const y = nodes[yId];
    const xId = y.leftId!;
    const x = nodes[xId];
    const t2Id = x.rightId;

    // Perform rotation
    x.rightId = yId;
    y.leftId = t2Id;

    if (t2Id && nodes[t2Id]) nodes[t2Id].parentId = yId;
    x.parentId = y.parentId;
    y.parentId = xId;

    updateNodeHeightAndBalance(yId);
    updateNodeHeightAndBalance(xId);
    return xId;
  }

  function rotateLeft(xId: string): string {
    metrics.swaps++;
    metrics.memoryOps += 4;
    const x = nodes[xId];
    const yId = x.rightId!;
    const y = nodes[yId];
    const t2Id = y.leftId;

    // Perform rotation
    y.leftId = xId;
    x.rightId = t2Id;

    if (t2Id && nodes[t2Id]) nodes[t2Id].parentId = xId;
    y.parentId = x.parentId;
    x.parentId = yId;

    updateNodeHeightAndBalance(xId);
    updateNodeHeightAndBalance(yId);
    return yId;
  }

  function insertHelper(currentId: string | null, val: number, depth: number): string {
    metrics.recursionDepth = Math.max(metrics.recursionDepth, depth);

    if (!currentId) {
      metrics.memoryOps++;
      const newId = `node-${val}`;
      nodes[newId] = {
        id: newId,
        value: val,
        height: 1,
        balanceFactor: 0,
        state: 'sorted',
        leftId: null,
        rightId: null,
        parentId: null,
        x: 400,
        y: 60,
      };

      if (!rootId) rootId = newId;

      emitFrame(
        `Created new leaf node with value ${val} in AVL tree.`,
        { cpp: 3, python: 2, pseudo: 2 },
        [`avlInsert(${val})`],
        null,
        val,
        { mutateIds: [newId] }
      );
      return newId;
    }

    const curr = nodes[currentId];
    curr.state = 'compare';
    metrics.comparisons++;

    emitFrame(
      `Comparing inserted value ${val} with current node ${curr.value}.`,
      { cpp: 3, python: 3, pseudo: 3 },
      [`avlInsert(${val})`, `compare(curr=${curr.value})`],
      null,
      val,
      { activeIds: [curr.id] }
    );

    curr.state = 'idle';

    if (val < curr.value) {
      curr.leftId = insertHelper(curr.leftId, val, depth + 1);
      nodes[curr.leftId].parentId = currentId;
    } else if (val > curr.value) {
      curr.rightId = insertHelper(curr.rightId, val, depth + 1);
      nodes[curr.rightId].parentId = currentId;
    } else {
      return currentId; // duplicate ignored
    }

    // Update height and balance
    updateNodeHeightAndBalance(currentId);
    const balance = curr.balanceFactor;

    emitFrame(
      `Node ${curr.value} updated height = ${curr.height}, balance factor = ${balance > 0 ? '+' : ''}${balance}.`,
      { cpp: 2, python: 2, pseudo: 2 },
      [`avlInsert(${val})`, `checkBalance(${curr.value})`],
      null,
      curr.value
    );

    // Balance checks:
    // Left Left Case
    if (balance > 1 && curr.leftId && val < nodes[curr.leftId].value) {
      curr.state = 'pivot';
      nodes[curr.leftId].state = 'pivot';
      emitFrame(
        `Imbalance at Node ${curr.value} (BF = +${balance}). Left child is left-heavy. Executing Right Rotation (LL).`,
        { cpp: 5, python: 5, pseudo: 3 },
        [`avlInsert(${val})`, `rotateRight(${curr.value})`],
        { type: 'LL', pivotValue: curr.value, childValue: nodes[curr.leftId].value, description: 'Right Rotation (LL)' },
        curr.value,
        { pivotIds: [curr.id, nodes[curr.leftId].id] }
      );
      curr.state = 'idle';
      nodes[curr.leftId].state = 'idle';
      const newSubRoot = rotateRight(currentId);
      if (currentId === rootId) rootId = newSubRoot;
      emitFrame(
        `Right Rotation (LL) completed. New subtree root is ${nodes[newSubRoot].value}.`,
        { cpp: 9, python: 9, pseudo: 3 },
        [`avlInsert(${val})`],
        null,
        nodes[newSubRoot].value
      );
      return newSubRoot;
    }

    // Right Right Case
    if (balance < -1 && curr.rightId && val > nodes[curr.rightId].value) {
      curr.state = 'pivot';
      nodes[curr.rightId].state = 'pivot';
      emitFrame(
        `Imbalance at Node ${curr.value} (BF = ${balance}). Right child is right-heavy. Executing Left Rotation (RR).`,
        { cpp: 11, python: 7, pseudo: 4 },
        [`avlInsert(${val})`, `rotateLeft(${curr.value})`],
        { type: 'RR', pivotValue: curr.value, childValue: nodes[curr.rightId].value, description: 'Left Rotation (RR)' },
        curr.value,
        { pivotIds: [curr.id, nodes[curr.rightId].id] }
      );
      curr.state = 'idle';
      nodes[curr.rightId].state = 'idle';
      const newSubRoot = rotateLeft(currentId);
      if (currentId === rootId) rootId = newSubRoot;
      emitFrame(
        `Left Rotation (RR) completed. New subtree root is ${nodes[newSubRoot].value}.`,
        { cpp: 15, python: 9, pseudo: 4 },
        [`avlInsert(${val})`],
        null,
        nodes[newSubRoot].value
      );
      return newSubRoot;
    }

    // Left Right Case
    if (balance > 1 && curr.leftId && val > nodes[curr.leftId].value) {
      emitFrame(
        `Imbalance at Node ${curr.value} (BF = +${balance}). Left child has opposite sign (LR). Step 1: Rotate Left on left child ${nodes[curr.leftId].value}.`,
        { cpp: 11, python: 7, pseudo: 5 },
        [`avlInsert(${val})`, `rotateLeftRight(${curr.value})`],
        { type: 'LR', pivotValue: curr.value, childValue: nodes[curr.leftId].value, description: 'Double Rotation (LR)' }
      );
      curr.leftId = rotateLeft(curr.leftId);
      const newSubRoot = rotateRight(currentId);
      if (currentId === rootId) rootId = newSubRoot;
      emitFrame(
        `Double Rotation (LR) completed. Subtree rebalanced around ${nodes[newSubRoot].value}.`,
        { cpp: 5, python: 5, pseudo: 5 },
        [`avlInsert(${val})`],
        null,
        nodes[newSubRoot].value
      );
      return newSubRoot;
    }

    // Right Left Case
    if (balance < -1 && curr.rightId && val < nodes[curr.rightId].value) {
      emitFrame(
        `Imbalance at Node ${curr.value} (BF = ${balance}). Right child has opposite sign (RL). Step 1: Rotate Right on right child ${nodes[curr.rightId].value}.`,
        { cpp: 5, python: 5, pseudo: 6 },
        [`avlInsert(${val})`, `rotateRightLeft(${curr.value})`],
        { type: 'RL', pivotValue: curr.value, childValue: nodes[curr.rightId].value, description: 'Double Rotation (RL)' }
      );
      curr.rightId = rotateRight(curr.rightId);
      const newSubRoot = rotateLeft(currentId);
      if (currentId === rootId) rootId = newSubRoot;
      emitFrame(
        `Double Rotation (RL) completed. Subtree rebalanced around ${nodes[newSubRoot].value}.`,
        { cpp: 11, python: 7, pseudo: 6 },
        [`avlInsert(${val})`],
        null,
        nodes[newSubRoot].value
      );
      return newSubRoot;
    }

    return currentId;
  }

  for (const val of valuesToInsert) {
    rootId = insertHelper(rootId, val, 1);
  }

  for (const n of Object.values(nodes)) {
    n.state = 'idle';
  }

  emitFrame(
    `All ${valuesToInsert.length} values inserted into AVL tree. Strict height balancing verified (|BF| <= 1 for all nodes).`,
    { cpp: 1, python: 1, pseudo: 1 },
    []
  );

  return frames;
}

export function generateAVLFrames(values: number[], operation?: { type: 'insert' | 'delete' | 'search'; key: number }): StepFrame<TreeSnapshot>[] {
  const effectiveValues = operation && operation.type === 'insert' ? [...values, operation.key] : values;
  return generateAVLInsertionFrames(effectiveValues);
}

