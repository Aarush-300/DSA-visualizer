import { StepFrame, TelemetryMetrics } from '../../types/engine';
import { GraphSnapshot, GridCell } from '../../types/graphs';

export const GRID_ROWS = 16;
export const GRID_COLS = 36;

export function createInitialGrid(
  rows: number = GRID_ROWS,
  cols: number = GRID_COLS,
  start: { row: number; col: number } = { row: 7, col: 5 },
  target: { row: number; col: number } = { row: 7, col: 30 }
): GridCell[][] {
  const grid: GridCell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < cols; c++) {
      let type: GridCell['type'] = 'empty';
      if (r === start.row && c === start.col) type = 'start';
      else if (r === target.row && c === target.col) type = 'target';

      row.push({
        row: r,
        col: c,
        type,
        distance: Infinity,
        fScore: Infinity,
        gScore: Infinity,
        hScore: 0,
        previousCell: null,
      });
    }
    grid.push(row);
  }
  return grid;
}

export function generateRecursiveMaze(
  rows: number = GRID_ROWS,
  cols: number = GRID_COLS,
  start: { row: number; col: number } = { row: 7, col: 5 },
  target: { row: number; col: number } = { row: 7, col: 30 }
): GridCell[][] {
  const grid = createInitialGrid(rows, cols, start, target);

  // Add outer boundary borders
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r === 0 || r === rows - 1 || c === 0 || c === cols - 1) &&
          !(r === start.row && c === start.col) &&
          !(r === target.row && c === target.col)) {
        grid[r][c].type = 'wall';
      }
    }
  }

  function addWall(
    r1: number,
    r2: number,
    c1: number,
    c2: number,
    orientation: 'horizontal' | 'vertical'
  ) {
    if (r2 < r1 || c2 < c1) return;

    if (orientation === 'horizontal') {
      const possibleRows: number[] = [];
      for (let r = r1; r <= r2; r += 2) possibleRows.push(r);
      const possibleCols: number[] = [];
      for (let c = c1 - 1; c <= c2 + 1; c += 2) possibleCols.push(c);

      if (possibleRows.length === 0 || possibleCols.length === 0) return;

      const wallRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];
      const passageCol = possibleCols[Math.floor(Math.random() * possibleCols.length)];

      for (let c = c1 - 1; c <= c2 + 1; c++) {
        if (c !== passageCol &&
            !(wallRow === start.row && c === start.col) &&
            !(wallRow === target.row && c === target.col)) {
          grid[wallRow][c].type = 'wall';
        }
      }

      addWall(r1, wallRow - 2, c1, c2, wallRow - 2 - r1 > c2 - c1 ? 'horizontal' : 'vertical');
      addWall(wallRow + 2, r2, c1, c2, r2 - (wallRow + 2) > c2 - c1 ? 'horizontal' : 'vertical');
    } else {
      const possibleCols: number[] = [];
      for (let c = c1; c <= c2; c += 2) possibleCols.push(c);
      const possibleRows: number[] = [];
      for (let r = r1 - 1; r <= r2 + 1; r += 2) possibleRows.push(r);

      if (possibleCols.length === 0 || possibleRows.length === 0) return;

      const wallCol = possibleCols[Math.floor(Math.random() * possibleCols.length)];
      const passageRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];

      for (let r = r1 - 1; r <= r2 + 1; r++) {
        if (r !== passageRow &&
            !(r === start.row && wallCol === start.col) &&
            !(r === target.row && wallCol === target.col)) {
          grid[r][wallCol].type = 'wall';
        }
      }

      addWall(r1, r2, c1, wallCol - 2, r2 - r1 > wallCol - 2 - c1 ? 'horizontal' : 'vertical');
      addWall(r1, r2, wallCol + 2, c2, r2 - r1 > c2 - (wallCol + 2) ? 'horizontal' : 'vertical');
    }
  }

  addWall(2, rows - 3, 2, cols - 3, rows > cols ? 'horizontal' : 'vertical');
  return grid;
}

export function generatePathfindingFrames(
  initialGrid: GridCell[][],
  algorithm: 'dijkstra' | 'aStar' | 'bfs' | 'dfs',
  start: { row: number; col: number },
  target: { row: number; col: number }
): StepFrame<GraphSnapshot>[] {
  const frames: StepFrame<GraphSnapshot>[] = [];
  const rows = initialGrid.length;
  const cols = initialGrid[0].length;

  // Clone initial grid
  const grid: GridCell[][] = initialGrid.map((r) =>
    r.map((c) => ({
      ...c,
      distance: (c.row === start.row && c.col === start.col) ? 0 : Infinity,
      fScore: Infinity,
      gScore: (c.row === start.row && c.col === start.col) ? 0 : Infinity,
      hScore: 0,
      previousCell: null,
      type: (c.type === 'visited' || c.type === 'path') ? 'empty' : c.type,
      weight: c.weight ?? (c.type === 'weight' ? 5 : 1),
    }))
  );

  const metrics: TelemetryMetrics = {
    comparisons: 0, // Visited cells count
    swaps: 0,       // Final path length
    memoryOps: 1,   // Open set / Queue size
    recursionDepth: 0,
    auxiliaryMemory: `Grid [${rows}x${cols}]`,
  };

  let frameCount = 0;

  function cloneGrid(): GridCell[][] {
    return grid.map((r) => r.map((c) => ({ ...c })));
  }

  function emitFrame(
    narration: string,
    activeCoord: { row: number; col: number } | null,
    codeLine: { cpp: number; python: number; pseudo: number },
    callStack: string[]
  ) {
    frames.push({
      frameIndex: frameCount++,
      snapshot: {
        mode: 'grid',
        grid: cloneGrid(),
        startCoord: start,
        targetCoord: target,
        activeCell: activeCoord,
        frontierCount: metrics.memoryOps,
      },
      pointers: {
        curr: activeCoord ? `(${activeCoord.row},${activeCoord.col})` : null,
      },
      codeLine,
      narration,
      metrics: { ...metrics },
      callStack: [...callStack],
    });
  }

  function manhattan(r: number, c: number): number {
    return Math.abs(r - target.row) + Math.abs(c - target.col);
  }

  function getNeighbors(r: number, c: number): GridCell[] {
    const deltas = [
      [-1, 0], // Up
      [0, 1],  // Right
      [1, 0],  // Down
      [0, -1], // Left
    ];
    const neighbors: GridCell[] = [];
    for (const [dr, dc] of deltas) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (grid[nr][nc].type !== 'wall') {
          neighbors.push(grid[nr][nc]);
        }
      }
    }
    return neighbors;
  }

  emitFrame(
    `Starting ${algorithm.toUpperCase()} pathfinding from Start (${start.row}, ${start.col}) to Target (${target.row}, ${target.col}).`,
    start,
    { cpp: 3, python: 3, pseudo: 1 },
    [`${algorithm}Pathfinding()`]
  );

  let targetReached = false;

  if (algorithm === 'bfs') {
    const queue: { row: number; col: number }[] = [start];
    const visitedSet = new Set<string>();
    visitedSet.add(`${start.row},${start.col}`);

    while (queue.length > 0) {
      metrics.memoryOps = queue.length;
      const curr = queue.shift()!;
      metrics.comparisons++;

      if (curr.row === target.row && curr.col === target.col) {
        targetReached = true;
        break;
      }

      if (grid[curr.row][curr.col].type !== 'start') {
        grid[curr.row][curr.col].type = 'visited';
      }

      if (frameCount % 3 === 0 || queue.length === 0) {
        emitFrame(
          `BFS visiting cell (${curr.row}, ${curr.col}). Queue depth: ${queue.length}.`,
          curr,
          { cpp: 6, python: 6, pseudo: 4 },
          [`bfs(queue=${queue.length})`]
        );
      }

      for (const neighbor of getNeighbors(curr.row, curr.col)) {
        const key = `${neighbor.row},${neighbor.col}`;
        if (!visitedSet.has(key)) {
          visitedSet.add(key);
          neighbor.previousCell = curr;
          queue.push({ row: neighbor.row, col: neighbor.col });
        }
      }
    }
  } else if (algorithm === 'dfs') {
    const stack: { row: number; col: number }[] = [start];
    const visitedSet = new Set<string>();
    visitedSet.add(`${start.row},${start.col}`);

    while (stack.length > 0) {
      metrics.memoryOps = stack.length;
      const curr = stack.pop()!;
      metrics.comparisons++;

      if (curr.row === target.row && curr.col === target.col) {
        targetReached = true;
        break;
      }

      if (grid[curr.row][curr.col].type !== 'start') {
        grid[curr.row][curr.col].type = 'visited';
      }

      if (frameCount % 3 === 0 || stack.length === 0) {
        emitFrame(
          `DFS exploring branch cell (${curr.row}, ${curr.col}). Stack depth: ${stack.length}.`,
          curr,
          { cpp: 6, python: 6, pseudo: 4 },
          [`dfs(stack=${stack.length})`]
        );
      }

      for (const neighbor of getNeighbors(curr.row, curr.col)) {
        const key = `${neighbor.row},${neighbor.col}`;
        if (!visitedSet.has(key)) {
          visitedSet.add(key);
          neighbor.previousCell = curr;
          stack.push({ row: neighbor.row, col: neighbor.col });
        }
      }
    }
  } else if (algorithm === 'aStar') {
    interface AStarNode {
      row: number;
      col: number;
      f: number;
      g: number;
    }

    grid[start.row][start.col].gScore = 0;
    grid[start.row][start.col].hScore = manhattan(start.row, start.col);
    grid[start.row][start.col].fScore = grid[start.row][start.col].hScore;

    const openSet: AStarNode[] = [{
      row: start.row,
      col: start.col,
      f: grid[start.row][start.col].fScore ?? 0,
      g: 0,
    }];
    const closedSet = new Set<string>();

    while (openSet.length > 0) {
      metrics.memoryOps = openSet.length;
      // Extract lowest fScore node
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      const key = `${current.row},${current.col}`;

      if (closedSet.has(key)) continue;
      closedSet.add(key);
      metrics.comparisons++;

      if (current.row === target.row && current.col === target.col) {
        targetReached = true;
        break;
      }

      if (grid[current.row][current.col].type !== 'start') {
        grid[current.row][current.col].type = 'visited';
      }

      if (frameCount % 3 === 0 || openSet.length === 0) {
        emitFrame(
          `A* expanding cell (${current.row}, ${current.col}) with f(n) = ${current.f.toFixed(0)} (g=${current.g}, h=${manhattan(current.row, current.col)}).`,
          current,
          { cpp: 7, python: 7, pseudo: 4 },
          [`aStar(openSet=${openSet.length})`]
        );
      }

      for (const neighbor of getNeighbors(current.row, current.col)) {
        const nKey = `${neighbor.row},${neighbor.col}`;
        if (closedSet.has(nKey)) continue;

        const stepCost = neighbor.weight ?? (neighbor.type === 'weight' ? 5 : 1);
        const tentativeG = current.g + stepCost;
        if (tentativeG < (neighbor.gScore ?? Infinity)) {
          neighbor.previousCell = { row: current.row, col: current.col };
          neighbor.gScore = tentativeG;
          neighbor.hScore = manhattan(neighbor.row, neighbor.col);
          neighbor.fScore = tentativeG + neighbor.hScore;

          openSet.push({
            row: neighbor.row,
            col: neighbor.col,
            f: neighbor.fScore,
            g: tentativeG,
          });
        }
      }
    }
  } else {
    // Dijkstra
    const unvisited: { row: number; col: number; dist: number }[] = [
      { row: start.row, col: start.col, dist: 0 },
    ];
    const visitedSet = new Set<string>();

    while (unvisited.length > 0) {
      metrics.memoryOps = unvisited.length;
      unvisited.sort((a, b) => a.dist - b.dist);
      const current = unvisited.shift()!;
      const key = `${current.row},${current.col}`;

      if (visitedSet.has(key)) continue;
      visitedSet.add(key);
      metrics.comparisons++;

      if (current.row === target.row && current.col === target.col) {
        targetReached = true;
        break;
      }

      if (grid[current.row][current.col].type !== 'start') {
        grid[current.row][current.col].type = 'visited';
      }

      if (frameCount % 4 === 0 || unvisited.length === 0) {
        emitFrame(
          `Dijkstra exploring wavefront node (${current.row}, ${current.col}) at cost ${current.dist}.`,
          current,
          { cpp: 6, python: 5, pseudo: 3 },
          [`dijkstra(wavefront=${unvisited.length})`]
        );
      }

      for (const neighbor of getNeighbors(current.row, current.col)) {
        const nKey = `${neighbor.row},${neighbor.col}`;
        if (visitedSet.has(nKey)) continue;

        const stepCost = neighbor.weight ?? (neighbor.type === 'weight' ? 5 : 1);
        const newDist = current.dist + stepCost;
        if (newDist < neighbor.distance) {
          neighbor.distance = newDist;
          neighbor.previousCell = { row: current.row, col: current.col };
          unvisited.push({ row: neighbor.row, col: neighbor.col, dist: newDist });
        }
      }
    }
  }

  // Path Reconstruction Frame
  if (targetReached) {
    const path: { row: number; col: number }[] = [];
    let curr: { row: number; col: number } | null = { row: target.row, col: target.col };

    while (curr) {
      path.push(curr);
      curr = grid[curr.row][curr.col].previousCell ?? null;
    }
    path.reverse();

    let totalCost = 0;
    let weightedCount = 0;
    for (let i = 1; i < path.length; i++) {
      const p = path[i];
      const cell = grid[p.row][p.col];
      const cost = cell.weight ?? (cell.type === 'weight' ? 5 : 1);
      totalCost += cost;
      if (cost > 1) {
        weightedCount++;
      }
    }

    metrics.swaps = totalCost;

    const stepCount = Math.max(0, path.length - 1);

    for (let i = 0; i < path.length; i++) {
      const p = path[i];
      if (grid[p.row][p.col].type !== 'start' && grid[p.row][p.col].type !== 'target') {
        grid[p.row][p.col].type = 'path';
      }

      const pathLabel =
        algorithm === 'dfs'
          ? 'DFS Traversal Path'
          : algorithm === 'bfs'
          ? 'Hop Path'
          : 'Shortest Path';

      emitFrame(
        `${pathLabel} reconstructed! Lighting up step ${i + 1}/${path.length} at (${p.row}, ${p.col}).`,
        p,
        { cpp: 7, python: 6, pseudo: 5 },
        ['reconstructPath()']
      );
    }

    let finalNarration = '';
    if (algorithm === 'dijkstra' || algorithm === 'aStar') {
      finalNarration = `Optimal shortest path found and verified! Total Path Cost: ${totalCost} across ${stepCount} steps (${weightedCount} weighted nodes). Visited cells: ${metrics.comparisons}.`;
    } else if (algorithm === 'bfs') {
      finalNarration = `Minimum-hop path found! ${stepCount} steps (Total traversal cost: ${totalCost}; note: BFS is unweighted). Visited cells: ${metrics.comparisons}.`;
    } else {
      finalNarration = `Target reached via DFS traversal! Path length: ${stepCount} steps (Total cost: ${totalCost} — DFS does not guarantee a shortest path). Visited cells: ${metrics.comparisons}.`;
    }

    emitFrame(finalNarration, null, { cpp: 7, python: 6, pseudo: 5 }, []);
  } else {
    emitFrame(
      `No feasible path exists between Start and Target due to wall obstructions.`,
      null,
      { cpp: 13, python: 10, pseudo: 6 },
      []
    );
  }

  return frames;
}
