from datetime import datetime

from pydantic import BaseModel, ConfigDict

from models import DocumentStatus, ReviewDecision, UserRole


# --- Users ---


class UserCreate(BaseModel):
    name: str
    email: str
    role: UserRole = UserRole.AUTHOR


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime


# --- Documents ---


class DocumentCreate(BaseModel):
    title: str
    content: str
    author_id: int
    reviewer_id: int | None = None


class DocumentUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    reviewer_id: int | None = None


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    document_id: int
    reviewer_id: int
    reviewer_name: str | None = None
    decision: ReviewDecision
    comment: str
    created_at: datetime


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    status: DocumentStatus
    author_id: int
    author_name: str | None = None
    reviewer_id: int | None
    reviewer_name: str | None = None
    created_at: datetime
    updated_at: datetime


class DocumentDetailResponse(DocumentResponse):
    reviews: list[ReviewResponse] = []


# --- Reviews ---


class ReviewCreate(BaseModel):
    decision: ReviewDecision
    comment: str = ""


# --- Submit for review ---


class SubmitForReview(BaseModel):
    reviewer_id: int
