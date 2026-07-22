import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppState, actions } from "@/lib/store";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — MUNCH" },
      { name: "description", content: "What the neighbourhood is saying about MUNCH." },
    ],
  }),
  component: Reviews,
});

function Reviews() {
  const reviews = useAppState((s) => s.reviews);
  const user = useAppState((s) => s.user);
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  function submit() {
    if (!user) {
      toast.info("Sign in to leave a review");
      navigate({ to: "/auth" });
      return;
    }
    if (!text.trim()) {
      toast.error("Write a few words");
      return;
    }
    actions.addReview({
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      rating,
      foodRating: rating,
      serviceRating: rating,
      text: text.trim(),
      photos: [],
    });
    setText("");
    toast.success("Thanks — review posted");
  }

  return (
    <AppShell>
      <header className="px-5 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ember">Reviews</p>
        <h1 className="font-heading text-3xl font-extrabold">
          {avg} <span className="text-lg text-muted-foreground">/ 5</span>
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">{reviews.length} reviews</p>
      </header>

      <section className="mt-6 space-y-3 px-5">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => setRating(i)}
                aria-label={`${i} stars`}
              >
                <Star
                  className={`size-6 ${
                    i <= rating ? "fill-saffron text-saffron" : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={user ? "How was it?" : "Sign in to review..."}
            rows={3}
            className="w-full rounded-xl bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={submit}
            className="mt-2 w-full rounded-full sizzle py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
          >
            Post review
          </button>
        </div>
      </section>

      <ul className="mt-4 space-y-3 px-5 pb-6">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-surface-2 text-lg">
                {r.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">@{r.username}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3 ${
                        i < r.rating ? "fill-saffron text-saffron" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {user?.id === r.userId && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-muted-foreground">
                      <Trash2 className="size-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this review?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This can't be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          actions.deleteReview(r.id);
                          toast.success("Deleted");
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <p className="mt-3 text-sm">{r.text}</p>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
