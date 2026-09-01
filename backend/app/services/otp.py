import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import CodeVerification, OtpType
from app.services.email import send_otp_email


def generate_otp() -> str:
    length = settings.otp_length
    return "".join(str(secrets.randbelow(10)) for _ in range(length))


def create_otp(db: Session, email: str, otp_type: OtpType, utilisateur_id=None) -> tuple[str, bool]:
    code = generate_otp()
    db.query(CodeVerification).filter(
        CodeVerification.email == email.lower(),
        CodeVerification.type == otp_type.value,
        CodeVerification.utilise.is_(False),
    ).update({"utilise": True})

    record = CodeVerification(
        utilisateur_id=utilisateur_id,
        email=email.lower(),
        code=code,
        type=otp_type.value,
        expire_le=datetime.now(UTC) + timedelta(minutes=settings.otp_expire_minutes),
    )
    db.add(record)
    db.commit()
    delivered = send_otp_email(email, code)
    return code, delivered


def check_otp(db: Session, email: str, code: str, otp_type: OtpType) -> CodeVerification:
    """Vérifie un OTP sans le consommer (pré-étape mot de passe)."""
    record = (
        db.query(CodeVerification)
        .filter(
            CodeVerification.email == email.lower(),
            CodeVerification.code == code.strip(),
            CodeVerification.type == otp_type.value,
            CodeVerification.utilise.is_(False),
            CodeVerification.expire_le > datetime.now(UTC),
        )
        .order_by(CodeVerification.created_at.desc())
        .first()
    )
    if record is None:
        raise ValueError("Code OTP invalide ou expiré")
    return record


def verify_otp(db: Session, email: str, code: str, otp_type: OtpType) -> CodeVerification:
    record = (
        db.query(CodeVerification)
        .filter(
            CodeVerification.email == email.lower(),
            CodeVerification.code == code.strip(),
            CodeVerification.type == otp_type.value,
            CodeVerification.utilise.is_(False),
            CodeVerification.expire_le > datetime.now(UTC),
        )
        .order_by(CodeVerification.created_at.desc())
        .first()
    )
    if record is None:
        raise ValueError("Code OTP invalide ou expiré")
    record.utilise = True
    db.commit()
    return record
