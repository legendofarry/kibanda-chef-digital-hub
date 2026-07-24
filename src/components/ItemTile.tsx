import { Link } from "@tanstack/react-router";
import { Plus, Minus } from "lucide-react";
import { actions, useAppState } from "@/lib/store";
import { toast } from "sonner";
import type { MenuItem } from "@/lib/data";

export function ItemTile({ item }: { item: MenuItem }) {
  const cartItem = useAppState((s) => s.cart.find((c) => c.itemId === item.id));
  const inCart = !!cartItem;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (item.soldOut) return;
    actions.addToCart(item.id, 1, { spiceLevel: "medium", addOns: [] });
    toast.success(`${item.name} added`);
  }

  function inc(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    actions.setCartQty(item.id, cartItem.quantity + 1);
  }
  function dec(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    actions.setCartQty(item.id, cartItem.quantity - 1);
  }

  return (
    <Link
      to="/menu/$id"
      params={{ id: item.id }}
      className={`group relative block overflow-hidden rounded-2xl border border-white/10 bg-surface/70 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-ember/40 hover:shadow-[0_16px_40px_-24px_rgba(255,132,67,0.5)] ${
        item.soldOut ? "opacity-70 pointer-events-none" : ""
      }`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          width={768}
          height={768}
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            item.soldOut ? "grayscale" : ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {(item.new || item.popular) && !item.soldOut && (
          <div className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
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

        {inCart ? (
          <div
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-1 rounded-full border border-ember/40 bg-ember/10 p-0.5 shadow-glow"
          >
            <button
              type="button"
              onClick={dec}
              aria-label={`Decrease ${item.name}`}
              className="grid size-7 place-items-center rounded-full text-ember active:scale-90"
            >
              <Minus className="size-3.5" strokeWidth={3} />
            </button>
            <span className="min-w-4 text-center text-xs font-bold text-ember">
              {cartItem!.quantity}
            </span>
            <button
              type="button"
              onClick={inc}
              aria-label={`Increase ${item.name}`}
              className="grid size-7 place-items-center rounded-full text-ember active:scale-90"
            >
              <Plus className="size-3.5" strokeWidth={3} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={quickAdd}
            disabled={item.soldOut}
            aria-label={`Add ${item.name} to cart`}
            className="flex size-9 shrink-0 items-center justify-center rounded-full sizzle text-primary-foreground shadow-glow transition-all active:scale-90 disabled:opacity-40 disabled:shadow-none"
          >
            <Plus className="size-4" strokeWidth={3} />
          </button>
        )}
      </div>
    </Link>
  );
}
