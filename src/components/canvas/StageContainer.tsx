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
  const { activeModule } = usePlaygroundStore();

  const legendItems = [
    { label: 'Idle', color: 'var(--state-idle-color, #D6D3CD)' },
    { label: 'Comparing', color: '#F59E0B' },
    { label: 'Mutating', color: '#EA580C' },
    { label: 'Partition', color: '#4F46E5' },
    { label: 'Target', color: '#E11D48' },
    { label: 'Verified', color: '#059669' },
  ];

  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden canvas-grid-pattern flex items-center justify-center select-none">
      <GraphEdgeDefs />

      {/* Main Interactive Stage Visualization */}
      <div className="w-full h-full flex items-center justify-center p-4 relative overflow-hidden">
        {activeModule === 'sorting' && <SortingStage />}
        {activeModule === 'stacksQueues' && <StackQueueStage />}
        {activeModule === 'linkedList' && <LinkedListStage />}
        {activeModule === 'trees' && <TreeStage />}
        {activeModule === 'graphs' && <GraphStage />}
      </div>

      {/* Floating 6-State Distinct Legend (Bottom-Left) */}
      <div className="fixed bottom-5 left-4 z-20 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-island)] border border-[var(--border-island)] shadow-[var(--shadow-island)] backdrop-blur-md pointer-events-auto">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 px-1">
            <span
              className="w-2 h-2 rounded-full shadow-2xs"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-sans text-[11px] text-[var(--text-secondary)] font-medium">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Floating View Reset Pill (Bottom-Right) */}
      <div className="fixed bottom-5 right-4 z-20 hidden sm:flex items-center gap-2 bg-[var(--bg-island)] border border-[var(--border-island)] shadow-[var(--shadow-island)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--text-secondary)] backdrop-blur-md pointer-events-auto">
        <span className="font-mono text-[11px] font-medium text-[var(--text-primary)]">100%</span>
        <span className="text-[var(--border-strong)]">|</span>
        <button
          onClick={() => {}}
          className="hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors font-medium text-xs cursor-pointer"
        >
          <Maximize2 size={12} />
          <span>Reset</span>
        </button>
      </div>
    </main>
  );
};
