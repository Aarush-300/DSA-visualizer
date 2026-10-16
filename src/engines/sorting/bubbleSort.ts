import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { ArrayBarItem, SortingSnapshot } from '../../types/sorting';

export function generateBubbleSortFrames(rawValues: number[]): StepFrame<SortingSnapshot>[] {
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
    }
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: { bars: cloneBars(currentBars) },
      pointers,
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: ['bubbleSort(arr)'],
      activeIds: overrides?.activeIds,
      mutateIds: overrides?.mutateIds,
      sortedIds: Array.from(sortedIndices),
    });
  }

  emitFrame(
    bars,
    {},
    { cpp: 3, python: 2, pseudo: 1 },
    `Starting Bubble Sort on ${bars.length} elements with early-exit optimization.`
  );

  const n = bars.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      metrics.comparisons++;
      bars[j].state = 'compare';
      bars[j + 1].state = 'compare';

      emitFrame(
        bars,
        { i, j, 'j+1': j + 1 },
        { cpp: 7, python: 6, pseudo: 5 },
        `Pass ${i + 1}: Comparing array[${j}] (${bars[j].value}) with array[${j + 1}] (${bars[j + 1].value}).`,
        { activeIds: [bars[j].id, bars[j + 1].id] }
      );

      if (bars[j].value > bars[j + 1].value) {
        metrics.swaps++;
        metrics.memoryOps += 2;
        bars[j].state = 'swap';
        bars[j + 1].state = 'swap';

        const temp = bars[j];
        bars[j] = bars[j + 1];
        bars[j + 1] = temp;
        swapped = true;

        emitFrame(
          bars,
          { i, j, 'j+1': j + 1 },
          { cpp: 8, python: 7, pseudo: 6 },
          `Swapping out-of-order elements: ${bars[j + 1].value} > ${bars[j].value}.`,
          { mutateIds: [bars[j].id, bars[j + 1].id] }
        );
      }

      bars[j].state = 'idle';
      bars[j + 1].state = 'idle';
    }

    const lockedIndex = n - i - 1;
    sortedIndices.add(lockedIndex);
    bars[lockedIndex].state = 'sorted';

    emitFrame(
      bars,
      { i, sorted: lockedIndex },
      { cpp: 11, python: 8, pseudo: 7 },
      `Element at index ${lockedIndex} (${bars[lockedIndex].value}) bubbled to its final sorted position.`
    );

    if (!swapped) {
      emitFrame(
        bars,
        { i },
        { cpp: 12, python: 9, pseudo: 8 },
        `Early exit triggered! No swaps made in pass ${i + 1}; remaining array is sorted.`
      );
      break;
    }
  }

  for (let k = 0; k < n; k++) {
    sortedIndices.add(k);
    bars[k].state = 'sorted';
  }

  emitFrame(
    bars,
    {},
    { cpp: 13, python: 10, pseudo: 8 },
    `Bubble Sort complete! All ${n} elements verified sorted.`
  );

  return frames;
}

