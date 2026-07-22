// Lightweight reactive local-storage store. Repository-pattern friendly so it
// can be swapped for a cloud backend later without changing UI code.
import { useSyncExternalStore } from "react";
import type { MenuItem, BusinessHours } from "./data";
import { SEED_MENU, DEFAULT_HOURS, OWNER_EMAIL } from "./data";

const KEY = "munch.state.v1";

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string; // emoji or data-url
  createdAt: number;
  biometricEnabled: boolean;
  biometricAsked: boolean;
}

export interface CartCustomization {
  spiceLevel: "mild" | "medium" | "hot";
  addOns: string[];
  notes?: string;
}

export interface CartItem {
  itemId: string;
  quantity: number;
  customization?: CartCustomization;
  notes?: string;
}

export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "rejected";

export interface Order {
  id: string;
  userId: string | null; // null = guest
  guestName?: string;
  items: { itemId: string; name: string; price: number; quantity: number }[];
  total: number;
  paymentMethod: "cash" | "mpesa" | "airtel";
  paymentScreenshot?: string; // data-url
  status: OrderStatus;
  createdAt: number;
  location: {
    lat: number;
    lng: number;
    building: string;
    houseNumber: string;
    notes?: string;
  };
  timeline: { status: OrderStatus; at: number; note?: string }[];
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  rating: number;
  foodRating: number;
  serviceRating: number;
  text: string;
  photos: string[];
  createdAt: number;
}

export interface CateringRequest {
  id: string;
  userId: string | null;
  contactName: string;
  contactPhone: string;
  eventType: string;
  guests: number;
  budget: number;
  date: string;
  location: string;
  notes: string;
  status: "new" | "reviewed" | "confirmed" | "declined";
  createdAt: number;
}

export interface DeliverySignup {
  id: string;
  fullName: string;
  phone: string;
  vehicle: string;
  createdAt: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  kind: "promo" | "order" | "chef" | "reward" | "menu";
}

export interface AppState {
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  reviews: Review[];
  catering: CateringRequest[];
  deliverySignups: DeliverySignup[];
  notifications: Notification[];
  menu: MenuItem[];
  hours: BusinessHours;
  hasOnboarded: boolean;
  loyaltyPoints: number;
  favorites: string[];
}

const initialState: AppState = {
  user: null,
  cart: [],
  orders: [],
  reviews: [
    {
      id: "r1",
      userId: "seed1",
      username: "wanjiru",
      avatar: "🌶️",
      rating: 5,
      foodRating: 5,
      serviceRating: 5,
      text: "Best bhajia in Nairobi. The smoky chili is dangerous in the best way.",
      photos: [],
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: "r2",
      userId: "seed2",
      username: "kimani",
      avatar: "🔥",
      rating: 5,
      foodRating: 5,
      serviceRating: 4,
      text: "Chef Harrison actually knows his craft. This isn't a normal kibanda.",
      photos: [],
      createdAt: Date.now() - 86400000 * 8,
    },
  ],
  catering: [],
  deliverySignups: [],
  notifications: [
    {
      id: "n1",
      title: "🔥 Double Bhajia Tuesdays",
      body: "Buy one classic, get one 50% off. Today only.",
      createdAt: Date.now() - 3600000,
      read: false,
      kind: "promo",
    },
    {
      id: "n2",
      title: "New on the menu",
      body: "Chef just added the Smokey Deluxe. Try it hot.",
      createdAt: Date.now() - 86400000,
      read: false,
      kind: "menu",
    },
  ],
  menu: SEED_MENU,
  hours: DEFAULT_HOURS,
  hasOnboarded: false,
  loyaltyPoints: 0,
  favorites: [],
};

// ---- Reactive store ----
type Listener = () => void;
const listeners = new Set<Listener>();
let state: AppState = initialState;

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // merge to keep any newly added default fields
      state = { ...initialState, ...parsed, menu: parsed.menu ?? SEED_MENU };
    }
  } catch {}
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

function emit() {
  persist();
  for (const l of listeners) l();
}

let hydrated = false;
function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  load();
}

export function getState(): AppState {
  ensureHydrated();
  return state;
}

const ssrSnap: AppState = initialState;
export function useAppState<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(getState()),
    () => selector(ssrSnap),
  );
}

export function update(mut: (s: AppState) => AppState | void) {
  ensureHydrated();
  const next = mut(state);
  if (next) state = next;
  else state = { ...state };
  emit();
}

// ---- Repository actions ----
export const actions = {
  setOnboarded() {
    update((s) => {
      s.hasOnboarded = true;
    });
  },
  signIn(input: { username: string; fullName: string; email: string; avatar: string }) {
    update((s) => {
      s.user = {
        id: crypto.randomUUID(),
        username: input.username,
        fullName: input.fullName,
        email: input.email.toLowerCase(),
        avatar: input.avatar,
        createdAt: Date.now(),
        biometricEnabled: false,
        biometricAsked: false,
      };
    });
  },
  signOut() {
    update((s) => {
      s.user = null;
      s.cart = [];
    });
  },
  updateUser(patch: Partial<User>) {
    update((s) => {
      if (s.user) s.user = { ...s.user, ...patch };
    });
  },
  addToCart(itemId: string, quantity = 1, customization?: CartCustomization) {
    update((s) => {
      const existing = s.cart.find((c) => c.itemId === itemId);
      if (existing) {
        existing.quantity += quantity;
        if (customization) existing.customization = customization;
      } else s.cart.push({ itemId, quantity, customization });
    });
  },
  updateCartItem(itemId: string, patch: Partial<CartItem>) {
    update((s) => {
      const item = s.cart.find((x) => x.itemId === itemId);
      if (!item) return;
      s.cart = s.cart.map((x) => (x.itemId === itemId ? { ...x, ...patch } : x));
    });
  },
  removeFromCart(itemId: string) {
    update((s) => {
      s.cart = s.cart.filter((c) => c.itemId !== itemId);
    });
  },
  setCartQty(itemId: string, quantity: number) {
    update((s) => {
      const c = s.cart.find((x) => x.itemId === itemId);
      if (!c) return;
      if (quantity <= 0) s.cart = s.cart.filter((x) => x.itemId !== itemId);
      else c.quantity = quantity;
    });
  },
  clearCart() {
    update((s) => {
      s.cart = [];
    });
  },
  toggleFavorite(itemId: string) {
    update((s) => {
      s.favorites = s.favorites.includes(itemId)
        ? s.favorites.filter((f) => f !== itemId)
        : [...s.favorites, itemId];
    });
  },
  placeOrder(o: Omit<Order, "id" | "createdAt" | "timeline" | "status"> & { status?: OrderStatus }): Order {
    const status: OrderStatus = o.status ?? (o.paymentMethod === "cash" ? "confirmed" : "pending_payment");
    const order: Order = {
      ...o,
      id: "MU-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      createdAt: Date.now(),
      status,
      timeline: [{ status, at: Date.now(), note: "Order placed" }],
    };
    update((s) => {
      s.orders.unshift(order);
      s.cart = [];
      s.loyaltyPoints += Math.floor(o.total / 10);
      s.notifications.unshift({
        id: crypto.randomUUID(),
        title: "Order placed 🎉",
        body: `Your order ${order.id} has been received.`,
        createdAt: Date.now(),
        read: false,
        kind: "order",
      });
    });
    return order;
  },
  setOrderStatus(id: string, status: OrderStatus, note?: string) {
    update((s) => {
      const o = s.orders.find((x) => x.id === id);
      if (!o) return;
      o.status = status;
      o.timeline.push({ status, at: Date.now(), note });
    });
  },
  toggleSoldOut(id: string) {
    update((s) => {
      const m = s.menu.find((x) => x.id === id);
      if (m) m.soldOut = !m.soldOut;
    });
  },
  updateMenuItem(id: string, patch: Partial<MenuItem>) {
    update((s) => {
      s.menu = s.menu.map((m) => (m.id === id ? { ...m, ...patch } : m));
    });
  },
  addReview(r: Omit<Review, "id" | "createdAt">) {
    update((s) => {
      s.reviews.unshift({ ...r, id: crypto.randomUUID(), createdAt: Date.now() });
    });
  },
  deleteReview(id: string) {
    update((s) => {
      s.reviews = s.reviews.filter((r) => r.id !== id);
    });
  },
  addCatering(c: Omit<CateringRequest, "id" | "createdAt" | "status">) {
    update((s) => {
      s.catering.unshift({
        ...c,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        status: "new",
      });
    });
  },
  setCateringStatus(id: string, status: CateringRequest["status"]) {
    update((s) => {
      const c = s.catering.find((x) => x.id === id);
      if (c) c.status = status;
    });
  },
  addDeliverySignup(d: Omit<DeliverySignup, "id" | "createdAt">) {
    update((s) => {
      s.deliverySignups.unshift({ ...d, id: crypto.randomUUID(), createdAt: Date.now() });
    });
  },
  setHours(h: BusinessHours) {
    update((s) => {
      s.hours = h;
    });
  },
  markNotificationsRead() {
    update((s) => {
      s.notifications = s.notifications.map((n) => ({ ...n, read: true }));
    });
  },
  clearAllData() {
    if (typeof window !== "undefined") localStorage.removeItem(KEY);
    state = initialState;
    emit();
  },
};

export function isOwner(email: string | null | undefined) {
  return !!email && email.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

export function isShopOpen(hours: BusinessHours, now = new Date()): boolean {
  if (!hours.days.includes(now.getDay())) return false;
  const [oh, om] = hours.open.split(":").map(Number);
  const [ch, cm] = hours.close.split(":").map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= oh * 60 + om && mins <= ch * 60 + cm;
}
