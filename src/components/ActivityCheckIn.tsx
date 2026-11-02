import { useState } from "react";
import { Heart, Minus, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data";
import type { ActivityResponse } from "@/lib/types";

const choices = [
  { response: "helped", label: "Yes, it helped", icon: Smile },
  { response: "a_little", label: "A little", icon: Heart },
  { response: "not_this_time", label: "Not this time", icon: Minus },
] as const;

export function ActivityCheckIn({ slug }: { slug: string }) {
  const { saveActivityFeedback, isGuest } = useAppData();
  const [state, setState] = useState<"open" | "saved" | "skipped">("open");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (response: ActivityResponse) => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await saveActivityFeedback(slug, response);
      setState("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save your check-in. Try again or skip.");
    } finally {
      setSaving(false);
    }
  };

  if (state === "skipped") return null;
  if (state === "saved") return (
    <p role="status" className="mt-6 text-sm text-muted-foreground">Noted, gently. What helps can change from day to day.</p>
  );
  return (
    <section aria-label="Optional activity check-in" className="mt-6 border-t border-border pt-5">
      <h3 className="text-xl">Did this help a little?</h3>
      <p className="mt-2 text-sm text-muted-foreground">Only if you feel like answering. Kept privately {isGuest ? "on this device" : "in your account"}.</p>
      <div role="group" aria-label="How this activity felt" className="mt-4 flex flex-wrap justify-center gap-2">
        {choices.map(({ response, label, icon: Icon }) => (
          <Button key={response} variant="outline" disabled={saving} onClick={() => save(response)} className="h-auto min-h-10 whitespace-normal">
            <Icon aria-hidden />{label}
          </Button>
        ))}
      </div>
      {saving && <p role="status" className="mt-2 text-sm text-muted-foreground">Saving…</p>}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <Button variant="link" disabled={saving} onClick={() => setState("skipped")} className="mt-2 text-muted-foreground">Skip check-in</Button>
    </section>
  );
}