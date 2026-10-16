import { StepFrame, TelemetryMetrics } from '../../types/engine';
import {
  LinkedListOperation,
  LinkedListSnapshot,
  LinkedListType,
  MemoryNode,
} from '../../types/linkedList';

const NODE_WIDTH = 140;
const NODE_HEIGHT = 56;
const GAP_X = 54;
const GAP_Y = 80;
const NODES_PER_ROW = 4;

function generateHexAddress(index: number): string {
  const base = 0x4f10;
  const offset = index * 0x18;
  return '0x' + (base + offset).toString(16).toUpperCase();
}

export function assignNodeCoordinates(nodes: MemoryNode[]): void {
  nodes.forEach((node, idx) => {
    const col = idx % NODES_PER_ROW;
    const row = Math.floor(idx / NODES_PER_ROW);
    node.x = 40 + col * (NODE_WIDTH + GAP_X);
    node.y = 40 + row * (NODE_HEIGHT + GAP_Y);
  });
}

function createMetrics(): TelemetryMetrics {
  return {
    comparisons: 0,
    swaps: 0,
    memoryOps: 0,
    recursionDepth: 0,
    auxiliaryMemory: 'O(1) Pointers',
  };
}

export function generateLinkedListFrames(
  listType: LinkedListType,
  rawValues: number[],
  operation?: LinkedListOperation
): StepFrame<LinkedListSnapshot>[] {
  const frames: StepFrame<LinkedListSnapshot>[] = [];
  const metrics = createMetrics();
  let frameCount = 0;

  // Initial node creation
  const initialValues = rawValues.slice(0, Math.min(8, Math.max(3, rawValues.length)));
  const nodes: MemoryNode[] = initialValues.map((val, idx) => ({
    id: `node-${idx}-${val}`,
    value: val,
    address: generateHexAddress(idx),
    nextAddress: null,
    prevAddress: null,
    state: 'idle',
    isHead: idx === 0,
    isTail: idx === initialValues.length - 1,
  }));

  // Link pointers according to listType
  function syncPointers(currNodes: MemoryNode[]) {
    currNodes.forEach((node, idx) => {
      node.isHead = idx === 0;
      node.isTail = idx === currNodes.length - 1;
      
      // Next pointer
      if (idx < currNodes.length - 1) {
        node.nextAddress = currNodes[idx + 1].address;
      } else {
        // Last node
        if (listType === 'circularSingly' || listType === 'circularDoubly') {
          node.nextAddress = currNodes.length > 0 ? currNodes[0].address : null;
        } else {
          node.nextAddress = null;
        }
      }

      // Prev pointer (for doubly variants)
      if (listType === 'doubly' || listType === 'circularDoubly') {
        if (idx > 0) {
          node.prevAddress = currNodes[idx - 1].address;
        } else {
          // First node
          if (listType === 'circularDoubly' && currNodes.length > 0) {
            node.prevAddress = currNodes[currNodes.length - 1].address;
          } else {
            node.prevAddress = null;
          }
        }
      } else {
        node.prevAddress = null;
      }
    });

    assignNodeCoordinates(currNodes);
  }

  syncPointers(nodes);

  function cloneNodes(currNodes: MemoryNode[]): MemoryNode[] {
    return currNodes.map((n) => ({ ...n }));
  }

  function emitFrame(
    currNodes: MemoryNode[],
    pointers: Record<string, string | number | null | undefined>,
    codeLine: { cpp: number; python: number; pseudo: number },
    narration: string,
    edgeHighlight?: {
      fromAddress: string;
      toAddress: string | null;
      isSevered?: boolean;
      isNew?: boolean;
      isPrevEdge?: boolean;
      isCircularFeedback?: boolean;
    },
    overrides?: {
      activeIds?: (string | number)[];
      sortedIds?: (string | number)[];
      opName?: string;
    }
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        listType,
        nodes: cloneNodes(currNodes),
        headAddress: currNodes.length > 0 ? currNodes[0].address : null,
        activePointers: {
          prev: pointers.prev != null ? String(pointers.prev) : null,
          curr: pointers.curr != null ? String(pointers.curr) : null,
          next: pointers.next != null ? String(pointers.next) : null,
          target: pointers.target != null ? String(pointers.target) : null,
        },
        highlightedEdge: edgeHighlight,
      },
      pointers: {
        prev: pointers.prev ?? 'NULL',
        curr: pointers.curr ?? 'NULL',
        next: pointers.next ?? 'NULL',
        target: pointers.target ?? 'NULL',
      },
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: [`LinkedList<${listType}>::${overrides?.opName ?? operation?.type ?? 'inspect'}()`],
      activeIds: overrides?.activeIds,
      sortedIds: overrides?.sortedIds,
      operation: overrides?.opName ?? operation?.type ?? 'list_state',
    });
  }

  // Frame 0: Initial State
  const typeLabel = listType === 'singly' ? 'SINGLY LINKED LIST'
    : listType === 'doubly' ? 'DOUBLY LINKED LIST'
    : listType === 'circularSingly' ? 'CIRCULAR SINGLY LINKED LIST'
    : 'CIRCULAR DOUBLY LINKED LIST';

  emitFrame(
    nodes,
    { curr: nodes[0]?.address, next: nodes[0]?.nextAddress },
    { cpp: 1, python: 1, pseudo: 1 },
    `${typeLabel} INITIALIZED: Head at ${nodes[0]?.address ?? 'NULL'}, Tail at ${nodes[nodes.length - 1]?.address ?? 'NULL'}. Deterministic hardware coordinate bus active.`
  );

  if (!operation) return frames;

  const val = operation.value ?? Math.floor(Math.random() * 89) + 10;
  const opType = operation.type;

  if (opType === 'insertHead') {
    metrics.memoryOps += 2;
    const newAddress = `0x${(0x4000 + Math.floor(Math.random() * 0x0fff)).toString(16).toUpperCase()}`;
    const newNode: MemoryNode = {
      id: `node-${Date.now()}-${val}`,
      value: val,
      address: newAddress,
      nextAddress: nodes[0]?.address ?? null,
      prevAddress: null,
      state: 'active',
      isHead: true,
      isTail: nodes.length === 0,
    };

    // Frame: Allocate node
    emitFrame(
      [newNode, ...nodes],
      { curr: newAddress, next: nodes[0]?.address },
      { cpp: 2, python: 2, pseudo: 2 },
      `ALLOCATE NODE: Malloc at address ${newAddress} with value [${val}]. Preparing pointer wiring.`,
      undefined,
      { activeIds: [newNode.id] }
    );

    // Frame: Wire pointers
    nodes.unshift(newNode);
    syncPointers(nodes);

    emitFrame(
      nodes,
      { curr: newAddress, next: nodes[1]?.address },
      { cpp: 4, python: 4, pseudo: 4 },
      `WIRE NEXT POINTER: New node next points to old head ${nodes[1]?.address ?? 'NULL'}. Head re-assigned to ${newAddress}.`,
      { fromAddress: newAddress, toAddress: nodes[1]?.address ?? null, isNew: true },
      { sortedIds: [newNode.id] }
    );
  } else if (opType === 'insertTail') {
    metrics.memoryOps += 2;
    const newAddress = `0x${(0x4000 + Math.floor(Math.random() * 0x0fff)).toString(16).toUpperCase()}`;
    const newNode: MemoryNode = {
      id: `node-${Date.now()}-${val}`,
      value: val,
      address: newAddress,
      nextAddress: null,
      prevAddress: null,
      state: 'active',
    };

    const oldTail = nodes[nodes.length - 1];

    emitFrame(
      [...nodes, newNode],
      { curr: oldTail?.address, next: newAddress },
      { cpp: 3, python: 3, pseudo: 3 },
      `ALLOCATE TAIL NODE: Created node [${val}] at ${newAddress}. Linking from previous tail ${oldTail?.address ?? 'NULL'}.`,
      { fromAddress: oldTail?.address ?? '', toAddress: newAddress, isNew: true },
      { activeIds: [newNode.id] }
    );

    nodes.push(newNode);
    syncPointers(nodes);

    emitFrame(
      nodes,
      { curr: newAddress },
      { cpp: 5, python: 5, pseudo: 5 },
      `INSERT TAIL COMMITTED: New tail is ${newAddress}. Pointer wiring finalized.`,
      undefined,
      { sortedIds: [newNode.id] }
    );
  } else if (opType === 'insertIndex') {
    const targetIdx = Math.min(nodes.length, Math.max(0, operation.index ?? 1));
    if (targetIdx === 0) {
      return generateLinkedListFrames(listType, rawValues, { type: 'insertHead', value: val });
    }
    if (targetIdx >= nodes.length) {
      return generateLinkedListFrames(listType, rawValues, { type: 'insertTail', value: val });
    }

    const prevNode = nodes[targetIdx - 1];
    const currNode = nodes[targetIdx];
    const newAddress = `0x${(0x4000 + Math.floor(Math.random() * 0x0fff)).toString(16).toUpperCase()}`;
    const newNode: MemoryNode = {
      id: `node-${Date.now()}-${val}`,
      value: val,
      address: newAddress,
      nextAddress: currNode.address,
      prevAddress: prevNode.address,
      state: 'active',
    };

    emitFrame(
      nodes,
      { prev: prevNode.address, curr: currNode.address },
      { cpp: 3, python: 3, pseudo: 3 },
      `TRAVERSE TO INDEX [${targetIdx}]: Position between ${prevNode.address} and ${currNode.address}.`,
      undefined,
      { activeIds: [prevNode.id, currNode.id] }
    );

    nodes.splice(targetIdx, 0, newNode);
    syncPointers(nodes);

    emitFrame(
      nodes,
      { prev: prevNode.address, curr: newAddress, next: currNode.address },
      { cpp: 5, python: 5, pseudo: 5 },
      `INSERT AT INDEX [${targetIdx}] COMMITTED: Linked ${prevNode.address} -> ${newAddress} -> ${currNode.address}.`,
      { fromAddress: newAddress, toAddress: currNode.address, isNew: true },
      { sortedIds: [newNode.id] }
    );
  } else if (opType === 'deleteHead') {
    if (nodes.length === 0) {
      emitFrame(nodes, {}, { cpp: 2, python: 2, pseudo: 2 }, `DELETE HEAD FAILED: List is empty.`);
      return frames;
    }

    const oldHead = nodes[0];
    oldHead.state = 'comparing';

    emitFrame(
      nodes,
      { curr: oldHead.address, next: oldHead.nextAddress },
      { cpp: 3, python: 3, pseudo: 3 },
      `SEVER HEAD: Deallocating Head node ${oldHead.address} [${oldHead.value}].`,
      { fromAddress: oldHead.address, toAddress: oldHead.nextAddress, isSevered: true },
      { activeIds: [oldHead.id] }
    );

    nodes.shift();
    syncPointers(nodes);

    emitFrame(
      nodes,
      { curr: nodes[0]?.address },
      { cpp: 5, python: 5, pseudo: 5 },
      `DELETE HEAD COMMITTED: Free memory at ${oldHead.address}. New head is ${nodes[0]?.address ?? 'NULL'}.`
    );
  } else if (opType === 'deleteTail') {
    if (nodes.length === 0) {
      emitFrame(nodes, {}, { cpp: 2, python: 2, pseudo: 2 }, `DELETE TAIL FAILED: List is empty.`);
      return frames;
    }

    const oldTail = nodes[nodes.length - 1];
    oldTail.state = 'comparing';

    emitFrame(
      nodes,
      { curr: oldTail.address },
      { cpp: 3, python: 3, pseudo: 3 },
      `TRAVERSE TO TAIL: Targeting tail node ${oldTail.address} [${oldTail.value}] for deallocation.`,
      undefined,
      { activeIds: [oldTail.id] }
    );

    nodes.pop();
    syncPointers(nodes);

    emitFrame(
      nodes,
      { curr: nodes[nodes.length - 1]?.address },
      { cpp: 5, python: 5, pseudo: 5 },
      `DELETE TAIL COMMITTED: Tail freed. New tail is ${nodes[nodes.length - 1]?.address ?? 'NULL'}.`
    );
  } else if (opType === 'deleteValue' || opType === 'deleteIndex') {
    let delIdx = -1;
    if (opType === 'deleteIndex') {
      delIdx = operation.index ?? 0;
    } else {
      delIdx = nodes.findIndex((n) => n.value === (operation.value ?? -1));
    }

    if (delIdx < 0 || delIdx >= nodes.length) {
      emitFrame(nodes, {}, { cpp: 2, python: 2, pseudo: 2 }, `DELETE FAILED: Target not found.`);
      return frames;
    }

    const targetNode = nodes[delIdx];
    targetNode.state = 'comparing';

    emitFrame(
      nodes,
      { target: targetNode.address },
      { cpp: 4, python: 4, pseudo: 4 },
      `LOCATED TARGET: Node ${targetNode.address} [${targetNode.value}] at index [${delIdx}]. Re-linking neighbors.`,
      undefined,
      { activeIds: [targetNode.id] }
    );

    nodes.splice(delIdx, 1);
    syncPointers(nodes);

    emitFrame(
      nodes,
      {},
      { cpp: 6, python: 6, pseudo: 6 },
      `DELETE COMMITTED: Node removed. Hardware bus continuity restored.`
    );
  } else if (opType === 'reverse') {
    // In-place reversal
    if (nodes.length <= 1) {
      emitFrame(nodes, {}, { cpp: 1, python: 1, pseudo: 1 }, `REVERSAL NO-OP: List has <= 1 node.`);
      return frames;
    }

    emitFrame(
      nodes,
      { prev: 'NULL', curr: nodes[0].address, next: nodes[1]?.address },
      { cpp: 2, python: 2, pseudo: 2 },
      `REVERSE IN-PLACE: Initializing three-pointer sliding window {prev=NULL, curr=HEAD, next=HEAD->next}.`,
      undefined,
      { activeIds: [nodes[0].id] }
    );

    let prevAddr: string | null = null;
    let currIdx = 0;

    while (currIdx < nodes.length) {
      const curr = nodes[currIdx];
      const nextAddr = currIdx < nodes.length - 1 ? nodes[currIdx + 1].address : null;

      curr.state = 'active';

      emitFrame(
        nodes,
        { prev: prevAddr, curr: curr.address, next: nextAddr },
        { cpp: 5, python: 5, pseudo: 5 },
        `INVERTING POINTER: At ${curr.address} [${curr.value}]. Reversing edge from next (${nextAddr}) to prev (${prevAddr}).`,
        { fromAddress: curr.address, toAddress: prevAddr, isNew: true },
        { activeIds: [curr.id] }
      );

      curr.state = 'sorted';
      prevAddr = curr.address;
      currIdx++;
    }

    // Reverse actual array order and sync
    nodes.reverse();
    syncPointers(nodes);

    emitFrame(
      nodes,
      { curr: nodes[0]?.address, next: nodes[0]?.nextAddress },
      { cpp: 8, python: 8, pseudo: 8 },
      `REVERSAL COMPLETE: All pointer vectors inverted. New Head is ${nodes[0]?.address}.`,
      undefined,
      { sortedIds: nodes.map((n) => n.id) }
    );
  } else if (opType === 'search') {
    const targetVal = operation.value ?? nodes[Math.floor(nodes.length / 2)]?.value ?? 0;
    let found = false;

    for (let i = 0; i < nodes.length; i++) {
      nodes[i].state = 'comparing';
      emitFrame(
        nodes,
        { curr: nodes[i].address, target: targetVal },
        { cpp: 3, python: 3, pseudo: 3 },
        `SEARCHING: Comparing node ${nodes[i].address} value (${nodes[i].value}) against target [${targetVal}].`,
        undefined,
        { activeIds: [nodes[i].id] }
      );

      if (nodes[i].value === targetVal) {
        nodes[i].state = 'sorted';
        emitFrame(
          nodes,
          { curr: nodes[i].address, FOUND: targetVal },
          { cpp: 4, python: 4, pseudo: 4 },
          `TARGET FOUND: Value [${targetVal}] located at address ${nodes[i].address} (index ${i}).`,
          undefined,
          { sortedIds: [nodes[i].id] }
        );
        found = true;
        break;
      } else {
        nodes[i].state = 'idle';
      }
    }

    if (!found) {
      emitFrame(
        nodes,
        { curr: 'NULL', target: targetVal },
        { cpp: 6, python: 6, pseudo: 6 },
        `TARGET NOT FOUND: Reached end of list without finding value [${targetVal}].`
      );
    }
  }

  return frames;
}
