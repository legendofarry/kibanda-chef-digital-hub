import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppState, actions } from "@/lib/store";
import { CalendarCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/catering")({
  head: () => ({
    meta: [
      { title: "Catering & private chef — MUNCH" },
      { name: "description", content: "Book Chef John for events, weddings, corporate lunches and private dinners." },
      { property: "og:title", content: "Catering — MUNCH" },
      { property: "og:description", content: "Bring the kibanda to your next event." },
    ],
  }),
  component: Catering,
});

function Catering() {
  const user = useAppState((s) => s.user);
  const [form, setForm] = useState({
    contactName: user?.fullName ?? "",
    contactPhone: "",
    eventType: "Private dinner",
    guests: "20",
    budget: "10000",
    date: "",
    location: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.contactName || !form.contactPhone || !form.date || !form.location) {
      toast.error("Please fill your name, phone, date and location.");
      return;
    }
    actions.addCatering({
      userId: user?.id ?? null,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      eventType: form.eventType,
      guests: parseInt(form.guests) || 0,
      budget: parseInt(form.budget) || 0,
      date: form.date,
      location: form.location,
      notes: form.notes,
    });
    setSubmitted(true);
    toast.success("Request sent — the chef will call you.");
  }

  if (submitted) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center animate-rise">
          <div className="flex size-24 items-center justify-center rounded-3xl sizzle shadow-glow">
            <CalendarCheck className="size-12 text-primary-foreground" />
          </div>
          <h1 className="mt-6 font-heading text-3xl font-extrabold">Request sent</h1>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Chef John usually responds within a few hours. We'll call the number you gave.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ ...form, notes: "" });
            }}
            className="mt-6 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold"
          >
            Send another
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="px-5 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">Catering</p>
        <h1 className="font-heading text-3xl font-extrabold">Bring us to your event</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Private chef, corporate lunches, weddings and more. Tell us the shape and we'll come back with a plan.
        </p>
      </header>

      <form onSubmit={submit} className="mt-6 space-y-4 px-5 pb-8">
        <Field label="Your name">
          <input
            value={form.contactName}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Phone">
          <input
            value={form.contactPhone}
            onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            className="input"
            placeholder="+254..."
          />
        </Field>
        <Field label="Event type">
          <select
            value={form.eventType}
            onChange={(e) => setForm({ ...form, eventType: e.target.value })}
            className="input"
          >
            {["Private dinner", "Wedding", "Corporate lunch", "Birthday", "Cocktail event", "Other"].map(
              (t) => (
                <option key={t}>{t}</option>
              ),
            )}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Guests">
            <input
              type="number"
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Budget (KES)">
            <input
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="input"
            />
          </Field>
        </div>
        <Field label="Date">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Location">
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input"
            placeholder="Suburb, venue"
          />
        </Field>
        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="input"
            rows={3}
            placeholder="Menu ideas, dietary needs..."
          />
        </Field>
        <button
          type="submit"
          className="w-full rounded-full sizzle py-4 font-heading font-bold text-primary-foreground shadow-glow"
        >
          Send request
        </button>
      </form>

      <style>{`
        .input { width: 100%; border-radius: 0.75rem; background: var(--surface); border: 1px solid var(--border); padding: 0.75rem 1rem; font-size: 0.875rem; }
        .input:focus { outline: none; box-shadow: 0 0 0 2px var(--ember); }
      `}</style>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
