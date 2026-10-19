import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { games } from "@/lib/catalog";
import { useAppData } from "@/lib/app-data";

export const Route = createFileRoute("/play/")({
  head: () => ({
    meta: [
      { title: "Play — A Little Happier" },
      { name: "description", content: "Small, gentle brain games with no timers, no lives and no pressure." },
      { property: "og:title", content: "Play — A Little Happier" },
      { property: "og:description", content: "Small games, small joys. Playable in under three minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Play,
});

function Play() {
  const { prefs, setPrefs } = useAppData();
  const toggleFav = (slug: string) =>
    setPrefs({
      favouriteGames: prefs.favouriteGames.includes(slug) ? prefs.favouriteGames.filter((s) => s !== slug) : [...prefs.favouriteGames, slug],
    });
  return (
    <>
      <PageHeader title="Small games, small joys" subtitle="No timers, no lives, no pressure. Leave whenever you like." />
      <div className="grid gap-4 sm:grid-cols-2">
        {games.map((g) => {
          const fav = prefs.favouriteGames.includes(g.slug);
          return (
            <div key={g.slug} className={`relative rounded-3xl ${g.tone} p-6`}>
              <Link to={g.to} className="block after:absolute after:inset-0">
                <span aria-hidden className="text-3xl">{g.icon}</span>
                <h2 className="mt-6 text-2xl">{g.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{g.blurb}</p>
              </Link>
              <button
                onClick={() => toggleFav(g.slug)}
                aria-pressed={fav}
                aria-label={fav ? `Remove ${g.title} from favourites` : `Add ${g.title} to favourites`}
                className="absolute right-4 top-4 z-10 rounded-full bg-card/70 p-2"
              >
                <Heart className={`h-4 w-4 ${fav ? "fill-current text-destructive" : "text-muted-foreground"}`} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
