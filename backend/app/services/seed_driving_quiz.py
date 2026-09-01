"""Import des 40 questions NARSA / DrivingQuiz (Maroc) — version française."""

from __future__ import annotations

import json
import logging
from pathlib import Path

from sqlalchemy.orm import Session, joinedload

from app.db.models import Examen, ExamenQuestion, Question, Reponse, Theme, Utilisateur

logger = logging.getLogger("codakis")

ASSETS = Path(__file__).resolve().parents[2] / "assets" / "driving-quiz"
EXAM_CODE = "narsa-maroc-demo"
EXAM_TITLE = "Examen type NARSA (Maroc)"
EXAM_DESCRIPTION = (
    "Banque de 40 questions inspirées du permis marocain (NARSA / DrivingQuiz), traduites en français."
)


def _labels(n: int) -> list[str]:
    return [chr(65 + i) for i in range(n)]


def _load_items() -> list[dict]:
    json_path = ASSETS / "questions.json"
    if not json_path.exists():
        logger.warning("DrivingQuiz assets missing: %s", json_path)
        return []
    return json.loads(json_path.read_text(encoding="utf-8"))


def _apply_item_to_question(question: Question, item: dict) -> None:
    prompt = item["question"].strip()
    options: list[str] = item.get("options") or []
    answer = (item.get("answer") or "").strip()
    image_name = item.get("image")
    image_url = f"/api/v1/public/driving-quiz/images/{image_name}" if image_name else None

    question.prompt = prompt
    question.image_url = image_url
    question.explanation = f"Réponse correcte : {answer}"

    reponses = sorted(question.reponses, key=lambda r: r.sort_order)
    for idx, opt in enumerate(options):
        if idx < len(reponses):
            reponses[idx].texte = opt.strip()
            reponses[idx].label = _labels(len(options))[idx]
            reponses[idx].est_correcte = opt.strip() == answer
            reponses[idx].sort_order = idx


def _sync_existing_exam(db: Session, exam: Examen, items: list[dict]) -> None:
    links = (
        db.query(ExamenQuestion)
        .filter(ExamenQuestion.examen_id == exam.id)
        .order_by(ExamenQuestion.sort_order.asc())
        .all()
    )
    if len(links) != len(items):
        logger.warning("NARSA sync skipped: %s questions en base, %s dans le JSON", len(links), len(items))
        return

    for link, item in zip(links, items, strict=True):
        question = (
            db.query(Question)
            .options(joinedload(Question.reponses))
            .filter(Question.id == link.question_id)
            .first()
        )
        if question is None:
            continue
        _apply_item_to_question(question, item)

    exam.description = EXAM_DESCRIPTION
    db.commit()
    logger.info("Examen NARSA synchronisé en français : %s questions", len(items))


def seed_driving_quiz(db: Session, admin: Utilisateur | None) -> None:
    items = _load_items()
    if not items:
        return

    existing = db.query(Examen).filter(Examen.title == EXAM_TITLE).first()
    if existing is not None:
        _sync_existing_exam(db, existing, items)
        return

    theme = db.query(Theme).order_by(Theme.sort_order.asc()).first()
    theme_id = theme.id if theme else None
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
        description=EXAM_DESCRIPTION,
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
