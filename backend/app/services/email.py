import base64
import logging
import secrets
import smtplib
from email.message import EmailMessage
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

import httpx

from app.core.config import settings

logger = logging.getLogger("codakis.email")
_LOGO_PATH = Path(__file__).resolve().parents[2] / "assets" / "logo.png"


def _logo_bytes() -> bytes | None:
    try:
        data = _LOGO_PATH.read_bytes()
    except OSError:
        logger.warning("Logo e-mail introuvable : %s", _LOGO_PATH)
        return None
    return data or None


def _public_logo_url() -> str:
    from app.services.email_templates import _logo_url

    return _logo_url()


def _prepare_html(html_body: str | None) -> str | None:
    if not html_body or "cid:codakis-logo" not in html_body:
        return html_body
    if _logo_bytes():
        return html_body
    return html_body.replace("cid:codakis-logo", _public_logo_url())


def login_url() -> str:
    base = settings.frontend_url.rstrip("/")
    return f"{base}/connexion"


def courses_url() -> str:
    base = settings.frontend_url.rstrip("/")
    return f"{base}/espace/candidat"


def exams_url() -> str:
    base = settings.frontend_url.rstrip("/")
    return f"{base}/espace/candidat/tests"


def badges_url() -> str:
    base = settings.frontend_url.rstrip("/")
    return f"{base}/espace/candidat/statistiques"


def _from_address() -> str:
    if settings.email_from_name and "<" not in settings.smtp_from:
        return f"{settings.email_from_name} <{settings.smtp_from}>"
    return settings.smtp_from


def _log_console(to: str, subject: str, body: str) -> None:
    logger.info("[EMAIL:console] To: %s | Subject: %s", to, subject)
    print(f"\n=== EMAIL ===\nTo: {to}\nSubject: {subject}\n{body}\n=============\n")


def _send_via_resend(
    to: str,
    subject: str,
    body: str,
    html_body: str | None,
    *,
    from_override: str | None = None,
) -> None:
    from_addr = from_override or _from_address()
    payload: dict = {
        "from": from_addr,
        "to": [to],
        "subject": subject,
        "text": body,
    }
    if html_body:
        payload["html"] = html_body
    logo = _logo_bytes()
    if logo and html_body and "cid:codakis-logo" in html_body:
        payload["attachments"] = [
            {
                "filename": "logo.png",
                "content": base64.b64encode(logo).decode("ascii"),
                "content_id": "codakis-logo",
            }
        ]

    logger.debug(
        "Resend → from=%s to=%s subject=%s",
        from_addr,
        to,
        subject,
    )
    response = httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {settings.resend_api_key}"},
        json=payload,
        timeout=30,
    )
    if response.status_code >= 400:
        logger.error(
            "Resend a rejeté l'e-mail : status=%s body=%s | from=%s to=%s",
            response.status_code,
            response.text,
            from_addr,
            to,
        )
        # Domaine non vérifié → fallback sandbox Resend (dev / comptes sans domaine).
        body_lower = response.text.lower()
        using_resend_dev = "resend.dev" in from_addr.lower()
        if (
            response.status_code in {403, 422}
            and not using_resend_dev
            and ("not verified" in body_lower or "domain" in body_lower)
        ):
            fallback_from = (
                f"{settings.email_from_name} <onboarding@resend.dev>"
                if settings.email_from_name
                else "CODAKIS <onboarding@resend.dev>"
            )
            logger.warning(
                "Domaine Resend non vérifié pour %s — nouvel essai avec %s",
                from_addr,
                fallback_from,
            )
            return _send_via_resend(
                to, subject, body, html_body, from_override=fallback_from
            )
        raise RuntimeError(f"Resend {response.status_code}: {response.text}")
    logger.info("Resend → e-mail envoyé à %s (id=%s)", to, response.json().get("id", "?"))


def _build_message(to: str, subject: str, body: str, html_body: str | None):
    html_body = _prepare_html(html_body)
    logo = _logo_bytes() if html_body and "cid:codakis-logo" in html_body else None
    if logo and html_body:
        root = MIMEMultipart("related")
        root["From"] = _from_address()
        root["To"] = to
        root["Subject"] = subject
        alternative = MIMEMultipart("alternative")
        alternative.attach(MIMEText(body, "plain", "utf-8"))
        alternative.attach(MIMEText(html_body, "html", "utf-8"))
        root.attach(alternative)
        image = MIMEImage(logo, _subtype="png")
        image.add_header("Content-ID", "<codakis-logo>")
        image.add_header("Content-Disposition", "inline", filename="logo.png")
        root.attach(image)
        return root

    message = EmailMessage()
    message["From"] = _from_address()
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)
    if html_body:
        message.add_alternative(html_body, subtype="html")
    return message


def _send_via_smtp(
    to: str,
    subject: str,
    body: str,
    html_body: str | None,
    *,
    host: str | None = None,
    port: int | None = None,
    user: str | None = None,
    password: str | None = None,
) -> None:
    smtp_host = host or settings.smtp_host
    smtp_port = port or settings.smtp_port
    smtp_user = user if user is not None else settings.smtp_user
    smtp_password = password if password is not None else settings.smtp_password

    if not smtp_host:
        raise RuntimeError("SMTP_HOST non configuré")

    message = _build_message(to, subject, body, html_body)

    with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
        if smtp_port != 25:
            server.starttls()
        if smtp_user:
            server.login(smtp_user, smtp_password)
        server.send_message(message)


def _try_smtp_fallback(to: str, subject: str, body: str, html_body: str | None) -> bool:
    fallback_host = settings.smtp_fallback_host.strip() or settings.smtp_host.strip()
    if not fallback_host:
        return False
    port = settings.smtp_fallback_port if settings.smtp_fallback_host.strip() else settings.smtp_port
    try:
        _send_via_smtp(to, subject, body, html_body, host=fallback_host, port=port, user="", password="")
        logger.info("E-mail envoyé via SMTP fallback (%s:%s) à %s", fallback_host, port, to)
        return True
    except Exception:
        logger.exception("Échec SMTP fallback vers %s", to)
        return False


def send_email(to: str, subject: str, body: str, html_body: str | None = None) -> bool:
    html_body = _prepare_html(html_body)
    if settings.app_env == "test":
        _log_console(to, subject, body)
        return True

    mode = settings.email_mode
    if mode == "resend" and settings.smtp_from.lower().endswith("resend.dev"):
        logger.warning(
            "Resend configuré avec un expéditeur sandbox (%s). Les mails OTP peuvent ne pas arriver tant que le domaine n'est pas vérifié dans Resend.",
            settings.smtp_from,
        )
    try:
        if mode == "console":
            _log_console(to, subject, body)
            return True
        if mode == "resend":
            if not settings.resend_api_key:
                logger.warning("RESEND_API_KEY manquant")
                if _try_smtp_fallback(to, subject, body, html_body):
                    return True
                _log_console(to, subject, body)
                return False
            try:
                _send_via_resend(to, subject, body, html_body)
                return True
            except RuntimeError as exc:
                logger.warning("Resend a échoué (%s), tentative SMTP fallback", exc)
                if _try_smtp_fallback(to, subject, body, html_body):
                    return True
                raise
        if mode == "smtp":
            _send_via_smtp(to, subject, body, html_body)
            return True
        logger.warning("Mode e-mail inconnu: %s", mode)
        _log_console(to, subject, body)
        return False
    except Exception:
        logger.exception("Échec envoi e-mail à %s", to)
        _log_console(to, subject, body)
        return False


def send_welcome_email(to: str, full_name: str, password_plain: str | None = None) -> None:
    from app.services.email_templates import render_welcome_email

    plain, html = render_welcome_email(full_name=full_name, login_url=login_url(), temp_password=password_plain)
    send_email(to, "Bienvenue sur CODAKIS", plain, html)


def send_login_notification_email(
    to: str,
    full_name: str,
    *,
    device: str,
    location: str,
    ip_address: str,
) -> None:
    from app.services.email_templates import render_login_notification_email

    plain, html = render_login_notification_email(
        full_name=full_name,
        login_url=login_url(),
        device=device,
        location=location,
        ip_address=ip_address,
    )
    send_email(to, "Nouvelle connexion — CODAKIS", plain, html)


def send_moniteur_invite_email(
    to: str,
    full_name: str,
    school_name: str,
    password_plain: str | None = None,
) -> None:
    from app.services.email_templates import render_moniteur_invite_email

    plain, html = render_moniteur_invite_email(
        full_name=full_name,
        school_name=school_name,
        login_url=login_url(),
        temp_password=password_plain,
    )
    send_email(to, f"Invitation moniteur — {school_name}", plain, html)


def send_otp_email(to: str, otp: str) -> bool:
    from app.services.email_templates import render_otp_email

    plain, html = render_otp_email(
        otp=otp,
        expire_minutes=settings.otp_expire_minutes,
        login_url=f"{settings.frontend_url.rstrip('/')}/connexion/mot-de-passe",
        email=to,
    )
    return send_email(to, "Code de vérification CODAKIS", plain, html)


def send_lesson_complete_email(
    to: str,
    full_name: str,
    *,
    lesson_title: str,
    theme_title: str,
    progress_percent: int,
) -> None:
    from app.services.email_templates import render_lesson_complete_email

    plain, html = render_lesson_complete_email(
        full_name=full_name,
        lesson_title=lesson_title,
        theme_title=theme_title,
        progress_percent=progress_percent,
        courses_url=courses_url(),
    )
    send_email(to, f"Leçon terminée — {lesson_title}", plain, html)


def send_quiz_result_email(
    to: str,
    full_name: str,
    *,
    quiz_title: str,
    score: int,
    passed: bool,
) -> None:
    from app.services.email_templates import render_quiz_result_email

    plain, html = render_quiz_result_email(
        full_name=full_name,
        quiz_title=quiz_title,
        score=score,
        passed=passed,
        exams_url=exams_url(),
    )
    send_email(to, f"Résultat quiz — {quiz_title}", plain, html)


def send_examen_result_email(
    to: str,
    full_name: str,
    *,
    exam_title: str,
    score: int,
    passed: bool,
) -> None:
    from app.services.email_templates import render_examen_result_email

    plain, html = render_examen_result_email(
        full_name=full_name,
        exam_title=exam_title,
        score=score,
        passed=passed,
        exams_url=exams_url(),
    )
    send_email(to, f"Résultat examen — {exam_title}", plain, html)


def send_school_validated_email(to: str, school_name: str) -> None:
    from app.services.email_templates import render_school_validated_email

    plain, html = render_school_validated_email(school_name=school_name, login_url=login_url())
    send_email(to, "Auto-école validée — CODAKIS", plain, html)


def send_school_rejected_email(to: str, school_name: str, reason: str) -> None:
    from app.services.email_templates import render_school_rejected_email

    plain, html = render_school_rejected_email(school_name=school_name, reason=reason)
    send_email(to, "Inscription auto-école non approuvée — CODAKIS", plain, html)


def send_seance_notification_email(to: str, subject: str, body: str) -> None:
    from app.services.email_templates import render_simple_notification_email

    plain, html = render_simple_notification_email(subject=subject, body=body)
    send_email(to, subject, plain, html)


def send_payment_confirmation_email(
    to: str,
    full_name: str,
    *,
    amount_fcfa: int,
    reference: str,
    receipt_number: str,
    purpose_label: str,
) -> None:
    from app.services.email_templates import render_payment_confirmation_email

    dashboard_url = f"{settings.frontend_url.rstrip('/')}/espace/candidat"
    plain, html = render_payment_confirmation_email(
        full_name=full_name,
        amount_fcfa=amount_fcfa,
        reference=reference,
        receipt_number=receipt_number,
        purpose_label=purpose_label,
        dashboard_url=dashboard_url,
    )
    send_email(to, f"Paiement confirmé — {reference}", plain, html)


def send_payment_failed_email(
    to: str,
    full_name: str,
    *,
    amount_fcfa: int,
    reference: str,
    reason: str,
) -> None:
    from app.services.email_templates import render_payment_failed_email

    retry_url = f"{settings.frontend_url.rstrip('/')}/tarifs"
    plain, html = render_payment_failed_email(
        full_name=full_name,
        amount_fcfa=amount_fcfa,
        reference=reference,
        reason=reason,
        retry_url=retry_url,
    )
    send_email(to, f"Paiement non abouti — {reference}", plain, html)


def send_level_badge_email(to: str, full_name: str, *, level: int, points: int) -> None:
    from app.services.email_templates import render_level_badge_email

    plain, html = render_level_badge_email(
        full_name=full_name,
        level=level,
        points=points,
        badges_url=badges_url(),
    )
    send_email(to, f"Badge niveau {level} — CODAKIS", plain, html)


def generate_temp_password() -> str:
    return secrets.token_urlsafe(10)
