import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Completion, PageHeader } from "@/components/AppShell";
import { Steps } from "@/components/Steps";
import { SaveToKit } from "@/components/SaveToKit";

export const Route = createFileRoute("/calm/quick")({
  head: () => ({
    meta: [
      { title: "Quick Grounding — A Little Happier" },
      { name: "description", content: "A 30-second exercise to notice your feet, soften your shoulders and look around." },
      { property: "og:title", content: "Quick Grounding" },
      { property: "og:description", content: "Thirty seconds to land where you are." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Quick,
});

const steps = [
  { title: "Feel your feet", body: "Notice your feet on the floor. Press them down a little, if you like.", seconds: 10 },
  { title: "Soften your shoulders", body: "If it's comfortable, let your shoulders drop slightly. Unclench your jaw.", seconds: 10 },
  { title: "Look around", body: "Find three things in the room you hadn't noticed before.", seconds: 10 },
];

function Quick() {
  const [done, setDone] = useState(false);
  const [k, setK] = useState(0);
  return (
    <>
      <PageHeader title="Quick Grounding" subtitle="Thirty seconds. It moves on by itself, or tap Next." back={{ to: "/calm", label: "Calm" }} />
      <SaveToKit slug="quick" title="Quick Grounding" />
      {done ? (
        <Completion title="Thirty seconds, just for you." message="You can come back here whenever you need." againLabel="Once more" onAgain={() => { setDone(false); setK(k + 1); }} />
      ) : (
        <Steps key={k} steps={steps} onFinish={() => setDone(true)} accent="bg-butter-soft" />
      )}
    </>
  );
}
