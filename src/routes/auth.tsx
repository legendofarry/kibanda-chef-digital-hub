import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { actions } from "@/lib/store";
import { AVATARS, OWNER_EMAIL } from "@/lib/data";
import { ArrowLeft, Fingerprint, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — MUNCH" },
      { name: "description", content: "Sign in to review, save favorites and earn loyalty points." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"choose" | "form" | "biometric">("choose");
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    avatar: AVATARS[0],
  });

  function google() {
    // Real Google Sign-In requires OAuth setup; keep this a stub that emulates the flow.
    // Owner-recognition still works: if the email matches OWNER_EMAIL, the dashboard unlocks.
    setForm({
      fullName: "Arrison Karimi",
      username: "chef_arrison",
      email: OWNER_EMAIL,
      avatar: "👨‍🍳",
    });
    setStep("form");
    toast.info("Continue with your details");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim() || !form.username.trim() || !form.email.trim()) {
      toast.error("Fill your name, username and email.");
      return;
    }
    actions.signIn({
      fullName: form.fullName.trim(),
      username: form.username.trim().toLowerCase().replace(/\s+/g, "_"),
      email: form.email.trim(),
      avatar: form.avatar,
    });
    setStep("biometric");
  }

  async function tryBiometric() {
    if (typeof window === "undefined" || !("credentials" in navigator)) {
      toast.info("Biometrics unavailable on this device");
      actions.updateUser({ biometricAsked: true });
      navigate({ to: "/" });
      return;
    }
    try {
      // WebAuthn discovery ping — will prompt biometrics if a platform authenticator exists.
      // We don't persist a credential in this prototype; we just confirm the prompt worked.
      const publicKey: PublicKeyCredentialCreationOptions = {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "MUNCH" },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: form.username,
          displayName: form.fullName,
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: { userVerification: "preferred" },
        timeout: 30000,
      };
      await navigator.credentials.create({ publicKey });
      actions.updateUser({ biometricEnabled: true, biometricAsked: true });
      toast.success("Biometric login enabled");
    } catch {
      actions.updateUser({ biometricAsked: true });
      toast.info("Skipped biometrics — we'll ask again later");
    } finally {
      navigate({ to: "/" });
    }
  }

  function skipBiometric() {
    actions.updateUser({ biometricAsked: true });
    navigate({ to: "/" });
  }

  return (
    <AppShell>
      <header className="flex items-center gap-3 px-5 pt-6">
        <button
          onClick={() => (step === "form" ? setStep("choose") : navigate({ to: "/" }))}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-surface"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="font-heading text-2xl font-extrabold">
          {step === "biometric" ? "Faster next time?" : "Welcome"}
        </h1>
      </header>

      {step === "choose" && (
        <div className="mt-8 space-y-4 px-5 animate-rise">
          <div className="rounded-3xl border border-border bg-surface p-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl sizzle shadow-glow">
              <Sparkles className="size-6 text-primary-foreground" />
            </div>
            <p className="mt-4 font-heading text-lg font-bold">Sign in to unlock</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Reviews, favorites, loyalty points and order history.
            </p>
          </div>

          <button
            onClick={google}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-white py-4 font-heading font-bold text-black shadow-lift"
          >
            <span className="text-lg">G</span> Continue with Google
          </button>
          <button
            onClick={() => setStep("form")}
            className="w-full rounded-full border border-border bg-surface py-4 text-sm font-semibold"
          >
            Continue with email
          </button>
          <button
            onClick={() => navigate({ to: "/" })}
            className="w-full rounded-full py-3 text-xs font-semibold text-muted-foreground"
          >
            Keep browsing as guest
          </button>
        </div>
      )}

      {step === "form" && (
        <form onSubmit={submit} className="mt-6 space-y-4 px-5 animate-rise">
          <div>
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Pick an avatar
            </span>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setForm({ ...form, avatar: a })}
                  className={`grid size-12 place-items-center rounded-2xl text-2xl transition-colors ${
                    form.avatar === a
                      ? "sizzle shadow-glow"
                      : "border border-border bg-surface"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Full name"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
          />
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Username"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-full sizzle py-4 font-heading font-bold text-primary-foreground shadow-glow"
          >
            Create account
          </button>
          <p className="text-center text-[11px] text-muted-foreground">
            We only use these locally — no server needed for this prototype.
          </p>
        </form>
      )}

      {step === "biometric" && (
        <div className="mt-8 flex flex-col items-center px-6 text-center animate-rise">
          <div className="flex size-24 items-center justify-center rounded-3xl sizzle shadow-glow">
            <Fingerprint className="size-12 text-primary-foreground" />
          </div>
          <p className="mt-6 font-heading text-2xl font-bold text-balance">
            Enable biometric login?
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Use your fingerprint or face to sign back in without typing.
          </p>
          <div className="mt-8 w-full space-y-2">
            <button
              onClick={tryBiometric}
              className="w-full rounded-full sizzle py-4 font-heading font-bold text-primary-foreground shadow-glow"
            >
              Enable biometrics
            </button>
            <button
              onClick={skipBiometric}
              className="w-full rounded-full py-3 text-sm font-semibold text-muted-foreground"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
