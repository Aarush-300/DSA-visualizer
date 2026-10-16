import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { ArrayBarItem, SearchingSnapshot } from '../../types/sorting';

export function generateBinarySearchFrames(rawValues: number[], targetVal?: number): StepFrame<SearchingSnapshot>[] {
  const frames: StepFrame<SearchingSnapshot>[] = [];
  
  // Binary search requires a sorted array
  const sortedValues = [...rawValues].sort((a, b) => a - b);
  const target = targetVal ?? sortedValues[Math.floor(sortedValues.length / 2)];

  const bars: ArrayBarItem[] = sortedValues.map((val, idx) => ({
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
    snapshotInfo: { low: number; high: number; mid: number | null; foundIndex: number | null },
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
        low: snapshotInfo.low,
        high: snapshotInfo.high,
        mid: snapshotInfo.mid,
      },
      pointers,
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: [`binarySearch(arr, target=${target})`],
      activeIds: overrides?.activeIds,
      pivotIds: overrides?.pivotIds,
      sortedIds: overrides?.sortedIds,
    });
  }

  let low = 0;
  let high = bars.length - 1;
  let found = -1;

  emitFrame(
    bars,
    { low, high },
    { cpp: 3, python: 3, pseudo: 2 },
    `Initiating Binary Search for Target ${target} across sorted range [${low}..${high}].`,
    { low, high, mid: null, foundIndex: null }
  );

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);
    metrics.comparisons++;

    // Highlight active window
    for (let k = 0; k < bars.length; k++) {
      if (k >= low && k <= high) {
        bars[k].state = k === mid ? 'pivot' : 'visited';
      } else {
        bars[k].state = 'idle';
      }
    }

    emitFrame(
      bars,
      { low, mid, high },
      { cpp: 5, python: 5, pseudo: 4 },
      `Computed midpoint mid = ${mid} (value ${bars[mid].value}). Comparing with target ${target}.`,
      { low, high, mid, foundIndex: null },
      { pivotIds: [bars[mid].id], activeIds: [bars[mid].id] }
    );

    if (bars[mid].value === target) {
      found = mid;
      bars[mid].state = 'sorted';
      emitFrame(
        bars,
        { mid },
        { cpp: 6, python: 6, pseudo: 5 },
        `Target ${target} located at index ${mid}! Terminating search with success.`,
        { low, high, mid, foundIndex: mid },
        { sortedIds: [bars[mid].id] }
      );
      break;
    } else if (bars[mid].value < target) {
      emitFrame(
        bars,
        { low, mid, high },
        { cpp: 7, python: 7, pseudo: 6 },
        `array[${mid}] (${bars[mid].value}) < target (${target}). Eliminating left partition [${low}..${mid}]. Adjusting low to ${mid + 1}.`,
        { low, high, mid, foundIndex: null },
        { pivotIds: [bars[mid].id] }
      );
      low = mid + 1;
    } else {
      emitFrame(
        bars,
        { low, mid, high },
        { cpp: 8, python: 8, pseudo: 7 },
        `array[${mid}] (${bars[mid].value}) > target (${target}). Eliminating right partition [${mid}..${high}]. Adjusting high to ${mid - 1}.`,
        { low, high, mid, foundIndex: null },
        { pivotIds: [bars[mid].id] }
      );
      high = mid - 1;
    }
  }

  if (found === -1) {
    for (const b of bars) b.state = 'idle';
    emitFrame(
      bars,
      {},
      { cpp: 10, python: 9, pseudo: 8 },
      `Search bounds crossed (low > high). Target ${target} not present in dataset. Returning -1.`,
      { low, high, mid: null, foundIndex: null }
    );
  }

  return frames;
}

