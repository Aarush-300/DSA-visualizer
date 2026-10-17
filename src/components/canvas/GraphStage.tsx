import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { GraphSnapshot, GridCell } from '../../types/graphs';
import { generatePathfindingFrames } from '../../engines/graphs/pathfindingGrid';

export const GraphStage: React.FC = () => {
  const { frames, currentStepIndex, isPlaying, setFrames } = usePlaygroundStore();
  const currentFrame = frames[currentStepIndex];
  const snapshot = currentFrame?.snapshot as GraphSnapshot | undefined;

  const mode = snapshot?.mode ?? 'grid';
  const grid = snapshot?.grid;
  const vertices = snapshot?.vertices ?? [];
  const edges = snapshot?.edges ?? [];
  const activeVertexId = snapshot?.activeVertexId;
  const activeEdgeId = snapshot?.activeEdgeId;
  const mstEdges = snapshot?.mstEdges ?? [];

  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleCellClick = (r: number, c: number) => {
    if (isPlaying || !grid) return;
    const cell = grid[r][c];
    if (cell.type === 'start' || cell.type === 'target') return;

    const updatedGrid = grid.map((row, ri) =>
      row.map((col, ci) => {
        if (ri === r && ci === c) {
          let nextType: GridCell['type'] = 'wall';
          if (col.type === 'wall') nextType = 'weight';
          else if (col.type === 'weight') nextType = 'empty';
          else nextType = 'wall';
          return {
            ...col,
            type: nextType,
          };
        }
        return col;
      })
    );

    const startCoord = snapshot?.startCoord ?? { row: 7, col: 5 };
    const targetCoord = snapshot?.targetCoord ?? { row: 7, col: 30 };
    const newFrames = generatePathfindingFrames(updatedGrid, 'dijkstra', startCoord, targetCoord);
    setFrames(newFrames);
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (isMouseDown && !isPlaying) {
      handleCellClick(r, c);
    }
  };

  function getCellClasses(cell: GridCell): string {
    if (cell.type === 'start') {
      return 'bg-[#059669] border-[#059669] text-white font-bold shadow-xs';
    }
    if (cell.type === 'target') {
      return 'bg-[#E11D48] border-[#E11D48] text-white font-bold shadow-xs';
    }
    if (cell.type === 'wall') {
      return 'bg-[var(--border-strong)] border-[var(--border-strong)]';
    }
    if (cell.type === 'weight') {
      return 'bg-[var(--state-active-compare-bg)] border-[#F59E0B] text-[#F59E0B] font-bold';
    }
    if (cell.type === 'path') {
      return 'bg-[#059669] border-[#059669] text-white animate-beacon-emerald';
    }
    if (cell.type === 'visited') {
      return 'bg-[var(--state-active-window-bg)] border-[#4F46E5] text-[#4F46E5] animate-wavefront-industrial';
    }
    return 'bg-[var(--node-idle-bg)] border-[var(--border-hairline)] hover:bg-[var(--bg-hover)]';
  }

  // 1. 2D Interactive Grid
  if (mode === 'grid' && grid) {
    return (
      <div
        className="flex flex-col items-center justify-center w-full h-full select-none"
        onMouseDown={() => setIsMouseDown(true)}
        onMouseUp={() => setIsMouseDown(false)}
      >
        <div className="flex items-center gap-4 mb-2 text-[10px] font-mono text-[var(--text-secondary)]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#059669] rounded-xs" /> START
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#E11D48] rounded-xs" /> TARGET
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[var(--border-strong)] rounded-xs" /> WALL
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[var(--state-active-compare-bg)] border border-[#F59E0B] text-[#F59E0B] text-[8px] flex items-center justify-center font-bold rounded-xs">5</span> WEIGHT (+5)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#059669] rounded-xs" /> PATH
          </span>
        </div>

        <div className="inline-grid gap-[1px] p-2 bg-[var(--bg-island)] border border-[var(--border-hairline)] rounded-xl shadow-[var(--node-idle-shadow)] overflow-auto max-w-full max-h-[460px]">
          {grid.map((row, r) => (
            <div key={r} className="flex gap-[1px]">
              {row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onMouseEnter={() => handleMouseEnter(r, c)}
                  className={`w-4 h-4 sm:w-5 sm:h-5 border transition-all duration-75 cursor-pointer flex items-center justify-center text-[8px] font-mono ${getCellClasses(cell)}`}
                >
                  {cell.type === 'start' && 'S'}
                  {cell.type === 'target' && 'T'}
                  {cell.type === 'weight' && '5'}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Network Graph Mode
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl h-[420px] relative select-none">
      <div className="relative w-[720px] h-[340px] bg-[var(--bg-island)] border border-[var(--border-hairline)] rounded-xl shadow-[var(--node-idle-shadow)] p-4">
        {/* SVG Edges Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edges.map((edge) => {
            const v1 = vertices.find((v) => v.id === edge.source);
            const v2 = vertices.find((v) => v.id === edge.target);
            if (!v1 || !v2) return null;

            const isMst = mstEdges.includes(edge.id) || edge.state === 'sorted';
            const isActive = activeEdgeId === edge.id || edge.state === 'compare';

            const strokeColor = isMst
              ? '#059669'
              : isActive
              ? '#EA580C'
              : 'var(--border-strong)';
            const strokeWidth = isMst ? 3 : isActive ? 2 : 1;

            const midX = (v1.x + v2.x) / 2;
            const midY = (v1.y + v2.y) / 2;

            return (
              <g key={edge.id}>
                <line
                  x1={v1.x}
                  y1={v1.y}
                  x2={v2.x}
                  y2={v2.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />
                <rect
                  x={midX - 9}
                  y={midY - 7}
                  width="18"
                  height="14"
                  fill="var(--bg-island)"
                  stroke={strokeColor}
                  strokeWidth="1"
                  rx="2"
                />
                <text
                  x={midX}
                  y={midY + 4}
                  fill={isMst ? '#059669' : isActive ? '#EA580C' : 'var(--text-secondary)'}
                  fontSize="9"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Vertices Layer */}
        {vertices.map((v) => {
          const isActive = activeVertexId === v.id;
          const isSorted = v.state === 'sorted';

          let bg = 'var(--node-idle-bg)';
          let border = 'var(--node-idle-border)';
          let textColor = 'var(--node-idle-text)';

          if (isSorted) {
            bg = 'var(--state-sorted-verified-bg)';
            border = '#059669';
            textColor = '#059669';
          } else if (isActive) {
            bg = 'var(--state-mutate-swap-bg)';
            border = '#EA580C';
            textColor = '#EA580C';
          }

          return (
            <motion.div
              key={v.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 border-[1.5px] rounded-md shadow-[var(--node-idle-shadow)] cursor-grab active:cursor-grabbing transition-all duration-150"
              style={{
                left: v.x,
                top: v.y,
                backgroundColor: bg,
                borderColor: border,
              }}
            >
              <span className="font-display font-bold text-xs" style={{ color: textColor }}>
                {v.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
