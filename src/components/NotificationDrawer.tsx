import { useEffect } from "react";
import { X, Bell, Package, PartyPopper, ChefHat, Sparkles } from "lucide-react";
import { useAppState, actions } from "@/lib/store";
import type { Notification } from "@/lib/store";

function iconFor(n: Notification) {
  switch (n.kind) {
    case "order":
      return Package;
    case "promo":
      return PartyPopper;
    case "chef":
      return ChefHat;
    case "reward":
      return Sparkles;
    default:
      return Bell;
  }
}

export function NotificationDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const notifications = useAppState((s) => s.notifications);

  useEffect(() => {
    if (open) {
      // Small delay so users see the unread badge context first.
      const t = window.setTimeout(() => actions.markNotificationsRead(), 400);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  return (
    <>
      {/* Scrim */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Notifications"
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-[70] flex w-[92%] max-w-[380px] flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">Inbox</p>
            <h2 className="font-heading text-xl font-extrabold">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-surface"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {notifications.length === 0 ? (
            <div className="mt-16 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-surface">
                <Bell className="size-6 text-muted-foreground" />
              </div>
              <p className="mt-3 font-heading font-bold">All quiet</p>
              <p className="text-xs text-muted-foreground">We'll ping you when something crackles.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => {
                const Icon = iconFor(n);
                return (
                  <li
                    key={n.id}
                    className={`flex gap-3 rounded-2xl border p-3 transition-colors ${
                      n.read ? "border-border bg-surface" : "border-ember/30 bg-ember/5"
                    }`}
                  >
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                        n.read ? "bg-background text-muted-foreground" : "sizzle text-primary-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
