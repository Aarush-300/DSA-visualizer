import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { ArrayBarItem, SortingSnapshot } from '../../types/sorting';
import { Check } from 'lucide-react';

export const SortingStage: React.FC = () => {
  const { frames, currentStepIndex, recompileCurrent, activeModule, activeAlgo, runId } = usePlaygroundStore();
  const currentFrame = frames[currentStepIndex];
  const snapshot = currentFrame?.snapshot as SortingSnapshot | undefined;
  const bars: ArrayBarItem[] = snapshot?.bars ?? [];

  // Inline value editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (bars.length === 0) return null;

  const values = bars.map((b) => b.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = maxVal - minVal;
  const maxBarHeight = 250;
  const minBarHeight = 36; // 12% minimum visible height for zero and negative elements
  const pointers = currentFrame?.pointers ?? {};

  const handleStartEdit = (idx: number, currentVal: number) => {
    setEditingIndex(idx);
    setEditValue(String(currentVal));
  };

  const handleSaveEdit = (idx: number) => {
    const val = Number(editValue);
    if (!Number.isNaN(val) && val >= -999 && val <= 999) {
      const currentValues = bars.map(b => b.value);
      currentValues[idx] = val;
      const newStr = currentValues.join(', ');
      recompileCurrent(undefined, newStr);
    }
    setEditingIndex(null);
  };

  const handleDeleteBar = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentValues = bars.map(b => b.value);
    if (currentValues.length <= 2) return;
    currentValues.splice(idx, 1);
    recompileCurrent(undefined, currentValues.join(', '));
  };

  function getBarVisuals(bar: ArrayBarItem, index: number) {
    let bg = 'var(--node-idle-bg)';
    let border = 'var(--node-idle-border)';
    let text = 'var(--node-idle-text)';
    let hatchClass = '';
    let isIdle = true;

    const isMutating = currentFrame?.mutateIds?.includes(bar.id);
    const isActive = currentFrame?.activeIds?.includes(bar.id);
    const isPivot = currentFrame?.pivotIds?.includes(bar.id);
    const isSorted = currentFrame?.sortedIds?.includes(index) || bar.state === 'sorted';

    if (isSorted) {
      bg = 'var(--state-sorted-verified-bg)';
      border = '#059669';
      text = '#059669';
      hatchClass = 'hatch-emerald';
      isIdle = false;
    } else if (isMutating || bar.state === 'swap') {
      bg = 'var(--state-mutate-swap-bg)';
      border = '#EA580C';
      text = '#EA580C';
      hatchClass = 'hatch-vermilion';
      isIdle = false;
    } else if (isPivot || bar.state === 'pivot') {
      bg = 'var(--state-pivot-target-bg)';
      border = '#E11D48';
      text = '#E11D48';
      isIdle = false;
    } else if (isActive || bar.state === 'compare') {
      bg = 'var(--state-active-compare-bg)';
      border = '#F59E0B';
      text = '#F59E0B';
      hatchClass = 'hatch-amber';
      isIdle = false;
    } else if (bar.state === 'visited' || bar.state === 'inspecting') {
      bg = 'var(--state-active-window-bg)';
      border = '#4F46E5';
      text = '#4F46E5';
      isIdle = false;
    }

    return { bg, border, text, hatchClass, isMutating, isIdle };
  }

  // Pointer lane distribution for multi-lane stacking
  function getPointersForIndex(index: number) {
    const list: { label: string; color: string; border: string; bg: string }[] = [];
    if (pointers.pivot === index) {
      list.push({ label: 'pivot', color: '#E11D48', border: '#E11D48', bg: 'rgba(225,29,72,0.12)' });
    }
    if (pointers.i === index) {
      list.push({ label: `i=${index}`, color: '#F59E0B', border: '#F59E0B', bg: 'rgba(245,158,11,0.12)' });
    }
    if (pointers.j === index) {
      list.push({ label: `j=${index}`, color: '#4F46E5', border: '#4F46E5', bg: 'rgba(79,70,229,0.12)' });
    }
    if (pointers.mid === index) {
      list.push({ label: 'mid', color: '#E11D48', border: '#E11D48', bg: 'rgba(225,29,72,0.12)' });
    }
    if (pointers.low === index && pointers.mid !== index) {
      list.push({ label: 'low', color: '#059669', border: '#059669', bg: 'rgba(5,150,105,0.12)' });
    }
    if (pointers.high === index && pointers.mid !== index) {
      list.push({ label: 'high', color: '#EA580C', border: '#EA580C', bg: 'rgba(234,88,12,0.12)' });
    }
    return list;
  }

  return (
    <div className="flex flex-col items-center justify-end w-full max-w-5xl h-[420px] select-none pb-4 px-4">
      {/* Bars Stage Container */}
      <div
        key={`${activeModule}-${activeAlgo}-${runId}`}
        className="flex items-end justify-center gap-2 w-full h-[300px] border-b border-[var(--border-strong)] pb-1 relative"
      >
        {bars.map((bar, index) => {
          const normalized = valRange === 0 ? 0.5 : (bar.value - minVal) / valRange;
          const heightPx = Math.round(minBarHeight + normalized * (maxBarHeight - minBarHeight));
          const vis = getBarVisuals(bar, index);
          const activePointers = getPointersForIndex(index);
          const isEditing = editingIndex === index;

          return (
            <motion.div
              key={bar.id}
              layoutId={`${runId}-bar-${bar.id}`}
              layout
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              animate={vis.isMutating ? { y: [0, -14, 0] } : { y: 0 }}
              className="flex flex-col items-center justify-end relative flex-1 max-w-[54px] min-w-[26px] h-full group"
            >
              {/* Value Cap / Inline Editor */}
              {isEditing ? (
                <div className="mb-1 flex items-center z-30">
                  <input
                    type="number"
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(index);
                      if (e.key === 'Escape') setEditingIndex(null);
                    }}
                    className="w-11 px-1 py-0.5 text-[11px] font-mono bg-[var(--bg-input)] border border-[var(--accent-primary)] text-[var(--text-primary)] text-center focus:outline-none"
                  />
                  <button
                    onClick={() => handleSaveEdit(index)}
                    className="p-0.5 bg-[var(--accent-primary)] text-[var(--text-on-accent)] ml-0.5"
                    title="Save edit"
                  >
                    <Check size={10} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteBar(index, e)}
                    className="p-0.5 bg-[#FF2E93] text-[var(--text-on-accent)] ml-0.5 hover:bg-[var(--accent-primary)]"
                    title="Delete element"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="relative group/btn flex items-center justify-center">
                  <button
                    onClick={() => handleStartEdit(index, bar.value)}
                    title="Click to edit value inline"
                    className="mb-1.5 px-1 py-0.5 text-[11px] font-mono font-semibold tracking-tight text-center hover:text-[var(--accent-primary)] transition-colors"
                    style={{ color: vis.text, fontWeight: 600 }}
                  >
                    {bar.value}
                  </button>
                  <button
                    onClick={(e) => handleDeleteBar(index, e)}
                    title="Delete bar"
                    className="absolute -top-3 right-0 hidden group-hover/btn:flex items-center justify-center w-3.5 h-3.5 bg-[#FF2E93] text-[var(--text-on-accent)] text-[8px] font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Tactile Architectural Column */}
              <motion.div
                layout
                className={`w-full relative rounded-t-md transition-all duration-150 ${vis.hatchClass}`}
                style={{
                  height: `${heightPx}px`,
                  backgroundColor: vis.bg,
                  borderColor: vis.border,
                  borderWidth: '1.5px',
                  borderBottomWidth: '1.5px',
                  boxShadow: 'var(--node-idle-shadow)',
                }}
              >
                {/* Precision Top Highlight Rule */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-t-sm"
                  style={{ backgroundColor: vis.border }}
                />
              </motion.div>

              {/* Numbered Index Ruler Beneath Baseline (00, 01, 02...) */}
              <span className="font-mono text-[10px] text-[var(--text-secondary)] mt-2 font-medium">
                {String(index).padStart(2, '0')}
              </span>

              {/* Multi-Lane Pointer Track */}
              <div className="absolute top-[104%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 pointer-events-none w-full">
                <AnimatePresence>
                  {activePointers.map((p, pIdx) => (
                    <motion.div
                      key={p.label}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="px-1 py-0.2 border text-[9px] font-mono font-bold tracking-tight whitespace-nowrap shadow-md"
                      style={{
                        backgroundColor: p.bg,
                        borderColor: p.border,
                        color: p.color,
                        marginTop: `${pIdx * 2}px`,
                      }}
                    >
                      ▲ {p.label}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
