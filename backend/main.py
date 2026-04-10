from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Document, DocumentStatus, Review, ReviewDecision, User
from schemas import (
    DocumentCreate,
    DocumentDetailResponse,
    DocumentResponse,
    DocumentUpdate,
    ReviewCreate,
    ReviewResponse,
    SubmitForReview,
    UserCreate,
    UserResponse,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Document Review System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Users ---


@app.post("/users", response_model=UserResponse, status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    user = User(**payload.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.get("/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()


# --- Documents ---


def _enrich_document(doc: Document) -> dict:
    """Add computed fields that aren't on the ORM model directly."""
    data = {
        "id": doc.id,
        "title": doc.title,
        "content": doc.content,
        "status": doc.status,
        "author_id": doc.author_id,
        "author_name": doc.author.name if doc.author else None,
        "reviewer_id": doc.reviewer_id,
        "reviewer_name": doc.reviewer.name if doc.reviewer else None,
        "created_at": doc.created_at,
        "updated_at": doc.updated_at,
    }
    return data


def _enrich_review(review: Review) -> dict:
    return {
        "id": review.id,
        "document_id": review.document_id,
        "reviewer_id": review.reviewer_id,
        "reviewer_name": review.reviewer.name if review.reviewer else None,
        "decision": review.decision,
        "comment": review.comment,
        "created_at": review.created_at,
    }


@app.post("/documents", response_model=DocumentResponse, status_code=201)
def create_document(payload: DocumentCreate, db: Session = Depends(get_db)):
    author = db.get(User, payload.author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    doc = Document(**payload.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return _enrich_document(doc)


@app.get("/documents", response_model=list[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    docs = db.query(Document).order_by(Document.updated_at.desc()).all()
    return [_enrich_document(d) for d in docs]


@app.get("/documents/{document_id}", response_model=DocumentDetailResponse)
def get_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    data = _enrich_document(doc)
    data["reviews"] = [_enrich_review(r) for r in doc.reviews]
    return data


@app.patch("/documents/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: int, payload: DocumentUpdate, db: Session = Depends(get_db)
):
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(doc, field, value)

    db.commit()
    db.refresh(doc)
    return _enrich_document(doc)


# --- Review flow ---


@app.post(
    "/documents/{document_id}/submit",
    response_model=DocumentResponse,
)
def submit_for_review(
    document_id: int, payload: SubmitForReview, db: Session = Depends(get_db)
):
    """Submit a draft document for review. Assigns the reviewer and sets status."""
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.status not in (
        DocumentStatus.DRAFT,
        DocumentStatus.CHANGES_REQUESTED,
        DocumentStatus.REJECTED,
    ):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot submit document with status '{doc.status.value}'",
        )

    reviewer = db.get(User, payload.reviewer_id)
    if not reviewer:
        raise HTTPException(status_code=404, detail="Reviewer not found")

    doc.reviewer_id = payload.reviewer_id
    doc.status = DocumentStatus.PENDING_REVIEW
    db.commit()
    db.refresh(doc)
    return _enrich_document(doc)


@app.post(
    "/documents/{document_id}/review",
    response_model=ReviewResponse,
)
def review_document(
    document_id: int, payload: ReviewCreate, db: Session = Depends(get_db)
):
    """Record a review decision on a document."""
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.status != DocumentStatus.PENDING_REVIEW:
        raise HTTPException(
            status_code=400,
            detail="Document is not pending review",
        )

    if not doc.reviewer_id:
        raise HTTPException(
            status_code=400,
            detail="No reviewer assigned",
        )

    # Map decision to new document status
    status_map = {
        ReviewDecision.APPROVE: DocumentStatus.APPROVED,
        ReviewDecision.REJECT: DocumentStatus.REJECTED,
        ReviewDecision.REQUEST_CHANGES: DocumentStatus.CHANGES_REQUESTED,
    }

    review = Review(
        document_id=document_id,
        reviewer_id=doc.reviewer_id,
        decision=payload.decision,
        comment=payload.comment,
    )
    db.add(review)

    doc.status = status_map[payload.decision]
    db.commit()
    db.refresh(review)
    return _enrich_review(review)


@app.get(
    "/documents/{document_id}/reviews",
    response_model=list[ReviewResponse],
)
def list_reviews(document_id: int, db: Session = Depends(get_db)):
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return [_enrich_review(r) for r in doc.reviews]
