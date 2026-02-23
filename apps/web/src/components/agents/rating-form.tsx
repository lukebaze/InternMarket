"use client";
import { useState, useTransition } from "react";
import { submitRating } from "@/lib/actions/rating-actions";

interface RatingFormProps {
  agentId: string;
  onSuccess?: () => void;
}

export function RatingForm({ agentId, onSuccess }: RatingFormProps) {
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (score === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await submitRating(agentId, score, review || undefined);
        setSuccess(true);
        onSuccess?.();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to submit rating");
      }
    });
  }

  if (success) {
    return (
      <div className="bg-lime/10 border border-lime/30 p-4 font-mono text-sm text-lime">
        Thanks for your review! Your rating has been submitted.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="font-mono text-xs font-medium text-text-secondary mb-2">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setScore(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-2xl transition-transform hover:scale-110 focus:outline-none"
              aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            >
              <span className={(hovered || score) >= star ? "text-lime" : "text-text-muted"}>
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="font-mono text-xs font-medium text-text-secondary mb-1 block" htmlFor="review-text">
          Review <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <textarea
          id="review-text"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Share your experience with this agent..."
          className="w-full bg-bg-surface border border-bg-border px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-text-muted focus:outline-none resize-none"
        />
      </div>

      {error && <p className="font-mono text-xs text-red-error">{error}</p>}

      <button
        type="submit"
        disabled={isPending || score === 0}
        className="px-4 py-2 bg-lime text-black font-mono text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
