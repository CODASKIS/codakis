import httpx

from app.core.config import settings


class TtsError(Exception):
    def __init__(self, message: str, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


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


def resolve_voice_candidates(language: str | None, preferred_voice_id: str | None = None) -> list[str]:
    fallback = settings.elevenlabs_voice_id.strip() or "pNInz6obpgDQGcFmaJgB"
    voices: list[str] = []
    preferred = (preferred_voice_id or "").strip()
    for voice_id in (preferred, resolve_voice_id(language), fallback, "pNInz6obpgDQGcFmaJgB", "EXAVITQu4vr4xnSDxMaL"):
        cleaned = voice_id.strip()
        if cleaned and cleaned not in voices:
            voices.append(cleaned)
    return voices


def _extract_error_message(response: httpx.Response) -> str:
    try:
        payload = response.json()
        detail = payload.get("detail")
        if isinstance(detail, dict):
            return str(detail.get("message") or detail.get("code") or response.text)
        if isinstance(detail, str):
            return detail
    except ValueError:
        pass
    return response.text[:240] or "Impossible de générer l'audio"


def _request_tts(text: str, voice_id: str) -> bytes:
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": settings.elevenlabs_api_key.strip(),
    }
    payload = {
        "text": text,
        "model_id": settings.elevenlabs_model_id,
        "voice_settings": {"stability": 0.45, "similarity_boost": 0.75},
    }

    with httpx.Client(timeout=60.0) as client:
        response = client.post(url, headers=headers, json=payload)

    if response.status_code >= 400:
        raise TtsError(_extract_error_message(response), status_code=response.status_code)

    return response.content


def synthesize_speech(text: str, language: str | None = "fr", voice_id: str | None = None) -> bytes:
    cleaned = (text or "").strip()
    if not cleaned:
        raise TtsError("Texte vide")
    if len(cleaned) > 5000:
        cleaned = cleaned[:5000]

    api_key = settings.elevenlabs_api_key.strip()
    if not api_key:
        raise TtsError("Synthèse vocale non configurée (ELEVENLABS_API_KEY manquante)")

    last_error: TtsError | None = None
    for candidate in resolve_voice_candidates(language, voice_id):
        try:
            return _request_tts(cleaned, candidate)
        except httpx.HTTPError as exc:
            raise TtsError("Service de synthèse vocale indisponible") from exc
        except TtsError as exc:
            last_error = exc
            if exc.status_code in {402, 403, 404}:
                continue
            raise

    if last_error is not None:
        raise last_error
    raise TtsError("Impossible de générer l'audio")
