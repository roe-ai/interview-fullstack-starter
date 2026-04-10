"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/status-badge";
import { ReviewPanel } from "@/components/review-panel";
import { ReviewHistory } from "@/components/review-history";

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const documentId = parseInt(id, 10);

  const { data: doc, isLoading } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => api.getDocument(documentId),
  });

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (!doc) {
    return <div className="text-sm text-red-600">Document not found.</div>;
  }

  return (
    <div>
      <Link
        href="/"
        className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
      >
        &larr; Back to documents
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-lg font-semibold text-gray-900">
                {doc.title}
              </h1>
              <StatusBadge status={doc.status} />
            </div>

            <div className="flex gap-4 text-xs text-gray-500 mb-4">
              <span>By {doc.author_name}</span>
              {doc.reviewer_name && (
                <span>Reviewer: {doc.reviewer_name}</span>
              )}
              <span>
                Updated {new Date(doc.updated_at).toLocaleDateString()}
              </span>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700">
              <p>{doc.content}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <ReviewPanel document={doc} />

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Review History
            </h3>
            <ReviewHistory reviews={doc.reviews} />
          </div>
        </div>
      </div>
    </div>
  );
}
