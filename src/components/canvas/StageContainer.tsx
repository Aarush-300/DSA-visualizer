import React, { useState } from 'react';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { GraphEdgeDefs } from '../../assets/svg/GraphEdgeDefs';
import { SortingStage } from './SortingStage';
import { StackQueueStage } from './StackQueueStage';
import { LinkedListStage } from './LinkedListStage';
import { TreeStage } from './TreeStage';
import { GraphStage } from './GraphStage';
import { Terminal, Maximize2 } from 'lucide-react';

export const StageContainer: React.FC = () => {
  const { activeModule, frames, currentStepIndex } = usePlaygroundStore();
  const currentFrame = frames[currentStepIndex];

  // Mouse coordinate tracker for mini HUD
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setCursorPos({ x, y });
  };

  const legendItems = [
    { label: 'IDLE', color: '#5C5952', bg: '#1C1B19' },
    { label: 'COMPARING', color: '#FFB800', bg: 'rgba(255, 184, 0, 0.14)' },
    { label: 'MUTATING', color: '#FF4F00', bg: 'rgba(255, 79, 0, 0.18)' },
    { label: 'ACTIVE WINDOW', color: '#D4FF00', bg: 'rgba(212, 255, 0, 0.10)' },
    { label: 'TARGET', color: '#FF2E93', bg: 'rgba(255, 46, 147, 0.16)' },
    { label: 'VERIFIED', color: '#00E676', bg: 'rgba(0, 230, 118, 0.14)' },
  ];

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative flex-1 h-full w-full overflow-hidden canvas-grid-pattern flex flex-col select-none"
    >
      <GraphEdgeDefs />

      {/* Docked Top HUD Bar: Full-Width 2-Column Architectural Sub-header */}
      <div className="h-11 border-b border-[#262522] bg-[#0D0D0C] flex items-center justify-between px-4 z-20 shrink-0">
        {/* Left: Frame Narration Readout */}
        <div className="flex items-center gap-3 flex-1 min-w-0 pr-4 py-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#FF4F00]/10 border border-[#FF4F00]/30 text-[#FF4F00] font-mono text-[10px] font-bold tracking-wider shrink-0 uppercase">
            <Terminal size={11} />
            <span>
              F-{String(currentStepIndex + 1).padStart(3, '0')}/{String(Math.max(1, frames.length)).padStart(3, '0')}
            </span>
          </div>

          <p className="font-sans text-xs text-[#F3F2EE] line-clamp-2 leading-tight font-medium">
            {currentFrame?.narration || 'Algorithm initialized. Ready for execution steps.'}
          </p>
        </div>

        {/* Right: Docked Architectural State Legend */}
        <div className="hidden xl:flex items-center gap-2 shrink-0 border-l border-[#262522] pl-4">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 px-1.5 py-0.5">
              <span
                className="w-1.5 h-1.5"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-mono text-[10px] text-[#9E9B93] tracking-wider uppercase font-semibold">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage Area */}
      <div className="flex-1 w-full h-full flex items-center justify-center p-4 relative overflow-hidden">
        {/* Corner Intersection Crosshairs (+) */}
        <span className="absolute top-2 left-2 text-[#262522] font-mono text-xs pointer-events-none">+</span>
        <span className="absolute top-2 right-2 text-[#262522] font-mono text-xs pointer-events-none">+</span>
        <span className="absolute bottom-2 left-2 text-[#262522] font-mono text-xs pointer-events-none">+</span>
        <span className="absolute bottom-2 right-2 text-[#262522] font-mono text-xs pointer-events-none">+</span>

        {activeModule === 'sorting' && <SortingStage />}
        {activeModule === 'stacksQueues' && <StackQueueStage />}
        {activeModule === 'linkedList' && <LinkedListStage />}
        {activeModule === 'trees' && <TreeStage />}
        {activeModule === 'graphs' && <GraphStage />}
      </div>

      {/* Mini HUD (Bottom-Right Corner) */}
      <div className="absolute bottom-3 right-4 z-20 flex items-center gap-2 bg-[#111110] border border-[#262522] px-2.5 py-1 text-[10px] font-mono text-[#9E9B93]">
        <span>X: {String(cursorPos.x).padStart(4, '0')}</span>
        <span className="text-[#3B3935]">|</span>
        <span>Y: {String(cursorPos.y).padStart(4, '0')}</span>
        <span className="text-[#3B3935]">|</span>
        <span className="text-[#FF4F00]">100%</span>
        <span className="text-[#3B3935]">|</span>
        <button
          onClick={() => {}}
          className="hover:text-[#F3F2EE] flex items-center gap-1"
        >
          <Maximize2 size={10} />
          <span>[FIT]</span>
        </button>
      </div>
    </div>
  );
};
