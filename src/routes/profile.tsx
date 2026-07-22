import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState, actions, isOwner } from "@/lib/store";
import {
  Bell,
  Heart,
  LogOut,
  Receipt,
  Settings2,
  Star,
  Store,
  Trash2,
  UserPlus,
  Bike,
  Trophy,
  ChevronRight,
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

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — MUNCH" },
      { name: "description", content: "Your MUNCH profile, favorites and settings." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const user = useAppState((s) => s.user);
  const orders = useAppState((s) => s.orders);
  const points = useAppState((s) => s.loyaltyPoints);
  const notifications = useAppState((s) => s.notifications);
  const owner = isOwner(user?.email);
  const navigate = useNavigate();

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AppShell>
      <header className="px-5 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">Me</p>
        <h1 className="font-heading text-3xl font-extrabold">Profile</h1>
      </header>

      {user ? (
        <section className="mt-4 px-5">
          <div className="rounded-3xl border border-border bg-surface p-5">
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-ember/40 to-saffron/40 text-3xl">
                {user.avatar}
              </div>
              <div className="flex-1">
                <p className="font-heading text-lg font-extrabold">@{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.fullName}</p>
                <p className="text-[11px] text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Stat label="Orders" value={orders.length} />
              <Stat label="Points" value={points} />
              <Stat label="Reviews" value={0} />
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-4 px-5">
          <div className="rounded-3xl border border-border bg-surface p-5 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl sizzle shadow-glow">
              <UserPlus className="size-6 text-primary-foreground" />
            </div>
            <p className="mt-3 font-heading text-lg font-bold">Sign in to unlock more</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Reviews, favorites, loyalty and order history.
            </p>
            <button
              onClick={() => navigate({ to: "/auth" })}
              className="mt-4 w-full rounded-full sizzle py-3 text-sm font-bold text-primary-foreground shadow-glow"
            >
              Sign in
            </button>
          </div>
        </section>
      )}

      <section className="mt-6 space-y-2 px-5">
        <Row icon={Trophy} label="Loyalty & badges" to="/loyalty" />
        <Row icon={Receipt} label="Orders" to="/orders" />
        <Row icon={Star} label="Reviews" to="/reviews" />
        <Row icon={Heart} label="Favorites" to="/menu" />
        <Row
          icon={Bell}
          label={`Notifications${unread ? ` (${unread})` : ""}`}
          onClick={() => {
            actions.markNotificationsRead();
            toast.success("All caught up");
          }}
        />
        <Row icon={Bike} label="Become a delivery rider" to="/delivery" />
        {owner && (
          <Row icon={Store} label="Owner dashboard" to="/owner" accent />
        )}
      </section>

      {user && (
        <section className="mt-6 space-y-2 px-5 pb-8">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
                <LogOut className="size-4 text-muted-foreground" /> Sign out
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your cart clears too. Your saved data stays on this device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    actions.signOut();
                    toast.success("Signed out");
                    navigate({ to: "/" });
                  }}
                >
                  Sign out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                <Trash2 className="size-4" /> Clear all local data
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Wipe everything?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deletes your orders, cart, reviews and account from this device. Cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    actions.clearAllData();
                    toast.success("Cleared");
                    navigate({ to: "/" });
                  }}
                >
                  Wipe
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-background p-3">
      <p className="font-heading text-lg font-extrabold">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  to,
  onClick,
  accent,
}: {
  icon: any;
  label: string;
  to?: string;
  onClick?: () => void;
  accent?: boolean;
}) {
  const cls = `flex w-full items-center gap-3 rounded-2xl border p-4 text-sm ${
    accent ? "border-ember/30 bg-ember/5 text-ember" : "border-border bg-surface"
  }`;
  const content = (
    <>
      <Icon className={`size-4 ${accent ? "text-ember" : "text-muted-foreground"}`} />
      <span className="flex-1 text-left font-semibold">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {content}
    </button>
  );
}
