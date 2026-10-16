import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { GraphSnapshot, NetworkEdge, NetworkOperation, NetworkVertex } from '../../types/graphs';

export function getSampleNetwork(): { vertices: NetworkVertex[]; edges: NetworkEdge[] } {
  const vertices: NetworkVertex[] = [
    { id: 'v0', label: 'A', x: 140, y: 160, state: 'idle' },
    { id: 'v1', label: 'B', x: 280, y: 70, state: 'idle' },
    { id: 'v2', label: 'C', x: 280, y: 250, state: 'idle' },
    { id: 'v3', label: 'D', x: 440, y: 70, state: 'idle' },
    { id: 'v4', label: 'E', x: 440, y: 250, state: 'idle' },
    { id: 'v5', label: 'F', x: 580, y: 160, state: 'idle' },
    { id: 'v6', label: 'G', x: 360, y: 160, state: 'idle' },
  ];

  const edges: NetworkEdge[] = [
    { id: 'e-0-1', source: 'v0', target: 'v1', weight: 4, state: 'idle' },
    { id: 'e-0-2', source: 'v0', target: 'v2', weight: 3, state: 'idle' },
    { id: 'e-1-2', source: 'v1', target: 'v2', weight: 2, state: 'idle' },
    { id: 'e-1-3', source: 'v1', target: 'v3', weight: 5, state: 'idle' },
    { id: 'e-1-6', source: 'v1', target: 'v6', weight: 6, state: 'idle' },
    { id: 'e-2-4', source: 'v2', target: 'v4', weight: 7, state: 'idle' },
    { id: 'e-2-6', source: 'v2', target: 'v6', weight: 4, state: 'idle' },
    { id: 'e-3-5', source: 'v3', target: 'v5', weight: 2, state: 'idle' },
    { id: 'e-3-6', source: 'v3', target: 'v6', weight: 3, state: 'idle' },
    { id: 'e-4-5', source: 'v4', target: 'v5', weight: 5, state: 'idle' },
    { id: 'e-4-6', source: 'v4', target: 'v6', weight: 1, state: 'idle' },
  ];

  return { vertices, edges };
}

export function generateNetworkGraphFrames(operation?: NetworkOperation): StepFrame<GraphSnapshot>[] {
  if (operation?.type === 'mst' || !operation) {
    return generatePrimMSTFrames(operation);
  }

  const frames: StepFrame<GraphSnapshot>[] = [];
  const { vertices, edges } = getSampleNetwork();
  let frameCount = 0;

  const metrics: TelemetryMetrics = {
    comparisons: 0,
    swaps: 0,
    memoryOps: 0,
    recursionDepth: 0,
    auxiliaryMemory: 'O(V + E)',
  };

  function emitFrame(
    currVertices: NetworkVertex[],
    currEdges: NetworkEdge[],
    narration: string,
    activeV?: string | null,
    activeE?: string | null,
    codeLine: { cpp: number; python: number; pseudo: number } = { cpp: 1, python: 1, pseudo: 1 },
    opName?: string
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        mode: 'network',
        vertices: currVertices.map((v) => ({ ...v })),
        edges: currEdges.map((e) => ({ ...e })),
        activeVertexId: activeV,
        activeEdgeId: activeE,
      },
      pointers: { activeVertex: activeV ?? 'NONE', activeEdge: activeE ?? 'NONE' },
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: [`NetworkGraph::${opName ?? operation?.type ?? 'network'}()`],
      operation: opName ?? operation?.type ?? 'network',
    });
  }

  // Baseline Frame 0
  emitFrame(
    vertices,
    edges,
    `NETWORK TOPOLOGY INITIALIZED: |V| = ${vertices.length} vertices, |E| = ${edges.length} weighted edges. Ready for topology mutations.`,
    null,
    null
  );

  if (operation.type === 'insertVertex') {
    const label = operation.label ?? String.fromCharCode(65 + vertices.length);
    const newV: NetworkVertex = {
      id: `v${vertices.length}`,
      label,
      x: operation.x ?? 360,
      y: operation.y ?? 300,
      state: 'active',
    };
    vertices.push(newV);

    emitFrame(
      vertices,
      edges,
      `INSERT VERTEX: Added vertex [${label}] (ID: ${newV.id}) at coordinates (${newV.x}, ${newV.y}).`,
      newV.id,
      null,
      { cpp: 3, python: 3, pseudo: 2 }
    );

    newV.state = 'idle';
  } else if (operation.type === 'deleteVertex') {
    const targetId = operation.vertexId ?? vertices[vertices.length - 1]?.id;
    if (targetId) {
      const vIdx = vertices.findIndex((v) => v.id === targetId);
      if (vIdx !== -1) {
        const delV = vertices[vIdx];
        delV.state = 'comparing';

        emitFrame(
          vertices,
          edges,
          `DELETE VERTEX: Purging vertex [${delV.label}] and pruning all incident edges.`,
          delV.id,
          null,
          { cpp: 4, python: 4, pseudo: 3 }
        );

        vertices.splice(vIdx, 1);
        const remainingEdges = edges.filter((e) => e.source !== targetId && e.target !== targetId);

        emitFrame(
          vertices,
          remainingEdges,
          `VERTEX PURGED: Pruned vertex and incident connections. Remaining |V|: ${vertices.length}, |E|: ${remainingEdges.length}.`,
          null,
          null,
          { cpp: 6, python: 6, pseudo: 5 }
        );
      }
    }
  } else if (operation.type === 'insertEdge') {
    const u = operation.source ?? 'v0';
    const v = operation.target ?? 'v5';
    const w = operation.weight ?? 5;
    const newEdge: NetworkEdge = {
      id: `e-${u}-${v}-${Date.now()}`,
      source: u,
      target: v,
      weight: w,
      state: 'active',
    };
    edges.push(newEdge);

    emitFrame(
      vertices,
      edges,
      `INSERT EDGE: Connected vertex (${u}) to (${v}) with weight ${w}.`,
      null,
      newEdge.id,
      { cpp: 4, python: 4, pseudo: 3 }
    );
  } else if (operation.type === 'deleteEdge') {
    const edgeId = operation.edgeId ?? edges[0]?.id;
    const eIdx = edges.findIndex((e) => e.id === edgeId);
    if (eIdx !== -1) {
      const delE = edges[eIdx];
      delE.state = 'comparing';

      emitFrame(
        vertices,
        edges,
        `DELETE EDGE: Severing connection (${delE.source} — ${delE.target}, weight ${delE.weight}).`,
        null,
        delE.id,
        { cpp: 4, python: 4, pseudo: 3 }
      );

      edges.splice(eIdx, 1);
      emitFrame(
        vertices,
        edges,
        `EDGE SEVERED: Network adjacency graph updated. Remaining edges: ${edges.length}.`,
        null,
        null,
        { cpp: 6, python: 6, pseudo: 5 }
      );
    }
  }

  return frames;
}

export function generatePrimMSTFrames(_operation?: NetworkOperation): StepFrame<GraphSnapshot>[] {
  const frames: StepFrame<GraphSnapshot>[] = [];
  const { vertices, edges } = getSampleNetwork();

  const metrics: TelemetryMetrics = {
    comparisons: 0,
    swaps: 0,
    memoryOps: 0,
    recursionDepth: 0,
    auxiliaryMemory: 'O(V + E) Heap',
  };

  let frameCount = 0;
  const inMST = new Set<string>();
  const mstEdgeIds = new Set<string>();

  function cloneVertices(): NetworkVertex[] {
    return vertices.map((v) => ({ ...v }));
  }

  function cloneEdges(): NetworkEdge[] {
    return edges.map((e) => ({
      ...e,
      state: mstEdgeIds.has(e.id) ? 'sorted' : e.state,
    }));
  }

  function emitFrame(
    narration: string,
    activeV: string | null = null,
    activeE: string | null = null,
    codeLine: { cpp: number; python: number; pseudo: number } = { cpp: 1, python: 1, pseudo: 1 }
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        mode: 'network',
        vertices: cloneVertices(),
        edges: cloneEdges(),
        activeVertexId: activeV,
        activeEdgeId: activeE,
        mstEdges: Array.from(mstEdgeIds),
      },
      pointers: { activeVertex: activeV ?? 'NONE', activeEdge: activeE ?? 'NONE' },
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: ["primMST(start='A')"],
      operation: 'prim_mst',
    });
  }

  // Frame 0: Initial state
  emitFrame(
    `PRIM'S MINIMUM SPANNING TREE: Initial network topology. Starting MST construction at Vertex A.`,
    'v0',
    null,
    { cpp: 1, python: 1, pseudo: 1 }
  );

  // Start with v0
  inMST.add('v0');
  vertices[0].state = 'sorted';

  emitFrame(
    `Added Vertex A (v0) to the MST set. Initializing cut edges across frontier.`,
    'v0',
    null,
    { cpp: 3, python: 3, pseudo: 2 }
  );

  while (inMST.size < vertices.length) {
    // Find all crossing edges
    const candidateEdges: { edge: NetworkEdge; u: string; v: string }[] = [];

    for (const edge of edges) {
      if (mstEdgeIds.has(edge.id)) continue;
      const uIn = inMST.has(edge.source);
      const vIn = inMST.has(edge.target);

      if ((uIn && !vIn) || (!uIn && vIn)) {
        candidateEdges.push({
          edge,
          u: uIn ? edge.source : edge.target,
          v: uIn ? edge.target : edge.source,
        });
      }
    }

    if (candidateEdges.length === 0) break;

    candidateEdges.sort((a, b) => a.edge.weight - b.edge.weight);
    const chosen = candidateEdges[0];
    metrics.comparisons += candidateEdges.length;

    chosen.edge.state = 'comparing';
    const nextVertex = vertices.find((v) => v.id === chosen.v)!;
    nextVertex.state = 'active';

    emitFrame(
      `Evaluating crossing cut: Selected minimum-weight edge (${vertices.find(v => v.id === chosen.u)?.label} — ${nextVertex.label}) with weight ${chosen.edge.weight}.`,
      nextVertex.id,
      chosen.edge.id,
      { cpp: 7, python: 8, pseudo: 4 }
    );

    inMST.add(chosen.v);
    mstEdgeIds.add(chosen.edge.id);
    metrics.swaps++;
    nextVertex.state = 'sorted';
    chosen.edge.state = 'sorted';

    emitFrame(
      `Edge (${vertices.find(v => v.id === chosen.u)?.label} — ${nextVertex.label}) committed to MST! Total tree vertices: ${inMST.size}/${vertices.length}.`,
      nextVertex.id,
      chosen.edge.id,
      { cpp: 8, python: 9, pseudo: 5 }
    );
  }

  emitFrame(
    `Prim's Minimum Spanning Tree complete! Total edges in tree: ${mstEdgeIds.size}. Minimal total weight achieved.`,
    null,
    null,
    { cpp: 12, python: 11, pseudo: 6 }
  );

  return frames;
}
