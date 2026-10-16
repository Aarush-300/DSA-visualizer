import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { ArrayBarItem, SortingSnapshot } from '../../types/sorting';

export function generateSelectionSortFrames(rawValues: number[]): StepFrame<SortingSnapshot>[] {
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
    overrides?: {
      activeIds?: (string | number)[];
      mutateIds?: (string | number)[];
      pivotIds?: (string | number)[];
    }
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: { bars: cloneBars(currentBars) },
      pointers,
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: ['selectionSort(arr)'],
      operation: 'selectionSort',
      activeIds: overrides?.activeIds,
      mutateIds: overrides?.mutateIds,
      pivotIds: overrides?.pivotIds,
      sortedIds: Array.from(sortedIndices),
    });
  }

  emitFrame(
    bars,
    { i: 0 },
    { cpp: 3, python: 2, pseudo: 1 },
    `Starting Selection Sort on ${bars.length} elements. Finding global minimum element for index 0.`
  );

  const n = bars.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    bars[minIdx].state = 'pivot';

    emitFrame(
      bars,
      { i, min: minIdx },
      { cpp: 5, python: 4, pseudo: 3 },
      `Pass ${i + 1}: Initialized minimum candidate at index ${minIdx} (${bars[minIdx].value}). Scanning remaining partition.`,
      { pivotIds: [bars[minIdx].id] }
    );

    for (let j = i + 1; j < n; j++) {
      metrics.comparisons++;
      bars[j].state = 'compare';

      emitFrame(
        bars,
        { i, j, min: minIdx },
        { cpp: 7, python: 6, pseudo: 4 },
        `Comparing current minimum (${bars[minIdx].value} at index ${minIdx}) with array[${j}] (${bars[j].value}).`,
        { activeIds: [bars[j].id], pivotIds: [bars[minIdx].id] }
      );

      if (bars[j].value < bars[minIdx].value) {
        bars[minIdx].state = 'idle';
        minIdx = j;
        bars[minIdx].state = 'pivot';

        emitFrame(
          bars,
          { i, j, min: minIdx },
          { cpp: 8, python: 7, pseudo: 5 },
          `Found new minimum: array[${minIdx}] (${bars[minIdx].value}) < previous candidate. Updated MIN pointer to index ${minIdx}.`,
          { pivotIds: [bars[minIdx].id] }
        );
      } else {
        bars[j].state = 'idle';
      }
    }

    if (minIdx !== i) {
      metrics.swaps++;
      metrics.memoryOps += 2;
      bars[i].state = 'swap';
      bars[minIdx].state = 'swap';

      const temp = bars[i];
      bars[i] = bars[minIdx];
      bars[minIdx] = temp;

      emitFrame(
        bars,
        { i, swappedWith: minIdx },
        { cpp: 11, python: 9, pseudo: 6 },
        `Swapping minimum element ${bars[i].value} into its sorted position index ${i}.`,
        { mutateIds: [bars[i].id, bars[minIdx].id] }
      );
    }

    sortedIndices.add(i);
    bars[i].state = 'sorted';
    if (minIdx !== i) bars[minIdx].state = 'idle';
  }

  for (let k = 0; k < n; k++) {
    sortedIndices.add(k);
    bars[k].state = 'sorted';
  }

  emitFrame(
    bars,
    {},
    { cpp: 13, python: 10, pseudo: 7 },
    `Selection Sort complete! All ${n} elements are strictly sorted.`
  );

  return frames;
}

