"""Templates e-mail CODAKIS — style Postcards, couleurs plateforme."""

from __future__ import annotations

from datetime import datetime
from html import escape
from urllib.parse import urlencode
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
    """URL publique de secours si le logo inline ne peut pas être joint."""
    base = settings.frontend_url.strip().rstrip("/")
    if base.startswith("https://") and "localhost" not in base and "127.0.0.1" not in base:
        return f"{base}/images/logo.png"
    return "https://codakis.efymotors.com/images/logo.png"


def _logo_block() -> str:
    """Logo inline (cid) — le service e-mail joint le PNG. URL publique en secours alt."""
    return (
        f'<img src="cid:codakis-logo" alt="CODAKIS" width="168" height="42" '
        f'style="display:block;border:0;outline:none;text-decoration:none;max-width:168px;height:auto;" />'
    )

def _fonts_head() -> str:
    return """
<link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
  @media (max-width:620px) {
    .codakis-email-card { width:100% !important; }
    .codakis-email-pad { padding:24px 20px !important; }
    .codakis-email-title { font-size:26px !important; }
    .codakis-email-otp { font-size:32px !important; }
  }
</style>
"""

FONT_SANS = "'Google Sans',Arial,Helvetica,sans-serif"
FONT_MONO = "'Geist Mono',Consolas,'Courier New',monospace"

def _base_layout(*, preheader: str, body_html: str, footer_note: str | None = None) -> str:
    note = footer_note or "Vous recevez cet e-mail en lien avec votre compte CODAKIS."
    return f"""<!DOCTYPE html>
<html lang="fr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>CODAKIS</title>
  {_fonts_head()}
</head>
<body style="margin:0;padding:0;background:{BG_PAGE};font-family:{FONT_SANS};color:{TEXT};-webkit-font-smoothing:antialiased;">
  <span style="display:none!important;max-height:0;overflow:hidden;mso-hide:all;">{escape(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{BG_PAGE};padding:20px 12px;">
    <tr><td align="center">
      <table role="presentation" class="codakis-email-card" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td class="codakis-email-pad" style="padding:42px 32px 16px;background:{BG_CARD};border:1px solid {BORDER};border-radius:12px 12px 0 0;">
          {_logo_block()}
        </td></tr>
        <tr><td class="codakis-email-pad" style="padding:0 32px 32px;background:{BG_CARD};border-left:1px solid {BORDER};border-right:1px solid {BORDER};">
          {body_html}
        </td></tr>
        <tr><td class="codakis-email-pad" style="padding:32px;background:{BG_CARD};border:1px solid {BORDER};border-top:0;border-radius:0 0 12px 12px;text-align:center;">
          <p style="margin:0 0 8px;font-size:15px;line-height:150%;font-weight:500;color:{TEXT_MUTED};font-family:{FONT_SANS};">{escape(note)}</p>
          <p style="margin:0;font-size:15px;line-height:150%;font-weight:500;color:{TEXT_MUTED};font-family:{FONT_SANS};">
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
      <h1 class="codakis-email-title" style="margin:0 0 16px;font-size:32px;line-height:130%;font-weight:600;color:{TEXT};font-family:{FONT_SANS};">{escape(text)}</h1>
    """

def _paragraph(text: str, *, center: bool = False) -> str:
    align = "center" if center else "left"
    return f"""
      <p style="margin:0 0 24px;font-size:16px;line-height:150%;font-weight:500;color:{TEXT_BODY};text-align:{align};font-family:{FONT_SANS};">
        {text}
      </p>
    """

def _text_link(label: str, url: str) -> str:
    return (
        f'<p style="margin:0 0 16px;font-size:15px;line-height:150%;font-weight:600;font-family:{FONT_SANS};">'
        f'<a href="{escape(url)}" style="color:{BRAND_GREEN_DARK};text-decoration:underline;">{escape(label)}</a>'
        f"</p>"
    )


def _cta_button(label: str, url: str) -> str:
    return f"""
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">
        <tr><td align="center">
          <a href="{escape(url)}" target="_blank" style="display:inline-block;width:100%;max-width:100%;box-sizing:border-box;padding:12px 32px;border-radius:8px;background:{BRAND_GREEN};color:#fff;font-size:17px;font-weight:600;line-height:24px;text-decoration:none;text-align:center;font-family:{FONT_SANS};">
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
            <td valign="middle" style="width:50%;padding:0;font-size:13px;font-weight:700;line-height:140%;color:{TEXT_MUTED};text-transform:uppercase;font-family:{FONT_SANS};">{escape(label)}</td>
            <td style="width:20px;"></td>
            <td valign="middle" align="right" style="width:50%;font-size:14px;font-weight:500;line-height:150%;color:{TEXT};font-family:{FONT_MONO};">{escape(value)}</td>
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
    spaced = " ".join(otp[i:i+3] for i in range(0, len(otp), 3))
    return f"""
      <p class="codakis-email-otp" style="margin:0 0 8px;font-size:40px;font-weight:700;letter-spacing:0.2em;color:{TEXT};text-align:center;font-family:{FONT_SANS};">{escape(spaced)}</p>
      <p style="margin:0 0 24px;font-size:16px;color:{TEXT_MUTED};text-align:center;font-family:{FONT_SANS};">Expire dans {expire_minutes} minutes</p>
    """

def _warning_box(html: str) -> str:
    return f"""
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
        <tr><td style="padding:20px;border-radius:5px;background:{WARN_BG};border:1px solid {WARN_BORDER};font-size:16px;line-height:150%;color:{WARN_TEXT};font-weight:500;font-family:{FONT_SANS};">
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
    return " ".join(otp[i:i+3] for i in range(0, len(otp), 3))

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
          {_text_link("Ce n'était pas vous ? Sécuriser le compte", login_url)}
          {_warning_box(
              "Si vous n'êtes pas à l'origine de cette connexion, votre compte peut être compromis. "
              f'<a href="{escape(login_url)}" style="color:{WARN_TEXT};text-decoration:underline;">Sécuriser mon compte →</a>'
          )}
        """,
        footer_note="Vous recevez cet e-mail suite à une connexion sur votre compte CODAKIS.",
    )
    return plain, html

def render_otp_email(*, otp: str, expire_minutes: int, login_url: str | None = None, email: str | None = None) -> tuple[str, str]:
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
    if login_url and (email or otp):
        reset_url = f"{login_url}?{urlencode({k: v for k, v in {'email': email or '', 'otp': otp or ''}.items() if v})}"
    elif login_url:
        reset_url = login_url
    else:
        reset_url = build_reset_password_url(email=email, otp=otp)
    html = _base_layout(
        preheader="Code de vérification CODAKIS",
        body_html=f"""
          {_heading("Vérification de sécurité")}
          {_paragraph("Utilisez le code ci-dessous pour réinitialiser votre mot de passe. Ne le partagez avec personne.")}
          {_otp_block(otp, expire_minutes)}
          {_paragraph("Pour réinitialiser votre mot de passe, entrez le code ci-dessus sur cette page :", center=True)}
          {_cta_button("Aller à la page de réinitialisation", reset_url)}
          {_warning_box(
              "Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail ou "
              f'<a href="mailto:contact@codakis.cm" style="color:{WARN_TEXT};text-decoration:underline;">contactez le support →</a>'
          )}
        """,
    )
    return plain, html

def build_reset_password_url(*, email: str | None = None, otp: str | None = None) -> str:
    """Build the exact password-reset route used by the frontend app."""
    base = settings.frontend_url.strip().rstrip("/")
    if not base:
        base = "https://www.codakis.cm"
    reset_url = f"{base}/connexion/mot-de-passe"
    params = {}
    if email:
        params["email"] = email
    if otp:
        params["otp"] = otp
    if params:
        reset_url = f"{reset_url}?{urlencode(params)}"
    return reset_url

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
            "Votre compte CODAKIS est prêt. Vous pouvez commencer tout de suite, même sans abonnement.",
            "Gratuit : signalisation, priorités et règles de circulation (cours, quiz et lecture audio).",
            "Avec un abonnement : le reste des modules, les examens blancs et le tuteur.",
            "Chaque niveau réussi débloque un badge téléchargeable dans Statistiques.",
            password_block,
            "",
            f"Commencer : {login_url}",
            "",
            "— L'équipe CODAKIS",
        ]
    ).strip()

    html = _base_layout(
        preheader="Votre parcours permis commence — 3 modules gratuits",
        body_html=f"""
          {_heading("Bienvenue sur CODAKIS")}
          {_paragraph(f"Bonjour <strong>{escape(full_name)}</strong>, votre compte est prêt. Vous pouvez apprendre tout de suite, même sans avoir payé.")}
          {_info_box("<strong>Inclus sans abonnement :</strong> signalisation, priorités et règles de circulation — cours, quiz et lecture audio.")}
          {_info_box("Les autres modules, les examens blancs et le tuteur s'ouvrent avec un abonnement. Chaque niveau réussi débloque un badge à télécharger.")}
          {password_html}
          {_cta_button("Commencer mon parcours", login_url)}
        """,
    )
    return plain, html

def render_school_validated_email(*, school_name: str, login_url: str) -> tuple[str, str]:
    plain = "\n".join([
        "Bonjour,",
        "",
        f"Votre auto-école \"{school_name}\" a été validée sur CODAKIS.",
        "",
        f"Connexion : {login_url}",
        "",
        "— L'équipe CODAKIS",
    ])
    html = _base_layout(
        preheader="Auto-école validée — CODAKIS",
        body_html=f"""
          {_heading("Auto-école validée")}
          {_paragraph(f"Votre établissement <strong>{escape(school_name)}</strong> a été approuvé et est désormais actif sur CODAKIS.")}
          {_cta_button("Accéder à mon espace", login_url)}
        """,
    )
    return plain, html


def render_school_rejected_email(*, school_name: str, reason: str) -> tuple[str, str]:
    plain = "\n".join([
        "Bonjour,",
        "",
        f"Votre auto-école \"{school_name}\" n'a pas été approuvée sur CODAKIS.",
        f"Motif : {reason}",
        "",
        "Contactez le support pour plus d'informations.",
        "",
        "— L'équipe CODAKIS",
    ])
    html = _base_layout(
        preheader="Inscription auto-école non approuvée",
        body_html=f"""
          {_heading("Inscription non approuvée")}
          {_paragraph(f"Votre établissement <strong>{escape(school_name)}</strong> n'a pas été validé pour le moment.")}
          {_info_box(f"<strong>Motif :</strong> {escape(reason)}", danger=True)}
          {_text_link("Écrire au support", "mailto:contact@codakis.cm")}
        """,
    )
    return plain, html


def render_simple_notification_email(*, subject: str, body: str) -> tuple[str, str]:
    plain = body
    html = _base_layout(
        preheader=subject,
        body_html=f"""
          {_heading(subject)}
          {_paragraph(body)}
        """,
    )
    return plain, html


def render_quiz_result_email(*, full_name: str, quiz_title: str, score: int, passed: bool, exams_url: str) -> tuple[str, str]:
    status = "réussi" if passed else "à reprendre"
    next_step = (
        "Ce quiz est validé. Passez à l'étape suivante de votre feuille de route."
        if passed
        else "Il faut au moins 70 % pour valider. Relancez le quiz : vos erreurs sont expliquées à la fin."
    )
    plain = "\n".join([
        f"Bonjour {full_name},",
        "",
        f"Quiz « {quiz_title} » : {score} % — {status}.",
        next_step,
        "",
        f"Continuer : {exams_url}",
        "",
        "— L'équipe CODAKIS",
    ])
    html = _base_layout(
        preheader=f"Quiz {status} — {score} %",
        body_html=f"""
          {_heading("Résultat du quiz")}
          {_paragraph(f"Bonjour <strong>{escape(full_name)}</strong>, votre quiz <strong>{escape(quiz_title)}</strong> est terminé.")}
          {_info_box(f"<strong>Score :</strong> {score} % · <strong>{escape(status)}</strong><br>{escape(next_step)}")}
          {_cta_button("Continuer le parcours", exams_url)}
        """,
    )
    return plain, html


def render_examen_result_email(*, full_name: str, exam_title: str, score: int, passed: bool, exams_url: str) -> tuple[str, str]:
    status = "réussi" if passed else "non validé"
    next_step = (
        "Examen blanc validé. Vous pouvez le refaire pour consolider, ou revenir au parcours."
        if passed
        else "Le nombre d'erreurs dépasse le maximum autorisé. Relisez les corrections, puis retentez l'examen."
    )
    plain = "\n".join([
        f"Bonjour {full_name},",
        "",
        f"Examen blanc « {exam_title} » : {score} % — {status}.",
        next_step,
        "",
        f"Examens : {exams_url}",
        "",
        "— L'équipe CODAKIS",
    ])
    html = _base_layout(
        preheader=f"Examen {status} — {score} %",
        body_html=f"""
          {_heading("Résultat de l'examen blanc")}
          {_paragraph(f"Bonjour <strong>{escape(full_name)}</strong>, votre examen <strong>{escape(exam_title)}</strong> est terminé.")}
          {_info_box(f"<strong>Score :</strong> {score} % · <strong>{escape(status)}</strong><br>{escape(next_step)}")}
          {_cta_button("Voir les examens", exams_url)}
        """,
    )
    return plain, html


def render_payment_confirmation_email(*, full_name: str, amount_fcfa: int, reference: str, receipt_number: str, purpose_label: str, dashboard_url: str) -> tuple[str, str]:
    plain = "\n".join([
        f"Bonjour {full_name},",
        "",
        f"Votre paiement de {amount_fcfa:,} FCFA a été confirmé.",
        f"Référence : {reference}",
        f"Reçu : {receipt_number}",
        f"Objet : {purpose_label}",
        "",
        f"Voir mon tableau de bord : {dashboard_url}",
        "",
        "— L'équipe CODAKIS",
    ])
    html = _base_layout(
        preheader="Paiement confirmé — CODAKIS",
        body_html=f"""
          {_heading("Paiement confirmé")}
          {_paragraph(f"Bonjour <strong>{escape(full_name)}</strong>, votre règlement a bien été reçu.")}
          {_meta_panel([
              ("Montant", f"{amount_fcfa:,} FCFA"),
              ("Référence", reference),
              ("Reçu", receipt_number),
              ("Objet", purpose_label),
          ])}
          {_cta_button("Voir mon tableau de bord", dashboard_url)}
        """,
    )
    return plain, html


def render_moniteur_invite_email(*, full_name: str, school_name: str, login_url: str, temp_password: str | None = None) -> tuple[str, str]:
    password_html = ""
    password_block = ""
    if temp_password:
        password_block = f"\nMot de passe temporaire : {temp_password}"
        password_html = _info_box(f"<strong>Mot de passe temporaire :</strong> {escape(temp_password)}")

    plain = "\n".join([
        f"Bonjour {full_name},",
        "",
        f"Vous avez été ajouté à l'équipe de l'auto-école \"{school_name}\" sur CODAKIS.",
        password_block,
        "",
        f"Connexion : {login_url}",
        "",
        "— L'équipe CODAKIS",
    ]).strip()

    html = _base_layout(
        preheader="Invitation moniteur — CODAKIS",
        body_html=f"""
          {_heading("Invitation moniteur")}
          {_paragraph(f"Bonjour <strong>{escape(full_name)}</strong>, votre compte moniteur a été créé pour <strong>{escape(school_name)}</strong>.")}
          {password_html}
          {_cta_button("Accéder à mon espace", login_url)}
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
    plain = "\n".join([
        f"Bonjour {full_name},",
        "",
        f"Leçon terminée : « {lesson_title} » ({theme_title}).",
        f"Progression du parcours : {progress_percent} %.",
        "Les trois premiers thèmes restent accessibles sans abonnement.",
        "Un badge est à télécharger dans Statistiques à chaque niveau atteint.",
        "",
        f"Continuer : {courses_url}",
        "",
        "— L'équipe CODAKIS",
    ])
    html = _base_layout(
        preheader=f"Leçon terminée — {progress_percent} % du parcours",
        body_html=f"""
          {_heading("Leçon terminée")}
          {_paragraph(f"Bonjour <strong>{escape(full_name)}</strong>, vous avez terminé <strong>{escape(lesson_title)}</strong> ({escape(theme_title)}).")}
          {_info_box(f"<strong>Progression :</strong> {progress_percent} %. Continuez la feuille de route : la prochaine étape est déjà débloquée si elle fait partie des modules gratuits.")}
          {_cta_button("Continuer le parcours", courses_url)}
        """,
    )
    return plain, html


def render_payment_failed_email(
    *,
    full_name: str,
    amount_fcfa: int,
    reference: str,
    reason: str,
    retry_url: str,
) -> tuple[str, str]:
    amount = f"{amount_fcfa:,} FCFA".replace(",", " ")
    plain = "\n".join([
        f"Bonjour {full_name},",
        "",
        f"Votre paiement de {amount} n'a pas abouti.",
        f"Référence : {reference}",
        f"Détail : {reason}",
        "",
        f"Réessayer : {retry_url}",
        "",
        "— L'équipe CODAKIS",
    ])
    html = _base_layout(
        preheader="Paiement non abouti — CODAKIS",
        body_html=f"""
          {_heading("Paiement non abouti")}
          {_paragraph(f"Bonjour <strong>{escape(full_name)}</strong>, le règlement n'a pas été confirmé. Aucun accès n'a été activé.")}
          {_meta_panel([
              ("Montant", amount),
              ("Référence", reference),
              ("Détail", reason),
          ])}
          {_cta_button("Réessayer le paiement", retry_url)}
        """,
    )
    return plain, html


def render_level_badge_email(*, full_name: str, level: int, points: int, badges_url: str) -> tuple[str, str]:
    plain = "\n".join([
        f"Bonjour {full_name},",
        "",
        f"Vous atteignez le niveau {level} ({points} points).",
        "Téléchargez votre badge depuis Statistiques. Il reste sur votre compte, même sans abonnement.",
        "",
        f"Mes badges : {badges_url}",
        "",
        "— L'équipe CODAKIS",
    ])
    html = _base_layout(
        preheader=f"Badge niveau {level} débloqué",
        body_html=f"""
          {_heading(f"Badge niveau {level}")}
          {_paragraph(f"Bonjour <strong>{escape(full_name)}</strong>, vous venez de passer un niveau. Ce badge est à vous, abonnement ou non.")}
          {_meta_panel([
              ("Niveau", str(level)),
              ("Points", str(points)),
          ])}
          {_cta_button("Télécharger mon badge", badges_url)}
        """,
    )
    return plain, html
