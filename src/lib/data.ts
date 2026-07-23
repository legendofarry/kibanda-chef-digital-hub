// Static seed data + types + business config.
// Owner detection: change OWNER_EMAIL to grant dashboard access.
export const OWNER_EMAIL = "karimiarrison@gmail.com";
export const BUSINESS_PAYMENT_NUMBER = "0712 345 678";

export type MenuCategory = "bhajia" | "smokies" | "samosas" | "sides" | "drinks";

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  ingredients: string[];
  emoji: string;
  bg: string; // gradient class
  soldOut?: boolean;
  featured?: boolean;
  popular?: boolean;
  new?: boolean;
}

export const SEED_MENU: MenuItem[] = [
  {
    id: "bhajia-classic",
    name: "Kibanda Classic Bhajia",
    category: "bhajia",
    price: 80,
    description: "Hand-cut potato, double-fried in seasoned oil, tossed with masala salt.",
    ingredients: ["Potato", "Gram flour", "Cumin", "Turmeric", "Fresh coriander"],
    emoji: "🥔",
    bg: "from-amber-500/40 to-orange-700/40",
    featured: true,
    popular: true,
  },
  {
    id: "bhajia-chili",
    name: "Smoky Chili Bhajia",
    category: "bhajia",
    price: 120,
    description: "House-fire dip on the side. Not for the faint-hearted.",
    ingredients: ["Potato", "Bird's eye chili", "Tamarind", "Garlic"],
    emoji: "🌶️",
    bg: "from-red-500/40 to-orange-800/40",
    popular: true,
  },
  {
    id: "smokey-classic",
    name: "Flame Smokey",
    category: "smokies",
    price: 60,
    description: "Char-grilled beef sausage with fresh kachumbari.",
    ingredients: ["Beef sausage", "Onion", "Tomato", "Coriander", "Lime"],
    emoji: "🌭",
    bg: "from-rose-500/40 to-amber-700/40",
    featured: true,
  },
  {
    id: "smokey-deluxe",
    name: "Smokey Deluxe",
    category: "smokies",
    price: 90,
    description: "Wood-fired smokey wrapped in fresh chapati with kachumbari.",
    ingredients: ["Beef sausage", "Chapati", "Kachumbari", "House sauce"],
    emoji: "🔥",
    bg: "from-orange-600/40 to-red-800/40",
    new: true,
    popular: true,
  },
  {
    id: "samosa-beef",
    name: "Beef Samosa",
    category: "samosas",
    price: 50,
    description: "Crisp pastry, spiced minced beef, folded fresh.",
    ingredients: ["Beef", "Onion", "Garam masala", "Coriander"],
    emoji: "🥟",
    bg: "from-yellow-500/40 to-amber-700/40",
    popular: true,
  },
  {
    id: "samosa-veg",
    name: "Vegetable Samosa",
    category: "samosas",
    price: 40,
    description: "Peas, potato and warm spices in a golden shell.",
    ingredients: ["Potato", "Peas", "Cumin", "Ginger"],
    emoji: "🥟",
    bg: "from-lime-500/40 to-emerald-700/40",
    soldOut: true,
  },
  {
    id: "kachumbari",
    name: "Fresh Kachumbari",
    category: "sides",
    price: 30,
    description: "Cold, bright, and spicy. The perfect sidekick.",
    ingredients: ["Tomato", "Red onion", "Lime", "Chili", "Coriander"],
    emoji: "🥗",
    bg: "from-emerald-500/40 to-teal-700/40",
  },
  {
    id: "chai",
    name: "Masala Chai",
    category: "drinks",
    price: 40,
    description: "Slow-brewed on a jiko. Cardamom, ginger, black tea.",
    ingredients: ["Black tea", "Milk", "Cardamom", "Ginger", "Cinnamon"],
    emoji: "☕",
    bg: "from-amber-700/40 to-stone-800/40",
    new: true,
  },
];

export interface BusinessHours {
  open: string; // "HH:MM"
  close: string;
  days: number[]; // 0=Sun..6=Sat
}

export const DEFAULT_HOURS: BusinessHours = {
  open: "07:00",
  close: "22:00",
  days: [1, 2, 3, 4, 5, 6, 0],
};

export const CHEF = {
  name: "John",
  tagline: "Street food, elevated.",
  bio: "Trained across Nairobi's finest kitchens, I bring restaurant technique to the kibanda counter. Every bhajia is hand-cut. Every smokey is fired to order.",
  journey: [
    { year: "2015", event: "Apprenticeship at Tamarind Nairobi" },
    { year: "2018", event: "Sous chef, Hemingways Nairobi" },
    { year: "2021", event: "Head chef, private events, Karen" },
    { year: "2024", event: "Opened Kibanda JFlavors" },
  ],
  certifications: ["City & Guilds Culinary Arts", "HACCP Food Safety Level 3"],
  philosophy:
    "Great food doesn't need a linen tablecloth. It needs heat, honesty, and hands that care.",
  services: ["Private chef", "Corporate lunches", "Weddings", "Cocktail catering"],
  contact: { phone: "+254 712 345 678", email: "chef@jflavors.co.ke" },
};

export const PROMOS = [
  {
    id: "p1",
    title: "Double Bhajia Tuesdays",
    subtitle: "Buy one classic, get one 50% off. Every Tuesday.",
    accent: "ember",
  },
  {
    id: "p2",
    title: "Late Night Smokies",
    subtitle: "After 8pm, all smokies come with free kachumbari.",
    accent: "saffron",
  },
];

export const MERCH_TEASERS = [
  { id: "m1", name: "JFlavors House Sauce", price: 350, emoji: "🍾" },
  { id: "m2", name: "Kibanda Apron", price: 1200, emoji: "🧑‍🍳" },
  { id: "m3", name: "Signature Tee", price: 1500, emoji: "👕" },
];

export const AVATARS = ["👨‍🍳", "🧑‍🍳", "🔥", "🌶️", "🥟", "☕", "🍲", "🌭"];
