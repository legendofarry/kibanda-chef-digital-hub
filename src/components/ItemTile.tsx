import { useNavigate } from "@tanstack/react-router";
import { Flame, Sparkles } from "lucide-react";
import { useState } from "react";
import type { MenuItem } from "@/lib/data";

export function ItemTile({ item }: { item: MenuItem }) {
  const navigate = useNavigate();
  const [isCooking, setIsCooking] = useState(false);

  function handleTap() {
    if (item.soldOut) return;
    setIsCooking(true);
    window.setTimeout(() => {
      navigate({ to: "/menu/$id", params: { id: item.id } });
    }, 780);
  }

  return (
    <button
      type="button"
      onClick={handleTap}
      className={`group relative block overflow-hidden rounded-[28px] border border-white/10 bg-surface/70 text-left shadow-[0_20px_50px_-24px_rgba(0,0,0,0.75)] transition-all duration-300 hover:-translate-y-1 hover:border-ember/50 hover:shadow-[0_24px_60px_-24px_rgba(255,132,67,0.45)] ${
        item.soldOut ? "opacity-70" : ""
      }`}
    >
      <div className={`relative aspect-[4/4.5] bg-gradient-to-br ${item.bg} overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_45%)]" />
        <div className="absolute left-3 top-3 rounded-full bg-background/70 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-foreground backdrop-blur-sm">
          {item.category}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-black/35 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-sm">
          Tap to plate
        </div>

        <div className="absolute inset-0 grid place-items-center">
          <span
            className={`block text-6xl transition-all duration-500 ${
              isCooking ? "animate-pan-flip" : "group-hover:scale-110 group-hover:-rotate-3"
            } ${item.soldOut ? "grayscale" : ""}`}
          >
            {item.emoji}
          </span>
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-2xl bg-black/35 px-3 py-2 text-[10px] font-semibold text-white backdrop-blur-md">
          <span className="flex items-center gap-1">
            <Sparkles className="size-3.5" />
            {item.new ? "New drop" : item.popular ? "Chef pick" : "Fresh"}
          </span>
          <span className="font-heading text-sm font-extrabold text-saffron">KES {item.price}</span>
        </div>

        {item.soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-background/65 backdrop-blur-sm">
            <span className="rounded-full border border-border bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em]">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.name}</p>
          <span className="shrink-0 rounded-full bg-ember/12 px-2 py-0.5 text-[11px] font-bold text-ember">
            {item.popular ? "Hot" : "Ready"}
          </span>
        </div>
        <p className="line-clamp-2 text-[11px] leading-4 text-muted-foreground">{item.description}</p>
      </div>
    </button>
  );
}
