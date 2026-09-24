import type { Cell, Grid } from "./pathfinding";

export type MazeType = "random" | "recursive" | "stair" | "checker";

export function generateRandomWalls(
  rows: number,
  cols: number,
  start: Cell,
  end: Cell,
  density: number = 0.28
): Grid {
  const grid: Grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r === start[0] && c === start[1]) || (r === end[0] && c === end[1])) {
        continue;
      }
      if (Math.random() < density) {
        grid[r][c] = 1;
      }
    }
  }
  return grid;
}

export function generateStairPattern(
  rows: number,
  cols: number,
  start: Cell,
  end: Cell
): Grid {
  const grid: Grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
  let x = 1;
  let y = rows - 2;

  while (x < cols - 1 && y > 0) {
    if (!(x === start[1] && y === start[0]) && !(x === end[1] && y === end[0])) {
      grid[y][x] = 1;
    }
    x++;
    y--;
  }

  x = Math.floor(cols / 2);
  y = rows - 2;
  while (x < cols - 1 && y > 0) {
    if (!(x === start[1] && y === start[0]) && !(x === end[1] && y === end[0])) {
      grid[y][x] = 1;
    }
    x++;
    y--;
  }

  return grid;
}

export function generateRecursiveDivisionMaze(
  rows: number,
  cols: number,
  start: Cell,
  end: Cell
): Grid {
  const grid: Grid = Array.from({ length: rows }, () => new Array(cols).fill(0));

  // Outer border
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        if (!(r === start[0] && c === start[1]) && !(r === end[0] && c === end[1])) {
          grid[r][c] = 1;
        }
      }
    }
  }

  function divide(r1: number, r2: number, c1: number, c2: number) {
    if (r2 - r1 < 3 || c2 - c1 < 3) return;

    const horizontal = r2 - r1 > c2 - c1;

    if (horizontal) {
      // Choose even wall row between r1+1 and r2-1
      const wallRow = Math.floor(Math.random() * (r2 - r1 - 2)) + r1 + 1;
      // Choose passage column
      const passageCol = Math.floor(Math.random() * (c2 - c1 - 1)) + c1 + 1;

      for (let c = c1 + 1; c < c2; c++) {
        if (c !== passageCol) {
          if (!(wallRow === start[0] && c === start[1]) && !(wallRow === end[0] && c === end[1])) {
            grid[wallRow][c] = 1;
          }
        }
      }

      divide(r1, wallRow, c1, c2);
      divide(wallRow, r2, c1, c2);
    } else {
      // Choose wall col
      const wallCol = Math.floor(Math.random() * (c2 - c1 - 2)) + c1 + 1;
      const passageRow = Math.floor(Math.random() * (r2 - r1 - 1)) + r1 + 1;

      for (let r = r1 + 1; r < r2; r++) {
        if (r !== passageRow) {
          if (!(r === start[0] && wallCol === start[1]) && !(r === end[0] && wallCol === end[1])) {
            grid[r][wallCol] = 1;
          }
        }
      }

      divide(r1, r2, c1, wallCol);
      divide(r1, r2, wallCol, c2);
    }
  }

  divide(0, rows - 1, 0, cols - 1);
  return grid;
}
