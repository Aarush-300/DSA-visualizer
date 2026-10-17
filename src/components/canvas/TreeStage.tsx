import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import { MultiKeyNodeData, TreeSnapshot } from '../../types/trees';
import { SPRING_TREE } from '../../utils/motionPresets';

export const TreeStage: React.FC = () => {
  const { frames, currentStepIndex } = usePlaygroundStore();
  const currentFrame = frames[currentStepIndex];
  const snapshot = currentFrame?.snapshot as TreeSnapshot | undefined;
  const nodes = snapshot?.nodes ?? {};
  const multiKeyNodes = snapshot?.multiKeyNodes ?? {};
  const rootId = snapshot?.rootId;
  const activeRotation = snapshot?.activeRotation;
  const treeFamily = snapshot?.treeFamily ?? 'binary';

  if (!rootId && Object.keys(nodes).length === 0 && Object.keys(multiKeyNodes).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] font-mono text-xs gap-3">
        <div className="flex items-center gap-2 px-4 py-2 border border-[var(--border-hairline)] bg-[var(--bg-panel)] shadow-sm">
          <span className="text-[var(--accent-primary)] font-bold">TREE ROOT:</span>
          <span className="text-[var(--text-muted)]">NULL / 0x0000</span>
        </div>
        <p className="text-[11px] text-[var(--text-secondary)]">
          Tree contains 0 keys. Use + INSERT to balance keys.
        </p>
      </div>
    );
  }

  // ---------------- MULTI-KEY TREE RENDERING (M-WAY, B-TREE, B+ TREE) ----------------
  if (treeFamily === 'mway' || treeFamily === 'btree' || treeFamily === 'bplus') {
    const multiNodesList: MultiKeyNodeData[] = Object.values(multiKeyNodes);

    return (
      <div className="flex flex-col items-center justify-center w-full h-[450px] relative select-none overflow-auto">
        <div className="relative w-[840px] h-[400px]">
          {/* SVG Connector Lines and B+ Leaf Chains */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <marker
                id="leaf-chain-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <path d="M 0 1 L 7 4 L 0 7 z" fill="#00E676" />
              </marker>
            </defs>

            {/* Tree Branch Edges */}
            {multiNodesList.map((node) => {
              return node.childrenIds.map((childId) => {
                const child = multiKeyNodes[childId];
                if (!child) return null;
                return (
                  <line
                    key={`branch-${node.id}->${child.id}`}
                    x1={node.x}
                    y1={node.y + 20}
                    x2={child.x}
                    y2={child.y - 14}
                    stroke="var(--border-strong)"
                    strokeWidth="1.5"
                  />
                );
              });
            })}

            {/* B+ Tree Emerald Leaf Bus Chain */}
            {treeFamily === 'bplus' &&
              multiNodesList.map((node) => {
                if (!node.isLeaf || !node.nextLeafId) return null;
                const nextLeaf = multiKeyNodes[node.nextLeafId];
                if (!nextLeaf) return null;

                const nodeWidth = 40 + node.keys.length * 40;
                return (
                  <g key={`leaf-bus-${node.id}->${nextLeaf.id}`}>
                    <path
                      d={`M ${node.x + nodeWidth / 2} ${node.y} L ${nextLeaf.x - nodeWidth / 2 - 4} ${nextLeaf.y}`}
                      stroke="#059669"
                      strokeWidth="2"
                      markerEnd="url(#leaf-chain-arrow)"
                    />
                  </g>
                );
              })}
          </svg>

          {/* Multi-Key Node Blocks */}
          {multiNodesList.map((node) => {
            const isHighlight =
              currentFrame?.activeIds?.includes(node.id) ||
              currentFrame?.mutateIds?.includes(node.id) ||
              node.state === 'active' ||
              node.state === 'comparing';

            const isVerified =
              currentFrame?.sortedIds?.includes(node.id) || node.state === 'sorted';

            let borderColor = 'var(--node-idle-border)';
            let bgColor = 'var(--node-idle-bg)';
            let badgeText = 'NODE';
            let badgeStyle = 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-strong)]';

            if (treeFamily === 'bplus') {
              if (node.isLeaf) {
                borderColor = '#059669';
                bgColor = 'var(--state-sorted-verified-bg)';
                badgeText = 'LEAF DATA';
                badgeStyle = 'bg-[#059669]/10 text-[#059669] border-[#059669]/40';
              } else {
                borderColor = 'var(--border-strong)';
                bgColor = 'var(--bg-elevated)';
                badgeText = 'INDEX';
                badgeStyle = 'bg-[var(--bg-elevated)] text-[var(--accent-primary)] border-[var(--accent-primary)]/40';
              }
            }

            if (isHighlight) {
              borderColor = '#EA580C';
              bgColor = 'var(--state-mutate-swap-bg)';
            } else if (isVerified) {
              borderColor = '#059669';
              bgColor = 'var(--state-sorted-verified-bg)';
            }

            return (
              <motion.div
                key={node.id}
                layout
                transition={SPRING_TREE}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 font-mono"
                style={{ left: node.x, top: node.y }}
              >
                {/* Node Type Badge (for B+ Tree) */}
                {treeFamily === 'bplus' && (
                  <span
                    className={`text-[8px] font-bold px-1.5 py-0.2 mb-0.5 border ${badgeStyle}`}
                  >
                    {badgeText}
                  </span>
                )}

                {/* Multi-Key Block: [ *P0 | K1 | *P1 | K2 | *P2 ] */}
                <div
                  className="flex items-stretch border-[1.5px] rounded-sm shadow-[var(--node-idle-shadow)]"
                  style={{ backgroundColor: bgColor, borderColor }}
                >
                  {/* Leftmost pointer *P0 */}
                  <div className="px-1.5 py-1 border-r border-[var(--border-hairline)] text-[8px] text-[var(--text-muted)] flex items-center justify-center bg-[var(--node-header-bg)]">
                    <span>*P0</span>
                  </div>

                  {node.keys.map((key, kIdx) => (
                    <React.Fragment key={`${node.id}-key-${kIdx}`}>
                      {/* Key Cell */}
                      <div className="px-2.5 py-1 text-xs font-bold flex items-center justify-center text-[var(--node-idle-text)] min-w-[32px]">
                        <span>{key}</span>
                      </div>

                      {/* Right Child Pointer *Pi */}
                      <div className="px-1.5 py-1 border-l border-[var(--border-hairline)] text-[8px] text-[var(--text-muted)] flex items-center justify-center bg-[var(--node-header-bg)]">
                        <span>*P{kIdx + 1}</span>
                      </div>
                    </React.Fragment>
                  ))}

                  {node.keys.length === 0 && (
                    <div className="px-3 py-1 text-xs text-[var(--text-muted)]">EMPTY</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------------- BINARY TREE RENDERING (BST / AVL) ----------------
  const edges: { from: { x: number; y: number }; to: { x: number; y: number }; id: string }[] = [];
  for (const node of Object.values(nodes)) {
    if (node.leftId && nodes[node.leftId]) {
      edges.push({
        from: { x: node.x, y: node.y },
        to: { x: nodes[node.leftId].x, y: nodes[node.leftId].y },
        id: `${node.id}->${node.leftId}`,
      });
    }
    if (node.rightId && nodes[node.rightId]) {
      edges.push({
        from: { x: node.x, y: node.y },
        to: { x: nodes[node.rightId].x, y: nodes[node.rightId].y },
        id: `${node.id}->${node.rightId}`,
      });
    }
  }

  function getBFBadgeColor(bf: number) {
    if (Math.abs(bf) > 1) return { bg: '#E11D48', text: '#FFFFFF' }; // Imbalance
    if (bf === 0) return { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)' };
    return { bg: 'var(--state-active-compare-bg)', text: '#F59E0B' };
  }

  function getNodeVisuals(id: string) {
    const node = nodes[id];
    let fill = 'var(--node-idle-bg)';
    let border = 'var(--node-idle-border)';
    let text = 'var(--node-idle-text)';

    if (currentFrame?.activeIds?.includes(node.id) || node.state === 'compare' || node.state === 'comparing') {
      fill = 'var(--state-active-compare-bg)';
      border = '#F59E0B';
      text = '#F59E0B';
    } else if (currentFrame?.pivotIds?.includes(node.id) || node.state === 'pivot') {
      fill = 'var(--state-active-window-bg)';
      border = '#4F46E5';
      text = '#4F46E5';
    } else if (currentFrame?.mutateIds?.includes(node.id) || node.state === 'swap' || node.state === 'active') {
      fill = 'var(--state-mutate-swap-bg)';
      border = '#EA580C';
      text = '#EA580C';
    } else if (currentFrame?.sortedIds?.includes(node.id) || node.state === 'sorted') {
      fill = 'var(--state-sorted-verified-bg)';
      border = '#059669';
      text = '#059669';
    }

    return { fill, border, text };
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-[450px] relative select-none">
      <AnimatePresence>
        {activeRotation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-1 right-6 z-20 px-3 py-1.5 bg-[var(--bg-island)] border border-[var(--accent-primary)] rounded-md flex items-center gap-2 shadow-[var(--node-idle-shadow)]"
          >
            <span className="w-2 h-2 bg-[var(--accent-primary)] animate-pulse" />
            <span className="font-mono text-xs text-[var(--accent-primary)] font-bold uppercase">
              {activeRotation.description}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-[800px] h-[400px]">
        {/* SVG Connector Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edges.map((edge) => (
            <line
              key={edge.id}
              x1={edge.from.x}
              y1={edge.from.y}
              x2={edge.to.x}
              y2={edge.to.y}
              stroke="var(--border-strong)"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        {/* Tree Nodes Layer */}
        {Object.values(nodes).map((node) => {
          const vis = getNodeVisuals(node.id);
          const bfColors = getBFBadgeColor(node.balanceFactor);

          return (
            <motion.div
              key={node.id}
              layout
              transition={SPRING_TREE}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center group cursor-pointer"
              style={{ left: node.x, top: node.y }}
            >
              {/* Circular Node Bubble */}
              <div
                className="w-11 h-11 rounded-full border-[1.5px] flex items-center justify-center shadow-[var(--node-idle-shadow)] relative transition-all duration-150"
                style={{
                  backgroundColor: vis.fill,
                  borderColor: vis.border,
                }}
              >
                <span
                  className="font-mono text-xs font-bold tracking-tight"
                  style={{ color: vis.text }}
                >
                  {node.value}
                </span>

                {/* Balance Factor Tag */}
                <div
                  className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded text-[8px] font-mono font-bold tracking-tight border border-[var(--border-hairline)] shadow-sm"
                  style={{
                    backgroundColor: bfColors.bg,
                    color: bfColors.text,
                  }}
                >
                  {node.balanceFactor > 0 ? `+${node.balanceFactor}` : node.balanceFactor}
                </div>
              </div>

              {/* Sub-label height */}
              <span className="font-mono text-[9px] text-[var(--text-muted)] mt-1">
                H={node.height}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
