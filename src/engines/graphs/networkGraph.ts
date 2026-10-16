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

export function executeNetworkMutation(
  operation: NetworkOperation,
  liveGraphState?: { vertices: NetworkVertex[]; edges: NetworkEdge[] }
): StepFrame<GraphSnapshot>[] {
  const frames: StepFrame<GraphSnapshot>[] = [];
  const base = liveGraphState ?? getSampleNetwork();
  const vertices = base.vertices.map((v) => ({ ...v }));
  const edges = base.edges.map((e) => ({ ...e }));
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
      callStack: [`NetworkGraph::${opName ?? operation.type}()`],
      operation: opName ?? operation.type,
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
      const vIdx = vertices.findIndex((v) => v.id === targetId || v.label === targetId);
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
        const remainingEdges = edges.filter((e) => e.source !== delV.id && e.target !== delV.id);

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
    const u = operation.sourceId ?? operation.source ?? 'v0';
    const v = operation.targetId ?? operation.target ?? 'v5';
    const w = Number(operation.weight ?? 5);

    const uVertex = vertices.find((vert) => vert.id === u || vert.label === u);
    const vVertex = vertices.find((vert) => vert.id === v || vert.label === v);

    if (!uVertex || !vVertex) {
      emitFrame(
        vertices,
        edges,
        `EDGE INSERTION REJECTED: Vertex not found ('${u}' or '${v}' does not exist in graph).`,
        null,
        null,
        { cpp: 2, python: 2, pseudo: 2 }
      );
      return frames;
    }

    if (uVertex.id === vVertex.id) {
      emitFrame(
        vertices,
        edges,
        `EDGE INSERTION REJECTED: Self-loops are not permitted (${uVertex.label} -> ${vVertex.label}).`,
        uVertex.id,
        null,
        { cpp: 2, python: 2, pseudo: 2 }
      );
      return frames;
    }

    if (!Number.isInteger(w) || w < 1 || w > 99) {
      emitFrame(
        vertices,
        edges,
        `EDGE INSERTION REJECTED: Weight ${w} is invalid. Expected integer between 1 and 99.`,
        null,
        null,
        { cpp: 2, python: 2, pseudo: 2 }
      );
      return frames;
    }

    // Check for existing edge between u and v (undirected)
    const existingEdgeIndex = edges.findIndex(
      (e) =>
        (e.source === uVertex.id && e.target === vVertex.id) ||
        (e.source === vVertex.id && e.target === uVertex.id)
    );

    if (existingEdgeIndex !== -1) {
      edges[existingEdgeIndex].weight = w;
      edges[existingEdgeIndex].state = 'active';
      emitFrame(
        vertices,
        edges,
        `EDGE UPDATED: Edge (${uVertex.label} — ${vVertex.label}) weight updated to ${w}. Duplicate edge prevented.`,
        null,
        edges[existingEdgeIndex].id,
        { cpp: 4, python: 4, pseudo: 3 }
      );
      return frames;
    }

    const newEdge: NetworkEdge = {
      id: `e-${uVertex.id}-${vVertex.id}`,
      source: uVertex.id,
      target: vVertex.id,
      weight: w,
      state: 'active',
    };
    edges.push(newEdge);

    emitFrame(
      vertices,
      edges,
      `INSERT EDGE: Connected vertex ${uVertex.label} (${uVertex.id}) to ${vVertex.label} (${vVertex.id}) with weight ${w}.`,
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

export function generateNetworkDijkstraFrames(
  liveGraphState?: { vertices: NetworkVertex[]; edges: NetworkEdge[] },
  startVertexId: string = 'v0'
): StepFrame<GraphSnapshot>[] {
  const frames: StepFrame<GraphSnapshot>[] = [];
  const base = liveGraphState ?? getSampleNetwork();
  const vertices: NetworkVertex[] = base.vertices.map((v) => ({ ...v, state: 'idle' }));
  const edges: NetworkEdge[] = base.edges.map((e) => ({ ...e, state: 'idle' }));
  let frameCount = 0;

  const metrics: TelemetryMetrics = {
    comparisons: 0,
    swaps: 0,
    memoryOps: 0,
    recursionDepth: 0,
    auxiliaryMemory: 'O(V + E) PQ',
  };

  const treeEdgeIds = new Set<string>();

  function cloneVertices(): NetworkVertex[] {
    return vertices.map((v) => ({ ...v }));
  }

  function cloneEdges(): NetworkEdge[] {
    return edges.map((e) => ({
      ...e,
      state: treeEdgeIds.has(e.id) ? 'sorted' : e.state,
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
        mstEdges: Array.from(treeEdgeIds),
        vertexDistances: Object.fromEntries(
          vertices.map((v) => [v.id, v.distance ?? Infinity])
        ),
      },
      pointers: { activeVertex: activeV ?? 'NONE', activeEdge: activeE ?? 'NONE' },
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: ["dijkstra(start='A')"],
      operation: 'network_dijkstra',
    });
  }

  // Initialize distances
  vertices.forEach((v) => {
    v.distance = v.id === startVertexId ? 0 : Infinity;
    v.predecessor = null;
  });

  const startVertex = vertices.find((v) => v.id === startVertexId) ?? vertices[0];

  emitFrame(
    `NETWORK DIJKSTRA INITIALIZED: Source vertex ${startVertex.label} (ID: ${startVertex.id}) set to d=0. All other vertices set to d=∞.`,
    startVertex.id,
    null,
    { cpp: 1, python: 1, pseudo: 1 }
  );

  const unvisited = new Set<string>(vertices.map((v) => v.id));

  while (unvisited.size > 0) {
    metrics.memoryOps = unvisited.size;

    // Pick unvisited vertex with minimal distance
    let minNode: NetworkVertex | null = null;
    for (const vId of unvisited) {
      const v = vertices.find((x) => x.id === vId)!;
      if (!minNode || (v.distance ?? Infinity) < (minNode.distance ?? Infinity)) {
        minNode = v;
      }
    }

    if (!minNode || minNode.distance === Infinity) {
      break; // Remaining vertices are disconnected
    }

    const u = minNode;
    unvisited.delete(u.id);
    u.state = 'active';

    emitFrame(
      `Dijkstra settled vertex ${u.label} with verified shortest distance d=${u.distance}. Inspecting outgoing cut edges.`,
      u.id,
      null,
      { cpp: 5, python: 5, pseudo: 3 }
    );

    // Find all incident edges on u
    const incidentEdges = edges.filter((e) => e.source === u.id || e.target === u.id);

    for (const edge of incidentEdges) {
      const neighborId = edge.source === u.id ? edge.target : edge.source;
      if (!unvisited.has(neighborId)) continue;

      const neighbor = vertices.find((x) => x.id === neighborId)!;
      metrics.comparisons++;
      edge.state = 'compare';
      neighbor.state = 'compare';

      const tentativeDist = u.distance! + edge.weight;
      const currentDist = neighbor.distance ?? Infinity;

      emitFrame(
        `Evaluating relaxation for edge (${u.label} — ${neighbor.label}, weight ${edge.weight}): tentative dist ${u.distance} + ${edge.weight} = ${tentativeDist} vs current d=${currentDist === Infinity ? '∞' : currentDist}.`,
        neighbor.id,
        edge.id,
        { cpp: 7, python: 7, pseudo: 4 }
      );

      if (tentativeDist < currentDist) {
        metrics.swaps++;
        neighbor.distance = tentativeDist;
        neighbor.predecessor = u.id;

        // Replace any prior tree edge to neighbor
        for (const e of edges) {
          if (
            treeEdgeIds.has(e.id) &&
            ((e.source === neighbor.id && e.target !== u.id) ||
              (e.target === neighbor.id && e.source !== u.id))
          ) {
            treeEdgeIds.delete(e.id);
          }
        }

        treeEdgeIds.add(edge.id);
        edge.state = 'sorted';
        neighbor.state = 'active';

        emitFrame(
          `Relaxation committed! Updated shortest distance d(${neighbor.label}) := ${tentativeDist} via predecessor ${u.label}.`,
          neighbor.id,
          edge.id,
          { cpp: 9, python: 9, pseudo: 5 }
        );
      } else {
        edge.state = 'idle';
      }

      neighbor.state = 'idle';
    }

    u.state = 'sorted';
  }

  // Mark all reachable vertices as settled
  vertices.forEach((v) => {
    if (v.distance !== Infinity) {
      v.state = 'sorted';
    }
  });

  emitFrame(
    `Dijkstra Shortest Path Tree verified! Shortest-path tree rooted at ${startVertex.label} fully settled. Settled ${vertices.filter((v) => v.distance !== Infinity).length}/${vertices.length} vertices from source ${startVertex.label}. Minimal distances established.`,
    null,
    null,
    { cpp: 12, python: 11, pseudo: 6 }
  );

  return frames;
}

export function generateNetworkBfsFrames(
  liveGraphState?: { vertices: NetworkVertex[]; edges: NetworkEdge[] },
  startVertexId: string = 'v0'
): StepFrame<GraphSnapshot>[] {
  const frames: StepFrame<GraphSnapshot>[] = [];
  const base = liveGraphState ?? getSampleNetwork();
  const vertices: NetworkVertex[] = base.vertices.map((v) => ({ ...v, state: 'idle' }));
  const edges: NetworkEdge[] = base.edges.map((e) => ({ ...e, state: 'idle' }));
  let frameCount = 0;

  const metrics: TelemetryMetrics = {
    comparisons: 0,
    swaps: 0,
    memoryOps: 1,
    recursionDepth: 0,
    auxiliaryMemory: 'O(V + E) Queue',
  };

  const treeEdgeIds = new Set<string>();

  function cloneVertices(): NetworkVertex[] {
    return vertices.map((v) => ({ ...v }));
  }

  function cloneEdges(): NetworkEdge[] {
    return edges.map((e) => ({
      ...e,
      state: treeEdgeIds.has(e.id) ? 'sorted' : e.state,
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
        mstEdges: Array.from(treeEdgeIds),
        vertexDistances: Object.fromEntries(
          vertices.map((v) => [v.id, v.distance ?? Infinity])
        ),
      },
      pointers: { activeVertex: activeV ?? 'NONE', activeEdge: activeE ?? 'NONE' },
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: ["bfs(start='A')"],
      operation: 'network_bfs',
    });
  }

  // Initialize
  vertices.forEach((v) => {
    v.distance = v.id === startVertexId ? 0 : Infinity;
    v.predecessor = null;
  });

  const startVertex = vertices.find((v) => v.id === startVertexId) ?? vertices[0];
  const queue: string[] = [startVertex.id];
  const visited = new Set<string>([startVertex.id]);

  emitFrame(
    `NETWORK BFS INITIALIZED: Enqueued start vertex ${startVertex.label} (Level 0). FIFO queue active.`,
    startVertex.id,
    null,
    { cpp: 1, python: 1, pseudo: 1 }
  );

  while (queue.length > 0) {
    metrics.memoryOps = queue.length;
    const uId = queue.shift()!;
    const u = vertices.find((x) => x.id === uId)!;
    u.state = 'active';

    emitFrame(
      `BFS visiting vertex ${u.label} at hop level ${u.distance}. Remaining queue depth: ${queue.length}.`,
      u.id,
      null,
      { cpp: 4, python: 4, pseudo: 3 }
    );

    const incidentEdges = edges.filter((e) => e.source === u.id || e.target === u.id);

    for (const edge of incidentEdges) {
      const neighborId = edge.source === u.id ? edge.target : edge.source;
      const neighbor = vertices.find((x) => x.id === neighborId)!;
      metrics.comparisons++;

      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        metrics.swaps++;
        neighbor.distance = (u.distance ?? 0) + 1;
        neighbor.predecessor = u.id;
        neighbor.state = 'compare';

        treeEdgeIds.add(edge.id);
        edge.state = 'sorted';
        queue.push(neighborId);

        emitFrame(
          `BFS discovered unvisited vertex ${neighbor.label} via (${u.label} — ${neighbor.label}). Assigned hop level ${neighbor.distance}. Enqueued.`,
          neighbor.id,
          edge.id,
          { cpp: 7, python: 7, pseudo: 4 }
        );

        neighbor.state = 'idle';
      }
    }

    u.state = 'sorted';
  }

  vertices.forEach((v) => {
    if (visited.has(v.id)) {
      v.state = 'sorted';
    }
  });

  emitFrame(
    `Breadth-First Search complete! BFS traversal complete. Traversed ${visited.size}/${vertices.length} connected vertices level-by-level. Minimum-hop tree constructed.`,
    null,
    null,
    { cpp: 11, python: 10, pseudo: 6 }
  );

  return frames;
}

export function generatePrimMSTFrames(
  _operation?: NetworkOperation,
  liveGraphState?: { vertices: NetworkVertex[]; edges: NetworkEdge[] }
): StepFrame<GraphSnapshot>[] {
  const frames: StepFrame<GraphSnapshot>[] = [];
  const base = liveGraphState ?? getSampleNetwork();
  const vertices: NetworkVertex[] = base.vertices.map((v) => ({ ...v, state: 'idle' as const }));
  const edges: NetworkEdge[] = base.edges.map((e) => ({ ...e, state: 'idle' as const }));

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
      `Evaluating crossing cut: Selected minimum-weight edge (${vertices.find((v) => v.id === chosen.u)?.label} — ${nextVertex.label}) with weight ${chosen.edge.weight}.`,
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
      `Edge (${vertices.find((v) => v.id === chosen.u)?.label} — ${nextVertex.label}) committed to MST! Total tree vertices: ${inMST.size}/${vertices.length}.`,
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

export function generateNetworkGraphFrames(
  algorithmOrOp?: 'networkPrim' | 'networkDijkstra' | 'networkBfs' | 'bellmanFord' | 'topologicalSort' | NetworkOperation,
  operationArg?: NetworkOperation,
  liveGraphState?: { vertices: NetworkVertex[]; edges: NetworkEdge[] }
): StepFrame<GraphSnapshot>[] {
  let algorithmId: string = 'networkPrim';
  let operation: NetworkOperation | undefined = operationArg;

  if (typeof algorithmOrOp === 'string') {
    algorithmId = algorithmOrOp;
  } else if (algorithmOrOp && typeof algorithmOrOp === 'object') {
    operation = algorithmOrOp;
    if (operation.type === 'mst') {
      algorithmId = 'networkPrim';
    }
  }

  if (
    operation &&
    (operation.type === 'insertVertex' ||
      operation.type === 'deleteVertex' ||
      operation.type === 'insertEdge' ||
      operation.type === 'deleteEdge')
  ) {
    return executeNetworkMutation(operation, liveGraphState);
  }

  switch (algorithmId) {
    case 'networkDijkstra':
    case 'bellmanFord':
      return generateNetworkDijkstraFrames(liveGraphState);
    case 'networkBfs':
    case 'topologicalSort':
      return generateNetworkBfsFrames(liveGraphState);
    case 'networkPrim':
    default:
      return generatePrimMSTFrames(operation, liveGraphState);
  }
}
