import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { actions } from "@/lib/store";
import { Flame, QrCode, Sparkles, ChefHat, Trophy } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to MUNCH" },
      { name: "description", content: "Scan, order, and enjoy Chef John's kibanda." },
    ],
  }),
  component: Onboarding,
});

const slides = [
  {
    icon: QrCode,
    title: "Welcome to the JFlavors",
    body: "You scanned. You're in. No install, no signup, no friction.",
  },
  {
    icon: Sparkles,
    title: "An AI that knows the menu",
    body: "Ask, or shake the pan. It'll pick something perfect.",
  },
  {
    icon: ChefHat,
    title: "Meet Chef John",
    body: "Restaurant-trained. Kibanda-priced. Every bhajia hand-cut.",
  },
  {
    icon: Trophy,
    title: "Earn as you eat",
    body: "1 point per KES 10 spent. Cash in for rewards.",
  },
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const S = slides[step];
  const Icon = S.icon;

  function next() {
    if (step < slides.length - 1) setStep(step + 1);
    else {
      actions.setOnboarded();
      navigate({ to: "/" });
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[440px] flex-col bg-background px-6 py-12">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl sizzle">
          <Flame className="size-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="font-heading text-lg font-extrabold">MUNCH</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div key={step} className="animate-rise flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 sizzle rounded-3xl blur-2xl opacity-60" />
            <div className="relative flex size-24 items-center justify-center rounded-3xl sizzle shadow-glow">
              <Icon className="size-11 text-primary-foreground" strokeWidth={2} />
            </div>
          </div>
          <h1 className="mt-8 font-heading text-3xl font-extrabold text-balance">{S.title}</h1>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{S.body}</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-8 bg-ember" : "w-1.5 bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={next}
          className="w-full rounded-full sizzle py-4 font-heading text-base font-bold text-primary-foreground shadow-glow"
        >
          {step < slides.length - 1 ? "Continue" : "Enter the kibanda"}
        </button>
        <button
          onClick={() => {
            actions.setOnboarded();
            navigate({ to: "/" });
          }}
          className="rounded-full py-3 text-xs font-semibold text-muted-foreground"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
