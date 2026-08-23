import logging
import secrets
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger("codakis.email")


def login_url() -> str:
    base = settings.frontend_url.rstrip("/")
    return f"{base}/connexion"


def send_email(to: str, subject: str, body: str, html_body: str | None = None) -> None:
    if settings.email_mode == "console" or settings.app_env == "test":
        logger.info("[EMAIL:%s] To: %s\nSubject: %s\n%s", settings.email_mode, to, subject, body)
        print(f"\n=== EMAIL ({settings.email_mode}) ===\nTo: {to}\nSubject: {subject}\n{body}\n=====================\n")
        if html_body:
            print(f"--- HTML preview ({len(html_body)} chars) ---\n")
        return

    if settings.email_mode != "smtp" or not settings.smtp_host:
        logger.warning("SMTP non configuré — e-mail non envoyé à %s", to)
        return

    message = EmailMessage()
    message["From"] = settings.smtp_from
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


def send_welcome_email(to: str, full_name: str, password_plain: str | None = None) -> None:
    from app.services.email_templates import render_welcome_email

    plain, html = render_welcome_email(full_name=full_name, login_url=login_url(), temp_password=password_plain)
    send_email(to, "Bienvenue sur CODAKIS", plain, html)


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

    plain, html = render_otp_email(otp=otp, expire_minutes=settings.otp_expire_minutes)
    send_email(to, "Code de vérification CODAKIS", plain, html)


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


def generate_temp_password() -> str:
    return secrets.token_urlsafe(10)
