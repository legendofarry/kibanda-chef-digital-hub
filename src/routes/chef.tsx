import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CHEF } from "@/lib/data";
import { Award, Mail, Phone, Sparkles, Utensils } from "lucide-react";

export const Route = createFileRoute("/chef")({
  head: () => ({
    meta: [
      { title: "Chef John — MUNCH" },
      { name: "description", content: "The chef behind MUNCH: bio, journey, philosophy and services." },
      { property: "og:title", content: "Chef John — MUNCH" },
      { property: "og:description", content: "Restaurant-trained street food from Chef John Karimi." },
    ],
  }),
  component: ChefPage,
});

function ChefPage() {
  return (
    <AppShell>
      <div className="relative">
        <div className="h-56 bg-gradient-to-br from-ember/30 via-surface to-saffron/20" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex size-32 items-center justify-center rounded-full sizzle text-6xl shadow-glow">
            👨‍🍳
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-8">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">The chef</p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold">{CHEF.name}</h1>
          <p className="mt-1 text-sm italic text-muted-foreground">"{CHEF.tagline}"</p>
        </div>

        <section className="rounded-3xl border border-border bg-surface p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bio</p>
          <p className="mt-2 text-sm leading-relaxed">{CHEF.bio}</p>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-bold">Journey</h2>
          <ol className="space-y-3">
            {CHEF.journey.map((j) => (
              <li key={j.year} className="flex gap-4">
                <span className="w-12 shrink-0 font-heading font-bold text-ember">{j.year}</span>
                <span className="text-sm">{j.event}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl sizzle p-5 text-primary-foreground shadow-glow">
          <Sparkles className="size-5" />
          <p className="mt-3 font-heading text-lg font-bold text-balance">
            "{CHEF.philosophy}"
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-bold">Certifications</h2>
          <ul className="space-y-2">
            {CHEF.certifications.map((c) => (
              <li
                key={c}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-sm"
              >
                <Award className="size-4 text-saffron" />
                {c}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-bold">Services</h2>
          <div className="grid grid-cols-2 gap-2">
            {CHEF.services.map((s) => (
              <div
                key={s}
                className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-3 text-xs font-semibold"
              >
                <Utensils className="size-4 text-ember" />
                {s}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2 rounded-3xl border border-border bg-surface p-5">
          <h2 className="mb-2 font-heading text-lg font-bold">Contact</h2>
          <a
            href={`tel:${CHEF.contact.phone}`}
            className="flex items-center gap-3 rounded-xl bg-background p-3 text-sm"
          >
            <Phone className="size-4 text-ember" /> {CHEF.contact.phone}
          </a>
          <a
            href={`mailto:${CHEF.contact.email}`}
            className="flex items-center gap-3 rounded-xl bg-background p-3 text-sm"
          >
            <Mail className="size-4 text-ember" /> {CHEF.contact.email}
          </a>
        </section>

        <Link
          to="/catering"
          className="block w-full rounded-full sizzle py-4 text-center font-heading font-bold text-primary-foreground shadow-glow"
        >
          Book Chef John
        </Link>
      </div>
    </AppShell>
  );
}
