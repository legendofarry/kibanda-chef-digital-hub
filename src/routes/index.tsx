import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ItemTile } from "@/components/ItemTile";
import { NotificationDrawer } from "@/components/NotificationDrawer";
import { useAppState } from "@/lib/store";
import { PROMOS, CHEF, MERCH_TEASERS } from "@/lib/data";
import { sizzleSuggestion } from "@/lib/ai.functions";
import { useServerFn } from "@tanstack/react-start";
import { Flame, Sparkles, ArrowRight, ChefHat, Trophy, PartyPopper, ShoppingBag, Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JFlavors" },
      { name: "description", content: "Today's specials, popular items and chef highlights at JFlavors." },
      { property: "og:title", content: "JFlavors" },
      { property: "og:description", content: "Today's specials, popular items and chef highlights at JFlavors." },
    ],
  }),
  component: Home,
});

function Home() {
  const user = useAppState((s) => s.user);
  const menu = useAppState((s) => s.menu);
  const points = useAppState((s) => s.loyaltyPoints);
  const hasOnboarded = useAppState((s) => s.hasOnboarded);
  const notifications = useAppState((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;
  const navigate = useNavigate();
  const suggest = useServerFn(sizzleSuggestion);
  const [shaking, setShaking] = useState(false);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  const [suggestion, setSuggestion] = useState<{ name: string; reason: string; id: string } | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!hasOnboarded) navigate({ to: "/onboarding" });
  }, [hasOnboarded, navigate]);

  const specials = menu.filter((m) => m.featured);
  const popular = menu.filter((m) => m.popular);

  async function tossPan() {
    if (shaking) return;
    setShaking(true);
    setSuggestion(null);
    const next = Array.from({ length: 14 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 260,
      y: (Math.random() - 0.5) * 180,
    }));
    setSparks(next);
    setTimeout(() => setSparks([]), 1400);
    try {
      const res = await suggest({ data: { mood: undefined } });
      const item = menu.find((m) => m.id === res.itemId);
      setTimeout(() => {
        if (item) setSuggestion({ id: item.id, name: item.name, reason: res.reason });
        setShaking(false);
      }, 1400);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't fetch a suggestion.");
      setShaking(false);
    }
  }

  return (
    <AppShell>
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />

      <header className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 sizzle blur-md opacity-70 rounded-2xl" />
            <div className="relative flex size-11 items-center justify-center rounded-2xl sizzle shadow-glow">
              <Flame className="size-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="font-heading text-xl font-extrabold leading-none">JFlavors</h1>
            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              {user ? `Hey, ${user.username}` : "Hello, guest"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setNotifOpen(true)}
          aria-label="Notifications"
          className="relative flex size-11 items-center justify-center rounded-2xl border border-border bg-surface active:scale-95"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full sizzle px-1 text-[10px] font-bold text-primary-foreground shadow-glow">
              {unread}
            </span>
          )}
        </button>
      </header>

      <div className="mt-6 space-y-8 pb-6">
        <section className="px-5 animate-rise">
          <button
            type="button"
            onClick={tossPan}
            aria-label="Toss the pan for an AI pick"
            className="relative block w-full overflow-hidden rounded-2xl sizzle p-6 text-left text-primary-foreground shadow-glow transition-transform active:scale-[0.99]"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="size-3" /> AI Chef
              </div>
              <h2 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-balance">
                Can't decide?<br />Toss the pan.
              </h2>
              <p className="mt-2 max-w-[28ch] text-sm opacity-90">
                Tap the card — the pan tosses, the egg flips, the chef picks.
              </p>

              <div className="mt-5 min-h-[3.5rem] text-sm">
                {suggestion && !shaking ? (
                  <div className="animate-rise rounded-xl bg-black/25 p-3 backdrop-blur-sm">
                    <p className="font-heading text-lg font-extrabold">{suggestion.name}</p>
                    <p className="text-xs opacity-90 line-clamp-2">{suggestion.reason}</p>
                    <Link
                      to="/menu/$id"
                      params={{ id: suggestion.id }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-xs font-bold"
                    >
                      Open details <ArrowRight className="size-3" />
                    </Link>
                  </div>
                ) : (
                  <p className="text-xs opacity-80">
                    {shaking ? "Tossing…" : "Tap anywhere on the card."}
                  </p>
                )}
              </div>
            </div>

            {shaking && (
              <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-ember/50 via-transparent to-transparent animate-flash" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="relative">
                    <span className="absolute inset-0 grid place-items-center text-[9rem] leading-none animate-pan-swing drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                      🍳
                    </span>
                    <span className="relative block text-[6rem] leading-none animate-egg-toss drop-shadow-[0_10px_24px_rgba(255,180,60,0.6)]">
                      🥚
                    </span>
                  </div>
                </div>
                {sparks.map((s) => (
                  <span
                    key={s.id}
                    style={
                      {
                        "--x": `${s.x}px`,
                        "--y": `${s.y}px`,
                        animation: "spark 1s ease-out forwards",
                      } as React.CSSProperties
                    }
                    className="pointer-events-none absolute left-1/2 top-1/2 size-2.5 rounded-full bg-saffron shadow-[0_0_16px_var(--saffron)]"
                  />
                ))}
              </div>
            )}

            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-black/20 blur-3xl" />
          </button>
        </section>

        <section className="px-5">
          <Link
            to="/loyalty"
            className="flex items-center justify-between rounded-3xl border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-saffron/15 text-saffron">
                <Trophy className="size-5" />
              </div>
              <div>
                <p className="font-heading font-bold">{points} pts</p>
                <p className="text-xs text-muted-foreground">Loyalty wallet</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
          </Link>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between px-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">Today</p>
              <h3 className="font-heading text-xl font-bold">Chef's specials</h3>
            </div>
            <Link to="/menu" className="text-xs font-bold text-saffron">
              View all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-5 pb-2 hide-scrollbar">
            {specials.map((item) => (
              <Link
                to="/menu/$id"
                params={{ id: item.id }}
                key={item.id}
                className="group relative w-64 shrink-0 overflow-hidden rounded-2xl border border-border"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    width={768}
                    height={576}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-heading text-lg font-bold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">KES {item.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-5">
          <h3 className="mb-3 font-heading text-xl font-bold">Running promos</h3>
          <div className="space-y-3">
            {PROMOS.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-xl ${
                    p.accent === "ember" ? "bg-ember/15 text-ember" : "bg-saffron/15 text-saffron"
                  }`}
                >
                  <PartyPopper className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5">
          <div className="mb-3 flex items-end justify-between">
            <h3 className="font-heading text-xl font-bold">Popular right now</h3>
            <Link to="/menu" className="text-xs font-bold text-saffron">
              Menu →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {popular.map((item) => (
              <ItemTile key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section className="px-5">
          <Link
            to="/chef"
            className="block overflow-hidden rounded-3xl border border-border bg-surface"
          >
            <div className="flex items-center gap-4 p-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ember/40 to-saffron/40">
                <ChefHat className="size-8 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Meet the chef
                </p>
                <p className="mt-0.5 font-heading text-lg font-bold">{CHEF.name}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{CHEF.tagline}</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </div>
          </Link>
        </section>

        <section className="px-5">
          <Link
            to="/catering"
            className="flex items-center justify-between rounded-3xl bg-surface-2 p-5 border border-border"
          >
            <div>
              <p className="font-heading text-lg font-bold">Book us for your event</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Private chef, corporate lunches, weddings.
              </p>
            </div>
            <span className="rounded-full sizzle px-4 py-2 text-xs font-bold text-primary-foreground">
              Book
            </span>
          </Link>
        </section>

        <section className="px-5">
          <div className="mb-3 flex items-end justify-between">
            <h3 className="font-heading text-xl font-bold">Merch drop soon</h3>
            <Link to="/merch" className="text-xs font-bold text-saffron">
              Preview →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
            {MERCH_TEASERS.map((m) => (
              <div
                key={m.id}
                className="w-40 shrink-0 rounded-2xl border border-border bg-surface p-3"
              >
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={m.image}
                    alt={m.name}
                    loading="lazy"
                    width={768}
                    height={768}
                    className="aspect-square w-full object-cover"
                  />
                </div>
                <p className="mt-3 text-sm font-bold">{m.name}</p>
                <p className="text-xs text-muted-foreground">KES {m.price}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5">
          <Link
            to="/menu"
            className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface py-3 text-sm font-semibold"
          >
            <ShoppingBag className="size-4" /> Browse the full menu
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
