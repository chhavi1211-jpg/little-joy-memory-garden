import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Completion, PageHeader } from "@/components/AppShell";
import { Breather, type Phase } from "@/components/Breather";
import { SaveToKit } from "@/components/SaveToKit";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/calm/box")({
  head: () => ({
    meta: [
      { title: "Box Breathing — A Little Happier" },
      { name: "description", content: "A gentle four-second box breathing guide with adjustable pace and optional holds." },
      { property: "og:title", content: "Box Breathing" },
      { property: "og:description", content: "Inhale, hold, exhale, hold — at a pace that suits you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Box,
});

function Box() {
  const [secs, setSecs] = useState(4);
  const [holds, setHolds] = useState(true);
  const [rounds, setRounds] = useState(4);
  const [done, setDone] = useState(false);
  const [key, setKey] = useState(0);

  const phases: Phase[] = [
    { label: "Breathe in", seconds: secs, scale: 1 },
    ...(holds ? [{ label: "Hold gently", seconds: secs, scale: 1 }] : []),
    { label: "Breathe out", seconds: secs, scale: 0.15 },
    ...(holds ? [{ label: "Rest", seconds: secs, scale: 0.15 }] : []),
  ];

  return (
    <>
      <PageHeader title="Box Breathing" subtitle="Follow the square as it grows and softens. Breathe comfortably — never forced." back={{ to: "/calm", label: "Calm" }} />
      <SaveToKit slug="box" title="Box Breathing" />
      {done ? (
        <Completion title="Nicely done." message="Notice how you feel now — whatever that is, it's okay." againLabel="Another round" onAgain={() => { setDone(false); setKey((k) => k + 1); }} />
      ) : (
        <div className="grid gap-8 md:grid-cols-[1fr_280px]">
          <Breather key={`${key}-${secs}-${holds}-${rounds}`} phases={phases} shape="square" cycles={rounds} onFinish={() => setDone(true)} />
          <aside className="space-y-6 rounded-3xl bg-card p-5 text-sm">
            <div>
              <label className="mb-2 block">Pace: {secs} seconds per side</label>
              <Slider min={2} max={6} step={1} value={[secs]} onValueChange={(v) => setSecs(v[0])} aria-label="Seconds per phase" />
            </div>
            <div>
              <label className="mb-2 block">Rounds: {rounds}</label>
              <Slider min={2} max={10} step={1} value={[rounds]} onValueChange={(v) => setRounds(v[0])} aria-label="Rounds" />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!holds} onChange={(e) => setHolds(!e.target.checked)} className="accent-primary" />
              Skip the breath holds
            </label>
            <p className="text-muted-foreground">
              Holding your breath isn't comfortable for everyone. Try skipping holds, or{" "}
              <Link to="/calm/slow" className="underline underline-offset-2">slow breathing</Link> instead.
            </p>
          </aside>
        </div>
      )}
    </>
  );
}
