import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload, load_only

from app.core.deps import AdminUser, require_roles
from app.db.models import Examen, Lecon, Question, Quiz, RoleUtilisateur, StatutArticleBlog, Theme, Utilisateur
from app.db.session import get_db
from app.schemas.pedagogy import (
    CandidatProgressResponse,
    CandidatDashboardResponse,
    CheckpointValidateRequest,
    CheckpointValidateResponse,
    CoursePathResponse,
    QuestionPublic,
    TtsRequest,
    TutorRequest,
    TutorResponse,
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
    build_theme_public_payloads,
    create_examen,
    create_lecon,
    create_question,
    create_quiz,
    create_theme,
    delete_theme,
    examen_to_admin,
    get_candidat_dashboard,
    get_candidat_progress,
    get_examen_questions,
    get_quiz_questions,
    get_theme_checkpoint,
    get_theme_course_path,
    get_theme_course_path_admin,
    has_premium_access,
    has_platform_access,
    ensure_platform_access,
    lecon_to_admin,
    lecon_to_public,
    mark_lecon_complete,
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
    validate_checkpoint_answer,
    _count_linked_questions_for_examens,
    _count_linked_questions_for_quizzes,
)
from app.services.tts import TtsError, synthesize_speech
from app.services.mistral import MistralError, chat_tutor

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


@admin_router.get("/themes/{theme_id}/path", response_model=CoursePathResponse)
def admin_theme_course_path(theme_id: uuid.UUID, _: AdminUser, db: Session = Depends(get_db)):
    theme = db.get(Theme, theme_id)
    if theme is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thème introuvable")
    return get_theme_course_path_admin(db, theme_id)


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


@candidat_router.get("/progress", response_model=CandidatProgressResponse)
def candidat_get_progress(candidat: Utilisateur = Depends(CandidatUser), db: Session = Depends(get_db)):
    return get_candidat_progress(db, candidat)


@candidat_router.get("/dashboard", response_model=CandidatDashboardResponse)
def candidat_dashboard(candidat: Utilisateur = Depends(CandidatUser), db: Session = Depends(get_db)):
    return get_candidat_dashboard(db, candidat)


@candidat_router.post("/tutor", response_model=TutorResponse)
def candidat_tutor(
    payload: TutorRequest,
    candidat: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    try:
        ensure_platform_access(db, candidat)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    try:
        reply = chat_tutor(
            message=payload.message,
            context=payload.context,
            language=payload.language or candidat.langue or "fr",
        )
        return {"reply": reply}
    except MistralError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE if exc.status_code is None else exc.status_code,
            detail=str(exc),
        ) from exc


@candidat_router.post("/lecons/{lecon_id}/complete", response_model=CandidatProgressResponse)
def candidat_complete_lecon(
    lecon_id: uuid.UUID,
    candidat: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    lecon = db.get(Lecon, lecon_id)
    if lecon is None or lecon.status != StatutArticleBlog.published.value:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leçon introuvable")
    try:
        ensure_platform_access(db, candidat)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    try:
        return mark_lecon_complete(db, candidat, lecon)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@candidat_router.get("/themes/{theme_id}/path", response_model=CoursePathResponse)
def candidat_theme_course_path(
    theme_id: uuid.UUID,
    candidat: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    theme = db.get(Theme, theme_id)
    if theme is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thème introuvable")
    try:
        ensure_platform_access(db, candidat)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    return get_theme_course_path(db, theme_id, candidat)


@candidat_router.get("/themes/{theme_id}/checkpoint", response_model=QuestionPublic | None)
def candidat_theme_checkpoint(
    theme_id: uuid.UUID,
    lecon_id: uuid.UUID | None = Query(default=None),
    candidat: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    try:
        ensure_platform_access(db, candidat)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    lecon = None
    if lecon_id is not None:
        lecon = db.get(Lecon, lecon_id)
        if lecon is None or lecon.theme_id != theme_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leçon introuvable")
    return get_theme_checkpoint(db, theme_id, lecon)


@candidat_router.post("/tts")
def candidat_text_to_speech(
    payload: TtsRequest,
    candidat: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    try:
        ensure_platform_access(db, candidat)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    try:
        language = payload.language or candidat.langue or "fr"
        audio = synthesize_speech(payload.text, language)
    except TtsError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    return Response(content=audio, media_type="audio/mpeg")


@candidat_router.post("/checkpoint/validate", response_model=CheckpointValidateResponse)
def candidat_validate_checkpoint(
    payload: CheckpointValidateRequest,
    candidat: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    try:
        ensure_platform_access(db, candidat)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    try:
        return validate_checkpoint_answer(db, payload.question_id, payload.reponse_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@candidat_router.get("/themes", response_model=list[ThemePublic])
def candidat_list_themes(candidat: Utilisateur = Depends(CandidatUser), db: Session = Depends(get_db)):
    themes = db.query(Theme).filter(Theme.est_actif.is_(True)).order_by(Theme.sort_order.asc()).all()
    platform = has_platform_access(db, candidat)
    result = []
    for payload in build_theme_public_payloads(db, themes):
        payload["locked"] = not platform
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
        .options(
            load_only(
                Lecon.id,
                Lecon.theme_id,
                Lecon.slug,
                Lecon.title,
                Lecon.excerpt,
                Lecon.cover_image_url,
                Lecon.sort_order,
                Lecon.published_at,
            )
        )
        .filter(Lecon.theme_id == theme_id, Lecon.status == StatutArticleBlog.published.value)
        .order_by(Lecon.sort_order.asc())
        .all()
    )
    locked = not has_platform_access(db, candidat)
    result = []
    for lecon in lecons:
        payload = lecon_to_public(lecon, theme, include_body=not locked)
        payload["locked"] = locked
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
    if not has_platform_access(db, candidat):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Abonnement CODAKIS requis pour accéder aux cours",
        )
    return lecon_to_public(lecon, theme)


@candidat_router.get("/quiz", response_model=list[QuizPublic])
def candidat_list_quiz(candidat: Utilisateur = Depends(CandidatUser), db: Session = Depends(get_db)):
    try:
        ensure_platform_access(db, candidat)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    quiz_list = db.query(Quiz).filter(Quiz.est_actif.is_(True)).order_by(Quiz.title.asc()).all()
    quiz_ids = [quiz.id for quiz in quiz_list]
    theme_ids = {quiz.theme_id for quiz in quiz_list}
    themes = {theme.id: theme for theme in db.query(Theme).filter(Theme.id.in_(theme_ids)).all()}
    linked_counts = _count_linked_questions_for_quizzes(db, quiz_ids)
    return [
        {
            "id": quiz.id,
            "theme_id": quiz.theme_id,
            "theme_code": themes[quiz.theme_id].code if quiz.theme_id in themes else "",
            "title": quiz.title,
            "description": quiz.description,
            "question_count": quiz.question_count,
            "duree_minutes": quiz.duree_minutes,
            "linked_count": linked_counts.get(quiz.id, 0),
        }
        for quiz in quiz_list
    ]


@candidat_router.get("/quiz/{quiz_id}", response_model=QuizTakePublic)
def candidat_get_quiz(
    quiz_id: uuid.UUID,
    candidat: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    try:
        ensure_platform_access(db, candidat)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
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
        ensure_platform_access(db, candidat)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    try:
        return submit_quiz(db, candidat, quiz, payload.answers)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@candidat_router.get("/examens", response_model=list[ExamenPublic])
def candidat_list_examens(candidat: Utilisateur = Depends(CandidatUser), db: Session = Depends(get_db)):
    try:
        ensure_platform_access(db, candidat)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    examens = db.query(Examen).filter(Examen.est_actif.is_(True)).order_by(Examen.title.asc()).all()
    linked_counts = _count_linked_questions_for_examens(db, [examen.id for examen in examens])
    return [
        {
            "id": examen.id,
            "title": examen.title,
            "description": examen.description,
            "duree_minutes": examen.duree_minutes,
            "nb_questions": examen.nb_questions,
            "max_erreurs": examen.max_erreurs,
            "linked_count": linked_counts.get(examen.id, 0),
        }
        for examen in examens
    ]


@candidat_router.get("/examens/{examen_id}", response_model=ExamenTakePublic)
def candidat_get_examen(
    examen_id: uuid.UUID,
    candidat: Utilisateur = Depends(CandidatUser),
    db: Session = Depends(get_db),
):
    try:
        ensure_platform_access(db, candidat)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
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
        ensure_platform_access(db, candidat)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    try:
        return submit_examen(db, candidat, examen, payload.answers, payload.duree_sec)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
