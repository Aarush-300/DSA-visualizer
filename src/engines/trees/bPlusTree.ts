import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { MultiKeyNodeData, TreeOperation, TreeSnapshot } from '../../types/trees';
import { layoutMultiKeyTree } from './mWayTree';

const DEFAULT_ORDER = 3;

function createMetrics(): TelemetryMetrics {
  return {
    comparisons: 0,
    swaps: 0,
    memoryOps: 0,
    recursionDepth: 0,
    auxiliaryMemory: 'O(log n) Index + Leaf Bus',
  };
}

export function generateBPlusTreeFrames(
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

  function syncLeafChains() {
    // Find all leaves in left-to-right order
    const leaves: MultiKeyNodeData[] = [];
    function traverse(nodeId: string) {
      const node = multiKeyNodes[nodeId];
      if (!node) return;
      if (node.isLeaf) {
        leaves.push(node);
      } else {
        for (const cid of node.childrenIds) {
          traverse(cid);
        }
      }
    }
    if (rootId) traverse(rootId);

    // Link nextLeafId
    for (let i = 0; i < leaves.length; i++) {
      leaves[i].nextLeafId = i < leaves.length - 1 ? leaves[i + 1].id : null;
    }
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
    syncLeafChains();
    layoutMultiKeyTree(multiKeyNodes, rootId);
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        treeFamily: 'bplus',
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
      operation: overrides?.opName ?? operation?.type ?? 'bplus_state',
    });
  }

  function createNode(keys: number[], isLeaf = true): MultiKeyNodeData {
    metrics.memoryOps++;
    const id = `bplus-node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const node: MultiKeyNodeData = {
      id,
      keys: [...keys].sort((a, b) => a - b),
      childrenIds: [],
      parentId: null,
      isLeaf,
      nodeType: isLeaf ? 'leaf' : 'internal',
      nextLeafId: null,
      state: 'idle',
      x: 390,
      y: 60,
    };
    multiKeyNodes[id] = node;
    return node;
  }

  function splitLeaf(leafId: string) {
    const leaf = multiKeyNodes[leafId];
    if (leaf.keys.length <= maxKeys) return;

    metrics.memoryOps += 2;
    const midIdx = Math.floor(leaf.keys.length / 2);
    // In B+ Tree, key is COPIED UP into parent, NOT removed from leaf!
    const copyUpKey = leaf.keys[midIdx];
    const leftKeys = leaf.keys.slice(0, midIdx);
    const rightKeys = leaf.keys.slice(midIdx); // leaf retains midKey!

    leaf.keys = leftKeys;
    const rightSibling = createNode(rightKeys, true);
    rightSibling.parentId = leaf.parentId;

    if (!leaf.parentId) {
      // Create new root (internal routing node)
      const newRoot = createNode([copyUpKey], false);
      newRoot.childrenIds = [leaf.id, rightSibling.id];
      leaf.parentId = newRoot.id;
      rightSibling.parentId = newRoot.id;
      rootId = newRoot.id;

      emitFrame(
        `B+ LEAF SPLIT (COPY-UP): Key [${copyUpKey}] copied up to new root index router while remaining preserved in right leaf. Emerald leaf bus connected!`,
        { cpp: 8, python: 8, pseudo: 6 },
        ['splitLeaf()'],
        copyUpKey,
        { mutateIds: [newRoot.id, leaf.id, rightSibling.id] }
      );
    } else {
      const parent = multiKeyNodes[leaf.parentId];
      let insertIdx = 0;
      while (insertIdx < parent.keys.length && copyUpKey > parent.keys[insertIdx]) {
        insertIdx++;
      }
      parent.keys.splice(insertIdx, 0, copyUpKey);
      parent.childrenIds.splice(insertIdx + 1, 0, rightSibling.id);

      emitFrame(
        `B+ LEAF SPLIT: Copy-up key [${copyUpKey}] promoted to parent index router. Horizontal leaf chain updated.`,
        { cpp: 9, python: 9, pseudo: 7 },
        ['splitLeaf()'],
        copyUpKey,
        { mutateIds: [parent.id, rightSibling.id] }
      );

      if (parent.keys.length > maxKeys) {
        splitInternal(parent.id);
      }
    }
  }

  function splitInternal(internalId: string) {
    const node = multiKeyNodes[internalId];
    if (node.keys.length <= maxKeys) return;

    metrics.memoryOps += 2;
    const midIdx = Math.floor(node.keys.length / 2);
    const midKey = node.keys[midIdx]; // Internal nodes push up, do not keep
    const leftKeys = node.keys.slice(0, midIdx);
    const rightKeys = node.keys.slice(midIdx + 1);

    node.keys = leftKeys;
    const rightSibling = createNode(rightKeys, false);
    rightSibling.parentId = node.parentId;

    const midChildIdx = midIdx + 1;
    rightSibling.childrenIds = node.childrenIds.slice(midChildIdx);
    node.childrenIds = node.childrenIds.slice(0, midChildIdx);
    for (const cid of rightSibling.childrenIds) {
      if (multiKeyNodes[cid]) multiKeyNodes[cid].parentId = rightSibling.id;
    }

    if (!node.parentId) {
      const newRoot = createNode([midKey], false);
      newRoot.childrenIds = [node.id, rightSibling.id];
      node.parentId = newRoot.id;
      rightSibling.parentId = newRoot.id;
      rootId = newRoot.id;

      emitFrame(
        `INTERNAL ROUTER SPLIT: Promoted router key [${midKey}] to new root.`,
        { cpp: 11, python: 11, pseudo: 8 },
        ['splitInternal()'],
        midKey,
        { mutateIds: [newRoot.id, node.id, rightSibling.id] }
      );
    } else {
      const parent = multiKeyNodes[node.parentId];
      let insertIdx = 0;
      while (insertIdx < parent.keys.length && midKey > parent.keys[insertIdx]) {
        insertIdx++;
      }
      parent.keys.splice(insertIdx, 0, midKey);
      parent.childrenIds.splice(insertIdx + 1, 0, rightSibling.id);

      if (parent.keys.length > maxKeys) {
        splitInternal(parent.id);
      }
    }
  }

  function insertKeyBPlus(key: number) {
    if (!rootId) {
      const root = createNode([key], true);
      rootId = root.id;
      return;
    }

    let currId = rootId;
    while (!multiKeyNodes[currId].isLeaf && multiKeyNodes[currId].childrenIds.length > 0) {
      const curr = multiKeyNodes[currId];
      let i = 0;
      while (i < curr.keys.length && key >= curr.keys[i]) {
        i++;
      }
      currId = curr.childrenIds[i] ?? curr.childrenIds[curr.childrenIds.length - 1];
    }

    const leaf = multiKeyNodes[currId];
    if (leaf.keys.includes(key)) return;

    leaf.keys.push(key);
    leaf.keys.sort((a, b) => a - b);

    if (leaf.keys.length > maxKeys) {
      splitLeaf(leaf.id);
    }
  }

  // Populate base tree
  const baseValues = values.slice(0, 5);
  for (const v of baseValues) {
    insertKeyBPlus(v);
  }

  // Frame 0
  emitFrame(
    `B+ TREE HARDWARE ARCHITECTURE (Order M=${order}): Internal routers direct traffic; Leaves store all records linked by Emerald Leaf Bus.`,
    { cpp: 1, python: 1, pseudo: 1 },
    [`BPlusTree::init(order=${order})`],
    null
  );

  if (!operation) return frames;

  const targetKey = operation.key;

  if (operation.type === 'insert') {
    if (!rootId) {
      const root = createNode([targetKey], true);
      rootId = root.id;
      emitFrame(
        `B+ TREE ROOT LEAF ALLOCATED: Key [${targetKey}] written.`,
        { cpp: 2, python: 2, pseudo: 2 },
        [`insert(${targetKey})`],
        targetKey,
        { mutateIds: [root.id] }
      );
      return frames;
    }

    // Traverse down routers
    let currId: string = rootId;
    while (!multiKeyNodes[currId].isLeaf && multiKeyNodes[currId].childrenIds.length > 0) {
      const curr = multiKeyNodes[currId];
      curr.state = 'comparing';
      metrics.comparisons++;

      emitFrame(
        `ROUTING KEY TRAFFIC: Inspecting index router [${curr.keys.join(', ')}] for key [${targetKey}].`,
        { cpp: 3, python: 3, pseudo: 2 },
        [`route(${targetKey})`],
        targetKey,
        { activeIds: [curr.id] }
      );

      curr.state = 'idle';
      let i = 0;
      while (i < curr.keys.length && targetKey >= curr.keys[i]) {
        i++;
      }
      currId = curr.childrenIds[i] ?? curr.childrenIds[curr.childrenIds.length - 1];
    }

    const leaf = multiKeyNodes[currId];
    leaf.state = 'comparing';

    emitFrame(
      `TARGET DATA LEAF REACHED: Node ${leaf.id} [${leaf.keys.join(', ')}]. Checking record capacity.`,
      { cpp: 5, python: 5, pseudo: 4 },
      [`insert(${targetKey})`],
      targetKey,
      { activeIds: [leaf.id] }
    );

    leaf.state = 'idle';

    if (leaf.keys.includes(targetKey)) {
      emitFrame(
        `KEY ALREADY PRESENT: Key [${targetKey}] exists in leaf record store.`,
        { cpp: 6, python: 6, pseudo: 5 },
        [],
        targetKey
      );
      return frames;
    }

    leaf.keys.push(targetKey);
    leaf.keys.sort((a, b) => a - b);

    if (leaf.keys.length <= maxKeys) {
      emitFrame(
        `KEY STORED IN LEAF: Written [${targetKey}] to leaf. Total leaf keys: ${leaf.keys.length}/${maxKeys}.`,
        { cpp: 7, python: 7, pseudo: 5 },
        [],
        targetKey,
        { sortedIds: [leaf.id] }
      );
    } else {
      emitFrame(
        `LEAF OVERFLOW: Capacity saturated (${leaf.keys.length} > ${maxKeys}). Initiating B+ copy-up split.`,
        { cpp: 8, python: 8, pseudo: 6 },
        ['splitLeaf()'],
        targetKey,
        { mutateIds: [leaf.id] }
      );
      splitLeaf(leaf.id);
    }
  } else if (operation.type === 'search') {
    // Route from root to leaf, then sequential scan along leaf bus if needed
    let currId: string | null = rootId;
    while (currId && !multiKeyNodes[currId].isLeaf && multiKeyNodes[currId].childrenIds.length > 0) {
      const curr: MultiKeyNodeData = multiKeyNodes[currId];
      curr.state = 'comparing';
      metrics.comparisons++;

      emitFrame(
        `INDEX ROUTING: Navigating through router node [${curr.keys.join(', ')}] toward target [${targetKey}].`,
        { cpp: 3, python: 3, pseudo: 2 },
        [`route(${targetKey})`],
        targetKey,
        { activeIds: [curr.id] }
      );

      curr.state = 'idle';
      let i = 0;
      while (i < curr.keys.length && targetKey >= curr.keys[i]) {
        i++;
      }
      currId = curr.childrenIds[i] ?? curr.childrenIds[curr.childrenIds.length - 1];
    }

    if (currId && multiKeyNodes[currId]) {
      const leaf = multiKeyNodes[currId];
      leaf.state = 'comparing';

      if (leaf.keys.includes(targetKey)) {
        leaf.state = 'sorted';
        emitFrame(
          `KEY FOUND IN DATA LEAF: Target [${targetKey}] verified in leaf node ${leaf.id}!`,
          { cpp: 5, python: 5, pseudo: 4 },
          [`search(${targetKey})`],
          targetKey,
          { sortedIds: [leaf.id] }
        );
      } else {
        leaf.state = 'idle';
        emitFrame(
          `KEY NOT FOUND: Target [${targetKey}] is not present in data leaf.`,
          { cpp: 6, python: 6, pseudo: 5 },
          [],
          targetKey
        );
      }
    }
  } else if (operation.type === 'delete') {
    // Delete from leaf
    let foundLeaf: MultiKeyNodeData | null = null;
    for (const node of Object.values(multiKeyNodes)) {
      if (node.isLeaf && node.keys.includes(targetKey)) {
        foundLeaf = node;
        break;
      }
    }

    if (!foundLeaf) {
      emitFrame(`DELETE FAILED: Key [${targetKey}] not found in any data leaf.`, { cpp: 2, python: 2, pseudo: 2 }, []);
      return frames;
    }

    foundLeaf.state = 'comparing';
    emitFrame(
      `LOCATED RECORD: Found key [${targetKey}] in leaf ${foundLeaf.id}. Deallocating record.`,
      { cpp: 4, python: 4, pseudo: 3 },
      [`delete(${targetKey})`],
      targetKey,
      { activeIds: [foundLeaf.id] }
    );

    const idx = foundLeaf.keys.indexOf(targetKey);
    foundLeaf.keys.splice(idx, 1);
    foundLeaf.state = 'idle';

    emitFrame(
      `DELETE COMMITTED: Record [${targetKey}] purged from B+ Tree leaf. Emerald leaf bus intact.`,
      { cpp: 6, python: 6, pseudo: 5 },
      []
    );
  }

  return frames;
}
