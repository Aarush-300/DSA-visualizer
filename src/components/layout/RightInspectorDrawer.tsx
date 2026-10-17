import React from 'react';
import { motion } from 'framer-motion';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { CodeLanguage } from '../../types/engine';
import { CODE_SNIPPETS } from '../../data/codeSnippets';
import { ALGORITHM_CATALOG } from '../../data/algorithmCatalog';
import {
  Code,
  ChevronRight,
} from 'lucide-react';

export const RightInspectorDrawer: React.FC = () => {
  const {
    activeAlgo,
    codeLanguage,
    setCodeLanguage,
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

  const languages: { id: CodeLanguage; label: string }[] = [
    { id: 'c', label: 'C' },
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
    { id: 'python', label: 'Python' },
    { id: 'pseudo', label: 'Pseudo' },
    { id: 'algorithm', label: 'Steps' },
  ];

  // Collapsed Tiny Floating Button
  if (isRightDrawerCollapsed) {
    return (
      <button
        onClick={toggleRightDrawer}
        title="Open Code & Trace"
        aria-label="Open Code & Trace"
        className="fixed top-20 right-4 z-20 h-9 px-3 rounded-xl bg-[var(--bg-island)] border border-[var(--border-island)] shadow-[var(--shadow-island)] flex items-center gap-1.5 text-xs font-sans font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer backdrop-blur-md pointer-events-auto"
      >
        <Code size={14} className="text-[var(--accent-brand)]" />
        <span>Code</span>
      </button>
    );
  }

  return (
    <aside className="fixed top-20 right-4 bottom-20 z-20 w-[390px] rounded-xl bg-[var(--bg-island)] border border-[var(--border-island)] shadow-[var(--shadow-island)] flex flex-col overflow-hidden backdrop-blur-md select-none pointer-events-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-1.5">
          <Code size={14} className="text-[var(--accent-brand)]" />
          <span className="font-sans text-xs font-semibold text-[var(--text-primary)]">
            Code &amp; Execution Trace
          </span>
        </div>

        <button
          onClick={toggleRightDrawer}
          title="Collapse Drawer"
          className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Clean Underline Language Tabs */}
      <div className="flex items-center px-3 border-b border-[var(--border-subtle)] overflow-x-auto gap-4">
        {languages.map((lang) => {
          const isActive = codeLanguage === lang.id;
          return (
            <button
              key={lang.id}
              onClick={() => setCodeLanguage(lang.id)}
              className={`py-2 text-[11px] font-sans font-medium transition-colors cursor-pointer relative ${
                isActive
                  ? 'text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <span>{lang.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-lang-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent-brand)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Synchronized Line-by-Line Code Viewer */}
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
                  ? 'bg-[var(--accent-subtle)] border-l-2 border-[var(--accent-brand)]'
                  : 'border-l-2 border-transparent hover:bg-[var(--bg-hover)]'
              }`}
            >
              {/* Column 1: Line Number Gutter */}
              <div className="flex items-center justify-end pr-2.5 py-0.5 select-none border-r border-[var(--border-subtle)]">
                <span
                  className={`font-mono text-[10.5px] tabular-nums ${
                    isCurrent
                      ? 'text-[var(--accent-brand)] font-semibold'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {lineNum}
                </span>
              </div>

              {/* Column 2: Code Text (Never clips long signatures) */}
              <div className="pl-3 pr-4 py-0.5 overflow-x-visible">
                <pre className="font-mono text-[11.5px] leading-[1.65] text-[var(--text-primary)] m-0 whitespace-pre">
                  {line || ' '}
                </pre>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact 3-Column Docked Metrics Footer Strip */}
      <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2.5 grid grid-cols-3 gap-2 text-center shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] font-sans text-[var(--text-muted)]">Comparisons</span>
          <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
            {metrics.comparisons}
          </span>
        </div>
        <div className="flex flex-col border-x border-[var(--border-subtle)]">
          <span className="text-[10px] font-sans text-[var(--text-muted)]">Mutations</span>
          <span className="font-mono text-xs font-semibold text-[var(--accent-brand)]">
            {metrics.swaps}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-sans text-[var(--text-muted)]">Complexity</span>
          <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
            {algoMeta?.complexity.averageTime ?? 'O(n)'}
          </span>
        </div>
      </div>
    </aside>
  );
};
