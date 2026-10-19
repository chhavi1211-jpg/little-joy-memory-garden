import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { MemoryPhoto } from "@/components/MemoryPhoto";
import { useAppData, resurfaceable } from "@/lib/app-data";
import { reflectionPrompts } from "@/lib/catalog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/ritual")({
  head: () => ({
    meta: [
      { title: "Daily Ritual — A Little Happier" },
      { name: "description", content: "An optional two-minute ritual: a tiny game, a happy memory, and a gentle reflection." },
      { property: "og:title", content: "A two-minute daily ritual" },
      { property: "og:description", content: "Skip any step. No streaks, no guilt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Ritual,
});

function Bubbles({ onDone }: { onDone: () => void }) {
  const [popped, setPopped] = useState<number[]>([]);
  const [spots, setSpots] = useState<{ i: number; x: number; y: number; s: number }[]>([]);
  useEffect(() => setSpots(Array.from({ length: 7 }, (_, i) => ({ i, x: 10 + Math.random() * 80, y: 15 + Math.random() * 70, s: 40 + Math.random() * 30 }))), []);
  useEffect(() => { if (spots.length && popped.length === spots.length) setTimeout(onDone, 400); }, [popped]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="relative h-64 overflow-hidden rounded-3xl bg-sage-soft">
      {spots.map((b) => (
        <button key={b.i} aria-label="Pop bubble" onClick={() => setPopped((p) => [...p, b.i])}
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-lavender/60 transition-all duration-300 ${popped.includes(b.i) ? "scale-150 opacity-0" : "animate-float"}`}
          style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: b.s, animationDelay: `${b.i * 0.4}s` }} />
      ))}
      <p className="absolute bottom-3 left-0 right-0 text-center text-sm text-muted-foreground">Pop the bubbles · {spots.length - popped.length} left</p>
    </div>
  );
}

function Ritual() {
  const { memories, addReflection } = useAppData();
  const [step, setStep] = useState(0);
  const [good, setGood] = useState("");
  const [intent, setIntent] = useState("");
  const [prompt] = useState(() => reflectionPrompts[0]);
  const pool = resurfaceable(memories);
  const [mem, setMem] = useState<(typeof pool)[number] | null>(null);
  useEffect(() => { if (pool.length && !mem) setMem(pool[Math.floor(Math.random() * pool.length)]); }, [pool.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const titles = ["A tiny game", "One happy memory", "A gentle reflection", "An intention for tomorrow"];
  const next = () => setStep((s) => s + 1);

  const finish = async () => {
    try {
      await addReflection(good, intent);
      if (good || intent) toast.success("Kept safely in your journal.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save.");
    }
    next();
  };

  return (
    <>
      <PageHeader title="Your little ritual" subtitle="About two minutes. Skip anything — there's no streak to keep." back={{ to: "/", label: "Home" }} />
      {step < 4 && (
        <div className="mx-auto mb-4 flex max-w-lg gap-1.5" aria-hidden>
          {titles.map((_, k) => <span key={k} className={`h-1.5 flex-1 rounded-full ${k <= step ? "bg-primary" : "bg-border"}`} />)}
        </div>
      )}
      <div className="mx-auto max-w-lg">
        {step < 4 && <h2 className="mb-4 text-2xl">{titles[step]}</h2>}
        {step === 0 && <Bubbles onDone={next} />}
        {step === 1 && (mem ? (
          <div className="overflow-hidden rounded-3xl bg-card">
            <MemoryPhoto memory={mem} className="aspect-[4/3] w-full" />
            <p className="p-5 font-display text-xl">{mem.caption || "A moment you saved"}</p>
          </div>
        ) : (
          <p className="rounded-3xl bg-lavender-soft p-6 text-muted-foreground">When you save memories, one will appear here. <Link to="/memories/new" className="underline">Save one now</Link></p>
        ))}
        {step === 2 && (
          <div>
            <label htmlFor="good" className="mb-2 block text-muted-foreground">{prompt}</label>
            <Textarea id="good" value={good} onChange={(e) => setGood(e.target.value)} rows={4} maxLength={1000} className="rounded-2xl bg-card" placeholder="Even something tiny counts." />
          </div>
        )}
        {step === 3 && (
          <div>
            <label htmlFor="int" className="mb-2 block text-muted-foreground">Something small you'd like for tomorrow? (optional)</label>
            <Input id="int" value={intent} onChange={(e) => setIntent(e.target.value)} maxLength={200} className="rounded-2xl bg-card" placeholder="Take a short walk" />
          </div>
        )}
        {step >= 4 && (
          <div className="rounded-3xl bg-butter-soft p-8 text-center">
            <h2 className="text-2xl">That's your ritual.</h2>
            <p className="mt-2 text-muted-foreground">Thank you for giving yourself these minutes.</p>
            <Link to="/" className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Return home</Link>
          </div>
        )}
        {step < 4 && (
          <div className="mt-6 flex justify-between">
            <button onClick={step === 3 ? finish : next} className="text-sm text-muted-foreground underline underline-offset-2">Skip</button>
            <button onClick={step === 3 ? finish : next} className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">{step === 3 ? "Finish" : "Next"}</button>
          </div>
        )}
      </div>
    </>
  );
}
