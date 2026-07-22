import { Link } from "@tanstack/react-router";
import type { MenuItem } from "@/lib/data";

export function ItemTile({ item }: { item: MenuItem }) {
  return (
    <Link
      to="/menu/$id"
      params={{ id: item.id }}
      className={`group relative block overflow-hidden rounded-3xl border border-border ${
        item.soldOut ? "opacity-70" : ""
      }`}
    >
      <div className={`aspect-square bg-gradient-to-br ${item.bg} relative`}>
        <div className="absolute inset-0 grid place-items-center text-6xl transition-transform duration-500 group-hover:scale-110">
          <span className={item.soldOut ? "grayscale" : ""}>{item.emoji}</span>
        </div>
        {item.new && (
          <span className="absolute left-3 top-3 rounded-full bg-saffron px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary-foreground">
            New
          </span>
        )}
        {item.popular && !item.new && (
          <span className="absolute left-3 top-3 rounded-full bg-ember/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary-foreground">
            Popular
          </span>
        )}
        {item.soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-sm">
            <span className="rounded-full border border-border bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 text-sm font-semibold">{item.name}</p>
          <span className="shrink-0 font-heading text-sm font-bold text-saffron">
            {item.price}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
          {item.description}
        </p>
      </div>
    </Link>
  );
}
