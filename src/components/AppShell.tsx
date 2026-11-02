import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, Puzzle, Images, Leaf, Settings, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "@/lib/app-data";
import { activityAtPath } from "@/lib/activity-feedback";
import { ActivityCheckIn } from "@/components/ActivityCheckIn";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/play", label: "Play", icon: Puzzle },
  { to: "/memories", label: "Memories", icon: Images },
  { to: "/calm", label: "Calm", icon: Leaf },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { session } = useAppData();
  const active = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg">
            <span aria-hidden className="inline-block h-6 w-6 rounded-full bg-butter shadow-[0_0_0_4px_var(--color-butter-soft)]" />
            A Little Happier
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  active(n.to) ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <Link to="/support" className="rounded-full p-2 text-muted-foreground hover:text-foreground" aria-label="Support resources">
              <LifeBuoy className="h-5 w-5" />
            </Link>
            <Link to="/settings" className="rounded-full p-2 text-muted-foreground hover:text-foreground" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </Link>
            {session ? (
              <Link to="/settings" className="ml-1 hidden rounded-full bg-sage-soft px-3 py-1.5 text-xs sm:inline-block">
                {session.user.email?.split("@")[0]}
              </Link>
            ) : (
              <Link to="/auth" className="ml-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-16">{children}</main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {nav.map((n) => (
            <li key={n.to}>
              <Link
                to={n.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px]",
                  active(n.to) ? "text-primary" : "text-muted-foreground",
                )}
              >
                <n.icon className="h-5 w-5" aria-hidden />
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle, back }: { title: string; subtitle?: string; back?: { to: string; label: string } }) {
  return (
    <div className="mb-6 animate-rise">
      {back && (
        <Link to={back.to} className="mb-3 inline-block text-sm text-muted-foreground hover:text-foreground">
          ← {back.label}
        </Link>
      )}
      <h1 className="text-3xl leading-tight md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-xl text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function Completion({ title, message, onAgain, againLabel = "Play again" }: { title: string; message: string; onAgain: () => void; againLabel?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const activity = activityAtPath(path);
  return (
    <div className="animate-rise mx-auto max-w-md rounded-3xl bg-butter-soft p-6 text-center sm:p-8">
      <div aria-hidden className="mx-auto mb-4 h-14 w-14 animate-float rounded-full bg-butter shadow-[0_0_0_10px_var(--color-butter-soft),0_0_0_18px_var(--color-peach-soft)]" />
      <h2 className="text-2xl">{title}</h2>
      <p className="mt-2 text-muted-foreground">{message}</p>
      {activity && <ActivityCheckIn key={activity.slug} slug={activity.slug} />}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={onAgain} className="h-auto rounded-full px-5 py-2.5">
          {againLabel}
        </Button>
        <Link to="/" className="rounded-full border border-border bg-card px-5 py-2.5 text-sm">
          Return home
        </Link>
      </div>
    </div>
  );
}

export function StopNote() {
  return (
    <p className="mt-6 text-center text-xs text-muted-foreground">
      If you feel dizzy, uncomfortable or more distressed, stop anytime and breathe normally.{" "}
      <Link to="/support" className="underline underline-offset-2">Need more support?</Link>
    </p>
  );
}
