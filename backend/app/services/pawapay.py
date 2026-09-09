"""
Intégration PawaPay v2 — Checkout (page hébergée avec redirection).

Flow :
  1. create_checkout(...)  → retourne { checkout_id, redirect_url }
  2. Le client est redirigé vers redirect_url pour payer via Mobile Money
  3. PawaPay envoie un callback POST à notre endpoint /payments/pawapay/callback
  4. Le callback contient { checkoutId, status: "COMPLETED"|"FAILED"|... }
  5. get_checkout_status(checkout_id) → vérification manuelle si besoin

Sandbox : https://api.sandbox.pawapay.io
Production : https://api.pawapay.io
"""

from __future__ import annotations

import logging
import uuid
from typing import Any
from urllib.parse import urlparse

import httpx

from app.core.config import settings

logger = logging.getLogger("codakis.pawapay")

SANDBOX_BASE = "https://api.sandbox.pawapay.io"
PROD_BASE = "https://api.pawapay.io"


def _base_url() -> str:
    return SANDBOX_BASE if settings.pawapay_sandbox else PROD_BASE


def is_configured() -> bool:
    """Retourne True si PAWAPAY_TOKEN est défini."""
    return bool(settings.pawapay_token.strip())


def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {settings.pawapay_token.strip()}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def _truncate(s: str, max_len: int) -> str:
    return s[:max_len] if len(s) > max_len else s


def is_public_return_url(return_url: str) -> bool:
    """Retourne True si l'URL de retour est publique et compatible avec PawaPay."""
    parsed = urlparse(return_url)
    host = (parsed.hostname or "").lower()
    return parsed.scheme == "https" and bool(parsed.netloc) and host not in {"localhost", "127.0.0.1", "::1"}


def _validate_return_url(return_url: str) -> str:
    """PawaPay requires a public HTTPS URL. localhost / HTTP URLs are rejected by the sandbox."""
    if not is_public_return_url(return_url):
        raise RuntimeError(
            "PawaPay returnUrl invalide : utilisez une URL HTTPS publique (et non localhost). "
            f"Valeur reçue : {return_url}"
        )
    return return_url


def create_checkout(
    *,
    checkout_id: str | None = None,
    amount_fcfa: int,
    currency: str = "XAF",
    country: str = "CMR",
    description: str = "Paiement CODAKIS",
    phone: str | None = None,
    return_url: str,
    callback_url: str | None = None,
    reason: str = "CODAKIS",
    language: str = "fr",
    client_reference_id: str | None = None,
) -> dict[str, Any]:
    """
    Crée un Checkout PawaPay v2 et retourne { checkout_id, redirect_url }.

    IMPORTANT: la sandbox PawaPay rejette actuellement les champs `reason` et
    `customerMessage` comme paramètres non supportés, même si la documentation
    les présente comme requis. Le payload réellement accepté par le provider est
    le plus minimal possible : checkoutId + returnUrl + returnMethod + amounts.
    """
    if not is_configured():
        raise RuntimeError(
            "PawaPay non configuré (PAWAPAY_TOKEN requis dans .env)"
        )

    # PawaPay rejects localhost / HTTP return URLs. Fail fast before sending the request
    # so the app can switch to the CinetPay fallback instead of producing a broken checkout.
    _validate_return_url(return_url)

    cid = checkout_id or str(uuid.uuid4())

    # Les champs `reason` / `customerMessage` / `defaultLanguage` / `callbackUrl`
    # et même `payer.type` sont rejetés par la sandbox PawaPay actuelle comme
    # "unsupported parameter" / "invalid parameter".
    # On envoie uniquement le payload minimal validé par l’API live.
    payload: dict[str, Any] = {
        "checkoutId": cid,
        "returnUrl": return_url,
        "returnMethod": "COUNTDOWN",
        "amounts": [
            {
                "amount": str(amount_fcfa),
                "currency": currency,
                "country": country,
            }
        ],
    }

    logger.info("PawaPay create_checkout payload for %s: %s", cid, payload)

    # NOTE: Some live PawaPay sandbox responses reject `payer`, `reason`,
    # `customerMessage`, `defaultLanguage`, `expiresAfter`, and callback-related
    # fields even when the docs describe them as valid. Keep the request minimal.
    # The phone can be passed separately in the app flow, but it must not be
    # included inside the `payer` object for the live sandbox.

    try:
        resp = httpx.post(
            f"{_base_url()}/v2/checkouts",
            json=payload,
            headers=_headers(),
            timeout=30.0,
        )
        data = resp.json()
    except Exception as exc:
        logger.exception("PawaPay checkout request failed")
        raise RuntimeError(f"PawaPay indisponible : {exc}") from exc

    status = data.get("status")
    if status == "REJECTED":
        reason_fail = (data.get("failureReason") or {})
        msg = reason_fail.get("failureMessage") or str(data)
        raise RuntimeError(f"PawaPay checkout rejeté : {msg}")

    redirect_url = data.get("redirectUrl")
    if not redirect_url:
        raise RuntimeError(f"PawaPay : redirectUrl manquant dans la réponse — {data}")

    logger.info(
        "PawaPay checkout créé : checkoutId=%s status=%s redirectUrl=%s",
        cid,
        status,
        redirect_url,
    )
    return {
        "checkout_id": cid,
        "redirect_url": redirect_url,
        "status": status,
        "raw": data,
    }


def get_checkout_status(checkout_id: str) -> dict[str, Any]:
    """
    Récupère le statut courant d'un Checkout.

    Statuts finaux possibles : COMPLETED, FAILED, EXPIRED, CANCELLED
    Statuts transitoires : WAITING_PAYMENT, PROCESSING
    """
    if not is_configured():
        raise RuntimeError("PawaPay non configuré")

    try:
        resp = httpx.get(
            f"{_base_url()}/v2/checkouts/{checkout_id}",
            headers=_headers(),
            timeout=30.0,
        )
        return resp.json()
    except Exception as exc:
        logger.exception("PawaPay get_checkout_status failed for %s", checkout_id)
        raise RuntimeError(f"PawaPay indisponible : {exc}") from exc


def _normalize_msisdn(phone: str) -> str:
    """Normalise un numéro en format international +237XXXXXXXXX."""
    import re

    digits = re.sub(r"\D", "", phone.strip())
    if phone.strip().startswith("+"):
        return phone.strip()
    if digits.startswith("237") and len(digits) == 12:
        return f"+{digits}"
    if len(digits) == 9 and digits.startswith("6"):
        return f"+237{digits}"
    return f"+{digits}" if digits else "+237670000000"
