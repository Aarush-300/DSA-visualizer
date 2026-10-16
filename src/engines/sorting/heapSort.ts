import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { ArrayBarItem, SortingSnapshot } from '../../types/sorting';

export function generateHeapSortFrames(rawValues: number[]): StepFrame<SortingSnapshot>[] {
  const frames: StepFrame<SortingSnapshot>[] = [];
  
  const bars: ArrayBarItem[] = rawValues.map((val, idx) => ({
    id: `bar-${idx}-${val}`,
    value: val,
    index: idx,
    state: 'idle',
  }));

  const metrics: TelemetryMetrics = {
    comparisons: 0,
    swaps: 0,
    memoryOps: 0,
    recursionDepth: 0,
    auxiliaryMemory: 'O(1) In-Place',
  };

  const sortedIndices = new Set<number>();
  let frameCount = 0;
  let heapSize = bars.length;

  function cloneBars(currentBars: ArrayBarItem[]): ArrayBarItem[] {
    return currentBars.map((b, i) => ({
      ...b,
      index: i,
      state: sortedIndices.has(i) ? 'sorted' : b.state,
    }));
  }

  function emitFrame(
    currentBars: ArrayBarItem[],
    pointers: Record<string, number | string | null>,
    codeLine: { cpp: number; python: number; pseudo: number },
    narration: string,
    callStack: string[],
    overrides?: {
      activeIds?: (string | number)[];
      mutateIds?: (string | number)[];
      pivotIds?: (string | number)[];
    }
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: { bars: cloneBars(currentBars), heapTreeSize: heapSize },
      pointers,
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: [...callStack],
      activeIds: overrides?.activeIds,
      mutateIds: overrides?.mutateIds,
      pivotIds: overrides?.pivotIds,
      sortedIds: Array.from(sortedIndices),
    });
  }

  emitFrame(
    bars,
    {},
    { cpp: 13, python: 10, pseudo: 1 },
    `Starting Heap Sort on ${bars.length} elements. Phase 1: Build Max-Heap.`,
    ['heapSort(arr)']
  );

  function heapify(n: number, i: number, depth: number, callStack: string[]) {
    metrics.recursionDepth = Math.max(metrics.recursionDepth, depth);
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    bars[i].state = 'pivot';
    if (left < n) bars[left].state = 'compare';
    if (right < n) bars[right].state = 'compare';

    const activeList = [bars[i].id];
    if (left < n) activeList.push(bars[left].id);
    if (right < n) activeList.push(bars[right].id);

    emitFrame(
      bars,
      { root: i, left: left < n ? left : null, right: right < n ? right : null },
      { cpp: 3, python: 3, pseudo: 5 },
      `Sifting down subtree at root index ${i} (${bars[i].value}) within heap size ${n}.`,
      callStack,
      { activeIds: activeList, pivotIds: [bars[i].id] }
    );

    if (left < n) {
      metrics.comparisons++;
      if (bars[left].value > bars[largest].value) {
        largest = left;
      }
    }

    if (right < n) {
      metrics.comparisons++;
      if (bars[right].value > bars[largest].value) {
        largest = right;
      }
    }

    if (largest !== i) {
      metrics.swaps++;
      metrics.memoryOps += 2;
      bars[i].state = 'swap';
      bars[largest].state = 'swap';

      const temp = bars[i];
      bars[i] = bars[largest];
      bars[largest] = temp;

      emitFrame(
        bars,
        { root: i, largest },
        { cpp: 7, python: 6, pseudo: 5 },
        `Child (${bars[i].value}) > root (${bars[largest].value}). Swapping array[${i}] and array[${largest}].`,
        callStack,
        { mutateIds: [bars[i].id, bars[largest].id] }
      );

      bars[i].state = 'idle';
      bars[largest].state = 'idle';
      if (left < n) bars[left].state = 'idle';
      if (right < n) bars[right].state = 'idle';

      heapify(n, largest, depth + 1, callStack);
    } else {
      bars[i].state = 'idle';
      if (left < n) bars[left].state = 'idle';
      if (right < n) bars[right].state = 'idle';
    }
  }

  // Phase 1: Build heap
  const n = bars.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i, 1, ['heapSort(arr)', `buildHeap(i=${i})`]);
  }

  emitFrame(
    bars,
    {},
    { cpp: 14, python: 11, pseudo: 2 },
    `Max-Heap property established. Root array[0] (${bars[0].value}) is the global maximum. Phase 2: Successive extraction.`,
    ['heapSort(arr)']
  );

  // Phase 2: Extract elements
  for (let i = n - 1; i > 0; i--) {
    metrics.swaps++;
    metrics.memoryOps += 2;
    bars[0].state = 'swap';
    bars[i].state = 'swap';

    const temp = bars[0];
    bars[0] = bars[i];
    bars[i] = temp;

    sortedIndices.add(i);
    bars[i].state = 'sorted';
    heapSize = i;

    emitFrame(
      bars,
      { max: i, root: 0 },
      { cpp: 16, python: 13, pseudo: 4 },
      `Extracted maximum (${bars[i].value}) to position index ${i}. Shrinking active heap boundary to [0..${i - 1}].`,
      ['heapSort(arr)', `extractMax(i=${i})`],
      { mutateIds: [bars[0].id, bars[i].id] }
    );

    bars[0].state = 'idle';
    heapify(i, 0, 1, ['heapSort(arr)', `heapify(0, heapSize=${i})`]);
  }

  sortedIndices.add(0);
  bars[0].state = 'sorted';

  emitFrame(
    bars,
    {},
    { cpp: 18, python: 15, pseudo: 5 },
    `Heap Sort complete! All ${n} elements extracted into verified ascending order.`,
    []
  );

  return frames;
}

