from datetime import datetime, time, timedelta

import pytest

from app.db.models import Quiz, TentativeQuiz, Theme, Utilisateur
from app.services.quests import (
    QUEST_TZ,
    claim_quest,
    compute_streak,
    get_daily_quests,
    record_study_minutes,
    today_local,
)
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
        points=0,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _attempt(db, candidat: Utilisateur, score: int, *, days_ago: int = 0) -> None:
    """Tentative de quiz horodatée à midi local, pour rester dans la bonne journée."""
    theme = db.query(Theme).first()
    quiz = Quiz(theme_id=theme.id, title=f"Quiz {score}-{days_ago}", question_count=10)
    db.add(quiz)
    db.commit()

    moment = today_local() - timedelta(days=days_ago)
    db.add(
        TentativeQuiz(
            candidat_id=candidat.id,
            quiz_id=quiz.id,
            score=score,
            nb_correctes=score // 10,
            nb_total=10,
            reussi=score >= 70,
            reponses_json=[],
            termine_le=datetime.combine(moment, time(12, 0), tzinfo=QUEST_TZ),
        )
    )
    db.commit()


def test_quests_start_locked(db):
    candidat = _candidat(db, "quetes-vide@test.cm")
    payload = get_daily_quests(db, candidat)

    assert payload["completed_count"] == 0
    assert payload["streak_days"] == 0
    assert {quest["id"] for quest in payload["quests"]} == {"serie", "score", "etude"}
    assert all(quest["current"] == 0 for quest in payload["quests"])
    assert all(not quest["claimable"] for quest in payload["quests"])


def test_study_minutes_feed_the_quest(db):
    candidat = _candidat(db, "quetes-minutes@test.cm")
    record_study_minutes(db, candidat, 4)
    record_study_minutes(db, candidat, 6)

    payload = get_daily_quests(db, candidat)
    etude = next(quest for quest in payload["quests"] if quest["id"] == "etude")

    assert payload["study_minutes"] == 10
    assert etude["current"] == 10
    assert etude["completed"] is True
    assert etude["claimable"] is True
    # Le temps d'étude déclenche aussi la série du jour.
    assert payload["streak_days"] == 1


def test_heartbeat_is_capped_per_call(db):
    candidat = _candidat(db, "quetes-triche@test.cm")
    record_study_minutes(db, candidat, 9999)

    assert get_daily_quests(db, candidat)["study_minutes"] == 10


def test_score_quest_counts_good_attempts_today(db):
    candidat = _candidat(db, "quetes-score@test.cm")
    _attempt(db, candidat, 90)
    _attempt(db, candidat, 50)
    _attempt(db, candidat, 95, days_ago=1)

    score = next(quest for quest in get_daily_quests(db, candidat)["quests"] if quest["id"] == "score")
    assert score["current"] == 1
    assert score["completed"] is False

    _attempt(db, candidat, 85)
    score = next(quest for quest in get_daily_quests(db, candidat)["quests"] if quest["id"] == "score")
    assert score["current"] == 2
    assert score["completed"] is True


def test_streak_counts_consecutive_days(db):
    candidat = _candidat(db, "quetes-serie@test.cm")
    _attempt(db, candidat, 80)
    _attempt(db, candidat, 80, days_ago=1)
    _attempt(db, candidat, 80, days_ago=2)
    _attempt(db, candidat, 80, days_ago=5)

    assert compute_streak(db, candidat) == 3


def test_claim_awards_points_once(db):
    candidat = _candidat(db, "quetes-recompense@test.cm")
    record_study_minutes(db, candidat, 10)

    before = int(candidat.points or 0)
    payload = claim_quest(db, candidat, "etude")
    etude = next(quest for quest in payload["quests"] if quest["id"] == "etude")

    assert etude["claimed"] is True
    assert etude["claimable"] is False
    assert int(candidat.points or 0) == before + 15

    with pytest.raises(ValueError):
        claim_quest(db, candidat, "etude")


def test_claim_refused_when_quest_unfinished(db):
    candidat = _candidat(db, "quetes-trop-tot@test.cm")
    record_study_minutes(db, candidat, 2)

    with pytest.raises(ValueError):
        claim_quest(db, candidat, "etude")
