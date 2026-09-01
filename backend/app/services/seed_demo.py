"""Données de démonstration CODAKIS — comptes, auto-écoles, pédagogie enrichie."""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.models import (
    AutoEcole,
    Examen,
    ExamenQuestion,
    Forfait,
    FournisseurAuth,
    Inscription,
    Lecon,
    MoniteurAutoEcole,
    Paiement,
    Question,
    Quiz,
    QuizQuestion,
    Reponse,
    RoleUtilisateur,
    SeancePratique,
    StatutArticleBlog,
    Theme,
    Utilisateur,
)
from app.services.enrollments import create_inscription, seed_default_forfaits
from app.services.users import get_or_create_ville, init_candidat_dossier

logger = logging.getLogger("codakis")

DEMO_PASSWORD = "Demo123!"
DEMO_MARKER_EMAIL = "gerant@demo.codakis.cm"

DEMO_IMAGE = "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=80"
DEMO_VIDEO_YT = "https://www.youtube.com/watch?v=FG0fTKAqZ5g"
DEMO_VIDEO_EMBED = "https://www.youtube.com/embed/FG0fTKAqZ5g"

SIM_MARKER = "data-codakis-simulation"

LESSON_SCENARIO_BY_SLUG: dict[str, tuple[str, str]] = {
    "signalisation-approfondissement": (
        "heavy-traffic",
        "Circulation dense : repérez les priorités et les distances de sécurité.",
    ),
    "priorites-approfondissement": (
        "intersection",
        "Carrefour : appliquez la priorité à droite et observez les feux.",
    ),
    "circulation-introduction": (
        "draft",
        "Scène urbaine complète : piétons, immeubles et trafic croisé.",
    ),
    "vitesse-approfondissement": (
        "curve",
        "Virage serré : adaptez votre vitesse et votre trajectoire.",
    ),
    "comportement-approfondissement": (
        "dodge",
        "Obstacles sur la route : choisissez la meilleure trajectoire.",
    ),
    "signalisation-synthese": (
        "blocked",
        "Voie partiellement bloquée : ralentissez et contournement.",
    ),
    "priorites-introduction": (
        "intersection",
        "Approche d'un carrefour : qui est prioritaire ?",
    ),
    "circulation-approfondissement": (
        "draft",
        "Trafic urbain et piétons : anticipez les déplacements.",
    ),
}

QUESTION_SCENARIO_RULES: list[tuple[str, str, str]] = [
    ("intersection", "intersection", "Visualisez la situation au carrefour avant de répondre."),
    ("piéton", "draft", "Observez les piétons et le trafic avant de choisir."),
    ("passage clouté", "draft", "Un piéton s'approche du passage clouté."),
    ("prioritaire", "intersection", "Qui passe en premier à cette intersection ?"),
    ("vitesse maximale", "curve", "Adaptez votre vitesse dans cette configuration."),
    ("panneau triangulaire", "heavy-traffic", "Circulation chargée : repérez les panneaux."),
    ("arrêter", "blocked", "Route partiellement bloquée : choisissez le bon réflexe."),
]


def _simulation_block(scenario_id: str, caption: str) -> str:
    return (
        "<h2>Simulation de conduite</h2>"
        f"<p>{caption}</p>"
        f'<div data-codakis-simulation="{scenario_id}"></div>'
    )


def inject_demo_simulations(db: Session) -> None:
    """Simulations désactivées — ne plus injecter de blocs interactifs dans le contenu démo."""
    return

DEMO_SCHOOLS: list[dict] = [
    {
        "gerant_email": "gerant@demo.codakis.cm",
        "gerant_prenom": "Marie",
        "gerant_nom": "Nkoulou",
        "raison_sociale": "Auto-École Volant Vert",
        "numero_agrement": "DEMO-CM-001",
        "city": "Douala",
        "quartier": "Bonamoussadi",
        "adresse": "Carrefour Soudanaise, Bonamoussadi",
        "telephone": "+237 6 70 00 01 01",
        "latitude": 4.0511,
        "longitude": 9.7679,
        "description": "Auto-école agréée à Douala, spécialisée code et conduite.",
        "description_longue": (
            "Volant Vert accompagne les candidats du code à la conduite avec des moniteurs "
            "expérimentés, des véhicules récents et un suivi personnalisé sur CODAKIS."
        ),
        "access_info": "Face à la station Total Bonamoussadi, 2e entrée à gauche.",
        "site_web": "https://volantvert.demo.codakis.cm",
        "logo_url": "/images/schools/volant-vert.svg",
    },
    {
        "gerant_email": "gerant2@demo.codakis.cm",
        "gerant_prenom": "Jean",
        "gerant_nom": "Mbarga",
        "raison_sociale": "Auto-École Route Pro",
        "numero_agrement": "DEMO-CM-002",
        "city": "Yaoundé",
        "quartier": "Bastos",
        "adresse": "Avenue Kennedy, Bastos",
        "telephone": "+237 6 70 00 02 02",
        "latitude": 3.8667,
        "longitude": 11.5167,
        "description": "Formation permis à Yaoundé — taux de réussite élevé.",
        "description_longue": (
            "Route Pro propose des forfaits code, conduite et complet avec planning flexible "
            "et examens blancs intégrés sur la plateforme CODAKIS."
        ),
        "access_info": "Derrière le rond-point Bastos, immeuble bleu RDC.",
        "site_web": "https://routepro.demo.codakis.cm",
        "logo_url": "/images/schools/route-pro.svg",
    },
    {
        "gerant_email": "gerant3@demo.codakis.cm",
        "gerant_prenom": "Aïcha",
        "gerant_nom": "Bello",
        "raison_sociale": "Auto-École Permis Plus",
        "numero_agrement": "DEMO-CM-003",
        "city": "Douala",
        "quartier": "Akwa",
        "adresse": "Boulevard de la Liberté, Akwa",
        "telephone": "+237 6 70 00 03 03",
        "latitude": 4.0483,
        "longitude": 9.7043,
        "description": "Permis Plus — conduite urbaine et préparation examen.",
        "description_longue": (
            "Située en centre-ville, Permis Plus forme les candidats aux particularités "
            "de la circulation doualaise et aux exigences CEMAC."
        ),
        "access_info": "En face du supermarché Akwa, étage 1.",
        "site_web": None,
        "logo_url": "/images/schools/permis-plus.svg",
    },
]

DEMO_MONITEURS: list[dict] = [
    {
        "email": "moniteur@demo.codakis.cm",
        "prenom": "Paul",
        "nom": "Essomba",
        "telephone": "+237 6 70 00 11 11",
        "school_agrement": "DEMO-CM-001",
    },
    {
        "email": "moniteur2@demo.codakis.cm",
        "prenom": "Claire",
        "nom": "Fotsing",
        "telephone": "+237 6 70 00 12 12",
        "school_agrement": "DEMO-CM-001",
    },
    {
        "email": "moniteur3@demo.codakis.cm",
        "prenom": "David",
        "nom": "Tchinda",
        "telephone": "+237 6 70 00 13 13",
        "school_agrement": "DEMO-CM-002",
    },
]

DEMO_CANDIDATS: list[dict] = [
    {
        "email": "candidat@demo.codakis.cm",
        "prenom": "Luc",
        "nom": "Ngono",
        "subscription_plan": "pro",
        "school_enrollment": False,
    },
    {
        "email": "premium@demo.codakis.cm",
        "prenom": "Sarah",
        "nom": "Manga",
        "subscription_plan": "premium",
        "school_enrollment": True,
    },
]

DEMO_QUESTIONS: list[dict] = [
    {
        "theme_code": "signalisation",
        "prompt": "Que signifie un panneau triangulaire à bordure rouge ?",
        "image_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        "video_url": None,
        "explanation": "Le triangle rouge indique un danger ou une obligation de céder le passage selon le pictogramme.",
        "reponses": [
            ("A", "Un danger ou une priorité à respecter", True),
            ("B", "Une interdiction", False),
            ("C", "Une indication touristique", False),
            ("D", "Une zone de stationnement", False),
        ],
    },
    {
        "theme_code": "signalisation",
        "prompt": "Observez la vidéo : quel panneau impose de s'arrêter avant de continuer ?",
        "image_url": None,
        "video_url": DEMO_VIDEO_YT,
        "explanation": "Le panneau STOP impose un arrêt complet, même si la voie semble libre.",
        "reponses": [
            ("A", "STOP", True),
            ("B", "Cédez le passage", False),
            ("C", "Sens interdit", False),
            ("D", "Limitation de vitesse", False),
        ],
    },
    {
        "theme_code": "priorites",
        "prompt": "À une intersection sans signalisation, qui est prioritaire ?",
        "image_url": DEMO_IMAGE,
        "video_url": None,
        "explanation": "En l'absence de panneaux, la priorité à droite s'applique au Cameroun.",
        "reponses": [
            ("A", "Le véhicule venant de droite", True),
            ("B", "Le véhicule le plus rapide", False),
            ("C", "Le véhicule le plus lourd", False),
            ("D", "Celui qui klaxonne en premier", False),
        ],
    },
    {
        "theme_code": "vitesse",
        "prompt": "Quelle est la vitesse maximale en agglomération au Cameroun ?",
        "image_url": None,
        "video_url": DEMO_VIDEO_YT,
        "explanation": "La limitation usuelle en agglomération est de 50 km/h sauf signalisation contraire.",
        "reponses": [
            ("A", "50 km/h", True),
            ("B", "70 km/h", False),
            ("C", "90 km/h", False),
            ("D", "110 km/h", False),
        ],
    },
    {
        "theme_code": "circulation",
        "prompt": "Un piéton s'engage sur un passage clouté. Que devez-vous faire ?",
        "image_url": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
        "video_url": None,
        "explanation": "Le piéton engagé sur un passage clouté est prioritaire.",
        "reponses": [
            ("A", "Ralentir et le laisser traverser", True),
            ("B", "Klaxonner pour qu'il accélère", False),
            ("C", "Passer rapidement avant lui", False),
            ("D", "Continuer à la même vitesse", False),
        ],
    },
    {
        "theme_code": "comportement",
        "prompt": "Quel taux d'alcoolémie est interdit pour un conducteur au Cameroun ?",
        "image_url": None,
        "video_url": None,
        "explanation": "La conduite sous l'emprise de l'alcool est strictement interdite.",
        "reponses": [
            ("A", "0 g/L — tolérance zéro", True),
            ("B", "0,2 g/L", False),
            ("C", "0,5 g/L", False),
            ("D", "1 g/L", False),
        ],
    },
]


def _get_or_create_user(
    db: Session,
    *,
    email: str,
    prenom: str,
    nom: str,
    role: RoleUtilisateur,
    telephone: str | None = None,
    ville_id: uuid.UUID | None = None,
) -> Utilisateur:
    user = db.query(Utilisateur).filter(Utilisateur.email == email.lower()).first()
    if user:
        return user
    user = Utilisateur(
        email=email.lower(),
        mot_de_passe_hash=hash_password(DEMO_PASSWORD),
        prenom=prenom,
        nom=nom,
        role=role.value,
        country_code="CM",
        ville_id=ville_id,
        telephone=telephone,
        langue="fr",
        fournisseur_auth=FournisseurAuth.email.value,
        est_actif=True,
    )
    db.add(user)
    db.flush()
    if role == RoleUtilisateur.candidat:
        init_candidat_dossier(db, user)
    return user


def _seed_demo_schools(db: Session, admin: Utilisateur) -> dict[str, AutoEcole]:
    schools: dict[str, AutoEcole] = {}
    now = datetime.now(UTC)
    for item in DEMO_SCHOOLS:
        existing = db.query(AutoEcole).filter(AutoEcole.numero_agrement == item["numero_agrement"]).first()
        if existing:
            existing.logo_url = item["logo_url"]
            schools[item["numero_agrement"]] = existing
            continue
        ville = get_or_create_ville(db, "CM", item["city"])
        gerant = _get_or_create_user(
            db,
            email=item["gerant_email"],
            prenom=item["gerant_prenom"],
            nom=item["gerant_nom"],
            role=RoleUtilisateur.gerant_auto_ecole,
            telephone=item["telephone"],
            ville_id=ville.id,
        )
        school = AutoEcole(
            country_code="CM",
            ville_id=ville.id,
            gerant_id=gerant.id,
            raison_sociale=item["raison_sociale"],
            numero_agrement=item["numero_agrement"],
            adresse=item["adresse"],
            quartier=item["quartier"],
            telephone=item["telephone"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            description=item["description"],
            description_longue=item["description_longue"],
            access_info=item["access_info"],
            site_web=item["site_web"],
            logo_url=item["logo_url"],
            est_validee=True,
            validee_le=now,
            validee_par=admin.id,
        )
        db.add(school)
        db.flush()
        seed_default_forfaits(db, school)
        schools[item["numero_agrement"]] = school
    db.commit()
    return schools


def _seed_demo_moniteurs(db: Session, schools: dict[str, AutoEcole]) -> None:
    for item in DEMO_MONITEURS:
        school = schools.get(item["school_agrement"])
        if school is None:
            continue
        user = _get_or_create_user(
            db,
            email=item["email"],
            prenom=item["prenom"],
            nom=item["nom"],
            role=RoleUtilisateur.moniteur,
            telephone=item["telephone"],
            ville_id=school.ville_id,
        )
        link = (
            db.query(MoniteurAutoEcole)
            .filter(
                MoniteurAutoEcole.auto_ecole_id == school.id,
                MoniteurAutoEcole.utilisateur_id == user.id,
            )
            .first()
        )
        if link is None:
            db.add(MoniteurAutoEcole(auto_ecole_id=school.id, utilisateur_id=user.id))
    db.commit()


def _ensure_demo_subscription(db: Session, user: Utilisateur, plan_id: str) -> None:
    existing = (
        db.query(Paiement)
        .filter(
            Paiement.utilisateur_id == user.id,
            Paiement.purpose == "subscription",
            Paiement.status == "completed",
        )
        .first()
    )
    amount = 15000 if plan_id == "premium" else 5000
    if existing:
        existing.plan_id = plan_id
        existing.amount_fcfa = amount
        existing.status = "completed"
        existing.completed_at = existing.completed_at or datetime.now(UTC)
        existing.message = f"Abonnement {plan_id} de démonstration (accès plateforme CODAKIS)"
        return
    db.add(
        Paiement(
            reference=f"DEMO-SUB-{user.id.hex[:8]}",
            utilisateur_id=user.id,
            purpose="subscription",
            plan_id=plan_id,
            amount_fcfa=amount,
            channel="demo",
            phone="+237600000000",
            status="completed",
            completed_at=datetime.now(UTC),
            message=f"Abonnement {plan_id} de démonstration (accès plateforme CODAKIS)",
        )
    )


def _clear_candidat_enrollments(db: Session, candidat: Utilisateur) -> None:
    inscriptions = db.query(Inscription).filter(Inscription.candidat_id == candidat.id).all()
    for inscription in inscriptions:
        db.query(SeancePratique).filter(SeancePratique.inscription_id == inscription.id).delete()
        db.delete(inscription)
    db.flush()


def _seed_demo_candidats(db: Session) -> None:
    for item in DEMO_CANDIDATS:
        user = _get_or_create_user(
            db,
            email=item["email"],
            prenom=item["prenom"],
            nom=item["nom"],
            role=RoleUtilisateur.candidat,
        )
        _ensure_demo_subscription(db, user, item["subscription_plan"])
        if not item["school_enrollment"]:
            _clear_candidat_enrollments(db, user)
    db.commit()


def _seed_demo_questions(db: Session) -> list[Question]:
    if db.query(Question).filter(Question.prompt.like("%panneau triangulaire%")).first():
        return db.query(Question).limit(20).all()
    created: list[Question] = []
    for item in DEMO_QUESTIONS:
        theme = db.query(Theme).filter(Theme.code == item["theme_code"]).first()
        question = Question(
            theme_id=theme.id if theme else None,
            prompt=item["prompt"],
            image_url=item["image_url"],
            video_url=item["video_url"],
            explanation=item["explanation"],
            difficulty=1,
            est_actif=True,
        )
        db.add(question)
        db.flush()
        for index, (label, texte, correct) in enumerate(item["reponses"]):
            db.add(
                Reponse(
                    question_id=question.id,
                    label=label,
                    texte=texte,
                    est_correcte=correct,
                    sort_order=index,
                )
            )
        created.append(question)
    db.commit()
    return created


DEMO_QUIZ_THEME_CODES = ("signalisation", "priorites", "vitesse")


def _seed_demo_quizzes_and_exams(db: Session, questions: list[Question]) -> None:
    themes = db.query(Theme).filter(Theme.est_actif.is_(True)).order_by(Theme.sort_order.asc()).all()
    for theme in themes:
        if theme.code not in DEMO_QUIZ_THEME_CODES:
            continue
        existing = db.query(Quiz).filter(Quiz.theme_id == theme.id).first()
        if existing is not None:
            continue
        theme_questions = [q for q in questions if q.theme_id == theme.id][:3]
        if not theme_questions:
            theme_questions = questions[:3]
        if not theme_questions:
            continue
        quiz = Quiz(
            theme_id=theme.id,
            title=f"Quiz — {theme.title_fr}",
            description=f"Entraînement rapide sur le thème « {theme.title_fr} ».",
            question_count=len(theme_questions),
            duree_minutes=max(5, len(theme_questions) * 2),
            est_actif=True,
            sort_order=100,
            in_course_path=True,
        )
        db.add(quiz)
        db.flush()
        for index, question in enumerate(theme_questions):
            db.add(QuizQuestion(quiz_id=quiz.id, question_id=question.id, sort_order=index))

    if db.query(Examen).count() > 0:
        db.commit()
        return

    exam = Examen(
        title="Examen blanc CEMAC — démo",
        description="Simulation d'examen théorique avec questions illustrées et vidéos.",
        duree_minutes=30,
        nb_questions=min(len(questions), 6),
        max_erreurs=2,
        est_actif=True,
    )
    db.add(exam)
    db.flush()
    for index, question in enumerate(questions[:6]):
        db.add(ExamenQuestion(examen_id=exam.id, question_id=question.id, sort_order=index))
    db.commit()


def _expand_demo_lessons(db: Session) -> None:
    """Ajoute des leçons segmentées et documents PDF si un thème n'en a qu'une."""
    demo_pdf = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    now = datetime.now(UTC)
    themes = db.query(Theme).filter(Theme.est_actif.is_(True)).order_by(Theme.sort_order.asc()).all()
    extra_parts = (
        ("approfondissement", "Approfondissement", "Cas pratiques et situations d'examen."),
        ("synthese", "Synthèse", "Récapitulatif et fiche mémo."),
    )
    for theme in themes:
        lecon_count = (
            db.query(Lecon)
            .filter(Lecon.theme_id == theme.id, Lecon.status == StatutArticleBlog.published.value)
            .count()
        )
        if lecon_count >= 3:
            continue
        for index, (suffix, part_title, part_excerpt) in enumerate(extra_parts, start=2):
            slug = f"{theme.code}-{suffix}"
            if db.query(Lecon).filter(Lecon.slug == slug).first() is not None:
                continue
            body = (
                f"<p>Leçon <strong>{part_title}</strong> — thème {theme.title_fr}.</p>"
                "<h2>Contenu</h2>"
                f"<p>{part_excerpt} Relisez puis validez la question de contrôle.</p>"
            )
            if suffix == "synthese":
                body += (
                    "<h2>Document</h2>"
                    f'<p><a href="{demo_pdf}" target="_blank" rel="noopener">'
                    f"Fiche PDF — {theme.title_fr}</a></p>"
                )
            db.add(
                Lecon(
                    theme_id=theme.id,
                    slug=slug,
                    title=f"{part_title} — {theme.title_fr}",
                    excerpt=part_excerpt,
                    body=body,
                    sort_order=index,
                    status=StatutArticleBlog.published.value,
                    published_at=now,
                )
            )
    db.commit()


def _ensure_theme_quizzes(db: Session) -> None:
    questions = db.query(Question).filter(Question.est_actif.is_(True)).all()
    if not questions:
        return
    _seed_demo_quizzes_and_exams(db, questions)
    _normalize_demo_quiz_course_flags(db)


def _normalize_demo_quiz_course_flags(db: Session) -> None:
    """Retire du parcours cours les quiz des modules sans quiz intégré."""
    for theme in db.query(Theme).filter(Theme.est_actif.is_(True)).all():
        if theme.code in DEMO_QUIZ_THEME_CODES:
            continue
        for quiz in db.query(Quiz).filter(Quiz.theme_id == theme.id).all():
            quiz.in_course_path = False
    db.commit()


def _enrich_demo_lessons(db: Session) -> None:
    """Ajoute images et vidéos aux premières leçons publiées."""
    lecons = (
        db.query(Lecon)
        .filter(Lecon.status == StatutArticleBlog.published.value)
        .order_by(Lecon.sort_order.asc())
        .limit(3)
        .all()
    )
    for lecon in lecons:
        if DEMO_VIDEO_EMBED in (lecon.body or ""):
            continue
        lecon.cover_image_url = lecon.cover_image_url or DEMO_IMAGE
        lecon.body = (
            f"{lecon.body or ''}"
            "<h2>Vidéo explicative</h2>"
            f'<iframe class="ql-video" src="{DEMO_VIDEO_EMBED}" '
            'frameborder="0" allowfullscreen="true"></iframe>'
            "<h2>Illustration</h2>"
            f'<p><img src="{DEMO_IMAGE}" alt="Illustration pédagogique CODAKIS" /></p>'
            "<h2>À retenir</h2>"
            "<ul>"
            "<li>Revoyez la vidéo avant le quiz du thème</li>"
            "<li>Repérez les panneaux et situations typiques CEMAC</li>"
            "<li>Entraînez-vous avec l'examen blanc de démonstration</li>"
            "</ul>"
        )
    db.commit()


def _seed_demo_enrollment(db: Session, schools: dict[str, AutoEcole]) -> None:
    """Inscrit le candidat premium démo à Volant Vert (forfait auto-école séparé de l'abonnement plateforme)."""
    candidat = db.query(Utilisateur).filter(Utilisateur.email == "premium@demo.codakis.cm").first()
    free_candidat = db.query(Utilisateur).filter(Utilisateur.email == "candidat@demo.codakis.cm").first()
    school = schools.get("DEMO-CM-001")
    if free_candidat:
        _clear_candidat_enrollments(db, free_candidat)
    if not candidat or not school:
        db.commit()
        return
    existing = (
        db.query(Inscription)
        .filter(Inscription.candidat_id == candidat.id, Inscription.auto_ecole_id == school.id)
        .first()
    )
    if existing:
        db.commit()
        return
    forfait = (
        db.query(Forfait)
        .filter(Forfait.auto_ecole_id == school.id, Forfait.est_actif.is_(True))
        .order_by(Forfait.prix.asc())
        .first()
    )
    if not forfait:
        db.commit()
        return
    create_inscription(
        db,
        candidat=candidat,
        school=school,
        forfait=forfait,
        forfait_type=forfait.type,
        forfait_label=forfait.label_fr,
        payment_ref="DEMO-ENROLL-PREMIUM-001",
    )


def seed_demo_data(db: Session, admin: Utilisateur | None) -> None:
    """Crée les comptes et contenus de démonstration (idempotent)."""
    if db.query(Utilisateur).filter(Utilisateur.email == DEMO_MARKER_EMAIL).first():
        questions = db.query(Question).limit(20).all()
        if questions and db.query(Quiz).count() == 0:
            _seed_demo_quizzes_and_exams(db, questions)
        _ensure_theme_quizzes(db)
        _expand_demo_lessons(db)
        _enrich_demo_lessons(db)
        inject_demo_simulations(db)
        demo_schools = {
            s.numero_agrement: s
            for s in db.query(AutoEcole).filter(AutoEcole.numero_agrement.like("DEMO%")).all()
        }
        _seed_demo_candidats(db)
        _seed_demo_enrollment(db, demo_schools)
        return

    if admin is None:
        admin = db.query(Utilisateur).filter(Utilisateur.role == RoleUtilisateur.administrateur.value).first()
    if admin is None:
        logger.warning("Seed démo ignoré : administrateur introuvable")
        return

    schools = _seed_demo_schools(db, admin)
    _seed_demo_moniteurs(db, schools)
    _seed_demo_candidats(db)
    questions = _seed_demo_questions(db)
    _seed_demo_quizzes_and_exams(db, questions)
    _expand_demo_lessons(db)
    _enrich_demo_lessons(db)
    inject_demo_simulations(db)
    _seed_demo_enrollment(db, schools)
    logger.info(
        "Données de démonstration créées (%d auto-écoles, comptes *@demo.codakis.cm / %s)",
        len(schools),
        DEMO_PASSWORD,
    )
