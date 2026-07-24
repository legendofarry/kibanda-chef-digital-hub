import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState, actions } from "@/lib/store";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, PenSquare } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — JFlavors" },
      { name: "description", content: "Review, customize, and checkout your JFlavors order." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useAppState((s) => s.cart);
  const menu = useAppState((s) => s.menu);
  const navigate = useNavigate();

  const lines = cart.map((c) => {
    const item = menu.find((m) => m.id === c.itemId)!;
    return { ...c, item };
  });
  const subtotal = lines.reduce((a, l) => a + l.item.price * l.quantity, 0);

  return (
    <AppShell>
      <header className="px-5 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">Cart</p>
        <h1 className="font-heading text-3xl font-extrabold">Your order</h1>
      </header>

      {lines.length === 0 ? (
        <div className="mt-10 flex flex-col items-center px-6 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-surface">
            <ShoppingBag className="size-9 text-muted-foreground" />
          </div>
          <p className="mt-4 font-heading text-lg font-bold">Nothing in the pan yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add something crackling from the menu.</p>
          <Link
            to="/menu"
            className="mt-6 rounded-full sizzle px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
          >
            Browse menu
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-4 space-y-3 px-5">
            {lines.map((l) => (
              <li
                key={l.itemId}
                className="rounded-2xl border border-border bg-surface p-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={l.item.image}
                    alt={l.item.name}
                    loading="lazy"
                    width={128}
                    height={128}
                    className="size-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-bold">{l.item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      KES {l.item.price} × {l.quantity}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                      <span className="rounded-full bg-background px-2 py-1 text-muted-foreground">
                        {l.customization?.spiceLevel ?? "medium"}
                      </span>
                      {(l.customization?.addOns ?? []).map((addOn) => (
                        <span key={addOn} className="rounded-full bg-background px-2 py-1 text-muted-foreground">
                          {addOn}
                        </span>
                      ))}
                    </div>
                    {l.customization?.notes && (
                      <p className="mt-2 text-[11px] text-muted-foreground">Note: {l.customization.notes}</p>
                    )}
                  </div>
                  <p className="font-heading font-bold text-saffron">KES {l.item.price * l.quantity}</p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 rounded-full border border-border bg-background p-0.5">
                    <button
                      onClick={() => actions.setCartQty(l.itemId, l.quantity - 1)}
                      className="flex size-7 items-center justify-center rounded-full"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold">{l.quantity}</span>
                    <button
                      onClick={() => actions.setCartQty(l.itemId, l.quantity + 1)}
                      className="flex size-7 items-center justify-center rounded-full"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/menu/$id"
                      params={{ id: l.itemId }}
                      className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground"
                    >
                      <PenSquare className="size-3.5" />
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        actions.removeFromCart(l.itemId);
                        toast.success("Removed");
                      }}
                      className="flex size-7 items-center justify-center rounded-full text-muted-foreground"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2 px-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold">KES {subtotal}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-muted-foreground">To be arranged</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
              <span className="font-heading text-lg font-bold">Total</span>
              <span className="font-heading text-xl font-extrabold text-saffron">KES {subtotal}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 px-5">
            <button
              onClick={() => navigate({ to: "/checkout" })}
              className="flex items-center justify-center gap-2 rounded-full sizzle py-4 font-heading font-bold text-primary-foreground shadow-glow"
            >
              Checkout <ArrowRight className="size-4" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="rounded-full py-2.5 text-xs font-semibold text-muted-foreground">
                  Clear cart
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear the cart?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all items. You can add them again from the menu.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep them</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      actions.clearCart();
                      toast.success("Cart cleared");
                    }}
                  >
                    Clear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </AppShell>
  );
}
