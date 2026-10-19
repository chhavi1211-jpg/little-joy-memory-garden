import { useEffect } from "react";
import { toast } from "sonner";
import { useAppData } from "@/lib/app-data";

/**
 * Gentle, optional reminders. Works while the app is open: at the chosen time it shows
 * a soft note (and a browser notification if the user allowed it). No streaks, no guilt.
 */
export function ReminderWatcher() {
  const { prefs } = useAppData();
  useEffect(() => {
    if (!prefs.reminders.enabled) return;
    const check = () => {
      const now = new Date();
      const day = now.getDay();
      const { time, frequency } = prefs.reminders;
      if (frequency === "weekdays" && (day === 0 || day === 6)) return;
      if (frequency === "weekly" && day !== 0) return;
      const [h, m] = time.split(":").map(Number);
      const due = new Date(now);
      due.setHours(h, m, 0, 0);
      const key = `alh:reminded:${now.toDateString()}`;
      if (now < due || localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
      const msg = "If you'd like, there's a little two-minute ritual waiting for you.";
      toast(msg, { action: { label: "Open", onClick: () => (window.location.href = "/ritual") } });
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("A Little Happier", { body: msg });
      }
    };
    check();
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
  }, [prefs.reminders]);
  return null;
}
