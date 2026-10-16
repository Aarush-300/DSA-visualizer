import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { ALGORITHM_CATALOG } from '../../data/algorithmCatalog';
import { parseIntegerList, generateRandomDataset } from '../../utils/inputValidator';
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
      const valResult = parseIntegerList(customInput);
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
    const target = { row: 7, col: 30 };
    const algoType =
      activeAlgo === 'aStarGrid'
        ? 'aStar'
        : activeAlgo === 'bfsGrid'
        ? 'bfs'
        : activeAlgo === 'dfsGrid'
        ? 'dfs'
        : 'dijkstra';
    const frames = generatePathfindingFrames(mazeGrid, algoType, start, target);
    setFrames(frames);
  };

  const handleClearWalls = () => {
    const cleanGrid = createInitialGrid();
    const start = { row: 7, col: 5 };
    const target = { row: 7, col: 30 };
    const algoType =
      activeAlgo === 'aStarGrid'
        ? 'aStar'
        : activeAlgo === 'bfsGrid'
        ? 'bfs'
        : activeAlgo === 'dfsGrid'
        ? 'dfs'
        : 'dijkstra';
    const frames = generatePathfindingFrames(cleanGrid, algoType, start, target);
    setFrames(frames);
  };

  const moduleAlgos = Object.values(ALGORITHM_CATALOG).filter(
    (a) => a.module === activeModule
  );

  const isNetworkGraph =
    activeAlgo === 'networkPrim' ||
    activeAlgo === 'networkDijkstra' ||
    activeAlgo === 'networkBfs';

  if (isLeftDockCollapsed) {
    return (
      <div className="h-full border-r border-[#262522] bg-[#111110] flex flex-col items-center py-4 px-1.5 z-20 shrink-0">
        <button
          onClick={toggleLeftDock}
          title="Expand Control Dock"
          className="p-1.5 hover:bg-[#181816] text-[#9E9B93] hover:text-[#F3F2EE] border border-transparent hover:border-[#3B3935]"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-80 h-full border-r border-[#262522] bg-[#111110] flex flex-col justify-between p-4 z-20 overflow-y-auto shrink-0 select-none">
      <div className="space-y-4">
        {/* Dock Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#262522]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FF4F00]" />
            <span className="font-display text-[11px] uppercase tracking-[0.08em] text-[#9E9B93] font-bold">
              CONTROL UNIT // CONFIG
            </span>
          </div>
          <button
            onClick={toggleLeftDock}
            title="Collapse Dock"
            className="p-1 text-[#9E9B93] hover:text-[#F3F2EE] hover:bg-[#181816]"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        {/* Algorithm Selectors */}
        <div>
          <label className="block text-[10px] font-mono font-semibold text-[#5C5952] uppercase tracking-wider mb-2">
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
                      ? 'border-[#3B3935] text-[#F3F2EE] font-semibold'
                      : 'border-transparent text-[#9E9B93] hover:bg-[#181816] hover:text-[#F3F2EE]'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-algo-card"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="absolute inset-0 bg-[#181816] border-l-2 border-l-[#FF4F00] -z-0"
                    />
                  )}
                  <span className="relative z-10 font-sans tracking-tight truncate">{algo.name}</span>
                  <span className="relative z-10 font-mono text-[10px] text-[#5C5952] shrink-0">
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
              <label className="text-[10px] font-mono font-semibold text-[#5C5952] uppercase tracking-wider">
                INITIAL DATASET [ARRAY]
              </label>
              <span className="font-mono text-[9px] text-[#5C5952]">1–999 INT</span>
            </div>
            <textarea
              rows={2}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. 64, 34, 25, 12, 22, 11, 90"
              className="w-full px-2.5 py-2 text-xs font-mono bg-[#090908] border border-[#262522] focus:border-[#FF4F00] text-[#F3F2EE] focus:outline-none resize-none leading-relaxed"
            />
            {inputError && (
              <p className="text-[11px] font-mono text-[#FF4F00] mt-1 leading-snug">
                {inputError}
              </p>
            )}
          </div>
        )}

        {/* ---------------- UNIVERSAL INSERTION & DELETION CONTROLS ---------------- */}

        {/* 1. SORTING & SEARCH MODULE CONTROLS */}
        {activeModule === 'sorting' && (
          <div className="p-3 bg-[#181816] border border-[#262522] space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-[#9E9B93] font-semibold block">
              ARRAY DATASET MUTATIONS
            </span>

            <HardwareNumberInput
              value={operandVal}
              onChange={setOperandVal}
              min={1}
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
              <div className="pt-2 border-t border-[#262522] space-y-1.5">
                <HardwareNumberInput
                  value={targetValue}
                  onChange={setTargetValue}
                  min={1}
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
          <div className="p-3 bg-[#181816] border border-[#262522] space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-[#9E9B93] font-semibold block">
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
                    <Plus size={11} className="text-[#FF4F00]" /> PUSH TOP
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
                    <Plus size={11} className="text-[#FF4F00]" /> ENQUEUE
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
                  <Plus size={11} className="text-[#FF4F00]" /> RING ENQUEUE
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
                  <Plus size={11} className="text-[#FF4F00]" /> ENQUEUE HEAP
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
                  <Plus size={11} className="text-[#FF4F00]" /> INS REAR
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
          <div className="p-3 bg-[#181816] border border-[#262522] space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-[#9E9B93] font-semibold block">
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
                <Plus size={11} className="text-[#FF4F00]" /> INS TAIL
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

            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#262522]">
              <button
                onClick={() => executeOperation({ type: 'reverse' })}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-[11px]"
              >
                <RotateCw size={11} className="text-[#FF4F00]" /> REVERSE
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
          <div className="p-3 bg-[#181816] border border-[#262522] space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-[#9E9B93] font-semibold block">
              TREE KEY BALANCING
            </span>

            {(activeAlgo === 'mWay' || activeAlgo === 'bTree' || activeAlgo === 'bPlusTree' || activeAlgo === 'mway' || activeAlgo === 'btree' || activeAlgo === 'bplus') && (
              <div className="flex items-center justify-between border-b border-[#262522] pb-2">
                <span className="text-[10px] font-mono text-[#9E9B93]">ORDER (M):</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTreeOrder(3)}
                    className={`px-2 py-0.5 text-[10px] font-mono border ${treeOrder === 3 ? 'bg-[#FF4F00] text-[#090908] border-[#FF4F00] font-bold' : 'border-[#262522] text-[#9E9B93] hover:text-[#F3F2EE]'}`}
                  >
                    M = 3
                  </button>
                  <button
                    onClick={() => setTreeOrder(4)}
                    className={`px-2 py-0.5 text-[10px] font-mono border ${treeOrder === 4 ? 'bg-[#FF4F00] text-[#090908] border-[#FF4F00] font-bold' : 'border-[#262522] text-[#9E9B93] hover:text-[#F3F2EE]'}`}
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
          <div className="p-3 bg-[#181816] border border-[#262522] space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-[#9E9B93] font-semibold block">
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
                    <Plus size={11} className="text-[#FF4F00]" /> + EDGE
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
                  <Play size={11} fill="#090908" /> RUN PRIM MST
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={handleGenerateMaze}
                  className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-2 text-xs"
                >
                  <Cpu size={13} className="text-[#FF4F00]" /> GENERATE MAZE
                </button>
                <button
                  onClick={handleClearWalls}
                  className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs text-[#9E9B93]"
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
            <Play size={13} fill="#090908" />
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
      <div className="pt-3 border-t border-[#262522] text-[10px] font-mono text-[#5C5952] flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
          HARDWARE DMA READY
        </span>
        <span>LATENCY: &lt;16ms</span>
      </div>
    </aside>
  );
};
