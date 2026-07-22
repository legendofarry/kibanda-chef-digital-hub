import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppState, actions } from "@/lib/store";
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/menu/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — MUNCH` },
      { name: "description", content: "Order this item from MUNCH." },
    ],
  }),
  component: ItemDetail,
});

function ItemDetail() {
  const { id } = Route.useParams();
  const menu = useAppState((s) => s.menu);
  const favorites = useAppState((s) => s.favorites);
  const navigate = useNavigate();
  const item = menu.find((m) => m.id === id);
  const [qty, setQty] = useState(1);

  if (!item) {
    return (
      <AppShell>
        <div className="p-6 text-center text-muted-foreground">Item not found.</div>
      </AppShell>
    );
  }

  const isFav = favorites.includes(item.id);

  function add() {
    if (!item) return;
    if (item.soldOut) return;
    actions.addToCart(item.id, qty);
    toast.success(`${qty}× ${item.name} added to cart`);
  }

  return (
    <AppShell>
      <div className={`relative aspect-square bg-gradient-to-br ${item.bg}`}>
        <button
          onClick={() => navigate({ to: "/menu" })}
          className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full glass"
        >
          <ArrowLeft className="size-5" />
        </button>
        <button
          onClick={() => {
            actions.toggleFavorite(item.id);
            toast.success(isFav ? "Removed from favorites" : "Added to favorites");
          }}
          className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full glass"
        >
          <Heart className={`size-5 ${isFav ? "fill-ember text-ember" : ""}`} />
        </button>
        <div className="absolute inset-0 grid place-items-center text-[9rem]">{item.emoji}</div>
        {item.soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur">
            <span className="rounded-full border border-border bg-background px-4 py-2 text-sm font-bold uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6 rounded-t-3xl bg-background p-5 -mt-6 relative z-10">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-heading text-2xl font-extrabold text-balance">{item.name}</h1>
            <span className="shrink-0 rounded-full bg-saffron/15 px-3 py-1 font-heading text-lg font-bold text-saffron">
              KES {item.price}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Ingredients
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.ingredients.map((i) => (
              <span
                key={i}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs"
              >
                {i}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface p-1">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="flex size-9 items-center justify-center rounded-full"
              disabled={item.soldOut}
            >
              <Minus className="size-4" />
            </button>
            <span className="w-6 text-center font-heading font-bold">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="flex size-9 items-center justify-center rounded-full"
              disabled={item.soldOut}
            >
              <Plus className="size-4" />
            </button>
          </div>
          <button
            onClick={add}
            disabled={item.soldOut}
            className="flex flex-1 items-center justify-center gap-2 rounded-full sizzle py-3.5 font-heading font-bold text-primary-foreground shadow-glow disabled:opacity-40 disabled:shadow-none"
          >
            <ShoppingBag className="size-4" />
            {item.soldOut ? "Sold out" : `Add — KES ${item.price * qty}`}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
