import logging
import secrets
import smtplib
from email.message import EmailMessage

import httpx

from app.core.config import settings

logger = logging.getLogger("codakis.email")


def login_url() -> str:
    base = settings.frontend_url.rstrip("/")
    return f"{base}/connexion"


def courses_url() -> str:
    base = settings.frontend_url.rstrip("/")
    return f"{base}/espace/candidat/cours"


def exams_url() -> str:
    base = settings.frontend_url.rstrip("/")
    return f"{base}/espace/candidat/examens"


def _from_address() -> str:
    if settings.email_from_name and "<" not in settings.smtp_from:
        return f"{settings.email_from_name} <{settings.smtp_from}>"
    return settings.smtp_from


def _log_console(to: str, subject: str, body: str) -> None:
    logger.info("[EMAIL:console] To: %s | Subject: %s", to, subject)
    print(f"\n=== EMAIL ===\nTo: {to}\nSubject: {subject}\n{body}\n=============\n")


def _send_via_resend(to: str, subject: str, body: str, html_body: str | None) -> None:
    payload: dict = {
        "from": _from_address(),
        "to": [to],
        "subject": subject,
        "text": body,
    }
    if html_body:
        payload["html"] = html_body

    response = httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {settings.resend_api_key}"},
        json=payload,
        timeout=30,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"Resend {response.status_code}: {response.text}")


def _send_via_smtp(to: str, subject: str, body: str, html_body: str | None) -> None:
    if not settings.smtp_host:
        raise RuntimeError("SMTP_HOST non configuré")

    message = EmailMessage()
    message["From"] = _from_address()
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)
    if html_body:
        message.add_alternative(html_body, subtype="html")

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        if settings.smtp_user:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(message)


def send_email(to: str, subject: str, body: str, html_body: str | None = None) -> None:
    if settings.app_env == "test":
        _log_console(to, subject, body)
        return

    mode = settings.email_mode
    try:
        if mode == "console":
            _log_console(to, subject, body)
            return
        if mode == "resend":
            if not settings.resend_api_key:
                logger.warning("RESEND_API_KEY manquant")
                _log_console(to, subject, body)
                return
            _send_via_resend(to, subject, body, html_body)
            return
        if mode == "smtp":
            _send_via_smtp(to, subject, body, html_body)
            return
        logger.warning("Mode e-mail inconnu: %s", mode)
        _log_console(to, subject, body)
    except Exception:
        logger.exception("Échec envoi e-mail à %s", to)
        _log_console(to, subject, body)


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


def send_otp_email(to: str, otp: str) -> None:
    from app.services.email_templates import render_otp_email

    plain, html = render_otp_email(otp=otp, expire_minutes=settings.otp_expire_minutes, login_url=login_url())
    send_email(to, "Code de vérification CODAKIS", plain, html)


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


def generate_temp_password() -> str:
    return secrets.token_urlsafe(10)
