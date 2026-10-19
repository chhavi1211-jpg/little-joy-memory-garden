import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { GuestBanner } from "@/components/GuestBanner";
import { useAppData } from "@/lib/app-data";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/memories/new")({
  head: () => ({
    meta: [
      { title: "Save a little moment — A Little Happier" },
      { name: "description", content: "Add a photo and a few words about a moment that made you happy." },
      { property: "og:title", content: "Save a little moment" },
      { property: "og:description", content: "Capture a happy moment in your private journal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewMemory,
});

function NewMemory() {
  const { addMemory, collections } = useAppData();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [tagText, setTagText] = useState("");
  const [cols, setCols] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const onFile = (f: File | undefined) => {
    setError(null);
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("That doesn't look like a photo. Try a JPG, PNG or HEIC.");
    if (f.size > 25 * 1024 * 1024) return setError("That photo is very large. Please choose one under 25 MB.");
    setFile(f);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file && !caption.trim()) return setError("Add a photo or a few words to save this moment.");
    if (caption.length > 2000) return setError("Let's keep it under 2000 characters.");
    setSaving(true);
    try {
      const tags = Array.from(new Set(tagText.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))).slice(0, 15);
      await addMemory({ file, caption, date, location, tags, collectionIds: cols });
      toast.success("Saved. A little moment, kept safe.");
      navigate({ to: "/memories" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Save a little moment" subtitle="A photo on its own is enough. Words are optional." back={{ to: "/memories", label: "Memories" }} />
      <GuestBanner />
      <form onSubmit={save} className="grid gap-6 md:grid-cols-2">
        <div>
          {preview ? (
            <div className="relative overflow-hidden rounded-3xl">
              <img src={preview} alt="Selected photo preview" className="aspect-square w-full object-cover" />
              <button type="button" onClick={() => setFile(null)} aria-label="Remove photo" className="absolute right-3 top-3 rounded-full bg-card/90 p-2">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-card text-muted-foreground transition-colors hover:bg-secondary focus-within:ring-2 focus-within:ring-ring">
              <ImagePlus className="h-8 w-8" aria-hidden />
              <span>Add a photo from your device</span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Photos are resized on your device and location data inside the photo is removed.</p>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="caption" className="mb-1.5 block text-sm font-medium">What made this moment special?</label>
            <Textarea id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} maxLength={2000} placeholder="The light, the laughter, the smell of coffee…" className="rounded-2xl bg-card" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="date" className="mb-1.5 block text-sm font-medium">Date</label>
              <Input id="date" type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} required className="rounded-2xl bg-card" />
            </div>
            <div>
              <label htmlFor="loc" className="mb-1.5 block text-sm font-medium">Place <span className="font-normal text-muted-foreground">(optional)</span></label>
              <Input id="loc" value={location} maxLength={120} onChange={(e) => setLocation(e.target.value)} placeholder="Grandma's garden" className="rounded-2xl bg-card" />
            </div>
          </div>
          <div>
            <label htmlFor="tags" className="mb-1.5 block text-sm font-medium">People, places, feelings <span className="font-normal text-muted-foreground">(comma separated)</span></label>
            <Input id="tags" value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="mum, beach, proud" className="rounded-2xl bg-card" />
          </div>
          {collections.length > 0 && (
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Add to collections</legend>
              <div className="flex flex-wrap gap-2">
                {collections.map((c) => {
                  const on = cols.includes(c.id);
                  return (
                    <button type="button" key={c.id} aria-pressed={on} onClick={() => setCols(on ? cols.filter((x) => x !== c.id) : [...cols, c.id])}
                      className={`rounded-full px-3 py-1.5 text-sm ${on ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}>
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}
          {error && <p role="alert" className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <button disabled={saving} className="w-full rounded-full bg-primary py-3 font-medium text-primary-foreground disabled:opacity-60">
            {saving ? "Saving…" : "Save this moment"}
          </button>
        </div>
      </form>
    </>
  );
}
