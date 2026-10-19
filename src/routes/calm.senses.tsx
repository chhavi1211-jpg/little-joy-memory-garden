import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Completion, PageHeader } from "@/components/AppShell";
import { Steps } from "@/components/Steps";
import { SaveToKit } from "@/components/SaveToKit";

export const Route = createFileRoute("/calm/senses")({
  head: () => ({
    meta: [
      { title: "Five Senses Grounding — A Little Happier" },
      { name: "description", content: "Gently notice what you can see, feel, hear, smell and taste — one step at a time." },
      { property: "og:title", content: "Five Senses Grounding" },
      { property: "og:description", content: "A step-by-step grounding exercise you can skip through freely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Senses,
});

const steps = [
  { title: "5 things you can see", body: "Let your eyes wander. A colour, a shape, light on a wall. Name them quietly to yourself." },
  { title: "4 things you can feel", body: "The chair beneath you, fabric on your skin, the air, your feet on the floor." },
  { title: "3 things you can hear", body: "Near or far. A hum, a voice, your own breath. No need to judge them." },
  { title: "2 things you can smell", body: "If nothing stands out, that's fine — maybe a favourite smell you can imagine." },
  { title: "1 thing you can taste", body: "Whatever is there right now. Or take a sip of water, if you have some nearby." },
];

function Senses() {
  const [done, setDone] = useState(false);
  const [k, setK] = useState(0);
  return (
    <>
      <PageHeader title="Five Senses" subtitle="Skip any step that doesn't feel right. There's no wrong answer." back={{ to: "/calm", label: "Calm" }} />
      <SaveToKit slug="senses" title="Five Senses" />
      {done ? (
        <Completion title="You're here, right now." message="Thank you for taking a moment with yourself." againLabel="Go through again" onAgain={() => { setDone(false); setK(k + 1); }} />
      ) : (
        <Steps key={k} steps={steps} onFinish={() => setDone(true)} />
      )}
    </>
  );
}
