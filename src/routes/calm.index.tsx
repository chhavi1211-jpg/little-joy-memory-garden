import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { exercises, exerciseBySlug } from "@/lib/catalog";
import { useAppData } from "@/lib/app-data";

export const Route = createFileRoute("/calm/")({
  head: () => ({
    meta: [
      { title: "Calm Now — A Little Happier" },
      { name: "description", content: "Box breathing, slow breathing, five-senses grounding and short guided relaxation." },
      { property: "og:title", content: "Calm Now" },
      { property: "og:description", content: "Your personal toolkit for anxious or unsettled moments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Calm,
});

function Calm() {
  const { prefs } = useAppData();
  const fav = exerciseBySlug(prefs.preferredExercise);
  return (
    <>
      <PageHeader title="You can take this one moment at a time." subtitle="There's no need to solve everything right now. Choose whatever feels manageable." />
      <Link to={fav.to} className="mb-6 flex items-center justify-between rounded-3xl bg-primary p-6 text-primary-foreground">
        <span>
          <span className="block font-display text-2xl">Help me feel calmer</span>
          <span className="text-sm opacity-85">Opens your preferred exercise: {fav.title}</span>
        </span>
        <span aria-hidden className="text-3xl">→</span>
      </Link>
      <div className="grid gap-4 sm:grid-cols-2">
        {exercises.map((e) => (
          <Link key={e.slug} to={e.to} className={`rounded-3xl ${e.tone} p-6`}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{e.minutes}</p>
            <h2 className="mt-2 text-2xl">{e.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{e.blurb}</p>
          </Link>
        ))}
        <Link to="/comfort" className="rounded-3xl border border-dashed border-border p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Yours</p>
          <h2 className="mt-2 text-2xl">My Comfort Kit</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your favourite exercises, words and memories in one place.</p>
        </Link>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        These exercises are for general wellbeing, not diagnosis or treatment, and not every technique suits everyone.{" "}
        <Link to="/support" className="underline underline-offset-2">Find support resources</Link>
      </p>
    </>
  );
}
