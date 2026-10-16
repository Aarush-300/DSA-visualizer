import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { LinkedListSnapshot, MemoryNode } from '../../types/linkedList';

function generateHexAddress(index: number): string {
  const base = 0x4f10;
  const offset = index * 0x18;
  return '0x' + (base + offset).toString(16).toUpperCase();
}

export function generateLinkedListReversalFrames(rawValues: number[]): StepFrame<LinkedListSnapshot>[] {
  const frames: StepFrame<LinkedListSnapshot>[] = [];
  
  const nodes: MemoryNode[] = rawValues.map((val, idx) => ({
    id: `node-${idx}-${val}`,
    value: val,
    address: generateHexAddress(idx),
    nextAddress: idx < rawValues.length - 1 ? generateHexAddress(idx + 1) : null,
    state: 'idle',
    isHead: idx === 0,
    isTail: idx === rawValues.length - 1,
  }));

  const metrics: TelemetryMetrics = {
    comparisons: 0,
    swaps: 0,
    memoryOps: 0,
    recursionDepth: 0,
    auxiliaryMemory: 'O(1) Pointers: {prev, curr, next}',
  };

  let frameCount = 0;

  function cloneNodes(currNodes: MemoryNode[]): MemoryNode[] {
    return currNodes.map((n) => ({ ...n }));
  }

  function emitFrame(
    currNodes: MemoryNode[],
    headAddress: string | null,
    pointers: { prev?: string | null; curr?: string | null; next?: string | null },
    codeLine: { cpp: number; python: number; pseudo: number },
    narration: string,
    edgeHighlight?: { fromAddress: string; toAddress: string | null; isSevered?: boolean; isNew?: boolean }
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        listType: 'singly',
        nodes: cloneNodes(currNodes),
        headAddress,
        activePointers: pointers,
        highlightedEdge: edgeHighlight,
      },
      pointers: {
        prev: pointers.prev ?? 'NULL',
        curr: pointers.curr ?? 'NULL',
        next: pointers.next ?? 'NULL',
      },
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: ['reverseList(head)'],
      activeIds: pointers.curr ? [currNodes.find(n => n.address === pointers.curr)?.id ?? ''] : [],
      mutateIds: edgeHighlight ? [currNodes.find(n => n.address === edgeHighlight.fromAddress)?.id ?? ''] : [],
    });
  }

  // Initial State Frame
  emitFrame(
    nodes,
    nodes[0]?.address ?? null,
    { prev: null, curr: null, next: null },
    { cpp: 3, python: 3, pseudo: 2 },
    `Initial linked list with ${nodes.length} nodes. Preparing 3-pointer in-place reversal.`
  );

  let prev: MemoryNode | null = null;
  let curr: MemoryNode | null = nodes[0] ?? null;

  emitFrame(
    nodes,
    nodes[0]?.address ?? null,
    { prev: null, curr: curr?.address, next: null },
    { cpp: 4, python: 4, pseudo: 3 },
    `Initialized pointer prev = NULL, pointer curr = head (${curr?.address}).`
  );

  while (curr !== null) {
    metrics.memoryOps++;
    const nextNode: MemoryNode | null = nodes.find((n) => n.address === curr?.nextAddress) ?? null;

    // Step A: Save next
    emitFrame(
      nodes,
      nodes[0]?.address ?? null,
      { prev: prev?.address, curr: curr.address, next: nextNode?.address },
      { cpp: 6, python: 6, pseudo: 5 },
      `Caching next pointer: next = curr->next (${nextNode ? nextNode.address : 'NULL'}).`
    );

    // Step B: Sever and redirect link
    metrics.swaps++;
    metrics.memoryOps += 2;
    curr.nextAddress = prev ? prev.address : null;
    curr.state = 'swap';

    emitFrame(
      nodes,
      nodes[0]?.address ?? null,
      { prev: prev?.address, curr: curr.address, next: nextNode?.address },
      { cpp: 7, python: 7, pseudo: 6 },
      `Reversing link: Redirecting curr.next (${curr.address}) to point backward to prev (${prev ? prev.address : 'NULL'}).`,
      { fromAddress: curr.address, toAddress: curr.nextAddress, isNew: true }
    );

    curr.state = 'visited';

    // Step C: Advance prev
    prev = curr;
    emitFrame(
      nodes,
      nodes[0]?.address ?? null,
      { prev: prev.address, curr: curr.address, next: nextNode?.address },
      { cpp: 8, python: 8, pseudo: 7 },
      `Advancing prev pointer to curr (${prev.address}).`
    );

    // Step D: Advance curr
    curr = nextNode;
    emitFrame(
      nodes,
      nodes[0]?.address ?? null,
      { prev: prev.address, curr: curr ? curr.address : null, next: null },
      { cpp: 9, python: 9, pseudo: 8 },
      `Advancing curr pointer to next (${curr ? curr.address : 'NULL'}).`
    );
  }

  // Update head and tail flags
  for (const n of nodes) {
    n.isHead = n.address === (prev?.address ?? null);
    n.isTail = n.nextAddress === null;
    n.state = 'sorted';
  }

  emitFrame(
    nodes,
    prev?.address ?? null,
    { prev: prev?.address, curr: null, next: null },
    { cpp: 11, python: 10, pseudo: 9 },
    `In-place reversal complete! New head is at ${prev?.address} (value ${prev?.value}). All links reversed.`
  );

  return frames;
}

export function generateLinkedListInsertFrames(
  rawValues: number[],
  valToInsert: number,
  position: 'head' | 'tail'
): StepFrame<LinkedListSnapshot>[] {
  const frames: StepFrame<LinkedListSnapshot>[] = [];
  const existingNodes: MemoryNode[] = rawValues.map((val, idx) => ({
    id: `node-${idx}-${val}`,
    value: val,
    address: generateHexAddress(idx),
    nextAddress: idx < rawValues.length - 1 ? generateHexAddress(idx + 1) : null,
    state: 'idle',
    isHead: idx === 0,
    isTail: idx === rawValues.length - 1,
  }));

  const metrics: TelemetryMetrics = {
    comparisons: 0,
    swaps: 0,
    memoryOps: 1,
    recursionDepth: 0,
    auxiliaryMemory: 'O(1) Heap Node',
  };

  const newAddress = generateHexAddress(existingNodes.length);
  const newNode: MemoryNode = {
    id: `node-new-${valToInsert}`,
    value: valToInsert,
    address: newAddress,
    nextAddress: null,
    state: 'pivot',
  };

  let frameCount = 0;
  function emitFrame(
    currNodes: MemoryNode[],
    headAddress: string | null,
    pointers: { prev?: string | null; curr?: string | null; next?: string | null },
    narration: string
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        listType: 'singly',
        nodes: currNodes.map(n => ({ ...n })),
        headAddress,
        activePointers: pointers,
      },
      pointers: { curr: pointers.curr ?? null },
      codeLine: { cpp: 4, python: 3, pseudo: 2 },
      narration,
      metrics: { ...metrics },
      callStack: [`insertNode(${valToInsert}, ${position})`],
    });
  }

  if (position === 'head') {
    emitFrame(
      [newNode, ...existingNodes],
      existingNodes[0]?.address ?? null,
      { curr: newNode.address },
      `Allocated new heap node with value ${valToInsert} at address ${newNode.address}.`
    );

    newNode.nextAddress = existingNodes[0]?.address ?? null;
    newNode.isHead = true;
    if (existingNodes[0]) existingNodes[0].isHead = false;

    emitFrame(
      [newNode, ...existingNodes],
      newNode.address,
      { curr: newNode.address, next: newNode.nextAddress },
      `Connected newNode->next = head (${newNode.nextAddress}). Updated head to ${newNode.address}.`
    );
  } else {
    // Tail insert
    emitFrame(
      [...existingNodes, newNode],
      existingNodes[0]?.address ?? null,
      { curr: newNode.address },
      `Allocated new tail node ${valToInsert} at address ${newNode.address}.`
    );

    if (existingNodes.length > 0) {
      const tail = existingNodes[existingNodes.length - 1];
      tail.nextAddress = newNode.address;
      tail.isTail = false;
      newNode.isTail = true;
    }

    emitFrame(
      [...existingNodes, newNode],
      existingNodes[0]?.address ?? null,
      { curr: newNode.address },
      `Linked previous tail next pointer to new node ${newNode.address}. Tail insertion complete.`
    );
  }

  return frames;
}

