"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type DocumentDetail, type ReviewDecision } from "@/lib/api";

interface ReviewPanelProps {
  document: DocumentDetail;
}

export function ReviewPanel({ document: doc }: ReviewPanelProps) {
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<ReviewDecision>("approve");
  const [comment, setComment] = useState("");

  const reviewMutation = useMutation({
    mutationFn: (data: { decision: ReviewDecision; comment: string }) =>
      api.reviewDocument(doc.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", doc.id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setComment("");
    },
  });

  if (doc.status !== "pending_review") {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Submit Review
      </h3>

      <div className="space-y-3">
        <div className="flex gap-2">
          {(
            [
              ["approve", "Approve", "bg-green-600 hover:bg-green-700"],
              ["reject", "Reject", "bg-red-600 hover:bg-red-700"],
              [
                "request_changes",
                "Request Changes",
                "bg-orange-500 hover:bg-orange-600",
              ],
            ] as const
          ).map(([value, label, activeClass]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDecision(value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                decision === value
                  ? `${activeClass} text-white`
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />

        <button
          type="button"
          onClick={() => reviewMutation.mutate({ decision, comment })}
          disabled={reviewMutation.isPending}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
        </button>

        {reviewMutation.isError && (
          <p className="text-sm text-red-600">
            {(reviewMutation.error as Error).message}
          </p>
        )}
      </div>
    </div>
  );
}
