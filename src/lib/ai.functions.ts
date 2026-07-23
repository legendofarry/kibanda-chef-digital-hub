import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { chatCompletion } from "./ai-gateway.server";
import { SEED_MENU, CHEF, PROMOS, DEFAULT_HOURS } from "./data";

const buildContext = () => `
You are JFlavors's in-app AI assistant — a knowledgeable digital employee for a Nairobi kibanda run by ${CHEF.name}. You help customers with menu, ordering, chef info, catering, loyalty and navigation. Be warm, concise, and use Kenyan-English cadence where natural (never forced). Prices are in KES.

MENU (JSON): ${JSON.stringify(SEED_MENU.map((m) => ({ id: m.id, name: m.name, price: m.price, category: m.category, description: m.description, ingredients: m.ingredients, soldOut: !!m.soldOut })))}

CHEF: ${JSON.stringify({ name: CHEF.name, tagline: CHEF.tagline, bio: CHEF.bio, philosophy: CHEF.philosophy, services: CHEF.services, contact: CHEF.contact })}

PROMOS: ${JSON.stringify(PROMOS)}
HOURS: ${DEFAULT_HOURS.open}–${DEFAULT_HOURS.close}, most days.
LOYALTY: Customers earn 1 point per KES 10 spent. Rewards unlock at 500 pts.
PAYMENTS: Cash, M-Pesa, or Airtel Money. For M-Pesa/Airtel, customers pay to the business number and upload a screenshot in-app.
CATERING: Users can submit a request from the Catering tab.
NAVIGATION: Home /, Menu /menu, Cart /cart, Orders /orders, Chef /chef, Catering /catering, Loyalty /loyalty, Reviews /reviews, Merch /merch, Profile /profile, AI /ai.

Rules:
- Recommend items only from the menu above. Never invent items.
- If an item is soldOut, say so and suggest an alternative.
- Keep replies short (2–5 sentences) unless a list is asked for.
- If asked to place an order, guide them to add to cart and check out.
`;

const ChatInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(30),
});

export const chatWithMunch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ChatInput.parse(d))
  .handler(async ({ data }) => {
    const reply = await chatCompletion({
      system: buildContext(),
      messages: data.messages,
    });
    return { reply };
  });

const RecommendInput = z.object({
  mood: z.string().max(100).optional(),
});

export const sizzleSuggestion = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => RecommendInput.parse(d))
  .handler(async ({ data }) => {
    const reply = await chatCompletion({
      system: `You are JFlavors's AI chef. Given the mood/context, recommend ONE menu item and explain why in 1 short sentence (max 20 words). Reply ONLY as JSON: {"itemId":"<id>","reason":"<one sentence>"}. Menu: ${JSON.stringify(SEED_MENU.filter((m) => !m.soldOut).map((m) => ({ id: m.id, name: m.name, description: m.description })))}`,
      messages: [
        {
          role: "user",
          content: `Suggest something perfect right now. Mood/context: ${data.mood ?? "surprise me — it's a normal Nairobi afternoon"}.`,
        },
      ],
    });
    try {
      const clean = reply
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(clean) as { itemId: string; reason: string };
      return parsed;
    } catch {
      const fallback = SEED_MENU.find((m) => !m.soldOut)!;
      return { itemId: fallback.id, reason: "Crisp, hot and always a good call." };
    }
  });
