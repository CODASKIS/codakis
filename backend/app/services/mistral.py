"""Assistant pédagogique CODAKIS via Mistral AI."""

from __future__ import annotations

import httpx

from app.core.config import settings

MISTRAL_CHAT_URL = "https://api.mistral.ai/v1/chat/completions"

SYSTEM_PROMPT_FR = (
    "Tu es l'assistant CODAKIS pour l'apprentissage du code de la route (CEMAC / Cameroun). "
    "Réponds en français, de façon claire et pédagogique, en 2 à 5 phrases sauf demande contraire. "
    "Aide l'élève à comprendre les règles, panneaux et situations de conduite. "
    "Pendant un quiz ou un examen, ne donne pas la lettre de réponse : propose des indices et rappels de règles."
)

SYSTEM_PROMPT_EN = (
    "You are the CODAKIS assistant for driving theory (CEMAC / Cameroon). "
    "Answer clearly in English in 2–5 sentences unless asked otherwise. "
    "During a quiz or exam, do not reveal the answer letter — give hints and rule reminders."
)


class MistralError(Exception):
    def __init__(self, message: str, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


def is_configured() -> bool:
    return bool(settings.mistral_api_key.strip())


def _system_prompt(language: str | None) -> str:
    code = (language or "fr").strip().lower().split("-")[0]
    return SYSTEM_PROMPT_EN if code.startswith("en") else SYSTEM_PROMPT_FR


def chat_tutor(*, message: str, context: str | None = None, language: str | None = "fr") -> str:
    api_key = settings.mistral_api_key.strip()
    if not api_key:
        raise MistralError("Assistant IA non configuré (MISTRAL_API_KEY manquante)")

    cleaned = (message or "").strip()
    if not cleaned:
        raise MistralError("Message vide")
    if len(cleaned) > 2000:
        cleaned = cleaned[:2000]

    user_content = cleaned
    if context and context.strip():
        user_content = f"Contexte cours :\n{context.strip()[:4000]}\n\nQuestion élève :\n{cleaned}"

    payload = {
        "model": settings.mistral_model,
        "messages": [
            {"role": "system", "content": _system_prompt(language)},
            {"role": "user", "content": user_content},
        ],
        "temperature": 0.4,
        "max_tokens": 600,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        response = httpx.post(MISTRAL_CHAT_URL, headers=headers, json=payload, timeout=45.0)
    except httpx.HTTPError as exc:
        raise MistralError("Service Mistral indisponible") from exc

    if response.status_code >= 400:
        detail = response.text[:240] or "Erreur Mistral"
        try:
            body = response.json()
            detail = body.get("message") or body.get("detail") or detail
        except ValueError:
            pass
        raise MistralError(str(detail), status_code=response.status_code)

    data = response.json()
    choices = data.get("choices") or []
    if not choices:
        raise MistralError("Réponse vide de Mistral")
    content = (choices[0].get("message") or {}).get("content") or ""
    reply = content.strip()
    if not reply:
        raise MistralError("Réponse vide de Mistral")
    return reply
