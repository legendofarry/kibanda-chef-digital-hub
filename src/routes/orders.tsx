import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/store";
import { Receipt, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Your orders — MUNCH" },
      { name: "description", content: "Track your active and past orders in real time." },
    ],
  }),
  component: Orders,
});

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending payment",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

const STATUS_COLOR: Record<string, string> = {
  pending_payment: "bg-saffron/15 text-saffron",
  confirmed: "bg-ember/15 text-ember",
  preparing: "bg-ember/15 text-ember",
  ready: "bg-saffron/15 text-saffron",
  out_for_delivery: "bg-ember/15 text-ember",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
  rejected: "bg-destructive/15 text-destructive",
};

function Orders() {
  const orders = useAppState((s) => s.orders);

  return (
    <AppShell>
      <header className="px-5 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">Orders</p>
        <h1 className="font-heading text-3xl font-extrabold">Live & past</h1>
      </header>

      {orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center px-6 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-surface">
            <Receipt className="size-9 text-muted-foreground" />
          </div>
          <p className="mt-4 font-heading text-lg font-bold">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Your first crackle is one tap away.</p>
          <Link
            to="/menu"
            className="mt-6 rounded-full sizzle px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
          >
            Order something
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3 px-5 pb-6">
          {orders.map((o) => (
            <Link
              to="/orders/$id"
              params={{ id: o.id }}
              key={o.id}
              className="block rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{o.id}</p>
                  <p className="mt-1 font-heading text-lg font-bold">KES {o.total}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${STATUS_COLOR[o.status]}`}
                >
                  {STATUS_LABEL[o.status]}
                </span>
              </div>
              <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                {o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString()}
                </span>
                <span className="flex items-center gap-1 font-semibold text-ember">
                  Track <ArrowRight className="size-3" />
                </span>
              </div>
            </Link>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
