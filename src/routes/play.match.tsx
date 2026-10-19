import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Completion, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/play/match")({
  head: () => ({
    meta: [
      { title: "Match the Memories — A Little Happier" },
      { name: "description", content: "A calm matching game with flowers, fruit and friendly animals." },
      { property: "og:title", content: "Match the Memories" },
      { property: "og:description", content: "Turn over gentle pairs, at your own pace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Match,
});

const symbols = [
  ["🌻", "sunflower"], ["🐢", "turtle"], ["🍓", "strawberry"], ["🌙", "moon"],
  ["🐝", "bee"], ["🍋", "lemon"], ["🌷", "tulip"], ["🐱", "cat"],
] as const;

function deal(pairs: number) {
  const chosen = [...symbols].sort(() => Math.random() - 0.5).slice(0, pairs);
  return [...chosen, ...chosen].map((s, i) => ({ id: i, icon: s[0], name: s[1] })).sort(() => Math.random() - 0.5);
}

function Match() {
  const [challenge, setChallenge] = useState(false);
  const [cards, setCards] = useState<ReturnType<typeof deal>>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [turns, setTurns] = useState(0);
  const pairs = challenge ? 8 : 6;

  const start = () => {
    setCards(deal(pairs));
    setOpen([]);
    setFound(new Set());
    setTurns(0);
  };
  useEffect(start, [pairs]); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || found.has(cards[i].name)) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setTurns((t) => t + 1);
      const [a, b] = next;
      if (cards[a].name === cards[b].name) {
        setFound((f) => new Set(f).add(cards[a].name));
        setTimeout(() => setOpen([]), 300);
      } else {
        setTimeout(() => setOpen([]), 900);
      }
    }
  };

  const done = cards.length > 0 && found.size === pairs;

  return (
    <>
      <PageHeader title="Match the Memories" subtitle="Find the pairs. There's no clock — take your time." back={{ to: "/play", label: "Games" }} />
      {done ? (
        <Completion title="Every pair found." message={`${turns} gentle turns. A small, lovely win.`} onAgain={start} />
      ) : (
        <>
          <div className="mb-4 flex items-center gap-4 text-sm">
            <span className="rounded-full bg-peach-soft px-3 py-1">{found.size} of {pairs} pairs</span>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={challenge} onChange={(e) => setChallenge(e.target.checked)} className="accent-primary" />
              Challenge mode
            </label>
          </div>
          <div className={`mx-auto grid max-w-lg gap-3 ${challenge ? "grid-cols-4" : "grid-cols-3 sm:grid-cols-4"}`}>
            {cards.map((c, i) => {
              const shown = open.includes(i) || found.has(c.name);
              return (
                <button
                  key={c.id}
                  onClick={() => flip(i)}
                  aria-label={shown ? c.name : "Hidden card"}
                  className={`aspect-square rounded-2xl text-4xl transition-all duration-300 ${
                    shown ? "bg-card shadow-sm" : "bg-peach hover:-translate-y-0.5"
                  } ${found.has(c.name) ? "opacity-70" : ""}`}
                >
                  <span aria-hidden className={`inline-block transition-transform duration-300 ${shown ? "scale-100" : "scale-0"}`}>{c.icon}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
