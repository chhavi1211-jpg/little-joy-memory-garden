import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Completion, PageHeader } from "@/components/AppShell";
import { Steps, type Step } from "@/components/Steps";
import { SaveToKit } from "@/components/SaveToKit";

export const Route = createFileRoute("/calm/relax")({
  head: () => ({
    meta: [
      { title: "Guided Relaxation — A Little Happier" },
      { name: "description", content: "Short 1, 3 or 5 minute guided relaxations with optional voice." },
      { property: "og:title", content: "Guided Relaxation" },
      { property: "og:description", content: "A soft, short unwind for body and mind." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Relax,
});

const cues: Omit<Step, "seconds">[] = [
  { title: "Settle in", body: "Find a position that feels okay. Let your eyes rest open or closed." },
  { title: "Your forehead", body: "Notice your forehead and the space between your eyebrows. Let it smooth." },
  { title: "Your jaw", body: "Let your teeth part a little. Let your tongue rest." },
  { title: "Your shoulders", body: "Let them sink, just a touch, if that's comfortable." },
  { title: "Your hands", body: "Let your fingers uncurl. Feel whatever they're resting on." },
  { title: "Your breath", body: "No need to change it. Simply notice it coming and going." },
  { title: "Your belly", body: "Let it be soft. Nothing to hold in right now." },
  { title: "Your legs", body: "Feel their weight. Let the floor or chair hold them." },
  { title: "Your feet", body: "Notice your feet. Steady and here." },
  { title: "A kind thought", body: "If you like, offer yourself a few kind words — the ones you'd give a friend." },
];

function Relax() {
  const [mins, setMins] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const steps = (m: number): Step[] => {
    const count = m === 1 ? 4 : m === 3 ? 7 : 10;
    const chosen = count === 4 ? [cues[0], cues[3], cues[5], cues[9]] : count === 7 ? [cues[0], cues[1], cues[2], cues[3], cues[5], cues[8], cues[9]] : cues;
    const secs = Math.round((m * 60) / chosen.length);
    return chosen.map((c) => ({ ...c, seconds: secs }));
  };
  return (
    <>
      <PageHeader title="Guided Relaxation" subtitle="Choose a length. Turn on 'Read aloud' for a gentle voice." back={{ to: "/calm", label: "Calm" }} />
      <SaveToKit slug="relax" title="Guided Relaxation" />
      {done ? (
        <Completion title="Welcome back." message="Take your time before moving on." againLabel="Choose another" onAgain={() => { setDone(false); setMins(null); }} />
      ) : mins === null ? (
        <div className="flex flex-wrap gap-3">
          {[1, 3, 5].map((m) => (
            <button key={m} onClick={() => setMins(m)} className="rounded-3xl bg-sage-soft px-8 py-6 font-display text-2xl">
              {m} min
            </button>
          ))}
        </div>
      ) : (
        <Steps steps={steps(mins)} onFinish={() => setDone(true)} accent="bg-lavender-soft" />
      )}
    </>
  );
}
