import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { chatWithMunch } from "@/lib/ai.functions";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "JFlavors AI Assistant" },
      { name: "description", content: "Ask JFlavors's AI about the menu, prices, catering and more." },
    ],
  }),
  component: AiChat,
});

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What's the crispest thing today?",
  "Something vegetarian?",
  "How does catering work?",
  "What's on promo?",
];

function AiChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hey 👋 I'm JFlavors — your AI food buddy. Ask about the menu, prices, chef, catering, loyalty or how to order. I've got you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatFn = useServerFn(chatWithMunch);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await chatFn({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI unavailable");
      setMessages(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <header className="flex items-center gap-3 px-5 pt-6">
        <Link
          to="/"
          className="flex size-9 items-center justify-center rounded-full border border-border bg-surface"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl sizzle shadow-glow">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-heading text-lg font-extrabold leading-none">JFlavors AI</p>
            <p className="text-[10px] text-muted-foreground">Your kibanda concierge</p>
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="mt-4 max-h-[calc(100vh-16rem)] space-y-3 overflow-y-auto px-5"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-rise`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "sizzle text-primary-foreground shadow-glow"
                  : "border border-border bg-surface"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 px-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-2 rounded-full bg-ember animate-sizzle-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
            <span className="text-xs text-muted-foreground">Thinking...</span>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="mt-4 flex flex-wrap gap-2 px-5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="fixed inset-x-0 bottom-20 z-30 mx-auto max-w-[440px] px-5"
      >
        <div className="flex items-center gap-2 rounded-full glass p-1.5 shadow-lift">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask JFlavors..."
            className="flex-1 bg-transparent px-3 text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex size-10 items-center justify-center rounded-full sizzle text-primary-foreground shadow-glow disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </AppShell>
  );
}
