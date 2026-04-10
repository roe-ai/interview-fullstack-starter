"use client";

import { DocumentTable } from "@/components/document-table";

export default function HomePage() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
      </div>
      <DocumentTable />
    </div>
  );
}
