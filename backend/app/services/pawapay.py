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


def create_checkout(
    *,
    checkout_id: str | None = None,
    amount_fcfa: int,
    currency: str = "XAF",
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

    Paramètres :
    - checkout_id   : UUIDv4 généré par nos soins (idempotence)
    - amount_fcfa   : montant en XAF (entier)
    - currency      : ISO 4217 (XAF pour CEMAC)
    - description   : 4–22 caractères, alphanumérique + espace (customerMessage)
    - phone         : numéro Mobile Money (optionnel, pré-remplit le formulaire)
    - return_url    : URL de retour après paiement
    - callback_url  : URL de callback asynchrone (optionnel, peut être configuré dans le dashboard)
    - reason        : label visible par le client (4–22 chars)
    - language      : "fr" ou "en"
    """
    if not is_configured():
        raise RuntimeError(
            "PawaPay non configuré (PAWAPAY_TOKEN requis dans .env)"
        )

    cid = checkout_id or str(uuid.uuid4())

    # customerMessage : 4–22 chars, alphanumérique + espaces uniquement
    safe_desc = "".join(c for c in description if c.isalnum() or c == " ")
    customer_message = _truncate(safe_desc.strip() or "CODAKIS paiement", 22)
    if len(customer_message) < 4:
        customer_message = "CODAKIS"

    # reason : même contrainte
    safe_reason = "".join(c for c in reason if c.isalnum() or c == " ")
    reason_text = _truncate(safe_reason.strip() or "CODAKIS", 22)
    if len(reason_text) < 4:
        reason_text = "CODAKIS"

    payload: dict[str, Any] = {
        "checkoutId": cid,
        "returnUrl": return_url,
        "returnMethod": "COUNTDOWN",
        "amounts": [
            {
                "amount": str(amount_fcfa),
                "currency": currency,
            }
        ],
        "reason": [
            {"value": reason_text, "language": language},
        ],
        "customerMessage": customer_message,
        "defaultLanguage": language,
        "expiresAfter": 30,
    }

    if client_reference_id:
        payload["clientReferenceId"] = client_reference_id

    # Pré-remplir le téléphone si fourni
    if phone:
        payload["payer"] = {
            "type": "MSISDN",
            "accountDetails": {
                "phoneNumber": _normalize_msisdn(phone),
            },
            "allowCustomerToOverride": True,
        }

    # URL de callback si fournie (sinon configurée dans le dashboard PawaPay)
    if callback_url:
        payload["callbackUrl"] = callback_url

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
