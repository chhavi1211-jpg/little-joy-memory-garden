import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — A Little Happier" },
      { name: "description", content: "Choose a new password for your account." },
      { property: "og:title", content: "Set a new password" },
      { property: "og:description", content: "Reset your A Little Happier password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setOk(true);
    const { data } = supabase.auth.onAuthStateChange((e) => e === "PASSWORD_RECOVERY" && setOk(true));
    return () => data.subscription.unsubscribe();
  }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setErr("Passwords need at least 8 characters.");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return setErr(error.message);
    toast.success("Password updated.");
    navigate({ to: "/" });
  };
  return (
    <div className="mx-auto max-w-sm">
      <PageHeader title="Set a new password" />
      {!ok ? (
        <p className="text-muted-foreground">Open this page from the link in your reset email.</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <Input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" aria-label="New password" className="rounded-full bg-card" />
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <button className="w-full rounded-full bg-primary py-3 text-sm text-primary-foreground">Save password</button>
        </form>
      )}
    </div>
  );
}
