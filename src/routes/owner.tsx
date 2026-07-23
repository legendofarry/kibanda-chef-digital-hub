import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState, actions, isOwner } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Clock, Package, ShieldOff, Utensils, Truck } from "lucide-react";
import type { MenuItem } from "@/lib/data";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "Owner dashboard — JFlavors" },
      { name: "description", content: "Manage menu, orders, catering and analytics." },
    ],
  }),
  component: Owner,
});

function Owner() {
  const user = useAppState((s) => s.user);
  const orders = useAppState((s) => s.orders);
  const menu = useAppState((s) => s.menu);
  const catering = useAppState((s) => s.catering);
  const reviews = useAppState((s) => s.reviews);
  const hours = useAppState((s) => s.hours);
  const deliveries = useAppState((s) => s.deliverySignups);
  const navigate = useNavigate();
  const [tab, setTab] = useState<"stats" | "orders" | "menu" | "catering" | "settings">("stats");

  if (!isOwner(user?.email)) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <ShieldOff className="size-12 text-muted-foreground" />
          <p className="mt-4 font-heading text-lg font-bold">Not authorized</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The owner dashboard is only visible to the account owner.
          </p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-6 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold"
          >
            Go home
          </button>
        </div>
      </AppShell>
    );
  }

  const revenue = orders
    .filter((o) => o.status === "delivered" || o.status === "confirmed" || o.status === "preparing")
    .reduce((a, o) => a + o.total, 0);
  const pendingPay = orders.filter((o) => o.status === "pending_payment").length;

  return (
    <AppShell>
      <header className="flex items-center gap-3 px-5 pt-6">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-surface"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">Owner</p>
          <h1 className="font-heading text-2xl font-extrabold">Dashboard</h1>
        </div>
      </header>

      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-2 hide-scrollbar">
        {(["stats", "orders", "menu", "catering", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold capitalize transition-colors ${
              tab === t
                ? "sizzle text-primary-foreground shadow-glow"
                : "border border-border bg-surface text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <section className="mt-4 space-y-3 px-5 pb-8">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Revenue (KES)" value={revenue} />
            <Stat label="Orders" value={orders.length} />
            <Stat label="Pending pay" value={pendingPay} accent />
            <Stat label="Reviews" value={reviews.length} />
            <Stat label="Catering leads" value={catering.length} />
            <Stat label="Rider signups" value={deliveries.length} />
          </div>
        </section>
      )}

      {tab === "orders" && (
        <section className="mt-4 space-y-2 px-5 pb-8">
          {orders.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">No orders yet.</p>
          )}
          {orders.map((o) => (
            <button
              key={o.id}
              onClick={() => navigate({ to: "/orders/$id", params: { id: o.id } })}
              className="w-full rounded-2xl border border-border bg-surface p-4 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs">{o.id}</span>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase">
                  {o.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-sm">{o.items.length} items</span>
                <span className="font-bold text-saffron">KES {o.total}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {o.paymentMethod.toUpperCase()} · {new Date(o.createdAt).toLocaleString()}
              </p>
            </button>
          ))}
        </section>
      )}

      {tab === "menu" && (
        <section className="mt-4 space-y-2 px-5 pb-8">
          {menu.map((m: MenuItem) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
            >
              <div className={`grid size-12 place-items-center rounded-xl bg-gradient-to-br text-2xl ${m.bg}`}>
                {m.emoji}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{m.name}</p>
                <p className="text-xs text-muted-foreground">KES {m.price}</p>
              </div>
              <button
                onClick={() => {
                  actions.toggleSoldOut(m.id);
                  toast.success(m.soldOut ? "Back in stock" : "Marked sold out");
                }}
                className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                  m.soldOut
                    ? "bg-destructive/15 text-destructive"
                    : "bg-success/15 text-success"
                }`}
              >
                {m.soldOut ? "Sold out" : "Available"}
              </button>
            </div>
          ))}
        </section>
      )}

      {tab === "catering" && (
        <section className="mt-4 space-y-2 px-5 pb-8">
          {catering.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">No requests yet.</p>
          )}
          {catering.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold">{c.contactName}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.eventType} · {c.guests} guests · KES {c.budget}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.date} · {c.location}
                  </p>
                </div>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] uppercase">
                  {c.status}
                </span>
              </div>
              {c.notes && <p className="mt-2 text-sm">{c.notes}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => actions.setCateringStatus(c.id, "confirmed")}
                  className="flex-1 rounded-full bg-success/20 py-2 text-xs font-bold text-success"
                >
                  Confirm
                </button>
                <button
                  onClick={() => actions.setCateringStatus(c.id, "declined")}
                  className="flex-1 rounded-full bg-destructive/20 py-2 text-xs font-bold text-destructive"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === "settings" && (
        <section className="mt-4 space-y-4 px-5 pb-8">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="mb-3 flex items-center gap-2 font-bold">
              <Clock className="size-4 text-ember" /> Business hours
            </p>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs">
                Open
                <input
                  type="time"
                  value={hours.open}
                  onChange={(e) => actions.setHours({ ...hours, open: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs">
                Close
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => actions.setHours({ ...hours, close: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="mt-3">
              <p className="mb-2 text-xs font-semibold">Open days</p>
              <div className="flex gap-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => {
                  const on = hours.days.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        const days = on ? hours.days.filter((x) => x !== i) : [...hours.days, i];
                        actions.setHours({ ...hours, days });
                      }}
                      className={`flex size-9 items-center justify-center rounded-full text-xs font-bold ${
                        on ? "sizzle text-primary-foreground" : "bg-surface-2 text-muted-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="flex items-center gap-2 font-bold">
              <Truck className="size-4 text-ember" /> Rider signups ({deliveries.length})
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              {deliveries.map((d) => (
                <li key={d.id} className="text-muted-foreground">
                  {d.fullName} — {d.phone} — {d.vehicle}
                </li>
              ))}
              {deliveries.length === 0 && (
                <li className="text-muted-foreground">Nobody's applied yet.</li>
              )}
            </ul>
          </div>
        </section>
      )}
    </AppShell>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent ? "border-saffron/30 bg-saffron/5" : "border-border bg-surface"
      }`}
    >
      <p className="font-heading text-2xl font-extrabold">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}
