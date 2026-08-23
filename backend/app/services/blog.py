import uuid
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.db.models import ArticleBlog, StatutArticleBlog, Utilisateur
from app.services.media import slugify

SEED_ARTICLES: list[dict] = [
    {
        "slug": "reussir-code-route-cameroun",
        "title": "10 conseils pour réussir le code de la route au Cameroun",
        "excerpt": "Préparez votre examen théorique avec méthode : révision, examens blancs et gestion du stress.",
        "cover_image_url": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80",
        "published_at": datetime(2026, 3, 1, 10, 0, tzinfo=UTC),
    },
    {
        "slug": "choisir-auto-ecole-agreee",
        "title": "Comment choisir une auto-école agréée ?",
        "excerpt": "Taux de réussite, forfaits, avis candidats : les critères essentiels avant de s'inscrire.",
        "cover_image_url": "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
        "published_at": datetime(2026, 2, 18, 9, 0, tzinfo=UTC),
    },
    {
        "slug": "dossier-consort-pieces",
        "title": "Dossier Consort : les 6 pièces à préparer",
        "excerpt": "Identité, certificat médical, timbres… Suivez la checklist complète pour ne rien oublier.",
        "cover_image_url": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
        "published_at": datetime(2026, 2, 5, 8, 0, tzinfo=UTC),
    },
    {
        "slug": "paiement-mobile-money-permis",
        "title": "Payer son forfait permis avec Mobile Money",
        "excerpt": "Orange Money et MTN MoMo : étapes sécurisées pour acheter un forfait conduite sur CODAKIS.",
        "cover_image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
        "published_at": datetime(2026, 1, 22, 11, 0, tzinfo=UTC),
    },
    {
        "slug": "examen-blanc-strategies",
        "title": "Examen blanc : 5 stratégies pour scorer 35/40",
        "excerpt": "Chronométrez-vous, identifiez vos thèmes faibles et entraînez-vous comme le jour J.",
        "cover_image_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        "published_at": datetime(2026, 1, 10, 14, 0, tzinfo=UTC),
    },
    {
        "slug": "signalisation-cemac",
        "title": "Signalisation CEMAC : panneaux à connaître par cœur",
        "excerpt": "Triangulaires, circulaires, octogonales : révisez les familles de panneaux les plus tombées à l'examen.",
        "cover_image_url": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
        "published_at": datetime(2025, 12, 28, 16, 0, tzinfo=UTC),
    },
]


def author_display_name(author: Utilisateur | None) -> str:
    if author is None:
        return "Équipe CODAKIS"
    name = f"{author.prenom} {author.nom}".strip()
    return name or "Équipe CODAKIS"


def article_to_public(article: ArticleBlog) -> dict:
    return {
        "slug": article.slug,
        "title": article.title,
        "excerpt": article.excerpt,
        "cover_image_url": article.cover_image_url,
        "author_name": author_display_name(article.author),
        "published_at": article.published_at,
    }


def article_to_detail(article: ArticleBlog) -> dict:
    return {**article_to_public(article), "body": article.body}


def article_to_admin(article: ArticleBlog) -> dict:
    return {
        **article_to_detail(article),
        "id": article.id,
        "status": article.status,
        "created_at": article.created_at,
        "updated_at": article.updated_at,
    }


def ensure_unique_slug(db: Session, base_slug: str, exclude_id: uuid.UUID | None = None) -> str:
    slug = base_slug
    index = 2
    while True:
        query = db.query(ArticleBlog).filter(ArticleBlog.slug == slug)
        if exclude_id is not None:
            query = query.filter(ArticleBlog.id != exclude_id)
        if query.first() is None:
            return slug
        slug = f"{base_slug}-{index}"
        index += 1


def apply_publish_state(status: str, published_at: datetime | None) -> tuple[str, datetime | None]:
    if status == StatutArticleBlog.published.value:
        return status, published_at or datetime.now(UTC)
    return status, published_at


def seed_blog_articles(db: Session, author: Utilisateur | None) -> None:
    if db.query(ArticleBlog).count() > 0:
        return
    for item in SEED_ARTICLES:
        body = (
            f"## {item['title']}\n\n{item['excerpt']}\n\n"
            "CODAKIS vous accompagne à chaque étape de votre parcours permis au Cameroun : "
            "cours interactifs, quiz, examens blancs, annuaire d'auto-écoles agréées et suivi du dossier Consort."
        )
        db.add(
            ArticleBlog(
                slug=item["slug"],
                title=item["title"],
                excerpt=item["excerpt"],
                body=body,
                cover_image_url=item["cover_image_url"],
                author_id=author.id if author else None,
                status=StatutArticleBlog.published.value,
                published_at=item["published_at"],
                country_code="CM",
            )
        )
    db.commit()
