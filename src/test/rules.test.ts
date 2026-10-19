import { describe, expect, it } from "vitest";
import { resurfaceable } from "@/lib/app-data";
import { generateMaze } from "@/lib/maze";
import type { Memory } from "@/lib/types";

const mk = (p: Partial<Memory>): Memory => ({
  id: Math.random().toString(), photoUrl: null, photoPath: null, caption: "", date: "2024-01-01", location: "",
  tags: [], collectionIds: [], feeling: "comforting", archived: false, source: "upload", createdAt: "", ...p,
});

describe("memory resurfacing", () => {
  it("never resurfaces archived memories", () => {
    expect(resurfaceable([mk({ archived: true })])).toHaveLength(0);
  });
  it("never resurfaces memories marked as not to revisit", () => {
    expect(resurfaceable([mk({ feeling: "avoid" })])).toHaveLength(0);
  });
  it("keeps comforting and neutral memories", () => {
    expect(resurfaceable([mk({}), mk({ feeling: "neutral" })])).toHaveLength(2);
  });
});

describe("maze", () => {
  it("every cell is reachable from the start", () => {
    const n = 9;
    const g = generateMaze(n);
    const seen = new Set(["0,0"]);
    const q: [number, number][] = [[0, 0]];
    while (q.length) {
      const [x, y] = q.shift()!;
      const c = g[y][x];
      const nb: [boolean, number, number][] = [[!c.n, x, y - 1], [!c.e, x + 1, y], [!c.s, x, y + 1], [!c.w, x - 1, y]];
      for (const [open, nx, ny] of nb) if (open && !seen.has(`${nx},${ny}`)) { seen.add(`${nx},${ny}`); q.push([nx, ny]); }
    }
    expect(seen.size).toBe(n * n);
  });
});
