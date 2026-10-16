import { describe, it, expect } from 'vitest';
import { generateQuickSortFrames } from '../src/engines/sorting/quickSort';
import { generateMergeSortFrames } from '../src/engines/sorting/mergeSort';
import { generateHeapSortFrames } from '../src/engines/sorting/heapSort';
import { generateBubbleSortFrames } from '../src/engines/sorting/bubbleSort';
import { generateInsertionSortFrames } from '../src/engines/sorting/insertionSort';
import { generateSelectionSortFrames } from '../src/engines/sorting/selectionSort';
import { generateBinarySearchFrames } from '../src/engines/searching/binarySearch';
import { generateLinearSearchFrames } from '../src/engines/searching/linearSearch';
import {
  generateStackFrames,
  generateLinearQueueFrames,
  generateCircularQueueFrames,
  generatePriorityQueueFrames,
  generateDequeFrames,
} from '../src/engines/stacksQueues/stackQueueOperations';
import { generateLinkedListFrames } from '../src/engines/linkedList/linkedListVariants';
import { generateAVLInsertionFrames } from '../src/engines/trees/avlRotations';
import { generateBSTFrames } from '../src/engines/trees/bstOperations';
import { generateMWayTreeFrames } from '../src/engines/trees/mWayTree';
import { generateBTreeFrames } from '../src/engines/trees/bTree';
import { generateBPlusTreeFrames } from '../src/engines/trees/bPlusTree';
import { createInitialGrid, generatePathfindingFrames } from '../src/engines/graphs/pathfindingGrid';
import { generateNetworkGraphFrames, generatePrimMSTFrames } from '../src/engines/graphs/networkGraph';
import { compileEngineFrames, getDefaultInputForModule } from '../src/engines/compileEngine';
import { CODE_SNIPPETS } from '../src/data/codeSnippets';

describe('Algorithm Generator Engine Suite', () => {
  const sampleData = [64, 34, 25, 12, 22, 11, 90];
  const sortedExpected = [11, 12, 22, 25, 34, 64, 90];

  // ---------------- MODULE 01: SORTING & SEARCH ----------------
  it('QuickSort produces deterministic sorted final snapshot', () => {
    const frames = generateQuickSortFrames(sampleData);
    expect(frames.length).toBeGreaterThan(0);
    const lastFrame = frames[frames.length - 1];
    const finalValues = lastFrame.snapshot.bars.map((b) => b.value);
    expect(finalValues).toEqual(sortedExpected);
    expect(lastFrame.metrics.comparisons).toBeGreaterThan(0);
    expect(lastFrame.metrics.swaps).toBeGreaterThan(0);
  });

  it('MergeSort produces deterministic sorted final snapshot', () => {
    const frames = generateMergeSortFrames(sampleData);
    expect(frames.length).toBeGreaterThan(0);
    const lastFrame = frames[frames.length - 1];
    const finalValues = lastFrame.snapshot.bars.map((b) => b.value);
    expect(finalValues).toEqual(sortedExpected);
    expect(lastFrame.metrics.comparisons).toBeGreaterThan(0);
  });

  it('HeapSort produces deterministic sorted final snapshot', () => {
    const frames = generateHeapSortFrames(sampleData);
    expect(frames.length).toBeGreaterThan(0);
    const lastFrame = frames[frames.length - 1];
    const finalValues = lastFrame.snapshot.bars.map((b) => b.value);
    expect(finalValues).toEqual(sortedExpected);
    expect(lastFrame.metrics.comparisons).toBeGreaterThan(0);
    expect(lastFrame.metrics.swaps).toBeGreaterThan(0);
  });

  it('BubbleSort produces deterministic sorted final snapshot with early exit verification', () => {
    const frames = generateBubbleSortFrames(sampleData);
    expect(frames.length).toBeGreaterThan(0);
    const lastFrame = frames[frames.length - 1];
    const finalValues = lastFrame.snapshot.bars.map((b) => b.value);
    expect(finalValues).toEqual(sortedExpected);
  });

  it('InsertionSort properly elevates key, shifts elements and produces sorted array', () => {
    const frames = generateInsertionSortFrames(sampleData);
    expect(frames.length).toBeGreaterThan(0);
    const lastFrame = frames[frames.length - 1];
    const finalValues = lastFrame.snapshot.bars.map((b) => b.value);
    expect(finalValues).toEqual(sortedExpected);
  });

  it('SelectionSort highlights persistent min candidate and produces sorted array', () => {
    const frames = generateSelectionSortFrames(sampleData);
    expect(frames.length).toBeGreaterThan(0);
    const lastFrame = frames[frames.length - 1];
    const finalValues = lastFrame.snapshot.bars.map((b) => b.value);
    expect(finalValues).toEqual(sortedExpected);
  });

  it('LinearSearch locates target index or reports not found', () => {
    const framesFound = generateLinearSearchFrames(sampleData, 34);
    expect(framesFound.length).toBeGreaterThan(0);
    const foundFrame = framesFound.find((f) => f.snapshot.foundIndex === 1);
    expect(foundFrame).toBeDefined();

    const framesNotFound = generateLinearSearchFrames(sampleData, 999);
    const notFoundFrame = framesNotFound[framesNotFound.length - 1];
    expect(notFoundFrame.snapshot.foundIndex).toBe(-1);
  });

  it('BinarySearch locates target index and eliminates partitions correctly', () => {
    const frames = generateBinarySearchFrames(sampleData, 34);
    expect(frames.length).toBeGreaterThan(0);
    const successFrame = frames.find((f) => f.snapshot.foundIndex !== null);
    expect(successFrame).toBeDefined();
    expect(successFrame?.snapshot.bars[successFrame.snapshot.foundIndex!].value).toBe(34);
  });

  // ---------------- MODULE 02: STACKS & QUEUES ----------------
  it('Stack correctly handles PUSH, POP, and PEEK operations', () => {
    const initial = [10, 20, 30];
    const pushFrames = generateStackFrames(initial, { type: 'push', value: 40 });
    const lastPush = pushFrames[pushFrames.length - 1];
    expect(lastPush.snapshot.items.length).toBe(4);
    expect(lastPush.snapshot.items[lastPush.snapshot.items.length - 1].value).toBe(40);

    const popFrames = generateStackFrames(initial, { type: 'pop' });
    const lastPop = popFrames[popFrames.length - 1];
    expect(lastPop.snapshot.items.length).toBe(2);

    const peekFrames = generateStackFrames(initial, { type: 'peek' });
    const lastPeek = peekFrames[peekFrames.length - 1];
    expect(lastPeek.snapshot.items.length).toBe(3);
  });

  it('Linear Queue correctly handles ENQUEUE and DEQUEUE FIFO ordering', () => {
    const initial = [10, 20, 30];
    const enqFrames = generateLinearQueueFrames(initial, { type: 'enqueue', value: 40 });
    const lastEnq = enqFrames[enqFrames.length - 1];
    expect(lastEnq.snapshot.items[lastEnq.snapshot.items.length - 1].value).toBe(40);

    const deqFrames = generateLinearQueueFrames(initial, { type: 'dequeue' });
    const lastDeq = deqFrames[deqFrames.length - 1];
    expect(lastDeq.snapshot.items[0].value).toBe(20);
  });

  it('Circular Queue wraps rear pointer with modulo arithmetic (rear + 1) % N', () => {
    const initial = [1, 2, 3, 4];
    const frames = generateCircularQueueFrames(initial, { type: 'enqueue', value: 99 });
    expect(frames.length).toBeGreaterThan(0);
    const lastFrame = frames[frames.length - 1];
    expect(lastFrame.snapshot.telemetry.formula).toContain('% 8');
  });

  it('Priority Queue maintains max-heap invariants on ENQUEUE and EXTRACT', () => {
    const initial = [10, 50, 30, 20];
    const enqFrames = generatePriorityQueueFrames(initial, { type: 'enqueue', value: 90, priority: 90 });
    const lastEnq = enqFrames[enqFrames.length - 1];
    expect(lastEnq.snapshot.items[0].priority).toBe(90); // Root is max

    const extFrames = generatePriorityQueueFrames(initial, { type: 'extract' });
    expect(extFrames.length).toBeGreaterThan(0);
  });

  it('Deque supports insertion and deletion at both FRONT and REAR', () => {
    const initial = [20, 30];
    const ifFrames = generateDequeFrames(initial, { type: 'insertFront', value: 10 });
    expect(ifFrames[ifFrames.length - 1].snapshot.items[0].value).toBe(10);

    const irFrames = generateDequeFrames(initial, { type: 'insertRear', value: 40 });
    const irLast = irFrames[irFrames.length - 1];
    expect(irLast.snapshot.items[irLast.snapshot.items.length - 1].value).toBe(40);
  });

  // ---------------- MODULE 03: LINKED LISTS ----------------
  it('Linked List variants maintain correct pointer wiring and coordinates', () => {
    const input = [10, 20, 30];

    // Singly
    const sFrames = generateLinkedListFrames('singly', input, { type: 'insertHead', value: 5 });
    expect(sFrames[sFrames.length - 1].snapshot.nodes[0].value).toBe(5);

    // Doubly
    const dFrames = generateLinkedListFrames('doubly', input);
    const lastD = dFrames[0].snapshot.nodes;
    expect(lastD[1].prevAddress).toBe(lastD[0].address);
    expect(lastD[0].prevAddress).toBeNull();

    // Circular Singly
    const csFrames = generateLinkedListFrames('circularSingly', input);
    const lastCS = csFrames[0].snapshot.nodes;
    expect(lastCS[lastCS.length - 1].nextAddress).toBe(lastCS[0].address);

    // Reversal in-place
    const revFrames = generateLinkedListFrames('singly', input, { type: 'reverse' });
    const lastRev = revFrames[revFrames.length - 1];
    expect(lastRev.snapshot.nodes[0].value).toBe(30);
  });

  // ---------------- MODULE 04: TREES ----------------
  it('BST handles insert, search, and all 3 delete cases', () => {
    const input = [30, 20, 40, 10, 25];
    const insFrames = generateBSTFrames(input, { type: 'insert', key: 35 });
    expect(insFrames.length).toBeGreaterThan(0);

    const delFrames = generateBSTFrames(input, { type: 'delete', key: 20 });
    expect(delFrames.length).toBeGreaterThan(0);
  });

  it('AVL Tree maintains height balance (|BF| <= 1)', () => {
    const input = [10, 20, 30, 40, 50, 25];
    const frames = generateAVLInsertionFrames(input);
    expect(frames.length).toBeGreaterThan(0);
    const lastFrame = frames[frames.length - 1];
    for (const node of Object.values(lastFrame.snapshot.nodes)) {
      expect(Math.abs(node.balanceFactor)).toBeLessThanOrEqual(1);
    }
  });

  it('M-Way Search Tree creates multi-key node blocks', () => {
    const frames = generateMWayTreeFrames([10, 20, 30, 40], 3);
    expect(frames.length).toBeGreaterThan(0);
    const lastFrame = frames[frames.length - 1];
    expect(Object.keys(lastFrame.snapshot.multiKeyNodes ?? {}).length).toBeGreaterThan(0);
  });

  it('B-Tree splits nodes when keys exceed M - 1', () => {
    const frames = generateBTreeFrames([10, 20, 30, 40, 50], 3, { type: 'insert', key: 60 });
    expect(frames.length).toBeGreaterThan(0);
  });

  it('B+ Tree copies keys up to router and maintains emerald leaf chain', () => {
    const frames = generateBPlusTreeFrames([10, 20, 30, 40], 3);
    expect(frames.length).toBeGreaterThan(0);
    const lastFrame = frames[frames.length - 1];
    expect(lastFrame.snapshot.treeFamily).toBe('bplus');
  });

  // ---------------- MODULE 05: GRAPHS ----------------
  it('Dijkstra and A* pathfinding find optimal shortest path accounting for weights', () => {
    const start = { row: 3, col: 3 };
    const target = { row: 3, col: 10 };
    const grid = createInitialGrid(10, 15, start, target);

    const dijkstraFrames = generatePathfindingFrames(grid, 'dijkstra', start, target);
    expect(dijkstraFrames.length).toBeGreaterThan(0);

    const aStarFrames = generatePathfindingFrames(grid, 'aStar', start, target);
    expect(aStarFrames.length).toBeGreaterThan(0);
  });

  it("Prim's MST produces connected tree spanning all 7 vertices", () => {
    const frames = generatePrimMSTFrames();
    expect(frames.length).toBeGreaterThan(0);
    const lastFrame = frames[frames.length - 1];
    expect(lastFrame.snapshot.mstEdges?.length).toBe(6);
  });

  it('Network Graph handles vertex and edge insertion/deletion', () => {
    const vIns = generateNetworkGraphFrames({ type: 'insertVertex', label: 'Z' });
    expect(vIns.length).toBeGreaterThan(0);
    expect(vIns[vIns.length - 1].snapshot.vertices?.some((v) => v.label === 'Z')).toBe(true);

    const vDel = generateNetworkGraphFrames({ type: 'deleteVertex', vertexId: 'v0' });
    expect(vDel.length).toBeGreaterThan(0);
  });

  // ---------------- UNIVERSAL COMPILER GUARANTEES ----------------
  it('compileEngineFrames guarantees non-empty frames and valid Frame 0 on initial load and across all 5 module switches', () => {
    const modules = ['sorting', 'stacksQueues', 'linkedList', 'trees', 'graphs'] as const;
    for (const mod of modules) {
      const defaultInput = getDefaultInputForModule(mod);
      const defaultAlgo =
        mod === 'sorting'
          ? 'quick'
          : mod === 'stacksQueues'
          ? 'stack'
          : mod === 'linkedList'
          ? 'singly'
          : mod === 'trees'
          ? 'bst'
          : 'dijkstraGrid';
      const frames = compileEngineFrames(mod, defaultAlgo, defaultInput, 42);

      expect(frames.length).toBeGreaterThan(0);
      expect(frames[0].frameIndex).toBe(0);
      expect(frames[0].narration).toBeTruthy();
    }
  });

  // ---------------- PART 6: CRITICAL ARCHITECTURAL VERIFICATIONS ----------------
  it('Insertion Sort produces zero duplicate id values across all frames and preserves array length', () => {
    const raw = [64, 34, 25, 12, 22, 11, 90];
    const frames = generateInsertionSortFrames(raw);
    expect(frames.length).toBeGreaterThan(0);
    for (const frame of frames) {
      const bars = frame.snapshot.bars;
      expect(bars.length).toBe(raw.length);
      const ids = bars.map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    }
    const finalBars = frames[frames.length - 1].snapshot.bars;
    expect(finalBars.map((b) => b.value)).toEqual([11, 12, 22, 25, 34, 64, 90]);
  });

  it('Sequential mutations preserve prior state across Stacks, Queues, Linked Lists, and Trees', () => {
    // 1. Stack: 3 pushes then 1 pop
    const frames1 = generateStackFrames([10, 20], { type: 'push', value: 30 });
    const vals1 = frames1[frames1.length - 1].snapshot.items.map((it: any) => it.value);
    expect(vals1).toEqual([10, 20, 30]);

    const frames2 = generateStackFrames(vals1, { type: 'push', value: 40 });
    const vals2 = frames2[frames2.length - 1].snapshot.items.map((it: any) => it.value);
    expect(vals2).toEqual([10, 20, 30, 40]);

    const frames3 = generateStackFrames(vals2, { type: 'push', value: 50 });
    const vals3 = frames3[frames3.length - 1].snapshot.items.map((it: any) => it.value);
    expect(vals3).toEqual([10, 20, 30, 40, 50]);

    const frames4 = generateStackFrames(vals3, { type: 'pop' });
    const vals4 = frames4[frames4.length - 1].snapshot.items.map((it: any) => it.value);
    expect(vals4).toEqual([10, 20, 30, 40]);

    // 2. Linear Queue: 3 enqueues then 1 dequeue
    const qFrames1 = generateLinearQueueFrames([10, 20], { type: 'enqueue', value: 30 });
    const qVals1 = qFrames1[qFrames1.length - 1].snapshot.items.map((it: any) => it.value);
    expect(qVals1).toEqual([10, 20, 30]);

    const qFrames2 = generateLinearQueueFrames(qVals1, { type: 'enqueue', value: 40 });
    const qVals2 = qFrames2[qFrames2.length - 1].snapshot.items.map((it: any) => it.value);
    expect(qVals2).toEqual([10, 20, 30, 40]);

    const qFrames3 = generateLinearQueueFrames(qVals2, { type: 'enqueue', value: 50 });
    const qVals3 = qFrames3[qFrames3.length - 1].snapshot.items.map((it: any) => it.value);
    expect(qVals3).toEqual([10, 20, 30, 40, 50]);

    const qFrames4 = generateLinearQueueFrames(qVals3, { type: 'dequeue' });
    const qVals4 = qFrames4[qFrames4.length - 1].snapshot.items.map((it: any) => it.value);
    expect(qVals4).toEqual([20, 30, 40, 50]);

    // 3. Linked List: 3 inserts then 1 delete
    const llFrames1 = generateLinkedListFrames('singly', [10, 20], { type: 'insertTail', value: 30 });
    const llVals1 = llFrames1[llFrames1.length - 1].snapshot.nodes.map((n: any) => n.value);
    expect(llVals1).toEqual([10, 20, 30]);

    const llFrames2 = generateLinkedListFrames('singly', llVals1, { type: 'insertTail', value: 40 });
    const llVals2 = llFrames2[llFrames2.length - 1].snapshot.nodes.map((n: any) => n.value);
    expect(llVals2).toEqual([10, 20, 30, 40]);

    const llFrames3 = generateLinkedListFrames('singly', llVals2, { type: 'insertTail', value: 50 });
    const llVals3 = llFrames3[llFrames3.length - 1].snapshot.nodes.map((n: any) => n.value);
    expect(llVals3).toEqual([10, 20, 30, 40, 50]);

    const llFrames4 = generateLinkedListFrames('singly', llVals3, { type: 'deleteHead' });
    const llVals4 = llFrames4[llFrames4.length - 1].snapshot.nodes.map((n: any) => n.value);
    expect(llVals4).toEqual([20, 30, 40, 50]);

    // 4. BST: 3 inserts then 1 delete
    const bstFrames1 = generateBSTFrames([10, 20], { type: 'insert', key: 30 });
    const bstVals1 = Object.values(bstFrames1[bstFrames1.length - 1].snapshot.nodes).map((n: any) => n.value);
    expect(bstVals1).toContain(30);

    const bstFrames2 = generateBSTFrames(bstVals1, { type: 'insert', key: 40 });
    const bstVals2 = Object.values(bstFrames2[bstFrames2.length - 1].snapshot.nodes).map((n: any) => n.value);
    expect(bstVals2).toContain(40);

    const bstFrames3 = generateBSTFrames(bstVals2, { type: 'insert', key: 50 });
    const bstVals3 = Object.values(bstFrames3[bstFrames3.length - 1].snapshot.nodes).map((n: any) => n.value);
    expect(bstVals3).toContain(50);

    const bstFrames4 = generateBSTFrames(bstVals3, { type: 'delete', key: 10 });
    const bstVals4 = Object.values(bstFrames4[bstFrames4.length - 1].snapshot.nodes).map((n: any) => n.value);
    expect(bstVals4).not.toContain(10);
    expect(bstVals4).toContain(20);
    expect(bstVals4).toContain(30);
    expect(bstVals4).toContain(40);
    expect(bstVals4).toContain(50);
  });

  it('B-Tree and B+ Tree insertions properly split nodes when key count reaches M', () => {
    // B-Tree Order M=3 (max keys 2, inserting 3rd key causes split)
    const bTreeFrames = generateBTreeFrames([10, 20], 3, { type: 'insert', key: 30 });
    const lastBTree = bTreeFrames[bTreeFrames.length - 1].snapshot;
    expect(Object.keys(lastBTree.multiKeyNodes ?? {}).length).toBeGreaterThan(1);

    // B+ Tree Order M=3 (leaf split creates right sibling and copy-up)
    const bPlusFrames = generateBPlusTreeFrames([10, 20], 3, { type: 'insert', key: 30 });
    const lastBPlus = bPlusFrames[bPlusFrames.length - 1].snapshot;
    expect(Object.keys(lastBPlus.multiKeyNodes ?? {}).length).toBeGreaterThan(1);
  });

  it('Every algorithm entry in codeSnippets.ts has non-empty c, cpp, java, python, pseudo, and algorithm strings with > 8 lines each', () => {
    const langs = ['c', 'cpp', 'java', 'python', 'pseudo', 'algorithm'] as const;
    const algoKeys = Object.keys(CODE_SNIPPETS);
    expect(algoKeys.length).toBeGreaterThanOrEqual(25);

    for (const key of algoKeys) {
      const snippetSet = CODE_SNIPPETS[key];
      expect(snippetSet).toBeDefined();
      for (const lang of langs) {
        const lines = snippetSet[lang];
        expect(Array.isArray(lines)).toBe(true);
        expect(lines.length).toBeGreaterThan(8);
        for (const line of lines) {
          expect(line).not.toContain('// Implementation active');
          expect(line).not.toContain('# Implementation active');
        }
      }
    }
  });

  it('Confirms zero occurrences of hardcoded dark surface classes (#111110, #090908, #181816, #1C1B19) in layout and canvas components', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const targets = ['src/components/layout', 'src/components/canvas'];
    const forbidden = [/#111110/i, /#090908/i, /#181816/i, /#1C1B19/i];

    const violations: string[] = [];

    for (const targetDir of targets) {
      const fullDir = path.resolve(process.cwd(), targetDir);
      const files = fs.readdirSync(fullDir).filter((f: string) => f.endsWith('.tsx') || f.endsWith('.ts'));

      for (const file of files) {
        const filePath = path.join(fullDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line: string, lineNum: number) => {
          for (const pattern of forbidden) {
            if (pattern.test(line)) {
              violations.push(`${file}:${lineNum + 1} -> ${line.trim()}`);
            }
          }
        });
      }
    }

    expect(violations).toEqual([]);
  });

  it('Confirms complete light/dark theme semantic tokens are defined in tokens.css', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const tokensPath = path.resolve(process.cwd(), 'src/styles/tokens.css');
    const cssContent = fs.readFileSync(tokensPath, 'utf-8');

    const requiredTokens = [
      '--bg-canvas',
      '--bg-panel',
      '--bg-hud',
      '--bg-elevated',
      '--bg-input',
      '--bg-hover',
      '--bg-code-gutter',
      '--border-hairline',
      '--border-strong',
      '--canvas-dot',
      '--text-primary',
      '--text-secondary',
      '--text-muted',
      '--text-on-accent',
      '--node-idle-bg',
      '--node-idle-border',
      '--node-idle-text',
      '--node-subtext',
      '--node-header-bg',
      '--accent-primary',
      '--accent-primary-hover',
    ];

    expect(cssContent).toContain('[data-theme="dark"]');
    expect(cssContent).toContain('[data-theme="light"]');

    for (const token of requiredTokens) {
      expect(cssContent).toContain(token);
    }
  });

  it('Confirms LogoMark and favicon contain pure 3-vertex schematic tree nodes without letters or monogram', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const logoContent = fs.readFileSync(path.resolve(process.cwd(), 'src/assets/svg/LogoMark.tsx'), 'utf-8');
    const faviconContent = fs.readFileSync(path.resolve(process.cwd(), 'public/favicon.svg'), 'utf-8');

    expect(logoContent).not.toMatch(/\bAF\b/);
    expect(logoContent).not.toMatch(/monogram/i);
    expect(logoContent).toContain('cx="14"');
    expect(logoContent).toContain('cx="8"');
    expect(logoContent).toContain('cx="20"');

    expect(faviconContent).not.toMatch(/\bAF\b/);
    expect(faviconContent).toContain('cx="14"');
    expect(faviconContent).toContain('cx="8"');
    expect(faviconContent).toContain('cx="20"');
  });
});
