import httpx

from app.core.config import settings


class TtsError(Exception):
    pass


def normalize_language(language: str | None) -> str:
    if not language:
        return "fr"
    code = language.strip().lower().split("-")[0]
    return "en" if code.startswith("en") else "fr"


def resolve_voice_id(language: str | None) -> str:
    lang = normalize_language(language)
    if lang == "en":
        voice = settings.elevenlabs_voice_id_en.strip() or settings.elevenlabs_voice_id.strip()
    else:
        voice = settings.elevenlabs_voice_id_fr.strip() or settings.elevenlabs_voice_id.strip()
    return voice or "pNInz6obpgDQGcFmaJgB"


def synthesize_speech(text: str, language: str | None = "fr") -> bytes:
    cleaned = (text or "").strip()
    if not cleaned:
        raise TtsError("Texte vide")
    if len(cleaned) > 5000:
        cleaned = cleaned[:5000]

    api_key = settings.elevenlabs_api_key.strip()
    if not api_key:
        raise TtsError("Synthèse vocale non configurée (ELEVENLABS_API_KEY manquante)")

    voice_id = resolve_voice_id(language)
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key,
    }
    payload = {
        "text": cleaned,
        "model_id": settings.elevenlabs_model_id,
        "voice_settings": {"stability": 0.45, "similarity_boost": 0.75},
    }

    try:
        with httpx.Client(timeout=60.0) as client:
            response = client.post(url, headers=headers, json=payload)
    except httpx.HTTPError as exc:
        raise TtsError("Service de synthèse vocale indisponible") from exc

    if response.status_code >= 400:
        raise TtsError("Impossible de générer l'audio")

    return response.content
