import { useEffect, useState } from "react";
import { useAppData } from "@/lib/app-data";
import { speak, stopSpeaking } from "@/lib/sound";
import { StopNote } from "@/components/AppShell";

export interface Step {
  title: string;
  body: string;
  seconds?: number; // auto-advance after N seconds
}

/** One-step-at-a-time guide with skip, back, optional voice and auto-advance. */
export function Steps({ steps, onFinish, accent = "bg-peach-soft" }: { steps: Step[]; onFinish: () => void; accent?: string }) {
  const { prefs } = useAppData();
  const [i, setI] = useState(0);
  const [voice, setVoice] = useState(false);
  const [left, setLeft] = useState<number | null>(null);
  const s = steps[i];

  const next = () => (i + 1 >= steps.length ? (stopSpeaking(), onFinish()) : setI(i + 1));

  useEffect(() => {
    if (voice) speak(`${s.title}. ${s.body}`);
    if (!s.seconds) return setLeft(null);
    setLeft(s.seconds);
    const t = setInterval(() => setLeft((l) => (l === null ? null : l - 1)), 1000);
    return () => clearInterval(t);
  }, [i, voice]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (left === 0) next();
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopSpeaking(), []);

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex gap-1.5" aria-hidden>
        {steps.map((_, k) => (
          <span key={k} className={`h-1.5 flex-1 rounded-full ${k <= i ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>
      <div key={i} className={`animate-rise rounded-3xl ${accent} p-8`} aria-live="polite">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Step {i + 1} of {steps.length}</p>
        <h2 className="mt-2 text-3xl">{s.title}</h2>
        <p className="mt-3 text-lg leading-relaxed text-foreground/80">{s.body}</p>
        {left !== null && <p className="mt-4 text-sm text-muted-foreground">{left}s</p>}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button disabled={i === 0} onClick={() => setI(i - 1)} className="text-sm text-muted-foreground disabled:opacity-40">
          ← Back
        </button>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={voice} onChange={(e) => { setVoice(e.target.checked); if (!e.target.checked) stopSpeaking(); }} className="accent-primary" />
          Read aloud
        </label>
        <div className="flex gap-2">
          <button onClick={next} className="rounded-full border border-border bg-card px-4 py-2 text-sm">Skip</button>
          <button onClick={next} className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">
            {i + 1 >= steps.length ? "Finish" : "Next"}
          </button>
        </div>
      </div>
      {!prefs.reduceMotion && null}
      <StopNote />
    </div>
  );
}
