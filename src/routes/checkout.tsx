import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppState, actions } from "@/lib/store";
import { PinMap, type PinCoords } from "@/components/PinMap";
import { BUSINESS_PAYMENT_NUMBER } from "@/lib/data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Camera, Check, Copy, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — MUNCH" },
      { name: "description", content: "Pin your location, choose how you'll pay, and place your order." },
    ],
  }),
  component: Checkout,
});

type Method = "cash" | "mpesa" | "airtel";

function Checkout() {
  const cart = useAppState((s) => s.cart);
  const menu = useAppState((s) => s.menu);
  const user = useAppState((s) => s.user);
  const navigate = useNavigate();

  const lines = useMemo(
    () => cart.map((c) => ({ ...c, item: menu.find((m) => m.id === c.itemId)! })),
    [cart, menu],
  );
  const total = lines.reduce((a, l) => a + l.item.price * l.quantity, 0);

  const [method, setMethod] = useState<Method>("mpesa");
  const [pin, setPin] = useState<PinCoords | null>(null);
  const [building, setBuilding] = useState("");
  const [house, setHouse] = useState("");
  const [notes, setNotes] = useState("");
  const [guestName, setGuestName] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile() {
    fileRef.current?.click();
  }
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  }

  function copyNumber() {
    navigator.clipboard.writeText(BUSINESS_PAYMENT_NUMBER.replace(/\s/g, ""));
    toast.success("Payment number copied");
  }

  function ready() {
    if (!pin) return "Pin your location first";
    if (!building.trim()) return "Enter the building or landmark";
    if (!house.trim()) return "Enter your house/apt number";
    if (!user && !guestName.trim()) return "Add a name so the chef knows who to call";
    if (method !== "cash" && !screenshot) return "Attach the payment screenshot";
    return null;
  }

  function place() {
    const err = ready();
    if (err) {
      toast.error(err);
      return;
    }
    const order = actions.placeOrder({
      userId: user?.id ?? null,
      guestName: user ? undefined : guestName.trim(),
      items: lines.map((l) => ({
        itemId: l.itemId,
        name: l.item.name,
        price: l.item.price,
        quantity: l.quantity,
      })),
      total,
      paymentMethod: method,
      paymentScreenshot: screenshot ?? undefined,
      location: {
        lat: pin!.lat,
        lng: pin!.lng,
        building: building.trim(),
        houseNumber: house.trim(),
        notes: notes.trim(),
      },
    });
    toast.success(
      method === "cash"
        ? "Order confirmed 🎉"
        : "Order placed — awaiting payment verification",
    );
    navigate({ to: "/orders/$id", params: { id: order.id } });
  }

  if (lines.length === 0) {
    return (
      <AppShell>
        <div className="p-6 text-center text-muted-foreground">
          Your cart is empty. Add items first.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="px-5 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">Checkout</p>
        <h1 className="font-heading text-3xl font-extrabold">Almost hot</h1>
      </header>

      <section className="mt-6 px-5">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Where to deliver
        </h2>
        <PinMap value={pin} onChange={setPin} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <input
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            placeholder="Building / landmark"
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ember"
          />
          <input
            value={house}
            onChange={(e) => setHouse(e.target.value)}
            placeholder="House / apt #"
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ember"
          />
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Delivery notes (gate code, floor, colour...)"
          className="mt-3 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ember"
          rows={2}
        />
        {!user && (
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name (guest)"
            className="mt-3 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ember"
          />
        )}
      </section>

      <section className="mt-8 px-5">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Payment
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "cash", label: "Cash" },
              { id: "mpesa", label: "M-Pesa" },
              { id: "airtel", label: "Airtel" },
            ] as { id: Method; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`rounded-2xl border py-4 text-sm font-bold transition-colors ${
                method === m.id
                  ? "border-ember bg-ember/10 text-ember"
                  : "border-border bg-surface text-muted-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {method !== "cash" && (
          <div className="mt-4 space-y-4 rounded-2xl border border-border bg-surface p-4 animate-rise">
            <div>
              <p className="text-xs text-muted-foreground">
                Send <span className="font-bold text-foreground">KES {total}</span> to:
              </p>
              <button
                onClick={copyNumber}
                className="mt-2 flex w-full items-center justify-between rounded-xl bg-background p-3"
              >
                <div className="flex items-center gap-2">
                  <Wallet className="size-4 text-ember" />
                  <span className="font-heading text-lg font-bold">{BUSINESS_PAYMENT_NUMBER}</span>
                </div>
                <Copy className="size-4 text-muted-foreground" />
              </button>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Complete the payment on your {method === "mpesa" ? "M-Pesa" : "Airtel Money"} app, then
                upload the confirmation below.
              </p>
            </div>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onFile}
                className="hidden"
              />
              <button
                onClick={pickFile}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-sm font-semibold ${
                  screenshot ? "border-success text-success" : "border-border text-muted-foreground"
                }`}
              >
                {screenshot ? <Check className="size-5" /> : <Camera className="size-5" />}
                {screenshot ? "Screenshot attached" : "Upload payment screenshot"}
              </button>
              {screenshot && (
                <img
                  src={screenshot}
                  alt="payment"
                  className="mt-3 max-h-40 rounded-xl border border-border object-cover"
                />
              )}
            </div>
          </div>
        )}
      </section>

      <section className="mt-8 space-y-2 px-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Items</span>
          <span>KES {total}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="font-heading text-lg font-bold">Total</span>
          <span className="font-heading text-xl font-extrabold text-saffron">KES {total}</span>
        </div>
      </section>

      <div className="mt-6 px-5 pb-8">
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full rounded-full sizzle py-4 font-heading font-bold text-primary-foreground shadow-glow"
        >
          Place order — KES {total}
        </button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm your order?</AlertDialogTitle>
            <AlertDialogDescription>
              {method === "cash"
                ? "You'll pay in cash on delivery. We start prepping right away."
                : "We'll verify your payment screenshot before starting. You'll see updates in Orders."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not yet</AlertDialogCancel>
            <AlertDialogAction onClick={place}>Place order</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
