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
      <div className="h-full border-l border-[#262522] bg-[#111110] flex flex-col items-center py-4 px-1.5 z-20 shrink-0">
        <button
          onClick={toggleRightDrawer}
          title="Expand Inspector Drawer"
          className="p-1.5 hover:bg-[#181816] text-[#9E9B93] hover:text-[#F3F2EE] border border-transparent hover:border-[#3B3935]"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    );
  }

  const languages: { id: CodeLanguage; label: string }[] = [
    { id: 'c', label: 'C' },
    { id: 'cpp', label: 'C++20' },
    { id: 'java', label: 'JAVA' },
    { id: 'python', label: 'PYTHON' },
    { id: 'pseudo', label: 'PSEUDO' },
    { id: 'algorithm', label: 'ALGO' },
  ];

  return (
    <aside className="w-[380px] min-w-[360px] h-full border-l border-[#262522] bg-[#111110] flex flex-col z-20 shrink-0 select-none">
      {/* Drawer Tab Headers with Hardware Keycaps */}
      <div className="flex items-center justify-between border-b border-[#262522] px-3 py-2 bg-[#0D0D0C]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveInspectorTab('code')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-display tracking-wider font-semibold transition-all ${
              activeInspectorTab === 'code'
                ? 'bg-[#181816] text-[#FF4F00] border-t-2 border-t-[#FF4F00] border-x border-b border-[#3B3935]'
                : 'text-[#9E9B93] hover:text-[#F3F2EE]'
            }`}
          >
            <Code size={12} />
            <span>LIVE CODE</span>
          </button>

          <button
            onClick={() => setActiveInspectorTab('telemetry')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-display tracking-wider font-semibold transition-all ${
              activeInspectorTab === 'telemetry'
                ? 'bg-[#181816] text-[#FF4F00] border-t-2 border-t-[#FF4F00] border-x border-b border-[#3B3935]'
                : 'text-[#9E9B93] hover:text-[#F3F2EE]'
            }`}
          >
            <Activity size={12} />
            <span>TELEMETRY</span>
          </button>

          <button
            onClick={() => setActiveInspectorTab('stack')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-display tracking-wider font-semibold transition-all ${
              activeInspectorTab === 'stack'
                ? 'bg-[#181816] text-[#FF4F00] border-t-2 border-t-[#FF4F00] border-x border-b border-[#3B3935]'
                : 'text-[#9E9B93] hover:text-[#F3F2EE]'
            }`}
          >
            <Layers size={12} />
            <span>STACK</span>
          </button>
        </div>

        <button
          onClick={toggleRightDrawer}
          title="Collapse Drawer"
          className="p-1 text-[#9E9B93] hover:text-[#F3F2EE] hover:bg-[#181816]"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Tab 1: Live Code Trace */}
      {activeInspectorTab === 'code' && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#090908]">
          {/* Language Switcher Bar with Sliding layoutId Active Indicator */}
          <div className="px-3 py-1.5 border-b border-[#262522] flex items-center justify-between bg-[#111110]">
            <span className="text-[10px] font-mono uppercase font-bold text-[#5C5952]">
              TARGET SYNTAX
            </span>
            <div className="flex items-center bg-[#090908] border border-[#262522] p-0.5">
              {languages.map((lang) => {
                const isActive = codeLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => setCodeLanguage(lang.id)}
                    className={`relative px-2 py-0.5 text-[10px] font-mono tracking-wider font-bold transition-colors ${
                      isActive ? 'text-[#FF4F00]' : 'text-[#9E9B93] hover:text-[#F3F2EE]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-lang-tab"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="absolute inset-0 bg-[#181816] border border-[#3B3935]"
                      />
                    )}
                    <span className="relative z-10">{lang.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-3 py-1 bg-[#111110] text-[10px] font-mono text-[#5C5952] border-b border-[#262522] flex items-center justify-between">
            <span>SYNCED EXECUTION TRACE</span>
            <span className="text-[#FF4F00]">LINE: {String(activeLineNumber).padStart(2, '0')}</span>
          </div>

          {/* Line-by-Line Code Viewer with Laser Bar Indicator */}
          <div className="flex-1 overflow-auto p-2 font-mono text-[12.5px] leading-relaxed bg-[#090908]">
            {currentLines.map((line, idx) => {
              const lineNum = idx + 1;
              const isCurrent = lineNum === activeLineNumber;

              return (
                <div
                  key={lineNum}
                  className="relative flex items-center min-w-max py-0.5"
                >
                  {isCurrent && (
                    <motion.div
                      layoutId="active-code-line"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-0 laser-code-highlight"
                    />
                  )}

                  {/* Execution Gutter Arrow & Sticky Line Number */}
                  <span className="relative z-10 w-4 text-center text-[10px] font-bold text-[#FF4F00]">
                    {isCurrent ? '▶' : ''}
                  </span>
                  <span className="relative z-10 w-7 shrink-0 text-right pr-2 text-[#5C5952] select-none text-[10px] font-mono sticky left-0 bg-[#090908]">
                    {String(lineNum).padStart(2, '0')}
                  </span>

                  {/* Code Line */}
                  <pre className="relative z-10 font-mono text-[12px] whitespace-pre pl-1 text-[#F3F2EE] m-0">
                    {line}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Runtime Telemetry & Complexity */}
      {activeInspectorTab === 'telemetry' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#090908]">
          <div className="grid grid-cols-2 gap-2">
            <MetricCounterCard
              label="COMPARISONS"
              value={metrics.comparisons}
              subtext="Key Tests"
              color="#FFB800"
            />
            <MetricCounterCard
              label="MUTATIONS / SWAPS"
              value={metrics.swaps}
              subtext="Memory Reassignments"
              color="#FF4F00"
            />
            <MetricCounterCard
              label="AUX MEMORY"
              value={metrics.auxiliaryMemory ?? 'O(1)'}
              subtext="Space Overhead"
              color="#D4FF00"
            />
            <MetricCounterCard
              label="EXECUTION STEP"
              value={`${currentStepIndex + 1} / ${Math.max(1, frames.length)}`}
              subtext="Timeline Position"
              color="#00E676"
            />
          </div>

          {/* Complexity Reference Matrix */}
          {algoMeta && (
            <div className="p-3 bg-[#111110] border border-[#262522] space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#262522]">
                <span className="text-[10px] font-display uppercase tracking-wider font-bold text-[#F3F2EE]">
                  ASYMPTOTIC SPECIFICATION
                </span>
                <span className="font-mono text-[9px] text-[#FF4F00] font-bold">
                  {algoMeta.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <div className="p-2 bg-[#181816] border border-[#262522]">
                  <span className="text-[9px] text-[#5C5952] block font-mono">BEST CASE</span>
                  <span className="text-[#00E676] font-bold">{algoMeta.complexity.bestTime}</span>
                </div>
                <div className="p-2 bg-[#181816] border border-[#262522]">
                  <span className="text-[9px] text-[#5C5952] block font-mono">AVERAGE CASE</span>
                  <span className="text-[#FFB800] font-bold">{algoMeta.complexity.averageTime}</span>
                </div>
                <div className="p-2 bg-[#181816] border border-[#262522]">
                  <span className="text-[9px] text-[#5C5952] block font-mono">WORST CASE</span>
                  <span className="text-[#FF4F00] font-bold">{algoMeta.complexity.worstTime}</span>
                </div>
                <div className="p-2 bg-[#181816] border border-[#262522]">
                  <span className="text-[9px] text-[#5C5952] block font-mono">AUX SPACE</span>
                  <span className="text-[#D4FF00] font-bold">{algoMeta.complexity.space}</span>
                </div>
              </div>

              <p className="text-[11px] font-sans text-[#9E9B93] leading-relaxed pt-1 border-t border-[#262522]">
                {algoMeta.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Call Stack */}
      {activeInspectorTab === 'stack' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#090908]">
          <div className="flex items-center justify-between pb-2 border-b border-[#262522]">
            <span className="text-[10px] font-display uppercase tracking-wider font-bold text-[#9E9B93]">
              LIFO RECURSION CALL STACK
            </span>
            <span className="font-mono text-[10px] text-[#FF4F00]">
              DEPTH: {String(currentFrame?.callStack.length ?? 0).padStart(2, '0')}
            </span>
          </div>

          <div className="space-y-1">
            {(!currentFrame?.callStack || currentFrame.callStack.length === 0) ? (
              <div className="text-center py-8 text-xs text-[#5C5952] font-mono">
                [STACK IDLE]
              </div>
            ) : (
              currentFrame.callStack.slice().reverse().map((call, idx) => (
                <div
                  key={idx}
                  className={`p-2 border text-xs font-mono flex items-center gap-2 ${
                    idx === 0
                      ? 'bg-[#181816] border-[#FF4F00] text-[#F3F2EE]'
                      : 'bg-[#111110] border-[#262522] text-[#9E9B93]'
                  }`}
                >
                  <GitBranch size={12} className={idx === 0 ? 'text-[#FF4F00]' : 'text-[#5C5952]'} />
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
