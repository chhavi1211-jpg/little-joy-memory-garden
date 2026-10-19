import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support resources — A Little Happier" },
      { name: "description", content: "Where to find more help. This app is not a crisis service or a replacement for professional care." },
      { property: "og:title", content: "Support resources" },
      { property: "og:description", content: "Finding more support when you need it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Support,
});

function Support() {
  return (
    <>
      <PageHeader title="When you need more support" subtitle="A Little Happier is for everyday wellbeing. It isn't a crisis service, diagnosis or treatment." />
      <div className="max-w-2xl space-y-4">
        <div className="rounded-3xl bg-peach-soft p-6">
          <h2 className="text-xl">If you're in immediate danger</h2>
          <p className="mt-2 text-foreground/80">Please contact your local emergency number (for example 911, 112, 999 or 000) or go to your nearest emergency department.</p>
        </div>
        <div className="rounded-3xl bg-card p-6">
          <h2 className="text-xl">Talk to someone</h2>
          <p className="mt-2 text-muted-foreground">Find a free, confidential helpline in your country — by phone, text or chat:</p>
          <a href="https://findahelpline.com" target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">
            Find a helpline ↗
          </a>
        </div>
        <div className="rounded-3xl bg-card p-6">
          <h2 className="text-xl">Ongoing support</h2>
          <p className="mt-2 text-muted-foreground">If anxiety or low mood is affecting your daily life, a doctor or licensed mental health professional can help you find the right support.</p>
        </div>
        <Link to="/calm" className="inline-block text-sm text-muted-foreground underline underline-offset-2">← Back to Calm</Link>
      </div>
    </>
  );
}
