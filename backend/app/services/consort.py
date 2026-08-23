import uuid
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.db.models import (
    CONSORT_PIECE_KEYS,
    DossierAdministratif,
    PieceConsort,
    RoleUtilisateur,
    StatutDossier,
    StatutPieceConsort,
    Utilisateur,
)


def init_candidat_dossier(db: Session, user: Utilisateur) -> DossierAdministratif:
    existing = db.query(DossierAdministratif).filter(DossierAdministratif.candidat_id == user.id).first()
    if existing:
        return existing

    dossier = DossierAdministratif(country_code=user.country_code, candidat_id=user.id)
    db.add(dossier)
    db.flush()

    for piece_key in CONSORT_PIECE_KEYS:
        db.add(
            PieceConsort(
                dossier_id=dossier.id,
                piece_key=piece_key,
                statut=StatutPieceConsort.missing.value,
            )
        )
    db.flush()
    return dossier


def get_or_create_dossier(db: Session, user: Utilisateur) -> DossierAdministratif:
    dossier = db.query(DossierAdministratif).filter(DossierAdministratif.candidat_id == user.id).first()
    if dossier is None:
        dossier = init_candidat_dossier(db, user)
        db.commit()
        db.refresh(dossier)
    elif not dossier.pieces:
        for piece_key in CONSORT_PIECE_KEYS:
            db.add(
                PieceConsort(
                    dossier_id=dossier.id,
                    piece_key=piece_key,
                    statut=StatutPieceConsort.missing.value,
                )
            )
        db.commit()
        db.refresh(dossier)
    return dossier


def _sync_dossier_statut(dossier: DossierAdministratif) -> None:
    statuses = {piece.statut for piece in dossier.pieces}
    if statuses == {StatutPieceConsort.validated.value}:
        dossier.statut = StatutDossier.pret.value
    elif StatutPieceConsort.missing.value in statuses:
        dossier.statut = StatutDossier.pieces_incompletes.value
    else:
        dossier.statut = StatutDossier.en_cours.value


def dossier_to_public(dossier: DossierAdministratif) -> dict:
    pieces = sorted(dossier.pieces, key=lambda piece: CONSORT_PIECE_KEYS.index(piece.piece_key))
    validated_count = sum(1 for piece in pieces if piece.statut == StatutPieceConsort.validated.value)
    pending_count = sum(1 for piece in pieces if piece.statut == StatutPieceConsort.pending.value)
    missing_count = sum(1 for piece in pieces if piece.statut == StatutPieceConsort.missing.value)
    return {
        "id": dossier.id,
        "statut": dossier.statut,
        "validated_count": validated_count,
        "pending_count": pending_count,
        "missing_count": missing_count,
        "total_count": len(CONSORT_PIECE_KEYS),
        "progress_percent": round(validated_count / len(CONSORT_PIECE_KEYS) * 100),
        "created_at": dossier.created_at,
        "updated_at": dossier.updated_at,
        "date_depot": dossier.date_depot,
        "pieces": [
            {
                "key": piece.piece_key,
                "status": piece.statut,
                "validated_at": piece.validated_at,
            }
            for piece in pieces
        ],
    }


def submit_consort_piece(db: Session, user: Utilisateur, piece_key: str) -> DossierAdministratif:
    if user.role != RoleUtilisateur.candidat.value:
        raise ValueError("Réservé aux candidats")
    if piece_key not in CONSORT_PIECE_KEYS:
        raise ValueError("Pièce invalide")

    dossier = get_or_create_dossier(db, user)
    piece = next((item for item in dossier.pieces if item.piece_key == piece_key), None)
    if piece is None:
        raise ValueError("Pièce introuvable")
    if piece.statut == StatutPieceConsort.validated.value:
        raise ValueError("Cette pièce est déjà validée")

    piece.statut = StatutPieceConsort.pending.value
    piece.validated_at = None
    _sync_dossier_statut(dossier)
    db.commit()
    db.refresh(dossier)
    return dossier


def validate_consort_piece(db: Session, dossier_id: uuid.UUID, piece_key: str) -> DossierAdministratif:
    """Validation admin/gérant — pour tests ou usage futur."""
    dossier = db.get(DossierAdministratif, dossier_id)
    if dossier is None:
        raise ValueError("Dossier introuvable")
    piece = next((item for item in dossier.pieces if item.piece_key == piece_key), None)
    if piece is None:
        raise ValueError("Pièce introuvable")

    piece.statut = StatutPieceConsort.validated.value
    piece.validated_at = datetime.now(UTC)
    _sync_dossier_statut(dossier)
    db.commit()
    db.refresh(dossier)
    return dossier


def _gerant_candidat_enrolled(db: Session, gerant: Utilisateur, candidat_id: uuid.UUID):
    from app.db.models import AutoEcole, Inscription

    school = db.query(AutoEcole).filter(AutoEcole.gerant_id == gerant.id).first()
    if school is None:
        raise ValueError("Auto-école introuvable")
    inscription = (
        db.query(Inscription)
        .filter(
            Inscription.auto_ecole_id == school.id,
            Inscription.candidat_id == candidat_id,
            Inscription.statut != "annulee",
        )
        .first()
    )
    if inscription is None:
        raise ValueError("Candidat non inscrit à votre auto-école")
    return school, inscription


def gerant_get_candidat_consort(db: Session, gerant: Utilisateur, candidat_id: uuid.UUID) -> dict:
    _gerant_candidat_enrolled(db, gerant, candidat_id)
    candidat = db.get(Utilisateur, candidat_id)
    if candidat is None:
        raise ValueError("Candidat introuvable")
    dossier = get_or_create_dossier(db, candidat)
    return dossier_to_public(dossier)


def gerant_validate_candidat_consort_piece(
    db: Session, gerant: Utilisateur, candidat_id: uuid.UUID, piece_key: str
) -> dict:
    _gerant_candidat_enrolled(db, gerant, candidat_id)
    candidat = db.get(Utilisateur, candidat_id)
    if candidat is None:
        raise ValueError("Candidat introuvable")
    dossier = get_or_create_dossier(db, candidat)
    dossier = validate_consort_piece(db, dossier.id, piece_key)
    return dossier_to_public(dossier)
