import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { MemoryPhoto } from "@/components/MemoryPhoto";
import { useAppData } from "@/lib/app-data";
import { exerciseBySlug, exercises } from "@/lib/catalog";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/comfort")({
  head: () => ({
    meta: [
      { title: "My Comfort Kit — A Little Happier" },
      { name: "description", content: "Your favourite calming exercises, comforting words, memories and grounding reminders." },
      { property: "og:title", content: "My Comfort Kit" },
      { property: "og:description", content: "Everything that helps you, in one gentle place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Comfort,
});

function Comfort() {
  const { comfort, addComfort, removeComfort, memories, prefs, setPrefs } = useAppData();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [rem, setRem] = useState("");
  const fav = exerciseBySlug(prefs.preferredExercise);
  const byKind = (k: string) => comfort.filter((c) => c.kind === k);
  const add = async (kind: "message" | "reminder", v: string, clear: () => void) => {
    try { await addComfort(kind, v); clear(); } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't add."); }
  };

  return (
    <>
      <PageHeader title="My Comfort Kit" subtitle="Gather what helps you. It'll be here when you need it." back={{ to: "/calm", label: "Calm" }} />
      <button onClick={() => navigate({ to: fav.to })} className="mb-8 w-full rounded-3xl bg-primary p-6 text-left text-primary-foreground">
        <span className="block font-display text-2xl">Help me feel calmer</span>
        <span className="text-sm opacity-85">Opens {fav.title}</span>
      </button>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl bg-sage-soft p-6">
          <h2 className="text-xl">My go-to exercise</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {exercises.map((e) => (
              <button key={e.slug} aria-pressed={prefs.preferredExercise === e.slug} onClick={() => setPrefs({ preferredExercise: e.slug })}
                className={`rounded-full px-3 py-1.5 text-sm ${prefs.preferredExercise === e.slug ? "bg-primary text-primary-foreground" : "bg-card"}`}>{e.title}</button>
            ))}
          </div>
          {byKind("exercise").length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-medium">Saved exercises</h3>
              <ul className="mt-2 space-y-2">
                {byKind("exercise").map((c) => {
                  const e = exerciseBySlug(c.value);
                  return (
                    <li key={c.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-2.5">
                      <Link to={e.to} className="text-sm">{e.title}</Link>
                      <Remove onClick={() => removeComfort(c.id)} label={e.title} />
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        <section className="rounded-3xl bg-peach-soft p-6">
          <h2 className="text-xl">Comforting words</h2>
          <p className="text-sm text-muted-foreground">Things you'd like to hear when it's hard.</p>
          <ul className="mt-3 space-y-2">
            {byKind("message").map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-2 rounded-2xl bg-card px-4 py-3 font-display">
                "{c.value}" <Remove onClick={() => removeComfort(c.id)} label="message" />
              </li>
            ))}
          </ul>
          <form onSubmit={(e) => { e.preventDefault(); add("message", msg, () => setMsg("")); }} className="mt-3 flex gap-2">
            <Input value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={280} placeholder="This feeling will pass." aria-label="New comforting message" className="rounded-full bg-card" />
            <button className="rounded-full bg-primary px-4 text-sm text-primary-foreground">Add</button>
          </form>
        </section>

        <section className="rounded-3xl bg-butter-soft p-6">
          <h2 className="text-xl">Grounding reminders</h2>
          <p className="text-sm text-muted-foreground">Little things that bring you back — "Make tea", "Step outside".</p>
          <ul className="mt-3 space-y-2">
            {byKind("reminder").map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-2.5 text-sm">
                {c.value} <Remove onClick={() => removeComfort(c.id)} label="reminder" />
              </li>
            ))}
          </ul>
          <form onSubmit={(e) => { e.preventDefault(); add("reminder", rem, () => setRem("")); }} className="mt-3 flex gap-2">
            <Input value={rem} onChange={(e) => setRem(e.target.value)} maxLength={280} placeholder="Hold something warm" aria-label="New grounding reminder" className="rounded-full bg-card" />
            <button className="rounded-full bg-primary px-4 text-sm text-primary-foreground">Add</button>
          </form>
        </section>

        <section className="rounded-3xl bg-lavender-soft p-6">
          <h2 className="text-xl">Comforting memories</h2>
          {byKind("memory").length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Open any memory and tap "+ Comfort kit" to keep it here. <Link to="/memories" className="underline">Go to memories</Link></p>
          ) : (
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {byKind("memory").map((c) => {
                const m = memories.find((x) => x.id === c.value);
                if (!m) return null;
                return (
                  <li key={c.id} className="relative">
                    <MemoryPhoto memory={m} className="aspect-square w-full rounded-2xl" />
                    <span className="absolute right-1 top-1 rounded-full bg-card/90"><Remove onClick={() => removeComfort(c.id)} label="memory" /></span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Remove({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-label={`Remove ${label}`} className="shrink-0 p-1 text-muted-foreground hover:text-foreground">
      <X className="h-4 w-4" />
    </button>
  );
}
