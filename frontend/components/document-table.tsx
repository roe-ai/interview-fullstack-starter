"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StatusBadge } from "./status-badge";

export function DocumentTable() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: api.listDocuments,
  });

  if (isLoading) {
    return <div className="text-sm text-gray-500 p-4">Loading documents...</div>;
  }

  if (!documents?.length) {
    return <div className="text-sm text-gray-500 p-4">No documents yet.</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reviewer
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Updated
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link
                  href={`/documents/${doc.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {doc.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {doc.author_name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {doc.reviewer_name || "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={doc.status} />
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(doc.updated_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
