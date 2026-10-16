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

  const maxVal = Math.max(...bars.map((b) => b.value), 1);
  const maxBarHeight = 250;
  const pointers = currentFrame?.pointers ?? {};

  const handleStartEdit = (idx: number, currentVal: number) => {
    setEditingIndex(idx);
    setEditValue(String(currentVal));
  };

  const handleSaveEdit = (idx: number) => {
    const val = Number(editValue);
    if (!Number.isNaN(val) && val >= 1 && val <= 999) {
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
    let isHatched = false;
    let isIdle = true;

    const isMutating = currentFrame?.mutateIds?.includes(bar.id);
    const isActive = currentFrame?.activeIds?.includes(bar.id);
    const isPivot = currentFrame?.pivotIds?.includes(bar.id);
    const isSorted = currentFrame?.sortedIds?.includes(index) || bar.state === 'sorted';

    if (isSorted) {
      bg = 'rgba(0, 230, 118, 0.16)';
      border = '#00E676';
      text = '#00E676';
      isIdle = false;
    } else if (isMutating || bar.state === 'swap') {
      bg = 'rgba(255, 79, 0, 0.22)';
      border = '#FF4F00';
      text = '#FF4F00';
      isHatched = true;
      isIdle = false;
    } else if (isPivot || bar.state === 'pivot') {
      bg = 'rgba(255, 46, 147, 0.20)';
      border = '#FF2E93';
      text = '#FF2E93';
      isIdle = false;
    } else if (isActive || bar.state === 'compare') {
      bg = 'rgba(255, 184, 0, 0.18)';
      border = '#FFB800';
      text = '#FFB800';
      isHatched = true;
      isIdle = false;
    } else if (bar.state === 'visited') {
      bg = 'rgba(212, 255, 0, 0.12)';
      border = '#D4FF00';
      text = '#D4FF00';
      isHatched = true;
      isIdle = false;
    }

    return { bg, border, text, isHatched, isMutating, isIdle };
  }

  // Pointer lane distribution for multi-lane stacking
  function getPointersForIndex(index: number) {
    const list: { label: string; color: string; border: string; bg: string }[] = [];
    if (pointers.pivot === index) {
      list.push({ label: 'PIVOT', color: '#FF85BF', border: '#FF2E93', bg: 'rgba(255,46,147,0.15)' });
    }
    if (pointers.i === index) {
      list.push({ label: `i=${index}`, color: '#FFD666', border: '#FFB800', bg: 'rgba(255,184,0,0.15)' });
    }
    if (pointers.j === index) {
      list.push({ label: `j=${index}`, color: '#E8FF7A', border: '#D4FF00', bg: 'rgba(212,255,0,0.15)' });
    }
    if (pointers.mid === index) {
      list.push({ label: 'MID', color: '#FF85BF', border: '#FF2E93', bg: 'rgba(255,46,147,0.15)' });
    }
    if (pointers.low === index && pointers.mid !== index) {
      list.push({ label: 'LOW', color: '#66FFA6', border: '#00E676', bg: 'rgba(0,230,118,0.15)' });
    }
    if (pointers.high === index && pointers.mid !== index) {
      list.push({ label: 'HIGH', color: '#FF9466', border: '#FF4F00', bg: 'rgba(255,79,0,0.15)' });
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
          const heightPx = Math.max(34, (bar.value / maxVal) * maxBarHeight);
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

              {/* Architectural Vertical Column */}
              <motion.div
                layout
                className={`w-full relative transition-all duration-150 ${vis.isHatched ? 'diagonal-hatch' : ''}`}
                style={{
                  height: `${heightPx}px`,
                  backgroundColor: vis.bg,
                  borderColor: vis.border,
                  borderWidth: vis.isIdle ? '1.5px' : '1px',
                  borderBottomWidth: '0px',
                  boxShadow: vis.isIdle ? 'inset 0 1px 2px rgba(0, 0, 0, 0.05)' : undefined,
                }}
              >
                {/* Precision Top Cap Highlight Rule */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
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
