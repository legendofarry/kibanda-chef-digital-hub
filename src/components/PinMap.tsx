// Modern animated location picker without a real map SDK.
// The pin is draggable within the plate; coordinates are simulated but real-feeling
// (Nairobi lat/lng anchor). Swap for Google Maps when a key is wired.
import { useRef, useState } from "react";
import { MapPin, LocateFixed } from "lucide-react";

const ANCHOR = { lat: -1.286389, lng: 36.817223 }; // Nairobi CBD
const SPAN = 0.02; // ~2km

export interface PinCoords {
  lat: number;
  lng: number;
}

export function PinMap({
  value,
  onChange,
}: {
  value: PinCoords | null;
  onChange: (c: PinCoords) => void;
}) {
  const plateRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [dragging, setDragging] = useState(false);

  function setFromEvent(clientX: number, clientY: number) {
    const el = plateRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setPos({ x, y });
    onChange({
      lat: ANCHOR.lat + (0.5 - y) * SPAN,
      lng: ANCHOR.lng + (x - 0.5) * SPAN,
    });
  }

  function autoPin() {
    const x = 0.5 + (Math.random() - 0.5) * 0.4;
    const y = 0.5 + (Math.random() - 0.5) * 0.4;
    setPos({ x, y });
    onChange({
      lat: ANCHOR.lat + (0.5 - y) * SPAN,
      lng: ANCHOR.lng + (x - 0.5) * SPAN,
    });
  }

  const coords = value ?? {
    lat: ANCHOR.lat + (0.5 - pos.y) * SPAN,
    lng: ANCHOR.lng + (pos.x - 0.5) * SPAN,
  };

  return (
    <div className="space-y-3">
      <div
        ref={plateRef}
        onPointerDown={(e) => {
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromEvent(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (dragging) setFromEvent(e.clientX, e.clientY);
        }}
        onPointerUp={() => setDragging(false)}
        className="relative aspect-[4/3] w-full cursor-crosshair touch-none overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-950/40 via-surface to-amber-950/30"
      >
        {/* stylised streets */}
        <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 75">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect width="100" height="75" fill="url(#grid)" className="text-foreground/20" />
          <path
            d="M0 40 Q30 30 50 45 T100 35"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            className="text-ember/60"
          />
          <path
            d="M25 0 L28 75"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-saffron/40"
          />
          <path
            d="M70 0 L65 75"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-saffron/40"
          />
        </svg>

        {/* pin */}
        <div
          className="absolute -translate-x-1/2 -translate-y-full transition-transform"
          style={{
            left: `${pos.x * 100}%`,
            top: `${pos.y * 100}%`,
            transitionDuration: dragging ? "0ms" : "300ms",
          }}
        >
          <div className="relative">
            <div className="absolute inset-x-0 bottom-0 mx-auto h-2 w-4 rounded-full bg-black/40 blur-sm" />
            <div
              className={`relative flex size-10 items-center justify-center rounded-full sizzle text-primary-foreground shadow-glow ${
                dragging ? "scale-110" : "animate-float"
              }`}
            >
              <MapPin className="size-5" fill="currentColor" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-2 left-2 rounded-full bg-background/70 px-3 py-1 text-[10px] font-mono backdrop-blur">
          {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={autoPin}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-surface-2 px-4 py-3 text-sm font-semibold"
        >
          <LocateFixed className="size-4" /> Auto-pin my spot
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Drag the pin or auto-pin. This is the location we'll deliver to.
      </p>
    </div>
  );
}
