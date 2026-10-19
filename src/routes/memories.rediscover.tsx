import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { MemoryPhoto } from "@/components/MemoryPhoto";
import { useAppData, resurfaceable } from "@/lib/app-data";

export const Route = createFileRoute("/memories/rediscover")({
  head: () => ({
    meta: [
      { title: "Take me to a happy memory — A Little Happier" },
      { name: "description", content: "A gentle, one-at-a-time journey through moments you chose to save." },
      { property: "og:title", content: "Take me to a happy memory" },
      { property: "og:description", content: "Revisit your own good moments, one at a time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Rediscover,
});

type Cat = { key: string; label: string; match: (ids: string[], tags: string[]) => boolean };

function Rediscover() {
  const { memories, collections } = useAppData();
  const pool = useMemo(() => resurfaceable(memories), [memories]);
  const [cat, setCat] = useState<Cat | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [i, setI] = useState(0);
  const [ended, setEnded] = useState(false);

  const tagCounts = useMemo(() => {
    const m = new Map<string, number>();
    pool.forEach((x) => x.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [pool]);

  const cats: Cat[] = [
    { key: "all", label: "Surprise me", match: () => true },
    ...collections.map((c) => ({ key: c.id, label: c.name, match: (ids: string[]) => ids.includes(c.id) })),
    ...tagCounts.map(([t]) => ({ key: `t:${t}`, label: `#${t}`, match: (_: string[], tags: string[]) => tags.includes(t) })),
  ];

  const begin = (c: Cat) => {
    const ids = pool.filter((m) => c.match(m.collectionIds, m.tags)).map((m) => m.id).sort(() => Math.random() - 0.5);
    setCat(c);
    setOrder(ids);
    setI(0);
    setEnded(false);
  };

  if (pool.length === 0) {
    return (
      <>
        <PageHeader title="Take me to a happy memory" back={{ to: "/", label: "Home" }} />
        <div className="rounded-3xl bg-lavender-soft p-10 text-center">
          <h2 className="text-2xl">No memories here yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-muted-foreground">When you save moments, you'll be able to wander back through them here. Meanwhile, maybe a tiny game?</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/memories/new" className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Save a moment</Link>
            <Link to="/play" className="rounded-full border border-border bg-card px-5 py-2.5 text-sm">Play something</Link>
          </div>
        </div>
      </>
    );
  }

  if (!cat) {
    return (
      <>
        <PageHeader title="Where would you like to go?" subtitle="Choose a kind of memory. We'll show one at a time, and you can stop whenever you like." back={{ to: "/", label: "Home" }} />
        <div className="flex flex-wrap gap-3">
          {cats.map((c) => (
            <button key={c.key} onClick={() => begin(c)} className="rounded-3xl bg-lavender-soft px-6 py-4 font-display text-lg">{c.label}</button>
          ))}
        </div>
      </>
    );
  }

  const m = pool.find((x) => x.id === order[i]);
  if (ended || !m) {
    return (
      <>
        <PageHeader title="Thank you for spending a moment here." back={{ to: "/", label: "Home" }} />
        <p className="text-muted-foreground">However you're feeling now is okay. These moments are yours to come back to.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => setCat(null)} className="rounded-full border border-border bg-card px-5 py-2.5 text-sm">Choose another kind</button>
          <Link to="/calm" className="rounded-full border border-border bg-card px-5 py-2.5 text-sm">Something calming</Link>
          <Link to="/" className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Return home</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Would you like to spend a moment here?" back={{ to: "/memories", label: "Memories" }} />
      <article key={m.id} className="animate-rise mx-auto max-w-xl overflow-hidden rounded-3xl bg-card">
        <MemoryPhoto memory={m} className="aspect-[4/3] w-full" />
        <div className="p-6">
          <p className="font-display text-2xl">{m.caption || "A moment you saved"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{new Date(m.date + "T00:00:00").toLocaleDateString(undefined, { dateStyle: "long" })}{m.location ? ` · ${m.location}` : ""}</p>
        </div>
      </article>
      <div className="mx-auto mt-6 flex max-w-xl flex-wrap justify-between gap-3">
        <button onClick={() => setEnded(true)} className="rounded-full border border-border bg-card px-5 py-2.5 text-sm">I'm done for now</button>
        {i + 1 < order.length ? (
          <button onClick={() => setI(i + 1)} className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Another memory ({order.length - i - 1} more)</button>
        ) : (
          <button onClick={() => setEnded(true)} className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">That's all of them</button>
        )}
      </div>
    </>
  );
}
