import React from 'react';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { GraphEdgeDefs } from '../../assets/svg/GraphEdgeDefs';
import { SortingStage } from './SortingStage';
import { StackQueueStage } from './StackQueueStage';
import { LinkedListStage } from './LinkedListStage';
import { TreeStage } from './TreeStage';
import { GraphStage } from './GraphStage';
import { Maximize2 } from 'lucide-react';

export const StageContainer: React.FC = () => {
  const { activeModule, frames, currentStepIndex } = usePlaygroundStore();
  const currentFrame = frames[currentStepIndex];

  const legendItems = [
    { label: 'Idle', color: 'var(--text-muted)' },
    { label: 'Comparing', color: '#3B82F6' },
    { label: 'Mutating', color: 'var(--accent-primary)' },
    { label: 'Active Window', color: '#10B981' },
    { label: 'Target', color: '#EC4899' },
    { label: 'Completed', color: '#10B981' },
  ];

  return (
    <div className="relative flex-1 h-full w-full overflow-hidden canvas-grid-pattern flex flex-col select-none">
      <GraphEdgeDefs />

      {/* Docked Top HUD Bar: Clean Execution Narration Subheader */}
      <div className="h-11 border-b border-[var(--border-hairline)] bg-[var(--bg-panel)] text-[var(--text-primary)] flex items-center justify-between px-4 z-20 shrink-0">
        {/* Left: Frame Narration Readout */}
        <div className="flex items-center gap-3 flex-1 min-w-0 pr-4 py-1">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-mono text-[11px] font-semibold rounded shrink-0">
            <span>
              Step {currentStepIndex + 1} of {Math.max(1, frames.length)}
            </span>
          </div>

          <p className="font-sans text-xs text-[var(--text-primary)] line-clamp-2 leading-snug font-normal">
            {currentFrame?.narration || 'Algorithm initialized. Ready for execution steps.'}
          </p>
        </div>

        {/* Right: State Legend */}
        <div className="hidden xl:flex items-center gap-1.5 shrink-0 border-l border-[var(--border-hairline)] pl-4">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 px-1.5 py-0.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-sans text-[11px] text-[var(--text-secondary)] font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage Area */}
      <div className="flex-1 w-full h-full flex items-center justify-center p-4 relative overflow-hidden">
        {activeModule === 'sorting' && <SortingStage />}
        {activeModule === 'stacksQueues' && <StackQueueStage />}
        {activeModule === 'linkedList' && <LinkedListStage />}
        {activeModule === 'trees' && <TreeStage />}
        {activeModule === 'graphs' && <GraphStage />}
      </div>

      {/* Mini HUD (Bottom-Right View Reset Pill) */}
      <div className="absolute bottom-3 right-4 z-20 flex items-center gap-2 bg-[var(--bg-panel)] border border-[var(--border-hairline)] rounded-md px-2.5 py-1 text-xs text-[var(--text-secondary)] shadow-xs">
        <span className="font-mono text-[11px] font-medium text-[var(--text-primary)]">100%</span>
        <span className="text-[var(--border-hairline)]">|</span>
        <button
          onClick={() => {}}
          className="hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors font-medium text-xs"
        >
          <Maximize2 size={11} />
          <span>Reset view</span>
        </button>
      </div>
    </div>
  );
};
