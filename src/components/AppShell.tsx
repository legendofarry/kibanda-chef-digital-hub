import { Link, useRouterState } from "@tanstack/react-router";
import { Home, UtensilsCrossed, Receipt, ChefHat, User, Sparkles, ShoppingBag } from "lucide-react";
import { useAppState } from "@/lib/store";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/orders", label: "Orders", icon: Receipt },
  { to: "/chef", label: "Chef", icon: ChefHat },
  { to: "/profile", label: "Me", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const cart = useAppState((s) => s.cart);
  const cartCount = cart.reduce((a, c) => a + c.quantity, 0);

  return (
    <div className="mx-auto flex min-h-screen max-w-[440px] flex-col bg-background text-foreground">
      <div className="flex-1 pb-28">{children}</div>

      {cartCount > 0 && !pathname.startsWith("/cart") && !pathname.startsWith("/checkout") && (
        <Link
          to="/cart"
          className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full sizzle px-5 py-3 text-primary-foreground shadow-glow animate-rise"
        >
          <ShoppingBag className="size-4" />
          <span className="text-sm font-semibold">{cartCount} in cart</span>
          <span className="text-xs opacity-80">View →</span>
        </Link>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[440px]">
        <div className="glass border-t px-3 py-2">
          <ul className="flex items-center justify-between">
            {tabs.map((t) => {
              const active = t.to === "/" ? pathname === "/" : pathname.startsWith(t.to);
              const Icon = t.icon;
              return (
                <li key={t.to} className="flex-1">
                  <Link
                    to={t.to}
                    className={`flex flex-col items-center gap-1 rounded-2xl py-2 transition-all ${
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`relative rounded-xl p-2 transition-colors ${
                        active ? "bg-primary/10" : ""
                      }`}
                    >
                      <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                      {t.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <Link
        to="/ai"
        aria-label="AI Assistant"
        className="fixed right-4 top-4 z-40 flex size-11 items-center justify-center rounded-full sizzle text-primary-foreground shadow-glow"
      >
        <Sparkles className="size-5" />
      </Link>
    </div>
  );
}
