// Google Maps location picker with a custom animated JFlavors pin.
// Falls back to a stylised SVG plate if the browser key isn't wired.
import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";

const ANCHOR = { lat: -1.286389, lng: 36.817223 }; // Nairobi CBD

export interface PinCoords {
  lat: number;
  lng: number;
}

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as
  | string
  | undefined;
const CHANNEL = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as
  | string
  | undefined;

// Cache the loader promise so multiple mounts share one script tag.
let mapsPromise: Promise<typeof google> | null = null;
function loadMaps(): Promise<typeof google> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google);
  if (mapsPromise) return mapsPromise;
  if (!BROWSER_KEY) return Promise.reject(new Error("no-key"));

  mapsPromise = new Promise((resolve, reject) => {
    const cbName = "__jflavorsMapsReady";
    (window as any)[cbName] = () => resolve((window as any).google);
    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: BROWSER_KEY,
      loading: "async",
      callback: cbName,
      libraries: "marker",
    });
    if (CHANNEL) params.set("channel", CHANNEL);
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => reject(new Error("maps-load-failed"));
    document.head.appendChild(script);
  });
  return mapsPromise;
}

// Dark theme styles to match the app.
const NIGHT_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1210" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1210" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a6a5a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a1a15" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#3a231c" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#4a2a1f" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0605" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#221510" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#3a231c" }] },
];

export function PinMap({
  value,
  onChange,
}: {
  value: PinCoords | null;
  onChange: (c: PinCoords) => void;
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [coords, setCoords] = useState<PinCoords>(value ?? ANCHOR);
  const [bounce, setBounce] = useState(false);

  // init map
  useEffect(() => {
    let cancelled = false;
    loadMaps()
      .then((g) => {
        if (cancelled || !mapDivRef.current) return;
        const start = value ?? ANCHOR;
        const map = new g.maps.Map(mapDivRef.current, {
          center: start,
          zoom: 16,
          disableDefaultUI: true,
          gestureHandling: "greedy",
          clickableIcons: false,
          styles: NIGHT_STYLES,
          backgroundColor: "#1a1210",
        });
        const marker = new g.maps.Marker({
          map,
          position: start,
          draggable: true,
          // Custom SVG pin styled in ember/saffron
          icon: {
            url:
              "data:image/svg+xml;utf-8," +
              encodeURIComponent(
                `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='72' viewBox='0 0 56 72'>
                  <defs>
                    <radialGradient id='g' cx='50%' cy='40%' r='55%'>
                      <stop offset='0%' stop-color='#ffb347'/>
                      <stop offset='55%' stop-color='#f97316'/>
                      <stop offset='100%' stop-color='#c2410c'/>
                    </radialGradient>
                    <filter id='s' x='-50%' y='-50%' width='200%' height='200%'>
                      <feGaussianBlur stdDeviation='2'/>
                    </filter>
                  </defs>
                  <ellipse cx='28' cy='66' rx='10' ry='3' fill='#000' opacity='.45' filter='url(#s)'/>
                  <path d='M28 4 C14 4 4 14 4 27 C4 43 24 60 28 64 C32 60 52 43 52 27 C52 14 42 4 28 4 Z'
                    fill='url(#g)' stroke='#fff' stroke-width='2'/>
                  <circle cx='28' cy='26' r='8' fill='#1a1210'/>
                  <circle cx='28' cy='26' r='4' fill='#fbbf24'/>
                </svg>`,
              ),
            scaledSize: new g.maps.Size(48, 62),
            anchor: new g.maps.Point(24, 60),
          },
          animation: g.maps.Animation.DROP,
        });

        function commit(pos: google.maps.LatLng | null | undefined) {
          if (!pos) return;
          const c = { lat: pos.lat(), lng: pos.lng() };
          setCoords(c);
          onChange(c);
        }

        marker.addListener("dragend", () => commit(marker.getPosition()));
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          marker.setPosition(e.latLng);
          map.panTo(e.latLng);
          setBounce(true);
          setTimeout(() => setBounce(false), 400);
          commit(e.latLng);
        });

        mapRef.current = map;
        markerRef.current = marker;
        setReady(true);
        // fire initial commit so parent gets coords
        onChange(start);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function autoPin() {
    if (!navigator.geolocation) {
      // Same simulated jitter fallback as before
      const jitter = {
        lat: ANCHOR.lat + (Math.random() - 0.5) * 0.01,
        lng: ANCHOR.lng + (Math.random() - 0.5) * 0.01,
      };
      applyCoords(jitter);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => applyCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () =>
        applyCoords({
          lat: ANCHOR.lat + (Math.random() - 0.5) * 0.01,
          lng: ANCHOR.lng + (Math.random() - 0.5) * 0.01,
        }),
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }

  function applyCoords(c: PinCoords) {
    setCoords(c);
    onChange(c);
    if (markerRef.current && mapRef.current) {
      const pos = new google.maps.LatLng(c.lat, c.lng);
      markerRef.current.setPosition(pos);
      mapRef.current.panTo(pos);
      mapRef.current.setZoom(17);
      setBounce(true);
      setTimeout(() => setBounce(false), 400);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface">
        {/* real google map layer */}
        <div ref={mapDivRef} className="absolute inset-0" />

        {/* loading / fallback overlay */}
        {!ready && !failed && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-950/50 via-surface to-amber-950/40">
            <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
              <div className="size-8 animate-spin rounded-full border-2 border-ember border-t-transparent" />
              Loading map…
            </div>
          </div>
        )}
        {failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-950/50 via-surface to-amber-950/40 p-4 text-center text-xs text-muted-foreground">
            <MapPin className="size-6 text-ember" />
            Map unavailable — coordinates still work below.
          </div>
        )}

        {/* pulsing accuracy ring on top of map */}
        {ready && (
          <div
            className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform ${
              bounce ? "scale-110" : "scale-100"
            }`}
          />
        )}

        <div className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-background/80 px-3 py-1 text-[10px] font-mono backdrop-blur">
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
        Drag the pin or tap the map. This is the location we'll deliver to.
      </p>
    </div>
  );
}
