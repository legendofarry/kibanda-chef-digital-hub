import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState, actions, isOwner } from "@/lib/store";
import { ArrowLeft, CheckCircle2, Circle, Clock, MapPin, Package, Truck } from "lucide-react";
import type { OrderStatus } from "@/lib/store";
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
      { title: "Order tracking — MUNCH" },
      { name: "description", content: "Live status of your MUNCH order." },
    ],
  }),
  component: OrderDetail,
});

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "out_for_delivery", label: "On the way" },
  { key: "delivered", label: "Delivered" },
];

function OrderDetail() {
  const { id } = Route.useParams();
  const orders = useAppState((s) => s.orders);
  const user = useAppState((s) => s.user);
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <AppShell>
        <div className="p-6 text-center text-muted-foreground">Order not found.</div>
      </AppShell>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === order.status);
  const owner = isOwner(user?.email);

  return (
    <AppShell>
      <header className="flex items-center gap-3 px-5 pt-6">
        <Link
          to="/orders"
          className="flex size-9 items-center justify-center rounded-full border border-border bg-surface"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <p className="font-mono text-xs text-muted-foreground">{order.id}</p>
          <h1 className="font-heading text-2xl font-extrabold">Order tracking</h1>
        </div>
      </header>

      {order.status === "pending_payment" && (
        <div className="mx-5 mt-4 rounded-2xl border border-saffron/30 bg-saffron/10 p-4 text-sm">
          <p className="font-bold text-saffron">Awaiting payment verification</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The chef will verify your {order.paymentMethod === "mpesa" ? "M-Pesa" : "Airtel"}{" "}
            screenshot and start preparing shortly.
          </p>
        </div>
      )}

      {order.status === "rejected" && (
        <div className="mx-5 mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Payment could not be verified. Please contact the chef.
        </div>
      )}

      {/* Timeline stepper */}
      <section className="mt-6 px-5">
        <div className="rounded-3xl border border-border bg-surface p-5">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Progress
          </p>
          <ol className="space-y-4">
            {STEPS.map((step, i) => {
              const done = i <= currentIdx;
              const current = i === currentIdx;
              return (
                <li key={step.key} className="flex items-center gap-3">
                  <div
                    className={`relative flex size-8 items-center justify-center rounded-full transition-colors ${
                      done ? "sizzle text-primary-foreground" : "bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {current && (
                      <span className="absolute inset-0 rounded-full sizzle opacity-40 animate-sizzle-pulse" />
                    )}
                    {done ? (
                      <CheckCircle2 className="relative size-4" />
                    ) : (
                      <Circle className="relative size-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${done ? "" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    {current && (
                      <p className="text-[11px] text-ember">In progress right now</p>
                    )}
                  </div>
                  {i === STEPS.length - 1 ? null : <span className="text-xs">—</span>}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Delivery location */}
      <section className="mt-6 px-5">
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
