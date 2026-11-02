import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { activities, wasHelpful } from "@/lib/activity-feedback";
import { useAppData } from "@/lib/app-data";

export function HelpfulActivities({ kind }: { kind: "calm" | "play" }) {
  const { prefs } = useAppData();
  const helpful = activities.filter((a) => a.to.startsWith(`/${kind}/`) && wasHelpful(prefs.activityFeedback[a.slug]));
  if (!helpful.length) return null;
  return (
    <section aria-label="Activities that helped you" className="mb-6 border-b border-border pb-6">
      <h2 className="mb-3 flex items-center gap-2 text-xl"><Heart className="h-4 w-4 text-primary" aria-hidden />Helped you before</h2>
      <div className="flex flex-wrap gap-2">
        {helpful.map((a) => (
          <Link key={a.slug} to={a.to} className="rounded-lg border border-border bg-sage-soft px-4 py-3 text-sm">
            {a.title}<span className="ml-2 text-muted-foreground">{prefs.activityFeedback[a.slug]?.response === "a_little" ? "· a little" : "· helped"}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}