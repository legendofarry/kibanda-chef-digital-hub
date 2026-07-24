import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState, actions, isOwner } from "@/lib/store";
import type { OrderStatus } from "@/lib/store";
import {
  ArrowLeft,
  Bike,
  ChefHat,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  Package,
  PartyPopper,
  Sparkles,
  Store,
  Utensils,
} from "lucide-react";
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
import { toast } from "sonner";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order tracking — JFlavors" },
      { name: "description", content: "Live status of your JFlavors order." },
    ],
  }),
  component: OrderDetail,
});

type Step = { key: OrderStatus; label: string; sub: string; Icon: typeof Flame };

const DELIVERY_STEPS: Step[] = [
  { key: "confirmed", label: "Confirmed", sub: "Ticket in the kitchen", Icon: CheckCircle2 },
  { key: "preparing", label: "Sizzling", sub: "Chef John on it", Icon: Flame },
  { key: "ready", label: "Packed", sub: "Sealed hot & ready", Icon: Package },
  { key: "out_for_delivery", label: "On the way", sub: "Rider en route", Icon: Bike },
  { key: "delivered", label: "Delivered", sub: "Enjoy 🎉", Icon: PartyPopper },
];

const PICKUP_STEPS: Step[] = [
  { key: "confirmed", label: "Confirmed", sub: "Ticket in the kitchen", Icon: CheckCircle2 },
  { key: "preparing", label: "Sizzling", sub: "Chef John on it", Icon: Flame },
  { key: "ready", label: "Ready for pickup", sub: "Come grab it hot", Icon: Store },
  { key: "delivered", label: "Picked up", sub: "Karibu tena 🎉", Icon: PartyPopper },
];

function OrderDetail() {
  const { id } = Route.useParams();
  const orders = useAppState((s) => s.orders);
  const user = useAppState((s) => s.user);
  const router = useRouter();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <AppShell>
        <div className="p-6 text-center text-muted-foreground">Order not found.</div>
      </AppShell>
    );
  }

  const isPickup = order.orderType === "pickup";
  const STEPS = isPickup ? PICKUP_STEPS : DELIVERY_STEPS;
  const currentIdx = STEPS.findIndex((s) => s.key === order.status);
  const progress = Math.max(0, currentIdx) / (STEPS.length - 1);
  const owner = isOwner(user?.email);
  const active =
    order.status !== "cancelled" &&
    order.status !== "rejected" &&
    order.status !== "delivered";

  function goBack() {
    if (window.history.length > 1) router.history.back();
  }

  return (
    <AppShell>
      <header className="flex items-center gap-3 px-5 pt-6">
        <button
          onClick={goBack}
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-full border border-border bg-surface"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1">
          <p className="font-mono text-xs text-muted-foreground">{order.id}</p>
          <h1 className="font-heading text-2xl font-extrabold">Order tracking</h1>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
            isPickup ? "bg-saffron/15 text-saffron" : "bg-ember/15 text-ember"
          }`}
        >
          {isPickup ? "Pickup" : "Delivery"}
        </span>
      </header>

      {order.status === "pending_payment" && (
        <div className="mx-5 mt-4 rounded-2xl border border-saffron/30 bg-saffron/10 p-4 text-sm">
          <p className="font-bold text-saffron">Awaiting payment verification</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Chef will verify your {order.paymentMethod === "mpesa" ? "M-Pesa" : "Airtel"} screenshot
            and start prepping shortly.
          </p>
        </div>
      )}

      {order.status === "rejected" && (
        <div className="mx-5 mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Payment could not be verified. Please contact the chef.
        </div>
      )}

      {/* Hero animated tracker */}
      <section className="mt-6 px-5">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-surface to-ember/10 p-5">
          {/* animated sparks background */}
          {active && (
            <>
              <span className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-ember/20 blur-3xl animate-sizzle-pulse" />
              <span
                className="pointer-events-none absolute -left-10 bottom-0 size-32 rounded-full bg-saffron/20 blur-3xl animate-sizzle-pulse"
                style={{ animationDelay: "0.8s" }}
              />
            </>
          )}

          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">
              {isPickup ? "Kiosk countdown" : "Live tracking"}
            </p>
            <h2 className="mt-1 font-heading text-2xl font-extrabold">
              {STEPS[Math.max(0, currentIdx)]?.label ?? "Placed"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {STEPS[Math.max(0, currentIdx)]?.sub ?? "Chef is warming up"}
            </p>
          </div>

          {/* Animated route */}
          <div className="relative mt-6 h-24">
            {/* track */}
            <div className="absolute left-2 right-2 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full sizzle transition-[width] duration-700 ease-out"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* moving actor (rider for delivery, chef hat for pickup) */}
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-700 ease-out"
              style={{ left: `calc(${progress * 100}% - 22px)` }}
            >
              <div className="relative">
                {active && (
                  <span className="absolute inset-0 -m-1 rounded-full bg-ember/40 blur-md animate-sizzle-pulse" />
                )}
                <div className="relative flex size-11 items-center justify-center rounded-full sizzle text-primary-foreground shadow-glow animate-float">
                  {isPickup ? (
                    order.status === "ready" || order.status === "delivered" ? (
                      <Store className="size-5" />
                    ) : (
                      <ChefHat className="size-5" />
                    )
                  ) : order.status === "out_for_delivery" ? (
                    <Bike className="size-5" />
                  ) : order.status === "preparing" ? (
                    <Flame className="size-5" />
                  ) : order.status === "delivered" ? (
                    <PartyPopper className="size-5" />
                  ) : (
                    <Utensils className="size-5" />
                  )}
                </div>
              </div>
            </div>

            {/* endpoints */}
            <div className="absolute left-0 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background">
              <ChefHat className="size-3 text-muted-foreground" />
            </div>
            <div
              className={`absolute right-0 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border ${
                progress >= 1
                  ? "border-success bg-success text-primary-foreground"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              {isPickup ? <Store className="size-3" /> : <MapPin className="size-3" />}
            </div>
          </div>

          {/* Stepper pills */}
          <div className="relative mt-6 grid gap-2" style={{ gridTemplateColumns: `repeat(${STEPS.length}, minmax(0, 1fr))` }}>
            {STEPS.map((step, i) => {
              const done = i <= currentIdx;
              const current = i === currentIdx;
              return (
                <div
                  key={step.key}
                  className={`rounded-xl p-2 text-center transition-all ${
                    done ? "bg-ember/10" : "bg-surface-2/60"
                  } ${current ? "ring-2 ring-ember" : ""}`}
                >
                  <div
                    className={`mx-auto flex size-8 items-center justify-center rounded-full ${
                      done ? "sizzle text-primary-foreground" : "bg-surface text-muted-foreground"
                    }`}
                  >
                    <step.Icon className="size-4" />
                  </div>
                  <p
                    className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${
                      done ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location / Pickup card */}
      <section className="mt-6 px-5">
        {order.orderType === "delivery" && order.location ? (
          <div className="rounded-3xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-ember" />
              <p className="text-sm font-bold">Delivering to</p>
            </div>
            <p className="mt-2 text-sm">
              {order.location.building}, House {order.location.houseNumber}
            </p>
            {order.location.notes && (
              <p className="text-xs text-muted-foreground">{order.location.notes}</p>
            )}
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              {order.location.lat.toFixed(5)}, {order.location.lng.toFixed(5)}
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Store className="size-4 text-saffron" />
              <p className="text-sm font-bold">Pick up at</p>
            </div>
            <p className="mt-2 text-sm">JFlavors Kiosk — hot straight off the pan.</p>
            <p className="text-xs text-muted-foreground">We'll ping you when it's ready.</p>
          </div>
        )}
      </section>

      {/* Items */}
      <section className="mt-6 px-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Order details
        </p>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {order.items.map((i) => (
            <li key={i.itemId} className="flex items-center justify-between p-3 text-sm">
              <span>
                {i.quantity}× {i.name}
              </span>
              <span className="font-mono">KES {i.price * i.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between font-bold">
          <span>Total</span>
          <span className="text-saffron">KES {order.total}</span>
        </div>
      </section>

      {/* Timeline log */}
      <section className="mt-6 px-5 pb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Timeline
        </p>
        <ul className="space-y-2">
          {order.timeline
            .slice()
            .reverse()
            .map((t, i) => (
              <li key={i} className="flex items-center gap-3 text-xs">
                <Clock className="size-3 text-muted-foreground" />
                <span className="font-semibold capitalize">
                  {t.status.replace(/_/g, " ")}
                </span>
                <span className="text-muted-foreground">
                  {new Date(t.at).toLocaleTimeString()}
                </span>
              </li>
            ))}
        </ul>
      </section>

      {/* Owner controls */}
      {owner && (
        <section className="mx-5 mb-8 rounded-3xl border border-ember/30 bg-ember/5 p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ember">
            Owner controls
          </p>
          <div className="grid grid-cols-2 gap-2">
            {order.status === "pending_payment" && (
              <>
                <button
                  onClick={() => {
                    actions.setOrderStatus(order.id, "confirmed", "Payment approved");
                    toast.success("Payment approved");
                  }}
                  className="rounded-xl bg-success/20 py-2 text-xs font-bold text-success"
                >
                  Approve payment
                </button>
                <button
                  onClick={() => {
                    actions.setOrderStatus(order.id, "rejected", "Payment rejected");
                    toast.error("Payment rejected");
                  }}
                  className="rounded-xl bg-destructive/20 py-2 text-xs font-bold text-destructive"
                >
                  Reject
                </button>
              </>
            )}
            {STEPS.map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  actions.setOrderStatus(order.id, s.key);
                  toast.success(`Marked ${s.label}`);
                }}
                className="rounded-xl bg-surface-2 py-2 text-xs font-bold"
              >
                → {s.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {(order.status === "confirmed" || order.status === "pending_payment") && (
        <div className="mx-5 mb-8">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full rounded-full border border-destructive/30 py-3 text-sm font-semibold text-destructive">
                Cancel order
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This cannot be undone. If the chef has already started, cancellation isn't guaranteed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    actions.setOrderStatus(order.id, "cancelled", "Cancelled by customer");
                    toast.success("Order cancelled");
                  }}
                >
                  Cancel order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </AppShell>
  );
}
