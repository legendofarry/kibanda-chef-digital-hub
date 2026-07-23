import { useEffect, useState } from "react";
import { useAppState, isShopOpen } from "@/lib/store";
import { Flame, Clock } from "lucide-react";

export function SplashOverlay() {
  const [booting, setBooting] = useState(true);
  const [dismissedClosed, setDismissedClosed] = useState(false);
  const hours = useAppState((s) => s.hours);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1800);
    return () => clearTimeout(t);
  }, []);

  const open = isShopOpen(hours);

  if (booting) {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl sizzle blur-2xl opacity-60" />
            <div className="relative flex size-24 items-center justify-center rounded-3xl sizzle animate-sizzle-pulse shadow-glow">
              <Flame className="size-12 text-primary-foreground" strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight">JFlavors</h1>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Street food, elevated
            </p>
          </div>
          <div className="mt-4 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="size-1.5 rounded-full bg-ember animate-sizzle-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!open && !dismissedClosed) {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-background/95 backdrop-blur-xl px-6 animate-rise">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-surface-2 mb-6">
            <Clock className="size-9 text-muted-foreground" />
          </div>
          <h2 className="font-heading text-3xl font-bold">We're closed right now</h2>
          <p className="mt-3 text-muted-foreground">
            The kibanda is off. Hours: {hours.open} – {hours.close}. Feel free to browse the menu,
            chef portfolio and place a request — the pan warms up when we open.
          </p>
          <button
            onClick={() => setDismissedClosed(true)}
            className="mt-6 rounded-full sizzle px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Explore anyway
          </button>
        </div>
      </div>
    );
  }

  return null;
}
