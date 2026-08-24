import uuid
from datetime import UTC, datetime

from sqlalchemy.orm import Session, joinedload

from app.db.models import (
    Examen,
    ExamenQuestion,
    Lecon,
    LeconProgress,
    Paiement,
    Question,
    Quiz,
    QuizQuestion,
    Reponse,
    StatutArticleBlog,
    TentativeExamen,
    TentativeQuiz,
    Theme,
    Utilisateur,
)
from app.services.media import slugify

THEME_SEED: list[tuple[str, str, str, int, bool]] = [
    ("signalisation", "Signalisation routière", "Road signs", 1, False),
    ("priorites", "Priorités & intersections", "Priorities & intersections", 2, False),
    ("circulation", "Règles de circulation", "Traffic rules", 3, False),
    ("vitesse", "Vitesse & distances de sécurité", "Speed & safety distances", 4, True),
    ("stationnement", "Arrêt & stationnement", "Stopping & parking", 5, True),
    ("vehicule", "Véhicule, éclairage & équipements", "Vehicle, lighting & equipment", 6, True),
    ("documents", "Documents & contrôles", "Documents & controls", 7, True),
    ("comportement", "Comportement, alcool & substances", "Behaviour, alcohol & substances", 8, True),
    ("usagers", "Usagers vulnérables", "Vulnerable road users", 9, True),
    ("contexte_local", "Particularités camerounaises & CEMAC", "Cameroon & CEMAC specifics", 10, True),
]


def seed_themes(db: Session) -> None:
    for code, title_fr, title_en, sort_order, is_premium in THEME_SEED:
        if db.query(Theme).filter(Theme.code == code).first() is None:
            db.add(
                Theme(
                    code=code,
                    title_fr=title_fr,
                    title_en=title_en,
                    sort_order=sort_order,
                    is_premium=is_premium,
                )
            )
    db.commit()


def seed_lecons(db: Session, author: Utilisateur | None) -> None:
    if db.query(Lecon).count() > 0:
        return
    now = datetime.now(UTC)
    demo_pdf = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    lesson_templates = (
        ("introduction", "Introduction", "Notions essentielles et objectifs du module."),
        ("approfondissement", "Approfondissement", "Cas pratiques et situations d'examen."),
        ("synthese", "Synthèse", "Récapitulatif et fiche mémo à télécharger."),
    )
    for code, title_fr, _title_en, _sort_order, _is_premium in THEME_SEED:
        theme = db.query(Theme).filter(Theme.code == code).first()
        if theme is None:
            continue
        for index, (suffix, part_title, part_excerpt) in enumerate(lesson_templates, start=1):
            body = (
                f"<p>Bienvenue dans la leçon <strong>{part_title}</strong> du thème "
                f"<em>{title_fr}</em>.</p>"
                "<h2>Objectifs</h2>"
                "<ul>"
                "<li>Comprendre les règles essentielles du thème CEMAC</li>"
                "<li>Repérer les situations fréquentes à l'examen au Cameroun</li>"
                "<li>Adopter les bons réflexes en circulation urbaine et interurbaine</li>"
                "</ul>"
                f"<h2>{part_title}</h2>"
                f"<p>Cette section couvre {part_excerpt.lower()} "
                f"Relisez le contenu puis validez la question de contrôle avant de passer à la suite.</p>"
            )
            if index == 3:
                body += (
                    "<h2>Document à télécharger</h2>"
                    f'<p><a href="{demo_pdf}" target="_blank" rel="noopener">'
                    f"Fiche PDF — {title_fr} (mémo CODAKIS)</a></p>"
                )
            db.add(
                Lecon(
                    theme_id=theme.id,
                    slug=f"{code}-{suffix}",
                    title=f"{part_title} — {title_fr}",
                    excerpt=part_excerpt,
                    body=body,
                    sort_order=index,
                    status=StatutArticleBlog.published.value,
                    published_at=now,
                    author_id=author.id if author else None,
                )
            )
    db.commit()


def _apply_publish(status: str, current_published: datetime | None) -> datetime | None:
    if status == StatutArticleBlog.published.value:
        return current_published or datetime.now(UTC)
    return None


def _validate_reponses(reponses: list) -> None:
    if len(reponses) < 2:
        raise ValueError("Au moins 2 réponses sont requises")
    correct = sum(1 for item in reponses if item.est_correcte)
    if correct != 1:
        raise ValueError("Exactement une réponse doit être marquée comme correcte")


def has_premium_access(db: Session, user: Utilisateur) -> bool:
    """Accès plateforme : abonnement CODAKIS payé et confirmé (cours, quiz, examens)."""
    return has_platform_access(db, user)


def has_platform_access(db: Session, user: Utilisateur) -> bool:
    row = (
        db.query(Paiement)
        .filter(
            Paiement.utilisateur_id == user.id,
            Paiement.purpose == "subscription",
            Paiement.status == "completed",
        )
        .order_by(Paiement.completed_at.desc())
        .first()
    )
    if row is None:
        return False
    if (row.amount_fcfa or 0) > 0:
        return True
    return row.plan_id in {"pro", "premium", "entreprise"}


def ensure_platform_access(db: Session, user: Utilisateur) -> None:
    if not has_platform_access(db, user):
        raise ValueError(
            "Abonnement CODAKIS requis pour accéder aux cours, quiz et examens. "
            "Souscrivez via Mobile Money depuis votre espace candidat."
        )


def theme_to_public(db: Session, theme: Theme) -> dict:
    lecon_count = db.query(Lecon).filter(Lecon.theme_id == theme.id).count()
    quiz_count = db.query(Quiz).filter(Quiz.theme_id == theme.id, Quiz.est_actif.is_(True)).count()
    return {
        "id": theme.id,
        "code": theme.code,
        "title_fr": theme.title_fr,
        "title_en": theme.title_en,
        "sort_order": theme.sort_order,
        "is_premium": theme.is_premium,
        "lecon_count": lecon_count,
        "quiz_count": quiz_count,
    }


def create_theme(db: Session, data) -> Theme:
    code = slugify(data.code.strip())
    if db.query(Theme).filter(Theme.code == code).first():
        raise ValueError("Ce code thème existe déjà")
    theme = Theme(
        code=code,
        title_fr=data.title_fr.strip(),
        title_en=data.title_en.strip(),
        sort_order=data.sort_order,
        is_premium=data.is_premium,
    )
    db.add(theme)
    db.commit()
    db.refresh(theme)
    return theme


def update_theme(db: Session, theme: Theme, data) -> Theme:
    if data.code is not None:
        code = slugify(data.code.strip())
        conflict = db.query(Theme).filter(Theme.code == code, Theme.id != theme.id).first()
        if conflict:
            raise ValueError("Ce code thème existe déjà")
        theme.code = code
    if data.title_fr is not None:
        theme.title_fr = data.title_fr.strip()
    if data.title_en is not None:
        theme.title_en = data.title_en.strip()
    if data.sort_order is not None:
        theme.sort_order = data.sort_order
    if data.is_premium is not None:
        theme.is_premium = data.is_premium
    if data.est_actif is not None:
        theme.est_actif = data.est_actif
    db.commit()
    db.refresh(theme)
    return theme


def delete_theme(db: Session, theme: Theme) -> None:
    linked = db.query(Lecon).filter(Lecon.theme_id == theme.id).count()
    if linked:
        raise ValueError("Impossible de supprimer un thème contenant des leçons")
    db.delete(theme)
    db.commit()


def lecon_to_admin(db: Session, lecon: Lecon) -> dict:
    theme = db.get(Theme, lecon.theme_id)
    return {
        "id": lecon.id,
        "theme_id": lecon.theme_id,
        "theme_code": theme.code if theme else None,
        "slug": lecon.slug,
        "title": lecon.title,
        "excerpt": lecon.excerpt,
        "body": lecon.body,
        "cover_image_url": lecon.cover_image_url,
        "sort_order": lecon.sort_order,
        "status": lecon.status,
        "published_at": lecon.published_at,
        "created_at": lecon.created_at,
        "updated_at": lecon.updated_at,
    }


def lecon_to_public(lecon: Lecon, theme: Theme) -> dict:
    return {
        "id": lecon.id,
        "theme_id": lecon.theme_id,
        "theme_code": theme.code,
        "slug": lecon.slug,
        "title": lecon.title,
        "excerpt": lecon.excerpt,
        "body": lecon.body,
        "cover_image_url": lecon.cover_image_url,
        "sort_order": lecon.sort_order,
        "published_at": lecon.published_at,
    }


def question_to_admin(db: Session, question: Question) -> dict:
    theme = db.get(Theme, question.theme_id) if question.theme_id else None
    reponses = sorted(question.reponses, key=lambda item: item.sort_order)
    return {
        "id": question.id,
        "theme_id": question.theme_id,
        "theme_code": theme.code if theme else None,
        "prompt": question.prompt,
        "image_url": question.image_url,
        "video_url": question.video_url,
        "explanation": question.explanation,
        "difficulty": question.difficulty,
        "est_actif": question.est_actif,
        "reponses": [
            {
                "id": item.id,
                "label": item.label,
                "texte": item.texte,
                "est_correcte": item.est_correcte,
                "sort_order": item.sort_order,
            }
            for item in reponses
        ],
        "created_at": question.created_at,
        "updated_at": question.updated_at,
    }


def question_to_public(question: Question) -> dict:
    reponses = sorted(question.reponses, key=lambda item: item.sort_order)
    return {
        "id": question.id,
        "prompt": question.prompt,
        "image_url": question.image_url,
        "video_url": question.video_url,
        "reponses": [{"id": item.id, "label": item.label, "texte": item.texte} for item in reponses],
    }


def _sync_reponses(db: Session, question: Question, reponses_data: list) -> None:
    _validate_reponses(reponses_data)
    existing = {item.id: item for item in question.reponses}
    keep_ids: set[uuid.UUID] = set()
    for index, item in enumerate(reponses_data):
        if item.id and item.id in existing:
            row = existing[item.id]
            row.label = item.label.strip().upper()
            row.texte = item.texte.strip()
            row.est_correcte = item.est_correcte
            row.sort_order = item.sort_order if item.sort_order else index
            keep_ids.add(row.id)
        else:
            row = Reponse(
                question_id=question.id,
                label=item.label.strip().upper(),
                texte=item.texte.strip(),
                est_correcte=item.est_correcte,
                sort_order=item.sort_order if item.sort_order else index,
            )
            db.add(row)
    for row in list(question.reponses):
        if row.id not in keep_ids:
            db.delete(row)


def create_lecon(db: Session, author: Utilisateur, data) -> Lecon:
    theme = db.get(Theme, data.theme_id)
    if theme is None:
        raise ValueError("Thème introuvable")
    slug = slugify(data.slug or data.title)
    if db.query(Lecon).filter(Lecon.slug == slug).first():
        raise ValueError("Ce slug de leçon existe déjà")
    lecon = Lecon(
        theme_id=data.theme_id,
        slug=slug,
        title=data.title.strip(),
        excerpt=(data.excerpt or "").strip() or None,
        body=data.body or "",
        cover_image_url=(data.cover_image_url or "").strip() or None,
        sort_order=data.sort_order,
        status=data.status,
        author_id=author.id,
        published_at=_apply_publish(data.status, None),
    )
    db.add(lecon)
    db.commit()
    db.refresh(lecon)
    return lecon


def update_lecon(db: Session, lecon: Lecon, data) -> Lecon:
    if data.theme_id is not None:
        if db.get(Theme, data.theme_id) is None:
            raise ValueError("Thème introuvable")
        lecon.theme_id = data.theme_id
    if data.title is not None:
        lecon.title = data.title.strip()
    if data.slug is not None:
        slug = slugify(data.slug)
        conflict = db.query(Lecon).filter(Lecon.slug == slug, Lecon.id != lecon.id).first()
        if conflict:
            raise ValueError("Ce slug de leçon existe déjà")
        lecon.slug = slug
    if data.excerpt is not None:
        lecon.excerpt = data.excerpt.strip() or None
    if data.body is not None:
        lecon.body = data.body
    if data.cover_image_url is not None:
        lecon.cover_image_url = data.cover_image_url.strip() or None
    if data.sort_order is not None:
        lecon.sort_order = data.sort_order
    if data.status is not None:
        lecon.status = data.status
        lecon.published_at = _apply_publish(data.status, lecon.published_at)
    db.commit()
    db.refresh(lecon)
    return lecon


def create_question(db: Session, data) -> Question:
    _validate_reponses(data.reponses)
    if data.theme_id and db.get(Theme, data.theme_id) is None:
        raise ValueError("Thème introuvable")
    question = Question(
        theme_id=data.theme_id,
        prompt=data.prompt.strip(),
        image_url=(data.image_url or "").strip() or None,
        video_url=(data.video_url or "").strip() or None,
        explanation=(data.explanation or "").strip() or None,
        difficulty=data.difficulty,
        est_actif=data.est_actif,
    )
    db.add(question)
    db.flush()
    for index, item in enumerate(data.reponses):
        db.add(
            Reponse(
                question_id=question.id,
                label=item.label.strip().upper(),
                texte=item.texte.strip(),
                est_correcte=item.est_correcte,
                sort_order=item.sort_order if item.sort_order else index,
            )
        )
    db.commit()
    db.refresh(question)
    return db.query(Question).options(joinedload(Question.reponses)).filter(Question.id == question.id).one()


def update_question(db: Session, question: Question, data) -> Question:
    if data.theme_id is not None:
        if data.theme_id and db.get(Theme, data.theme_id) is None:
            raise ValueError("Thème introuvable")
        question.theme_id = data.theme_id
    if data.prompt is not None:
        question.prompt = data.prompt.strip()
    if data.image_url is not None:
        question.image_url = data.image_url.strip() or None
    if data.video_url is not None:
        question.video_url = data.video_url.strip() or None
    if data.explanation is not None:
        question.explanation = data.explanation.strip() or None
    if data.difficulty is not None:
        question.difficulty = data.difficulty
    if data.est_actif is not None:
        question.est_actif = data.est_actif
    if data.reponses is not None:
        _sync_reponses(db, question, data.reponses)
    db.commit()
    db.refresh(question)
    return db.query(Question).options(joinedload(Question.reponses)).filter(Question.id == question.id).one()


def _sync_quiz_questions(db: Session, quiz: Quiz, question_ids: list[uuid.UUID]) -> None:
    db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).delete(synchronize_session=False)
    for index, question_id in enumerate(question_ids):
        if db.get(Question, question_id) is None:
            raise ValueError(f"Question introuvable : {question_id}")
        db.add(QuizQuestion(quiz_id=quiz.id, question_id=question_id, sort_order=index))


def create_quiz(db: Session, data) -> Quiz:
    if db.get(Theme, data.theme_id) is None:
        raise ValueError("Thème introuvable")
    sort_order = data.sort_order
    if sort_order <= 0:
        sort_order = _next_course_sort_order(db, data.theme_id)
    quiz = Quiz(
        theme_id=data.theme_id,
        title=data.title.strip(),
        description=(data.description or "").strip() or None,
        question_count=data.question_count,
        duree_minutes=data.duree_minutes,
        est_actif=data.est_actif,
        sort_order=sort_order,
        in_course_path=data.in_course_path,
    )
    db.add(quiz)
    db.flush()
    if data.question_ids:
        _sync_quiz_questions(db, quiz, data.question_ids)
    db.commit()
    db.refresh(quiz)
    return quiz


def update_quiz(db: Session, quiz: Quiz, data) -> Quiz:
    if data.theme_id is not None:
        if db.get(Theme, data.theme_id) is None:
            raise ValueError("Thème introuvable")
        quiz.theme_id = data.theme_id
    if data.title is not None:
        quiz.title = data.title.strip()
    if data.description is not None:
        quiz.description = data.description.strip() or None
    if data.question_count is not None:
        quiz.question_count = data.question_count
    if data.duree_minutes is not None:
        quiz.duree_minutes = data.duree_minutes
    if data.est_actif is not None:
        quiz.est_actif = data.est_actif
    if data.sort_order is not None:
        quiz.sort_order = data.sort_order
    if data.in_course_path is not None:
        quiz.in_course_path = data.in_course_path
    if data.question_ids is not None:
        _sync_quiz_questions(db, quiz, data.question_ids)
    db.commit()
    db.refresh(quiz)
    return quiz


def quiz_to_admin(db: Session, quiz: Quiz) -> dict:
    theme = db.get(Theme, quiz.theme_id)
    links = (
        db.query(QuizQuestion)
        .filter(QuizQuestion.quiz_id == quiz.id)
        .order_by(QuizQuestion.sort_order.asc())
        .all()
    )
    question_ids = [link.question_id for link in links]
    return {
        "id": quiz.id,
        "theme_id": quiz.theme_id,
        "theme_code": theme.code if theme else None,
        "title": quiz.title,
        "description": quiz.description,
        "question_count": quiz.question_count,
        "duree_minutes": quiz.duree_minutes,
        "est_actif": quiz.est_actif,
        "sort_order": quiz.sort_order,
        "in_course_path": quiz.in_course_path,
        "linked_count": len(question_ids),
        "question_ids": question_ids,
        "created_at": quiz.created_at,
        "updated_at": quiz.updated_at,
    }


def _sync_examen_questions(db: Session, examen: Examen, question_ids: list[uuid.UUID]) -> None:
    db.query(ExamenQuestion).filter(ExamenQuestion.examen_id == examen.id).delete(synchronize_session=False)
    for index, question_id in enumerate(question_ids):
        if db.get(Question, question_id) is None:
            raise ValueError(f"Question introuvable : {question_id}")
        db.add(ExamenQuestion(examen_id=examen.id, question_id=question_id, sort_order=index))


def create_examen(db: Session, data) -> Examen:
    examen = Examen(
        title=data.title.strip(),
        description=(data.description or "").strip() or None,
        duree_minutes=data.duree_minutes,
        nb_questions=data.nb_questions,
        max_erreurs=data.max_erreurs,
        est_actif=data.est_actif,
    )
    db.add(examen)
    db.flush()
    if data.question_ids:
        _sync_examen_questions(db, examen, data.question_ids)
    db.commit()
    db.refresh(examen)
    return examen


def update_examen(db: Session, examen: Examen, data) -> Examen:
    if data.title is not None:
        examen.title = data.title.strip()
    if data.description is not None:
        examen.description = data.description.strip() or None
    if data.duree_minutes is not None:
        examen.duree_minutes = data.duree_minutes
    if data.nb_questions is not None:
        examen.nb_questions = data.nb_questions
    if data.max_erreurs is not None:
        examen.max_erreurs = data.max_erreurs
    if data.est_actif is not None:
        examen.est_actif = data.est_actif
    if data.question_ids is not None:
        _sync_examen_questions(db, examen, data.question_ids)
    db.commit()
    db.refresh(examen)
    return examen


def examen_to_admin(db: Session, examen: Examen) -> dict:
    links = (
        db.query(ExamenQuestion)
        .filter(ExamenQuestion.examen_id == examen.id)
        .order_by(ExamenQuestion.sort_order.asc())
        .all()
    )
    question_ids = [link.question_id for link in links]
    return {
        "id": examen.id,
        "title": examen.title,
        "description": examen.description,
        "duree_minutes": examen.duree_minutes,
        "nb_questions": examen.nb_questions,
        "max_erreurs": examen.max_erreurs,
        "est_actif": examen.est_actif,
        "linked_count": len(question_ids),
        "question_ids": question_ids,
        "created_at": examen.created_at,
        "updated_at": examen.updated_at,
    }


def get_quiz_questions(db: Session, quiz_id: uuid.UUID) -> list[Question]:
    links = (
        db.query(QuizQuestion)
        .filter(QuizQuestion.quiz_id == quiz_id)
        .order_by(QuizQuestion.sort_order.asc())
        .all()
    )
    questions: list[Question] = []
    for link in links:
        question = (
            db.query(Question)
            .options(joinedload(Question.reponses))
            .filter(Question.id == link.question_id, Question.est_actif.is_(True))
            .first()
        )
        if question:
            questions.append(question)
    return questions


def get_examen_questions(db: Session, examen_id: uuid.UUID) -> list[Question]:
    links = (
        db.query(ExamenQuestion)
        .filter(ExamenQuestion.examen_id == examen_id)
        .order_by(ExamenQuestion.sort_order.asc())
        .all()
    )
    questions: list[Question] = []
    for link in links:
        question = (
            db.query(Question)
            .options(joinedload(Question.reponses))
            .filter(Question.id == link.question_id, Question.est_actif.is_(True))
            .first()
        )
        if question:
            questions.append(question)
    return questions


def _detail_for_storage(detail: dict) -> dict:
    return {
        "question_id": str(detail["question_id"]),
        "reponse_id": str(detail["reponse_id"]) if detail.get("reponse_id") else None,
        "correct_reponse_id": str(detail["correct_reponse_id"])
        if detail.get("correct_reponse_id")
        else None,
        "est_correcte": detail["est_correcte"],
        "explanation": detail.get("explanation"),
    }


def _details_for_response(details: list[dict]) -> list[dict]:
    return [_detail_for_storage(item) for item in details]


def _score_answers(questions: list[Question], answers: list) -> tuple[int, list[dict]]:
    answer_map = {item.question_id: item.reponse_id for item in answers}
    details: list[dict] = []
    correct_count = 0
    for question in questions:
        chosen_id = answer_map.get(question.id)
        correct = next((item for item in question.reponses if item.est_correcte), None)
        is_correct = bool(correct and chosen_id == correct.id)
        if is_correct:
            correct_count += 1
        details.append(
            {
                "question_id": question.id,
                "reponse_id": chosen_id,
                "correct_reponse_id": correct.id if correct else None,
                "est_correcte": is_correct,
                "explanation": question.explanation,
            }
        )
    return correct_count, details


def submit_quiz(db: Session, candidat: Utilisateur, quiz: Quiz, answers: list) -> dict:
    questions = get_quiz_questions(db, quiz.id)
    if not questions:
        raise ValueError("Ce quiz ne contient aucune question")
    nb_correctes, details = _score_answers(questions, answers)
    nb_total = len(questions)
    score = round(nb_correctes / nb_total * 100) if nb_total else 0
    reussi = nb_correctes >= max(1, int(nb_total * 0.7))
    db.add(
        TentativeQuiz(
            candidat_id=candidat.id,
            quiz_id=quiz.id,
            score=score,
            nb_correctes=nb_correctes,
            nb_total=nb_total,
            reussi=reussi,
            reponses_json=[_detail_for_storage(item) for item in details],
        )
    )
    db.commit()
    return {
        "score": score,
        "nb_correctes": nb_correctes,
        "nb_total": nb_total,
        "reussi": reussi,
        "details": _details_for_response(details),
    }


def submit_examen(db: Session, candidat: Utilisateur, examen: Examen, answers: list, duree_sec: int | None) -> dict:
    questions = get_examen_questions(db, examen.id)
    if not questions:
        raise ValueError("Cet examen ne contient aucune question")
    nb_correctes, details = _score_answers(questions, answers)
    nb_total = len(questions)
    nb_erreurs = nb_total - nb_correctes
    score = round(nb_correctes / nb_total * 100) if nb_total else 0
    reussi = nb_erreurs <= examen.max_erreurs
    db.add(
        TentativeExamen(
            candidat_id=candidat.id,
            examen_id=examen.id,
            score=score,
            nb_erreurs=nb_erreurs,
            reussi=reussi,
            duree_sec=duree_sec,
            reponses_json=[_detail_for_storage(item) for item in details],
        )
    )
    db.commit()
    return {
        "score": score,
        "nb_erreurs": nb_erreurs,
        "nb_total": nb_total,
        "reussi": reussi,
        "details": _details_for_response(details),
    }


def _published_lecon_ids(db: Session) -> list[uuid.UUID]:
    rows = (
        db.query(Lecon.id)
        .filter(Lecon.status == StatutArticleBlog.published.value)
        .order_by(Lecon.sort_order.asc())
        .all()
    )
    return [row[0] for row in rows]


def _passed_quiz_ids(db: Session, candidat: Utilisateur) -> list[str]:
    rows = (
        db.query(TentativeQuiz.quiz_id)
        .filter(TentativeQuiz.candidat_id == candidat.id, TentativeQuiz.reussi.is_(True))
        .distinct()
        .all()
    )
    return [str(row[0]) for row in rows]


def _passed_examen_ids(db: Session, candidat: Utilisateur) -> list[str]:
    rows = (
        db.query(TentativeExamen.examen_id)
        .filter(TentativeExamen.candidat_id == candidat.id, TentativeExamen.reussi.is_(True))
        .distinct()
        .all()
    )
    return [str(row[0]) for row in rows]


def get_candidat_progress(db: Session, candidat: Utilisateur) -> dict:
    published_ids = _published_lecon_ids(db)
    total = len(published_ids)
    if total == 0:
        return {
            "completed_lecon_ids": [],
            "passed_quiz_ids": _passed_quiz_ids(db, candidat),
            "passed_examen_ids": _passed_examen_ids(db, candidat),
            "total_lecons": 0,
            "completed_count": 0,
            "percent": 0,
        }
    completed_rows = (
        db.query(LeconProgress.lecon_id)
        .filter(
            LeconProgress.candidat_id == candidat.id,
            LeconProgress.lecon_id.in_(published_ids),
        )
        .all()
    )
    completed_ids = [str(row[0]) for row in completed_rows]
    completed_count = len(completed_ids)
    percent = round(completed_count / total * 100) if total else 0
    return {
        "completed_lecon_ids": completed_ids,
        "passed_quiz_ids": _passed_quiz_ids(db, candidat),
        "passed_examen_ids": _passed_examen_ids(db, candidat),
        "total_lecons": total,
        "completed_count": completed_count,
        "percent": percent,
    }


def mark_lecon_complete(db: Session, candidat: Utilisateur, lecon: Lecon) -> dict:
    if lecon.status != StatutArticleBlog.published.value:
        raise ValueError("Leçon indisponible")
    existing = (
        db.query(LeconProgress)
        .filter(LeconProgress.candidat_id == candidat.id, LeconProgress.lecon_id == lecon.id)
        .first()
    )
    if existing is None:
        db.add(LeconProgress(candidat_id=candidat.id, lecon_id=lecon.id, completed_at=datetime.now(UTC)))
        db.commit()
    return get_candidat_progress(db, candidat)


def get_theme_checkpoint(db: Session, theme_id: uuid.UUID, lecon: Lecon | None = None) -> dict | None:
    questions = (
        db.query(Question)
        .options(joinedload(Question.reponses))
        .filter(Question.theme_id == theme_id, Question.est_actif.is_(True))
        .order_by(Question.created_at.asc())
        .all()
    )
    if not questions:
        return None
    index = 0
    if lecon is not None:
        index = max(0, lecon.sort_order - 1) % len(questions)
    return question_to_public(questions[index])


def _next_course_sort_order(db: Session, theme_id: uuid.UUID) -> int:
    lecon_max = (
        db.query(Lecon.sort_order)
        .filter(Lecon.theme_id == theme_id)
        .order_by(Lecon.sort_order.desc())
        .limit(1)
        .scalar()
    )
    quiz_max = (
        db.query(Quiz.sort_order)
        .filter(Quiz.theme_id == theme_id, Quiz.in_course_path.is_(True))
        .order_by(Quiz.sort_order.desc())
        .limit(1)
        .scalar()
    )
    return max(lecon_max or 0, quiz_max or 0) + 10


def build_theme_course_steps(
    db: Session,
    theme_id: uuid.UUID,
    *,
    include_drafts: bool = False,
    active_only: bool = True,
) -> list[dict]:
    lecon_query = db.query(Lecon).filter(Lecon.theme_id == theme_id)
    if not include_drafts:
        lecon_query = lecon_query.filter(Lecon.status == StatutArticleBlog.published.value)
    lecons = lecon_query.order_by(Lecon.sort_order.asc(), Lecon.created_at.asc()).all()

    quiz_query = db.query(Quiz).filter(Quiz.theme_id == theme_id, Quiz.in_course_path.is_(True))
    if active_only:
        quiz_query = quiz_query.filter(Quiz.est_actif.is_(True))
    quizzes = quiz_query.order_by(Quiz.sort_order.asc(), Quiz.created_at.asc()).all()

    steps: list[dict] = []
    for lecon in lecons:
        steps.append(
            {
                "type": "lecon",
                "id": str(lecon.id),
                "ref": str(lecon.id),
                "title": lecon.title,
                "sort_order": lecon.sort_order,
                "status": lecon.status,
            }
        )

    for quiz in quizzes:
        if not get_quiz_questions(db, quiz.id):
            continue
        steps.append(
            {
                "type": "quiz",
                "id": str(quiz.id),
                "ref": f"quiz-{quiz.id}",
                "title": quiz.title,
                "sort_order": quiz.sort_order,
                "status": "published" if quiz.est_actif else "draft",
            }
        )

    steps.sort(key=lambda item: (item["sort_order"], item["type"] == "quiz", item["title"]))
    return steps


def get_theme_course_path(db: Session, theme_id: uuid.UUID, candidat: Utilisateur) -> dict:
    steps = build_theme_course_steps(db, theme_id, include_drafts=False, active_only=True)
    progress = get_candidat_progress(db, candidat)
    return {
        "theme_id": str(theme_id),
        "steps": steps,
        "completed_lecon_ids": progress["completed_lecon_ids"],
        "passed_quiz_ids": progress["passed_quiz_ids"],
    }


def get_theme_course_path_admin(db: Session, theme_id: uuid.UUID) -> dict:
    return {
        "theme_id": str(theme_id),
        "steps": build_theme_course_steps(db, theme_id, include_drafts=True, active_only=False),
        "completed_lecon_ids": [],
        "passed_quiz_ids": [],
    }


def validate_checkpoint_answer(db: Session, question_id: uuid.UUID, reponse_id: uuid.UUID) -> dict:
    question = (
        db.query(Question)
        .options(joinedload(Question.reponses))
        .filter(Question.id == question_id, Question.est_actif.is_(True))
        .first()
    )
    if question is None:
        raise ValueError("Question introuvable")
    correct = next((item for item in question.reponses if item.est_correcte), None)
    is_correct = bool(correct and correct.id == reponse_id)
    return {
        "est_correcte": is_correct,
        "correct_reponse_id": str(correct.id) if correct else None,
        "explanation": question.explanation,
    }
