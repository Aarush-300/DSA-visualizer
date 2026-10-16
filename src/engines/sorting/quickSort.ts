import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { ArrayBarItem, SortingSnapshot } from '../../types/sorting';

export function generateQuickSortFrames(rawValues: number[]): StepFrame<SortingSnapshot>[] {
  const frames: StepFrame<SortingSnapshot>[] = [];
  
  // Create persistent bars with unique IDs
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
    auxiliaryMemory: 'O(log n) Stack',
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
      pivotIds?: (string | number)[];
    }
  ) {
    const cloned = cloneBars(currentBars);
    frames.push({
      frameIndex: frameCount++,
      snapshot: { bars: cloned },
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

  // Initial Frame
  emitFrame(
    bars,
    { low: 0, high: bars.length - 1 },
    { cpp: 14, python: 13, pseudo: 1 },
    `Initial array with ${bars.length} elements. Beginning QuickSort using Lomuto partitioning.`,
    [`quickSort(arr, 0, ${bars.length - 1})`]
  );

  function quickSortHelper(low: number, high: number, depth: number, callStack: string[]) {
    metrics.recursionDepth = Math.max(metrics.recursionDepth, depth);

    if (low < high) {
      // Step 1: Partition
      const pivotIndex = partition(low, high, callStack);
      sortedIndices.add(pivotIndex);

      quickSortHelper(low, pivotIndex - 1, depth + 1, [
        ...callStack,
        `quickSort(arr, ${low}, ${pivotIndex - 1})`,
      ]);

      quickSortHelper(pivotIndex + 1, high, depth + 1, [
        ...callStack,
        `quickSort(arr, ${pivotIndex + 1}, ${high})`,
      ]);
    } else if (low >= 0 && low < bars.length) {
      sortedIndices.add(low);
      bars[low].state = 'sorted';
      emitFrame(
        bars,
        { i: low },
        { cpp: 14, python: 13, pseudo: 2 },
        `Base case reached: single element partition at index ${low} is sorted.`,
        callStack
      );
    }
  }

  function partition(low: number, high: number, callStack: string[]): number {
    const pivotVal = bars[high].value;
    const pivotId = bars[high].id;
    bars[high].state = 'pivot';

    emitFrame(
      bars,
      { pivot: high, low, high },
      { cpp: 3, python: 3, pseudo: 3 },
      `Selected pivot element array[${high}] = ${pivotVal}. Partitioning range [${low}..${high}].`,
      callStack,
      { pivotIds: [pivotId] }
    );

    let i = low - 1;

    for (let j = low; j < high; j++) {
      metrics.comparisons++;
      bars[j].state = 'compare';

      emitFrame(
        bars,
        { i: i >= low ? i : null, j, pivot: high, low, high },
        { cpp: 6, python: 6, pseudo: 6 },
        `Comparing array[${j}] (${bars[j].value}) with pivot (${pivotVal}).`,
        callStack,
        { activeIds: [bars[j].id, pivotId], pivotIds: [pivotId] }
      );

      if (bars[j].value <= pivotVal) {
        i++;
        if (i !== j) {
          metrics.swaps++;
          metrics.memoryOps += 2;
          bars[i].state = 'swap';
          bars[j].state = 'swap';

          // Swap elements in place
          const temp = bars[i];
          bars[i] = bars[j];
          bars[j] = temp;

          emitFrame(
            bars,
            { i, j, pivot: high, low, high },
            { cpp: 8, python: 8, pseudo: 8 },
            `Since ${bars[i].value} <= ${pivotVal}, incremented i to ${i} and swapped array[${i}] with array[${j}].`,
            callStack,
            { mutateIds: [bars[i].id, bars[j].id], pivotIds: [pivotId] }
          );
        } else {
          bars[j].state = 'visited';
          emitFrame(
            bars,
            { i, j, pivot: high, low, high },
            { cpp: 7, python: 7, pseudo: 7 },
            `array[${j}] <= pivot (${pivotVal}), incremented boundary pointer i to ${i}.`,
            callStack,
            { pivotIds: [pivotId] }
          );
        }
      } else {
        bars[j].state = 'idle';
      }
    }

    // Place pivot at its final sorted position (i + 1)
    const finalPivotIndex = i + 1;
    if (finalPivotIndex !== high) {
      metrics.swaps++;
      metrics.memoryOps += 2;
      bars[finalPivotIndex].state = 'swap';
      bars[high].state = 'swap';

      const temp = bars[finalPivotIndex];
      bars[finalPivotIndex] = bars[high];
      bars[high] = temp;
    }

    bars[finalPivotIndex].state = 'sorted';
    sortedIndices.add(finalPivotIndex);

    emitFrame(
      bars,
      { pivot: finalPivotIndex, low, high },
      { cpp: 11, python: 9, pseudo: 9 },
      `Pivot placed at final position index ${finalPivotIndex} (${bars[finalPivotIndex].value}). Sub-partitions separated.`,
      callStack,
      { mutateIds: [bars[finalPivotIndex].id], pivotIds: [bars[finalPivotIndex].id] }
    );

    // Reset non-sorted bars to idle
    for (let k = low; k <= high; k++) {
      if (!sortedIndices.has(k)) {
        bars[k].state = 'idle';
      }
    }

    return finalPivotIndex;
  }

  quickSortHelper(0, bars.length - 1, 1, [`quickSort(arr, 0, ${bars.length - 1})`]);

  // Mark all bars as sorted in final frame
  for (let k = 0; k < bars.length; k++) {
    sortedIndices.add(k);
    bars[k].state = 'sorted';
  }

  emitFrame(
    bars,
    {},
    { cpp: 18, python: 15, pseudo: 11 },
    `QuickSort complete! All ${bars.length} elements are sorted in non-decreasing order.`,
    []
  );

  return frames;
}

