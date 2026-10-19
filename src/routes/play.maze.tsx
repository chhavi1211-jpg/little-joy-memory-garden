import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { Completion, PageHeader } from "@/components/AppShell";
import { canMove, generateMaze } from "@/lib/maze";
import { useAppData } from "@/lib/app-data";

export const Route = createFileRoute("/play/maze")({
  head: () => ({
    meta: [
      { title: "Happy Maze — A Little Happier" },
      { name: "description", content: "Guide a little sun through a soft maze to a flower. No timers, no losing." },
      { property: "og:title", content: "Happy Maze" },
      { property: "og:description", content: "A gentle maze game with a satisfying little win." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Maze,
});

const levels = [5, 6, 7, 9, 11];
const cheers = ["You found your way!", "A little win for today.", "Lovely wandering.", "There it is — sunshine."];
type Dir = "n" | "e" | "s" | "w";
const delta: Record<Dir, [number, number]> = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };

function Maze() {
  const { prefs } = useAppData();
  const [challenge, setChallenge] = useState(false);
  const [level, setLevel] = useState(0);
  const [seed, setSeed] = useState(0);
  const size = levels[Math.min(level + (challenge ? 2 : 0), levels.length - 1)];
  const grid = useMemo(() => generateMaze(size), [size, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [trail, setTrail] = useState<string[]>(["0,0"]);
  const [done, setDone] = useState(false);
  const [bump, setBump] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setPos([0, 0]);
    setTrail(["0,0"]);
    setDone(false);
  }, []);
  useEffect(reset, [grid, reset]);

  const move = useCallback(
    (d: Dir) => {
      if (done) return;
      setPos(([x, y]) => {
        if (!canMove(grid, x, y, d)) {
          setBump(true);
          setTimeout(() => setBump(false), 180);
          return [x, y];
        }
        const nx = x + delta[d][0], ny = y + delta[d][1];
        setTrail((t) => [...t, `${nx},${ny}`]);
        if (nx === size - 1 && ny === size - 1) {
          setTimeout(() => setDone(true), prefs.reduceMotion ? 0 : 350);
          if (prefs.haptics) navigator.vibrate?.([20, 40, 20]);
        }
        return [nx, ny];
      });
    },
    [grid, size, done, prefs.reduceMotion, prefs.haptics],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = { ArrowUp: "n", ArrowRight: "e", ArrowDown: "s", ArrowLeft: "w", w: "n", d: "e", s: "s", a: "w" };
      const d = map[e.key];
      if (d && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        move(d);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  // swipe
  const touch = useRef<[number, number] | null>(null);
  const onTouchStart = (e: React.TouchEvent) => (touch.current = [e.touches[0].clientX, e.touches[0].clientY]);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current[0];
    const dy = e.changedTouches[0].clientY - touch.current[1];
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "e" : "w") : dy > 0 ? "s" : "n");
  };

  const cell = 100 / size;
  const trailSet = new Set(trail);

  if (done) {
    return (
      <>
        <PageHeader title="Happy Maze" back={{ to: "/play", label: "Games" }} />
        <Completion
          title={cheers[level % cheers.length]}
          message={level < levels.length - 1 ? "Ready for a slightly bigger path? Or rest here a while." : "You've wandered every path. Start a fresh one anytime."}
          againLabel={level < levels.length - 1 ? "Next maze" : "New maze"}
          onAgain={() => {
            setLevel((l) => Math.min(l + 1, levels.length - 1));
            setSeed((s) => s + 1);
          }}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Happy Maze" subtitle="Guide the little sun to the flower. Use arrow keys, swipe, or the buttons." back={{ to: "/play", label: "Games" }} />
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-sage-soft px-3 py-1">Maze {level + 1}</span>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={challenge} onChange={(e) => setChallenge(e.target.checked)} className="accent-primary" />
          Challenge mode (bigger mazes)
        </label>
        <button onClick={() => setSeed((s) => s + 1)} className="text-muted-foreground underline underline-offset-2">
          Different path
        </button>
      </div>

      <div
        ref={boardRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="application"
        aria-label={`Maze, ${size} by ${size}. You are at column ${pos[0] + 1}, row ${pos[1] + 1}. Goal is bottom right.`}
        className={`relative mx-auto aspect-square w-full max-w-[460px] touch-none rounded-3xl bg-sage-soft p-3 transition-transform ${bump ? "translate-x-0.5" : ""}`}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {grid.flatMap((row, y) =>
            row.map((c, x) => (
              <g key={`${x}-${y}`}>
                {trailSet.has(`${x},${y}`) && <rect x={x * cell + cell * 0.3} y={y * cell + cell * 0.3} width={cell * 0.4} height={cell * 0.4} rx={cell * 0.2} fill="var(--color-butter)" opacity={0.6} />}
                {c.n && <line x1={x * cell} y1={y * cell} x2={(x + 1) * cell} y2={y * cell} />}
                {c.w && <line x1={x * cell} y1={y * cell} x2={x * cell} y2={(y + 1) * cell} />}
                {y === size - 1 && c.s && <line x1={x * cell} y1={100} x2={(x + 1) * cell} y2={100} />}
                {x === size - 1 && c.e && <line x1={100} y1={y * cell} x2={100} y2={(y + 1) * cell} />}
                {c.e && x < size - 1 && <line x1={(x + 1) * cell} y1={y * cell} x2={(x + 1) * cell} y2={(y + 1) * cell} />}
                {c.s && y < size - 1 && <line x1={x * cell} y1={(y + 1) * cell} x2={(x + 1) * cell} y2={(y + 1) * cell} />}
              </g>
            )),
          ).map((g) => g)}
          <style>{`line{stroke:var(--color-primary);stroke-width:1.1;stroke-linecap:round}`}</style>
          <text x={(size - 0.5) * cell} y={(size - 0.5) * cell} fontSize={cell * 0.6} textAnchor="middle" dominantBaseline="central">🌷</text>
          <circle
            cx={(pos[0] + 0.5) * cell}
            cy={(pos[1] + 0.5) * cell}
            r={cell * 0.28}
            fill="var(--color-peach)"
            stroke="var(--color-butter)"
            strokeWidth={cell * 0.08}
            style={{ transition: "cx 160ms ease, cy 160ms ease" }}
          />
        </svg>
      </div>

      <div className="mx-auto mt-6 grid w-44 grid-cols-3 gap-2" aria-label="Move controls">
        <span />
        <PadBtn label="Up" onClick={() => move("n")}><ArrowUp /></PadBtn>
        <span />
        <PadBtn label="Left" onClick={() => move("w")}><ArrowLeft /></PadBtn>
        <PadBtn label="Down" onClick={() => move("s")}><ArrowDown /></PadBtn>
        <PadBtn label="Right" onClick={() => move("e")}><ArrowRight /></PadBtn>
      </div>
    </>
  );
}

function PadBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button aria-label={`Move ${label}`} onClick={onClick} className="flex h-12 items-center justify-center rounded-2xl bg-card shadow-sm active:scale-95 [&_svg]:h-5 [&_svg]:w-5">
      {children}
    </button>
  );
}
