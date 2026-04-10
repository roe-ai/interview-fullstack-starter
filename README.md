# Document Review System

A simple document review app with a FastAPI backend and Next.js frontend. Documents can be created, submitted for review, and approved/rejected by a single reviewer.

## Quick Start

### Backend

```bash
cd backend
uv run python seed.py        # seed sample data
uv run uvicorn main:app --reload
```

API runs at http://localhost:8000. Docs at http://localhost:8000/docs.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:3000.

---

## Your Task

We need to extend this from a **single-reviewer system** to support **multi-step approval pipelines**.

### Requirements

1. **Pipeline Templates** — An admin can define a reusable pipeline template (e.g., "Legal Review → Compliance Review → Final Sign-off"). Each stage has a name and an assigned reviewer.

2. **Document Submission** — When a document is submitted, the author picks a pipeline template. The document enters the first stage of that pipeline.

3. **Stage Progression** — The reviewer assigned to the current stage can:
   - **Approve** → document moves to the next stage (or becomes fully approved if it was the last stage)
   - **Reject** → document is sent back to the author with comments
   - **Request Changes** → document stays in the current stage, author must revise and resubmit

4. **Visibility** — The document detail page should show:
   - Which pipeline it's in and what stage it's currently at
   - A progress indicator showing all stages and which are complete
   - The full review history across all stages

5. **Document List** — The document table should show the pipeline name and a compact progress indicator for each document.

### Constraints

- Build on the existing codebase — don't rewrite from scratch
- Keep the existing single-reviewer flow working (documents without a pipeline should still work as before)
- Use the existing patterns you see in the code (API client structure, React Query usage, component style)

### You have 55 minutes. You won't finish everything — prioritize what you think matters most.

We're evaluating how you plan, design, and build — not just the final output. Use whatever AI tools you'd like.
