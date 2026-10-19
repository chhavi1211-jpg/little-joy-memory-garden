import { toast } from "sonner";
import { Star } from "lucide-react";
import { useAppData } from "@/lib/app-data";

/** Lets users mark an exercise as preferred (for "Help me feel calmer") and add it to the comfort kit. */
export function SaveToKit({ slug, title }: { slug: string; title: string }) {
  const { prefs, setPrefs, comfort, addComfort } = useAppData();
  const preferred = prefs.preferredExercise === slug;
  const inKit = comfort.some((c) => c.kind === "exercise" && c.value === slug);
  return (
    <div className="mb-6 flex flex-wrap gap-2 text-sm">
      <button
        onClick={() => { setPrefs({ preferredExercise: slug }); toast.success(`${title} will open when you tap "Help me feel calmer".`); }}
        aria-pressed={preferred}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${preferred ? "bg-butter" : "border border-border bg-card"}`}
      >
        <Star className="h-3.5 w-3.5" aria-hidden /> {preferred ? "My go-to exercise" : "Make this my go-to"}
      </button>
      {!inKit && (
        <button onClick={() => addComfort("exercise", slug).then(() => toast.success("Added to your comfort kit."))} className="rounded-full border border-border bg-card px-3 py-1.5">
          + Comfort kit
        </button>
      )}
    </div>
  );
}
