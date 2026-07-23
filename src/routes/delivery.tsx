import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { actions } from "@/lib/store";
import { ArrowLeft, Bike, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Become a rider — JFlavors" },
      { name: "description", content: "Join the JFlavors delivery team. Coming soon." },
    ],
  }),
  component: Delivery,
});

function Delivery() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", phone: "", vehicle: "Motorbike" });
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName || !form.phone) {
      toast.error("Fill name and phone");
      return;
    }
    actions.addDeliverySignup(form);
    setDone(true);
    toast.success("You're on the waitlist 🏍️");
  }

  return (
    <AppShell>
      <header className="flex items-center gap-3 px-5 pt-6">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-surface"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">Delivery</p>
          <h1 className="font-heading text-2xl font-extrabold">Ride with JFlavors</h1>
        </div>
      </header>

      <section className="mt-4 px-5">
        <div className="relative overflow-hidden rounded-3xl sizzle p-6 text-primary-foreground shadow-glow">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <Clock className="size-3" /> Coming soon
          </div>
          <h2 className="mt-2 font-heading text-2xl font-extrabold text-balance">
            Deliver hot food. Set your own hours.
          </h2>
          <p className="mt-2 text-sm opacity-90">
            We're building a delivery program for JFlavors riders. Sign up to get early access.
          </p>
        </div>
      </section>

      {!done ? (
        <form onSubmit={submit} className="mt-6 space-y-3 px-5 pb-8">
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Full name"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
          />
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
          />
          <select
            value={form.vehicle}
            onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
          >
            {["Motorbike", "Bicycle", "Car", "On foot"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full rounded-full sizzle py-4 font-heading font-bold text-primary-foreground shadow-glow"
          >
            <Bike className="mr-2 inline size-4" /> Join the waitlist
          </button>
        </form>
      ) : (
        <div className="mt-8 flex flex-col items-center px-6 text-center animate-rise">
          <CheckCircle2 className="size-16 text-success" />
          <p className="mt-4 font-heading text-xl font-bold">You're on the list</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We'll reach out when the rider program opens.
          </p>
        </div>
      )}
    </AppShell>
  );
}
