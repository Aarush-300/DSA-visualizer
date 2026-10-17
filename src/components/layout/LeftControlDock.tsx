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
  Sparkles,
  Trash2,
  Search,
  RotateCw,
  Eye,
  AlertTriangle,
  Sliders,
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
    setStepIndex,
    isLeftDockCollapsed,
    toggleLeftDock,
  } = usePlaygroundStore();

  const [operandVal, setOperandVal] = useState<number>(42);
  const [operandIndex, setOperandIndex] = useState<number>(0);
  const [operandPriority, setOperandPriority] = useState<number>(10);
  const [treeOrder, setTreeOrder] = useState<number>(3);

  const moduleAlgos = Object.values(ALGORITHM_CATALOG).filter(
    (algo) => algo.module === activeModule
  );

  const handleCompile = (overrideInput?: string) => {
    const inputToUse = overrideInput !== undefined ? overrideInput : customInput;
    const validation = validateModuleInput(activeModule, inputToUse);

    if (!validation.isValid) {
      setInputError(validation.error || 'Invalid dataset input syntax');
      return;
    }

    setInputError(null);
    recompileCurrent(activeAlgo, inputToUse);
  };

  const handleRandomize = () => {
    const randomData = generateRandomDataset(
      activeModule === 'sorting' ? 14 : 7,
      10,
      95
    );
    const joined = randomData.join(', ');
    setCustomInput(joined);
    handleCompile(joined);
  };

  const handleClearWalls = () => {
    const freshGrid = createInitialGrid();
    const frames = generatePathfindingFrames(
      freshGrid,
      activeAlgo === 'aStarGrid' ? 'aStar' : activeAlgo === 'bfsGrid' ? 'bfs' : activeAlgo === 'dfsGrid' ? 'dfs' : 'dijkstra',
      { row: 7, col: 5 },
      { row: 7, col: 30 }
    );
    setFrames(frames);
    setStepIndex(0);
  };

  const handleGenerateMaze = () => {
    const maze = generateRecursiveMaze();
    const frames = generatePathfindingFrames(
      maze,
      activeAlgo === 'aStarGrid' ? 'aStar' : activeAlgo === 'bfsGrid' ? 'bfs' : activeAlgo === 'dfsGrid' ? 'dfs' : 'dijkstra',
      { row: 7, col: 5 },
      { row: 7, col: 30 }
    );
    setFrames(frames);
    setStepIndex(0);
  };

  const handleArrayInsert = () => {
    const validation = validateModuleInput('sorting', customInput);
    const currentValues = validation.isValid ? validation.values : [64, 34, 25, 12, 22, 11, 90];
    if (currentValues.length >= 20) return;
    const nextArr = [...currentValues, operandVal];
    const joined = nextArr.join(', ');
    setCustomInput(joined);
    recompileCurrent(activeAlgo, joined, { type: 'insert', value: operandVal });
  };

  const handleArrayDelete = () => {
    const validation = validateModuleInput('sorting', customInput);
    const currentValues = validation.isValid ? validation.values : [64, 34, 25, 12, 22, 11, 90];
    if (currentValues.length <= 2) return;
    const nextArr = currentValues.slice(0, -1);
    const joined = nextArr.join(', ');
    setCustomInput(joined);
    recompileCurrent(activeAlgo, joined, { type: 'delete' });
  };

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
          title="Expand sidebar"
          aria-label="Expand sidebar"
          className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
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
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-[var(--accent-primary)]" />
            <span className="font-sans text-xs font-semibold text-[var(--text-primary)] tracking-tight">
              Configuration
            </span>
          </div>
          <button
            onClick={toggleLeftDock}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        {/* Algorithm Selectors */}
        <div>
          <label className="block text-xs font-sans font-medium text-[var(--text-muted)] mb-2">
            Algorithm
          </label>
          <div className="space-y-1">
            {moduleAlgos.map((algo) => {
              const isSelected = activeAlgo === algo.id;
              return (
                <button
                  key={algo.id}
                  onClick={() => setActiveAlgo(algo.id)}
                  className={`relative w-full text-left px-3 py-2 text-xs font-sans rounded-md transition-colors duration-150 flex items-center justify-between cursor-pointer border ${
                    isSelected
                      ? 'border-[var(--border-strong)] text-[var(--text-primary)] font-semibold bg-[var(--bg-elevated)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-algo-indicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="absolute left-0 top-1 bottom-1 w-1 bg-[var(--accent-primary)] rounded-full -z-0"
                    />
                  )}
                  <span className="relative z-10 font-sans tracking-tight truncate pl-1">{algo.name}</span>
                  <span className="relative z-10 text-[10px] text-[var(--text-muted)] shrink-0 font-mono">
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
              <label className="text-xs font-sans font-medium text-[var(--text-muted)]">
                Dataset
              </label>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">-999 to 999</span>
            </div>
            <textarea
              rows={2}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. 64, 34, 25, 12, 22, 11, 90"
              className={`w-full px-2.5 py-2 text-xs font-mono bg-[var(--bg-input)] border rounded-md text-[var(--text-primary)] focus:outline-none resize-none leading-relaxed transition-colors ${
                inputError
                  ? 'border-rose-500 bg-rose-500/5'
                  : 'border-[var(--border-hairline)] hover:border-[var(--border-strong)] focus:border-[var(--accent-primary)]'
              }`}
            />
            {inputError && (
              <div className="mt-1.5 p-2 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-sans text-xs rounded-md flex items-start gap-1.5 leading-snug">
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                <span>{inputError}</span>
              </div>
            )}
          </div>
        )}

        {/* ---------------- UNIVERSAL INSERTION & DELETION CONTROLS ---------------- */}

        {/* 1. SORTING & SEARCH MODULE CONTROLS */}
        {activeModule === 'sorting' && (
          <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg space-y-2.5">
            <span className="text-xs font-sans font-medium text-[var(--text-secondary)] block">
              Operations
            </span>

            <HardwareNumberInput
              value={operandVal}
              onChange={setOperandVal}
              min={-999}
              max={999}
              label="Element Value"
            />

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={handleArrayInsert}
                className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
              >
                <Plus size={12} className="text-emerald-500" /> Insert
              </button>
              <button
                onClick={handleArrayDelete}
                className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
              >
                <Minus size={12} className="text-rose-500" /> Delete
              </button>
            </div>

            {(activeAlgo === 'linearSearch' || activeAlgo === 'binarySearch') && (
              <div className="pt-2 border-t border-[var(--border-hairline)] space-y-1.5">
                <HardwareNumberInput
                  value={targetValue}
                  onChange={setTargetValue}
                  min={-999}
                  max={999}
                  label="Search Target"
                />
                <button
                  onClick={() => recompileCurrent(activeAlgo, customInput)}
                  className="w-full btn-hardware-primary flex items-center justify-center gap-1.5 py-2 text-xs cursor-pointer"
                >
                  <Search size={12} /> Search Target
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. STACKS & QUEUES CONTROLS */}
        {activeModule === 'stacksQueues' && (
          <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg space-y-2.5">
            <span className="text-xs font-sans font-medium text-[var(--text-secondary)] block">
              Operations
            </span>

            <HardwareNumberInput
              value={operandVal}
              onChange={setOperandVal}
              min={1}
              max={999}
              label="Operand Value"
            />

            {activeAlgo === 'priorityQueue' && (
              <HardwareNumberInput
                value={operandPriority}
                onChange={setOperandPriority}
                min={1}
                max={99}
                label="Heap Priority (1–99)"
              />
            )}

            {/* Structure-specific Action Buttons */}
            {activeAlgo === 'stack' && (
              <div className="space-y-1.5 pt-1">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => executeOperation({ type: 'push', value: operandVal })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                  >
                    <Plus size={12} className="text-[var(--accent-primary)]" /> Push
                  </button>
                  <button
                    onClick={() => executeOperation({ type: 'pop' })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                  >
                    <Minus size={12} className="text-rose-500" /> Pop
                  </button>
                </div>
                <button
                  onClick={() => executeOperation({ type: 'peek' })}
                  className="w-full btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                >
                  <Eye size={12} /> Peek Top
                </button>
              </div>
            )}

            {activeAlgo === 'linearQueue' && (
              <div className="space-y-1.5 pt-1">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => executeOperation({ type: 'enqueue', value: operandVal })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                  >
                    <Plus size={12} className="text-[var(--accent-primary)]" /> Enqueue
                  </button>
                  <button
                    onClick={() => executeOperation({ type: 'dequeue' })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                  >
                    <Minus size={12} className="text-rose-500" /> Dequeue
                  </button>
                </div>
                <button
                  onClick={() => executeOperation({ type: 'peek' })}
                  className="w-full btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                >
                  <Eye size={12} /> Peek Front
                </button>
              </div>
            )}

            {activeAlgo === 'circularQueue' && (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => executeOperation({ type: 'enqueue', value: operandVal })}
                  className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                >
                  <Plus size={12} className="text-[var(--accent-primary)]" /> Enqueue
                </button>
                <button
                  onClick={() => executeOperation({ type: 'dequeue' })}
                  className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                >
                  <Minus size={12} className="text-rose-500" /> Dequeue
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
                  className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                >
                  <Plus size={12} className="text-[var(--accent-primary)]" /> Enqueue
                </button>
                <button
                  onClick={() => executeOperation({ type: 'extract' })}
                  className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                >
                  <Minus size={12} className="text-rose-500" /> Extract Max
                </button>
              </div>
            )}

            {activeAlgo === 'deque' && (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => executeOperation({ type: 'insertFront', value: operandVal })}
                  className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                >
                  <Plus size={12} className="text-emerald-500" /> Insert Front
                </button>
                <button
                  onClick={() => executeOperation({ type: 'insertRear', value: operandVal })}
                  className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                >
                  <Plus size={12} className="text-[var(--accent-primary)]" /> Insert Rear
                </button>
                <button
                  onClick={() => executeOperation({ type: 'deleteFront' })}
                  className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                >
                  <Minus size={12} className="text-rose-500" /> Delete Front
                </button>
                <button
                  onClick={() => executeOperation({ type: 'deleteRear' })}
                  className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                >
                  <Minus size={12} className="text-rose-500" /> Delete Rear
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. LINKED LISTS CONTROLS */}
        {activeModule === 'linkedList' && (
          <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg space-y-2.5">
            <span className="text-xs font-sans font-medium text-[var(--text-secondary)] block">
              Operations
            </span>

            <HardwareNumberInput
              value={operandVal}
              onChange={setOperandVal}
              min={1}
              max={999}
              label="Node Value"
            />

            <HardwareNumberInput
              value={operandIndex}
              onChange={setOperandIndex}
              min={0}
              max={15}
              label="Target Index"
            />

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => executeOperation({ type: 'insertHead', value: operandVal })}
                className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
              >
                <Plus size={12} className="text-emerald-500" /> Insert Head
              </button>
              <button
                onClick={() => executeOperation({ type: 'insertTail', value: operandVal })}
                className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
              >
                <Plus size={12} className="text-[var(--accent-primary)]" /> Insert Tail
              </button>
              <button
                onClick={() =>
                  executeOperation({
                    type: 'insertIndex',
                    value: operandVal,
                    index: operandIndex,
                  })
                }
                className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
              >
                <Plus size={12} /> Insert at Index
              </button>
              <button
                onClick={() => executeOperation({ type: 'deleteHead' })}
                className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
              >
                <Minus size={12} className="text-rose-500" /> Delete Head
              </button>
              <button
                onClick={() => executeOperation({ type: 'deleteTail' })}
                className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
              >
                <Minus size={12} className="text-rose-500" /> Delete Tail
              </button>
              <button
                onClick={() => executeOperation({ type: 'deleteIndex', index: operandIndex })}
                className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
              >
                <Minus size={12} className="text-rose-500" /> Delete at Index
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[var(--border-hairline)]">
              <button
                onClick={() => executeOperation({ type: 'reverse' })}
                className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
              >
                <RotateCw size={12} className="text-[var(--accent-primary)]" /> Reverse List
              </button>
              <button
                onClick={() => executeOperation({ type: 'search', value: operandVal })}
                className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
              >
                <Search size={12} /> Search Value
              </button>
            </div>
          </div>
        )}

        {/* 4. TREES CONTROLS */}
        {activeModule === 'trees' && (
          <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg space-y-2.5">
            <span className="text-xs font-sans font-medium text-[var(--text-secondary)] block">
              Operations
            </span>

            {(activeAlgo === 'mWay' || activeAlgo === 'bTree' || activeAlgo === 'bPlusTree' || activeAlgo === 'mway' || activeAlgo === 'btree' || activeAlgo === 'bplus') && (
              <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-2">
                <span className="text-xs font-sans text-[var(--text-secondary)] font-medium">Order (M):</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTreeOrder(3)}
                    className={`px-2.5 py-1 text-xs font-sans rounded-md border transition-colors cursor-pointer ${
                      treeOrder === 3
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] font-medium'
                        : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    M = 3
                  </button>
                  <button
                    onClick={() => setTreeOrder(4)}
                    className={`px-2.5 py-1 text-xs font-sans rounded-md border transition-colors cursor-pointer ${
                      treeOrder === 4
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] font-medium'
                        : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }`}
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
              label="Key Value"
            />

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={() => executeOperation({ type: 'insert', key: operandVal })}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-xs cursor-pointer"
              >
                <Plus size={12} className="text-emerald-500" /> Insert
              </button>
              <button
                onClick={() => executeOperation({ type: 'delete', key: operandVal })}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-xs cursor-pointer"
              >
                <Minus size={12} className="text-rose-500" /> Delete
              </button>
              <button
                onClick={() => executeOperation({ type: 'search', key: operandVal })}
                className="btn-hardware-secondary flex items-center justify-center gap-1 py-1.5 text-xs cursor-pointer"
              >
                <Search size={12} /> Search
              </button>
            </div>
          </div>
        )}

        {/* 5. GRAPHS CONTROLS */}
        {activeModule === 'graphs' && (
          <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg space-y-2.5">
            <span className="text-xs font-sans font-medium text-[var(--text-secondary)] block">
              {isNetworkGraph ? 'Network Operations' : 'Grid Controls'}
            </span>

            {isNetworkGraph ? (
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => executeOperation({ type: 'insertVertex' })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                  >
                    <Plus size={12} className="text-emerald-500" /> Add Vertex
                  </button>
                  <button
                    onClick={() => executeOperation({ type: 'deleteVertex' })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                  >
                    <Minus size={12} className="text-rose-500" /> Delete Vertex
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => executeOperation({ type: 'insertEdge' })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                  >
                    <Plus size={12} className="text-[var(--accent-primary)]" /> Add Edge
                  </button>
                  <button
                    onClick={() => executeOperation({ type: 'deleteEdge' })}
                    className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs cursor-pointer"
                  >
                    <Minus size={12} className="text-rose-500" /> Delete Edge
                  </button>
                </div>
                <button
                  onClick={() => executeOperation({ type: 'mst' })}
                  className="w-full btn-hardware-primary flex items-center justify-center gap-1.5 py-2 text-xs cursor-pointer"
                >
                  <Play size={12} fill="currentColor" /> Run Prim's MST
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={handleGenerateMaze}
                  className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-2 text-xs cursor-pointer"
                >
                  <Sparkles size={13} className="text-[var(--accent-primary)]" /> Generate Maze
                </button>
                <button
                  onClick={handleClearWalls}
                  className="btn-hardware-secondary flex items-center justify-center gap-1.5 py-1.5 text-xs text-[var(--text-secondary)] cursor-pointer"
                >
                  <Trash2 size={13} /> Clear Walls &amp; Weights
                </button>
              </div>
            )}
          </div>
        )}

        {/* Primary Action Button */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => handleCompile()}
            className="w-full btn-hardware-primary flex items-center justify-center gap-2 py-2.5 text-xs cursor-pointer"
          >
            <Play size={13} fill="currentColor" />
            <span>Run Visualization</span>
          </button>

          {activeModule !== 'graphs' && (
            <button
              onClick={handleRandomize}
              className="w-full btn-hardware-secondary flex items-center justify-center gap-2 py-2 text-xs cursor-pointer"
            >
              <Shuffle size={13} />
              <span>Randomize Dataset</span>
            </button>
          )}
        </div>
      </div>

      {/* Dock Footer */}
      <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] text-xs text-[var(--text-muted)] flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Interactive Canvas
        </span>
        <span className="font-mono text-[11px]">60 FPS</span>
      </div>
    </aside>
  );
};
