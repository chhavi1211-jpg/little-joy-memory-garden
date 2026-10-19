import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { useAppData } from "@/lib/app-data";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & privacy — A Little Happier" },
      { name: "description", content: "Personalise themes, sound, memory suggestions and reminders. Export or delete your data." },
      { property: "og:title", content: "Settings & privacy" },
      { property: "og:description", content: "You're in control of your data and experience." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Settings() {
  const { prefs, setPrefs, session, signOut, exportData, deleteAllData, isGuest } = useAppData();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const r = prefs.reminders;

  const toggleReminders = async (on: boolean) => {
    if (on && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission().catch(() => undefined);
    }
    setPrefs({ reminders: { ...r, enabled: on } });
  };

  return (
    <>
      <PageHeader title="Settings & privacy" subtitle="Make it yours — gently." />
      <div className="grid max-w-3xl gap-6">
        <section className="rounded-3xl bg-card p-6">
          <h2 className="mb-2 text-xl">Account</h2>
          {session ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">Signed in as <strong>{session.user.email}</strong>. Your memories are private to this account.</p>
              <button onClick={async () => { await signOut(); navigate({ to: "/", replace: true }); }} className="rounded-full border border-border px-4 py-2 text-sm">Sign out</button>
            </div>
          ) : (
            <p className="text-sm">You're a guest — everything is saved on this device only. <Link to="/auth" className="underline">Create an account</Link> to keep it safe across devices.</p>
          )}
        </section>

        <section className="divide-y divide-border rounded-3xl bg-card p-6">
          <h2 className="pb-2 text-xl">Look & feel</h2>
          <Row label="Evening theme" hint="A softer, darker palette.">
            <Switch checked={prefs.theme === "dark"} onCheckedChange={(v) => setPrefs({ theme: v ? "dark" : "light" })} aria-label="Evening theme" />
          </Row>
          <Row label="Reduce motion" hint="Calmer transitions and fewer animations.">
            <Switch checked={prefs.reduceMotion} onCheckedChange={(v) => setPrefs({ reduceMotion: v })} aria-label="Reduce motion" />
          </Row>
          <Row label="Soft sounds" hint="Gentle chimes during breathing.">
            <Switch checked={prefs.sound} onCheckedChange={(v) => setPrefs({ sound: v })} aria-label="Soft sounds" />
          </Row>
          <Row label="Gentle vibrations" hint="On devices that support it.">
            <Switch checked={prefs.haptics} onCheckedChange={(v) => setPrefs({ haptics: v })} aria-label="Vibrations" />
          </Row>
          <Row label="Ask how I'm feeling" hint="Used only to suggest activities, never stored.">
            <Switch checked={prefs.moodSuggestions} onCheckedChange={(v) => setPrefs({ moodSuggestions: v })} aria-label="Mood suggestions" />
          </Row>
          <Row label="Memory suggestions" hint="How often to surface a saved memory.">
            <select value={prefs.resurfacing} onChange={(e) => setPrefs({ resurfacing: e.target.value as typeof prefs.resurfacing, resurfacePausedUntil: null })} aria-label="Memory suggestion frequency" className="h-9 rounded-full border border-input bg-background px-3 text-sm">
              <option value="off">Off</option>
              <option value="sometimes">Sometimes</option>
              <option value="often">Often</option>
            </select>
          </Row>
        </section>

        <section className="divide-y divide-border rounded-3xl bg-card p-6">
          <h2 className="pb-2 text-xl">Reminders</h2>
          <Row label="Gentle ritual reminder" hint="Shown while the app is open in your browser. Never about streaks.">
            <Switch checked={r.enabled} onCheckedChange={toggleReminders} aria-label="Ritual reminders" />
          </Row>
          {r.enabled && (
            <>
              <Row label="Time">
                <input type="time" value={r.time} onChange={(e) => setPrefs({ reminders: { ...r, time: e.target.value } })} aria-label="Reminder time" className="h-9 rounded-full border border-input bg-background px-3 text-sm" />
              </Row>
              <Row label="How often">
                <select value={r.frequency} onChange={(e) => setPrefs({ reminders: { ...r, frequency: e.target.value as typeof r.frequency } })} aria-label="Reminder frequency" className="h-9 rounded-full border border-input bg-background px-3 text-sm">
                  <option value="daily">Every day</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekly">Once a week (Sunday)</option>
                </select>
              </Row>
            </>
          )}
        </section>

        <section className="rounded-3xl bg-card p-6">
          <h2 className="text-xl">Connected services</h2>
          <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-dashed border-border p-4">
            <div>
              <p className="text-sm font-medium">Google Photos</p>
              <p className="text-xs text-muted-foreground">Not connected · coming in a later update</p>
            </div>
            <button disabled className="cursor-not-allowed rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">Unavailable</button>
          </div>
        </section>

        <section className="rounded-3xl bg-card p-6">
          <h2 className="text-xl">Your data & privacy</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Memories, photos and reflections are private by default {isGuest ? "and stay on this device" : "— only your account can access them"}.</li>
            <li>We don't sell your data, show ads, or use your memories to train AI.</li>
            <li>Your journal isn't analysed by AI. The app doesn't use analytics tracking.</li>
            <li>Data is encrypted in transit and stored securely; it is not end-to-end encrypted.</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => exportData().then(() => toast.success("Your export is downloading."))} className="rounded-full border border-border px-4 py-2 text-sm">Export my data</button>
            <AlertDialog>
              <AlertDialogTrigger className="rounded-full px-4 py-2 text-sm text-destructive">Delete all my data</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete everything?</AlertDialogTitle>
                  <AlertDialogDescription>All memories, photos, collections, comfort kit items, reflections and preferences will be permanently deleted. This can't be undone. You may want to export first.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my data</AlertDialogCancel>
                  <AlertDialogAction disabled={busy} className="bg-destructive text-destructive-foreground"
                    onClick={async () => { setBusy(true); try { await deleteAllData(); toast.success("All your data has been deleted."); } finally { setBusy(false); } }}>
                    Delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>
    </>
  );
}
