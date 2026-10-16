import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { ALGORITHM_CATALOG } from '../../data/algorithmCatalog';
import { validateModuleInput, generateRandomDataset } from '../../utils/inputValidator';
import { HardwareNumberInput } from '../shared/HardwareNumberInput';
import {
  generatePathfindingFrames,
  generateRecursiveMaze,
  createInitialGrid,
} from '../../engines/graphs/pathfindingGrid';
import {
  Play,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Cpu,
  Trash2,
  Search,
  RotateCw,
  Eye,
  AlertTriangle,
} from 'lucide-react';

export const LeftControlDock: React.FC = () => {
  const {
    activeModule,
    activeAlgo,
    setActiveAlgo,
    customInput,
    setCustomInput,
    inputError,
    setInputError,
    recompileCurrent,
    executeOperation,
    targetValue,
    setTargetValue,
    setFrames,
    isLeftDockCollapsed,
    toggleLeftDock,
    treeOrder,
    setTreeOrder,
  } = usePlaygroundStore();

  const [operandVal, setOperandVal] = useState<number>(42);
  const [operandIndex, setOperandIndex] = useState<number>(1);
  const [operandPriority, setOperandPriority] = useState<number>(75);

  const handleCompile = (forcedAlgo?: string) => {
    if (activeModule !== 'graphs') {
      const valResult = validateModuleInput(activeModule, customInput);
      if (!valResult.isValid) {
        setInputError(valResult.error ?? 'Invalid input sequence');
        return;
      }
    }
    setInputError(null);
    recompileCurrent(forcedAlgo);
  };

  const handleRandomize = () => {
    const randomVals = generateRandomDataset(7, 10, 95);
    const str = randomVals.join(', ');
    setCustomInput(str);
    setInputError(null);
    recompileCurrent(activeAlgo, str);
  };

  const handleArrayInsert = () => {
    executeOperation({ type: 'insert', value: operandVal });
  };

  const handleArrayDelete = () => {
    executeOperation({ type: 'delete' });
  };

  const handleGenerateMaze = () => {
    const mazeGrid = generateRecursiveMaze();
    const start = { row: 7, col: 5 };
    const target = { row: 7, col: 23 };
    const frames = generatePathfindingFrames(mazeGrid, activeAlgo as any, start, target);
    setFrames(frames);
  };

  const handleClearWalls = () => {
    const cleanGrid = createInitialGrid();
    const start = { row: 7, col: 5 };
    const target = { row: 7, col: 23 };
    const frames = generatePathfindingFrames(cleanGrid, activeAlgo as any, start, target);
    setFrames(frames);
  };

  const moduleAlgos = Object.values(ALGORITHM_CATALOG).filter(
    (a) => a.module === activeModule
  );

  const isNetworkGraph =
    activeAlgo === 'networkPrim' ||
    activeAlgo === 'networkDijkstra' ||
    activeAlgo === 'networkBfs' ||
    activeAlgo === 'bellmanFord' ||
    activeAlgo === 'topologicalSort';

  if (isLeftDockCollapsed) {
    return (
      <div className="h-full border-r border-[var(--border-hairline)] bg-[var(--bg-panel)] flex flex-col items-center py-4 px-1.5 z-20 shrink-0">
        <button
          onClick={toggleLeftDock}
          title="Expand Control Dock"
          className="p-1.5 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-strong)] transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-80 h-full border-r border-[var(--border-hairline)] bg-[var(--bg-panel)] text-[var(--text-primary)] flex flex-col justify-between p-4 z-20 overflow-y-auto shrink-0 select-none">
      <div className="space-y-4">
        {/* Dock Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--accent-primary)]" />
            <span className="font-display text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)] font-bold">
              CONTROL UNIT // CONFIG
            </span>
          </div>
          <button
            onClick={toggleLeftDock}
            title="Collapse Dock"
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        {/* Algorithm Selectors */}
        <div>
          <label className="block text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            SELECT ALGORITHM
          </label>
          <div className="space-y-1">
            {moduleAlgos.map((algo) => {
              const isSelected = activeAlgo === algo.id;
              return (
                <button
                  key={algo.id}
                  onClick={() => {
                    setActiveAlgo(algo.id);
                  }}
                  className={`relative w-full text-left px-3 py-2 text-xs font-sans transition-colors duration-150 flex items-center justify-between border ${
                    isSelected
                      ? 'border-[var(--border-strong)] text-[var(--text-primary)] font-semibold'
                      : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-algo-card"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="absolute inset-0 bg-[var(--bg-elevated)] border-l-2 border-l-[var(--accent-primary)] -z-0"
                    />
                  )}
                  <span className="relative z-10 font-sans tracking-tight truncate">{algo.name}</span>
                  <span className="relative z-10 font-mono text-[10px] text-[var(--text-muted)] shrink-0">
                    {algo.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Dataset Input (for sorting, stacks/queues, linkedList, trees) */}
        {activeModule !== 'graphs' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                INITIAL DATASET [ARRAY]
              </label>
              <span className="font-mono text-[9px] text-[var(--text-muted)]">-999–999 INT</span>
            </div>
            <textarea
              rows={2}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. 64, 34, 25, 12, 22, 11, 90"
              className={`w-full px-2.5 py-2 text-xs font-mono bg-[var(--bg-input)] border text-[var(--text-primary)] focus:outline-none resize-none leading-relaxed ${
                inputError
                  ? 'border-[#FF4F00] bg-[rgba(255,79,0,0.06)]'
                  : 'border-[var(--border-strong)] focus:border-[var(--accent-primary)]'
              }`}
            />
            {inputError && (
              <div className="mt-1.5 p-2 bg-[rgba(255,79,0,0.12)] border border-[#FF4F00] text-[#FF4F00] font-mono text-[10px] flex items-start gap-1.5 leading-snug">
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                <span>{inputError}</span>
              </div>
            )}
          </div>
        )}

        {/* ---------------- UNIVERSAL INSERTION & DELETION CONTROLS ---------------- */}

        {/* 1. SORTING & SEARCH MODULE CONTROLS */}
        {activeModule === 'sorting' && (
          <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-semibold block">
              ARRAY DATASET MUTATIONS
            </span>

            <HardwareNumberInput
              value={operandVal}
              onChange={setOperandVal}
              min={-999}
              max={999}
              label="ELEMENT VALUE"
            />

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={handleArrayInsert}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
              >
                <Plus size={11} className="text-[#00E676]" /> INSERT
              </button>
              <button
                onClick={handleArrayDelete}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
              >
                <Minus size={11} className="text-[#FF2E93]" /> DELETE
              </button>
            </div>

            {(activeAlgo === 'linearSearch' || activeAlgo === 'binarySearch') && (
              <div className="pt-2 border-t border-[var(--border-hairline)] space-y-1.5">
                <HardwareNumberInput
                  value={targetValue}
                  onChange={setTargetValue}
                  min={-999}
                  max={999}
                  label="SEARCH TARGET"
                />
                <button
                  onClick={() => recompileCurrent(activeAlgo, customInput)}
                  className="w-full btn-hardware-primary flex items-center justify-center gap-1.5 py-2 text-[11px]"
                >
                  <Search size={11} /> RUN SEARCH
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. STACKS & QUEUES CONTROLS */}
        {activeModule === 'stacksQueues' && (
          <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-semibold block">
              HARDWARE BUFFER OPS
            </span>

            <HardwareNumberInput
              value={operandVal}
              onChange={setOperandVal}
              min={1}
              max={999}
              label="OPERAND VALUE"
            />

            {activeAlgo === 'priorityQueue' && (
              <HardwareNumberInput
                value={operandPriority}
                onChange={setOperandPriority}
                min={1}
                max={99}
                label="HEAP PRIORITY (1-99)"
              />
            )}

            {/* Structure-specific Action Buttons */}
            {activeAlgo === 'stack' && (
              <div className="space-y-1.5 pt-1">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => executeOperation({ type: 'push', value: operandVal })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                  >
                    <Plus size={11} className="text-[var(--accent-primary)]" /> PUSH TOP
                  </button>
                  <button
                    onClick={() => executeOperation({ type: 'pop' })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                  >
                    <Minus size={11} className="text-[#FF2E93]" /> POP TOP
                  </button>
                </div>
                <button
                  onClick={() => executeOperation({ type: 'peek' })}
                  className="w-full btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                >
                  <Eye size={11} /> PEEK TOP
                </button>
              </div>
            )}

            {activeAlgo === 'linearQueue' && (
              <div className="space-y-1.5 pt-1">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => executeOperation({ type: 'enqueue', value: operandVal })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                  >
                    <Plus size={11} className="text-[var(--accent-primary)]" /> ENQUEUE
                  </button>
                  <button
                    onClick={() => executeOperation({ type: 'dequeue' })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                  >
                    <Minus size={11} className="text-[#FF2E93]" /> DEQUEUE
                  </button>
                </div>
                <button
                  onClick={() => executeOperation({ type: 'peek' })}
                  className="w-full btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                >
                  <Eye size={11} /> PEEK FRONT
                </button>
              </div>
            )}

            {activeAlgo === 'circularQueue' && (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => executeOperation({ type: 'enqueue', value: operandVal })}
                  className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                >
                  <Plus size={11} className="text-[var(--accent-primary)]" /> RING ENQUEUE
                </button>
                <button
                  onClick={() => executeOperation({ type: 'dequeue' })}
                  className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                >
                  <Minus size={11} className="text-[#FF2E93]" /> RING DEQUEUE
                </button>
              </div>
            )}

            {activeAlgo === 'priorityQueue' && (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() =>
                    executeOperation({
                      type: 'enqueue',
                      value: operandVal,
                      priority: operandPriority,
                    })
                  }
                  className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                >
                  <Plus size={11} className="text-[var(--accent-primary)]" /> ENQUEUE HEAP
                </button>
                <button
                  onClick={() => executeOperation({ type: 'extract' })}
                  className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                >
                  <Minus size={11} className="text-[#FF2E93]" /> EXTRACT MAX
                </button>
              </div>
            )}

            {activeAlgo === 'deque' && (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => executeOperation({ type: 'insertFront', value: operandVal })}
                  className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                >
                  <Plus size={11} className="text-[#00E676]" /> INS FRONT
                </button>
                <button
                  onClick={() => executeOperation({ type: 'insertRear', value: operandVal })}
                  className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                >
                  <Plus size={11} className="text-[var(--accent-primary)]" /> INS REAR
                </button>
                <button
                  onClick={() => executeOperation({ type: 'deleteFront' })}
                  className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                >
                  <Minus size={11} className="text-[#FF2E93]" /> DEL FRONT
                </button>
                <button
                  onClick={() => executeOperation({ type: 'deleteRear' })}
                  className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                >
                  <Minus size={11} className="text-[#FF2E93]" /> DEL REAR
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. LINKED LISTS CONTROLS */}
        {activeModule === 'linkedList' && (
          <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-semibold block">
              POINTER MUTATIONS
            </span>

            <HardwareNumberInput
              value={operandVal}
              onChange={setOperandVal}
              min={1}
              max={999}
              label="NODE VALUE"
            />

            <HardwareNumberInput
              value={operandIndex}
              onChange={setOperandIndex}
              min={0}
              max={15}
              label="TARGET INDEX"
            />

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => executeOperation({ type: 'insertHead', value: operandVal })}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
              >
                <Plus size={11} className="text-[#00E676]" /> INS HEAD
              </button>
              <button
                onClick={() => executeOperation({ type: 'insertTail', value: operandVal })}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
              >
                <Plus size={11} className="text-[var(--accent-primary)]" /> INS TAIL
              </button>
              <button
                onClick={() =>
                  executeOperation({
                    type: 'insertIndex',
                    value: operandVal,
                    index: operandIndex,
                  })
                }
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
              >
                <Plus size={11} /> INS AT IDX
              </button>
              <button
                onClick={() => executeOperation({ type: 'deleteHead' })}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
              >
                <Minus size={11} className="text-[#FF2E93]" /> DEL HEAD
              </button>
              <button
                onClick={() => executeOperation({ type: 'deleteTail' })}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
              >
                <Minus size={11} className="text-[#FF2E93]" /> DEL TAIL
              </button>
              <button
                onClick={() => executeOperation({ type: 'deleteIndex', index: operandIndex })}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
              >
                <Minus size={11} className="text-[#FF2E93]" /> DEL AT IDX
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[var(--border-hairline)]">
              <button
                onClick={() => executeOperation({ type: 'reverse' })}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
              >
                <RotateCw size={11} className="text-[var(--accent-primary)]" /> REVERSE
              </button>
              <button
                onClick={() => executeOperation({ type: 'search', value: operandVal })}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
              >
                <Search size={11} /> SEARCH VAL
              </button>
            </div>
          </div>
        )}

        {/* 4. TREES CONTROLS */}
        {activeModule === 'trees' && (
          <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-semibold block">
              TREE KEY BALANCING
            </span>

            {(activeAlgo === 'mWay' || activeAlgo === 'bTree' || activeAlgo === 'bPlusTree' || activeAlgo === 'mway' || activeAlgo === 'btree' || activeAlgo === 'bplus') && (
              <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-2">
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">ORDER (M):</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTreeOrder(3)}
                    className={`px-2 py-0.5 text-[10px] font-mono border ${treeOrder === 3 ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)] border-[var(--accent-primary)] font-bold' : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
                  >
                    M = 3
                  </button>
                  <button
                    onClick={() => setTreeOrder(4)}
                    className={`px-2 py-0.5 text-[10px] font-mono border ${treeOrder === 4 ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)] border-[var(--accent-primary)] font-bold' : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
                  >
                    M = 4
                  </button>
                </div>
              </div>
            )}

            <HardwareNumberInput
              value={operandVal}
              onChange={setOperandVal}
              min={1}
              max={999}
              label="KEY VALUE"
            />

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={() => executeOperation({ type: 'insert', key: operandVal })}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
              >
                <Plus size={11} className="text-[#00E676]" /> INSERT
              </button>
              <button
                onClick={() => executeOperation({ type: 'delete', key: operandVal })}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
              >
                <Minus size={11} className="text-[#FF2E93]" /> DELETE
              </button>
              <button
                onClick={() => executeOperation({ type: 'search', key: operandVal })}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
              >
                <Search size={11} /> SEARCH
              </button>
            </div>
          </div>
        )}

        {/* 5. GRAPHS CONTROLS */}
        {activeModule === 'graphs' && (
          <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-semibold block">
              {isNetworkGraph ? 'NETWORK TOPOLOGY OPS' : 'GRID TOPOLOGY TOOLS'}
            </span>

            {isNetworkGraph ? (
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => executeOperation({ type: 'insertVertex' })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                  >
                    <Plus size={11} className="text-[#00E676]" /> + VERTEX
                  </button>
                  <button
                    onClick={() => executeOperation({ type: 'deleteVertex' })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                  >
                    <Minus size={11} className="text-[#FF2E93]" /> - VERTEX
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => executeOperation({ type: 'insertEdge' })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                  >
                    <Plus size={11} className="text-[var(--accent-primary)]" /> + EDGE
                  </button>
                  <button
                    onClick={() => executeOperation({ type: 'deleteEdge' })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
                  >
                    <Minus size={11} className="text-[#FF2E93]" /> - EDGE
                  </button>
                </div>
                <button
                  onClick={() => executeOperation({ type: 'mst' })}
                  className="w-full btn-hardware-primary flex items-center justify-center gap-1 py-2 text-[11px]"
                >
                  <Play size={11} fill="currentColor" /> RUN PRIM MST
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={handleGenerateMaze}
                  className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-2 text-xs"
                >
                  <Cpu size={13} className="text-[var(--accent-primary)]" /> GENERATE MAZE
                </button>
                <button
                  onClick={handleClearWalls}
                  className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs text-[var(--text-secondary)]"
                >
                  <Trash2 size={12} /> CLEAR WALLS &amp; WEIGHTS
                </button>
              </div>
            )}
          </div>
        )}

        {/* Primary Action Button */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => handleCompile()}
            className="w-full btn-hardware-primary flex items-center justify-center gap-2 py-3 text-xs"
          >
            <Play size={13} fill="currentColor" />
            <span>COMPILE &amp; RUN [ENTER]</span>
          </button>

          {activeModule !== 'graphs' && (
            <button
              onClick={handleRandomize}
              className="w-full btn-hardware-secondary flex items-center justify-center gap-2 py-2 text-xs"
            >
              <Shuffle size={12} />
              <span>RANDOMIZE DATASET</span>
            </button>
          )}
        </div>
      </div>

      {/* Dock Footer */}
      <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] bg-[var(--bg-hud)] -mx-4 -mb-4 px-4 py-2.5 text-[10px] font-mono text-[var(--text-secondary)] flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
          HARDWARE DMA READY
        </span>
        <span>LATENCY: &lt;16ms</span>
      </div>
    </aside>
  );
};
