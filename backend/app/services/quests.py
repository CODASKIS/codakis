"""
Quêtes du jour et série d'apprentissage du candidat.

Les compteurs sont recalculés à chaque appel à partir des tentatives quiz/examen
et des leçons terminées ; seul le temps d'étude nécessite un suivi dédié, alimenté
par un heartbeat envoyé par l'espace candidat (`record_study_minutes`).
"""

from __future__ import annotations

from datetime import UTC, date, datetime, time, timedelta, timezone

from sqlalchemy.orm import Session

from app.db.models import (
    ActiviteQuotidienne,
    LeconProgress,
    TentativeExamen,
    TentativeQuiz,
    Utilisateur,
)

# Les quêtes se réinitialisent à minuit heure du Cameroun (WAT, UTC+1).
QUEST_TZ = timezone(timedelta(hours=1))

# Une requête heartbeat ne peut jamais créditer plus que cet intervalle.
MAX_MINUTES_PER_HEARTBEAT = 10
MAX_MINUTES_PER_DAY = 600

STUDY_GOAL_MINUTES = 10
SCORE_GOAL_ATTEMPTS = 2
SCORE_THRESHOLD = 80

QUEST_DEFINITIONS: tuple[dict, ...] = (
    {
        "id": "serie",
        "title": "Prolonge ta série",
        "description": "Apprends au moins une fois aujourd'hui.",
        "goal": 1,
        "reward_points": 10,
    },
    {
        "id": "score",
        "title": f"Obtiens un score d'au moins {SCORE_THRESHOLD} % dans {SCORE_GOAL_ATTEMPTS} leçons",
        "description": "Réussis deux quiz ou examens avec un bon score.",
        "goal": SCORE_GOAL_ATTEMPTS,
        "reward_points": 25,
    },
    {
        "id": "etude",
        "title": f"Apprends pendant {STUDY_GOAL_MINUTES} minutes",
        "description": "Reste actif sur la plateforme.",
        "goal": STUDY_GOAL_MINUTES,
        "reward_points": 15,
    },
)


def today_local() -> date:
    return datetime.now(QUEST_TZ).date()


def _day_bounds(day: date) -> tuple[datetime, datetime]:
    """Bornes UTC de la journée locale — les tentatives sont horodatées en UTC."""
    start = datetime.combine(day, time.min, tzinfo=QUEST_TZ)
    return start.astimezone(UTC), (start + timedelta(days=1)).astimezone(UTC)


def seconds_until_reset() -> int:
    now = datetime.now(QUEST_TZ)
    _, end = _day_bounds(now.date())
    return max(0, int((end - now.astimezone(UTC)).total_seconds()))


def get_or_create_today(db: Session, candidat: Utilisateur) -> ActiviteQuotidienne:
    day = today_local()
    row = (
        db.query(ActiviteQuotidienne)
        .filter(
            ActiviteQuotidienne.candidat_id == candidat.id,
            ActiviteQuotidienne.jour == day,
        )
        .first()
    )
    if row is None:
        row = ActiviteQuotidienne(candidat_id=candidat.id, jour=day, minutes_etude=0, quetes_recompensees=[])
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def record_study_minutes(db: Session, candidat: Utilisateur, minutes: int) -> ActiviteQuotidienne:
    """Crédite du temps d'étude, borné pour qu'un client bavard ne fausse pas les quêtes."""
    increment = max(0, min(int(minutes or 0), MAX_MINUTES_PER_HEARTBEAT))
    row = get_or_create_today(db, candidat)
    if increment:
        row.minutes_etude = min(MAX_MINUTES_PER_DAY, int(row.minutes_etude or 0) + increment)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def _active_days(db: Session, candidat: Utilisateur) -> set[date]:
    """Jours locaux où le candidat a terminé une leçon, passé une épreuve ou étudié."""
    days: set[date] = set()

    def add(moment: datetime | None) -> None:
        if moment is None:
            return
        aware = moment if moment.tzinfo else moment.replace(tzinfo=UTC)
        days.add(aware.astimezone(QUEST_TZ).date())

    for (moment,) in db.query(LeconProgress.completed_at).filter(LeconProgress.candidat_id == candidat.id):
        add(moment)
    for (moment,) in db.query(TentativeQuiz.termine_le).filter(TentativeQuiz.candidat_id == candidat.id):
        add(moment)
    for (moment,) in db.query(TentativeExamen.termine_le).filter(TentativeExamen.candidat_id == candidat.id):
        add(moment)
    for (day,) in (
        db.query(ActiviteQuotidienne.jour)
        .filter(
            ActiviteQuotidienne.candidat_id == candidat.id,
            ActiviteQuotidienne.minutes_etude > 0,
        )
    ):
        days.add(day)

    return days


def _streak_from_days(days: set[date]) -> int:
    """Nombre de jours consécutifs d'activité — la série survit tant qu'hier est actif."""
    if not days:
        return 0

    today = today_local()
    cursor = today if today in days else today - timedelta(days=1)
    if cursor not in days:
        return 0

    streak = 0
    while cursor in days:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def compute_streak(db: Session, candidat: Utilisateur) -> int:
    return _streak_from_days(_active_days(db, candidat))


def _good_attempts_today(db: Session, candidat: Utilisateur) -> int:
    start, end = _day_bounds(today_local())
    quiz = (
        db.query(TentativeQuiz)
        .filter(
            TentativeQuiz.candidat_id == candidat.id,
            TentativeQuiz.score >= SCORE_THRESHOLD,
            TentativeQuiz.termine_le >= start,
            TentativeQuiz.termine_le < end,
        )
        .count()
    )
    exam = (
        db.query(TentativeExamen)
        .filter(
            TentativeExamen.candidat_id == candidat.id,
            TentativeExamen.score >= SCORE_THRESHOLD,
            TentativeExamen.termine_le >= start,
            TentativeExamen.termine_le < end,
        )
        .count()
    )
    return quiz + exam


def _progress_today(
    db: Session,
    candidat: Utilisateur,
    activity: ActiviteQuotidienne,
    active_days: set[date],
) -> dict[str, int]:
    return {
        "serie": 1 if today_local() in active_days else 0,
        "score": _good_attempts_today(db, candidat),
        "etude": int(activity.minutes_etude or 0),
    }


def get_daily_quests(db: Session, candidat: Utilisateur) -> dict:
    activity = get_or_create_today(db, candidat)
    active_days = _active_days(db, candidat)
    progress = _progress_today(db, candidat, activity, active_days)
    claimed = set(activity.quetes_recompensees or [])

    quests = []
    for definition in QUEST_DEFINITIONS:
        current = min(progress[definition["id"]], definition["goal"])
        done = current >= definition["goal"]
        quests.append(
            {
                **definition,
                "current": current,
                "completed": done,
                "claimed": definition["id"] in claimed,
                "claimable": done and definition["id"] not in claimed,
            }
        )

    return {
        "date": activity.jour,
        "streak_days": _streak_from_days(active_days),
        "study_minutes": int(activity.minutes_etude or 0),
        "completed_count": sum(1 for quest in quests if quest["completed"]),
        "total": len(quests),
        "reset_in_seconds": seconds_until_reset(),
        "quests": quests,
    }


def claim_quest(db: Session, candidat: Utilisateur, quest_id: str) -> dict:
    """Crédite la récompense d'une quête terminée, une seule fois par jour."""
    from app.services.pedagogy import award_points

    definition = next((item for item in QUEST_DEFINITIONS if item["id"] == quest_id), None)
    if definition is None:
        raise ValueError("Quête inconnue")

    activity = get_or_create_today(db, candidat)
    claimed = list(activity.quetes_recompensees or [])
    if quest_id in claimed:
        raise ValueError("Récompense déjà récupérée")

    progress = _progress_today(db, candidat, activity, _active_days(db, candidat))
    if progress[quest_id] < definition["goal"]:
        raise ValueError("Quête non terminée")

    claimed.append(quest_id)
    activity.quetes_recompensees = claimed
    db.add(activity)
    db.commit()

    award_points(db, candidat, definition["reward_points"])
    return get_daily_quests(db, candidat)
