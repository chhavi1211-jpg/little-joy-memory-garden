import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Completion, PageHeader } from "@/components/AppShell";
import meadow from "@/assets/meadow.jpg";

export const Route = createFileRoute("/play/puzzle")({
  head: () => ({
    meta: [
      { title: "Tiny Puzzle — A Little Happier" },
      { name: "description", content: "Swap tiles to piece together a peaceful meadow." },
      { property: "og:title", content: "Tiny Puzzle" },
      { property: "og:description", content: "A small, soothing picture puzzle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Puzzle,
});

function shuffled(n: number) {
  const arr = Array.from({ length: n * n }, (_, i) => i);
  do arr.sort(() => Math.random() - 0.5);
  while (arr.every((v, i) => v === i));
  return arr;
}

function Puzzle() {
  const [challenge, setChallenge] = useState(false);
  const n = challenge ? 4 : 3;
  const [tiles, setTiles] = useState<number[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  useEffect(() => { setTiles(shuffled(n)); setSel(null); }, [n]);

  const click = (i: number) => {
    if (sel === null) return setSel(i);
    if (sel !== i) {
      const t = [...tiles];
      [t[sel], t[i]] = [t[i], t[sel]];
      setTiles(t);
    }
    setSel(null);
  };
  const done = tiles.length > 0 && tiles.every((v, i) => v === i);

  return (
    <>
      <PageHeader title="Tiny Puzzle" subtitle="Tap one tile, then another, to swap them. Tiles in the right place glow softly." back={{ to: "/play", label: "Games" }} />
      {done ? (
        <div className="space-y-6">
          <img src={meadow} alt="A completed painting of a sunny meadow and cottage" width={1024} height={1024} className="mx-auto w-full max-w-sm rounded-3xl" />
          <Completion title="All pieced together." message="A whole little meadow, made by you." onAgain={() => setTiles(shuffled(n))} />
        </div>
      ) : (
        <>
          <label className="mb-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={challenge} onChange={(e) => setChallenge(e.target.checked)} className="accent-primary" />
            Challenge mode (4×4)
          </label>
          <div className="mx-auto grid aspect-square w-full max-w-md gap-1 rounded-3xl bg-butter-soft p-2" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
            {tiles.map((v, i) => {
              const r = Math.floor(v / n), c = v % n;
              return (
                <button
                  key={i}
                  onClick={() => click(i)}
                  aria-label={`Tile ${i + 1}${v === i ? ", in place" : ""}${sel === i ? ", selected" : ""}`}
                  className={`rounded-lg bg-no-repeat transition-all ${sel === i ? "scale-95 ring-4 ring-primary" : ""} ${v === i ? "ring-2 ring-butter" : ""}`}
                  style={{ backgroundImage: `url(${meadow})`, backgroundSize: `${n * 100}%`, backgroundPosition: `${(c / (n - 1)) * 100}% ${(r / (n - 1)) * 100}%` }}
                />
              );
            })}
          </div>
          <details className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            <summary className="cursor-pointer">Peek at the picture</summary>
            <img src={meadow} alt="" loading="lazy" width={1024} height={1024} className="mt-2 w-40 rounded-xl" />
          </details>
        </>
      )}
    </>
  );
}
