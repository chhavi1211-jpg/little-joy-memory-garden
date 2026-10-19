import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Completion, PageHeader } from "@/components/AppShell";
import { Breather } from "@/components/Breather";
import { SaveToKit } from "@/components/SaveToKit";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/calm/slow")({
  head: () => ({
    meta: [
      { title: "Slow Breathing — A Little Happier" },
      { name: "description", content: "An easy, unforced breathing rhythm with adjustable timing and no holds." },
      { property: "og:title", content: "Slow Breathing" },
      { property: "og:description", content: "Gentle in, gentle out. Stop whenever you wish." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Slow,
});

function Slow() {
  const [inS, setIn] = useState(4);
  const [outS, setOut] = useState(6);
  const [rounds, setRounds] = useState(6);
  const [done, setDone] = useState(false);
  const [key, setKey] = useState(0);
  return (
    <>
      <PageHeader title="Slow Breathing" subtitle="No need for deep or big breaths. Just a little slower than usual, if that feels okay." back={{ to: "/calm", label: "Calm" }} />
      <SaveToKit slug="slow" title="Slow Breathing" />
      {done ? (
        <Completion title="That was a kind thing to do for yourself." message="Stay here as long as you like." againLabel="Keep breathing" onAgain={() => { setDone(false); setKey((k) => k + 1); }} />
      ) : (
        <div className="grid gap-8 md:grid-cols-[1fr_280px]">
          <Breather
            key={`${key}-${inS}-${outS}-${rounds}`}
            shape="circle"
            cycles={rounds}
            onFinish={() => setDone(true)}
            phases={[
              { label: "Breathe in softly", seconds: inS, scale: 0.9 },
              { label: "And let it go", seconds: outS, scale: 0.2 },
            ]}
          />
          <aside className="space-y-6 rounded-3xl bg-card p-5 text-sm">
            <div>
              <label className="mb-2 block">In: {inS}s</label>
              <Slider min={2} max={7} value={[inS]} onValueChange={(v) => setIn(v[0])} aria-label="Inhale seconds" />
            </div>
            <div>
              <label className="mb-2 block">Out: {outS}s</label>
              <Slider min={2} max={9} value={[outS]} onValueChange={(v) => setOut(v[0])} aria-label="Exhale seconds" />
            </div>
            <div>
              <label className="mb-2 block">Breaths: {rounds}</label>
              <Slider min={3} max={20} value={[rounds]} onValueChange={(v) => setRounds(v[0])} aria-label="Number of breaths" />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
