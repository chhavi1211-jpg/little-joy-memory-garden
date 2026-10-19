/** Perfect maze via randomized depth-first search. walls[y][x] = {n,e,s,w} true when blocked. */
export type Cell = { n: boolean; e: boolean; s: boolean; w: boolean };

export function generateMaze(size: number, rand: () => number = Math.random): Cell[][] {
  const grid: Cell[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => ({ n: true, e: true, s: true, w: true })));
  const seen = Array.from({ length: size }, () => Array(size).fill(false));
  const stack: [number, number][] = [[0, 0]];
  seen[0][0] = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const options = (
      [
        [0, -1, "n", "s"],
        [1, 0, "e", "w"],
        [0, 1, "s", "n"],
        [-1, 0, "w", "e"],
      ] as const
    ).filter(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      return nx >= 0 && ny >= 0 && nx < size && ny < size && !seen[ny][nx];
    });
    if (!options.length) {
      stack.pop();
      continue;
    }
    const [dx, dy, a, b] = options[Math.floor(rand() * options.length)];
    grid[y][x][a] = false;
    grid[y + dy][x + dx][b] = false;
    seen[y + dy][x + dx] = true;
    stack.push([x + dx, y + dy]);
  }
  return grid;
}

export function canMove(grid: Cell[][], x: number, y: number, dir: "n" | "e" | "s" | "w") {
  return !grid[y][x][dir];
}
