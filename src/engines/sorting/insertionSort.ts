import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { ArrayBarItem, SortingSnapshot } from '../../types/sorting';

export function generateInsertionSortFrames(rawValues: number[]): StepFrame<SortingSnapshot>[] {
  const frames: StepFrame<SortingSnapshot>[] = [];
  
  if (rawValues.length === 0) return frames;

  // Assign strictly unique, immutable IDs to every element
  const bars: ArrayBarItem[] = rawValues.map((val, idx) => ({
    id: `bar-slot-${idx}-val-${val}`,
    value: val,
    index: idx,
    state: idx === 0 ? 'sorted' : 'idle',
  }));

  const metrics: TelemetryMetrics = {
    comparisons: 0,
    swaps: 0,
    memoryOps: 0,
    recursionDepth: 0,
    auxiliaryMemory: 'O(1) In-Place',
  };

  const sortedIndices = new Set<number>([0]);
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
    codeLine: { cpp: number; python: number; pseudo: number; c?: number; java?: number; algorithm?: number },
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
      codeLine: {
        cpp: codeLine.cpp,
        python: codeLine.python,
        pseudo: codeLine.pseudo,
      },
      narration,
      metrics: { ...metrics },
      callStack: ['insertionSort(arr)'],
      operation: 'insertionSort',
      activeIds: overrides?.activeIds,
      mutateIds: overrides?.mutateIds,
      pivotIds: overrides?.pivotIds,
      sortedIds: Array.from(sortedIndices),
    });
  }

  emitFrame(
    bars,
    { i: 1 },
    { cpp: 3, python: 3, pseudo: 2 },
    `Starting Insertion Sort. Initializing sorted partition with first element array[0] (${bars[0].value}).`
  );

  const n = bars.length;
  for (let i = 1; i < n; i++) {
    metrics.memoryOps++;
    const keyVal = bars[i].value;
    const keyId = bars[i].id;
    bars[i].state = 'pivot';

    emitFrame(
      bars,
      { i, key: keyVal },
      { cpp: 4, python: 4, pseudo: 3 },
      `Pass ${i}: Elevating key array[${i}] = ${keyVal}. Searching for insertion point in sorted partition [0..${i - 1}].`,
      { pivotIds: [keyId] }
    );

    let j = i;
    while (j > 0) {
      metrics.comparisons++;
      bars[j - 1].state = 'compare';

      emitFrame(
        bars,
        { i, j: j - 1, key: keyVal },
        { cpp: 5, python: 5, pseudo: 4 },
        `Comparing key (${keyVal}) with sorted element array[${j - 1}] (${bars[j - 1].value}).`,
        { activeIds: [bars[j - 1].id], pivotIds: [bars[j].id] }
      );

      if (bars[j - 1].value > keyVal) {
        metrics.swaps++;
        metrics.memoryOps += 2;

        // Swap without duplicating ID
        const temp = bars[j];
        bars[j] = bars[j - 1];
        bars[j - 1] = temp;

        bars[j].state = 'swap';
        bars[j - 1].state = 'pivot';

        emitFrame(
          bars,
          { i, j: j - 1, key: keyVal },
          { cpp: 6, python: 6, pseudo: 5 },
          `Since ${bars[j].value} > ${keyVal}, shifting element rightward to index ${j}.`,
          { mutateIds: [bars[j].id], pivotIds: [bars[j - 1].id] }
        );

        bars[j].state = 'sorted';
        j--;
      } else {
        bars[j - 1].state = 'sorted';
        break;
      }
    }

    bars[j].state = 'sorted';
    for (let k = 0; k <= i; k++) sortedIndices.add(k);

    emitFrame(
      bars,
      { insertedAt: j, key: keyVal },
      { cpp: 8, python: 7, pseudo: 6 },
      `Key ${keyVal} placed into sorted position index ${j}. Sorted partition size increased to ${i + 1}.`,
      { mutateIds: [bars[j].id] }
    );
  }

  for (let k = 0; k < n; k++) {
    sortedIndices.add(k);
    bars[k].state = 'sorted';
  }

  emitFrame(
    bars,
    {},
    { cpp: 10, python: 8, pseudo: 7 },
    `Insertion Sort complete! All ${n} elements are strictly sorted.`
  );

  return frames;
}
