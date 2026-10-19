import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf, Smile, Images, PenLine, Sparkles } from "lucide-react";
import { useAppData, resurfaceable } from "@/lib/app-data";
import { exerciseBySlug, games, moods, reflectionPrompts, reassurances } from "@/lib/catalog";
import type { Memory, Mood } from "@/lib/types";
import { MemoryPhoto } from "@/components/MemoryPhoto";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A Little Happier — small moments that make your day better" },
      { name: "description", content: "Gentle games, calming breathing, and a private journal of your happiest memories." },
      { property: "og:title", content: "A Little Happier" },
      { property: "og:description", content: "Sometimes you don't need to fix your whole day. Just one small moment that makes it better." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const options = [
  { to: "/calm", title: "I need a little calm", blurb: "Breathing, grounding, a soft pause.", icon: Leaf, tone: "bg-sage-soft", dot: "bg-sage" },
  { to: "/play", title: "Make me smile", blurb: "A tiny game, a small win.", icon: Smile, tone: "bg-peach-soft", dot: "bg-peach" },
  { to: "/memories/rediscover", title: "Take me to a happy memory", blurb: "Revisit a moment you saved.", icon: Images, tone: "bg-lavender-soft", dot: "bg-lavender" },
  { to: "/memories/new", title: "Save a little moment", blurb: "A photo, a few words, or both.", icon: PenLine, tone: "bg-butter-soft", dot: "bg-butter" },
] as const;

type Suggestion =
  | { kind: "memory"; memory: Memory }
  | { kind: "game"; game: (typeof games)[number] }
  | { kind: "prompt"; text: string }
  | { kind: "exercise"; slug: string };

function pick<T>(xs: readonly T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

function Home() {
  const { memories, prefs, comfort } = useAppData();
  const [mood, setMood] = useState<Mood | null>(null);
  const [askMood, setAskMood] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [reassure, setReassure] = useState(reassurances[0]);
  const navigate = useNavigate();

  useEffect(() => {
    setAskMood(prefs.moodSuggestions && !sessionStorage.getItem("alh:mood-asked"));
  }, [prefs.moodSuggestions]);

  useEffect(() => {
    const pool = resurfaceable(memories);
    const paused = prefs.resurfacePausedUntil && new Date(prefs.resurfacePausedUntil) > new Date();
    const canMemory = pool.length > 0 && prefs.resurfacing !== "off" && !paused;
    const kinds: Suggestion["kind"][] =
      mood === "anxious" || mood === "restless"
        ? ["exercise", "exercise", ...(canMemory ? (["memory"] as const) : [])]
        : mood === "tired"
          ? ["exercise", "prompt"]
          : mood === "low"
            ? [...(canMemory ? (["memory", "memory"] as const) : []), "game", "exercise"]
            : mood === "joy"
              ? ["game", "game", ...(canMemory ? (["memory"] as const) : [])]
              : ["game", "prompt", "exercise", ...(canMemory ? (["memory", "memory"] as const) : [])];
    const k = pick(kinds);
    const favGames = games.filter((g) => prefs.favouriteGames.includes(g.slug));
    setSuggestion(
      k === "memory"
        ? { kind: "memory", memory: pick(pool) }
        : k === "game"
          ? { kind: "game", game: pick(favGames.length ? favGames : games) }
          : k === "prompt"
            ? { kind: "prompt", text: pick(reflectionPrompts) }
            : { kind: "exercise", slug: mood === "tired" ? "relax" : prefs.preferredExercise },
    );
    setReassure(pick(reassurances));
  }, [memories, mood, prefs.resurfacing, prefs.resurfacePausedUntil, prefs.favouriteGames, prefs.preferredExercise]);

  const chooseMood = (m: Mood | null) => {
    setMood(m);
    setAskMood(false);
    sessionStorage.setItem("alh:mood-asked", "1");
  };

  return (
    <div className="space-y-10">
      <section className="animate-rise pt-2">
        <p className="text-sm text-muted-foreground">{reassure}</p>
        <h1 className="mt-2 text-4xl leading-[1.1] md:text-5xl">
          Hey there.
          <br />
          <span className="text-muted-foreground">What would feel good right now?</span>
        </h1>
      </section>

      {askMood && (
        <section aria-labelledby="mood-q" className="animate-rise rounded-3xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <h2 id="mood-q" className="text-lg">How are you feeling right now?</h2>
            <button onClick={() => chooseMood(null)} className="text-sm text-muted-foreground underline underline-offset-2">
              Skip
            </button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Optional. It only helps us suggest something — nothing is stored.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {moods.map((m) => (
              <button key={m.id} onClick={() => chooseMood(m.id)} className="rounded-full border border-border bg-background px-4 py-2 text-sm hover:bg-secondary">
                {m.label}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Ways to feel better">
        {options.map((o, i) => (
          <Link
            key={o.to}
            to={o.to}
            style={{ animationDelay: `${i * 60}ms` }}
            className={`animate-rise group relative overflow-hidden rounded-3xl ${o.tone} p-6 transition-transform hover:-translate-y-0.5`}
          >
            <span aria-hidden className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${o.dot} opacity-40 transition-transform group-hover:scale-110`} />
            <o.icon className="h-6 w-6" aria-hidden />
            <h2 className="mt-8 text-2xl">{o.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{o.blurb}</p>
          </Link>
        ))}
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => navigate({ to: exerciseBySlug(prefs.preferredExercise).to })}
          className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          Help me feel calmer
        </button>
        <Link to="/ritual" className="rounded-full border border-border bg-card px-5 py-3 text-sm">
          Two-minute ritual
        </Link>
        <Link to="/comfort" className="rounded-full border border-border bg-card px-5 py-3 text-sm">
          My comfort kit{comfort.length ? ` · ${comfort.length}` : ""}
        </Link>
      </section>

      {suggestion && (
        <section aria-labelledby="for-you" className="animate-rise">
          <h2 id="for-you" className="mb-3 flex items-center gap-2 text-xl">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden /> A little something for you
          </h2>
          <SuggestionCard s={suggestion} />
        </section>
      )}
    </div>
  );
}

function SuggestionCard({ s }: { s: Suggestion }) {
  if (s.kind === "memory") {
    return (
      <Link to="/memories" className="flex gap-4 overflow-hidden rounded-3xl border border-border bg-card p-3">
        <MemoryPhoto memory={s.memory} className="h-28 w-28 shrink-0 rounded-2xl" />
        <div className="py-2 pr-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">A little memory for today</p>
          <p className="mt-1 font-display text-lg">{s.memory.caption || "A moment you saved"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{new Date(s.memory.date).toLocaleDateString(undefined, { dateStyle: "long" })}</p>
        </div>
      </Link>
    );
  }
  if (s.kind === "game") {
    return (
      <Link to={s.game.to} className={`block rounded-3xl ${s.game.tone} p-6`}>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">A tiny game</p>
        <p className="mt-1 font-display text-xl">
          <span aria-hidden>{s.game.icon} </span>
          {s.game.title}
        </p>
        <p className="text-sm text-muted-foreground">{s.game.blurb}</p>
      </Link>
    );
  }
  if (s.kind === "prompt") {
    return (
      <Link to="/memories/new" className="block rounded-3xl bg-lavender-soft p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">A gentle reflection</p>
        <p className="mt-1 font-display text-xl">{s.text}</p>
        <p className="mt-1 text-sm text-muted-foreground">Save it as a little moment, if you like.</p>
      </Link>
    );
  }
  const e = exerciseBySlug(s.slug);
  return (
    <Link to={e.to} className={`block rounded-3xl ${e.tone} p-6`}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">A calming moment · {e.minutes}</p>
      <p className="mt-1 font-display text-xl">{e.title}</p>
      <p className="text-sm text-muted-foreground">{e.blurb}</p>
    </Link>
  );
}
