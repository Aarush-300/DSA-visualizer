import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { ArrayBarItem, SortingSnapshot } from '../../types/sorting';

export function generateMergeSortFrames(rawValues: number[]): StepFrame<SortingSnapshot>[] {
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
    auxiliaryMemory: `O(n) — ${bars.length * 4} bytes`,
  };

  const sortedIndices = new Set<number>();
  let frameCount = 0;

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
    }
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: { bars: cloneBars(currentBars) },
      pointers,
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: [...callStack],
      activeIds: overrides?.activeIds,
      mutateIds: overrides?.mutateIds,
      sortedIds: Array.from(sortedIndices),
    });
  }

  emitFrame(
    bars,
    { l: 0, r: bars.length - 1 },
    { cpp: 13, python: 2, pseudo: 1 },
    `Starting recursive Merge Sort on array with ${bars.length} elements.`,
    [`mergeSort(arr, 0, ${bars.length - 1})`]
  );

  function mergeSortHelper(l: number, r: number, depth: number, callStack: string[]) {
    metrics.recursionDepth = Math.max(metrics.recursionDepth, depth);

    if (l >= r) return;

    const m = Math.floor(l + (r - l) / 2);

    emitFrame(
      bars,
      { l, m, r },
      { cpp: 15, python: 4, pseudo: 3 },
      `Dividing subarray [${l}..${r}] at midpoint m = ${m}.`,
      callStack
    );

    mergeSortHelper(l, m, depth + 1, [...callStack, `mergeSort(arr, ${l}, ${m})`]);
    mergeSortHelper(m + 1, r, depth + 1, [...callStack, `mergeSort(arr, ${m + 1}, ${r})`]);

    merge(l, m, r, callStack);
  }

  function merge(l: number, m: number, r: number, callStack: string[]) {
    const leftPart = bars.slice(l, m + 1);
    const rightPart = bars.slice(m + 1, r + 1);
    metrics.memoryOps += leftPart.length + rightPart.length;

    emitFrame(
      bars,
      { l, m, r },
      { cpp: 3, python: 6, pseudo: 5 },
      `Merging sorted subarrays [${l}..${m}] (size ${leftPart.length}) and [${m + 1}..${r}] (size ${rightPart.length}).`,
      [...callStack, `merge(arr, ${l}, ${m}, ${r})`]
    );

    let i = 0;
    let j = 0;
    let k = l;

    while (i < leftPart.length && j < rightPart.length) {
      metrics.comparisons++;
      const leftBar = leftPart[i];
      const rightBar = rightPart[j];

      emitFrame(
        bars,
        { i: l + i, j: m + 1 + j, k },
        { cpp: 7, python: 10, pseudo: 7 },
        `Comparing left sub-element (${leftBar.value}) with right sub-element (${rightBar.value}).`,
        callStack,
        { activeIds: [leftBar.id, rightBar.id] }
      );

      if (leftBar.value <= rightBar.value) {
        bars[k] = { ...leftBar, state: 'visited' };
        i++;
      } else {
        bars[k] = { ...rightBar, state: 'visited' };
        j++;
      }
      metrics.memoryOps++;
      metrics.swaps++;

      emitFrame(
        bars,
        { k },
        { cpp: 8, python: 11, pseudo: 8 },
        `Placed smaller element ${bars[k].value} into merged position index ${k}.`,
        callStack,
        { mutateIds: [bars[k].id] }
      );
      k++;
    }

    while (i < leftPart.length) {
      bars[k] = { ...leftPart[i], state: 'visited' };
      metrics.memoryOps++;
      emitFrame(
        bars,
        { k },
        { cpp: 10, python: 15, pseudo: 8 },
        `Flushing remaining left subarray element ${bars[k].value} into index ${k}.`,
        callStack,
        { mutateIds: [bars[k].id] }
      );
      i++;
      k++;
    }

    while (j < rightPart.length) {
      bars[k] = { ...rightPart[j], state: 'visited' };
      metrics.memoryOps++;
      emitFrame(
        bars,
        { k },
        { cpp: 11, python: 16, pseudo: 8 },
        `Flushing remaining right subarray element ${bars[k].value} into index ${k}.`,
        callStack,
        { mutateIds: [bars[k].id] }
      );
      j++;
      k++;
    }

    // Reset range states
    for (let x = l; x <= r; x++) {
      if (l === 0 && r === bars.length - 1) {
        sortedIndices.add(x);
        bars[x].state = 'sorted';
      } else {
        bars[x].state = 'idle';
      }
    }
  }

  mergeSortHelper(0, bars.length - 1, 1, [`mergeSort(arr, 0, ${bars.length - 1})`]);

  for (let idx = 0; idx < bars.length; idx++) {
    sortedIndices.add(idx);
    bars[idx].state = 'sorted';
  }

  emitFrame(
    bars,
    {},
    { cpp: 18, python: 17, pseudo: 8 },
    `Merge Sort complete! All subarrays consolidated into sorted order.`,
    []
  );

  return frames;
}

