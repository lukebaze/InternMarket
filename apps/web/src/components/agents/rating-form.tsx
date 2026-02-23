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
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
        Thanks for your review! Your rating has been submitted.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star picker */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-2">Your rating</p>
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
              <span className={(hovered || score) >= star ? "text-yellow-400" : "text-gray-200"}>
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Review textarea */}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block" htmlFor="review-text">
          Review <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="review-text"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Share your experience with this agent..."
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending || score === 0}
        className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
