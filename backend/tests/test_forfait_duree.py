"""Forfaits mensuels : échéance, expiration de l'accès et renouvellement."""

from datetime import UTC, datetime, timedelta

import pytest

from app.db.models import AutoEcole, Forfait, TypeForfait, Utilisateur, Ville
from app.services.enrollments import (
    add_months,
    create_inscription,
    inscription_days_left,
    inscription_is_active,
)
from app.services.pedagogy import has_platform_access
from app.services.subscription_lifecycle import process_forfait_reminders
from tests.conftest import TestingSessionLocal


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def _candidat(db, email: str) -> Utilisateur:
    user = Utilisateur(email=email, nom="Test", prenom="Candidat", role="candidat", country_code="CM")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _school(db, suffix: str) -> AutoEcole:
    gerant = Utilisateur(
        email=f"gerant-{suffix}@test.cm", nom="T", prenom="G", role="gerant_auto_ecole", country_code="CM"
    )
    db.add(gerant)
    db.commit()
    ville = db.query(Ville).first()
    school = AutoEcole(
        country_code="CM",
        ville_id=ville.id,
        gerant_id=gerant.id,
        raison_sociale="Auto-École Durée",
        numero_agrement=f"AG-{suffix}",
        adresse="Douala",
    )
    db.add(school)
    db.commit()
    db.refresh(school)
    return school


def _forfait(db, school: AutoEcole, forfait_type: str, *, duree_mois: int = 1, heures: int = 0) -> Forfait:
    forfait = Forfait(
        auto_ecole_id=school.id,
        type=forfait_type,
        label_fr="Code en ligne",
        label_en="Online theory",
        prix=28000,
        heures_conduite=heures or None,
        duree_mois=duree_mois,
    )
    db.add(forfait)
    db.commit()
    db.refresh(forfait)
    return forfait


def _enroll(db, candidat, school, forfait, ref="MM-DUREE"):
    return create_inscription(
        db,
        candidat=candidat,
        school=school,
        forfait=forfait,
        forfait_type=forfait.type,
        forfait_label=forfait.label_fr,
        payment_ref=ref,
    )


def test_forfait_mensuel_fixe_une_echeance(db):
    candidat = _candidat(db, "duree-mensuel@test.cm")
    school = _school(db, "mensuel")
    forfait = _forfait(db, school, TypeForfait.code_seul.value, duree_mois=1)

    inscription = _enroll(db, candidat, school, forfait)

    assert inscription.expires_at is not None
    assert inscription.expires_at.date() == add_months(datetime.now(UTC), 1).date()
    assert inscription_is_active(inscription) is True
    assert has_platform_access(db, candidat) is True


def test_duree_paramétrable_par_lauto_ecole(db):
    candidat = _candidat(db, "duree-trimestre@test.cm")
    school = _school(db, "trimestre")
    forfait = _forfait(db, school, TypeForfait.complet.value, duree_mois=3)

    inscription = _enroll(db, candidat, school, forfait)

    assert inscription.expires_at.date() == add_months(datetime.now(UTC), 3).date()


def test_acces_expire_avec_le_forfait(db):
    candidat = _candidat(db, "duree-expire@test.cm")
    school = _school(db, "expire")
    forfait = _forfait(db, school, TypeForfait.code_seul.value)
    inscription = _enroll(db, candidat, school, forfait)

    assert has_platform_access(db, candidat) is True

    inscription.expires_at = datetime.now(UTC) - timedelta(days=1)
    db.commit()

    assert inscription_is_active(inscription) is False
    assert has_platform_access(db, candidat) is False


def test_repaiement_prolonge_au_lieu_de_dupliquer(db):
    candidat = _candidat(db, "duree-renouvelle@test.cm")
    school = _school(db, "renouvelle")
    forfait = _forfait(db, school, TypeForfait.conduite_seule.value, heures=20)

    first = _enroll(db, candidat, school, forfait, ref="MM-R1")
    premiere_echeance = first.expires_at

    second = _enroll(db, candidat, school, forfait, ref="MM-R2")

    assert second.id == first.id, "un renouvellement ne doit pas créer une seconde inscription"
    assert second.expires_at > premiere_echeance
    assert second.expires_at.date() == add_months(premiere_echeance, 1).date()
    assert second.heures_conduite_total == 40
    assert second.heures_conduite_restantes == 40
    assert second.payment_ref == "MM-R2"


def test_forfaits_complementaires_coexistent(db):
    """Code + conduite dans la même auto-école font deux inscriptions distinctes."""
    candidat = _candidat(db, "duree-cumul@test.cm")
    school = _school(db, "cumul")
    code = _forfait(db, school, TypeForfait.code_seul.value)
    conduite = _forfait(db, school, TypeForfait.conduite_seule.value, heures=20)

    premiere = _enroll(db, candidat, school, code)
    seconde = _enroll(db, candidat, school, conduite)

    assert premiere.id != seconde.id


def test_relance_envoyee_une_seule_fois_avant_lecheance(db):
    candidat = _candidat(db, "duree-relance@test.cm")
    school = _school(db, "relance")
    forfait = _forfait(db, school, TypeForfait.code_seul.value)
    inscription = _enroll(db, candidat, school, forfait)

    inscription.expires_at = datetime.now(UTC) + timedelta(days=5)
    db.commit()
    assert inscription_days_left(inscription) == 5

    stats = process_forfait_reminders(db)
    assert stats["forfait_7d"] == 1
    assert stats["forfait_3d"] == 0

    # Une seconde passe ne renvoie pas le même rappel.
    assert process_forfait_reminders(db)["forfait_7d"] == 0

    # À J-2, la relance finale part.
    inscription.expires_at = datetime.now(UTC) + timedelta(days=2)
    db.commit()
    assert process_forfait_reminders(db)["forfait_3d"] == 1
