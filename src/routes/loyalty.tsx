import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/store";
import { Award, Flame, Trophy } from "lucide-react";

export const Route = createFileRoute("/loyalty")({
  head: () => ({
    meta: [
      { title: "Loyalty — MUNCH" },
      { name: "description", content: "Your MUNCH loyalty card, points and badges." },
    ],
  }),
  component: Loyalty,
});

const BADGES = [
  { id: "b1", name: "First Bite", need: 1, icon: "🥟" },
  { id: "b2", name: "Regular", need: 5, icon: "🌶️" },
  { id: "b3", name: "Fire Starter", need: 500, icon: "🔥" },
  { id: "b4", name: "Kibanda Legend", need: 2000, icon: "👑" },
];

function Loyalty() {
  const points = useAppState((s) => s.loyaltyPoints);
  const orders = useAppState((s) => s.orders);
  const user = useAppState((s) => s.user);

  const nextBadge = BADGES.find((b) => b.need > points) ?? BADGES[BADGES.length - 1];
  const progress = Math.min(100, Math.round((points / nextBadge.need) * 100));

  return (
    <AppShell>
      <header className="px-5 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">Loyalty</p>
        <h1 className="font-heading text-3xl font-extrabold">Your card</h1>
      </header>

      {/* Wallet card */}
      <section className="mt-4 px-5">
        <div className="relative overflow-hidden rounded-3xl sizzle p-6 text-primary-foreground shadow-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">MUNCH · Loyalty</p>
              <p className="mt-1 font-heading text-4xl font-extrabold">{points}</p>
              <p className="text-xs opacity-80">points</p>
            </div>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-black/20">
              <Trophy className="size-7" />
            </div>
          </div>
          <div className="mt-6">
            <div className="h-2 overflow-hidden rounded-full bg-black/20">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs opacity-90">
              {nextBadge.need - points > 0
                ? `${nextBadge.need - points} pts to ${nextBadge.name}`
                : "Max tier reached 👑"}
            </p>
          </div>
          <div className="mt-6 border-t border-black/20 pt-3 font-mono text-xs opacity-70">
            {user?.username ?? "GUEST"} · {orders.length} orders
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="mt-8 px-5">
        <h2 className="mb-3 font-heading text-lg font-bold">Badges</h2>
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map((b) => {
            const earned = points >= b.need;
            return (
              <div
                key={b.id}
                className={`rounded-2xl border p-4 text-center ${
                  earned
                    ? "border-saffron/30 bg-saffron/5"
                    : "border-border bg-surface opacity-60"
                }`}
              >
                <div className={`text-4xl ${earned ? "" : "grayscale"}`}>{b.icon}</div>
                <p className="mt-2 text-sm font-bold">{b.name}</p>
                <p className="text-[11px] text-muted-foreground">{b.need} pts</p>
                {earned && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-saffron/15 px-2 py-0.5 text-[10px] font-bold text-saffron">
                    <Award className="size-3" /> Earned
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 px-5 pb-6">
        <div className="rounded-3xl border border-border bg-surface p-5 text-sm">
          <p className="flex items-center gap-2 font-bold">
            <Flame className="size-4 text-ember" /> How it works
          </p>
          <ul className="mt-3 space-y-1 text-muted-foreground text-xs">
            <li>· 1 point for every KES 10 you spend</li>
            <li>· Badges unlock at milestones</li>
            <li>· Special rewards unlock at 500 pts — cash them in at the kiosk</li>
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
