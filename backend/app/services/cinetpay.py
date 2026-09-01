"""Intégration CinetPay — API v1 (OAuth + redirection checkout)."""

from __future__ import annotations

import logging
import re
import time
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger("codakis.cinetpay")

_TOKEN_CACHE: dict[str, Any] = {"token": None, "expires_at": 0.0}


def _base_url() -> str:
    key = settings.cinetpay_api_key.strip()
    if key.startswith("sk_live"):
        return "https://api.cinetpay.co"
    return "https://api.cinetpay.net"


def is_configured() -> bool:
    return bool(settings.cinetpay_api_key.strip() and settings.cinetpay_api_password.strip())


def _international_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone.strip())
    if phone.strip().startswith("+"):
        return phone.strip()
    if digits.startswith("237"):
        return f"+{digits}"
    if len(digits) == 9 and digits.startswith("6"):
        return f"+237{digits}"
    return f"+{digits}" if digits else "+237670000000"


def _truncate_url(url: str, limit: int = 120) -> str:
    return url if len(url) <= limit else url[:limit]


def _oauth_login() -> str:
    now = time.time()
    cached = _TOKEN_CACHE.get("token")
    if cached and now < float(_TOKEN_CACHE.get("expires_at", 0)):
        return str(cached)

    response = httpx.post(
        f"{_base_url()}/v1/oauth/login",
        json={
            "api_key": settings.cinetpay_api_key.strip(),
            "api_password": settings.cinetpay_api_password.strip(),
        },
        timeout=30.0,
    )
    data = response.json()
    token = data.get("access_token")
    if not token:
        description = data.get("description") or data.get("message") or str(data)
        if data.get("code") == 2011 or "whitelist" in description.lower():
            raise RuntimeError(
                "CinetPay : IP serveur non autorisée. Ajoutez l'IP publique du serveur "
                "dans le tableau de bord CinetPay (Paramètres → IP autorisées)."
            )
        raise RuntimeError(f"CinetPay authentification : {description}")

    ttl = int(data.get("expires_in") or 82800)
    _TOKEN_CACHE["token"] = token
    _TOKEN_CACHE["expires_at"] = now + max(ttl - 120, 300)
    return str(token)


def create_checkout(
    *,
    transaction_id: str,
    amount_fcfa: int,
    description: str,
    customer_name: str,
    customer_surname: str,
    customer_email: str,
    customer_phone: str,
    notify_url: str,
    return_url: str,
) -> dict[str, Any]:
    if not is_configured():
        raise RuntimeError(
            "CinetPay non configuré (CINETPAY_API_KEY et CINETPAY_API_PASSWORD requis dans .env)"
        )

    token = _oauth_login()
    country = settings.cinetpay_country_code.strip().upper() or "CM"
    merchant_id = re.sub(r"[^A-Za-z0-9_-]", "", transaction_id)[:30]

    payload = {
        "currency": settings.cinetpay_currency,
        "merchant_transaction_id": merchant_id,
        "amount": int(amount_fcfa),
        "lang": "FR",
        "designation": description[:250],
        "client_email": customer_email,
        "client_first_name": (customer_name or "Client")[:100],
        "client_last_name": (customer_surname or "CODAKIS")[:100],
        "success_url": _truncate_url(return_url),
        "failed_url": _truncate_url(return_url),
        "notify_url": _truncate_url(notify_url),
        "channel": "QRCODE",
        "client_phone_number": _international_phone(customer_phone),
    }

    try:
        response = httpx.post(
            f"{_base_url()}/v1/payment",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
            timeout=30.0,
        )
        data = response.json()
    except Exception as exc:
        logger.exception("CinetPay checkout error")
        raise RuntimeError(f"CinetPay indisponible : {exc}") from exc

    payment_url = data.get("payment_url")
    payment_token = data.get("payment_token")
    code = data.get("code")
    status = data.get("status")
    if not payment_url:
        description = data.get("description") or data.get("message") or str(data)
        raise RuntimeError(f"CinetPay ({code}/{status}) : {description}")

    return {
        "payment_url": payment_url,
        "payment_token": payment_token,
        "raw": data,
    }


def verify_transaction(transaction_id: str) -> dict[str, Any]:
    if not is_configured():
        raise RuntimeError("CinetPay non configuré")

    token = _oauth_login()
    encoded = httpx.URL(transaction_id).raw_path.decode().lstrip("/")
    response = httpx.get(
        f"{_base_url()}/v1/payment/{encoded}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=30.0,
    )
    return response.json()
