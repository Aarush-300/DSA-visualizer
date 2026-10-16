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
      <div className="flex items-center justify-center h-full text-[var(--text-muted)] font-mono text-xs">
        INITIALIZING TREE REGISTER STAGE...
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
                      stroke="#00E676"
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
                borderColor = '#00E676';
                bgColor = 'rgba(0, 230, 118, 0.14)';
                badgeText = 'LEAF DATA';
                badgeStyle = 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/40';
              } else {
                borderColor = 'var(--border-strong)';
                bgColor = 'var(--bg-elevated)';
                badgeText = 'INDEX';
                badgeStyle = 'bg-[var(--bg-elevated)] text-[var(--accent-primary)] border-[var(--accent-primary)]/40';
              }
            }

            if (isHighlight) {
              borderColor = '#FF4F00';
              bgColor = 'rgba(255, 79, 0, 0.22)';
            } else if (isVerified) {
              borderColor = '#00E676';
              bgColor = 'rgba(0, 230, 118, 0.20)';
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
                  className="flex items-stretch border shadow-md"
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
    if (Math.abs(bf) > 1) return { bg: 'var(--accent-primary)', text: 'var(--text-on-accent)' }; // Imbalance
    if (bf === 0) return { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)' };
    return { bg: 'rgba(255, 184, 0, 0.25)', text: '#FFB800' };
  }

  function getNodeVisuals(id: string) {
    const node = nodes[id];
    let fill = 'var(--node-idle-bg)';
    let border = 'var(--node-idle-border)';
    let text = 'var(--node-idle-text)';

    if (currentFrame?.activeIds?.includes(node.id) || node.state === 'compare' || node.state === 'comparing') {
      fill = 'rgba(255, 184, 0, 0.20)';
      border = '#FFB800';
      text = '#FFB800';
    } else if (currentFrame?.pivotIds?.includes(node.id) || node.state === 'pivot') {
      fill = 'rgba(255, 46, 147, 0.22)';
      border = '#FF2E93';
      text = '#FF2E93';
    } else if (currentFrame?.mutateIds?.includes(node.id) || node.state === 'swap' || node.state === 'active') {
      fill = 'rgba(255, 79, 0, 0.24)';
      border = '#FF4F00';
      text = '#FF4F00';
    } else if (currentFrame?.sortedIds?.includes(node.id) || node.state === 'sorted') {
      fill = 'rgba(0, 230, 118, 0.20)';
      border = '#00E676';
      text = '#00E676';
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
            className="absolute top-1 right-6 z-20 px-3 py-1.5 bg-[var(--bg-panel)] border border-[var(--accent-primary)] flex items-center gap-2 shadow-xl"
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
                className="w-11 h-11 rounded-full border flex items-center justify-center shadow-md relative transition-all duration-150"
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
