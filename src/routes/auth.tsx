import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { PageHeader } from "@/components/AppShell";
import { useAppData } from "@/lib/app-data";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — A Little Happier" },
      { name: "description", content: "Create a free account to keep your memories private and synced across devices." },
      { property: "og:title", content: "Sign in — A Little Happier" },
      { property: "og:description", content: "Keep your happy memories safe across devices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const { session } = useAppData();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => { if (session) navigate({ to: "/memories" }); }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
    if (mode !== "forgot" && password.length < 8) return setError("Passwords need at least 8 characters.");
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      } else if (mode === "up") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        setNotice("Check your email to confirm your account, then come back and sign in.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setNotice("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const social = async (p: "google" | "lovable") => {
    setError(null);
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin });
    if (r.error) setError("Sign-in didn't complete. Please try again.");
  };

  return (
    <div className="mx-auto max-w-sm">
      <PageHeader
        title={mode === "up" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back"}
        subtitle="Your memories stay private to you. We never sell your data or use it for ads or AI training."
      />
      {mode !== "forgot" && (
        <div className="space-y-2">
          <button onClick={() => social("google")} className="w-full rounded-full border border-border bg-card py-3 text-sm font-medium">Continue with Google</button>
          <button type="button" className="lovable-auth-button w-full" onClick={() => social("lovable")}>Continue with Lovable</button>
          <p className="py-2 text-center text-xs text-muted-foreground">or with email</p>
        </div>
      )}
      <form onSubmit={submit} className="space-y-3">
        <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email" className="rounded-full bg-card" required />
        {mode !== "forgot" && (
          <Input type="password" autoComplete={mode === "up" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (8+ characters)" aria-label="Password" className="rounded-full bg-card" required />
        )}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {notice && <p role="status" className="rounded-2xl bg-sage-soft p-3 text-sm">{notice}</p>}
        <button disabled={busy} className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">
          {busy ? "One moment…" : mode === "up" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
        </button>
      </form>
      <div className="mt-4 flex justify-between text-sm text-muted-foreground">
        {mode === "in" ? (
          <>
            <button onClick={() => setMode("up")} className="underline underline-offset-2">Create an account</button>
            <button onClick={() => setMode("forgot")} className="underline underline-offset-2">Forgot password?</button>
          </>
        ) : (
          <button onClick={() => setMode("in")} className="underline underline-offset-2">Back to sign in</button>
        )}
      </div>
    </div>
  );
}
