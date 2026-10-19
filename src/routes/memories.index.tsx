import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Shuffle, Trash2, Archive, ArchiveRestore, FolderPlus } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { GuestBanner } from "@/components/GuestBanner";
import { MemoryPhoto } from "@/components/MemoryPhoto";
import { useAppData, resurfaceable } from "@/lib/app-data";
import { starterCollections } from "@/lib/catalog";
import type { Feeling, Memory } from "@/lib/types";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/memories/")({
  head: () => ({
    meta: [
      { title: "Memories — A Little Happier" },
      { name: "description", content: "Your private gallery of happy moments, collections and little memories for today." },
      { property: "og:title", content: "Memories — A Little Happier" },
      { property: "og:description", content: "A private, visual journal of the good things in your life." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Memories,
});

const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString(undefined, { dateStyle: "medium" });

function Memories() {
  const { memories, collections, prefs, setPrefs, addCollection, deleteCollection, ready } = useAppData();
  const [showArchived, setShowArchived] = useState(false);
  const [tag, setTag] = useState<string | null>(null);
  const [col, setCol] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Memory | null>(null);
  const [today, setToday] = useState<Memory | null>(null);
  const [newCol, setNewCol] = useState("");

  const pool = useMemo(() => resurfaceable(memories), [memories]);
  const paused = !!prefs.resurfacePausedUntil && new Date(prefs.resurfacePausedUntil) > new Date();
  const shuffle = () => setToday(pool.length ? pool[Math.floor(Math.random() * pool.length)] : null);
  useEffect(() => { if (!today || !pool.some((m) => m.id === today.id)) shuffle(); }, [pool]); // eslint-disable-line react-hooks/exhaustive-deps

  const onThisDay = useMemo(() => {
    const now = new Date();
    const md = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return pool.filter((m) => m.date.slice(5) === md && m.date.slice(0, 4) !== String(now.getFullYear()));
  }, [pool]);

  const tags = useMemo(() => Array.from(new Set(memories.flatMap((m) => m.tags))).sort(), [memories]);
  const years = useMemo(() => Array.from(new Set(memories.map((m) => m.date.slice(0, 4)))).sort().reverse(), [memories]);
  const shown = memories
    .filter((m) => (showArchived ? m.archived : !m.archived))
    .filter((m) => !tag || m.tags.includes(tag))
    .filter((m) => !col || m.collectionIds.includes(col))
    .filter((m) => !year || m.date.startsWith(year))
    .filter((m) => !q || `${m.caption} ${m.location} ${m.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  const createCol = async (name: string) => {
    try {
      await addCollection(name);
      setNewCol("");
      toast.success(`"${name}" created.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create that.");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Your happy memories" subtitle="Private to you. Nothing here is shared unless you choose to." />
        <div className="mb-6 flex gap-2">
          <Link to="/memories/rediscover" className="rounded-full border border-border bg-card px-4 py-2.5 text-sm">Remind me of a good day</Link>
          <Link to="/memories/new" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground">
            <Plus className="h-4 w-4" aria-hidden /> Save a moment
          </Link>
        </div>
      </div>
      <GuestBanner />

      {prefs.resurfacing !== "off" && !paused && today && (
        <section aria-labelledby="today" className="mb-8 grid overflow-hidden rounded-3xl bg-lavender-soft md:grid-cols-[minmax(0,320px)_1fr]">
          <button onClick={() => setOpen(today)} aria-label="Open this memory">
            <MemoryPhoto memory={today} className="aspect-[4/3] w-full md:aspect-auto md:h-full" />
          </button>
          <div className="p-6">
            <h2 id="today" className="text-xs uppercase tracking-wide text-muted-foreground">A little memory for today</h2>
            <p className="mt-2 font-display text-2xl">{today.caption || "A moment you saved"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{fmt(today.date)}{today.location ? ` · ${today.location}` : ""}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <button onClick={shuffle} className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5"><Shuffle className="h-3.5 w-3.5" aria-hidden /> Another</button>
              <button onClick={() => { const d = new Date(); d.setDate(d.getDate() + 1); setPrefs({ resurfacePausedUntil: d.toISOString() }); }} className="rounded-full bg-card px-3 py-1.5">Pause for today</button>
              <button onClick={() => setPrefs({ resurfacing: "off" })} className="rounded-full bg-card px-3 py-1.5">Turn off suggestions</button>
            </div>
          </div>
        </section>
      )}
      {(prefs.resurfacing === "off" || paused) && pool.length > 0 && (
        <p className="mb-6 text-sm text-muted-foreground">
          Memory suggestions are {paused ? "paused for today" : "off"}.{" "}
          <button className="underline underline-offset-2" onClick={() => setPrefs({ resurfacing: "sometimes", resurfacePausedUntil: null })}>Turn back on</button>
        </p>
      )}

      {onThisDay.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl">On this day</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {onThisDay.map((m) => (
              <button key={m.id} onClick={() => setOpen(m)} className="w-40 shrink-0 text-left">
                <MemoryPhoto memory={m} className="aspect-square w-full rounded-2xl" />
                <p className="mt-1 text-xs text-muted-foreground">{m.date.slice(0, 4)}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="cols" className="mb-8">
        <h2 id="cols" className="mb-3 text-xl">Happiness collections</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCol(null)} aria-pressed={!col} className={`rounded-full px-4 py-2 text-sm ${!col ? "bg-foreground text-background" : "border border-border bg-card"}`}>All</button>
          {collections.map((c) => (
            <span key={c.id} className="group inline-flex">
              <button onClick={() => setCol(col === c.id ? null : c.id)} aria-pressed={col === c.id}
                className={`rounded-l-full px-4 py-2 text-sm ${col === c.id ? "bg-foreground text-background" : "border border-r-0 border-border bg-card"}`}>
                {c.name} <span className="opacity-60">{memories.filter((m) => m.collectionIds.includes(c.id)).length}</span>
              </button>
              <button aria-label={`Delete collection ${c.name}`} onClick={() => { if (confirm(`Delete "${c.name}"? Memories stay safe.`)) deleteCollection(c.id); }}
                className={`rounded-r-full px-2 text-xs ${col === c.id ? "bg-foreground text-background" : "border border-border bg-card text-muted-foreground"}`}>×</button>
            </span>
          ))}
          <form onSubmit={(e) => { e.preventDefault(); if (newCol.trim()) createCol(newCol); }} className="inline-flex">
            <Input value={newCol} onChange={(e) => setNewCol(e.target.value)} placeholder="New collection" aria-label="New collection name" className="h-9 w-40 rounded-l-full rounded-r-none bg-card" />
            <button aria-label="Create collection" className="rounded-r-full bg-secondary px-3"><FolderPlus className="h-4 w-4" /></button>
          </form>
        </div>
        {collections.length === 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="text-muted-foreground">Ideas:</span>
            {starterCollections.map((s) => (
              <button key={s} onClick={() => createCol(s)} className="rounded-full border border-dashed border-border px-3 py-1">+ {s}</button>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="gallery">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 id="gallery" className="mr-auto text-xl">{showArchived ? "Archived" : "Timeline"}</h2>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search memories" className="h-9 w-36 rounded-full bg-card" />
          <select value={year ?? ""} onChange={(e) => setYear(e.target.value || null)} aria-label="Filter by year" className="h-9 rounded-full border border-input bg-card px-3 text-sm">
            <option value="">Any year</option>
            {years.map((y) => <option key={y}>{y}</option>)}
          </select>
          <select value={tag ?? ""} onChange={(e) => setTag(e.target.value || null)} aria-label="Filter by tag" className="h-9 rounded-full border border-input bg-card px-3 text-sm">
            <option value="">Any tag</option>
            {tags.map((t) => <option key={t}>{t}</option>)}
          </select>
          <button onClick={() => setShowArchived(!showArchived)} className="h-9 rounded-full border border-border bg-card px-3 text-sm">
            {showArchived ? "Back to timeline" : "Archived"}
          </button>
        </div>

        {!ready ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : memories.length === 0 ? (
          <div className="rounded-3xl bg-butter-soft p-10 text-center">
            <div aria-hidden className="mx-auto mb-4 h-12 w-12 animate-float rounded-full bg-butter" />
            <h3 className="text-2xl">Your collection starts with one small moment</h3>
            <p className="mx-auto mt-2 max-w-sm text-muted-foreground">A coffee you loved. A friend's laugh. A sky worth stopping for.</p>
            <Link to="/memories/new" className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Save your first memory</Link>
          </div>
        ) : shown.length === 0 ? (
          <p className="rounded-3xl bg-card p-8 text-center text-muted-foreground">Nothing here matches those filters.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((m) => (
              <li key={m.id}>
                <button onClick={() => setOpen(m)} className="group block w-full text-left">
                  <MemoryPhoto memory={m} className="aspect-square w-full rounded-2xl transition-transform group-hover:scale-[1.02]" />
                  <p className="mt-1.5 truncate text-sm">{m.caption || " "}</p>
                  <p className="text-xs text-muted-foreground">{fmt(m.date)}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12 rounded-3xl border border-dashed border-border p-6">
        <h2 className="text-lg">Google Photos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Not connected yet — this is coming in a later update. When it arrives, you'll choose individual photos yourself and approve each one before it's saved. For now, add photos from your device.
        </p>
        <button disabled className="mt-4 cursor-not-allowed rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">Connect Google Photos · coming later</button>
      </section>

      {open && <MemoryDialog memory={memories.find((m) => m.id === open.id) ?? open} onClose={() => setOpen(null)} />}
    </>
  );
}

function MemoryDialog({ memory, onClose }: { memory: Memory; onClose: () => void }) {
  const { updateMemory, deleteMemory, collections, addComfort } = useAppData();
  const [edit, setEdit] = useState(false);
  const [caption, setCaption] = useState(memory.caption);
  const [location, setLocation] = useState(memory.location);
  const [date, setDate] = useState(memory.date);
  const [tags, setTags] = useState(memory.tags.join(", "));
  const [confirmDel, setConfirmDel] = useState(false);

  const run = async (fn: () => Promise<void>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    }
  };
  const feelings: { id: Feeling; label: string }[] = [
    { id: "comforting", label: "Comforting" },
    { id: "neutral", label: "Neutral" },
    { id: "avoid", label: "Not one to revisit" },
  ];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl p-0">
        <MemoryPhoto memory={memory} className="max-h-[50vh] w-full rounded-t-3xl" />
        <div className="space-y-4 p-6">
          {edit ? (
            <div className="space-y-3">
              <DialogTitle className="sr-only">Edit memory</DialogTitle>
              <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} aria-label="Caption" maxLength={2000} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Place" aria-label="Place" />
              </div>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags, comma separated" aria-label="Tags" />
              <div className="flex gap-2">
                <button
                  onClick={() => run(async () => {
                    await updateMemory(memory.id, { caption, location, date, tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean) });
                    setEdit(false);
                  }, "Saved.")}
                  className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
                >Save</button>
                <button onClick={() => setEdit(false)} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <DialogTitle className="font-display text-2xl font-normal">{memory.caption || "A little moment"}</DialogTitle>
              <DialogDescription>{fmt(memory.date)}{memory.location ? ` · ${memory.location}` : ""}</DialogDescription>
              {memory.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">{memory.tags.map((t) => <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{t}</span>)}</div>
              )}
            </div>
          )}

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">How does this memory feel?</legend>
            <div className="flex flex-wrap gap-2">
              {feelings.map((f) => (
                <button key={f.id} aria-pressed={memory.feeling === f.id} onClick={() => run(() => updateMemory(memory.id, { feeling: f.id }), f.id === "avoid" ? "We won't suggest this one again." : "Noted.")}
                  className={`rounded-full px-3 py-1.5 text-sm ${memory.feeling === f.id ? "bg-primary text-primary-foreground" : "border border-border"}`}>{f.label}</button>
              ))}
            </div>
          </fieldset>

          {collections.length > 0 && (
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Collections</legend>
              <div className="flex flex-wrap gap-2">
                {collections.map((c) => {
                  const on = memory.collectionIds.includes(c.id);
                  return (
                    <button key={c.id} aria-pressed={on}
                      onClick={() => run(() => updateMemory(memory.id, { collectionIds: on ? memory.collectionIds.filter((x) => x !== c.id) : [...memory.collectionIds, c.id] }), on ? "Removed." : "Added.")}
                      className={`rounded-full px-3 py-1.5 text-sm ${on ? "bg-sage text-primary-foreground" : "border border-border"}`}>{c.name}</button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className="flex flex-wrap gap-2 border-t border-border pt-4 text-sm">
            {!edit && <button onClick={() => setEdit(true)} className="rounded-full border border-border px-3 py-1.5">Edit</button>}
            <button onClick={() => run(() => addComfort("memory", memory.id), "Added to your comfort kit.")} className="rounded-full border border-border px-3 py-1.5">+ Comfort kit</button>
            <button onClick={() => run(() => updateMemory(memory.id, { archived: !memory.archived }), memory.archived ? "Restored." : "Archived. It won't be suggested.")}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
              {memory.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />} {memory.archived ? "Unarchive" : "Archive"}
            </button>
            <button onClick={() => setConfirmDel(true)} className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
        <AlertDialog open={confirmDel} onOpenChange={setConfirmDel}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this memory forever?</AlertDialogTitle>
              <AlertDialogDescription>The photo and words will be permanently removed. If you'd rather just hide it, try Archive.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction onClick={() => run(async () => { await deleteMemory(memory.id); onClose(); }, "Deleted.")} className="bg-destructive text-destructive-foreground">
                Delete permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
