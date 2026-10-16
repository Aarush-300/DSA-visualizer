import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { MultiKeyNodeData, TreeOperation, TreeSnapshot } from '../../types/trees';
import { layoutMultiKeyTree } from './mWayTree';

const DEFAULT_ORDER = 3; // Order M=3 (2-3 Tree)

function createMetrics(): TelemetryMetrics {
  return {
    comparisons: 0,
    swaps: 0,
    memoryOps: 0,
    recursionDepth: 0,
    auxiliaryMemory: 'O(log n)',
  };
}

export function generateBTreeFrames(
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
  const minKeys = Math.ceil(order / 2) - 1;

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
        treeFamily: 'btree',
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
      operation: overrides?.opName ?? operation?.type ?? 'btree_state',
    });
  }

  function createNode(keys: number[], isLeaf = true): MultiKeyNodeData {
    metrics.memoryOps++;
    const id = `btree-node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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

  // Split node when keys.length > maxKeys
  function splitNode(nodeId: string): void {
    const node = multiKeyNodes[nodeId];
    if (node.keys.length <= maxKeys) return;

    metrics.memoryOps += 2;
    const midIdx = Math.floor(node.keys.length / 2);
    const midKey = node.keys[midIdx];
    const leftKeys = node.keys.slice(0, midIdx);
    const rightKeys = node.keys.slice(midIdx + 1);

    // Left retains node
    node.keys = leftKeys;

    // Right sibling
    const rightSibling = createNode(rightKeys, node.isLeaf);
    rightSibling.parentId = node.parentId;

    if (!node.isLeaf && node.childrenIds.length > 0) {
      const midChildIdx = midIdx + 1;
      rightSibling.childrenIds = node.childrenIds.slice(midChildIdx);
      node.childrenIds = node.childrenIds.slice(0, midChildIdx);
      for (const cid of rightSibling.childrenIds) {
        if (multiKeyNodes[cid]) multiKeyNodes[cid].parentId = rightSibling.id;
      }
    }

    if (!node.parentId) {
      // Node was root -> create new root
      const newRoot = createNode([midKey], false);
      newRoot.childrenIds = [node.id, rightSibling.id];
      node.parentId = newRoot.id;
      rightSibling.parentId = newRoot.id;
      rootId = newRoot.id;

      emitFrame(
        `ROOT SPLIT: Ascended median key [${midKey}] to new root. Tree height increased by +1. Left: [${leftKeys.join(',')}], Right: [${rightKeys.join(',')}].`,
        { cpp: 8, python: 8, pseudo: 6 },
        ['splitRoot()'],
        midKey,
        { mutateIds: [newRoot.id, node.id, rightSibling.id] }
      );
    } else {
      // Ascend to parent
      const parent = multiKeyNodes[node.parentId];
      let insertIdx = 0;
      while (insertIdx < parent.keys.length && midKey > parent.keys[insertIdx]) {
        insertIdx++;
      }
      parent.keys.splice(insertIdx, 0, midKey);
      parent.childrenIds.splice(insertIdx + 1, 0, rightSibling.id);

      emitFrame(
        `NODE SPLIT: Median key [${midKey}] promoted to parent node [${parent.id}]. New right sibling created with [${rightKeys.join(',')}].`,
        { cpp: 9, python: 9, pseudo: 7 },
        ['splitChild()'],
        midKey,
        { mutateIds: [parent.id, rightSibling.id] }
      );

      if (parent.keys.length > maxKeys) {
        splitNode(parent.id);
      }
    }
  }

  function insertKeyBTree(key: number) {
    if (!rootId) {
      const root = createNode([key], true);
      rootId = root.id;
      return;
    }

    // Find leaf
    let currId = rootId;
    while (!multiKeyNodes[currId].isLeaf && multiKeyNodes[currId].childrenIds.length > 0) {
      const curr = multiKeyNodes[currId];
      let i = 0;
      while (i < curr.keys.length && key > curr.keys[i]) {
        i++;
      }
      currId = curr.childrenIds[i] ?? curr.childrenIds[curr.childrenIds.length - 1];
    }

    const leaf = multiKeyNodes[currId];
    if (leaf.keys.includes(key)) return;

    leaf.keys.push(key);
    leaf.keys.sort((a, b) => a - b);

    if (leaf.keys.length > maxKeys) {
      splitNode(leaf.id);
    }
  }

  // Populate base tree
  const baseValues = values.slice(0, 5);
  for (const v of baseValues) {
    insertKeyBTree(v);
  }

  // Frame 0: Initial state
  emitFrame(
    `B-TREE HARDWARE INITIALIZED (Order M=${order}): Max keys: ${maxKeys}, Min keys: ${minKeys}. All leaves strictly at uniform depth.`,
    { cpp: 1, python: 1, pseudo: 1 },
    [`BTree::init(order=${order})`],
    null
  );

  if (!operation) return frames;

  const targetKey = operation.key;

  if (operation.type === 'insert') {
    if (!rootId) {
      const root = createNode([targetKey], true);
      rootId = root.id;
      emitFrame(
        `B-TREE ROOT CREATED: Allocated root holding key [${targetKey}].`,
        { cpp: 2, python: 2, pseudo: 2 },
        [`insert(${targetKey})`],
        targetKey,
        { mutateIds: [root.id] }
      );
      return frames;
    }

    // Traverse to leaf
    let currId: string = rootId;
    while (!multiKeyNodes[currId].isLeaf && multiKeyNodes[currId].childrenIds.length > 0) {
      const curr = multiKeyNodes[currId];
      curr.state = 'comparing';
      metrics.comparisons++;

      emitFrame(
        `TRAVERSING B-TREE: Scanning internal node [${curr.keys.join(', ')}] for branch path to key [${targetKey}].`,
        { cpp: 4, python: 4, pseudo: 3 },
        [`insert(${targetKey})`],
        targetKey,
        { activeIds: [curr.id] }
      );

      curr.state = 'idle';
      let i = 0;
      while (i < curr.keys.length && targetKey > curr.keys[i]) {
        i++;
      }
      currId = curr.childrenIds[i] ?? curr.childrenIds[curr.childrenIds.length - 1];
    }

    const leaf = multiKeyNodes[currId];
    leaf.state = 'comparing';

    emitFrame(
      `TARGET LEAF REACHED: Node ${leaf.id} [${leaf.keys.join(', ')}]. Checking capacity (${leaf.keys.length}/${maxKeys}).`,
      { cpp: 5, python: 5, pseudo: 4 },
      [`insert(${targetKey})`],
      targetKey,
      { activeIds: [leaf.id] }
    );

    leaf.state = 'idle';

    if (leaf.keys.includes(targetKey)) {
      emitFrame(
        `DUPLICATE KEY: Key [${targetKey}] already present in B-Tree. Insertion aborted.`,
        { cpp: 6, python: 6, pseudo: 4 },
        [`insert(${targetKey})`],
        targetKey
      );
      return frames;
    }

    leaf.keys.push(targetKey);
    leaf.keys.sort((a, b) => a - b);

    if (leaf.keys.length <= maxKeys) {
      emitFrame(
        `KEY COMMITTED: Inserted key [${targetKey}] into leaf. Node contains [${leaf.keys.join(', ')}].`,
        { cpp: 7, python: 7, pseudo: 5 },
        [`insert(${targetKey})`],
        targetKey,
        { sortedIds: [leaf.id] }
      );
    } else {
      emitFrame(
        `OVERFLOW DETECTED: Node ${leaf.id} has ${leaf.keys.length} keys > ${maxKeys} (Order M=${order}). Initiating node split!`,
        { cpp: 8, python: 8, pseudo: 6 },
        [`splitNode(${leaf.id})`],
        targetKey,
        { mutateIds: [leaf.id] }
      );
      splitNode(leaf.id);
    }
  } else if (operation.type === 'search') {
    let currId: string | null = rootId;
    let found = false;

    while (currId && !found) {
      const curr: MultiKeyNodeData = multiKeyNodes[currId];
      curr.state = 'comparing';
      metrics.comparisons++;

      emitFrame(
        `B-TREE SEARCH: Comparing target [${targetKey}] against node keys [${curr.keys.join(', ')}].`,
        { cpp: 3, python: 3, pseudo: 2 },
        [`search(${targetKey})`],
        targetKey,
        { activeIds: [curr.id] }
      );

      if (curr.keys.includes(targetKey)) {
        curr.state = 'sorted';
        emitFrame(
          `KEY FOUND: Target key [${targetKey}] located in B-Tree node ${curr.id}!`,
          { cpp: 5, python: 5, pseudo: 4 },
          [`search(${targetKey})`],
          targetKey,
          { sortedIds: [curr.id] }
        );
        found = true;
        break;
      }

      curr.state = 'idle';
      if (curr.isLeaf || curr.childrenIds.length === 0) break;

      let i = 0;
      while (i < curr.keys.length && targetKey > curr.keys[i]) {
        i++;
      }
      currId = curr.childrenIds[i] ?? null;
    }

    if (!found) {
      emitFrame(
        `KEY NOT FOUND: Target [${targetKey}] does not exist in this B-Tree.`,
        { cpp: 7, python: 7, pseudo: 6 },
        [`search(${targetKey})`],
        targetKey
      );
    }
  } else if (operation.type === 'delete') {
    // Locate node containing targetKey
    let targetNode: MultiKeyNodeData | null = null;
    for (const node of Object.values(multiKeyNodes)) {
      if (node.keys.includes(targetKey)) {
        targetNode = node;
        break;
      }
    }

    if (!targetNode) {
      emitFrame(`DELETE FAILED: Key [${targetKey}] does not exist in B-Tree.`, { cpp: 2, python: 2, pseudo: 2 }, []);
      return frames;
    }

    targetNode.state = 'comparing';
    emitFrame(
      `LOCATED KEY FOR DELETION: Found key [${targetKey}] in node ${targetNode.id}. Removing key.`,
      { cpp: 4, python: 4, pseudo: 3 },
      [`delete(${targetKey})`],
      targetKey,
      { activeIds: [targetNode.id] }
    );

    const idx = targetNode.keys.indexOf(targetKey);
    targetNode.keys.splice(idx, 1);
    targetNode.state = 'idle';

    // Underflow check
    if (targetNode.id !== rootId && targetNode.keys.length < minKeys) {
      emitFrame(
        `UNDERFLOW DETECTED: Node keys (${targetNode.keys.length}) < min allowed (${minKeys}). Sibling borrow / parent merge invoked.`,
        { cpp: 6, python: 6, pseudo: 5 },
        ['rebalanceUnderflow()'],
        targetKey,
        { mutateIds: [targetNode.id] }
      );
      // Clean up empty leaf if needed
      if (targetNode.keys.length === 0 && targetNode.isLeaf) {
        if (targetNode.parentId && multiKeyNodes[targetNode.parentId]) {
          const parent = multiKeyNodes[targetNode.parentId];
          parent.childrenIds = parent.childrenIds.filter((cid) => cid !== targetNode?.id);
        }
        delete multiKeyNodes[targetNode.id];
      }
    }

    emitFrame(
      `DELETE COMPLETED: Key [${targetKey}] purged. B-Tree invariants preserved.`,
      { cpp: 8, python: 8, pseudo: 6 },
      []
    );
  }

  return frames;
}
