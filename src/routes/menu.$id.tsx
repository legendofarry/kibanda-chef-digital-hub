import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppState, actions } from "@/lib/store";
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/menu/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — JFlavors` },
      { name: "description", content: "Customize and order this item from JFlavors." },
    ],
  }),
  component: ItemDetail,
});

const spiceOptions = ["mild", "medium", "hot"] as const;
const addOnOptions = ["Extra sauce", "Fresh lime", "Extra chili", "Kachumbari"];

function ItemDetail() {
  const { id } = Route.useParams();
  const menu = useAppState((s) => s.menu);
  const favorites = useAppState((s) => s.favorites);
  const cartItem = useAppState((s) => s.cart.find((c) => c.itemId === id));
  const navigate = useNavigate();
  const item = menu.find((m) => m.id === id);
  const isEditing = !!cartItem;

  const [qty, setQty] = useState(cartItem?.quantity ?? 1);
  const [spiceLevel, setSpiceLevel] = useState<(typeof spiceOptions)[number]>(
    cartItem?.customization?.spiceLevel ?? "medium",
  );
  const [addOns, setAddOns] = useState<string[]>(
    cartItem?.customization?.addOns ?? ["Fresh lime"],
  );
  const [notes, setNotes] = useState(cartItem?.customization?.notes ?? "");

  // If cart line changes externally (e.g. cleared elsewhere), keep local UI sane.
  useEffect(() => {
    if (cartItem) {
      setQty(cartItem.quantity);
    }
  }, [cartItem?.quantity]);

  const total = useMemo(() => (item ? item.price * qty : 0), [item, qty]);

  if (!item) {
    return (
      <AppShell>
        <div className="p-6 text-center text-muted-foreground">Item not found.</div>
      </AppShell>
    );
  }

  const isFav = favorites.includes(item.id);

  function toggleAddOn(option: string) {
    setAddOns((current) =>
      current.includes(option) ? current.filter((x) => x !== option) : [...current, option],
    );
  }

  function save() {
    if (item!.soldOut) return;
    actions.upsertCartItem(item!.id, qty, {
      spiceLevel,
      addOns,
      notes: notes.trim() || undefined,
    });
    toast.success(isEditing ? `${item!.name} updated` : `${qty}× ${item!.name} added`);
    navigate({ to: "/cart" });
  }

  function removeFromCart() {
    actions.removeFromCart(item!.id);
    toast.success(`${item!.name} removed`);
    navigate({ to: "/menu" });
  }

  return (
    <AppShell>
      <div className="relative aspect-[4/4.2] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          width={768}
          height={768}
          className={`absolute inset-0 h-full w-full object-cover ${item.soldOut ? "grayscale" : ""}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-black/40" />

        <button
          onClick={() => {
            if (window.history.length > 1) window.history.back();
            else navigate({ to: "/menu" });
          }}
          className="absolute left-4 top-4 z-10 flex size-10 items-center justify-center rounded-full glass"
        >
          <ArrowLeft className="size-5" />
        </button>
        <button
          onClick={() => {
            actions.toggleFavorite(item.id);
            toast.success(isFav ? "Removed from favorites" : "Added to favorites");
          }}
          className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full glass"
        >
          <Heart className={`size-5 ${isFav ? "fill-ember text-ember" : ""}`} />
        </button>

        <div className="absolute inset-x-0 top-16 z-10 flex items-center justify-center">
          <div className="rounded-full bg-black/45 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white backdrop-blur-sm">
            {isEditing ? "Editing in cart" : item.featured ? "Featured plate" : "Chef special"}
          </div>
        </div>

        {item.soldOut && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-background/70 backdrop-blur">
            <span className="rounded-full border border-border bg-background px-4 py-2 text-sm font-bold uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="relative z-10 -mt-8 space-y-5 rounded-[30px] bg-background p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-heading text-2xl font-extrabold text-balance">{item.name}</h1>
            <span className="shrink-0 rounded-full bg-saffron/15 px-3 py-1 font-heading text-lg font-bold text-saffron">
              KES {item.price}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Customize</p>
            <span className="text-xs text-muted-foreground">Make it yours</span>
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <p className="mb-2 text-xs font-semibold text-foreground">Heat level</p>
              <div className="grid grid-cols-3 gap-2">
                {spiceOptions.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSpiceLevel(level)}
                    className={`rounded-full border px-3 py-2 text-xs font-bold capitalize transition-all ${
                      spiceLevel === level
                        ? "border-ember bg-ember/10 text-ember"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-foreground">Add-ons</p>
              <div className="flex flex-wrap gap-2">
                {addOnOptions.map((option) => {
                  const active = addOns.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleAddOn(option)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? "border-ember bg-ember/10 text-ember"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-foreground">Order note</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ember"
                placeholder="Extra sauce, no onions, keep it crisp..."
              />
            </div>
          </div>
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

        <div className="rounded-2xl bg-surface p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Item total</span>
            <span className="font-heading font-bold text-saffron">KES {total}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface p-1">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="flex size-9 items-center justify-center rounded-full"
              disabled={item.soldOut}
              aria-label="Decrease"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-6 text-center font-heading font-bold">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="flex size-9 items-center justify-center rounded-full"
              disabled={item.soldOut}
              aria-label="Increase"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <button
            onClick={save}
            disabled={item.soldOut}
            className="flex flex-1 items-center justify-center gap-2 rounded-full sizzle py-3.5 font-heading font-bold text-primary-foreground shadow-glow disabled:opacity-40 disabled:shadow-none"
          >
            <ShoppingBag className="size-4" />
            {item.soldOut ? "Sold out" : isEditing ? `Update — KES ${total}` : `Add — KES ${total}`}
          </button>
        </div>

        {isEditing && (
          <button
            onClick={removeFromCart}
            className="w-full rounded-full border border-destructive/30 py-2.5 text-xs font-semibold text-destructive"
          >
            Remove from cart
          </button>
        )}
      </div>
    </AppShell>
  );
}
