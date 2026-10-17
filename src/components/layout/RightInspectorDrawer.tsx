import React from 'react';
import { motion } from 'framer-motion';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { CodeLanguage } from '../../types/engine';
import { CODE_SNIPPETS } from '../../data/codeSnippets';
import { ALGORITHM_CATALOG } from '../../data/algorithmCatalog';
import { MetricCounterCard } from '../shared/MetricCounterCard';
import {
  Code,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  GitBranch,
} from 'lucide-react';

export const RightInspectorDrawer: React.FC = () => {
  const {
    activeAlgo,
    codeLanguage,
    setCodeLanguage,
    activeInspectorTab,
    setActiveInspectorTab,
    frames,
    currentStepIndex,
    isRightDrawerCollapsed,
    toggleRightDrawer,
  } = usePlaygroundStore();

  const currentFrame = frames[currentStepIndex];
  const metrics = currentFrame?.metrics ?? {
    comparisons: 0,
    swaps: 0,
    memoryOps: 0,
    recursionDepth: 0,
  };

  const algoMeta = ALGORITHM_CATALOG[activeAlgo];
  const snippets = CODE_SNIPPETS[activeAlgo] ?? CODE_SNIPPETS['quick'];

  const currentLines = snippets[codeLanguage] ?? [];
  const activeLineNumber =
    currentFrame?.codeLine?.[codeLanguage] ??
    (codeLanguage === 'algorithm'
      ? (currentFrame?.codeLine?.pseudo ?? 1)
      : (currentFrame?.codeLine?.cpp ?? 1));

  if (isRightDrawerCollapsed) {
    return (
      <div className="h-full border-l border-[var(--border-hairline)] bg-[var(--bg-panel)] flex flex-col items-center py-4 px-1.5 z-20 shrink-0">
        <button
          onClick={toggleRightDrawer}
          title="Expand Inspector Drawer"
          className="p-1.5 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-strong)] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    );
  }

  const languages: { id: CodeLanguage; label: string }[] = [
    { id: 'c', label: 'C' },
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
    { id: 'python', label: 'Python' },
    { id: 'pseudo', label: 'Pseudo' },
    { id: 'algorithm', label: 'Algorithm' },
  ];

  return (
    <aside className="w-[400px] min-w-[360px] h-full border-l border-[var(--border-hairline)] bg-[var(--bg-panel)] text-[var(--text-primary)] flex flex-col z-20 shrink-0 select-none">
      {/* Drawer Header Tabs */}
      <div className="flex items-center justify-between border-b border-[var(--border-hairline)] px-3 py-2 bg-[var(--bg-panel)]">
        <div className="flex items-center gap-1 bg-[var(--bg-elevated)] p-0.5 rounded-md border border-[var(--border-hairline)]">
          <button
            onClick={() => setActiveInspectorTab('code')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              activeInspectorTab === 'code'
                ? 'bg-[var(--bg-panel)] text-[var(--text-primary)] font-semibold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Code size={13} />
            <span>Code</span>
          </button>

          <button
            onClick={() => setActiveInspectorTab('telemetry')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              activeInspectorTab === 'telemetry'
                ? 'bg-[var(--bg-panel)] text-[var(--text-primary)] font-semibold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Activity size={13} />
            <span>Metrics</span>
          </button>

          <button
            onClick={() => setActiveInspectorTab('stack')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              activeInspectorTab === 'stack'
                ? 'bg-[var(--bg-panel)] text-[var(--text-primary)] font-semibold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Layers size={13} />
            <span>Call Stack</span>
          </button>
        </div>

        <button
          onClick={toggleRightDrawer}
          title="Collapse Drawer"
          className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Tab 1: Live Code Trace */}
      {activeInspectorTab === 'code' && (
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-canvas)]">
          {/* Language Switcher Bar */}
          <div className="px-3 py-2 border-b border-[var(--border-hairline)] flex items-center justify-between bg-[var(--bg-panel)]">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Language
            </span>
            <div className="flex items-center bg-[var(--bg-elevated)] border border-[var(--border-hairline)] rounded-md p-0.5">
              {languages.map((lang) => {
                const isActive = codeLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => setCodeLanguage(lang.id)}
                    className={`relative px-2 py-0.5 text-[11px] font-sans font-medium rounded transition-colors ${
                      isActive ? 'text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-lang-tab"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="absolute inset-0 bg-[var(--bg-panel)] rounded border border-[var(--border-strong)]"
                      />
                    )}
                    <span className="relative z-10">{lang.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-3 py-1.5 bg-[var(--bg-canvas)] text-xs text-[var(--text-secondary)] border-b border-[var(--border-hairline)] flex items-center justify-between">
            <span className="font-medium text-[var(--text-primary)]">Implementation</span>
            <span className="font-mono text-[11px] text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded font-semibold">
              Line {activeLineNumber}
            </span>
          </div>

          {/* Clean Grid-based Code Viewer with Zero Clipping */}
          <div className="flex-1 overflow-auto py-2 bg-[var(--bg-canvas)]">
            {currentLines.map((line, idx) => {
              const lineNum = idx + 1;
              const isCurrent = lineNum === activeLineNumber;

              return (
                <div
                  key={lineNum}
                  style={{ display: 'grid', gridTemplateColumns: '36px 1fr' }}
                  className={`items-baseline transition-colors ${
                    isCurrent
                      ? 'bg-[var(--accent-subtle)] border-l-2 border-[var(--accent-primary)]'
                      : 'border-l-2 border-transparent hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {/* Column 1: Line Number Gutter */}
                  <div className="flex items-center justify-end pr-2.5 py-0.5 select-none border-r border-[var(--border-hairline)]">
                    <span
                      className={`font-mono text-[11px] tabular-nums ${
                        isCurrent
                          ? 'text-[var(--accent-primary)] font-semibold'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {lineNum}
                    </span>
                  </div>

                  {/* Column 2: Code Text */}
                  <div className="pl-3 pr-4 py-0.5 overflow-x-visible">
                    <pre className="font-mono text-[12px] leading-[1.65] text-[var(--text-primary)] m-0 whitespace-pre">
                      {line || ' '}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Runtime Telemetry & Complexity */}
      {activeInspectorTab === 'telemetry' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[var(--bg-canvas)]">
          <div className="grid grid-cols-2 gap-2">
            <MetricCounterCard
              label="Comparisons"
              value={metrics.comparisons}
              subtext="Key Tests"
              color="#3B82F6"
            />
            <MetricCounterCard
              label="Mutations / Swaps"
              value={metrics.swaps}
              subtext="Memory Reassignments"
              color="var(--accent-primary)"
            />
            <MetricCounterCard
              label="Aux Memory"
              value={metrics.auxiliaryMemory ?? 'O(1)'}
              subtext="Space Overhead"
              color="#10B981"
            />
            <MetricCounterCard
              label="Execution Step"
              value={`${currentStepIndex + 1} / ${Math.max(1, frames.length)}`}
              subtext="Timeline Position"
              color="#6366F1"
            />
          </div>

          {/* Complexity Reference Matrix */}
          {algoMeta && (
            <div className="p-3 bg-[var(--bg-panel)] border border-[var(--border-hairline)] rounded-md space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-hairline)]">
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  Complexity Analysis
                </span>
                <span className="font-mono text-[10px] text-[var(--accent-primary)] font-semibold">
                  {algoMeta.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <div className="p-2 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] rounded">
                  <span className="text-[10px] text-[var(--text-muted)] block font-sans">Best Case</span>
                  <span className="text-emerald-500 font-semibold">{algoMeta.complexity.bestTime}</span>
                </div>
                <div className="p-2 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] rounded">
                  <span className="text-[10px] text-[var(--text-muted)] block font-sans">Average Case</span>
                  <span className="text-amber-500 font-semibold">{algoMeta.complexity.averageTime}</span>
                </div>
                <div className="p-2 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] rounded">
                  <span className="text-[10px] text-[var(--text-muted)] block font-sans">Worst Case</span>
                  <span className="text-rose-500 font-semibold">{algoMeta.complexity.worstTime}</span>
                </div>
                <div className="p-2 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] rounded">
                  <span className="text-[10px] text-[var(--text-muted)] block font-sans">Aux Space</span>
                  <span className="text-blue-500 font-semibold">{algoMeta.complexity.space}</span>
                </div>
              </div>

              <p className="text-xs font-sans text-[var(--text-secondary)] leading-relaxed pt-1 border-t border-[var(--border-hairline)]">
                {algoMeta.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Call Stack */}
      {activeInspectorTab === 'stack' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[var(--bg-canvas)]">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              Call Stack
            </span>
            <span className="font-mono text-xs text-[var(--accent-primary)] font-medium">
              Depth: {currentFrame?.callStack.length ?? 0}
            </span>
          </div>

          <div className="space-y-1.5">
            {(!currentFrame?.callStack || currentFrame.callStack.length === 0) ? (
              <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                Call stack is empty
              </div>
            ) : (
              currentFrame.callStack.slice().reverse().map((call, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-md border text-xs font-mono flex items-center gap-2 ${
                    idx === 0
                      ? 'bg-[var(--accent-subtle)] border-[var(--accent-primary)] text-[var(--text-primary)]'
                      : 'bg-[var(--bg-panel)] border-[var(--border-hairline)] text-[var(--text-secondary)]'
                  }`}
                >
                  <GitBranch size={13} className={idx === 0 ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'} />
                  <span className="truncate">{call}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
