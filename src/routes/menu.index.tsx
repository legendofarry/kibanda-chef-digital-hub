import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ItemTile } from "@/components/ItemTile";
import { useAppState } from "@/lib/store";
import type { MenuCategory } from "@/lib/data";

export const Route = createFileRoute("/menu/")({
  head: () => ({
    meta: [
      { title: "Menu — JFlavors" },
      { name: "description", content: "Browse bhajia, smokies, samosas, sides and drinks." },
      { property: "og:title", content: "Menu — JFlavors" },
      { property: "og:description", content: "The full kibanda menu, live availability, real prices." },
    ],
  }),
  component: MenuPage,
});

const CATS: { id: "all" | MenuCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bhajia", label: "Bhajia" },
  { id: "smokies", label: "Smokies" },
  { id: "samosas", label: "Samosas" },
  { id: "sides", label: "Sides" },
  { id: "drinks", label: "Drinks" },
];

function MenuPage() {
  const menu = useAppState((s) => s.menu);
  const [cat, setCat] = useState<(typeof CATS)[number]["id"]>("all");
  const filtered = cat === "all" ? menu : menu.filter((m) => m.category === cat);

  return (
    <AppShell>
      <header className="px-5 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">Menu</p>
        <h1 className="font-heading text-3xl font-extrabold">The full lineup</h1>
      </header>

      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-2 hide-scrollbar">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              cat === c.id
                ? "sizzle text-primary-foreground shadow-glow"
                : "border border-border bg-surface text-muted-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 px-5 pb-6">
        {filtered.map((item) => (
          <ItemTile key={item.id} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="px-5 pt-8 text-center text-muted-foreground">Nothing here yet.</div>
      )}
    </AppShell>
  );
}
