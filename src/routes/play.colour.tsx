import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Completion, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/play/colour")({
  head: () => ({
    meta: [
      { title: "Colour and Create — A Little Happier" },
      { name: "description", content: "Fill a soft flower with colours you love. Download it if you like." },
      { property: "og:title", content: "Colour and Create" },
      { property: "og:description", content: "A small, calm colouring space." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Colour,
});

const palette = ["#b9cfb4", "#c8b8de", "#f2c7a5", "#f6e3a1", "#e9a6a6", "#9fc3d6", "#f7f1e5", "#7f9c7a"];
const petals = 8;

function Colour() {
  const [colour, setColour] = useState(palette[0]);
  const [fills, setFills] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const fill = (id: string) => setFills((f) => ({ ...f, [id]: colour }));
  const f = (id: string, d = "#fffdf7") => fills[id] ?? d;

  const download = () => {
    const svg = document.getElementById("colour-art");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my-little-flower.svg";
    a.click();
  };

  if (done) return (
    <>
      <PageHeader title="Colour and Create" back={{ to: "/play", label: "Games" }} />
      <Completion title="Something lovely, made by you." message="There's no right way to colour. This one is yours." againLabel="Colour another" onAgain={() => { setFills({}); setDone(false); }} />
    </>
  );

  return (
    <>
      <PageHeader title="Colour and Create" subtitle="Pick a colour, then tap any shape to fill it." back={{ to: "/play", label: "Games" }} />
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Colours">
        {palette.map((p) => (
          <button key={p} role="radio" aria-checked={colour === p} aria-label={`Colour ${p}`} onClick={() => setColour(p)}
            className={`h-10 w-10 rounded-full border-2 ${colour === p ? "scale-110 border-foreground" : "border-border"}`} style={{ background: p }} />
        ))}
      </div>
      <svg id="colour-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="mx-auto w-full max-w-md rounded-3xl bg-card" stroke="#6b6157" strokeWidth="1.2">
        <rect x="0" y="0" width="200" height="200" fill={f("bg", "#fbf6ec")} onClick={() => fill("bg")} stroke="none" />
        <path d="M0 160 Q50 140 100 160 T200 160 V200 H0Z" fill={f("hill", "#f3eee2")} onClick={() => fill("hill")} />
        <path d="M100 150 Q96 175 100 198" fill="none" />
        <path d="M100 178 Q80 168 74 180 Q88 186 100 178Z" fill={f("leaf1")} onClick={() => fill("leaf1")} />
        <path d="M100 172 Q120 160 128 172 Q112 180 100 172Z" fill={f("leaf2")} onClick={() => fill("leaf2")} />
        {Array.from({ length: petals }).map((_, i) => (
          <ellipse key={`o${i}`} cx="100" cy="62" rx="16" ry="30" transform={`rotate(${(360 / petals) * i} 100 92)`} fill={f(`o${i}`)} onClick={() => fill(`o${i}`)} />
        ))}
        {Array.from({ length: petals }).map((_, i) => (
          <ellipse key={`p${i}`} cx="100" cy="74" rx="9" ry="17" transform={`rotate(${(360 / petals) * i + 22.5} 100 92)`} fill={f(`p${i}`)} onClick={() => fill(`p${i}`)} />
        ))}
        <circle cx="100" cy="92" r="13" fill={f("centre")} onClick={() => fill("centre")} />
        <circle cx="160" cy="34" r="14" fill={f("sun")} onClick={() => fill("sun")} />
      </svg>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={() => setFills({})} className="rounded-full border border-border bg-card px-4 py-2 text-sm">Start fresh</button>
        <button onClick={download} className="rounded-full border border-border bg-card px-4 py-2 text-sm">Download</button>
        <button onClick={() => setDone(true)} className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">I'm finished</button>
      </div>
    </>
  );
}
