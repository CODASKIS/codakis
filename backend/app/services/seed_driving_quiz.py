"""Import des 40 questions NARSA / DrivingQuiz (Maroc)."""

from __future__ import annotations

import json
import logging
from pathlib import Path

from sqlalchemy.orm import Session

from app.db.models import Examen, ExamenQuestion, Question, Reponse, Theme, Utilisateur

logger = logging.getLogger("codakis")

ASSETS = Path(__file__).resolve().parents[2] / "assets" / "driving-quiz"
EXAM_CODE = "narsa-maroc-demo"
EXAM_TITLE = "Examen type NARSA (Maroc)"


def _labels(n: int) -> list[str]:
    return [chr(65 + i) for i in range(n)]


def seed_driving_quiz(db: Session, admin: Utilisateur | None) -> None:
    json_path = ASSETS / "questions.json"
    if not json_path.exists():
        logger.warning("DrivingQuiz assets missing: %s", json_path)
        return

    existing = db.query(Examen).filter(Examen.title == EXAM_TITLE).first()
    if existing is not None:
        return

    theme = db.query(Theme).order_by(Theme.sort_order.asc()).first()
    theme_id = theme.id if theme else None

    items = json.loads(json_path.read_text(encoding="utf-8"))
    question_ids: list = []

    for item in items:
        prompt = item["question"].strip()
        options: list[str] = item.get("options") or []
        answer = (item.get("answer") or "").strip()
        if not prompt or len(options) < 2:
            continue

        image_name = item.get("image")
        image_url = f"/api/v1/public/driving-quiz/images/{image_name}" if image_name else None

        question = Question(
            theme_id=theme_id,
            prompt=prompt,
            image_url=image_url,
            explanation=f"Réponse correcte : {answer}",
            difficulty=2,
            est_actif=True,
        )
        db.add(question)
        db.flush()

        for idx, opt in enumerate(options):
            db.add(
                Reponse(
                    question_id=question.id,
                    label=_labels(len(options))[idx],
                    texte=opt.strip(),
                    est_correcte=opt.strip() == answer,
                    sort_order=idx,
                )
            )
        question_ids.append(question.id)

    if not question_ids:
        db.rollback()
        return

    exam = Examen(
        title=EXAM_TITLE,
        description="Banque de 40 questions inspirées du projet NARSA / DrivingQuiz (permis Maroc).",
        duree_minutes=40,
        nb_questions=len(question_ids),
        max_erreurs=10,
        est_actif=True,
    )
    db.add(exam)
    db.flush()

    for index, qid in enumerate(question_ids):
        db.add(ExamenQuestion(examen_id=exam.id, question_id=qid, sort_order=index))

    db.commit()
    logger.info("Examen NARSA importé : %s questions", len(question_ids))
