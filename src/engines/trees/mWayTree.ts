import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { MultiKeyNodeData, TreeOperation, TreeSnapshot } from '../../types/trees';

const DEFAULT_ORDER = 3; // M=3: up to 2 keys, 3 children

function createMetrics(): TelemetryMetrics {
  return {
    comparisons: 0,
    swaps: 0,
    memoryOps: 0,
    recursionDepth: 0,
    auxiliaryMemory: 'O(log_M n)',
  };
}

export function layoutMultiKeyTree(
  nodes: Record<string, MultiKeyNodeData>,
  rootId: string | null,
  canvasWidth = 780
): void {
  if (!rootId || !nodes[rootId]) return;

  // Compute leaf sequence for x-positioning
  let leafIndex = 0;
  const leafPositions: Record<string, number> = {};

  // First pass leaves
  function collectLeaves(nodeId: string) {
    const node = nodes[nodeId];
    if (!node) return;
    if (node.childrenIds.length === 0) {
      leafPositions[nodeId] = leafIndex++;
    } else {
      for (const childId of node.childrenIds) {
        collectLeaves(childId);
      }
    }
  }

  collectLeaves(rootId);
  const totalLeaves = Math.max(1, leafIndex);
  const stepX = Math.min(180, Math.max(110, (canvasWidth - 100) / totalLeaves));
  const startX = Math.max(60, (canvasWidth - totalLeaves * stepX) / 2 + stepX / 2);

  // Position nodes bottom-up
  function assignCoords(nodeId: string, depth: number) {
    const node = nodes[nodeId];
    if (!node) return;
    node.y = 50 + depth * 85;

    if (node.childrenIds.length === 0) {
      const idx = leafPositions[nodeId] ?? 0;
      node.x = startX + idx * stepX;
    } else {
      for (const childId of node.childrenIds) {
        assignCoords(childId, depth + 1);
      }
      const firstX = nodes[node.childrenIds[0]]?.x ?? startX;
      const lastX = nodes[node.childrenIds[node.childrenIds.length - 1]]?.x ?? startX;
      node.x = (firstX + lastX) / 2;
    }
  }

  assignCoords(rootId, 0);
}

export function generateMWayTreeFrames(
  values: number[],
  order: number = DEFAULT_ORDER,
  operation?: TreeOperation
): StepFrame<TreeSnapshot>[] {
  const frames: StepFrame<TreeSnapshot>[] = [];
  const metrics = createMetrics();
  let frameCount = 0;

  const multiKeyNodes: Record<string, MultiKeyNodeData> = {};
  let rootId: string | null = null;
  const maxKeys = order - 1;

  function cloneMultiKeyNodes(): Record<string, MultiKeyNodeData> {
    const res: Record<string, MultiKeyNodeData> = {};
    for (const [k, v] of Object.entries(multiKeyNodes)) {
      res[k] = { ...v, keys: [...v.keys], childrenIds: [...v.childrenIds] };
    }
    return res;
  }

  function emitFrame(
    narration: string,
    codeLine: { cpp: number; python: number; pseudo: number },
    callStack: string[],
    activeVal?: number | null,
    overrides?: {
      activeIds?: (string | number)[];
      mutateIds?: (string | number)[];
      sortedIds?: (string | number)[];
      opName?: string;
    }
  ) {
    layoutMultiKeyTree(multiKeyNodes, rootId);
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        treeFamily: 'mway',
        orderM: order,
        nodes: {},
        multiKeyNodes: cloneMultiKeyNodes(),
        rootId,
        traversalSequence: [],
        activePointerValue: activeVal,
      },
      pointers: { active: activeVal ?? null },
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: [...callStack],
      activeIds: overrides?.activeIds,
      mutateIds: overrides?.mutateIds,
      sortedIds: overrides?.sortedIds,
      operation: overrides?.opName ?? operation?.type ?? 'mway_state',
    });
  }

  // Build baseline initial tree
  function createNode(keys: number[], isLeaf = true): MultiKeyNodeData {
    metrics.memoryOps++;
    const id = `mway-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const node: MultiKeyNodeData = {
      id,
      keys: [...keys].sort((a, b) => a - b),
      childrenIds: [],
      parentId: null,
      isLeaf,
      state: 'idle',
      x: 390,
      y: 60,
    };
    multiKeyNodes[id] = node;
    return node;
  }

  function insertKeySimple(key: number) {
    if (!rootId) {
      const root = createNode([key]);
      rootId = root.id;
      return;
    }

    let currId = rootId;
    while (currId) {
      const curr = multiKeyNodes[currId];
      if (curr.keys.includes(key)) return;

      if (curr.keys.length < maxKeys) {
        curr.keys.push(key);
        curr.keys.sort((a, b) => a - b);
        return;
      }

      // If full and leaf, spawn child
      if (curr.childrenIds.length === 0) {
        let childIdx = 0;
        while (childIdx < curr.keys.length && key > curr.keys[childIdx]) {
          childIdx++;
        }
        const child = createNode([key]);
        child.parentId = currId;
        while (curr.childrenIds.length < childIdx) {
          const empty = createNode([]);
          empty.parentId = currId;
          curr.childrenIds.push(empty.id);
        }
        curr.childrenIds.splice(childIdx, 0, child.id);
        return;
      }

      // Branch to appropriate child
      let childIdx = 0;
      while (childIdx < curr.keys.length && key > curr.keys[childIdx]) {
        childIdx++;
      }
      if (childIdx < curr.childrenIds.length) {
        currId = curr.childrenIds[childIdx];
      } else {
        const child = createNode([key]);
        child.parentId = currId;
        curr.childrenIds.push(child.id);
        return;
      }
    }
  }

  const baseValues = values.slice(0, 5);
  for (const v of baseValues) {
    insertKeySimple(v);
  }

  // Frame 0: Initial State
  emitFrame(
    `M-WAY SEARCH TREE (M=${order}): Multi-key node block architecture [ *P0 | K1 | *P1 | K2 | *P2 ]. Max keys/node: ${maxKeys}.`,
    { cpp: 1, python: 1, pseudo: 1 },
    [`MWayTree::init(M=${order})`],
    null
  );

  if (!operation) return frames;

  const targetKey = operation.key;

  if (operation.type === 'insert') {
    if (!rootId) {
      const root = createNode([targetKey]);
      rootId = root.id;
      emitFrame(
        `INSERT ROOT: Created root node holding key [${targetKey}].`,
        { cpp: 2, python: 2, pseudo: 2 },
        [`insert(${targetKey})`],
        targetKey,
        { mutateIds: [root.id] }
      );
      return frames;
    }

    let currId: string | null = rootId;
    let placed = false;

    while (currId && !placed) {
      const curr: MultiKeyNodeData = multiKeyNodes[currId];
      curr.state = 'comparing';
      metrics.comparisons++;

      emitFrame(
        `COMPARE KEYS: Inspecting node [${curr.keys.join(', ')}]. Checking slot for key [${targetKey}].`,
        { cpp: 4, python: 4, pseudo: 3 },
        [`insert(${targetKey})`],
        targetKey,
        { activeIds: [curr.id] }
      );

      curr.state = 'idle';

      if (curr.keys.length < maxKeys) {
        curr.keys.push(targetKey);
        curr.keys.sort((a: number, b: number) => a - b);
        placed = true;

        emitFrame(
          `KEY INSERTED: Node has available capacity (${curr.keys.length}/${maxKeys}). Inserted key [${targetKey}] in sorted order.`,
          { cpp: 6, python: 6, pseudo: 5 },
          [`insert(${targetKey})`],
          targetKey,
          { sortedIds: [curr.id] }
        );
        break;
      }

      // Branch to child
      let childIdx = 0;
      while (childIdx < curr.keys.length && targetKey > curr.keys[childIdx]) {
        childIdx++;
      }

      if (childIdx < curr.childrenIds.length) {
        currId = curr.childrenIds[childIdx];
      } else {
        const child = createNode([targetKey]);
        child.parentId = currId;
        curr.childrenIds.splice(childIdx, 0, child.id);
        placed = true;

        emitFrame(
          `SPAWN CHILD: Parent saturated. Spawning child node for branch P${childIdx} with key [${targetKey}].`,
          { cpp: 8, python: 8, pseudo: 7 },
          [`insert(${targetKey})`],
          targetKey,
          { sortedIds: [child.id] }
        );
        break;
      }
    }
  } else if (operation.type === 'search') {
    let currId: string | null = rootId;
    let found = false;

    while (currId && !found) {
      const curr: MultiKeyNodeData = multiKeyNodes[currId];
      curr.state = 'comparing';
      metrics.comparisons++;

      emitFrame(
        `M-WAY SEARCH: Scanning node keys [${curr.keys.join(', ')}] for target [${targetKey}].`,
        { cpp: 3, python: 3, pseudo: 2 },
        [`search(${targetKey})`],
        targetKey,
        { activeIds: [curr.id] }
      );

      if (curr.keys.includes(targetKey)) {
        curr.state = 'sorted';
        emitFrame(
          `TARGET FOUND: Key [${targetKey}] verified inside node ${curr.id}!`,
          { cpp: 5, python: 5, pseudo: 4 },
          [`search(${targetKey})`],
          targetKey,
          { sortedIds: [curr.id] }
        );
        found = true;
        break;
      }

      curr.state = 'idle';
      let childIdx = 0;
      while (childIdx < curr.keys.length && targetKey > curr.keys[childIdx]) {
        childIdx++;
      }

      if (childIdx < curr.childrenIds.length) {
        currId = curr.childrenIds[childIdx];
      } else {
        break;
      }
    }

    if (!found) {
      emitFrame(
        `SEARCH TERMINATED: Key [${targetKey}] is not present in M-Way Search Tree.`,
        { cpp: 7, python: 7, pseudo: 6 },
        [`search(${targetKey})`],
        targetKey
      );
    }
  } else if (operation.type === 'delete') {
    // Delete key from node
    for (const node of Object.values(multiKeyNodes)) {
      const idx = node.keys.indexOf(targetKey);
      if (idx !== -1) {
        node.state = 'comparing';
        emitFrame(
          `DELETE KEY: Located key [${targetKey}] in node ${node.id}. Removing key.`,
          { cpp: 4, python: 4, pseudo: 3 },
          [`delete(${targetKey})`],
          targetKey,
          { activeIds: [node.id] }
        );

        node.keys.splice(idx, 1);
        node.state = 'idle';

        emitFrame(
          `KEY PURGED: Key [${targetKey}] removed. Remaining keys: [${node.keys.join(', ') || 'EMPTY'}].`,
          { cpp: 6, python: 6, pseudo: 5 },
          [`delete(${targetKey})`]
        );
        break;
      }
    }
  }

  return frames;
}
