const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail || res.statusText);
  }

  return res.json() as Promise<T>;
}

// --- Types matching backend schemas ---

export type UserRole = "author" | "reviewer" | "admin";
export type DocumentStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "changes_requested";
export type ReviewDecision = "approve" | "reject" | "request_changes";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Document {
  id: number;
  title: string;
  content: string;
  status: DocumentStatus;
  author_id: number;
  author_name: string | null;
  reviewer_id: number | null;
  reviewer_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  document_id: number;
  reviewer_id: number;
  reviewer_name: string | null;
  decision: ReviewDecision;
  comment: string;
  created_at: string;
}

export interface DocumentDetail extends Document {
  reviews: Review[];
}

// --- API functions ---

export const api = {
  // Users
  listUsers: () => request<User[]>("/users"),

  // Documents
  listDocuments: () => request<Document[]>("/documents"),

  getDocument: (id: number) => request<DocumentDetail>(`/documents/${id}`),

  createDocument: (data: {
    title: string;
    content: string;
    author_id: number;
  }) =>
    request<Document>("/documents", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateDocument: (id: number, data: { title?: string; content?: string }) =>
    request<Document>(`/documents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Review flow
  submitForReview: (documentId: number, reviewerId: number) =>
    request<Document>(`/documents/${documentId}/submit`, {
      method: "POST",
      body: JSON.stringify({ reviewer_id: reviewerId }),
    }),

  reviewDocument: (
    documentId: number,
    data: { decision: ReviewDecision; comment?: string },
  ) =>
    request<Review>(`/documents/${documentId}/review`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listReviews: (documentId: number) =>
    request<Review[]>(`/documents/${documentId}/reviews`),
};
