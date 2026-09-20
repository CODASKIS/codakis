from datetime import UTC, datetime

import pytest

from app.db.models import (
    AutoEcole,
    Forfait,
    Paiement,
    StatutInscription,
    TypeForfait,
    Utilisateur,
    Ville,
)
from app.services.enrollments import create_inscription
from app.services.payments import repair_orphan_enrollments
from app.services.pedagogy import has_platform_access
from tests.conftest import TestingSessionLocal


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def _candidat(db, email: str) -> Utilisateur:
    user = Utilisateur(
        email=email,
        nom="Test",
        prenom="Candidat",
        role="candidat",
        country_code="CM",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _school(db) -> AutoEcole:
    gerant = Utilisateur(
        email=f"gerant-{id(db)}@test.cm",
        nom="Test",
        prenom="Gerant",
        role="gerant_auto_ecole",
        country_code="CM",
    )
    db.add(gerant)
    db.commit()

    ville = db.query(Ville).first()
    school = AutoEcole(
        country_code="CM",
        ville_id=ville.id,
        gerant_id=gerant.id,
        raison_sociale="Auto-École Test",
        numero_agrement=f"AG-{id(db)}",
        adresse="Douala",
    )
    db.add(school)
    db.commit()
    db.refresh(school)
    return school


def _forfait(db, school: AutoEcole, forfait_type: str) -> Forfait:
    forfait = Forfait(
        auto_ecole_id=school.id,
        type=forfait_type,
        label_fr=f"Forfait {forfait_type}",
        label_en=f"{forfait_type} plan",
        prix=100000,
    )
    db.add(forfait)
    db.commit()
    db.refresh(forfait)
    return forfait


@pytest.mark.parametrize(
    ("forfait_type", "expected"),
    [
        (TypeForfait.complet.value, True),
        (TypeForfait.code_seul.value, True),
        (TypeForfait.conduite_seule.value, False),
    ],
)
def test_forfait_grants_platform_access(db, forfait_type, expected):
    """Un forfait auto-école incluant le code ouvre les cours, sans abonnement."""
    candidat = _candidat(db, f"candidat-{forfait_type}@test.cm")
    assert has_platform_access(db, candidat) is False

    school = _school(db)
    forfait = _forfait(db, school, forfait_type)
    create_inscription(
        db,
        candidat=candidat,
        school=school,
        forfait=forfait,
        forfait_type=forfait.type,
        forfait_label=forfait.label_fr,
        payment_ref="MM-TEST",
    )

    assert has_platform_access(db, candidat) is expected


def test_cancelled_enrollment_revokes_access(db):
    candidat = _candidat(db, "candidat-annule@test.cm")
    school = _school(db)
    forfait = _forfait(db, school, TypeForfait.complet.value)
    inscription = create_inscription(
        db,
        candidat=candidat,
        school=school,
        forfait=forfait,
        forfait_type=forfait.type,
        forfait_label=forfait.label_fr,
    )
    assert has_platform_access(db, candidat) is True

    inscription.statut = StatutInscription.annulee.value
    db.commit()

    assert has_platform_access(db, candidat) is False


def test_orphan_enrollment_payment_is_repaired(db):
    """Un forfait payé dont la confirmation s'est arrêtée avant l'inscription est rattrapé."""
    candidat = _candidat(db, "candidat-orphelin@test.cm")
    school = _school(db)
    forfait = _forfait(db, school, TypeForfait.complet.value)

    paiement = Paiement(
        reference="MM-ORPHELIN",
        utilisateur_id=candidat.id,
        auto_ecole_id=school.id,
        forfait_id=forfait.id,
        purpose="enrollment",
        amount_fcfa=forfait.prix,
        channel="pawapay",
        phone="+237670000000",
        status="completed",
        completed_at=datetime.now(UTC),
    )
    db.add(paiement)
    db.commit()

    assert has_platform_access(db, candidat) is False

    stats = repair_orphan_enrollments(db)
    assert stats["repaired"] == 1

    db.refresh(paiement)
    assert paiement.inscription_id is not None
    assert has_platform_access(db, candidat) is True

    # Idempotent : un second passage ne duplique pas l'inscription.
    assert repair_orphan_enrollments(db)["repaired"] == 0
