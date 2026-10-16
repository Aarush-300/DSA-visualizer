import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { TreeNodeData, TreeOperation, TreeSnapshot } from '../../types/trees';
import { layoutBinaryTree } from '../../utils/treeLayout';

export function generateBSTFrames(values: number[], operation?: TreeOperation): StepFrame<TreeSnapshot>[] {
  const frames: StepFrame<TreeSnapshot>[] = [];
  const nodes: Record<string, TreeNodeData> = {};
  let rootId: string | null = null;

  const metrics: TelemetryMetrics = {
    comparisons: 0,
    swaps: 0,
    memoryOps: 0,
    recursionDepth: 0,
    auxiliaryMemory: 'O(h) Stack',
  };

  let frameCount = 0;

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
    const res: Record<string, TreeNodeData> = {};
    for (const [k, v] of Object.entries(nodes)) {
      res[k] = { ...v };
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
    refreshLayout();
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        treeFamily: 'binary',
        nodes: cloneNodes(),
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
      operation: overrides?.opName ?? operation?.type ?? 'bst_state',
    });
  }

  function insertSilent(currId: string | null, val: number): string {
    if (!currId) {
      const newId = `bst-node-${val}`;
      nodes[newId] = {
        id: newId,
        value: val,
        height: 1,
        balanceFactor: 0,
        state: 'idle',
        leftId: null,
        rightId: null,
        parentId: null,
        x: 400,
        y: 60,
      };
      return newId;
    }
    const curr = nodes[currId];
    if (val < curr.value) {
      curr.leftId = insertSilent(curr.leftId, val);
      nodes[curr.leftId].parentId = currId;
    } else if (val > curr.value) {
      curr.rightId = insertSilent(curr.rightId, val);
      nodes[curr.rightId].parentId = currId;
    }
    return currId;
  }

  // Populate base tree
  const baseValues = values.slice(0, 6);
  for (const v of baseValues) {
    rootId = insertSilent(rootId, v);
  }

  // Frame 0: Initial State
  emitFrame(
    `BINARY SEARCH TREE INITIALIZED: Root node is [${rootId ? nodes[rootId].value : 'EMPTY'}]. Invariant: Left < Root < Right.`,
    { cpp: 1, python: 1, pseudo: 1 },
    ['BST::ready()'],
    null
  );

  if (!operation) return frames;

  const targetKey = operation.key;

  if (operation.type === 'insert') {
    function insertAnimated(currId: string | null, val: number, depth: number): string {
      metrics.recursionDepth = Math.max(metrics.recursionDepth, depth);

      if (!currId) {
        metrics.memoryOps++;
        const newId = `bst-node-${val}`;
        nodes[newId] = {
          id: newId,
          value: val,
          height: 1,
          balanceFactor: 0,
          state: 'active',
          leftId: null,
          rightId: null,
          parentId: null,
          x: 400,
          y: 60,
        };
        if (!rootId) rootId = newId;

        emitFrame(
          `INSERT: Allocated new BST node with key [${val}] at depth ${depth}.`,
          { cpp: 3, python: 3, pseudo: 2 },
          [`insert(key=${val})`],
          val,
          { mutateIds: [newId] }
        );
        return newId;
      }

      const curr = nodes[currId];
      curr.state = 'comparing';
      metrics.comparisons++;

      emitFrame(
        `SEARCH INSERT POSITION: Comparing key [${val}] with node [${curr.value}].`,
        { cpp: 4, python: 4, pseudo: 3 },
        [`insert(node=${curr.value}, key=${val})`],
        val,
        { activeIds: [curr.id] }
      );

      curr.state = 'idle';

      if (val < curr.value) {
        curr.leftId = insertAnimated(curr.leftId, val, depth + 1);
        nodes[curr.leftId].parentId = currId;
      } else if (val > curr.value) {
        curr.rightId = insertAnimated(curr.rightId, val, depth + 1);
        nodes[curr.rightId].parentId = currId;
      } else {
        emitFrame(
          `DUPLICATE KEY: Key [${val}] already exists in BST. No-op.`,
          { cpp: 5, python: 5, pseudo: 4 },
          [`insert(key=${val})`],
          val
        );
      }

      return currId;
    }

    rootId = insertAnimated(rootId, targetKey, 1);

    for (const n of Object.values(nodes)) {
      n.state = 'idle';
    }

    emitFrame(
      `INSERTION COMPLETED: Key [${targetKey}] securely placed. BST invariant maintained.`,
      { cpp: 6, python: 6, pseudo: 4 },
      [],
      targetKey,
      { sortedIds: [`bst-node-${targetKey}`] }
    );
  } else if (operation.type === 'search') {
    let currId = rootId;
    let found = false;

    while (currId) {
      const curr = nodes[currId];
      curr.state = 'comparing';
      metrics.comparisons++;

      emitFrame(
        `SEARCH TRAVERSAL: Comparing target [${targetKey}] with current node [${curr.value}].`,
        { cpp: 3, python: 3, pseudo: 2 },
        [`search(node=${curr.value}, key=${targetKey})`],
        targetKey,
        { activeIds: [curr.id] }
      );

      if (targetKey === curr.value) {
        curr.state = 'sorted';
        emitFrame(
          `KEY FOUND: Target key [${targetKey}] located in node ${curr.id}!`,
          { cpp: 4, python: 4, pseudo: 3 },
          [`search(node=${curr.value})`],
          targetKey,
          { sortedIds: [curr.id] }
        );
        found = true;
        break;
      } else if (targetKey < curr.value) {
        curr.state = 'idle';
        currId = curr.leftId;
      } else {
        curr.state = 'idle';
        currId = curr.rightId;
      }
    }

    if (!found) {
      emitFrame(
        `SEARCH COMPLETED: Key [${targetKey}] is NOT present in the BST.`,
        { cpp: 6, python: 6, pseudo: 5 },
        [],
        targetKey
      );
    }
  } else if (operation.type === 'delete') {
    function findMin(currId: string): TreeNodeData {
      let curr = nodes[currId];
      while (curr.leftId && nodes[curr.leftId]) {
        curr = nodes[curr.leftId];
      }
      return curr;
    }

    function deleteAnimated(currId: string | null, key: number): string | null {
      if (!currId) {
        emitFrame(`KEY NOT FOUND: Key [${key}] does not exist in BST.`, { cpp: 2, python: 2, pseudo: 2 }, []);
        return null;
      }

      const curr = nodes[currId];
      curr.state = 'comparing';

      emitFrame(
        `DELETE SEARCH: Comparing key [${key}] with node [${curr.value}].`,
        { cpp: 3, python: 3, pseudo: 2 },
        [`delete(node=${curr.value}, key=${key})`],
        key,
        { activeIds: [curr.id] }
      );

      curr.state = 'idle';

      if (key < curr.value) {
        curr.leftId = deleteAnimated(curr.leftId, key);
      } else if (key > curr.value) {
        curr.rightId = deleteAnimated(curr.rightId, key);
      } else {
        // Node found! Handle 3 cases:
        // Case 1: Leaf node (no children)
        if (!curr.leftId && !curr.rightId) {
          emitFrame(
            `DELETE CASE 1 (LEAF): Node [${curr.value}] has no children. Unlinking and freeing node.`,
            { cpp: 5, python: 5, pseudo: 4 },
            [`delete(node=${curr.value})`],
            key,
            { mutateIds: [curr.id] }
          );
          delete nodes[currId];
          return null;
        }

        // Case 2: One child (left or right)
        if (!curr.leftId) {
          emitFrame(
            `DELETE CASE 2 (ONE CHILD): Node [${curr.value}] has only right child. Bypassing node.`,
            { cpp: 7, python: 7, pseudo: 5 },
            [`delete(node=${curr.value})`],
            key,
            { mutateIds: [curr.id] }
          );
          const childId = curr.rightId;
          delete nodes[currId];
          return childId;
        }
        if (!curr.rightId) {
          emitFrame(
            `DELETE CASE 2 (ONE CHILD): Node [${curr.value}] has only left child. Bypassing node.`,
            { cpp: 7, python: 7, pseudo: 5 },
            [`delete(node=${curr.value})`],
            key,
            { mutateIds: [curr.id] }
          );
          const childId = curr.leftId;
          delete nodes[currId];
          return childId;
        }

        // Case 3: Two children -> find in-order successor (min of right subtree)
        const successor = findMin(curr.rightId);
        emitFrame(
          `DELETE CASE 3 (TWO CHILDREN): Node [${curr.value}] has 2 children. Found in-order successor [${successor.value}]. Swapping key.`,
          { cpp: 9, python: 9, pseudo: 6 },
          [`delete(node=${curr.value})`, `successor=${successor.value}`],
          successor.value,
          { activeIds: [curr.id, successor.id] }
        );

        curr.value = successor.value;
        curr.rightId = deleteAnimated(curr.rightId, successor.value);
      }

      return currId;
    }

    rootId = deleteAnimated(rootId, targetKey);

    emitFrame(
      `DELETE COMPLETED: Key [${targetKey}] successfully removed. Tree re-balanced.`,
      { cpp: 11, python: 11, pseudo: 7 },
      []
    );
  }

  return frames;
}

// Backward compatibility alias
export function generateBSTInsertionFrames(values: number[]): StepFrame<TreeSnapshot>[] {
  return generateBSTFrames(values);
}
