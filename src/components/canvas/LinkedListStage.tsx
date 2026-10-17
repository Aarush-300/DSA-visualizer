import React from 'react';
import { motion } from 'framer-motion';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { LinkedListSnapshot, MemoryNode } from '../../types/linkedList';

export const LinkedListStage: React.FC = () => {
  const { frames, currentStepIndex } = usePlaygroundStore();
  const currentFrame = frames[currentStepIndex];
  const snapshot = currentFrame?.snapshot as LinkedListSnapshot | undefined;
  const nodes: MemoryNode[] = snapshot?.nodes ?? [];
  const activePointers = snapshot?.activePointers ?? {};
  const listType = snapshot?.listType ?? 'singly';

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] font-mono text-xs gap-3">
        <div className="flex items-center gap-2 px-4 py-2 border border-[var(--border-hairline)] bg-[var(--bg-panel)] rounded-md shadow-xs">
          <span className="text-[var(--accent-primary)] font-semibold">head</span>
          <span className="text-[var(--text-secondary)]">→</span>
          <span className="text-[var(--text-muted)]">null</span>
        </div>
        <p className="text-xs font-sans text-[var(--text-secondary)]">
          List is empty. Use Insert Head or Insert Tail to add elements.
        </p>
      </div>
    );
  }

  const isDoubly = listType === 'doubly' || listType === 'circularDoubly';
  const isCircular = listType === 'circularSingly' || listType === 'circularDoubly';

  const nodeW = isDoubly ? 184 : 136;
  const nodeH = 58;
  const gapX = isDoubly ? 48 : 42;
  const nodeY = 110;

  // Single-track horizontal layout for up to 10 nodes (zero multi-row wrap collisions)
  const positionedNodes = nodes.map((node, idx) => {
    const x = 70 + idx * (nodeW + gapX);
    const y = nodeY;
    return { ...node, x, y };
  });

  function getNodeStyle(node: MemoryNode) {
    let border = 'var(--border-hairline)';
    let bg = 'var(--bg-panel)';
    let text = 'var(--text-primary)';

    if (node.state === 'sorted') {
      border = '#10B981';
      bg = 'rgba(16, 185, 129, 0.08)';
      text = '#10B981';
    } else if (node.state === 'active' || node.state === 'swap') {
      border = 'var(--accent-primary)';
      bg = 'var(--accent-subtle)';
      text = 'var(--accent-primary)';
    } else if (activePointers.curr === node.address) {
      border = '#3B82F6';
      bg = 'rgba(59, 130, 246, 0.1)';
      text = '#3B82F6';
    } else if (activePointers.prev === node.address) {
      border = '#F59E0B';
      bg = 'rgba(245, 158, 11, 0.1)';
      text = '#F59E0B';
    }

    return { border, bg, text };
  }

  const maxX = Math.max(860, 70 + nodes.length * (nodeW + gapX) + 80);
  const maxY = 280;

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative overflow-auto select-none">
      <div
        className="relative"
        style={{ width: `${maxX}px`, height: `${maxY}px` }}
      >
        {/* SVG Pointer Wiring Bus */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <marker
              id="arrow-next"
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
            >
              <path d="M 0 0.5 L 6 3.5 L 0 6.5 z" fill="var(--accent-primary)" />
            </marker>
            <marker
              id="arrow-prev"
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
            >
              <path d="M 0 0.5 L 6 3.5 L 0 6.5 z" fill="#F59E0B" />
            </marker>
            <marker
              id="arrow-circular"
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
            >
              <path d="M 0 0.5 L 6 3.5 L 0 6.5 z" fill="var(--accent-primary)" />
            </marker>
          </defs>

          {/* Non-circular Ground/Null Symbols */}
          {!isCircular && positionedNodes.length > 0 && (
            <>
              {/* Singly / Doubly Tail -> null */}
              {(() => {
                const tail = positionedNodes[positionedNodes.length - 1];
                const endX = tail.x + nodeW;
                const endY = tail.y + (isDoubly ? 20 : 29);
                return (
                  <g key="tail-null">
                    <line
                      x1={endX}
                      y1={endY}
                      x2={endX + 24}
                      y2={endY}
                      stroke="var(--accent-primary)"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow-next)"
                    />
                    <text
                      x={endX + 30}
                      y={endY + 3.5}
                      fill="var(--text-muted)"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      null
                    </text>
                  </g>
                );
              })()}

              {/* Doubly Head.prev -> null */}
              {isDoubly && (() => {
                const head = positionedNodes[0];
                const startX = head.x;
                const startY = head.y + 38;
                return (
                  <g key="head-prev-null">
                    <line
                      x1={startX - 24}
                      y1={startY}
                      x2={startX}
                      y2={startY}
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow-prev)"
                    />
                    <text
                      x={startX - 52}
                      y={startY + 3.5}
                      fill="var(--text-muted)"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      null
                    </text>
                  </g>
                );
              })()}
            </>
          )}

          {positionedNodes.map((node, idx) => {
            const nx = node.x;
            const ny = node.y;
            const paths = [];

            // 1. Next and Prev pointers between adjacent nodes
            if (idx < positionedNodes.length - 1) {
              const nextNode = positionedNodes[idx + 1];
              const nnx = nextNode.x;

              // Direct horizontal arrow
              const nextY = isDoubly ? ny + 20 : ny + 29;
              paths.push(
                <path
                  key={`next-${node.id}`}
                  d={`M ${nx + nodeW} ${nextY} L ${nnx - 2} ${nextY}`}
                  stroke="var(--accent-primary)"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow-next)"
                />
              );

              if (isDoubly) {
                const prevY = ny + 38;
                paths.push(
                  <path
                    key={`prev-${node.id}`}
                    d={`M ${nnx} ${prevY} L ${nx + nodeW + 2} ${prevY}`}
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    markerEnd="url(#arrow-prev)"
                  />
                );
              }
            }

            // 2. Circular Singly: Return Bus (tail.next -> head) cleanly below all nodes
            if (listType === 'circularSingly' && idx === positionedNodes.length - 1 && positionedNodes.length > 0) {
              const head = positionedNodes[0];
              const hx = head.x;
              const bottomBusY = nodeY + nodeH + 44;

              const loopPath = `M ${nx + nodeW / 2} ${ny + nodeH} ` +
                `L ${nx + nodeW / 2} ${bottomBusY} ` +
                `L ${hx + nodeW / 2} ${bottomBusY} ` +
                `L ${hx + nodeW / 2} ${ny + nodeH + 6}`;

              paths.push(
                <g key="circular-singly-bus">
                  <path
                    d={loopPath}
                    fill="none"
                    stroke="var(--accent-primary)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    markerEnd="url(#arrow-circular)"
                  />
                  <text
                    x={(nx + hx) / 2}
                    y={bottomBusY + 14}
                    textAnchor="middle"
                    fill="var(--accent-primary)"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    tail.next → head
                  </text>
                </g>
              );
            }

            // 3. Circular Doubly: Return Buses (cleanly above and below all nodes)
            if (listType === 'circularDoubly' && idx === positionedNodes.length - 1 && positionedNodes.length > 1) {
              const head = positionedNodes[0];
              const hx = head.x;
              const bottomBusY = nodeY + nodeH + 44;
              const topBusY = nodeY - 44;

              // Bottom bus: tail.next -> head
              const bottomLoop = `M ${nx + nodeW - 20} ${ny + nodeH} ` +
                `L ${nx + nodeW - 20} ${bottomBusY} ` +
                `L ${hx + 24} ${bottomBusY} ` +
                `L ${hx + 24} ${ny + nodeH + 6}`;

              // Top bus: head.prev -> tail
              const topLoop = `M ${hx + 24} ${ny} ` +
                `L ${hx + 24} ${topBusY} ` +
                `L ${nx + nodeW - 20} ${topBusY} ` +
                `L ${nx + nodeW - 20} ${ny - 6}`;

              paths.push(
                <g key="circular-doubly-buses">
                  {/* Next wrap (Bottom) */}
                  <path
                    d={bottomLoop}
                    fill="none"
                    stroke="var(--accent-primary)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    markerEnd="url(#arrow-next)"
                  />
                  <text
                    x={(nx + hx) / 2}
                    y={bottomBusY + 14}
                    textAnchor="middle"
                    fill="var(--accent-primary)"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    tail.next → head
                  </text>

                  {/* Prev wrap (Top) */}
                  <path
                    d={topLoop}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    markerEnd="url(#arrow-prev)"
                  />
                  <text
                    x={(nx + hx) / 2}
                    y={topBusY - 6}
                    textAnchor="middle"
                    fill="#F59E0B"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    head.prev → tail
                  </text>
                </g>
              );
            }

            return paths;
          })}
        </svg>

        {/* Nodes Layer */}
        {positionedNodes.map((node, index) => {
          const style = getNodeStyle(node);
          const isCurr = activePointers.curr === node.address;
          const isPrev = activePointers.prev === node.address;
          const isNext = activePointers.next === node.address;
          const isHead = index === 0;
          const isTail = index === positionedNodes.length - 1;

          return (
            <motion.div
              key={node.id}
              layoutId={node.id}
              className="absolute flex flex-col font-sans"
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${nodeW}px`,
                height: `${nodeH}px`,
              }}
            >
              {/* Active Pointer Indicators Floating Above Node */}
              <div className="absolute -top-5 left-0 right-0 flex items-center justify-center gap-1 text-[9px] font-mono font-medium pointer-events-none">
                {isPrev && <span className="bg-amber-500 text-white px-1.5 py-0.2 rounded-xs">prev</span>}
                {isCurr && <span className="bg-blue-500 text-white px-1.5 py-0.2 rounded-xs">curr</span>}
                {isNext && <span className="bg-emerald-500 text-white px-1.5 py-0.2 rounded-xs">next</span>}
              </div>

              {/* Node Card Shell */}
              <div
                className="flex flex-col border rounded-md shadow-xs overflow-hidden h-full transition-colors"
                style={{ backgroundColor: style.bg, borderColor: style.border }}
              >
                {/* Header Bar */}
                <div className="flex items-center justify-between px-2 py-0.5 bg-[var(--bg-elevated)] border-b border-[var(--border-hairline)] text-[10px] text-[var(--text-secondary)]">
                  <span className="font-mono text-[9px] text-[var(--text-muted)]">
                    [{index}]
                  </span>
                  <div className="flex items-center gap-1">
                    {isHead && (
                      <span className="text-[9px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1 rounded">
                        head
                      </span>
                    )}
                    {isTail && (
                      <span className="text-[9px] font-medium text-[var(--accent-primary)] bg-[var(--accent-subtle)] px-1 rounded">
                        tail
                      </span>
                    )}
                  </div>
                </div>

                {/* Compartment Body */}
                {isDoubly ? (
                  /* Doubly: 3 Compartments [ prev | val | next ] */
                  <div className="flex items-stretch flex-1">
                    {/* Left: prev */}
                    <div className="w-[54px] border-r border-[var(--border-hairline)] flex flex-col items-center justify-center px-1 bg-[var(--bg-panel)]/40 text-center">
                      <span className="text-[8px] text-[var(--text-muted)]">prev</span>
                      <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 truncate max-w-full">
                        {node.prevAddress ?? 'null'}
                      </span>
                    </div>

                    {/* Center: val */}
                    <div className="flex-1 flex flex-col items-center justify-center px-1">
                      <span className="text-sm font-semibold tracking-tight" style={{ color: style.text }}>
                        {node.value}
                      </span>
                    </div>

                    {/* Right: next */}
                    <div className="w-[54px] border-l border-[var(--border-hairline)] flex flex-col items-center justify-center px-1 bg-[var(--bg-panel)]/40 text-center">
                      <span className="text-[8px] text-[var(--text-muted)]">next</span>
                      <span className="text-[9px] font-mono text-[var(--accent-primary)] truncate max-w-full">
                        {node.nextAddress ?? 'null'}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Singly: 2 Compartments [ val | next ] */
                  <div className="flex items-stretch flex-1">
                    {/* Left: val */}
                    <div className="flex-1 flex flex-col items-center justify-center px-2">
                      <span className="text-sm font-semibold tracking-tight" style={{ color: style.text }}>
                        {node.value}
                      </span>
                    </div>

                    {/* Right: next */}
                    <div className="w-[54px] border-l border-[var(--border-hairline)] flex flex-col items-center justify-center px-1 bg-[var(--bg-panel)]/40 text-center">
                      <span className="text-[8px] text-[var(--text-muted)]">next</span>
                      <span className="text-[9px] font-mono text-[var(--accent-primary)] truncate max-w-full">
                        {node.nextAddress ?? 'null'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
