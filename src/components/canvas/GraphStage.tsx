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
      return 'bg-[#00E676] border-[#00E676] text-[#090908] font-bold shadow-md';
    }
    if (cell.type === 'target') {
      return 'bg-[#FF4F00] border-[#FF4F00] text-[#090908] font-bold shadow-md';
    }
    if (cell.type === 'wall') {
      return 'bg-[#1C1B19] border-[#33312D]';
    }
    if (cell.type === 'weight') {
      return 'bg-[rgba(255,184,0,0.25)] border-[#FFB800] text-[#FFB800] font-bold';
    }
    if (cell.type === 'path') {
      return 'bg-[#00E676] border-[#00E676] animate-beacon-emerald';
    }
    if (cell.type === 'visited') {
      return 'bg-[rgba(212,255,0,0.15)] border-[rgba(212,255,0,0.4)] animate-wavefront-industrial';
    }
    return 'bg-[#111110] border-[#262522] hover:bg-[#181816]';
  }

  // 1. 2D Interactive Grid
  if (mode === 'grid' && grid) {
    return (
      <div
        className="flex flex-col items-center justify-center w-full h-full select-none"
        onMouseDown={() => setIsMouseDown(true)}
        onMouseUp={() => setIsMouseDown(false)}
      >
        <div className="flex items-center gap-4 mb-2 text-[10px] font-mono text-[#9E9B93]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#00E676]" /> START
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#FF4F00]" /> TARGET
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#1C1B19] border border-[#33312D]" /> WALL
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[rgba(255,184,0,0.25)] border border-[#FFB800] text-[#FFB800] text-[8px] flex items-center justify-center font-bold">5</span> WEIGHT (+5)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#00E676]" /> PATH
          </span>
        </div>

        <div className="inline-grid gap-[1px] p-2 bg-[#090908] border border-[#262522] shadow-2xl overflow-auto max-w-full max-h-[460px]">
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
      <div className="relative w-[720px] h-[340px] bg-[#111110] border border-[#262522] shadow-2xl p-4">
        {/* SVG Edges Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edges.map((edge) => {
            const v1 = vertices.find((v) => v.id === edge.source);
            const v2 = vertices.find((v) => v.id === edge.target);
            if (!v1 || !v2) return null;

            const isMst = mstEdges.includes(edge.id) || edge.state === 'sorted';
            const isActive = activeEdgeId === edge.id || edge.state === 'compare';

            const strokeColor = isMst
              ? '#00E676'
              : isActive
              ? '#FF4F00'
              : '#33312D';
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
                  fill="#090908"
                  stroke={strokeColor}
                  strokeWidth="1"
                />
                <text
                  x={midX}
                  y={midY + 4}
                  fill={isMst ? '#66FFA6' : isActive ? '#FF9466' : '#9E9B93'}
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

          let bg = '#181816';
          let border = '#33312D';
          let textColor = '#F3F2EE';

          if (isSorted) {
            bg = 'rgba(0, 230, 118, 0.2)';
            border = '#00E676';
            textColor = '#66FFA6';
          } else if (isActive) {
            bg = 'rgba(255, 79, 0, 0.25)';
            border = '#FF4F00';
            textColor = '#FF9466';
          }

          return (
            <motion.div
              key={v.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 border shadow-lg cursor-grab active:cursor-grabbing transition-all duration-150"
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
