import { useEffect, useRef, useState } from "react";
import { useAppData } from "@/lib/app-data";
import { chime } from "@/lib/sound";
import { StopNote } from "@/components/AppShell";

export interface Phase {
  label: string;
  seconds: number;
  scale: number; // target size 0..1
}

/** Runs a looping sequence of breathing phases with an animated shape. */
export function Breather({ phases, shape, cycles, onFinish }: { phases: Phase[]; shape: "square" | "circle"; cycles: number; onFinish: () => void }) {
  const { prefs } = useAppData();
  const [running, setRunning] = useState(false);
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(phases[0]?.seconds ?? 4);
  const [cycle, setCycle] = useState(0);
  const step = useRef(0);

  useEffect(() => {
    if (!running) return;
    const p = phases[i];
    if (prefs.sound) chime(p.scale > 0.6 ? 440 : 330);
    if (prefs.haptics) navigator.vibrate?.(30);
    setLeft(p.seconds);
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    const next = setTimeout(() => {
      step.current++;
      const ni = (i + 1) % phases.length;
      if (ni === 0) {
        if (cycle + 1 >= cycles) {
          setRunning(false);
          onFinish();
          return;
        }
        setCycle((c) => c + 1);
      }
      setI(ni);
    }, p.seconds * 1000);
    return () => {
      clearInterval(t);
      clearTimeout(next);
    };
  }, [running, i]); // eslint-disable-line react-hooks/exhaustive-deps

  const p = phases[i];
  const scale = running ? p.scale : 0.35;
  const size = 40 + scale * 60; // %

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex aspect-square w-full max-w-[320px] items-center justify-center">
        <div aria-hidden className={`absolute inset-0 bg-sage-soft ${shape === "circle" ? "rounded-full" : "rounded-[2.5rem]"}`} />
        <div
          aria-hidden
          className={`absolute bg-sage ${shape === "circle" ? "rounded-full" : "rounded-[1.75rem]"}`}
          style={{
            width: `${size}%`,
            height: `${size}%`,
            transition: `all ${running ? p.seconds : 0.6}s ease-in-out`,
            opacity: 0.85,
          }}
        />
        <div className="relative text-center" aria-live="polite">
          <p className="font-display text-2xl">{running ? p.label : "Ready when you are"}</p>
          {running && <p className="text-sm text-foreground/70">{left}</p>}
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {running ? `Round ${cycle + 1} of ${cycles}` : `${cycles} rounds · stop anytime`}
      </p>
      <div className="mt-4 flex gap-3">
        {!running ? (
          <button onClick={() => { setI(0); setCycle(0); setRunning(true); }} className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
            Begin
          </button>
        ) : (
          <button onClick={() => setRunning(false)} className="rounded-full border border-border bg-card px-6 py-3 text-sm">
            Stop
          </button>
        )}
      </div>
      <StopNote />
    </div>
  );
}
