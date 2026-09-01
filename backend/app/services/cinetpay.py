"""Intégration CinetPay — sandbox (redirection checkout)."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger("codakis.cinetpay")

CHECKOUT_URL = "https://api-checkout.cinetpay.com/v2/payment"
CHECK_URL = "https://api-checkout.cinetpay.com/v2/payment/check"


def is_configured() -> bool:
    return bool(settings.cinetpay_api_key and settings.cinetpay_site_id)


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
        raise RuntimeError("CinetPay non configuré (CINETPAY_API_KEY et CINETPAY_SITE_ID requis)")

    payload = {
        "apikey": settings.cinetpay_api_key,
        "site_id": settings.cinetpay_site_id,
        "transaction_id": transaction_id,
        "amount": int(amount_fcfa),
        "currency": settings.cinetpay_currency,
        "description": description[:250],
        "notify_url": notify_url,
        "return_url": return_url,
        "customer_name": customer_name[:100],
        "customer_surname": customer_surname[:100],
        "customer_email": customer_email,
        "customer_phone_number": customer_phone,
        "channels": "ALL",
    }

    try:
        response = httpx.post(CHECKOUT_URL, json=payload, timeout=30.0)
        data = response.json()
    except Exception as exc:
        logger.exception("CinetPay checkout error")
        raise RuntimeError(f"CinetPay indisponible : {exc}") from exc

    if data.get("code") != "201":
        message = data.get("message") or data.get("description") or str(data)
        raise RuntimeError(f"CinetPay : {message}")

    payment_url = (data.get("data") or {}).get("payment_url")
    payment_token = (data.get("data") or {}).get("payment_token")
    if not payment_url:
        raise RuntimeError("CinetPay n'a pas renvoyé d'URL de paiement")

    return {"payment_url": payment_url, "payment_token": payment_token, "raw": data}


def verify_transaction(transaction_id: str) -> dict[str, Any]:
    if not is_configured():
        raise RuntimeError("CinetPay non configuré")

    payload = {
        "apikey": settings.cinetpay_api_key,
        "site_id": settings.cinetpay_site_id,
        "transaction_id": transaction_id,
    }
    response = httpx.post(CHECK_URL, json=payload, timeout=30.0)
    return response.json()
