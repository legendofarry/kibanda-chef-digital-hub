import { Link } from "@tanstack/react-router";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { actions } from "@/lib/store";
import { toast } from "sonner";
import type { MenuItem } from "@/lib/data";

export function ItemTile({ item }: { item: MenuItem }) {
  const [added, setAdded] = useState(false);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (item.soldOut) return;
    actions.addToCart(item.id, 1, {
      spiceLevel: "medium",
      addOns: [],
    });
    setAdded(true);
    toast.success(`${item.name} added`);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <Link
      to="/menu/$id"
      params={{ id: item.id }}
      className={`group relative block overflow-hidden rounded-2xl border border-white/10 bg-surface/70 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-ember/40 hover:shadow-[0_16px_40px_-24px_rgba(255,132,67,0.5)] ${
        item.soldOut ? "opacity-70 pointer-events-none" : ""
      }`}
    >
      <div className={`relative aspect-square bg-gradient-to-br ${item.bg} overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_50%)]" />
        <div className="absolute inset-0 grid place-items-center">
          <span
            className={`block text-6xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${
              item.soldOut ? "grayscale" : ""
            }`}
          >
            {item.emoji}
          </span>
        </div>

        {(item.new || item.popular) && !item.soldOut && (
          <div className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
            {item.new ? "New" : "Hot"}
          </div>
        )}

        {item.soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
            <span className="rounded-full border border-border bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.name}</p>
          <p className="mt-0.5 font-heading text-base font-extrabold text-saffron">KES {item.price}</p>
        </div>
        <button
          type="button"
          onClick={quickAdd}
          disabled={item.soldOut}
          aria-label={`Add ${item.name} to cart`}
          className={`flex size-9 shrink-0 items-center justify-center rounded-full shadow-glow transition-all active:scale-90 ${
            added ? "bg-success text-primary-foreground" : "sizzle text-primary-foreground"
          } disabled:opacity-40 disabled:shadow-none`}
        >
          {added ? <Check className="size-4" strokeWidth={3} /> : <Plus className="size-4" strokeWidth={3} />}
        </button>
      </div>
    </Link>
  );
}
