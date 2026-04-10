"""Seed the database with sample data for the interview."""

from database import Base, SessionLocal, engine
from models import (
    Document,
    DocumentStatus,
    Review,
    ReviewDecision,
    User,
    UserRole,
)

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()

    # Clear existing data
    db.query(Review).delete()
    db.query(Document).delete()
    db.query(User).delete()
    db.commit()

    # Users
    alice = User(name="Alice Chen", email="alice@example.com", role=UserRole.AUTHOR)
    bob = User(name="Bob Martinez", email="bob@example.com", role=UserRole.REVIEWER)
    carol = User(name="Carol Nguyen", email="carol@example.com", role=UserRole.REVIEWER)
    dave = User(name="Dave Kim", email="dave@example.com", role=UserRole.ADMIN)

    db.add_all([alice, bob, carol, dave])
    db.commit()
    db.refresh(alice)
    db.refresh(bob)
    db.refresh(carol)
    db.refresh(dave)

    # Documents in various states
    doc1 = Document(
        title="Q1 Marketing Strategy",
        content="This document outlines our Q1 marketing strategy focusing on product-led growth and content marketing initiatives.",
        status=DocumentStatus.APPROVED,
        author_id=alice.id,
        reviewer_id=bob.id,
    )

    doc2 = Document(
        title="Engineering Hiring Plan",
        content="We plan to hire 5 senior engineers and 3 mid-level engineers in the next quarter, focusing on backend and ML roles.",
        status=DocumentStatus.PENDING_REVIEW,
        author_id=alice.id,
        reviewer_id=carol.id,
    )

    doc3 = Document(
        title="Series B Fundraising Memo",
        content="Confidential memo outlining our Series B fundraising strategy, target valuation, and investor pipeline.",
        status=DocumentStatus.CHANGES_REQUESTED,
        author_id=dave.id,
        reviewer_id=bob.id,
    )

    doc4 = Document(
        title="Product Roadmap 2026",
        content="Draft product roadmap covering major feature releases, platform improvements, and technical debt reduction.",
        status=DocumentStatus.DRAFT,
        author_id=alice.id,
        reviewer_id=None,
    )

    doc5 = Document(
        title="Vendor Security Assessment",
        content="Security assessment for new cloud vendor including SOC 2 compliance review and data handling procedures.",
        status=DocumentStatus.REJECTED,
        author_id=carol.id,
        reviewer_id=dave.id,
    )

    db.add_all([doc1, doc2, doc3, doc4, doc5])
    db.commit()
    for doc in [doc1, doc2, doc3, doc4, doc5]:
        db.refresh(doc)

    # Reviews (history for documents that have been reviewed)
    reviews = [
        Review(
            document_id=doc1.id,
            reviewer_id=bob.id,
            decision=ReviewDecision.REQUEST_CHANGES,
            comment="Please add budget estimates for each initiative.",
        ),
        Review(
            document_id=doc1.id,
            reviewer_id=bob.id,
            decision=ReviewDecision.APPROVE,
            comment="Looks great with the added budget details. Approved.",
        ),
        Review(
            document_id=doc3.id,
            reviewer_id=bob.id,
            decision=ReviewDecision.REQUEST_CHANGES,
            comment="Need to include comparable company valuations and adjust the target range.",
        ),
        Review(
            document_id=doc5.id,
            reviewer_id=dave.id,
            decision=ReviewDecision.REJECT,
            comment="The vendor does not meet our minimum security requirements. Missing SOC 2 Type II.",
        ),
    ]

    db.add_all(reviews)
    db.commit()

    print("Seeded database:")
    print(f"  {db.query(User).count()} users")
    print(f"  {db.query(Document).count()} documents")
    print(f"  {db.query(Review).count()} reviews")

    db.close()


if __name__ == "__main__":
    seed()
