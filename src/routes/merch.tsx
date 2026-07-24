import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MERCH_TEASERS } from "@/lib/data";
import { Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/merch")({
  head: () => ({
    meta: [
      { title: "Merch — JFlavors" },
      { name: "description", content: "Sauces, aprons, tees and more — coming soon from JFlavors." },
    ],
  }),
  component: Merch,
});

function Merch() {
  return (
    <AppShell>
      <header className="px-5 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">Merch</p>
        <h1 className="font-heading text-3xl font-extrabold">Coming soon</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          House sauces, aprons, tees and more. Tap Notify me and we'll ping you at drop.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 px-5 pb-6">
        {MERCH_TEASERS.map((m) => (
          <div key={m.id} className="rounded-3xl border border-border bg-surface p-3">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={m.image}
                alt={m.name}
                loading="lazy"
                width={768}
                height={768}
                className="aspect-square w-full object-cover"
              />
            </div>
            <p className="mt-3 text-sm font-bold">{m.name}</p>
            <p className="text-xs text-muted-foreground">KES {m.price}</p>
            <button
              onClick={() => toast.success("We'll notify you at drop 🔔")}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-full border border-border py-2 text-xs font-semibold"
            >
              <Bell className="size-3" /> Notify me
            </button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
