import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.models import OtpType, Utilisateur
from app.db.session import get_db
from app.schemas.auth import (
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegisterAutoEcoleRequest,
    RegisterCandidatRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyResetOtpRequest,
)
from app.services.email import send_login_notification_email
from app.services.email_context import client_ip, format_location_hint, parse_user_agent
from app.services.otp import check_otp, create_otp, verify_otp
from app.services.users import (
    authenticate_user,
    build_tokens,
    login_or_register_google,
    register_auto_ecole,
    register_candidat,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _notify_login(user: Utilisateur, request: Request) -> None:
    ip = client_ip(
        request.headers.get("x-forwarded-for"),
        request.client.host if request.client else None,
    )
    full_name = f"{user.prenom or ''} {user.nom or ''}".strip() or user.email
    send_login_notification_email(
        user.email,
        full_name,
        device=parse_user_agent(request.headers.get("user-agent")),
        location=format_location_hint(ip),
        ip_address=ip,
    )


@router.post("/register/candidat", response_model=TokenResponse)
def register_candidat_route(payload: RegisterCandidatRequest, db: Session = Depends(get_db)):
    try:
        user = register_candidat(
            db,
            email=payload.email,
            password=payload.password,
            full_name=payload.full_name,
            phone=payload.phone,
            city=payload.city,
            country_code=payload.country_code,
            langue=payload.langue,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return TokenResponse(**build_tokens(user))


@router.post("/register/auto-ecole", response_model=MessageResponse)
def register_auto_ecole_route(payload: RegisterAutoEcoleRequest, db: Session = Depends(get_db)):
    try:
        register_auto_ecole(
            db,
            email=payload.email,
            password=payload.password,
            full_name=payload.full_name,
            phone=payload.phone,
            city=payload.city,
            country_code=payload.country_code,
            langue=payload.langue,
            school_name=payload.school_name,
            school_address=payload.school_address,
            mint_registration=payload.mint_registration,
            rccm=payload.rccm,
            legal_name=payload.legal_name,
            description=payload.description,
            website=payload.website,
            manager_role=payload.manager_role,
            instructor_count=payload.instructor_count,
            vehicle_count=payload.vehicle_count,
            years_operating=payload.years_operating,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return MessageResponse(
        message="Inscription enregistrée. Votre auto-école sera visible après validation par l'administrateur CODAKIS."
    )


@router.post("/login", response_model=TokenResponse)
def login_route(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    try:
        user = authenticate_user(db, payload.email, payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    _notify_login(user, request)
    return TokenResponse(**build_tokens(user))


@router.post("/google", response_model=TokenResponse)
def google_route(payload: GoogleAuthRequest, request: Request, db: Session = Depends(get_db)):
    try:
        user = login_or_register_google(db, payload.id_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    _notify_login(user, request)
    return TokenResponse(**build_tokens(user))


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password_route(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.email == payload.email.lower()).first()
    debug_otp = None
    email_sent = None
    if user:
        code, delivered = create_otp(db, payload.email, OtpType.reset_password, user.id)
        email_sent = delivered
        if settings.app_env in {"development", "test"}:
            debug_otp = code
    return MessageResponse(
        message="Si un compte existe pour cet e-mail, un code OTP a été envoyé.",
        debug_otp=debug_otp,
        email_sent=email_sent if settings.app_env in {"development", "test"} or email_sent is False else None,
    )


@router.post("/verify-reset-otp", response_model=MessageResponse)
def verify_reset_otp_route(payload: VerifyResetOtpRequest, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.email == payload.email.lower()).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Compte introuvable")
    try:
        check_otp(db, payload.email, payload.otp, OtpType.reset_password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return MessageResponse(message="Code vérifié. Vous pouvez définir un nouveau mot de passe.")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password_route(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.email == payload.email.lower()).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Compte introuvable")
    try:
        verify_otp(db, payload.email, payload.otp, OtpType.reset_password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    user.mot_de_passe_hash = hash_password(payload.new_password)
    db.commit()
    return MessageResponse(message="Mot de passe mis à jour. Vous pouvez vous connecter.")



@router.post("/refresh", response_model=TokenResponse)
def refresh_route(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    from app.core.security import create_access_token, create_refresh_token, decode_token
    from app.db.models import Utilisateur

    try:
        token_payload = decode_token(payload.refresh_token, expected_type="refresh")
        user_id = uuid.UUID(token_payload["sub"])
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token invalide") from exc

    user = db.get(Utilisateur, user_id)
    if user is None or not user.est_actif:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Compte introuvable ou inactif")

    subject = str(user.id)
    return TokenResponse(
        access_token=create_access_token(subject),
        refresh_token=create_refresh_token(subject),
        token_type="bearer",
    )
