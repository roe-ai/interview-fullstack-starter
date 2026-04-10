# Document Review System

A simple document review app with a FastAPI backend and Next.js frontend. Documents can be created, submitted for review, and approved/rejected by a single reviewer.

## Quick Start

### Backend

```bash
cd backend
uv run python seed.py        # seed sample data (4 users, 5 documents)
uv run uvicorn main:app --reload
```

API runs at http://localhost:8000. Docs at http://localhost:8000/docs.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:3001.

---

## Your Task

We need to extend this from a **single-reviewer system** to support **multi-step approval pipelines**.

### Requirements

1. **Pipeline Templates** — An admin can create and manage reusable pipeline templates (e.g., "Legal Review → Compliance Review → Final Sign-off"). Each stage has a name and a default assigned reviewer.

2. **Document Submission** — When a document is submitted, the author picks a pipeline template. The document enters the first stage of that pipeline.

3. **Reviewer Reassignment** — A reviewer should be able to reassign their stage to a different reviewer. The template defines the default reviewer for each stage, but it can be overridden per-document.

4. **Stage Progression** — The reviewer assigned to the current stage can:
   - **Approve** → document moves to the next stage (or becomes fully approved if it was the last stage)
   - **Reject** → up to you how this behaves — think about what makes sense for the user
   - **Request Changes** → document stays in the current stage, author must revise and resubmit to the same reviewer

5. **Visibility** — The document detail page should show where the document is in its pipeline and the full review history across stages.

6. **Document List** — The document table should indicate pipeline progress for each document.

### Constraints

- Build on the existing codebase — don't rewrite from scratch
- Keep the existing single-reviewer flow working (documents without a pipeline should still work as before)
- Use the existing patterns you see in the code (API client structure, React Query usage, component style)

### You have 55 minutes. You won't finish everything — prioritize what you think matters most. You should use AI tools to help you.

We're evaluating how you plan, design, interact with AI, and build — not just the final output. Use whatever AI tools you'd like.
