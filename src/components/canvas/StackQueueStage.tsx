import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { StackQueueSnapshot } from '../../types/stacksQueues';
import { CornerDownLeft, CornerDownRight, ArrowRight } from 'lucide-react';

export const StackQueueStage: React.FC = () => {
  const { frames, currentStepIndex } = usePlaygroundStore();
  const currentFrame = frames[currentStepIndex];
  const snapshot = currentFrame?.snapshot as StackQueueSnapshot | undefined;

  if (!snapshot) {
    return (
      <div className="flex items-center justify-center h-full text-stone-500 font-mono text-xs">
        INITIALIZING MEMORY CONTROLLER...
      </div>
    );
  }

  const { structureType, items, capacity, topIndex, frontIndex, rearIndex, heapNodes, telemetry } = snapshot;

  const getItemColor = (state: string) => {
    switch (state) {
      case 'active':
      case 'mutate':
        return { bg: 'rgba(255, 79, 0, 0.18)', border: '#FF4F00', text: '#FF4F00' };
      case 'comparing':
      case 'compare':
        return { bg: 'rgba(255, 184, 0, 0.16)', border: '#FFB800', text: '#FFB800' };
      case 'inspecting':
        return { bg: 'rgba(212, 255, 0, 0.14)', border: '#D4FF00', text: '#D4FF00' };
      case 'sorted':
        return { bg: 'rgba(0, 230, 118, 0.16)', border: '#00E676', text: '#00E676' };
      default:
        return { bg: '#181816', border: '#262522', text: '#F3F2EE' };
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-auto">
      {/* Telemetry Equation Banner */}
      {telemetry?.formula && (
        <div className="absolute top-4 left-6 z-10 flex items-center gap-2 bg-[#111110] border border-[#262522] px-3 py-1 font-mono text-[11px] text-[#9E9B93]">
          <span className="text-[#FF4F00] font-bold">ALU LOGIC:</span>
          <span className="text-[#F3F2EE]">{telemetry.formula}</span>
        </div>
      )}

      {/* ---------------- 1. STACK (VERTICAL CHAMBER) ---------------- */}
      {structureType === 'stack' && (
        <div className="flex items-end justify-center gap-8 min-h-[380px]">
          {/* Chamber Container */}
          <div className="relative flex flex-col justify-end w-72 h-[340px] border-x-2 border-b-4 border-[#3B3935] bg-[#0E0E0D] p-2">
            {/* Open Top Indicator */}
            <div className="absolute -top-6 left-0 right-0 flex justify-between items-center text-[10px] font-mono text-[#5C5952] px-1">
              <span>▼ PUSH PORT</span>
              <span>▲ POP PORT</span>
            </div>

            {/* Stack Elements (reversed: bottom is index 0) */}
            <div className="flex flex-col-reverse gap-1.5 w-full">
              <AnimatePresence>
                {items.map((item, idx) => {
                  const colors = getItemColor(item.state);
                  const isTop = idx === topIndex;
                  return (
                    <motion.div
                      key={item.id}
                      layoutId={item.id}
                      initial={{ opacity: 0, y: -40, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -50, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className="relative h-11 w-full border flex items-center justify-between px-3 font-mono"
                      style={{
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                      }}
                    >
                      <span className="text-[10px] text-[#5C5952]">
                        0x7FFF_{(idx * 4).toString(16).padStart(2, '0').toUpperCase()}
                      </span>

                      <span
                        className="text-base font-bold tracking-wider"
                        style={{ color: colors.text }}
                      >
                        {item.value}
                      </span>

                      <span className="text-[10px] text-[#9E9B93]">SLOT [{idx}]</span>

                      {/* SP Indicator on Top Item */}
                      {isTop && (
                        <div className="absolute -left-20 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#FF4F00] text-[#090908] px-1.5 py-0.5 text-[10px] font-bold font-mono">
                          <span>SP</span>
                          <ArrowRight size={10} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {items.length === 0 && (
              <div className="h-full flex items-center justify-center font-mono text-xs text-[#5C5952]">
                [EMPTY STACK CHAMBER]
              </div>
            )}
          </div>

          {/* Side Capacity Register */}
          <div className="flex flex-col justify-between h-[340px] text-[10px] font-mono text-[#5C5952] py-2">
            <span>MAX CAP: {capacity}</span>
            <div className="flex flex-col gap-1 items-center">
              <span className="text-[#FF4F00] font-bold">{items.length} / {capacity}</span>
              <div className="w-1.5 h-32 bg-[#181816] border border-[#262522] overflow-hidden flex flex-col-reverse">
                <div
                  className="w-full bg-[#FF4F00] transition-all"
                  style={{ height: `${(items.length / capacity) * 100}%` }}
                />
              </div>
            </div>
            <span>BASE: 0x7FFF_00</span>
          </div>
        </div>
      )}

      {/* ---------------- 2. LINEAR QUEUE (CONVEYOR) ---------------- */}
      {structureType === 'linearQueue' && (
        <div className="flex flex-col items-center gap-6">
          {/* Conveyor Gates */}
          <div className="flex items-center gap-4 w-full max-w-3xl">
            {/* Front Dequeue Gate */}
            <div className="flex flex-col items-center border border-[#FF4F00]/40 bg-[#FF4F00]/5 px-3 py-2 text-[10px] font-mono text-[#FF4F00]">
              <CornerDownLeft size={16} />
              <span className="font-bold mt-1">EXIT GATE</span>
              <span>DEQUEUE</span>
            </div>

            {/* Conveyor Track */}
            <div className="flex-1 flex gap-2 p-2 border-y-2 border-[#3B3935] bg-[#0E0E0D] min-h-[72px] items-center">
              <AnimatePresence>
                {items.map((item, idx) => {
                  const colors = getItemColor(item.state);
                  const isFront = idx === frontIndex;
                  const isRear = idx === rearIndex;

                  return (
                    <motion.div
                      key={item.id}
                      layoutId={item.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className="relative flex-1 h-14 border flex flex-col items-center justify-center font-mono"
                      style={{
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                      }}
                    >
                      <span className="text-base font-bold" style={{ color: colors.text }}>
                        {item.value}
                      </span>
                      <span className="text-[9px] text-[#5C5952]">[{idx}]</span>

                      {/* Front Pointer Badge */}
                      {isFront && (
                        <div className="absolute -top-6 bg-[#00E676] text-[#090908] px-1 text-[9px] font-bold font-mono">
                          FRONT
                        </div>
                      )}

                      {/* Rear Pointer Badge */}
                      {isRear && (
                        <div className="absolute -bottom-6 bg-[#FF4F00] text-[#090908] px-1 text-[9px] font-bold font-mono">
                          REAR
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {items.length === 0 && (
                <div className="w-full text-center font-mono text-xs text-[#5C5952]">
                  [EMPTY CONVEYOR TRACK]
                </div>
              )}
            </div>

            {/* Rear Enqueue Gate */}
            <div className="flex flex-col items-center border border-[#FF4F00]/40 bg-[#FF4F00]/5 px-3 py-2 text-[10px] font-mono text-[#FF4F00]">
              <CornerDownRight size={16} />
              <span className="font-bold mt-1">INTAKE GATE</span>
              <span>ENQUEUE</span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 3. CIRCULAR QUEUE (RADIAL RING BUFFER) ---------------- */}
      {structureType === 'circularQueue' && (
        <div className="relative w-[360px] h-[360px] flex items-center justify-center">
          {/* Radial SVG Dial Track */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 360">
            <circle cx="180" cy="180" r="130" fill="none" stroke="#262522" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="180" cy="180" r="70" fill="#0D0D0C" stroke="#3B3935" strokeWidth="1" />
          </svg>

          {/* Center Telemetry Readout */}
          <div className="z-10 flex flex-col items-center text-center font-mono">
            <span className="text-[10px] text-[#5C5952] tracking-wider">RING BUFFER</span>
            <span className="text-sm font-bold text-[#F3F2EE] mt-0.5">N = {capacity}</span>
            <span className="text-[10px] text-[#FF4F00] font-semibold mt-1">
              (R+1)%{capacity}
            </span>
          </div>

          {/* 8 Radial Slots */}
          {items.map((item, idx) => {
            const angle = (idx * 45 - 90) * (Math.PI / 180);
            const r = 130;
            const x = 180 + r * Math.cos(angle) - 26;
            const y = 180 + r * Math.sin(angle) - 26;
            const isFront = idx === frontIndex;
            const isRear = idx === rearIndex;
            const colors = getItemColor(item.state);
            const isEmpty = item.isGhost;

            return (
              <motion.div
                key={item.id}
                className="absolute w-[52px] h-[52px] border flex flex-col items-center justify-center font-mono rounded-none"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  backgroundColor: isEmpty ? '#111110' : colors.bg,
                  borderColor: isFront ? '#00E676' : isRear ? '#FF4F00' : colors.border,
                }}
              >
                <span className="text-[9px] text-[#5C5952]">SLOT {idx}</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: isEmpty ? '#3B3935' : colors.text }}
                >
                  {isEmpty ? '—' : item.value}
                </span>

                {/* Front Pointer Ring Indicator */}
                {isFront && (
                  <span className="absolute -top-4 bg-[#00E676] text-[#090908] text-[8px] font-bold px-1">
                    FRONT
                  </span>
                )}

                {/* Rear Pointer Ring Indicator */}
                {isRear && (
                  <span className="absolute -bottom-4 bg-[#FF4F00] text-[#090908] text-[8px] font-bold px-1">
                    REAR
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ---------------- 4. PRIORITY QUEUE (SPLIT ARRAY & BINARY HEAP) ---------------- */}
      {structureType === 'priorityQueue' && (
        <div className="w-full flex flex-col items-center gap-6">
          {/* Top View: Sequential Array Cards */}
          <div className="flex flex-col items-center gap-1 w-full max-w-2xl">
            <span className="text-[10px] font-mono text-[#5C5952] self-start uppercase tracking-wider">
              [LAYER 1: SEQUENTIAL HEAP ARRAY BUFFER]
            </span>
            <div className="flex gap-2 w-full p-2 bg-[#0E0E0D] border border-[#262522] overflow-x-auto">
              {items.map((item, idx) => {
                const colors = getItemColor(item.state);
                return (
                  <div
                    key={item.id}
                    className="flex-1 min-w-[70px] h-14 border flex flex-col items-center justify-center font-mono p-1"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                  >
                    <span className="text-[9px] text-[#5C5952]">[{idx}]</span>
                    <span className="text-sm font-bold" style={{ color: colors.text }}>
                      {item.value}
                    </span>
                    <span className="text-[9px] text-[#FF4F00] font-semibold">
                      P:{item.priority ?? item.value}
                    </span>
                  </div>
                );
              })}
              {items.length === 0 && (
                <div className="w-full text-center font-mono text-xs text-[#5C5952] py-2">
                  [EMPTY PRIORITY QUEUE]
                </div>
              )}
            </div>
          </div>

          {/* Bottom View: Complete Binary Tree Layout */}
          <div className="flex flex-col items-center gap-1 w-full max-w-2xl relative">
            <span className="text-[10px] font-mono text-[#5C5952] self-start uppercase tracking-wider">
              [LAYER 2: BINARY MAX-HEAP SYNCHRONIZED TOPOLOGY]
            </span>

            <div className="relative w-full h-[220px] bg-[#0E0E0D] border border-[#262522] flex items-center justify-center overflow-hidden">
              {/* SVG Edges connecting parent to children */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {heapNodes?.map((node) => {
                  const edges = [];
                  if (node.leftChildIndex !== undefined && heapNodes[node.leftChildIndex]) {
                    const left = heapNodes[node.leftChildIndex];
                    edges.push(
                      <line
                        key={`edge-${node.id}-left`}
                        x1={node.x + 300}
                        y1={node.y + 35}
                        x2={left.x + 300}
                        y2={left.y + 35}
                        stroke="#3B3935"
                        strokeWidth="2"
                      />
                    );
                  }
                  if (node.rightChildIndex !== undefined && heapNodes[node.rightChildIndex]) {
                    const right = heapNodes[node.rightChildIndex];
                    edges.push(
                      <line
                        key={`edge-${node.id}-right`}
                        x1={node.x + 300}
                        y1={node.y + 35}
                        x2={right.x + 300}
                        y2={right.y + 35}
                        stroke="#3B3935"
                        strokeWidth="2"
                      />
                    );
                  }
                  return edges;
                })}
              </svg>

              {/* Heap Tree Nodes */}
              {heapNodes?.map((node) => {
                const colors = getItemColor(node.state);
                return (
                  <motion.div
                    key={node.id}
                    layoutId={`heap-${node.id}`}
                    className="absolute w-12 h-12 border flex flex-col items-center justify-center font-mono rounded-none"
                    style={{
                      transform: `translate(${node.x}px, ${node.y - 75}px)`,
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: colors.text }}>
                      {node.value}
                    </span>
                    <span className="text-[8px] text-[#FF4F00] font-semibold">
                      P:{node.priority}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 5. DOUBLE-ENDED QUEUE (DEQUE) ---------------- */}
      {structureType === 'deque' && (
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 w-full max-w-3xl">
            {/* Left Dual Gate */}
            <div className="flex flex-col items-center gap-1 border border-[#3B3935] bg-[#111110] px-3 py-2 text-[10px] font-mono text-[#9E9B93]">
              <span className="text-[#00E676] font-bold">◄ INSERT FRONT</span>
              <span className="text-[#FF2E93] font-bold">► DELETE FRONT</span>
            </div>

            {/* Chamber */}
            <div className="flex-1 flex gap-2 p-2 border-y-2 border-[#3B3935] bg-[#0E0E0D] min-h-[72px] items-center">
              <AnimatePresence>
                {items.map((item, idx) => {
                  const colors = getItemColor(item.state);
                  const isFront = idx === 0;
                  const isRear = idx === items.length - 1;

                  return (
                    <motion.div
                      key={item.id}
                      layoutId={item.id}
                      className="relative flex-1 h-14 border flex flex-col items-center justify-center font-mono"
                      style={{
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                      }}
                    >
                      <span className="text-base font-bold" style={{ color: colors.text }}>
                        {item.value}
                      </span>
                      <span className="text-[9px] text-[#5C5952]">[{idx}]</span>

                      {isFront && (
                        <div className="absolute -top-6 bg-[#00E676] text-[#090908] px-1 text-[9px] font-bold font-mono">
                          FRONT
                        </div>
                      )}
                      {isRear && (
                        <div className="absolute -bottom-6 bg-[#FF4F00] text-[#090908] px-1 text-[9px] font-bold font-mono">
                          REAR
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {items.length === 0 && (
                <div className="w-full text-center font-mono text-xs text-[#5C5952]">
                  [EMPTY DEQUE CHAMBER]
                </div>
              )}
            </div>

            {/* Right Dual Gate */}
            <div className="flex flex-col items-center gap-1 border border-[#3B3935] bg-[#111110] px-3 py-2 text-[10px] font-mono text-[#9E9B93]">
              <span className="text-[#00E676] font-bold">► INSERT REAR</span>
              <span className="text-[#FF2E93] font-bold">◄ DELETE REAR</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
