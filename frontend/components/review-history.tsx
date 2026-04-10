import type { Review } from "@/lib/api";

const DECISION_LABELS: Record<string, { text: string; className: string }> = {
  approve: { text: "Approved", className: "text-green-700" },
  reject: { text: "Rejected", className: "text-red-700" },
  request_changes: { text: "Requested Changes", className: "text-orange-700" },
};

export function ReviewHistory({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) {
    return (
      <p className="text-sm text-gray-500 italic">No reviews yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => {
        const config = DECISION_LABELS[review.decision];
        return (
          <div
            key={review.id}
            className="rounded-md border border-gray-200 p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {review.reviewer_name}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(review.created_at).toLocaleString()}
              </span>
            </div>
            <p className={`text-sm font-medium ${config.className}`}>
              {config.text}
            </p>
            {review.comment && (
              <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
