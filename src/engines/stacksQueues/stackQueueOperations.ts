import { StepFrame, TelemetryMetrics } from '../../types/engine';
import {
  HeapNodeItem,
  StackQueueItem,
  StackQueueOperation,
  StackQueueSnapshot,
  StackQueueType,
} from '../../types/stacksQueues';

const CAPACITY = 8;

function createMetrics(): TelemetryMetrics {
  return {
    comparisons: 0,
    swaps: 0,
    memoryOps: 0,
    recursionDepth: 0,
    auxiliaryMemory: 'O(1) Buffer',
  };
}

function calculateHeapCoordinates(items: StackQueueItem[]): HeapNodeItem[] {
  // Calculate (x, y) coordinates for binary heap tree visualization
  // Root at (0, 0), level 1 at (-75, 55), (+75, 55), level 2 at (-110, 110), etc.
  return items.map((item, idx) => {
    const level = Math.floor(Math.log2(idx + 1));
    const levelStartIndex = Math.pow(2, level) - 1;
    const indexInLevel = idx - levelStartIndex;
    const levelCount = Math.pow(2, level);
    
    // Spread width decreases by level
    const totalWidth = 320;
    const spacing = totalWidth / (levelCount + 1);
    const x = -totalWidth / 2 + spacing * (indexInLevel + 1);
    const y = level * 65;

    const leftIdx = 2 * idx + 1;
    const rightIdx = 2 * idx + 2;

    return {
      id: item.id,
      value: item.value,
      priority: item.priority ?? item.value,
      index: idx,
      state: item.state,
      x,
      y,
      leftChildIndex: leftIdx < items.length ? leftIdx : undefined,
      rightChildIndex: rightIdx < items.length ? rightIdx : undefined,
    };
  });
}

export function generateStackQueueFrames(
  structureType: StackQueueType,
  rawValues: number[],
  operation?: StackQueueOperation
): StepFrame<StackQueueSnapshot>[] {
  switch (structureType) {
    case 'stack':
      return generateStackFrames(rawValues, operation);
    case 'linearQueue':
      return generateLinearQueueFrames(rawValues, operation);
    case 'circularQueue':
      return generateCircularQueueFrames(rawValues, operation);
    case 'priorityQueue':
      return generatePriorityQueueFrames(rawValues, operation);
    case 'deque':
      return generateDequeFrames(rawValues, operation);
    default:
      return generateStackFrames(rawValues, operation);
  }
}

// -------------------------------------------------------------
// 1. STACK (LIFO)
// -------------------------------------------------------------
export function generateStackFrames(
  rawValues: number[],
  operation?: StackQueueOperation
): StepFrame<StackQueueSnapshot>[] {
  const frames: StepFrame<StackQueueSnapshot>[] = [];
  const metrics = createMetrics();
  let frameCount = 0;

  // Initial stack items (bottom-up: index 0 is bottom, topIndex is length - 1)
  const initialSlice = rawValues.slice(0, Math.min(CAPACITY - 1, Math.max(3, rawValues.length)));
  const items: StackQueueItem[] = initialSlice.map((val, idx) => ({
    id: `stack-item-${idx}-${val}`,
    value: val,
    index: idx,
    state: 'idle',
  }));

  function emitFrame(
    currentItems: StackQueueItem[],
    pointers: Record<string, number | string | null>,
    codeLine: { cpp: number; python: number; pseudo: number },
    narration: string,
    overrides?: {
      activeIds?: (string | number)[];
      sortedIds?: (string | number)[];
      opName?: string;
    }
  ) {
    const topIdx = currentItems.length > 0 ? currentItems.length - 1 : null;
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        structureType: 'stack',
        items: currentItems.map((it) => ({ ...it })),
        capacity: CAPACITY,
        topIndex: topIdx,
        telemetry: {
          size: currentItems.length,
          capacity: CAPACITY,
          topAddress: topIdx !== null ? `0x7FFF_${(topIdx * 4).toString(16).padStart(2, '0').toUpperCase()}` : '0x0000_NULL',
          formula: `SP = Base + (${topIdx ?? -1} * sizeof(Word))`,
        },
      },
      pointers,
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: [`Stack::${overrides?.opName ?? (operation ? operation.type : 'inspect')}()`],
      activeIds: overrides?.activeIds,
      sortedIds: overrides?.sortedIds,
      operation: overrides?.opName ?? operation?.type ?? 'stack_state',
    });
  }

  // Initial Frame 0: Baseline state
  const topIdx = items.length > 0 ? items.length - 1 : null;
  emitFrame(
    items,
    { TOP: topIdx, SP: topIdx !== null ? `[${topIdx}]` : 'NULL' },
    { cpp: 1, python: 1, pseudo: 1 },
    `STACK HARDWARE REGISTERS: Stack Pointer (SP) points to slot [${topIdx ?? 'EMPTY'}]. Size: ${items.length}/${CAPACITY}. LIFO policy active.`
  );

  if (!operation) return frames;

  if (operation.type === 'push') {
    const val = operation.value ?? Math.floor(Math.random() * 89) + 10;
    if (items.length >= CAPACITY) {
      emitFrame(
        items,
        { TOP: topIdx, STATUS: 'OVERFLOW' },
        { cpp: 3, python: 3, pseudo: 3 },
        `STACK OVERFLOW HARDWARE FAULT: Cannot push element [${val}]. Stack buffer is saturated at capacity (${CAPACITY}/${CAPACITY}).`
      );
      return frames;
    }

    metrics.memoryOps++;
    const newItem: StackQueueItem = {
      id: `stack-item-${Date.now()}-${val}`,
      value: val,
      index: items.length,
      state: 'active',
    };

    // Frame 1: Pre-push stage (drop hovering above chamber)
    emitFrame(
      [...items, { ...newItem, state: 'active' }],
      { TOP: items.length, PUSH_VAL: val },
      { cpp: 4, python: 4, pseudo: 4 },
      `PUSH INSTRUCTION: Staging value [${val}] into top chamber slot [${items.length}]. Incrementing Stack Pointer SP.`
    );

    // Frame 2: Settled in chamber
    items.push({ ...newItem, state: 'sorted' });
    emitFrame(
      items,
      { TOP: items.length - 1, SP: `[${items.length - 1}]` },
      { cpp: 6, python: 6, pseudo: 6 },
      `PUSH COMMITTED: Value [${val}] securely latched into slot [${items.length - 1}]. SP updated.`,
      { sortedIds: [newItem.id] }
    );
  } else if (operation.type === 'pop') {
    if (items.length === 0) {
      emitFrame(
        items,
        { TOP: 'UNDERFLOW', STATUS: 'ERR_EMPTY' },
        { cpp: 2, python: 2, pseudo: 2 },
        `STACK UNDERFLOW HARDWARE FAULT: Cannot pop from empty stack.`
      );
      return frames;
    }

    metrics.memoryOps++;
    const popped = items[items.length - 1];
    popped.state = 'comparing';

    // Frame 1: Highlight top element to be popped
    emitFrame(
      items,
      { TOP: items.length - 1, EJECTING: popped.value },
      { cpp: 4, python: 4, pseudo: 4 },
      `POP INSTRUCTION: Reading Top of Stack value [${popped.value}] at slot [${items.length - 1}]. Ejecting element upward.`,
      { activeIds: [popped.id] }
    );

    // Frame 2: Element removed, decrement pointer
    items.pop();
    const newTop = items.length > 0 ? items.length - 1 : null;
    emitFrame(
      items,
      { TOP: newTop, SP: newTop !== null ? `[${newTop}]` : 'NULL' },
      { cpp: 6, python: 6, pseudo: 6 },
      `POP COMMITTED: Popped element [${popped.value}]. Decremented SP to [${newTop ?? 'EMPTY'}]. Size: ${items.length}/${CAPACITY}.`
    );
  } else if (operation.type === 'peek') {
    if (items.length === 0) {
      emitFrame(
        items,
        { TOP: 'NULL' },
        { cpp: 2, python: 2, pseudo: 2 },
        `PEEK ATTEMPT: Stack is empty. SP is NULL.`
      );
      return frames;
    }
    const topItem = items[items.length - 1];
    topItem.state = 'inspecting';

    emitFrame(
      items,
      { TOP: items.length - 1, PEEK: topItem.value },
      { cpp: 3, python: 3, pseudo: 3 },
      `PEEK INSPECTION: Top element is [${topItem.value}] at SP [${items.length - 1}]. Read operation performed without modifying stack pointer.`,
      { activeIds: [topItem.id] }
    );
  } else if (operation.type === 'delete') {
    // Delete by value or index
    const targetVal = operation.value;
    const targetIdx = operation.index ?? (targetVal !== undefined ? items.findIndex((it) => it.value === targetVal) : items.length - 1);

    if (targetIdx < 0 || targetIdx >= items.length) {
      emitFrame(
        items,
        { TARGET: targetVal ?? targetIdx, STATUS: 'NOT_FOUND' },
        { cpp: 2, python: 2, pseudo: 2 },
        `DELETE FAILED: Specified element not found in stack chamber.`
      );
      return frames;
    }

    items[targetIdx].state = 'comparing';
    emitFrame(
      items,
      { TARGET_SLOT: targetIdx, VAL: items[targetIdx].value },
      { cpp: 4, python: 4, pseudo: 4 },
      `DELETE OPERATION: Targeting element [${items[targetIdx].value}] at slot [${targetIdx}].`,
      { activeIds: [items[targetIdx].id] }
    );

    items.splice(targetIdx, 1);
    items.forEach((it, idx) => {
      it.index = idx;
      it.state = 'idle';
    });

    const newTop = items.length > 0 ? items.length - 1 : null;
    emitFrame(
      items,
      { TOP: newTop },
      { cpp: 6, python: 6, pseudo: 6 },
      `DELETE COMPLETE: Element purged. Remaining stack elements compacted. SP: [${newTop ?? 'EMPTY'}].`
    );
  }

  return frames;
}

// -------------------------------------------------------------
// 2. LINEAR QUEUE (FIFO)
// -------------------------------------------------------------
export function generateLinearQueueFrames(
  rawValues: number[],
  operation?: StackQueueOperation
): StepFrame<StackQueueSnapshot>[] {
  const frames: StepFrame<StackQueueSnapshot>[] = [];
  const metrics = createMetrics();
  let frameCount = 0;

  const initialSlice = rawValues.slice(0, Math.min(5, rawValues.length));
  const items: StackQueueItem[] = initialSlice.map((val, idx) => ({
    id: `queue-item-${idx}-${val}`,
    value: val,
    index: idx,
    state: 'idle',
  }));

  let front = 0;
  let rear = items.length - 1;

  function emitFrame(
    currentItems: StackQueueItem[],
    fIdx: number,
    rIdx: number,
    codeLine: { cpp: number; python: number; pseudo: number },
    narration: string,
    overrides?: {
      activeIds?: (string | number)[];
      sortedIds?: (string | number)[];
      opName?: string;
    }
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        structureType: 'linearQueue',
        items: currentItems.map((it) => ({ ...it })),
        capacity: CAPACITY,
        frontIndex: currentItems.length > 0 ? fIdx : null,
        rearIndex: currentItems.length > 0 ? rIdx : null,
        telemetry: {
          size: currentItems.length,
          capacity: CAPACITY,
          frontAddress: currentItems.length > 0 ? `0xQUE_F${fIdx}` : 'NULL',
          rearAddress: currentItems.length > 0 ? `0xQUE_R${rIdx}` : 'NULL',
          formula: `FIFO: Dequeue from Front [${fIdx}], Enqueue to Rear [${rIdx}]`,
        },
      },
      pointers: { FRONT: fIdx, REAR: rIdx, SIZE: currentItems.length },
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: [`LinearQueue::${overrides?.opName ?? (operation ? operation.type : 'status')}()`],
      activeIds: overrides?.activeIds,
      sortedIds: overrides?.sortedIds,
      operation: overrides?.opName ?? operation?.type ?? 'linearQueue_state',
    });
  }

  emitFrame(
    items,
    front,
    rear,
    { cpp: 1, python: 1, pseudo: 1 },
    `LINEAR QUEUE INITIALIZED: FIFO conveyor belt. Front element at [${front}], Rear element at [${rear}]. Capacity: ${CAPACITY}.`
  );

  if (!operation) return frames;

  if (operation.type === 'enqueue') {
    const val = operation.value ?? Math.floor(Math.random() * 89) + 10;
    if (items.length >= CAPACITY) {
      emitFrame(
        items,
        front,
        rear,
        { cpp: 3, python: 3, pseudo: 3 },
        `QUEUE OVERFLOW: Buffer is full (${items.length}/${CAPACITY}). Enqueue operation rejected.`
      );
      return frames;
    }

    metrics.memoryOps++;
    const newItem: StackQueueItem = {
      id: `queue-item-${Date.now()}-${val}`,
      value: val,
      index: items.length,
      state: 'active',
    };

    items.push(newItem);
    rear = items.length - 1;

    emitFrame(
      items,
      front,
      rear,
      { cpp: 4, python: 4, pseudo: 4 },
      `ENQUEUE INCOMING: Element [${val}] entering right gate into slot [${rear}].`,
      { activeIds: [newItem.id] }
    );

    newItem.state = 'idle';
    emitFrame(
      items,
      front,
      rear,
      { cpp: 6, python: 6, pseudo: 6 },
      `ENQUEUE COMMITTED: Element [${val}] latched at REAR [${rear}]. Queue size: ${items.length}/${CAPACITY}.`,
      { sortedIds: [newItem.id] }
    );
  } else if (operation.type === 'dequeue') {
    if (items.length === 0) {
      emitFrame(
        items,
        0,
        -1,
        { cpp: 2, python: 2, pseudo: 2 },
        `QUEUE UNDERFLOW: Cannot dequeue from empty queue.`
      );
      return frames;
    }

    metrics.memoryOps++;
    const dequeued = items[0];
    dequeued.state = 'comparing';

    emitFrame(
      items,
      front,
      rear,
      { cpp: 4, python: 4, pseudo: 4 },
      `DEQUEUE INSTRUCTION: Exiting element [${dequeued.value}] from left gate at FRONT [0].`,
      { activeIds: [dequeued.id] }
    );

    items.shift();
    items.forEach((it, idx) => {
      it.index = idx;
    });
    rear = items.length - 1;

    emitFrame(
      items,
      0,
      rear,
      { cpp: 6, python: 6, pseudo: 6 },
      `DEQUEUE COMPLETE: Element [${dequeued.value}] extracted. Queue conveyor advanced. Size: ${items.length}/${CAPACITY}.`
    );
  } else if (operation.type === 'peek') {
    if (items.length === 0) {
      emitFrame(items, 0, -1, { cpp: 2, python: 2, pseudo: 2 }, `PEEK FAILED: Queue is empty.`);
      return frames;
    }
    items[0].state = 'inspecting';
    emitFrame(
      items,
      0,
      rear,
      { cpp: 3, python: 3, pseudo: 3 },
      `PEEK FRONT: Element [${items[0].value}] at FRONT [0] inspected. No pointer mutation.`,
      { activeIds: [items[0].id] }
    );
  }

  return frames;
}

// -------------------------------------------------------------
// 3. CIRCULAR QUEUE (RING BUFFER)
// -------------------------------------------------------------
export function generateCircularQueueFrames(
  rawValues: number[],
  operation?: StackQueueOperation
): StepFrame<StackQueueSnapshot>[] {
  const frames: StepFrame<StackQueueSnapshot>[] = [];
  const metrics = createMetrics();
  let frameCount = 0;

  // Capacity is fixed at 8 for the 45-degree radial ring
  const ringSlots: (StackQueueItem | null)[] = Array(CAPACITY).fill(null);
  
  // Populate initial 4 slots
  const initialCount = Math.min(4, rawValues.length);
  for (let i = 0; i < initialCount; i++) {
    ringSlots[i] = {
      id: `ring-${i}-${rawValues[i]}`,
      value: rawValues[i],
      index: i,
      state: 'idle',
    };
  }

  let front = 0;
  let rear = initialCount > 0 ? initialCount - 1 : 0;
  let count = initialCount;

  function emitFrame(
    fIdx: number,
    rIdx: number,
    codeLine: { cpp: number; python: number; pseudo: number },
    narration: string,
    overrides?: {
      activeIds?: (string | number)[];
      sortedIds?: (string | number)[];
      opName?: string;
    }
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        structureType: 'circularQueue',
        items: ringSlots.map((it, idx) => it ?? {
          id: `empty-slot-${idx}`,
          value: 0,
          index: idx,
          state: 'idle',
          isGhost: true,
        }),
        capacity: CAPACITY,
        frontIndex: fIdx,
        rearIndex: rIdx,
        telemetry: {
          size: count,
          capacity: CAPACITY,
          frontAddress: `0xRING_F${fIdx}`,
          rearAddress: `0xRING_R${rIdx}`,
          formula: `Rear: (rear + 1) % ${CAPACITY} = ${(rIdx + 1) % CAPACITY} | Front: (front + 1) % ${CAPACITY} = ${(fIdx + 1) % CAPACITY}`,
        },
      },
      pointers: { FRONT: fIdx, REAR: rIdx, 'REAR+1%8': (rIdx + 1) % CAPACITY, COUNT: count },
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: [`CircularQueue::${overrides?.opName ?? (operation ? operation.type : 'status')}()`],
      activeIds: overrides?.activeIds,
      sortedIds: overrides?.sortedIds,
      operation: overrides?.opName ?? operation?.type ?? 'circularQueue_state',
    });
  }

  emitFrame(
    front,
    rear,
    { cpp: 1, python: 1, pseudo: 1 },
    `CIRCULAR RING BUFFER (N=${CAPACITY}): Front at sector [${front}], Rear at sector [${rear}]. Modulo equation: (rear + 1) % ${CAPACITY}.`
  );

  if (!operation) return frames;

  if (operation.type === 'enqueue') {
    const val = operation.value ?? Math.floor(Math.random() * 89) + 10;
    if (count >= CAPACITY) {
      emitFrame(
        front,
        rear,
        { cpp: 3, python: 3, pseudo: 3 },
        `CIRCULAR BUFFER FULL: count (${count}) == capacity (${CAPACITY}). (rear + 1) % 8 == front. Overflow prevented.`
      );
      return frames;
    }

    const nextRear = (rear + 1) % CAPACITY;
    const isWrap = nextRear < rear;
    metrics.memoryOps++;

    const newItem: StackQueueItem = {
      id: `ring-${nextRear}-${val}`,
      value: val,
      index: nextRear,
      state: 'active',
    };

    ringSlots[nextRear] = newItem;
    rear = nextRear;
    count++;

    emitFrame(
      front,
      rear,
      { cpp: 4, python: 4, pseudo: 4 },
      `RING ENQUEUE: Advanced rear pointer to (${rear - (isWrap ? 0 : 1)} + 1) % ${CAPACITY} = ${rear}${isWrap ? ' [MODULO WRAP-AROUND!]' : ''}. Inserting [${val}].`,
      { activeIds: [newItem.id] }
    );

    newItem.state = 'idle';
    emitFrame(
      front,
      rear,
      { cpp: 6, python: 6, pseudo: 6 },
      `ENQUEUE LATCHED: Value [${val}] written to sector [${rear}]. Active count: ${count}/${CAPACITY}.`,
      { sortedIds: [newItem.id] }
    );
  } else if (operation.type === 'dequeue') {
    if (count === 0) {
      emitFrame(
        front,
        rear,
        { cpp: 2, python: 2, pseudo: 2 },
        `CIRCULAR BUFFER EMPTY: Cannot dequeue. Buffer underflow.`
      );
      return frames;
    }

    const dequeued = ringSlots[front];
    if (dequeued) dequeued.state = 'comparing';

    emitFrame(
      front,
      rear,
      { cpp: 4, python: 4, pseudo: 4 },
      `RING DEQUEUE: Reading value [${dequeued?.value}] from sector [${front}].`,
      { activeIds: dequeued ? [dequeued.id] : [] }
    );

    ringSlots[front] = null;
    const nextFront = (front + 1) % CAPACITY;
    const isWrap = nextFront < front;
    front = nextFront;
    count--;

    emitFrame(
      front,
      rear,
      { cpp: 6, python: 6, pseudo: 6 },
      `DEQUEUE COMMITTED: Sector vacated. Advanced front pointer: (front + 1) % ${CAPACITY} = ${front}${isWrap ? ' [MODULO WRAP-AROUND!]' : ''}. Size: ${count}.`
    );
  }

  return frames;
}

// -------------------------------------------------------------
// 4. PRIORITY QUEUE (BINARY HEAP)
// -------------------------------------------------------------
export function generatePriorityQueueFrames(
  rawValues: number[],
  operation?: StackQueueOperation
): StepFrame<StackQueueSnapshot>[] {
  const frames: StepFrame<StackQueueSnapshot>[] = [];
  const metrics = createMetrics();
  let frameCount = 0;

  // Max-Heap priority queue elements: { value, priority }
  const defaultItems: StackQueueItem[] = rawValues.slice(0, 5).map((val, idx) => ({
    id: `heap-item-${idx}-${val}`,
    value: val,
    priority: val, // use value as default priority (1-99)
    index: idx,
    state: 'idle',
  }));

  // Build initial valid max-heap
  for (let i = Math.floor(defaultItems.length / 2) - 1; i >= 0; i--) {
    let parent = i;
    while (2 * parent + 1 < defaultItems.length) {
      let maxChild = 2 * parent + 1;
      const right = 2 * parent + 2;
      if (right < defaultItems.length && (defaultItems[right].priority ?? 0) > (defaultItems[maxChild].priority ?? 0)) {
        maxChild = right;
      }
      if ((defaultItems[maxChild].priority ?? 0) > (defaultItems[parent].priority ?? 0)) {
        const temp = defaultItems[parent];
        defaultItems[parent] = defaultItems[maxChild];
        defaultItems[maxChild] = temp;
        parent = maxChild;
      } else {
        break;
      }
    }
  }

  defaultItems.forEach((it, idx) => {
    it.index = idx;
  });

  const items = [...defaultItems];

  function emitFrame(
    currentItems: StackQueueItem[],
    pointers: Record<string, number | string | null>,
    codeLine: { cpp: number; python: number; pseudo: number },
    narration: string,
    overrides?: {
      activeIds?: (string | number)[];
      sortedIds?: (string | number)[];
      opName?: string;
    }
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        structureType: 'priorityQueue',
        items: currentItems.map((it) => ({ ...it })),
        capacity: CAPACITY,
        heapNodes: calculateHeapCoordinates(currentItems),
        telemetry: {
          size: currentItems.length,
          capacity: CAPACITY,
          topAddress: currentItems.length > 0 ? `MAX_ROOT: [${currentItems[0].value} (P:${currentItems[0].priority})]` : 'EMPTY',
          formula: `Heap Parent: floor((i-1)/2) | Left: 2i+1 | Right: 2i+2`,
        },
      },
      pointers,
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: [`PriorityQueue::${overrides?.opName ?? (operation ? operation.type : 'inspect')}()`],
      activeIds: overrides?.activeIds,
      sortedIds: overrides?.sortedIds,
      operation: overrides?.opName ?? operation?.type ?? 'priorityQueue_state',
    });
  }

  emitFrame(
    items,
    { ROOT: items.length > 0 ? items[0].value : 'NULL', SIZE: items.length },
    { cpp: 1, python: 1, pseudo: 1 },
    `MAX-PRIORITY QUEUE INITIALIZED: Dual synchronization active. Sequential array (top) linked to Binary Max-Heap tree (bottom). Root max priority: ${items[0]?.priority ?? 'N/A'}.`
  );

  if (!operation) return frames;

  if (operation.type === 'enqueue') {
    const val = operation.value ?? Math.floor(Math.random() * 89) + 10;
    const prio = operation.priority ?? val;

    if (items.length >= CAPACITY) {
      emitFrame(
        items,
        { STATUS: 'OVERFLOW' },
        { cpp: 2, python: 2, pseudo: 2 },
        `PRIORITY QUEUE OVERFLOW: Capacity limit reached (${items.length}/${CAPACITY}).`
      );
      return frames;
    }

    const newItem: StackQueueItem = {
      id: `heap-item-${Date.now()}-${val}`,
      value: val,
      priority: prio,
      index: items.length,
      state: 'active',
    };

    items.push(newItem);
    let currIdx = items.length - 1;

    emitFrame(
      items,
      { INSERT_INDEX: currIdx, VALUE: val, PRIO: prio },
      { cpp: 4, python: 4, pseudo: 4 },
      `SIFT-UP START: Appending new node [VAL: ${val} | PRIO: ${prio}] at next leaf slot [${currIdx}]. Initiating sift-up verification.`,
      { activeIds: [newItem.id] }
    );

    // Sift-Up Loop
    while (currIdx > 0) {
      const parentIdx = Math.floor((currIdx - 1) / 2);
      metrics.comparisons++;
      
      items[currIdx].state = 'comparing';
      items[parentIdx].state = 'comparing';

      emitFrame(
        items,
        { CURR: currIdx, PARENT: parentIdx },
        { cpp: 5, python: 5, pseudo: 5 },
        `COMPARE PRIORITY: Node [${items[currIdx].value} (P:${items[currIdx].priority})] vs Parent [${items[parentIdx].value} (P:${items[parentIdx].priority})].`,
        { activeIds: [items[currIdx].id, items[parentIdx].id] }
      );

      if ((items[currIdx].priority ?? 0) > (items[parentIdx].priority ?? 0)) {
        metrics.swaps++;
        metrics.memoryOps += 2;
        
        // Swap
        const temp = items[currIdx];
        items[currIdx] = items[parentIdx];
        items[parentIdx] = temp;
        
        items[currIdx].index = currIdx;
        items[parentIdx].index = parentIdx;

        emitFrame(
          items,
          { SWAPPED: `${currIdx} <-> ${parentIdx}` },
          { cpp: 6, python: 6, pseudo: 6 },
          `SWAP SIFT-UP: Node priority ${items[parentIdx].priority} > parent priority ${items[currIdx].priority}. Exchanging nodes in array & tree.`,
          { activeIds: [items[parentIdx].id] }
        );

        items[currIdx].state = 'idle';
        items[parentIdx].state = 'idle';
        currIdx = parentIdx;
      } else {
        items[currIdx].state = 'idle';
        items[parentIdx].state = 'idle';
        break;
      }
    }

    emitFrame(
      items,
      { ROOT: items[0]?.value, SIZE: items.length },
      { cpp: 8, python: 8, pseudo: 8 },
      `ENQUEUE COMPLETE: Max-heap invariant verified. Element [${val}] settled at index [${currIdx}].`,
      { sortedIds: [items[currIdx].id] }
    );
  } else if (operation.type === 'extract' || operation.type === 'dequeue') {
    if (items.length === 0) {
      emitFrame(items, { STATUS: 'EMPTY' }, { cpp: 2, python: 2, pseudo: 2 }, `EXTRACT-MAX FAILED: Heap is empty.`);
      return frames;
    }

    const maxRoot = items[0];
    maxRoot.state = 'comparing';

    emitFrame(
      items,
      { EXTRACT: maxRoot.value, PRIO: maxRoot.priority ?? maxRoot.value },
      { cpp: 3, python: 3, pseudo: 3 },
      `EXTRACT-MAX INSTRUCTION: Root [VAL: ${maxRoot.value} | PRIO: ${maxRoot.priority}] holds highest priority. Preparing extraction.`,
      { activeIds: [maxRoot.id] }
    );

    if (items.length === 1) {
      items.pop();
      emitFrame(items, { SIZE: 0 }, { cpp: 4, python: 4, pseudo: 4 }, `EXTRACT COMPLETE: Last node removed. Heap is now empty.`);
      return frames;
    }

    // Replace root with last element
    metrics.swaps++;
    const lastItem = items.pop()!;
    items[0] = lastItem;
    items[0].index = 0;
    items[0].state = 'active';

    emitFrame(
      items,
      { MOVED_TO_ROOT: lastItem.value },
      { cpp: 5, python: 5, pseudo: 5 },
      `REPLACE ROOT: Moved last leaf node [${lastItem.value}] to root. Initiating sift-down rebalancing.`,
      { activeIds: [items[0].id] }
    );

    // Sift-Down Loop
    let curr = 0;
    while (2 * curr + 1 < items.length) {
      let maxChild = 2 * curr + 1;
      const right = 2 * curr + 2;

      if (right < items.length && (items[right].priority ?? 0) > (items[maxChild].priority ?? 0)) {
        maxChild = right;
      }

      metrics.comparisons++;
      items[curr].state = 'comparing';
      items[maxChild].state = 'comparing';

      emitFrame(
        items,
        { CURR: curr, MAX_CHILD: maxChild },
        { cpp: 7, python: 7, pseudo: 7 },
        `COMPARE CHILDREN: Root candidate [${items[curr].value} (P:${items[curr].priority})] vs Dominant Child [${items[maxChild].value} (P:${items[maxChild].priority})].`,
        { activeIds: [items[curr].id, items[maxChild].id] }
      );

      if ((items[maxChild].priority ?? 0) > (items[curr].priority ?? 0)) {
        metrics.swaps++;
        const temp = items[curr];
        items[curr] = items[maxChild];
        items[maxChild] = temp;

        items[curr].index = curr;
        items[maxChild].index = maxChild;

        emitFrame(
          items,
          { SWAP_DOWN: `${curr} <-> ${maxChild}` },
          { cpp: 8, python: 8, pseudo: 8 },
          `SWAP SIFT-DOWN: Swapped with dominant child to satisfy Max-Heap property.`,
          { activeIds: [items[curr].id, items[maxChild].id] }
        );

        items[curr].state = 'idle';
        items[maxChild].state = 'idle';
        curr = maxChild;
      } else {
        items[curr].state = 'idle';
        items[maxChild].state = 'idle';
        break;
      }
    }

    emitFrame(
      items,
      { ROOT: items[0]?.value, SIZE: items.length },
      { cpp: 10, python: 10, pseudo: 10 },
      `EXTRACT-MAX COMPLETE: Max node [${maxRoot.value}] removed. Heap property restored.`,
      { sortedIds: items[0] ? [items[0].id] : [] }
    );
  }

  return frames;
}

// -------------------------------------------------------------
// 5. DOUBLE-ENDED QUEUE (DEQUE)
// -------------------------------------------------------------
export function generateDequeFrames(
  rawValues: number[],
  operation?: StackQueueOperation
): StepFrame<StackQueueSnapshot>[] {
  const frames: StepFrame<StackQueueSnapshot>[] = [];
  const metrics = createMetrics();
  let frameCount = 0;

  const initialSlice = rawValues.slice(0, Math.min(4, rawValues.length));
  const items: StackQueueItem[] = initialSlice.map((val, idx) => ({
    id: `deque-item-${idx}-${val}`,
    value: val,
    index: idx,
    state: 'idle',
  }));

  function emitFrame(
    currentItems: StackQueueItem[],
    pointers: Record<string, number | string | null>,
    codeLine: { cpp: number; python: number; pseudo: number },
    narration: string,
    overrides?: {
      activeIds?: (string | number)[];
      sortedIds?: (string | number)[];
      opName?: string;
    }
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        structureType: 'deque',
        items: currentItems.map((it) => ({ ...it })),
        capacity: CAPACITY,
        frontIndex: currentItems.length > 0 ? 0 : null,
        rearIndex: currentItems.length > 0 ? currentItems.length - 1 : null,
        telemetry: {
          size: currentItems.length,
          capacity: CAPACITY,
          frontAddress: currentItems.length > 0 ? '0xDEQ_FRONT' : 'NULL',
          rearAddress: currentItems.length > 0 ? '0xDEQ_REAR' : 'NULL',
          formula: 'Bidirectional gates: Insert/Delete at Front [0] and Rear [N-1]',
        },
      },
      pointers,
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: [`Deque::${overrides?.opName ?? (operation ? operation.type : 'status')}()`],
      activeIds: overrides?.activeIds,
      sortedIds: overrides?.sortedIds,
      operation: overrides?.opName ?? operation?.type ?? 'deque_state',
    });
  }

  emitFrame(
    items,
    { FRONT: items.length > 0 ? 0 : 'NULL', REAR: items.length > 0 ? items.length - 1 : 'NULL' },
    { cpp: 1, python: 1, pseudo: 1 },
    `DEQUE INITIALIZED: Bidirectional Double-Ended Queue chamber. Active size: ${items.length}/${CAPACITY}. Dual gates armed.`
  );

  if (!operation) return frames;

  const val = operation.value ?? Math.floor(Math.random() * 89) + 10;

  if (operation.type === 'insertFront') {
    if (items.length >= CAPACITY) {
      emitFrame(items, { STATUS: 'OVERFLOW' }, { cpp: 2, python: 2, pseudo: 2 }, `DEQUE OVERFLOW: Capacity reached.`);
      return frames;
    }
    const newItem: StackQueueItem = {
      id: `deque-item-${Date.now()}-${val}`,
      value: val,
      index: 0,
      state: 'active',
    };
    items.unshift(newItem);
    items.forEach((it, idx) => { it.index = idx; });

    emitFrame(
      items,
      { FRONT_INSERT: val },
      { cpp: 4, python: 4, pseudo: 4 },
      `INSERT FRONT: Value [${val}] injected through left intake port. Shifted existing elements right.`,
      { activeIds: [newItem.id] }
    );
  } else if (operation.type === 'insertRear') {
    if (items.length >= CAPACITY) {
      emitFrame(items, { STATUS: 'OVERFLOW' }, { cpp: 2, python: 2, pseudo: 2 }, `DEQUE OVERFLOW: Capacity reached.`);
      return frames;
    }
    const newItem: StackQueueItem = {
      id: `deque-item-${Date.now()}-${val}`,
      value: val,
      index: items.length,
      state: 'active',
    };
    items.push(newItem);

    emitFrame(
      items,
      { REAR_INSERT: val },
      { cpp: 4, python: 4, pseudo: 4 },
      `INSERT REAR: Value [${val}] injected through right intake port at index [${items.length - 1}].`,
      { activeIds: [newItem.id] }
    );
  } else if (operation.type === 'deleteFront') {
    if (items.length === 0) {
      emitFrame(items, { STATUS: 'EMPTY' }, { cpp: 2, python: 2, pseudo: 2 }, `DELETE FRONT FAILED: Deque is empty.`);
      return frames;
    }
    const popped = items.shift()!;
    items.forEach((it, idx) => { it.index = idx; });

    emitFrame(
      items,
      { FRONT_EJECT: popped.value },
      { cpp: 4, python: 4, pseudo: 4 },
      `DELETE FRONT: Ejected element [${popped.value}] through left exit port. New Front is [${items[0]?.value ?? 'EMPTY'}].`
    );
  } else if (operation.type === 'deleteRear') {
    if (items.length === 0) {
      emitFrame(items, { STATUS: 'EMPTY' }, { cpp: 2, python: 2, pseudo: 2 }, `DELETE REAR FAILED: Deque is empty.`);
      return frames;
    }
    const popped = items.pop()!;

    emitFrame(
      items,
      { REAR_EJECT: popped.value },
      { cpp: 4, python: 4, pseudo: 4 },
      `DELETE REAR: Ejected element [${popped.value}] through right exit port. New Rear is [${items[items.length - 1]?.value ?? 'EMPTY'}].`
    );
  }

  return frames;
}
