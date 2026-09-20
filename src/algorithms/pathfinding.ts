export type Cell = [number, number];
export type Grid = number[][]; // 0 = open, 1 = wall

export interface PathStep {
  visited?: string[]; // cumulative, "row,col" keys
  frontier?: string[]; // this step's newly-discovered batch
  path?: string[];
  stats: { visited: number };
  done?: boolean;
  notFound?: boolean;
}

type PathGenerator = Generator<PathStep, void, unknown>;

export function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}

function neighbors(r: number, c: number, rows: number, cols: number): Cell[] {
  const out: Cell[] = [];
  if (r > 0) out.push([r - 1, c]);
  if (r < rows - 1) out.push([r + 1, c]);
  if (c > 0) out.push([r, c - 1]);
  if (c < cols - 1) out.push([r, c + 1]);
  return out;
}

function reconstruct(prev: Record<string, string>, start: Cell, end: Cell): string[] {
  const path: string[] = [];
  let key = cellKey(...end);
  const startKey = cellKey(...start);
  while (key !== startKey) {
    path.push(key);
    const next = prev[key];
    if (next === undefined) return [];
    key = next;
  }
  path.push(startKey);
  return path.reverse();
}

export function* bfsPath(grid: Grid, rows: number, cols: number, start: Cell, end: Cell): PathGenerator {
  const q: Cell[] = [start];
  const visited = new Set([cellKey(...start)]);
  const prev: Record<string, string> = {};
  let steps = 0;
  const visitedOrder: string[] = [];
  while (q.length) {
    const [r, c] = q.shift()!;
    steps++;
    visitedOrder.push(cellKey(r, c));
    if (r === end[0] && c === end[1]) {
      yield { visited: visitedOrder.slice(), path: reconstruct(prev, start, end), stats: { visited: steps }, done: true };
      return;
    }
    const frontierBatch: string[] = [];
    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      const key = cellKey(nr, nc);
      if (visited.has(key) || grid[nr][nc]) continue;
      visited.add(key);
      prev[key] = cellKey(r, c);
      q.push([nr, nc]);
      frontierBatch.push(key);
    }
    yield { visited: visitedOrder.slice(), frontier: frontierBatch, stats: { visited: steps } };
  }
  yield { visited: visitedOrder.slice(), path: [], stats: { visited: steps }, done: true, notFound: true };
}

export function* dfsPath(grid: Grid, rows: number, cols: number, start: Cell, end: Cell): PathGenerator {
  const stack: Cell[] = [start];
  const visited = new Set<string>();
  const prev: Record<string, string> = {};
  let steps = 0;
  const visitedOrder: string[] = [];
  while (stack.length) {
    const [r, c] = stack.pop()!;
    const key = cellKey(r, c);
    if (visited.has(key)) continue;
    visited.add(key);
    steps++;
    visitedOrder.push(key);
    if (r === end[0] && c === end[1]) {
      yield { visited: visitedOrder.slice(), path: reconstruct(prev, start, end), stats: { visited: steps }, done: true };
      return;
    }
    const frontierBatch: string[] = [];
    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      const nkey = cellKey(nr, nc);
      if (visited.has(nkey) || grid[nr][nc]) continue;
      if (!(nkey in prev)) prev[nkey] = key;
      stack.push([nr, nc]);
      frontierBatch.push(nkey);
    }
    yield { visited: visitedOrder.slice(), frontier: frontierBatch, stats: { visited: steps } };
  }
  yield { visited: visitedOrder.slice(), path: [], stats: { visited: steps }, done: true, notFound: true };
}

export function* dijkstraPath(grid: Grid, rows: number, cols: number, start: Cell, end: Cell): PathGenerator {
  const dist: Record<string, number> = { [cellKey(...start)]: 0 };
  const prev: Record<string, string> = {};
  const visited = new Set<string>();
  let steps = 0;
  const visitedOrder: string[] = [];
  const pq: [number, Cell][] = [[0, start]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, [r, c]] = pq.shift()!;
    const key = cellKey(r, c);
    if (visited.has(key)) continue;
    visited.add(key);
    steps++;
    visitedOrder.push(key);
    if (r === end[0] && c === end[1]) {
      yield { visited: visitedOrder.slice(), path: reconstruct(prev, start, end), stats: { visited: steps }, done: true };
      return;
    }
    const frontierBatch: string[] = [];
    for (const [nr, nc] of neighbors(r, c, rows, cols)) {
      if (grid[nr][nc]) continue;
      const nkey = cellKey(nr, nc);
      const nd = d + 1;
      if (dist[nkey] === undefined || nd < dist[nkey]) {
        dist[nkey] = nd;
        prev[nkey] = key;
        pq.push([nd, [nr, nc]]);
        frontierBatch.push(nkey);
      }
    }
    yield { visited: visitedOrder.slice(), frontier: frontierBatch, stats: { visited: steps } };
  }
  yield { visited: visitedOrder.slice(), path: [], stats: { visited: steps }, done: true, notFound: true };
}

export interface PathAlgoMeta {
  label: string;
  fn: (grid: Grid, rows: number, cols: number, start: Cell, end: Cell) => PathGenerator;
  time: [string, string, string];
  space: string;
  pseudo: string;
  blurb: string;
}

export const PATH_ALGOS = {
  bfs: {
    label: "Breadth-First Search",
    fn: bfsPath,
    time: ["-", "O(V+E)", "O(V+E)"],
    space: "O(V)",
    blurb: "Explores the grid outward in layers, guaranteeing the shortest path on an unweighted grid.",
    pseudo: "queue = [start]\nwhile queue:\n  cell = queue.pop_front()\n  for n in neighbors(cell):\n    if not visited(n):\n      mark visited; queue.push(n)",
  },
  dfs: {
    label: "Depth-First Search",
    fn: dfsPath,
    time: ["-", "O(V+E)", "O(V+E)"],
    space: "O(V)",
    blurb: "Dives down one path as far as possible before backtracking — does not guarantee the shortest route.",
    pseudo: "stack = [start]\nwhile stack:\n  cell = stack.pop()\n  for n in neighbors(cell):\n    if not visited(n):\n      mark visited; stack.push(n)",
  },
  dijkstra: {
    label: "Dijkstra's Algorithm",
    fn: dijkstraPath,
    time: ["-", "O(E log V)", "O(E log V)"],
    space: "O(V)",
    blurb: "Expands the cheapest known cell first using a priority queue, guaranteeing the shortest path.",
    pseudo: "dist[start] = 0\npq = [(0, start)]\nwhile pq:\n  d, cell = pq.pop_min()\n  for n in neighbors(cell):\n    relax edge(cell, n)",
  },
} as const satisfies Record<string, PathAlgoMeta>;

export type PathAlgoKey = keyof typeof PATH_ALGOS;
