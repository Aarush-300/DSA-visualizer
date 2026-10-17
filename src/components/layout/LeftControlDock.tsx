import React, { useState } from 'react';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { validateModuleInput, generateRandomDataset } from '../../utils/inputValidator';
import {
  generatePathfindingFrames,
  generateRecursiveMaze,
  createInitialGrid,
} from '../../engines/graphs/pathfindingGrid';
import {
  Sliders,
  ChevronLeft,
  Shuffle,
  CornerDownLeft,
  Plus,
  Minus,
  Grid,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export const LeftControlDock: React.FC = () => {
  const {
    activeModule,
    activeAlgo,
    customInput,
    setCustomInput,
    inputError,
    setInputError,
    recompileCurrent,
    executeOperation,
    setFrames,
    setStepIndex,
    isLeftDockCollapsed,
    toggleLeftDock,
  } = usePlaygroundStore();

  const [operandVal, setOperandVal] = useState<number>(42);

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
      activeModule === 'sorting' ? 12 : 6,
      10,
      95
    );
    const joined = randomData.join(', ');
    setCustomInput(joined);
    handleCompile(joined);
  };

  const handleUniversalInsert = () => {
    if (activeModule === 'sorting') {
      const validation = validateModuleInput('sorting', customInput);
      const currentValues = validation.isValid ? validation.values : [64, 34, 25, 12, 22, 11, 90];
      if (currentValues.length >= 20) return;
      const nextArr = [...currentValues, operandVal];
      const joined = nextArr.join(', ');
      setCustomInput(joined);
      recompileCurrent(activeAlgo, joined, { type: 'insert', value: operandVal });
    } else if (activeModule === 'stacksQueues') {
      if (activeAlgo === 'stack') {
        executeOperation({ type: 'push', value: operandVal });
      } else if (activeAlgo === 'priorityQueue') {
        executeOperation({ type: 'enqueue', value: operandVal, priority: operandVal });
      } else if (activeAlgo === 'deque') {
        executeOperation({ type: 'insertRear', value: operandVal });
      } else {
        executeOperation({ type: 'enqueue', value: operandVal });
      }
    } else if (activeModule === 'linkedList') {
      executeOperation({ type: 'insertTail', value: operandVal });
    } else if (activeModule === 'trees') {
      executeOperation({ type: 'insert', key: operandVal });
    }
  };

  const handleUniversalDelete = () => {
    if (activeModule === 'sorting') {
      const validation = validateModuleInput('sorting', customInput);
      const currentValues = validation.isValid ? validation.values : [64, 34, 25, 12, 22, 11, 90];
      if (currentValues.length <= 2) return;
      const nextArr = currentValues.slice(0, -1);
      const joined = nextArr.join(', ');
      setCustomInput(joined);
      recompileCurrent(activeAlgo, joined, { type: 'delete' });
    } else if (activeModule === 'stacksQueues') {
      if (activeAlgo === 'stack') {
        executeOperation({ type: 'pop' });
      } else if (activeAlgo === 'priorityQueue') {
        executeOperation({ type: 'extract' });
      } else if (activeAlgo === 'deque') {
        executeOperation({ type: 'deleteFront' });
      } else {
        executeOperation({ type: 'dequeue' });
      }
    } else if (activeModule === 'linkedList') {
      executeOperation({ type: 'deleteTail' });
    } else if (activeModule === 'trees') {
      executeOperation({ type: 'delete', key: operandVal });
    }
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

  // Collapsed Tiny 36px Floating Button
  if (isLeftDockCollapsed) {
    return (
      <button
        onClick={toggleLeftDock}
        title="Open Workbench"
        aria-label="Open Workbench"
        className="fixed top-20 left-4 z-20 w-9 h-9 rounded-xl bg-[var(--bg-island)] border border-[var(--border-island)] shadow-[var(--shadow-island)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer backdrop-blur-md pointer-events-auto"
      >
        <Sliders size={16} />
      </button>
    );
  }

  return (
    <aside className="fixed top-20 left-4 z-20 w-[260px] rounded-xl bg-[var(--bg-island)] border border-[var(--border-island)] shadow-[var(--shadow-island)] p-3.5 backdrop-blur-md select-none pointer-events-auto flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[var(--border-subtle)]">
        <span className="font-sans text-xs font-semibold text-[var(--text-primary)]">
          Workbench
        </span>
        <button
          onClick={toggleLeftDock}
          title="Collapse Workbench"
          className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Dataset Input with Inline Actions */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-sans font-medium text-[var(--text-secondary)]">
          Dataset
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              setInputError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCompile();
            }}
            placeholder="e.g. 64, 34, 25, 12..."
            className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg pl-2.5 pr-14 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)] transition-colors shadow-2xs"
          />
          <div className="absolute right-1 flex items-center gap-0.5">
            <button
              onClick={handleRandomize}
              title="Shuffle Dataset (R)"
              aria-label="Shuffle Dataset"
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            >
              <Shuffle size={12} />
            </button>
            <button
              onClick={() => handleCompile()}
              title="Apply Dataset (Enter)"
              aria-label="Apply Dataset"
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent-brand)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            >
              <CornerDownLeft size={12} />
            </button>
          </div>
        </div>

        {inputError && (
          <div className="flex items-start gap-1 text-[10px] text-rose-500 font-sans leading-tight pt-0.5">
            <AlertCircle size={11} className="shrink-0 mt-0.5" />
            <span>{inputError}</span>
          </div>
        )}
      </div>

      {/* Quick Mutate Row: [ Value: 42 ] + Insert + Delete */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-sans font-medium text-[var(--text-secondary)]">
          Mutate
        </label>
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              type="number"
              value={operandVal}
              onChange={(e) => setOperandVal(Number(e.target.value))}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-2 py-1 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-brand)] text-center transition-colors shadow-2xs"
            />
          </div>

          <button
            onClick={handleUniversalInsert}
            title="Insert element"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--text-on-accent)] text-xs font-sans font-medium shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus size={12} />
            <span>Insert</span>
          </button>

          <button
            onClick={handleUniversalDelete}
            title="Delete element"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-island)] text-[var(--text-primary)] text-xs font-sans font-medium shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Minus size={12} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Grid Pathfinding Specific Controls */}
      {activeModule === 'graphs' && (
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center gap-1.5">
          <button
            onClick={handleGenerateMaze}
            className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-island)] text-[var(--text-primary)] text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            <Grid size={12} />
            <span>Maze</span>
          </button>
          <button
            onClick={handleClearWalls}
            className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-island)] text-[var(--text-muted)] hover:text-rose-500 transition-colors cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      )}
    </aside>
  );
};
