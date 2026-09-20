import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import CodeVerification, OtpType
from app.services.email import send_otp_email

MAX_OTP_ATTEMPTS = 5


def generate_otp() -> str:
    length = settings.otp_length
    return "".join(str(secrets.randbelow(10)) for _ in range(length))


def hash_otp(code: str) -> str:
    material = f"{settings.jwt_secret}:otp:{code.strip()}".encode()
    return hashlib.sha256(material).hexdigest()


def _matches_stored(record: CodeVerification, code: str) -> bool:
    raw = code.strip()
    stored = record.code or ""
    if len(stored) == 64 and all(c in "0123456789abcdef" for c in stored.lower()):
        return secrets.compare_digest(stored, hash_otp(raw))
    # Compat anciens OTP en clair (migration progressive)
    return secrets.compare_digest(stored, raw)


def create_otp(db: Session, email: str, otp_type: OtpType, utilisateur_id=None) -> tuple[str, bool]:
    recent = (
        db.query(CodeVerification)
        .filter(
            CodeVerification.email == email.lower(),
            CodeVerification.type == otp_type.value,
            CodeVerification.created_at > datetime.now(UTC) - timedelta(minutes=10),
        )
        .count()
    )
    if recent >= 5:
        raise ValueError("Trop de demandes de code. Réessayez dans quelques minutes.")

    code = generate_otp()
    db.query(CodeVerification).filter(
        CodeVerification.email == email.lower(),
        CodeVerification.type == otp_type.value,
        CodeVerification.utilise.is_(False),
    ).update({"utilise": True})

    record = CodeVerification(
        utilisateur_id=utilisateur_id,
        email=email.lower(),
        code=hash_otp(code),
        type=otp_type.value,
        expire_le=datetime.now(UTC) + timedelta(minutes=settings.otp_expire_minutes),
        attempts=0,
    )
    db.add(record)
    db.commit()
    delivered = send_otp_email(email, code)
    return code, delivered


def _load_active_otp(db: Session, email: str, otp_type: OtpType) -> CodeVerification | None:
    return (
        db.query(CodeVerification)
        .filter(
            CodeVerification.email == email.lower(),
            CodeVerification.type == otp_type.value,
            CodeVerification.utilise.is_(False),
            CodeVerification.expire_le > datetime.now(UTC),
        )
        .order_by(CodeVerification.created_at.desc())
        .first()
    )


def check_otp(db: Session, email: str, code: str, otp_type: OtpType) -> CodeVerification:
    """Vérifie un OTP sans le consommer (pré-étape mot de passe)."""
    record = _load_active_otp(db, email, otp_type)
    if record is None:
        raise ValueError("Code OTP invalide ou expiré")
    if (record.attempts or 0) >= MAX_OTP_ATTEMPTS:
        record.utilise = True
        db.commit()
        raise ValueError("Trop de tentatives. Demandez un nouveau code.")
    if not _matches_stored(record, code):
        record.attempts = (record.attempts or 0) + 1
        if record.attempts >= MAX_OTP_ATTEMPTS:
            record.utilise = True
        db.commit()
        raise ValueError("Code OTP invalide ou expiré")
    return record


def verify_otp(db: Session, email: str, code: str, otp_type: OtpType) -> CodeVerification:
    record = check_otp(db, email, code, otp_type)
    record.utilise = True
    db.commit()
    return record
