import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { ArrayBarItem, SearchingSnapshot } from '../../types/sorting';

export function generateLinearSearchFrames(rawValues: number[], targetVal?: number): StepFrame<SearchingSnapshot>[] {
  const frames: StepFrame<SearchingSnapshot>[] = [];
  const target = targetVal ?? rawValues[Math.floor(rawValues.length / 2)] ?? 42;

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
    auxiliaryMemory: 'O(1) Iterative',
  };

  let frameCount = 0;

  function cloneBars(currentBars: ArrayBarItem[]): ArrayBarItem[] {
    return currentBars.map((b) => ({ ...b }));
  }

  function emitFrame(
    currentBars: ArrayBarItem[],
    pointers: Record<string, number | string | null>,
    codeLine: { cpp: number; python: number; pseudo: number },
    narration: string,
    snapshotInfo: { foundIndex: number | null },
    overrides?: {
      activeIds?: (string | number)[];
      pivotIds?: (string | number)[];
      sortedIds?: (string | number)[];
    }
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        bars: cloneBars(currentBars),
        target,
        foundIndex: snapshotInfo.foundIndex,
        low: 0,
        high: currentBars.length - 1,
        mid: null,
      },
      pointers,
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: [`linearSearch(arr, target=${target})`],
      activeIds: overrides?.activeIds,
      pivotIds: overrides?.pivotIds,
      sortedIds: overrides?.sortedIds,
      operation: 'linearSearch',
    });
  }

  // Initial Frame 0
  emitFrame(
    bars,
    { i: 0, target },
    { cpp: 1, python: 1, pseudo: 1 },
    `INITIALIZE LINEAR SEARCH: Target value is [${target}]. Beginning sequential scan from index 0.`,
    { foundIndex: null }
  );

  let foundIndex: number | null = null;

  for (let i = 0; i < bars.length; i++) {
    metrics.comparisons++;
    metrics.memoryOps++;

    // Mark current bar as comparing
    bars.forEach((b, idx) => {
      if (b.state !== 'sorted') b.state = idx === i ? 'comparing' : 'idle';
    });

    emitFrame(
      bars,
      { i, target },
      { cpp: 3, python: 3, pseudo: 3 },
      `SCANNING INDEX [${i}]: Inspecting arr[${i}] = ${bars[i].value}. Comparing with target ${target}.`,
      { foundIndex: null },
      { activeIds: [bars[i].id] }
    );

    if (bars[i].value === target) {
      foundIndex = i;
      bars[i].state = 'sorted';

      emitFrame(
        bars,
        { i, target, MATCH: i },
        { cpp: 4, python: 4, pseudo: 4 },
        `TARGET FOUND: arr[${i}] == ${target}! Search terminates successfully at index [${i}].`,
        { foundIndex: i },
        { sortedIds: [bars[i].id] }
      );
      break;
    } else {
      bars[i].state = 'idle';
    }
  }

  if (foundIndex === null) {
    emitFrame(
      bars,
      { i: 'END', target },
      { cpp: 6, python: 6, pseudo: 6 },
      `TARGET NOT FOUND (-1): Scanned entire array without finding target ${target}.`,
      { foundIndex: -1 }
    );
  }

  return frames;
}

