import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { CHEF, CHEF_PORTRAIT } from "@/lib/data";
import { actions, useAppState } from "@/lib/store";
import { Camera, Mail, Phone, Sparkles, Utensils, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/chef")({
  head: () => ({
    meta: [
      { title: "Chef John — JFlavors" },
      { name: "description", content: "The chef behind JFlavors: bio, philosophy and services." },
      { property: "og:title", content: "Chef John — JFlavors" },
      { property: "og:description", content: "Restaurant-trained street food from Chef John." },
    ],
  }),
  component: ChefPage,
});

function ChefPage() {
  const chefAvatar = useAppState((s) => s.chefAvatar);
  const fileRef = useRef<HTMLInputElement>(null);
  const avatar = chefAvatar ?? CHEF_PORTRAIT;

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      actions.setChefAvatar(String(reader.result));
      toast.success("Photo updated");
    };
    reader.readAsDataURL(file);
  }

  return (
    <AppShell>
      <div className="relative">
        <div className="h-64 bg-gradient-to-br from-ember/30 via-surface to-saffron/20" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative">
            <div className="size-36 overflow-hidden rounded-full border-4 border-background shadow-glow">
              <img
                src={avatar}
                alt={CHEF.name}
                width={768}
                height={768}
                className="h-full w-full object-cover"
              />
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="Upload chef photo"
              className="absolute bottom-1 right-1 flex size-10 items-center justify-center rounded-full sizzle text-primary-foreground shadow-glow active:scale-95"
            >
              <Camera className="size-4" />
            </button>
            {chefAvatar && (
              <button
                onClick={() => {
                  actions.setChefAvatar(null);
                  toast.success("Reset to default");
                }}
                aria-label="Reset photo"
                className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
              >
                <X className="size-3" />
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPick}
            />
          </div>
        </div>
      </div>

      <div className="space-y-8 px-5 py-6">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">The chef</p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold">{CHEF.name}</h1>
          <p className="mt-1 text-sm italic text-muted-foreground">"{CHEF.tagline}"</p>
        </div>

        <section className="rounded-3xl border border-border bg-surface p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bio</p>
          <p className="mt-2 text-sm leading-relaxed">{CHEF.bio}</p>
        </section>

        <section className="rounded-3xl sizzle p-5 text-primary-foreground shadow-glow">
          <Sparkles className="size-5" />
          <p className="mt-3 font-heading text-lg font-bold text-balance">
            "{CHEF.philosophy}"
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-lg font-bold">Services</h2>
          <div className="grid grid-cols-2 gap-2">
            {CHEF.services.map((s) => (
              <div
                key={s}
                className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-3 text-xs font-semibold"
              >
                <Utensils className="size-4 text-ember" />
                {s}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2 rounded-3xl border border-border bg-surface p-5">
          <h2 className="mb-2 font-heading text-lg font-bold">Contact</h2>
          <a
            href={`tel:${CHEF.contact.phone}`}
            className="flex items-center gap-3 rounded-xl bg-background p-3 text-sm"
          >
            <Phone className="size-4 text-ember" /> {CHEF.contact.phone}
          </a>
          <a
            href={`mailto:${CHEF.contact.email}`}
            className="flex items-center gap-3 rounded-xl bg-background p-3 text-sm"
          >
            <Mail className="size-4 text-ember" /> {CHEF.contact.email}
          </a>
        </section>

        <Link
          to="/catering"
          className="block w-full rounded-full sizzle py-4 text-center font-heading font-bold text-primary-foreground shadow-glow"
        >
          Book Chef John
        </Link>
      </div>
    </AppShell>
  );
}
