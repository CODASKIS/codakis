"""HTML e-mail layouts (inline CSS for client compatibility)."""

from html import escape

BRAND_ORANGE = "#FF6B2C"
BRAND_TEAL = "#0D9488"
BG_GRAY = "#F4F4F4"
TEXT_DARK = "#333333"
TEXT_MUTED = "#666666"


def _base_layout(*, preheader: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CODAKIS</title>
</head>
<body style="margin:0;padding:0;background-color:{BG_GRAY};font-family:Arial,Helvetica,sans-serif;color:{TEXT_DARK};">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">{escape(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:{BG_GRAY};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:24px 32px 16px;border-bottom:1px solid #EEEEEE;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="font-size:26px;font-weight:700;color:{BRAND_ORANGE};letter-spacing:-0.5px;">CODAKIS</span>
                  </td>
                  <td align="right" style="vertical-align:middle;font-size:11px;font-weight:600;letter-spacing:0.08em;color:{BRAND_TEAL};text-transform:uppercase;">
                    VOTRE PERMIS,<br><span style="color:{BRAND_ORANGE};">NOTRE MISSION</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-size:15px;line-height:1.65;color:{TEXT_DARK};">
              {body_html}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;font-size:12px;line-height:1.5;color:{TEXT_MUTED};">
              © CODAKIS — Plateforme permis de conduire CEMAC<br>
              <a href="mailto:contact@codakis.cm" style="color:{BRAND_TEAL};text-decoration:none;">contact@codakis.cm</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _cta_button(label: str, url: str) -> str:
    safe_label = escape(label)
    safe_url = escape(url)
    return f"""
      <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto;">
        <tr>
          <td align="center" style="border-radius:6px;background-color:{BRAND_ORANGE};">
            <a href="{safe_url}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px;">
              {safe_label}
            </a>
          </td>
        </tr>
      </table>
    """


def render_moniteur_invite_email(
    *,
    full_name: str,
    school_name: str,
    login_url: str,
    temp_password: str | None = None,
) -> tuple[str, str]:
    """Returns (plain_text, html)."""
    greeting = escape(full_name)
    school = escape(school_name)
    password_block = ""
    password_html = ""
    if temp_password:
        password_block = f"\n\nMot de passe temporaire : {temp_password}\nPensez à le modifier après votre première connexion."
        password_html = f"""
          <p style="margin:16px 0;padding:14px 16px;background:#FFF7ED;border-left:4px solid {BRAND_ORANGE};font-size:14px;">
            <strong>Mot de passe temporaire :</strong> {escape(temp_password)}<br>
            Pensez à le modifier après votre première connexion.
          </p>
        """

    plain = "\n".join(
        [
            f"Bonjour {full_name},",
            "",
            f"L'auto-école « {school_name} » vous invite à rejoindre CODAKIS en tant que moniteur.",
            "Vous pourrez gérer vos élèves, consulter votre planning et suivre leur progression.",
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
          <p style="margin:0 0 16px;"><strong>Bonjour {greeting},</strong></p>
          <p style="margin:0 0 16px;">
            L'auto-école <strong>« {school} »</strong> vous invite à rejoindre <strong>CODAKIS</strong> en tant que moniteur.
            Vous pourrez gérer vos élèves, consulter votre planning et suivre leur progression sur la plateforme.
          </p>
          {password_html}
          {_cta_button("Rejoindre CODAKIS", login_url)}
          <p style="margin:24px 0 0;font-size:14px;color:{TEXT_MUTED};">
            Merci !<br>
            <strong>L'équipe CODAKIS</strong>
          </p>
        """,
    )
    return plain, html


def render_welcome_email(*, full_name: str, login_url: str, temp_password: str | None = None) -> tuple[str, str]:
    password_block = ""
    password_html = ""
    if temp_password:
        password_block = f"\n\nMot de passe temporaire : {temp_password}"
        password_html = f"""
          <p style="margin:16px 0;padding:14px 16px;background:#FFF7ED;border-left:4px solid {BRAND_ORANGE};font-size:14px;">
            <strong>Mot de passe temporaire :</strong> {escape(temp_password)}
          </p>
        """

    plain = "\n".join(
        [
            f"Bonjour {full_name},",
            "",
            "Votre compte CODAKIS a été créé.",
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
          <p style="margin:0 0 16px;"><strong>Bonjour {escape(full_name)},</strong></p>
          <p style="margin:0 0 16px;">Votre compte <strong>CODAKIS</strong> a été créé. Connectez-vous pour commencer.</p>
          {password_html}
          {_cta_button("Se connecter", login_url)}
          <p style="margin:24px 0 0;font-size:14px;color:{TEXT_MUTED};">
            Merci !<br><strong>L'équipe CODAKIS</strong>
          </p>
        """,
    )
    return plain, html


def render_school_validated_email(*, school_name: str, login_url: str) -> tuple[str, str]:
    school = escape(school_name)
    plain = "\n".join(
        [
            "Bonjour,",
            "",
            f"Votre auto-école « {school_name} » a été validée par l'équipe CODAKIS.",
            "Vous pouvez maintenant inviter vos moniteurs et gérer votre établissement.",
            "",
            f"Connexion : {login_url}",
            "",
            "— L'équipe CODAKIS",
        ]
    )
    html = _base_layout(
        preheader=f"Auto-école validée — {school_name}",
        body_html=f"""
          <p style="margin:0 0 16px;"><strong>Bonjour,</strong></p>
          <p style="margin:0 0 16px;">
            Votre auto-école <strong>« {school} »</strong> a été validée par l'équipe CODAKIS.
            Vous pouvez maintenant inviter vos moniteurs et gérer votre établissement.
          </p>
          {_cta_button("Accéder à mon espace", login_url)}
          <p style="margin:24px 0 0;font-size:14px;color:{TEXT_MUTED};">
            Merci !<br><strong>L'équipe CODAKIS</strong>
          </p>
        """,
    )
    return plain, html


def render_school_rejected_email(*, school_name: str, reason: str) -> tuple[str, str]:
    school = escape(school_name)
    reason_html = escape(reason.strip()).replace("\n", "<br>")
    plain = "\n".join(
        [
            "Bonjour,",
            "",
            f"Votre demande d'inscription pour l'auto-école « {school_name} » n'a pas été approuvée.",
            "",
            "Motif :",
            reason.strip(),
            "",
            "Pour toute question : contact@codakis.cm",
            "",
            "— L'équipe CODAKIS",
        ]
    )
    html = _base_layout(
        preheader=f"Inscription non approuvée — {school_name}",
        body_html=f"""
          <p style="margin:0 0 16px;"><strong>Bonjour,</strong></p>
          <p style="margin:0 0 16px;">
            Votre demande d'inscription pour l'auto-école <strong>« {school} »</strong> n'a pas été approuvée par l'équipe CODAKIS.
          </p>
          <p style="margin:0 0 8px;font-weight:600;">Motif :</p>
          <p style="margin:0 0 16px;padding:14px 16px;background:#FEF2F2;border-left:4px solid #DC2626;font-size:14px;">{reason_html}</p>
          <p style="margin:0;font-size:14px;color:{TEXT_MUTED};">
            Pour toute question, contactez <a href="mailto:contact@codakis.cm" style="color:{BRAND_TEAL};">contact@codakis.cm</a>.
          </p>
        """,
    )
    return plain, html


def render_simple_notification_email(*, subject: str, body: str) -> tuple[str, str]:
    plain = "\n".join(["Bonjour,", "", body, "", "— L'équipe CODAKIS"])
    html = _base_layout(
        preheader=subject,
        body_html=f"""
          <p style="margin:0 0 16px;"><strong>{escape(subject)}</strong></p>
          <p style="margin:0 0 16px;">{escape(body)}</p>
        """,
    )
    return plain, html
    plain = "\n".join(
        [
            "Bonjour,",
            "",
            f"Votre code de vérification CODAKIS : {otp}",
            f"Ce code expire dans {expire_minutes} minutes.",
            "",
            "— L'équipe CODAKIS",
        ]
    )
    html = _base_layout(
        preheader="Code de vérification CODAKIS",
        body_html=f"""
          <p style="margin:0 0 16px;"><strong>Bonjour,</strong></p>
          <p style="margin:0 0 16px;">Utilisez le code ci-dessous pour réinitialiser votre mot de passe :</p>
          <p style="margin:0 0 16px;font-size:28px;font-weight:700;letter-spacing:0.2em;color:{BRAND_ORANGE};">{escape(otp)}</p>
          <p style="margin:0;font-size:14px;color:{TEXT_MUTED};">Ce code expire dans {expire_minutes} minutes.</p>
        """,
    )
    return plain, html
