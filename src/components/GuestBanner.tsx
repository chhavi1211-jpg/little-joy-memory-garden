import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAppData } from "@/lib/app-data";

export function GuestBanner() {
  const { isGuest, deviceMemoryCount, moveDeviceDataToAccount } = useAppData();
  const [busy, setBusy] = useState(false);
  if (isGuest) {
    return (
      <div className="mb-6 rounded-3xl bg-lavender-soft p-4 text-sm">
        You're using the app as a guest — memories stay only on this device.{" "}
        <Link to="/auth" className="font-medium underline underline-offset-2">Create a free account</Link> to keep them safe and private across devices.
      </div>
    );
  }
  if (deviceMemoryCount > 0) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-butter-soft p-4 text-sm">
        <span>You have {deviceMemoryCount} memories saved on this device from before you signed in.</span>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const n = await moveDeviceDataToAccount();
              toast.success(`Moved ${n} memories into your private account.`);
            } catch {
              toast.error("Something went wrong moving your memories. They're still on this device.");
            } finally {
              setBusy(false);
            }
          }}
          className="rounded-full bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Moving…" : "Move them to my account"}
        </button>
      </div>
    );
  }
  return null;
}
