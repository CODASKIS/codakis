import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.deps import AdminUser, require_roles
from app.db.models import Examen, Lecon, Question, Quiz, RoleUtilisateur, StatutArticleBlog, Theme, Utilisateur
from app.db.session import get_db
from app.schemas.pedagogy import (
    ExamenAdmin,
    ExamenCreateRequest,
    ExamenPublic,
    ExamenTakePublic,
    ExamenUpdateRequest,
    LeconAdmin,
    LeconCreateRequest,
    LeconPublic,
    LeconUpdateRequest,
    QuestionAdmin,
    QuestionCreateRequest,
    QuestionUpdateRequest,
    QuizAdmin,
    QuizCreateRequest,
    QuizPublic,
    QuizTakePublic,
    QuizUpdateRequest,
    SubmitExamenResult,
    SubmitQuizRequest,
    SubmitQuizResult,
    ThemePublic,
    ThemeCreateRequest,
    ThemeUpdateRequest,
)
from app.services.pedagogy import (
    create_examen,
    create_lecon,
    create_question,
    create_quiz,
    create_theme,
    delete_theme,
    examen_to_admin,
    get_examen_questions,
    get_quiz_questions,
    has_premium_access,
    lecon_to_admin,
    lecon_to_public,
    question_to_admin,
    question_to_public,
    quiz_to_admin,
    submit_examen,
    submit_quiz,
    theme_to_public,
    update_examen,
    update_lecon,
    update_question,
    update_quiz,
    update_theme,
)

admin_router = APIRouter(prefix="/admin/pedagogy", tags=["admin-pedagogy"])
candidat_router = APIRouter(prefix="/candidat/pedagogy", tags=["candidat-pedagogy"])
CandidatUser = require_roles(RoleUtilisateur.candidat)


# --- Admin themes ---


@admin_router.get("/themes", response_model=list[ThemePublic])
def admin_list_themes(_: AdminUser, db: Session = Depends(get_db)):
    themes = db.query(Theme).filter(Theme.est_actif.is_(True)).order_by(Theme.sort_order.asc()).all()
    return [theme_to_public(db, theme) for theme in themes]


@admin_router.post("/themes", response_model=ThemePublic, status_code=status.HTTP_201_CREATED)
def admin_create_theme(payload: ThemeCreateRequest, _: AdminUser, db: Session = Depends(get_db)):
    try:
        theme = create_theme(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return theme_to_public(db, theme)


@admin_router.patch("/themes/{theme_id}", response_model=ThemePublic)
def admin_update_theme(theme_id: uuid.UUID, payload: ThemeUpdateRequest, _: AdminUser, db: Session = Depends(get_db)):
    theme = db.get(Theme, theme_id)
    if theme is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thème introuvable")
    try:
        theme = update_theme(db, theme, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return theme_to_public(db, theme)


@admin_router.delete("/themes/{theme_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_theme(theme_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    theme = db.get(Theme, theme_id)
    if theme is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thème introuvable")
    try:
        delete_theme(db, theme)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


# --- Admin leçons ---


@admin_router.get("/lecons", response_model=list[LeconAdmin])
def admin_list_lecons(_: AdminUser, db: Session = Depends(get_db), theme_id: uuid.UUID | None = None):
    query = db.query(Lecon).order_by(Lecon.sort_order.asc(), Lecon.updated_at.desc())
    if theme_id:
        query = query.filter(Lecon.theme_id == theme_id)
    return [lecon_to_admin(db, lecon) for lecon in query.all()]


@admin_router.get("/lecons/{lecon_id}", response_model=LeconAdmin)
def admin_get_lecon(lecon_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    lecon = db.get(Lecon, lecon_id)
    if lecon is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leçon introuvable")
    return lecon_to_admin(db, lecon)


@admin_router.post("/lecons", response_model=LeconAdmin, status_code=status.HTTP_201_CREATED)
def admin_create_lecon(payload: LeconCreateRequest, admin: AdminUser, db: Session = Depends(get_db)):
    try:
        lecon = create_lecon(db, admin, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return lecon_to_admin(db, lecon)


@admin_router.patch("/lecons/{lecon_id}", response_model=LeconAdmin)
def admin_update_lecon(lecon_id: uuid.UUID, payload: LeconUpdateRequest, _: AdminUser, db: Session = Depends(get_db)):
    lecon = db.get(Lecon, lecon_id)
    if lecon is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leçon introuvable")
    try:
        lecon = update_lecon(db, lecon, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return lecon_to_admin(db, lecon)


@admin_router.delete("/lecons/{lecon_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_lecon(lecon_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    lecon = db.get(Lecon, lecon_id)
    if lecon is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leçon introuvable")
    db.delete(lecon)
    db.commit()


# --- Admin questions ---


@admin_router.get("/questions", response_model=list[QuestionAdmin])
def admin_list_questions(_: AdminUser, db: Session = Depends(get_db), theme_id: uuid.UUID | None = None):
    query = db.query(Question).options(joinedload(Question.reponses)).order_by(Question.updated_at.desc())
    if theme_id:
        query = query.filter(Question.theme_id == theme_id)
    return [question_to_admin(db, question) for question in query.all()]


@admin_router.get("/questions/{question_id}", response_model=QuestionAdmin)
def admin_get_question(question_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    question = db.query(Question).options(joinedload(Question.reponses)).filter(Question.id == question_id).first()
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question introuvable")
    return question_to_admin(db, question)


@admin_router.post("/questions", response_model=QuestionAdmin, status_code=status.HTTP_201_CREATED)
def admin_create_question(payload: QuestionCreateRequest, _: AdminUser, db: Session = Depends(get_db)):
    try:
        question = create_question(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return question_to_admin(db, question)


@admin_router.patch("/questions/{question_id}", response_model=QuestionAdmin)
def admin_update_question(
    question_id: uuid.UUID, payload: QuestionUpdateRequest, _: AdminUser, db: Session = Depends(get_db)
):
    question = db.query(Question).options(joinedload(Question.reponses)).filter(Question.id == question_id).first()
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question introuvable")
    try:
        question = update_question(db, question, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return question_to_admin(db, question)


@admin_router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_question(question_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    question = db.get(Question, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question introuvable")
    db.delete(question)
    db.commit()


# --- Admin quiz ---


@admin_router.get("/quiz", response_model=list[QuizAdmin])
def admin_list_quiz(_: AdminUser, db: Session = Depends(get_db)):
    quiz_list = db.query(Quiz).order_by(Quiz.updated_at.desc()).all()
    return [quiz_to_admin(db, quiz) for quiz in quiz_list]


@admin_router.get("/quiz/{quiz_id}", response_model=QuizAdmin)
def admin_get_quiz(quiz_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    quiz = db.get(Quiz, quiz_id)
    if quiz is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz introuvable")
    return quiz_to_admin(db, quiz)


@admin_router.post("/quiz", response_model=QuizAdmin, status_code=status.HTTP_201_CREATED)
def admin_create_quiz(payload: QuizCreateRequest, _: AdminUser, db: Session = Depends(get_db)):
    try:
        quiz = create_quiz(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return quiz_to_admin(db, quiz)


@admin_router.patch("/quiz/{quiz_id}", response_model=QuizAdmin)
def admin_update_quiz(quiz_id: uuid.UUID, payload: QuizUpdateRequest, _: AdminUser, db: Session = Depends(get_db)):
    quiz = db.get(Quiz, quiz_id)
    if quiz is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz introuvable")
    try:
        quiz = update_quiz(db, quiz, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return quiz_to_admin(db, quiz)


@admin_router.delete("/quiz/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_quiz(quiz_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    quiz = db.get(Quiz, quiz_id)
    if quiz is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz introuvable")
    db.delete(quiz)
    db.commit()


# --- Admin examens ---


@admin_router.get("/examens", response_model=list[ExamenAdmin])
def admin_list_examens(_: AdminUser, db: Session = Depends(get_db)):
    examens = db.query(Examen).order_by(Examen.updated_at.desc()).all()
    return [examen_to_admin(db, examen) for examen in examens]


@admin_router.get("/examens/{examen_id}", response_model=ExamenAdmin)
def admin_get_examen(examen_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    examen = db.get(Examen, examen_id)
    if examen is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Examen introuvable")
    return examen_to_admin(db, examen)


@admin_router.post("/examens", response_model=ExamenAdmin, status_code=status.HTTP_201_CREATED)
def admin_create_examen(payload: ExamenCreateRequest, _: AdminUser, db: Session = Depends(get_db)):
    try:
        examen = create_examen(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return examen_to_admin(db, examen)


@admin_router.patch("/examens/{examen_id}", response_model=ExamenAdmin)
def admin_update_examen(
    examen_id: uuid.UUID, payload: ExamenUpdateRequest, _: AdminUser, db: Session = Depends(get_db)
):
    examen = db.get(Examen, examen_id)
    if examen is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Examen introuvable")
    try:
        examen = update_examen(db, examen, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return examen_to_admin(db, examen)


@admin_router.delete("/examens/{examen_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_examen(examen_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    examen = db.get(Examen, examen_id)
    if examen is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Examen introuvable")
    db.delete(examen)
    db.commit()


# --- Candidat ---


@candidat_router.get("/themes", response_model=list[ThemePublic])
def candidat_list_themes(candidat: Utilisateur = Depends(CandidatUser), db: Session = Depends(get_db)):
    themes = db.query(Theme).filter(Theme.est_actif.is_(True)).order_by(Theme.sort_order.asc()).all()
    premium = has_premium_access(db, candidat)
    result = []
    for theme in themes:
        payload = theme_to_public(db, theme)
        payload["locked"] = theme.is_premium and not premium
        result.append(payload)
    return result


@candidat_router.get("/themes/{theme_id}/lecons", response_model=list[LeconPublic])
def candidat_list_lecons(
    theme_id: uuid.UUID,
    candidat: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    theme = db.get(Theme, theme_id)
    if theme is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thème introuvable")
    lecons = (
        db.query(Lecon)
        .filter(Lecon.theme_id == theme_id, Lecon.status == StatutArticleBlog.published.value)
        .order_by(Lecon.sort_order.asc())
        .all()
    )
    locked = theme.is_premium and not has_premium_access(db, candidat)
    result = []
    for lecon in lecons:
        payload = lecon_to_public(lecon, theme)
        payload["locked"] = locked
        if locked:
            # Les titres restent visibles pour donner envie, jamais le contenu.
            payload["body"] = ""
        result.append(payload)
    return result


@candidat_router.get("/lecons/{lecon_id}", response_model=LeconPublic)
def candidat_get_lecon(
    lecon_id: uuid.UUID,
    candidat: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    lecon = db.get(Lecon, lecon_id)
    if lecon is None or lecon.status != StatutArticleBlog.published.value:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leçon introuvable")
    theme = db.get(Theme, lecon.theme_id)
    if theme is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thème introuvable")
    if theme.is_premium and not has_premium_access(db, candidat):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cette leçon fait partie d'un thème Premium",
        )
    return lecon_to_public(lecon, theme)


@candidat_router.get("/quiz", response_model=list[QuizPublic])
def candidat_list_quiz(_: Utilisateur = Depends(CandidatUser), db: Session = Depends(get_db)):
    quiz_list = db.query(Quiz).filter(Quiz.est_actif.is_(True)).order_by(Quiz.title.asc()).all()
    result = []
    for quiz in quiz_list:
        theme = db.get(Theme, quiz.theme_id)
        linked_count = len(get_quiz_questions(db, quiz.id))
        result.append(
            {
                "id": quiz.id,
                "theme_id": quiz.theme_id,
                "theme_code": theme.code if theme else "",
                "title": quiz.title,
                "description": quiz.description,
                "question_count": quiz.question_count,
                "duree_minutes": quiz.duree_minutes,
                "linked_count": linked_count,
            }
        )
    return result


@candidat_router.get("/quiz/{quiz_id}", response_model=QuizTakePublic)
def candidat_get_quiz(quiz_id: uuid.UUID, _: Utilisateur = Depends(CandidatUser), db: Session = Depends(get_db)):
    quiz = db.get(Quiz, quiz_id)
    if quiz is None or not quiz.est_actif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz introuvable")
    theme = db.get(Theme, quiz.theme_id)
    questions = get_quiz_questions(db, quiz.id)
    return {
        "id": quiz.id,
        "title": quiz.title,
        "theme_code": theme.code if theme else "",
        "duree_minutes": quiz.duree_minutes,
        "questions": [question_to_public(question) for question in questions],
    }


@candidat_router.post("/quiz/{quiz_id}/submit", response_model=SubmitQuizResult)
def candidat_submit_quiz(
    quiz_id: uuid.UUID,
    payload: SubmitQuizRequest,
    candidat: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    quiz = db.get(Quiz, quiz_id)
    if quiz is None or not quiz.est_actif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz introuvable")
    try:
        return submit_quiz(db, candidat, quiz, payload.answers)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@candidat_router.get("/examens", response_model=list[ExamenPublic])
def candidat_list_examens(_: Utilisateur = Depends(CandidatUser), db: Session = Depends(get_db)):
    examens = db.query(Examen).filter(Examen.est_actif.is_(True)).order_by(Examen.title.asc()).all()
    result = []
    for examen in examens:
        linked_count = len(get_examen_questions(db, examen.id))
        result.append(
            {
                "id": examen.id,
                "title": examen.title,
                "description": examen.description,
                "duree_minutes": examen.duree_minutes,
                "nb_questions": examen.nb_questions,
                "max_erreurs": examen.max_erreurs,
                "linked_count": linked_count,
            }
        )
    return result


@candidat_router.get("/examens/{examen_id}", response_model=ExamenTakePublic)
def candidat_get_examen(examen_id: uuid.UUID, _: Utilisateur = Depends(CandidatUser), db: Session = Depends(get_db)):
    examen = db.get(Examen, examen_id)
    if examen is None or not examen.est_actif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Examen introuvable")
    questions = get_examen_questions(db, examen.id)
    return {
        "id": examen.id,
        "title": examen.title,
        "duree_minutes": examen.duree_minutes,
        "max_erreurs": examen.max_erreurs,
        "questions": [question_to_public(question) for question in questions],
    }


@candidat_router.post("/examens/{examen_id}/submit", response_model=SubmitExamenResult)
def candidat_submit_examen(
    examen_id: uuid.UUID,
    payload: SubmitQuizRequest,
    candidat: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    examen = db.get(Examen, examen_id)
    if examen is None or not examen.est_actif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Examen introuvable")
    try:
        return submit_examen(db, candidat, examen, payload.answers, payload.duree_sec)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
