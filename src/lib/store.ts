// Lightweight reactive local-storage store. Repository-pattern friendly so it
// can be swapped for a cloud backend later without changing UI code.
import { useSyncExternalStore } from "react";
import type { MenuItem, BusinessHours } from "./data";
import { SEED_MENU, DEFAULT_HOURS, OWNER_EMAIL } from "./data";

const KEY = "jflavors.state.v1";

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
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

export type OrderType = "delivery" | "pickup";

export interface Order {
  id: string;
  userId: string | null;
  guestName?: string;
  guestPhone?: string;
  orderType: OrderType;
  items: { itemId: string; name: string; price: number; quantity: number }[];
  total: number;
  paymentMethod: "cash" | "mpesa" | "airtel";
  paymentScreenshot?: string;
  status: OrderStatus;
  createdAt: number;
  location?: {
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
  chefAvatar: string | null;
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
      text: "Chef John actually knows his craft. This isn't a normal kibanda.",
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
  chefAvatar: null,
};

type Listener = () => void;
const listeners = new Set<Listener>();
let state: AppState = initialState;

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Always use fresh SEED_MENU so image imports resolve to current bundle URLs.
      state = { ...initialState, ...parsed, menu: SEED_MENU };
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

// Immutable setter — always produces a new top-level state so
// useSyncExternalStore sees changed snapshots.
function set(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  ensureHydrated();
  const next = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...next };
  emit();
}

export const actions = {
  setOnboarded() {
    set({ hasOnboarded: true });
  },
  signIn(input: { username: string; fullName: string; email: string; avatar: string }) {
    set({
      user: {
        id: crypto.randomUUID(),
        username: input.username,
        fullName: input.fullName,
        email: input.email.toLowerCase(),
        avatar: input.avatar,
        createdAt: Date.now(),
        biometricEnabled: false,
        biometricAsked: false,
      },
    });
  },
  signOut() {
    set({ user: null, cart: [] });
  },
  updateUser(patch: Partial<User>) {
    set((s) => (s.user ? { user: { ...s.user, ...patch } } : {}));
  },
  addToCart(itemId: string, quantity = 1, customization?: CartCustomization) {
    set((s) => {
      const existing = s.cart.find((c) => c.itemId === itemId);
      if (existing) {
        return {
          cart: s.cart.map((c) =>
            c.itemId === itemId
              ? { ...c, quantity: c.quantity + quantity, customization: customization ?? c.customization }
              : c,
          ),
        };
      }
      return { cart: [...s.cart, { itemId, quantity, customization }] };
    });
  },
  // Upsert — used from item detail Edit/Add screen so re-submitting an item
  // that is already in the cart replaces its quantity + customization
  // instead of stacking another line.
  upsertCartItem(itemId: string, quantity: number, customization?: CartCustomization) {
    set((s) => {
      const exists = s.cart.some((c) => c.itemId === itemId);
      if (exists) {
        return {
          cart: s.cart.map((c) =>
            c.itemId === itemId ? { ...c, quantity, customization } : c,
          ),
        };
      }
      return { cart: [...s.cart, { itemId, quantity, customization }] };
    });
  },
  updateCartItem(itemId: string, patch: Partial<CartItem>) {
    set((s) => ({
      cart: s.cart.map((c) => (c.itemId === itemId ? { ...c, ...patch } : c)),
    }));
  },
  removeFromCart(itemId: string) {
    set((s) => ({ cart: s.cart.filter((c) => c.itemId !== itemId) }));
  },
  setCartQty(itemId: string, quantity: number) {
    set((s) => {
      if (quantity <= 0) return { cart: s.cart.filter((c) => c.itemId !== itemId) };
      return {
        cart: s.cart.map((c) => (c.itemId === itemId ? { ...c, quantity } : c)),
      };
    });
  },
  clearCart() {
    set({ cart: [] });
  },
  toggleFavorite(itemId: string) {
    set((s) => ({
      favorites: s.favorites.includes(itemId)
        ? s.favorites.filter((f) => f !== itemId)
        : [...s.favorites, itemId],
    }));
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
    set((s) => ({
      orders: [order, ...s.orders],
      cart: [],
      loyaltyPoints: s.loyaltyPoints + Math.floor(o.total / 10),
      notifications: [
        {
          id: crypto.randomUUID(),
          title: "Order placed 🎉",
          body: `Your order ${order.id} has been received.`,
          createdAt: Date.now(),
          read: false,
          kind: "order",
        },
        ...s.notifications,
      ],
    }));
    return order;
  },
  setOrderStatus(id: string, status: OrderStatus, note?: string) {
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id
          ? { ...o, status, timeline: [...o.timeline, { status, at: Date.now(), note }] }
          : o,
      ),
    }));
  },
  toggleSoldOut(id: string) {
    set((s) => ({
      menu: s.menu.map((m) => (m.id === id ? { ...m, soldOut: !m.soldOut } : m)),
    }));
  },
  updateMenuItem(id: string, patch: Partial<MenuItem>) {
    set((s) => ({ menu: s.menu.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
  },
  addReview(r: Omit<Review, "id" | "createdAt">) {
    set((s) => ({
      reviews: [{ ...r, id: crypto.randomUUID(), createdAt: Date.now() }, ...s.reviews],
    }));
  },
  deleteReview(id: string) {
    set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) }));
  },
  addCatering(c: Omit<CateringRequest, "id" | "createdAt" | "status">) {
    set((s) => ({
      catering: [
        { ...c, id: crypto.randomUUID(), createdAt: Date.now(), status: "new" as const },
        ...s.catering,
      ],
    }));
  },
  setCateringStatus(id: string, status: CateringRequest["status"]) {
    set((s) => ({
      catering: s.catering.map((c) => (c.id === id ? { ...c, status } : c)),
    }));
  },
  addDeliverySignup(d: Omit<DeliverySignup, "id" | "createdAt">) {
    set((s) => ({
      deliverySignups: [
        { ...d, id: crypto.randomUUID(), createdAt: Date.now() },
        ...s.deliverySignups,
      ],
    }));
  },
  setHours(h: BusinessHours) {
    set({ hours: h });
  },
  markNotificationsRead() {
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  },
  setChefAvatar(dataUrl: string | null) {
    set({ chefAvatar: dataUrl });
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
