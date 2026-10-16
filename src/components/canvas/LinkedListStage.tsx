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
      <div className="flex items-center justify-center h-full text-stone-500 font-mono text-xs">
        INITIALIZING MEMORY POINTER BUS...
      </div>
    );
  }

  const isDoubly = listType === 'doubly' || listType === 'circularDoubly';
  const isCircular = listType === 'circularSingly' || listType === 'circularDoubly';

  const nodeW = isDoubly ? 210 : 150;
  const nodeH = 64;
  const gapX = isDoubly ? 48 : 42;
  const gapY = 85;
  const nodesPerRow = isDoubly ? 3 : 4;

  // Re-calculate dynamic positions on stage
  const positionedNodes = nodes.map((node, idx) => {
    const col = idx % nodesPerRow;
    const row = Math.floor(idx / nodesPerRow);
    const x = 50 + col * (nodeW + gapX);
    const y = 50 + row * (nodeH + gapY);
    return { ...node, x, y };
  });

  function getNodeStyle(node: MemoryNode) {
    let border = '#262522';
    let bg = '#111110';
    let text = '#F3F2EE';

    if (node.state === 'sorted') {
      border = '#00E676';
      bg = 'rgba(0, 230, 118, 0.12)';
      text = '#00E676';
    } else if (node.state === 'active' || node.state === 'swap') {
      border = '#FF4F00';
      bg = 'rgba(255, 79, 0, 0.18)';
      text = '#FF4F00';
    } else if (activePointers.curr === node.address) {
      border = '#FF2E93';
      bg = 'rgba(255, 46, 147, 0.15)';
      text = '#FF2E93';
    } else if (activePointers.prev === node.address) {
      border = '#FFB800';
      bg = 'rgba(255, 184, 0, 0.14)';
      text = '#FFB800';
    }

    return { border, bg, text };
  }

  const maxX = Math.max(...positionedNodes.map((n) => n.x + nodeW)) + 70;
  const maxY = Math.max(...positionedNodes.map((n) => n.y + nodeH)) + 90;

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative overflow-auto select-none">
      <div
        className="relative"
        style={{ width: `${Math.max(840, maxX)}px`, height: `${Math.max(440, maxY)}px` }}
      >
        {/* SVG Pointer Wiring Bus */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <marker
              id="arrow-next"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <path d="M 0 1 L 7 4 L 0 7 z" fill="#FF4F00" />
            </marker>
            <marker
              id="arrow-prev"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <path d="M 0 1 L 7 4 L 0 7 z" fill="#FFB800" />
            </marker>
            <marker
              id="arrow-circular"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <path d="M 0 1 L 7 4 L 0 7 z" fill="#FF4F00" />
            </marker>
          </defs>

          {/* Null Ground Symbol for Singly/Doubly ends */}
          {!isCircular && positionedNodes.length > 0 && (
            <>
              {/* Singly / Doubly Tail -> GND */}
              {(() => {
                const tail = positionedNodes[positionedNodes.length - 1];
                const endX = tail.x + nodeW;
                const endY = tail.y + (isDoubly ? 24 : 32);
                return (
                  <g key="tail-gnd">
                    <line x1={endX} y1={endY} x2={endX + 26} y2={endY} stroke="#FF4F00" strokeWidth="2" markerEnd="url(#arrow-next)" />
                    <text x={endX + 32} y={endY + 3} fill="#5C5952" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      NULL/GND
                    </text>
                  </g>
                );
              })()}

              {/* Doubly Head.prev -> GND */}
              {isDoubly && (() => {
                const head = positionedNodes[0];
                const startX = head.x;
                const startY = head.y + 42;
                return (
                  <g key="head-prev-gnd">
                    <line x1={startX - 26} y1={startY} x2={startX} y2={startY} stroke="#FFB800" strokeWidth="2" markerEnd="url(#arrow-prev)" />
                    <text x={startX - 72} y={startY + 3} fill="#5C5952" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      NULL/GND
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

            // 1. Next pointer edge between adjacent nodes
            if (idx < positionedNodes.length - 1) {
              const nextNode = positionedNodes[idx + 1];
              const nnx = nextNode.x;
              const nny = nextNode.y;

              if (Math.abs(ny - nny) < 10) {
                // Same row: direct horizontal arrow
                const nextY = isDoubly ? ny + 24 : ny + 32;
                paths.push(
                  <path
                    key={`next-${node.id}`}
                    d={`M ${nx + nodeW} ${nextY} L ${nnx - 2} ${nextY}`}
                    stroke="#FF4F00"
                    strokeWidth="2"
                    markerEnd="url(#arrow-next)"
                  />
                );

                // For Doubly: Bottom *PREV arrow pointing left
                if (isDoubly) {
                  const prevY = ny + 44;
                  paths.push(
                    <path
                      key={`prev-${node.id}`}
                      d={`M ${nnx} ${prevY} L ${nx + nodeW + 2} ${prevY}`}
                      stroke="#FFB800"
                      strokeWidth="2"
                      markerEnd="url(#arrow-prev)"
                    />
                  );
                }
              } else {
                // Row wrap
                const gutterY = ny + nodeH + 36;
                const pathNext = `M ${nx + nodeW} ${ny + 24} ` +
                  `L ${nx + nodeW + 18} ${ny + 24} ` +
                  `L ${nx + nodeW + 18} ${gutterY} ` +
                  `L 24 ${gutterY} ` +
                  `L 24 ${nny + 24} ` +
                  `L ${nnx - 2} ${nny + 24}`;

                paths.push(
                  <path
                    key={`wrap-next-${node.id}`}
                    d={pathNext}
                    fill="none"
                    stroke="#FF4F00"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    markerEnd="url(#arrow-next)"
                  />
                );

                if (isDoubly) {
                  const gutterPrevY = ny + nodeH + 42;
                  const pathPrev = `M ${nnx} ${nny + 44} ` +
                    `L 18 ${nny + 44} ` +
                    `L 18 ${gutterPrevY} ` +
                    `L ${nx + nodeW + 24} ${gutterPrevY} ` +
                    `L ${nx + nodeW + 24} ${ny + 44} ` +
                    `L ${nx + nodeW + 2} ${ny + 44}`;

                  paths.push(
                    <path
                      key={`wrap-prev-${node.id}`}
                      d={pathPrev}
                      fill="none"
                      stroke="#FFB800"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      markerEnd="url(#arrow-prev)"
                    />
                  );
                }
              }
            }

            // 2. Circular Singly: Return Bus (Last node *NEXT -> First node)
            if (listType === 'circularSingly' && idx === positionedNodes.length - 1 && positionedNodes.length > 0) {
              const head = positionedNodes[0];
              const hx = head.x;
              const hy = head.y;
              const busY = maxY - 24;

              const loopPath = `M ${nx + nodeW - 20} ${ny + nodeH} ` +
                `L ${nx + nodeW - 20} ${busY} ` +
                `L ${hx + 24} ${busY} ` +
                `L ${hx + 24} ${hy + nodeH + 2}`;

              paths.push(
                <g key="circular-singly-bus">
                  <path
                    d={loopPath}
                    fill="none"
                    stroke="#FF4F00"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                    markerEnd="url(#arrow-circular)"
                  />
                  <text
                    x={nx / 2 + 30}
                    y={busY - 6}
                    fill="#FF4F00"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    RETURN BUS: LAST.NEXT ➔ 0x4F10 [HEAD]
                  </text>
                </g>
              );
            }

            // 3. Circular Doubly: Dual Wrap-around Return Buses
            if (listType === 'circularDoubly' && idx === positionedNodes.length - 1 && positionedNodes.length > 1) {
              const head = positionedNodes[0];
              const hx = head.x;
              const hy = head.y;
              const bottomBusY = maxY - 24;
              const topBusY = 16;

              // Bottom bus: Last.next -> Head (Orange)
              const bottomLoop = `M ${nx + nodeW - 25} ${ny + nodeH} ` +
                `L ${nx + nodeW - 25} ${bottomBusY} ` +
                `L ${hx + 30} ${bottomBusY} ` +
                `L ${hx + 30} ${hy + nodeH + 2}`;

              // Top bus: Head.prev -> Last (Amber)
              const topLoop = `M ${hx + 15} ${hy} ` +
                `L ${hx + 15} ${topBusY} ` +
                `L ${nx + nodeW - 15} ${topBusY} ` +
                `L ${nx + nodeW - 15} ${ny - 2}`;

              paths.push(
                <g key="circular-doubly-buses">
                  {/* Next wrap (Orange) */}
                  <path
                    d={bottomLoop}
                    fill="none"
                    stroke="#FF4F00"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                    markerEnd="url(#arrow-next)"
                  />
                  <text
                    x={nx / 2 + 20}
                    y={bottomBusY - 6}
                    fill="#FF4F00"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    RING BUS: LAST.NEXT ➔ 0x4F10 [HEAD]
                  </text>

                  {/* Prev wrap (Amber) */}
                  <path
                    d={topLoop}
                    fill="none"
                    stroke="#FFB800"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                    markerEnd="url(#arrow-prev)"
                  />
                  <text
                    x={nx / 2 + 20}
                    y={topBusY + 12}
                    fill="#FFB800"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    RING BUS: HEAD.PREV ➔ {node.address} [TAIL]
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
              className="absolute flex flex-col font-mono"
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${nodeW}px`,
                height: `${nodeH}px`,
              }}
            >
              {/* Pointer Badges on Top */}
              <div className="absolute -top-5 left-0 right-0 flex items-center justify-between text-[8px] font-bold pointer-events-none">
                {isPrev && <span className="bg-[#FFB800] text-[#090908] px-1 py-0.2">PREV</span>}
                {isCurr && <span className="bg-[#FF2E93] text-[#090908] px-1 py-0.2">CURR</span>}
                {isNext && <span className="bg-[#D4FF00] text-[#090908] px-1 py-0.2">NEXT</span>}
              </div>

              {/* Node Header Bar: Address + Indicator Badge */}
              <div className="flex items-center justify-between px-2 py-0.5 bg-[#181816] border-t border-x border-[#262522] text-[9px] text-[#9E9B93]">
                <span className="font-semibold text-[#D6D3CD]">ADDR: {node.address}</span>
                {listType === 'circularDoubly' && isHead && (
                  <span className="text-[8px] font-bold text-[#FF4F00] bg-[#FF4F00]/10 px-1 border border-[#FF4F00]/30">
                    [HEAD ⇄ TAIL RING]
                  </span>
                )}
                {listType !== 'circularDoubly' && isHead && (
                  <span className="text-[8px] font-bold text-[#00E676] bg-[#00E676]/10 px-1 border border-[#00E676]/30">
                    START
                  </span>
                )}
                {isTail && (
                  <span className="text-[8px] font-bold text-[#FF4F00] bg-[#FF4F00]/10 px-1 border border-[#FF4F00]/30">
                    LAST
                  </span>
                )}
              </div>

              {/* Compartment Body */}
              {isDoubly ? (
                /* Doubly & Circular Doubly: 3 Compartments [ *PREV | DATA | *NEXT ] */
                <div
                  className="flex items-stretch border h-full shadow-lg"
                  style={{ backgroundColor: style.bg, borderColor: style.border }}
                >
                  {/* Left Compartment: *PREV */}
                  <div className="w-[72px] border-r border-[#262522] flex flex-col items-center justify-center px-1 bg-[#141412] text-center">
                    <span className="text-[7.5px] uppercase font-bold text-[#FFB800]">*PREV</span>
                    <span className="text-[8.5px] font-mono text-[#FFD666] truncate max-w-full">
                      {node.prevAddress ?? 'NULL'}
                    </span>
                  </div>

                  {/* Center Compartment: DATA */}
                  <div className="flex-1 flex flex-col items-center justify-center px-1">
                    <span className="text-[7.5px] uppercase text-[#5C5952] font-semibold">DATA</span>
                    <span className="text-base font-bold tracking-tight" style={{ color: style.text }}>
                      {node.value}
                    </span>
                  </div>

                  {/* Right Compartment: *NEXT */}
                  <div className="w-[72px] border-l border-[#262522] flex flex-col items-center justify-center px-1 bg-[#141412] text-center">
                    <span className="text-[7.5px] uppercase font-bold text-[#FF4F00]">*NEXT</span>
                    <span className="text-[8.5px] font-mono text-[#FF9466] truncate max-w-full">
                      {node.nextAddress ?? 'NULL'}
                    </span>
                  </div>
                </div>
              ) : (
                /* Singly & Circular Singly: 2 Compartments [ DATA | *NEXT ] */
                <div
                  className="flex items-stretch border h-full shadow-lg"
                  style={{ backgroundColor: style.bg, borderColor: style.border }}
                >
                  {/* Left Compartment: DATA */}
                  <div className="flex-1 flex flex-col items-center justify-center px-2">
                    <span className="text-[7.5px] uppercase text-[#5C5952] font-semibold">DATA</span>
                    <span className="text-base font-bold tracking-tight" style={{ color: style.text }}>
                      {node.value}
                    </span>
                  </div>

                  {/* Right Compartment: *NEXT */}
                  <div className="w-[76px] border-l border-[#262522] flex flex-col items-center justify-center px-1 bg-[#141412] text-center">
                    <span className="text-[7.5px] uppercase font-bold text-[#FF4F00]">*NEXT</span>
                    <span className="text-[8.5px] font-mono text-[#FF9466] truncate max-w-full">
                      {node.nextAddress ?? 'NULL'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
