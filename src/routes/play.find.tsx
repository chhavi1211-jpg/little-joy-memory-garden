import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Completion, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/play/find")({
  head: () => ({
    meta: [
      { title: "Find the Little Things — A Little Happier" },
      { name: "description", content: "A relaxed search game in a quiet garden. Curiosity, not speed." },
      { property: "og:title", content: "Find the Little Things" },
      { property: "og:description", content: "Spot small surprises hidden in a peaceful garden." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Find,
});

// positions in % of scene
const items = [
  { id: "ladybug", icon: "🐞", x: 18, y: 78, size: 4 },
  { id: "snail", icon: "🐌", x: 72, y: 86, size: 4.5 },
  { id: "butterfly", icon: "🦋", x: 62, y: 30, size: 5 },
  { id: "mushroom", icon: "🍄", x: 40, y: 72, size: 4 },
  { id: "bird", icon: "🐦", x: 84, y: 42, size: 4.5 },
  { id: "acorn", icon: "🌰", x: 8, y: 60, size: 3.5 },
  { id: "star", icon: "⭐", x: 28, y: 14, size: 3.5 },
  { id: "teacup", icon: "🍵", x: 52, y: 58, size: 4 },
];
const decoys = [
  ["🌿", 12, 70], ["🌸", 24, 66], ["🌼", 35, 84], ["🌱", 48, 80], ["🌿", 58, 74], ["🌸", 66, 66], ["🌼", 78, 72], ["🌿", 90, 80],
  ["🌳", 6, 38], ["🌳", 92, 30], ["☁️", 44, 12], ["☁️", 74, 10], ["🌾", 30, 56], ["🌾", 86, 60], ["🌺", 20, 90], ["🍃", 54, 90],
] as const;

function Find() {
  const [challenge, setChallenge] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const targets = challenge ? items : items.slice(0, 5);
  const done = targets.every((t) => found.includes(t.id));

  return (
    <>
      <PageHeader title="Find the Little Things" subtitle="Tap each little thing when you spot it. Wander as long as you like." back={{ to: "/play", label: "Games" }} />
      {done ? (
        <Completion title="You noticed them all." message="Noticing small things is its own kind of calm." onAgain={() => setFound([])} />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            {targets.map((t) => (
              <span key={t.id} className={`rounded-full px-3 py-1 ${found.includes(t.id) ? "bg-sage text-primary-foreground line-through" : "bg-lavender-soft"}`}>
                <span aria-hidden>{t.icon}</span> {t.id}
              </span>
            ))}
            <label className="ml-auto flex items-center gap-2">
              <input type="checkbox" checked={challenge} onChange={(e) => { setChallenge(e.target.checked); setFound([]); }} className="accent-primary" />
              Challenge mode
            </label>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-3xl bg-gradient-to-b from-butter-soft via-peach-soft to-sage-soft">
            <div aria-hidden className="absolute -bottom-10 left-[-10%] h-1/2 w-[70%] rounded-[50%] bg-sage/50" />
            <div aria-hidden className="absolute -bottom-12 right-[-10%] h-[55%] w-[70%] rounded-[50%] bg-sage/70" />
            <div aria-hidden className="absolute right-[12%] top-[8%] h-14 w-14 rounded-full bg-butter" />
            {decoys.map(([icon, x, y], i) => (
              <span key={i} aria-hidden className="absolute -translate-x-1/2 -translate-y-1/2 select-none text-[clamp(18px,4vw,30px)]" style={{ left: `${x}%`, top: `${y}%` }}>
                {icon}
              </span>
            ))}
            {targets.map((t) => (
              <button
                key={t.id}
                onClick={() => !found.includes(t.id) && setFound((f) => [...f, t.id])}
                aria-label={`Find the ${t.id}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ${found.includes(t.id) ? "scale-125 ring-4 ring-butter" : ""} ${hint === t.id ? "animate-pulse ring-2 ring-primary" : ""}`}
                style={{ left: `${t.x}%`, top: `${t.y}%`, fontSize: `clamp(14px, ${t.size * 0.6}vw, 26px)`, opacity: found.includes(t.id) ? 1 : 0.92 }}
              >
                <span aria-hidden>{t.icon}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                const next = targets.find((t) => !found.includes(t.id));
                if (next) {
                  setHint(next.id);
                  setTimeout(() => setHint(null), 2500);
                }
              }}
              className="text-sm text-muted-foreground underline underline-offset-2"
            >
              Show me a gentle hint
            </button>
          </div>
        </>
      )}
    </>
  );
}
