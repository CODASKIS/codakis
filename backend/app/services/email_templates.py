"""Templates e-mail CODAKIS — style Postcards, couleurs plateforme."""

from __future__ import annotations

from datetime import datetime
from html import escape
from zoneinfo import ZoneInfo

from app.core.config import settings

# Palette CODAKIS (alignée inputs / dashboard)
BRAND_GREEN = "#1DB96A"
BRAND_GREEN_DARK = "#158A4E"
BG_PAGE = "#F7F7F7"
BG_CARD = "#FFFFFF"
BG_MUTED = "#FAFAF9"
BORDER = "#EBEBEB"
BORDER_SOFT = "#F0F0EE"
TEXT = "#353535"
TEXT_MUTED = "#999999"
TEXT_BODY = "rgba(53,53,53,0.8)"
WARN_BG = "#FFFCF7"
WARN_BORDER = "#F9ECE3"
WARN_TEXT = "#867251"
DANGER = "#DC2626"


def _logo_url() -> str:
    return f"{settings.frontend_url.rstrip('/')}/images/logo.png"


def _fonts_head() -> str:
    return """
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
"""


def _base_layout(*, preheader: str, body_html: str, footer_note: str | None = None) -> str:
    note = footer_note or "Vous recevez cet e-mail en lien avec votre compte CODAKIS."
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CODAKIS</title>
  {_fonts_head()}
</head>
<body style="margin:0;padding:0;background:{BG_PAGE};font-family:'Nunito',Arial,Helvetica,sans-serif;color:{TEXT};">
  <span style="display:none!important;max-height:0;overflow:hidden;">{escape(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{BG_PAGE};padding:20px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="padding:42px 32px 16px;background:{BG_CARD};border:1px solid {BORDER};border-radius:12px 12px 0 0;">
          <img src="{escape(_logo_url())}" alt="CODAKIS" width="125" height="36" style="display:block;border:0;max-width:125px;height:auto;" />
        </td></tr>
        <tr><td style="padding:0 32px 32px;background:{BG_CARD};border-left:1px solid {BORDER};border-right:1px solid {BORDER};">
          {body_html}
        </td></tr>
        <tr><td style="padding:32px;background:{BG_CARD};border:1px solid {BORDER};border-top:0;border-radius:0 0 12px 12px;text-align:center;">
          <p style="margin:0 0 8px;font-size:15px;line-height:150%;color:{TEXT_MUTED};">{escape(note)}</p>
          <p style="margin:0;font-size:15px;line-height:150%;color:{TEXT_MUTED};">
            <a href="mailto:contact@codakis.cm" style="color:{BRAND_GREEN_DARK};text-decoration:underline;">contact@codakis.cm</a>
            · CODAKIS — permis de conduire CEMAC
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _heading(text: str) -> str:
    return f"""
      <h1 style="margin:0 0 16px;font-size:32px;line-height:130%;font-weight:600;color:{TEXT};">{escape(text)}</h1>
    """


def _paragraph(text: str, *, center: bool = False) -> str:
    align = "center" if center else "left"
    return f"""
      <p style="margin:0 0 24px;font-size:16px;line-height:150%;font-weight:500;color:{TEXT_BODY};text-align:{align};">
        {text}
      </p>
    """


def _cta_button(label: str, url: str) -> str:
    return f"""
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">
        <tr><td align="center">
          <a href="{escape(url)}" target="_blank" style="display:inline-block;width:100%;max-width:100%;box-sizing:border-box;padding:12px 32px;border-radius:8px;background:{BRAND_GREEN};color:#fff;font-size:17px;font-weight:600;line-height:24px;text-decoration:none;text-align:center;">
            {escape(label)}
          </a>
        </td></tr>
      </table>
    """


def _meta_panel(rows: list[tuple[str, str]]) -> str:
    parts: list[str] = []
    for index, (label, value) in enumerate(rows):
        if index > 0:
            parts.append(f"""
              <tr><td colspan="3" style="padding:16px 0;">
                <div style="border-bottom:1px solid {BORDER_SOFT};line-height:1px;font-size:1px;">&nbsp;</div>
              </td></tr>
            """)
        parts.append(f"""
          <tr>
            <td valign="middle" style="width:50%;padding:0;font-size:13px;font-weight:700;line-height:140%;color:{TEXT_MUTED};text-transform:uppercase;">{escape(label)}</td>
            <td style="width:20px;"></td>
            <td valign="middle" align="right" style="width:50%;font-size:14px;font-weight:500;line-height:150%;color:{TEXT};font-family:Consolas,'Courier New',monospace;">{escape(value)}</td>
          </tr>
        """)
    inner = "".join(parts)
    return f"""
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:separate;">
        <tr><td style="padding:32px;border-radius:8px;background:{BG_MUTED};border:1px solid {BORDER_SOFT};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">{inner}</table>
        </td></tr>
      </table>
    """


def _otp_block(otp: str, expire_minutes: int) -> str:
    spaced = " ".join(otp[i : i + 3] for i in range(0, len(otp), 3))
    return f"""
      <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:{TEXT_MUTED};text-align:center;">ou saisissez ce code manuellement</p>
      <p style="margin:0 0 8px;font-size:40px;font-weight:700;letter-spacing:0.2em;color:{TEXT};text-align:center;">{escape(spaced)}</p>
      <p style="margin:0 0 24px;font-size:16px;color:{TEXT_MUTED};text-align:center;">Expire dans {expire_minutes} minutes</p>
    """


def _warning_box(html: str) -> str:
    return f"""
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
        <tr><td style="padding:20px;border-radius:5px;background:{WARN_BG};border:1px solid {WARN_BORDER};font-size:16px;line-height:150%;color:{WARN_TEXT};font-weight:500;">
          {html}
        </td></tr>
      </table>
    """


def _info_box(html: str, *, danger: bool = False) -> str:
    bg = "#FEF2F2" if danger else "#F0FDF4"
    border = DANGER if danger else BRAND_GREEN
    return f"""
      <p style="margin:16px 0;padding:14px 16px;background:{bg};border-left:4px solid {border};font-size:14px;line-height:150%;">
        {html}
      </p>
    """


def format_otp_display(otp: str) -> str:
    return " ".join(otp[i : i + 3] for i in range(0, len(otp), 3))


def render_login_notification_email(
    *,
    full_name: str,
    login_url: str,
    device: str,
    location: str,
    ip_address: str,
    when: datetime | None = None,
) -> tuple[str, str]:
    when = when or datetime.now(ZoneInfo("Africa/Douala"))
    time_label = when.strftime("%d/%m/%Y %H:%M")
    greeting = escape(full_name.strip() or "Utilisateur")

    plain = "\n".join(
        [
            f"Bonjour {full_name},",
            "",
            "Une nouvelle connexion à votre compte CODAKIS a été détectée.",
            f"Appareil : {device}",
            f"Lieu : {location}",
            f"Adresse IP : {ip_address}",
            f"Date : {time_label}",
            "",
            f"Si ce n'était pas vous, sécurisez votre compte : {login_url}",
            "",
            "— L'équipe CODAKIS",
        ]
    )

    html = _base_layout(
        preheader="Nouvelle connexion à votre compte CODAKIS",
        body_html=f"""
          {_heading("Connexion à votre compte")}
          {_paragraph(f"Bonjour <strong>{greeting}</strong>, nous avons détecté une nouvelle connexion à votre compte CODAKIS. Si c'était vous, vous pouvez ignorer cet e-mail.")}
          {_meta_panel([
              ("Appareil", device),
              ("Lieu", location),
              ("Adresse IP", ip_address),
              ("Date", time_label),
          ])}
          {_cta_button("Accéder à mon espace", login_url)}
          {_warning_box(
              "Si vous n'êtes pas à l'origine de cette connexion, votre compte peut être compromis. "
              f'<a href="{escape(login_url)}" style="color:{WARN_TEXT};text-decoration:underline;">Sécuriser mon compte →</a>'
          )}
        """,
        footer_note="Vous recevez cet e-mail suite à une connexion sur votre compte CODAKIS.",
    )
    return plain, html


def render_otp_email(*, otp: str, expire_minutes: int, login_url: str | None = None) -> tuple[str, str]:
    spaced = format_otp_display(otp)
    plain = "\n".join(
        [
            "Bonjour,",
            "",
            "Utilisez le code ci-dessous pour réinitialiser votre mot de passe CODAKIS :",
            spaced,
            f"Ce code expire dans {expire_minutes} minutes.",
            "",
            "— L'équipe CODAKIS",
        ]
    )
    reset_url = login_url or f"{settings.frontend_url.rstrip('/')}/connexion/mot-de-passe"
    html = _base_layout(
        preheader="Code de vérification CODAKIS",
        body_html=f"""
          {_heading("Vérification de sécurité")}
          {_paragraph("Utilisez le code ci-dessous pour réinitialiser votre mot de passe. Ne le partagez avec personne.")}
          {_otp_block(otp, expire_minutes)}
          {_cta_button("Réinitialiser mon mot de passe", reset_url)}
          {_warning_box(
              "Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail ou "
              f'<a href="mailto:contact@codakis.cm" style="color:{WARN_TEXT};text-decoration:underline;">contactez le support →</a>'
          )}
        """,
    )
    return plain, html


def render_welcome_email(*, full_name: str, login_url: str, temp_password: str | None = None) -> tuple[str, str]:
    password_html = ""
    password_block = ""
    if temp_password:
        password_block = f"\nMot de passe temporaire : {temp_password}"
        password_html = _info_box(f"<strong>Mot de passe temporaire :</strong> {escape(temp_password)}")

    plain = "\n".join(
        [
            f"Bonjour {full_name},",
            "",
            "Votre compte CODAKIS a été créé avec succès.",
            password_block,
            "",
            f"Connexion : {login_url}",
            "",
            "— L'équipe CODAKIS",
        ]
    ).strip()

    html = _base_layout(
        preheader="Bienvenue sur CODAKIS",
        body_html=f"""
          {_heading("Bienvenue sur CODAKIS")}
          {_paragraph(f"Bonjour <strong>{escape(full_name)}</strong>, votre compte est prêt. Commencez votre préparation au permis dès maintenant.")}
          {password_html}
          {_cta_button("Commencer", login_url)}
        """,
    )
    return plain, html


def render_lesson_complete_email(
    *,
    full_name: str,
    lesson_title: str,
    theme_title: str,
    progress_percent: int,
    courses_url: str,
) -> tuple[str, str]:
    plain = "\n".join(
        [
            f"Bravo {full_name} !",
            "",
            f"Vous avez terminé la leçon « {lesson_title} » ({theme_title}).",
            f"Progression globale : {progress_percent} %.",
            "",
            f"Continuer : {courses_url}",
            "",
            "— L'équipe CODAKIS",
        ]
    )
    html = _base_layout(
        preheader=f"Leçon terminée — {lesson_title}",
        body_html=f"""
          {_heading("Leçon terminée !")}
          {_paragraph(f"Bravo <strong>{escape(full_name)}</strong>, vous avez complété <strong>« {escape(lesson_title)} »</strong> dans le thème <strong>{escape(theme_title)}</strong>.")}
          {_info_box(f"<strong>Progression globale :</strong> {progress_percent} % des leçons publiées.")}
          {_cta_button("Continuer mes cours", courses_url)}
        """,
    )
    return plain, html


def render_quiz_result_email(
    *,
    full_name: str,
    quiz_title: str,
    score: int,
    passed: bool,
    exams_url: str,
) -> tuple[str, str]:
    status = "Réussi" if passed else "À retravailler"
    plain = "\n".join(
        [
            f"Bonjour {full_name},",
            "",
            f"Résultat du quiz « {quiz_title} » : {score} % — {status}.",
            "",
            f"Voir mes examens : {exams_url}",
            "",
            "— L'équipe CODAKIS",
        ]
    )
    html = _base_layout(
        preheader=f"Résultat quiz — {quiz_title}",
        body_html=f"""
          {_heading("Résultat de votre quiz")}
          {_paragraph(f"Bonjour <strong>{escape(full_name)}</strong>, voici votre résultat pour <strong>« {escape(quiz_title)} »</strong>.")}
          {_info_box(f"<strong>Score :</strong> {score} % — <strong>{escape(status)}</strong>", danger=not passed)}
          {_cta_button("Voir mes examens", exams_url)}
        """,
    )
    return plain, html


def render_examen_result_email(
    *,
    full_name: str,
    exam_title: str,
    score: int,
    passed: bool,
    exams_url: str,
) -> tuple[str, str]:
    status = "Réussi" if passed else "Échoué"
    plain = "\n".join(
        [
            f"Bonjour {full_name},",
            "",
            f"Résultat de l'examen « {exam_title} » : {score} % — {status}.",
            "",
            f"Détails : {exams_url}",
            "",
            "— L'équipe CODAKIS",
        ]
    )
    html = _base_layout(
        preheader=f"Résultat examen — {exam_title}",
        body_html=f"""
          {_heading("Résultat de votre examen")}
          {_paragraph(f"Bonjour <strong>{escape(full_name)}</strong>, voici votre résultat pour <strong>« {escape(exam_title)} »</strong>.")}
          {_info_box(f"<strong>Score :</strong> {score} % — <strong>{escape(status)}</strong>", danger=not passed)}
          {_cta_button("Voir mes examens", exams_url)}
        """,
    )
    return plain, html


def render_moniteur_invite_email(
    *,
    full_name: str,
    school_name: str,
    login_url: str,
    temp_password: str | None = None,
) -> tuple[str, str]:
    password_html = ""
    password_block = ""
    if temp_password:
        password_block = f"\nMot de passe temporaire : {temp_password}"
        password_html = _info_box(f"<strong>Mot de passe temporaire :</strong> {escape(temp_password)}")

    plain = "\n".join(
        [
            f"Bonjour {full_name},",
            "",
            f"L'auto-école « {school_name} » vous invite sur CODAKIS en tant que moniteur.",
            password_block,
            "",
            f"Connexion : {login_url}",
            "",
            "— L'équipe CODAKIS",
        ]
    ).strip()

    html = _base_layout(
        preheader=f"Invitation moniteur — {school_name}",
        body_html=f"""
          {_heading("Invitation moniteur")}
          {_paragraph(f"Bonjour <strong>{escape(full_name)}</strong>, l'auto-école <strong>« {escape(school_name)} »</strong> vous invite à rejoindre CODAKIS.")}
          {password_html}
          {_cta_button("Rejoindre CODAKIS", login_url)}
        """,
    )
    return plain, html


def render_school_validated_email(*, school_name: str, login_url: str) -> tuple[str, str]:
    plain = "\n".join(
        [
            "Bonjour,",
            "",
            f"Votre auto-école « {school_name} » a été validée par CODAKIS.",
            f"Connexion : {login_url}",
            "",
            "— L'équipe CODAKIS",
        ]
    )
    html = _base_layout(
        preheader=f"Auto-école validée — {school_name}",
        body_html=f"""
          {_heading("Auto-école validée")}
          {_paragraph(f"Votre établissement <strong>« {escape(school_name)} »</strong> est maintenant actif. Vous pouvez inviter vos moniteurs.")}
          {_cta_button("Accéder à mon espace", login_url)}
        """,
    )
    return plain, html


def render_school_rejected_email(*, school_name: str, reason: str) -> tuple[str, str]:
    reason_html = escape(reason.strip()).replace("\n", "<br>")
    plain = "\n".join(
        [
            "Bonjour,",
            "",
            f"Votre demande pour « {school_name} » n'a pas été approuvée.",
            "",
            "Motif :",
            reason.strip(),
            "",
            "contact@codakis.cm",
        ]
    )
    html = _base_layout(
        preheader=f"Inscription refusée — {school_name}",
        body_html=f"""
          {_heading("Inscription non approuvée")}
          {_paragraph(f"La demande pour <strong>« {escape(school_name)} »</strong> n'a pas été approuvée.")}
          {_info_box(f"<strong>Motif :</strong><br>{reason_html}", danger=True)}
        """,
    )
    return plain, html


def render_simple_notification_email(*, subject: str, body: str) -> tuple[str, str]:
    plain = "\n".join(["Bonjour,", "", body, "", "— L'équipe CODAKIS"])
    html = _base_layout(
        preheader=subject,
        body_html=f"""
          {_heading(subject)}
          {_paragraph(escape(body))}
        """,
    )
    return plain, html
